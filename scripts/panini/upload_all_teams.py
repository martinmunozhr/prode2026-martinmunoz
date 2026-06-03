"""
Sube todos los stickers a Supabase Storage e inserta jugadores en la DB.
Lee los manifests generados por extract_all_teams.py.

Uso:
    python upload_all_teams.py --key <SERVICE_ROLE_KEY>
    python upload_all_teams.py --key <KEY> --team por     # solo Portugal
    python upload_all_teams.py --key <KEY> --skip-done    # salta teams ya en DB
"""
import os, sys, json, argparse, requests, unicodedata, re
from pathlib import Path

SUPABASE_URL = "https://jcqxskdfpjicptnidzdt.supabase.co"
CROPS_DIR    = Path(__file__).parent / "crops"
BUCKET       = "stickers"

def slugify(s):
    s = unicodedata.normalize("NFD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9_.\-]", "_", s.lower())

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--key",       required=True, help="Supabase service_role key")
    parser.add_argument("--team",      help="Solo este team_id")
    parser.add_argument("--skip-done", action="store_true", default=True)
    parser.add_argument("--no-skip",   action="store_true")
    return parser.parse_args()

def upload_image(key, local_path, storage_path):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
    }
    with open(local_path, "rb") as f:
        r = requests.put(url, headers=headers, data=f, timeout=30)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Upload {storage_path} failed {r.status_code}: {r.text[:200]}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"

_POS_MAP = {"MED": "MID", "POR": "GK", "DEL": "FWD", "GK": "GK", "DEF": "DEF", "MID": "MID", "FWD": "FWD"}

def _normalize_pos(pos):
    return _POS_MAP.get((pos or "").upper(), "MID")

def upsert_player(key, player):
    url = f"{SUPABASE_URL}/rest/v1/players"
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    payload = {
        "team_id":       player["team_id"],
        "name":          player["name"],
        "position":      _normalize_pos(player.get("position")),
        "jersey_number": player.get("jersey_number"),
        "is_captain":    player.get("is_captain", False),
        "image_url":     player["image_url"],
    }
    r = requests.post(url, headers=headers, json=payload, timeout=15)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Insert {player['name']} failed {r.status_code}: {r.text[:200]}")

def get_existing_teams(key):
    """Retorna set de team_ids que ya tienen jugadores en la DB."""
    url = f"{SUPABASE_URL}/rest/v1/players?select=team_id&limit=2000"
    headers = {"Authorization": f"Bearer {key}", "apikey": key}
    r = requests.get(url, headers=headers, timeout=15)
    if r.status_code != 200:
        return set()
    rows = r.json()
    return {row["team_id"] for row in rows}

def assign_rarities(key):
    """Llama a auto_assign_rarities() en Supabase para asignar rarezas a todos los equipos."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/auto_assign_rarities"
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": "application/json",
    }
    r = requests.post(url, headers=headers, json={}, timeout=30)
    if r.status_code not in (200, 204):
        print(f"  [!] auto_assign_rarities: {r.status_code} {r.text[:200]}")
    else:
        print("  auto_assign_rarities() ejecutado.")

def process_team(key, team_id):
    team_dir = CROPS_DIR / team_id

    # Prioridad: manifest_final.json (manual) > manifest_clean.json (auto-limpio) > manifest.json (raw)
    for candidate in ["manifest_final.json", "manifest_clean.json", "manifest.json"]:
        manifest_path = team_dir / candidate
        if manifest_path.exists():
            break
    if not manifest_path.exists():
        print(f"  [{team_id}] Sin manifest, saltando. (Ejecutar extract_all_teams.py primero)")
        return 0

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    print(f"  [{team_id}] {len(manifest)} jugadores desde {manifest_path.name}")

    ok = 0
    for p in manifest:
        local = team_dir / p["file"]
        if not local.exists():
            print(f"    [!] Imagen no encontrada: {local}")
            continue

        storage_path = f"{team_id}/{slugify(p['file'])}"
        try:
            image_url = upload_image(key, local, storage_path)
            p["image_url"] = image_url
            upsert_player(key, p)
            print(f"    [OK] {p['name'][:25]:25s}  {p.get('position','')}")
            ok += 1
        except Exception as e:
            print(f"    [ERR] {p['name']}: {e}")

    return ok

def main():
    args = get_args()
    key  = args.key
    skip = not args.no_skip

    if args.team:
        teams = [args.team]
    else:
        teams = [d.name for d in CROPS_DIR.iterdir() if d.is_dir() and d.name != "arg"]
        teams.sort()

    if skip:
        existing = get_existing_teams(key)
        print(f"Teams ya en DB: {sorted(existing)}")
    else:
        existing = set()

    total_ok = 0
    for team_id in teams:
        if skip and team_id in existing:
            print(f"[{team_id}] Ya en DB, saltando.")
            continue
        print(f"\nSubiendo {team_id}...")
        ok = process_team(key, team_id)
        total_ok += ok

    print(f"\n=== Upload completo: {total_ok} jugadores ===")
    print("Asignando rarezas...")
    assign_rarities(key)
    print("Listo.")

if __name__ == "__main__":
    main()
