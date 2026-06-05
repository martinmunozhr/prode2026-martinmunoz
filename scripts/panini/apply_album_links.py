"""
Sube celdas recortadas (album_crops/<team>/) y setea players.image_url, usando un
mapa EXPLICITO celda->nombre oficial revisado a mano (album_crops/<team>/_map.json).
Match exacto contra el jugador oficial del equipo (sin fuzzy: el nombre del mapa ya
es el oficial). No inserta, no borra, no toca rareza.

Uso: python apply_album_links.py --key <SERVICE_ROLE_KEY> --team sen
     python apply_album_links.py --team sen        # dry-run (read-only)
"""
import os, sys, json, argparse, requests, unicodedata, re
from pathlib import Path

# Configurar via entorno: export SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
PUBLISHABLE = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
CROPS = Path(__file__).parent / "album_crops"
BUCKET = "stickers"


def norm(s):
    s = unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", s)).strip()


def slugify(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9_.\-]", "_", s.lower())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--key")
    ap.add_argument("--team", required=True)
    args = ap.parse_args()
    dry = not args.key
    read_key = args.key or PUBLISHABLE
    t = args.team

    mp = json.loads((CROPS / t / "_map.json").read_text(encoding="utf-8"))
    players = requests.get(
        f"{SUPABASE_URL}/rest/v1/players?select=id,name&team_id=eq.{t}",
        headers={"apikey": read_key, "Authorization": f"Bearer {read_key}"}, timeout=20).json()
    by_norm = {norm(p["name"]): p for p in players}

    ok = miss = 0
    for cell, name in mp.items():
        p = by_norm.get(norm(name))
        if not p:
            print(f"  [SIN MATCH OFICIAL] {name} ({cell})"); miss += 1; continue
        local = CROPS / t / cell
        if not local.exists():
            print(f"  [FALTA CROP] {cell}"); miss += 1; continue
        if dry:
            print(f"  [OK-dry] {cell} -> {p['name']}"); ok += 1; continue
        sp = f"{t}/{slugify(name)}.jpg"
        r = requests.put(f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{sp}",
                         headers={"Authorization": f"Bearer {args.key}", "Content-Type": "image/jpeg", "x-upsert": "true"},
                         data=local.read_bytes(), timeout=30)
        if r.status_code not in (200, 201):
            print(f"  [ERR upload] {cell}: {r.status_code}"); miss += 1; continue
        iu = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{sp}"
        r = requests.patch(f"{SUPABASE_URL}/rest/v1/players?id=eq.{p['id']}",
                           headers={"apikey": args.key, "Authorization": f"Bearer {args.key}",
                                    "Content-Type": "application/json", "Prefer": "return=minimal"},
                           json={"image_url": iu}, timeout=15)
        if r.status_code not in (200, 204):
            print(f"  [ERR patch] {p['name']}: {r.status_code}"); miss += 1; continue
        print(f"  [OK] {cell} -> {p['name']}"); ok += 1

    print(f"\n{t}: ok={ok} miss={miss}" + ("  (DRY-RUN)" if dry else ""))


if __name__ == "__main__":
    main()
