"""
Linkea las figuritas (crops de panini) a los jugadores OFICIALES ya cargados en la DB.

A diferencia de upload_all_teams.py (que insertaba/skippeaba), este script:
  - matchea cada entrada del manifest contra el jugador oficial existente (por nombre, dentro del equipo),
  - sube el crop a Storage (bucket 'stickers'),
  - hace UPDATE players.image_url SOLO del jugador matcheado (no inserta, no borra),
  - NO llama auto_assign_rarities (preserva la rareza por jerarquía).

Uso:
    python link_figuritas.py                 # DRY-RUN: solo reporta cobertura (read-only, publishable key)
    python link_figuritas.py --key <SERVICE_ROLE_KEY>          # sube + linkea de verdad
    python link_figuritas.py --key <KEY> --team arg            # un solo equipo
"""
import sys, json, argparse, requests, unicodedata, re
from pathlib import Path

SUPABASE_URL = "https://jcqxskdfpjicptnidzdt.supabase.co"
PUBLISHABLE  = "sb_publishable_Vhh41ol_fmUE1bPqz0bmYQ_mntKQ_0t"
CROPS_DIR    = Path(__file__).parent / "crops"
BUCKET       = "stickers"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode("ascii").lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9_.\-]", "_", s.lower())


def fetch_team_players(read_key, team_id):
    """[ {id, name}, ... ] del equipo (evita el cap de 1000 filas trayendo por equipo)."""
    url = f"{SUPABASE_URL}/rest/v1/players?select=id,name&team_id=eq.{team_id}"
    r = requests.get(url, headers={"apikey": read_key, "Authorization": f"Bearer {read_key}"}, timeout=20)
    r.raise_for_status()
    return r.json()


def match_player(manifest_name, players):
    """Match exacto normalizado; fallback: apellido + inicial nombre, si es único."""
    n = norm(manifest_name)
    for p in players:
        if norm(p["name"]) == n:
            return p, "exacto"
    toks = n.split()
    if len(toks) >= 2:
        first_initial, last = toks[0][0], toks[-1]
        cands = [p for p in players if norm(p["name"]).split()[-1] == last
                 and norm(p["name"]).split()[0][0] == first_initial]
        if len(cands) == 1:
            return cands[0], "apellido+inicial"
    # Subconjunto de tokens (ej: "Pedri" ⊂ "Pedri González"), solo si es único.
    tset = set(toks)
    if tset:
        cands = [p for p in players
                 if tset.issubset(set(norm(p["name"]).split()))
                 or set(norm(p["name"]).split()).issubset(tset)]
        if len(cands) == 1:
            return cands[0], "subset"
    return None, None


def upload_image(key, local_path, storage_path):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "image/jpeg", "x-upsert": "true"}
    with open(local_path, "rb") as f:
        r = requests.put(url, headers=headers, data=f, timeout=30)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"upload {storage_path} {r.status_code}: {r.text[:150]}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"


def set_image_url(key, player_id, image_url):
    url = f"{SUPABASE_URL}/rest/v1/players?id=eq.{player_id}"
    headers = {"apikey": key, "Authorization": f"Bearer {key}",
               "Content-Type": "application/json", "Prefer": "return=minimal"}
    r = requests.patch(url, headers=headers, json={"image_url": image_url}, timeout=15)
    if r.status_code not in (200, 204):
        raise RuntimeError(f"patch {player_id} {r.status_code}: {r.text[:150]}")


def best_manifest(team_dir):
    for c in ("manifest_final.json", "manifest_clean.json", "manifest.json"):
        if (team_dir / c).exists():
            return team_dir / c
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", help="service_role key (sin esto = dry-run read-only)")
    ap.add_argument("--team")
    args = ap.parse_args()
    dry = not args.key
    read_key = args.key or PUBLISHABLE

    teams = [args.team] if args.team else sorted(d.name for d in CROPS_DIR.iterdir() if d.is_dir())

    tot_match = tot_unmatch = tot_linked = 0
    print(f"{'TEAM':6} {'manifest':>8} {'match':>6} {'sin_match':>9}   no-matcheados")
    print("-" * 80)
    for t in teams:
        mpath = best_manifest(CROPS_DIR / t)
        if not mpath:
            continue
        manifest = json.loads(mpath.read_text(encoding="utf-8"))
        players = fetch_team_players(read_key, t)
        m = u = 0
        misses = []
        for e in manifest:
            p, how = match_player(e["name"], players)
            if not p:
                u += 1; misses.append(e["name"]); continue
            m += 1
            if not dry:
                local = CROPS_DIR / t / e["file"]
                if not local.exists():
                    print(f"    [!] falta crop {local.name}"); continue
                try:
                    iu = upload_image(args.key, local, f"{t}/{slugify(e['file'])}")
                    set_image_url(args.key, p["id"], iu)
                    tot_linked += 1
                except Exception as ex:
                    print(f"    [ERR] {e['name']}: {ex}")
        tot_match += m; tot_unmatch += u
        print(f"{t:6} {len(manifest):>8} {m:>6} {u:>9}   {', '.join(misses) if misses else '-'}")

    print("-" * 80)
    print(f"TOTAL  matcheados={tot_match}  sin_match={tot_unmatch}" + ("" if dry else f"  linkeados={tot_linked}"))
    if dry:
        print("\n[DRY-RUN] No se subió ni modificó nada. Corré con --key <SERVICE_ROLE_KEY> para aplicar.")


if __name__ == "__main__":
    main()
