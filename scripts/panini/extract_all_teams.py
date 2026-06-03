"""
Extrae stickers de jugadores de todos los PDFs Panini.

Dos formatos soportados:
  Formato A: 1-2 imágenes grandes por página (ej: Argentina) -> crop por grilla
  Formato B: ~20 imágenes individuales por página (ej: República Checa) -> extracción directa

Detección automática: si la imagen más grande es < 800px de ancho -> Formato B

Uso:
    python extract_all_teams.py              # procesa todos
    python extract_all_teams.py --team cze   # solo un equipo
    python extract_all_teams.py --no-skip    # reprocesa aunque ya exista manifest
"""
import fitz
from PIL import Image
import numpy as np
import os, io, json, re, unicodedata, argparse
from pathlib import Path

PDF_DIR   = Path(r"c:\Users\Tincho\OneDrive\Desktop\ÁLBUM PANINI MUNDIAL 2026 PDF-20260525T225014Z-3-001\ÁLBUM PANINI MUNDIAL 2026 PDF")
OUT_DIR   = Path(__file__).parent / "crops"
COL_W     = 579    # Formato A: page_width(2316) / 4 cols
AVG_ROW_H = 770    # Formato A: altura estimada de sticker para detectar filas

PDF_TEAM_MAP = {
    "3. PORTUGAL.pdf":         "por",
    "4. FRANCIA.pdf":          "fra",
    "5. BRASIL.pdf":           "bra",
    "6. ESPAÑA.pdf":           "esp",
    "7. MEXICO.pdf":           "mex",
    "8. COLOMBIA.pdf":         "col",
    "9. INGLATERRA.pdf":       "ing",
    "10. ECUADOR.pdf":         "ecu",
    "11. HOLANDA.pdf":         "ned",
    "11. JAPÓN.pdf":           "jpn",
    "13. SENEGAL.pdf":         "sen",
    "14. ALEMANIA.pdf":        "ger",
    "15. MARRUECOS.pdf":       "mar",
    "16. KOREA.pdf":           "kor",
    "17. SUDÁFRICA.pdf":       "rsa",
    "18. PANAMÁ.pdf":          "pan",
    "19. AUSTRIA.pdf":         "aut",
    "20. BELGICA.pdf":         "bel",
    "21. BOSNIA.pdf":          "bih",
    "22. CABO VERDE.pdf":      "cpv",
    "23. CANADÁ.pdf":          "can",
    "24. COSTA DE MARFIL.pdf": "civ",
    "25. CROACIA.pdf":         "cro",
    "26. CURAZAO.pdf":         "cuw",
    "27. EGIPTO.pdf":          "egy",
    "28. ESCOCIA.pdf":         "sco",
    "29. ESTADOS UNIDOS.pdf":  "usa",
    "30. GHANA.pdf":           "gha",
    "31. HAITI.pdf":           "hai",
    "32. IRÁN.pdf":            "irn",
    "33. IRAQ.pdf":            "irq",
    "34. JORDAN.pdf":          "jor",
    "35. NUEVA ZELANDA.pdf":   "nzl",
    "36. PARAGUAY.pdf":        "par",
    "37. QATAR.pdf":           "qat",
    "38. CONGO.pdf":           "cod",
    "39. REPÚBLICA CHECA.pdf": "cze",
    "42. SUECIA.pdf":          "swe",
    "43. SUIZA.pdf":           "sui",
    "44. TÚNEZ.pdf":           "tun",
    "45. TURQUÍA.pdf":         "tur",
    "46. URUGUAY.pdf":         "uru",
    "47. UZBEKISTÁN.pdf":      "uzb",
    "48. ARGELIA.pdf":         "alg",
    "49. AUSTRALIA.pdf":       "aus",
    "50. SAUDÍ.pdf":           "ksa",
    "51. NORUEGA.pdf":         "nor",
}

# ── OCR ───────────────────────────────────────────────────────────────────────
print("Cargando modelo OCR...")
import easyocr
reader = easyocr.Reader(["en", "es"], gpu=False, verbose=False)
print("OCR listo.\n")

NAME_RE = re.compile(r"^[A-ZÁÉÍÓÚÑÜÀÈÌÒÙÂÊÎÔÛÃÕÄÖÏËÇŠŽČÝŘŮĚĎ\s\.\-']+$")

# Falsos positivos comunes: marca PANINI y variantes por OCR
_PANINI_VARIANTS = {"PANINI","PAHIVI","PAHINI","PAKIHI","PANIN","PAHINI","PABINI",
                    "PANIMI","PANIVI","PANIHI","PAHIMI","PAHINI","PAHIVI","PANIN1"}

def slugify(s):
    s = unicodedata.normalize("NFD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9_.\-]", "_", s.lower())

def _is_panini(text):
    """Detecta la marca PANINI y sus misreads por OCR."""
    t = text.upper().replace(" ", "")
    if t in _PANINI_VARIANTS:
        return True
    # Distancia de edición sencilla: si 4+ chars coinciden con PANINI en orden
    panini = "PANINI"
    matches = sum(1 for a, b in zip(t, panini) if a == b)
    if len(t) == 6 and matches >= 4:
        return True
    return False

def ocr_name(strip_img):
    """Retorna el nombre si la celda es un jugador, None si no."""
    results = reader.readtext(np.array(strip_img), detail=0, paragraph=False)
    for text in results:
        cleaned = text.strip()
        if (NAME_RE.match(cleaned)
                and len(cleaned) >= 4
                and not cleaned.replace(" ", "").isdigit()
                and not _is_panini(cleaned)):
            return cleaned
    return None

# ── Extracción de imágenes del PDF ────────────────────────────────────────────
def get_all_page_images(doc):
    """
    Retorna lista de (page_num, img_bytes, pil_image) para cada imagen del PDF.
    Filtra PNGs pequeños (masks/decorativos < 10KB) y logos diminutos.
    """
    result = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        imgs = page.get_images(full=True)
        for img_ref in imgs:
            info = doc.extract_image(img_ref[0])
            raw  = info["image"]
            if len(raw) < 10_000:          # descarta masks y elementos decorativos
                continue
            try:
                pil = Image.open(io.BytesIO(raw)).convert("RGB")
            except Exception:
                continue
            result.append((page_num, raw, pil))
    return result

def detect_format(all_imgs):
    """
    Formato A: hay imágenes >= 800px de ancho (página completa, grilla de stickers)
    Formato B: todas las imágenes son < 800px (stickers individuales ya recortados)
    """
    if not all_imgs:
        return "unknown"
    max_w = max(pil.size[0] for _, _, pil in all_imgs)
    return "A" if max_w >= 800 else "B"

# ── Formato A: grilla sobre imagen de página completa ─────────────────────────
def extract_format_a(all_imgs, team_id, team_out):
    """Argentina y similares: una imagen grande por página, crop por grilla."""
    # Agrupar por página, quedarse con la más grande de cada una
    by_page = {}
    for page_num, raw, pil in all_imgs:
        if page_num not in by_page or len(raw) > len(by_page[page_num][0]):
            by_page[page_num] = (raw, pil)

    players = []
    idx = 0
    for page_num in sorted(by_page.keys()):
        _, img = by_page[page_num]
        img_w, img_h = img.size
        n_rows = max(1, round(img_h / AVG_ROW_H))
        row_h  = img_h // n_rows
        n_cols = min(4, img_w // COL_W)

        for row in range(n_rows):
            for col in range(n_cols):
                try:
                    pad = 8
                    x0 = col * COL_W + pad
                    y0 = row * row_h + pad
                    x1 = x0 + COL_W - pad * 2
                    y1 = y0 + row_h - pad * 2
                    cell  = img.crop((x0, y0, x1, y1))
                    cw, ch = cell.size
                    strip = cell.crop((0, int(ch * 0.58), cw, ch))  # bottom 42% por offset de grilla uniforme
                    name  = ocr_name(strip)
                    if name is None:
                        continue
                    idx += 1
                    fname = f"{team_id}_{idx:02d}_{slugify(name[:30])}.jpg"
                    cell.save(str(team_out / fname), quality=92)
                    players.append({"idx": idx, "page": page_num+1, "row": row, "col": col,
                                    "ocr_name": name, "name": name.title(), "file": fname,
                                    "team_id": team_id, "position": "MED",
                                    "jersey_number": None, "is_captain": False})
                    print(f"    [{idx:02d}] p{page_num+1} r{row}c{col}  {name}")
                except Exception as e:
                    print(f"    [!] p{page_num+1} r{row}c{col}: {e}")
    return players

# ── Formato B: stickers individuales ya embebidos en el PDF ───────────────────
def extract_format_b(all_imgs, team_id, team_out):
    """
    República Checa y similares: cada imagen del PDF es un sticker individual.
    Se filtra por OCR para quedarse solo con los jugadores.
    """
    players = []
    idx = 0

    # Ordenar por tamaño (el más grande al final, probablemente el grupo/badge)
    sorted_imgs = sorted(all_imgs, key=lambda x: len(x[1]))

    for page_num, raw, pil in sorted_imgs:
        cw, ch = pil.size
        if ch < 200:  # demasiado pequeño para ser un sticker
            continue
        strip = pil.crop((0, int(ch * 0.72), cw, ch))
        name = ocr_name(strip)
        if name is None:
            continue
        idx += 1
        fname = f"{team_id}_{idx:02d}_{slugify(name[:30])}.jpg"
        pil.save(str(team_out / fname), quality=92)
        players.append({"idx": idx, "page": page_num+1, "ocr_name": name,
                        "name": name.title(), "file": fname, "team_id": team_id,
                        "position": "MED", "jersey_number": None, "is_captain": False})
        print(f"    [{idx:02d}] {name}")
    return players

# ── Proceso principal por equipo ───────────────────────────────────────────────
def process_team(pdf_name, team_id, skip_done=True):
    pdf_path = PDF_DIR / pdf_name
    team_out = OUT_DIR / team_id
    team_out.mkdir(parents=True, exist_ok=True)

    manifest_path = team_out / "manifest.json"
    if skip_done and manifest_path.exists():
        existing = json.loads(manifest_path.read_text(encoding="utf-8"))
        print(f"  [{team_id}] Ya procesado ({len(existing)} jugadores), saltando.")
        return

    if not pdf_path.exists():
        print(f"  [{team_id}] PDF no encontrado: {pdf_path}")
        return

    doc      = fitz.open(str(pdf_path))
    all_imgs = get_all_page_images(doc)
    fmt      = detect_format(all_imgs)
    print(f"  [{team_id}] {len(all_imgs)} imagenes, Formato {fmt}")

    if fmt == "A":
        players = extract_format_a(all_imgs, team_id, team_out)
    elif fmt == "B":
        players = extract_format_b(all_imgs, team_id, team_out)
    else:
        print(f"  [{team_id}] Sin imágenes útiles, saltando.")
        return

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(players, f, ensure_ascii=False, indent=2)

    print(f"  [{team_id}] {len(players)} jugadores guardados -> {manifest_path}")

# ── Main ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--team",    help="Solo este team_id (ej: por)")
    parser.add_argument("--no-skip", action="store_true", help="Reprocesa aunque exista manifest")
    args = parser.parse_args()

    skip = not args.no_skip

    if args.team:
        inv = {v: k for k, v in PDF_TEAM_MAP.items()}
        pdf_name = inv.get(args.team)
        if not pdf_name:
            print(f"team_id '{args.team}' no está en el mapa.")
        else:
            print(f"[1/1] {pdf_name} -> {args.team}")
            process_team(pdf_name, args.team, skip_done=skip)
    else:
        total = len(PDF_TEAM_MAP)
        for i, (pdf_name, team_id) in enumerate(PDF_TEAM_MAP.items(), 1):
            print(f"\n[{i}/{total}] {pdf_name} -> {team_id}")
            process_team(pdf_name, team_id, skip_done=skip)

    print("\n=== Extraccion completa ===")
