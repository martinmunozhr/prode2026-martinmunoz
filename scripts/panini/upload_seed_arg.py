"""
Sube los stickers de Argentina a Supabase Storage e inserta los jugadores en la DB.
Uso: python upload_seed_arg.py --key <SUPABASE_SERVICE_ROLE_KEY>
"""
import os, sys, json, argparse, requests, unicodedata, re
from pathlib import Path

SUPABASE_URL       = "https://jcqxskdfpjicptnidzdt.supabase.co"
MANIFEST_PATH      = Path(__file__).parent / "crops" / "arg" / "manifest_final.json"
CROPS_DIR          = Path(__file__).parent / "crops" / "arg"
BUCKET             = "stickers"
STORAGE_FOLDER     = "arg"

def slugify(filename):
    name = unicodedata.normalize("NFD", filename)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = re.sub(r"[^a-z0-9_.\-]", "_", name.lower())
    return name

def get_key():
    parser = argparse.ArgumentParser()
    parser.add_argument("--key", help="Supabase service_role key")
    args, _ = parser.parse_known_args()
    return args.key or os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or input("Service role key: ").strip()

def upload_image(service_key, local_path, storage_path):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
    }
    with open(local_path, "rb") as f:
        r = requests.put(url, headers=headers, data=f)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Upload failed {r.status_code}: {r.text}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"

def insert_player(service_key, player):
    url = f"{SUPABASE_URL}/rest/v1/players"
    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    payload = {
        "team_id":    player["team_id"],
        "name":       player["name"],
        "position":   player["position"],
        "is_captain": player.get("is_captain", False),
        "image_url":  player["image_url"],
    }
    r = requests.post(url, headers=headers, json=payload)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Insert failed {r.status_code}: {r.text}")

def main():
    key = get_key()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    print(f"Procesando {len(manifest)} jugadores de Argentina...\n")
    for p in manifest:
        local = CROPS_DIR / p["file"]
        storage_path = f"{STORAGE_FOLDER}/{slugify(p['file'])}"

        # 1. Upload imagen
        image_url = upload_image(key, local, storage_path)

        # 2. Insert en DB
        p["image_url"] = image_url
        insert_player(key, p)

        print(f"  [OK] {p['name']:25s}  {p['position']}  {image_url.split('/')[-1]}")

    print(f"\nListo. {len(manifest)} jugadores de Argentina cargados.")

if __name__ == "__main__":
    main()
