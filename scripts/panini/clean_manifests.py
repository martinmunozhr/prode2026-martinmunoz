"""
Limpia los manifests antes del upload:
- Elimina nombres de países/marcas/FIFA stickers
- Elimina cross-contamination (jugadores famosos en equipo incorrecto)
- Elimina duplicados dentro del mismo equipo
Guarda manifest_clean.json por equipo.
"""
import json, re
from pathlib import Path

CROPS_DIR = Path(__file__).parent / "crops"

# Palabras que NO son nombres de jugador
STOP_WORDS = {
    # Países y federaciones
    "FRANCE", "BRASIL", "BRAZIL", "MEXICO", "ARGENTINA", "SPAIN", "ESPANA",
    "KOREA", "CANADA", "CANADR", "ANADA", "MOROCCO", "GHANA", "SAUDI", "AUSTRALIA",
    "AUSTRALI", "JAPAN", "ITALY", "ENGLAND", "GERMANY", "ALGERIA",
    "URUGUAY", "PARAGUAY", "ECUADOR", "COLOMBIA", "PORTUGAL",
    "SOUTH AFRICA", "SCOTLAND", "SCOTLAND.",
    # Marcas / sponsors / federaciones
    "KELME", "ADIDAS", "NIKE", "PUMA", "SAVEZ",
    # Frases parciales / garbled
    "PARIS SAINT",
}

# Prefijos a rechazar
STOP_PREFIXES = ("FIFA",)

# Palabras en el nombre que indican falso positivo
STOP_CONTAINS = {"SAUDI", "KOREA", "JAPAN", "BRASIL", "CANADA", "AUSTRALI",
                 "FRANCE", "MEXICO", "PAIKKOREA", "CASTROPREA", "SAVEZ"}

# Cross-contamination: jugador famoso → team_id correcto
FAMOUS_PLAYERS = {
    "LIONEL MESSI":        "arg",
    "JUDE BELLINGHAM":     "ing",
    "HAKAN CALHANOGLU":    "tur",
    "CRISTIANO RONALDO":   "por",
    "KYLIAN MBAPPE":       "fra",
    "ERLING HAALAND":      "nor",
    "ALISSON BECKER":      "bra",
    "DIOGO COSTA":         "por",
    "RUBEN DIAS":          "por",
    "RÚBEN DIAS":          "por",
    "BERNARDO SILVA":      "por",
    "NUNO MENDES":         "por",
    "CRISTOPH BAUMGARTNER":"aut",
    "CHRISTOPH BAUMGARTNER":"aut",
    "HARRY KANE":          "ing",
    "MARCUS RASHFORD":     "ing",
    "PHIL FODEN":          "ing",
    "HEUNGMIN SON":        "kor",
}

def should_remove(entry, team_id):
    # Soporta "ocr_name" (scripts nuevos) y "name" (manifest_final de Argentina)
    raw = entry.get("ocr_name") or entry.get("name") or ""
    name = raw.strip().upper()

    # Nombre demasiado corto (< 5 chars = garbled OCR)
    if len(name) < 5:
        return True

    # Match exacto con stop words
    if name in STOP_WORDS:
        return True

    # Prefijos prohibidos (FIFA, FIFAS, etc.)
    for prefix in STOP_PREFIXES:
        if name.startswith(prefix):
            return True

    # Contiene palabra prohibida como token completo
    tokens = set(name.split())
    if tokens & STOP_CONTAINS:
        return True

    # Cross-contamination: jugador famoso en equipo incorrecto
    for famous, correct_team in FAMOUS_PLAYERS.items():
        if famous in name and team_id != correct_team:
            return True

    return False

def clean_team(team_id):
    team_dir = CROPS_DIR / team_id

    # Prioridad: manifest_fix.json (re-extracción) > manifest_final.json > manifest.json
    for candidate in ["manifest_fix.json", "manifest_final.json", "manifest.json"]:
        src = team_dir / candidate
        if src.exists():
            break
    if not src.exists():
        return 0, 0

    manifest = json.loads(src.read_text(encoding="utf-8"))
    before = len(manifest)

    # Filtrar falsos positivos
    cleaned = [e for e in manifest if not should_remove(e, team_id)]

    # Eliminar duplicados de nombre (mantener primera aparición)
    seen = set()
    deduped = []
    for e in cleaned:
        key = e.get("ocr_name", "").upper().strip()
        if key not in seen:
            seen.add(key)
            deduped.append(e)

    # Re-numerar idx
    for i, e in enumerate(deduped, 1):
        e["idx"] = i

    after = len(deduped)
    removed = before - after

    out_path = team_dir / "manifest_clean.json"
    out_path.write_text(json.dumps(deduped, ensure_ascii=False, indent=2), encoding="utf-8")

    if removed > 0:
        print(f"  [{team_id}] {before} -> {after} jugadores ({removed} removidos) -> manifest_clean.json")
    else:
        print(f"  [{team_id}] {after} jugadores (sin cambios)")

    return before, after

if __name__ == "__main__":
    total_before = total_after = 0
    SKIP = {"arg"}  # ya procesado manualmente con manifest_final.json
    teams = sorted(d.name for d in CROPS_DIR.iterdir() if d.is_dir() and d.name not in SKIP)
    for team_id in teams:
        b, a = clean_team(team_id)
        total_before += b
        total_after  += a

    print(f"\nTotal: {total_before} -> {total_after} jugadores ({total_before - total_after} removidos)")
