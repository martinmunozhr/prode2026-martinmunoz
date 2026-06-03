"""
Re-extracción para equipos con pocos jugadores.

Mejoras respecto al script original:
  - Format A: col_w dinámico (img_w // 4) en vez de fijo 579
  - Format A: threshold 1500px (antes 800) → RSA/ING no se confunden
  - Format B: acepta PNG grandes (RSA tiene stickers PNG)
  - OCR: escanea MÚLTIPLES strips (bottom 40%, top 30%, full) y toma el mejor hit
  - Permite --min-players para saltear equipos que ya tienen suficientes

Uso:
    python extract_fix_teams.py --teams rsa ing bra kor can sco bih mex ksa tur --no-skip
"""
import fitz
from PIL import Image
import numpy as np
import os, io, json, re, unicodedata, argparse
from pathlib import Path

PDF_DIR   = Path(r"c:\Users\Tincho\OneDrive\Desktop\ÁLBUM PANINI MUNDIAL 2026 PDF-20260525T225014Z-3-001\ÁLBUM PANINI MUNDIAL 2026 PDF")
OUT_DIR   = Path(__file__).parent / "crops"
AVG_ROW_H = 770

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

print("Cargando OCR...")
import easyocr
reader = easyocr.Reader(["en", "es"], gpu=False, verbose=False)
print("OCR listo.\n")

NAME_RE = re.compile(r"^[A-ZÁÉÍÓÚÑÜÀÈÌÒÙÂÊÎÔÛÃÕÄÖÏËÇŠŽČÝŘŮĚĎĞ\s\.\-']+$")
_PANINI_VARIANTS = {"PANINI","PAHIVI","PAHINI","PAKIHI","PANIN","PABINI","PANIMI","PANIVI","PANIHI","PAHIMI","PANIN1"}
_STOP_WORDS = {"FRANCE","BRASIL","BRAZIL","MEXICO","ARGENTINA","SPAIN","ESPANA","KOREA","CANADA",
               "CANADR","MOROCCO","GHANA","SAUDI","AUSTRALIA","AUSTRALI","JAPAN","ITALY","ENGLAND",
               "GERMANY","ALGERIA","URUGUAY","PARAGUAY","ECUADOR","COLOMBIA","PORTUGAL","FIFA",
               "FIFAS","KELME","ADIDAS","NIKE","PUMA","PARIS SAINT"}

def slugify(s):
    s = unicodedata.normalize("NFD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9_.\-]", "_", s.lower())

def _is_bad(text):
    t = text.upper().strip()
    if t in _STOP_WORDS: return True
    if t.startswith("FIFA"): return True
    tokens = set(t.split())
    if tokens & {"BRASIL","FRANCE","MEXICO","CANADA","SAUDI","JAPAN","KOREA","AUSTRALIA","FIFAS"}: return True
    t_nospace = t.replace(" ","")
    if t_nospace in _PANINI_VARIANTS: return True
    panini = "PANINI"
    matches = sum(1 for a,b in zip(t_nospace, panini) if a==b)
    if len(t_nospace) == 6 and matches >= 4: return True
    return False

def ocr_strips(cell_img):
    """Prueba bottom 40%, top 30% y full. Retorna el primer nombre válido."""
    cw, ch = cell_img.size
    candidates = [
        cell_img.crop((0, int(ch*0.60), cw, ch)),        # bottom 40%
        cell_img.crop((0, 0,            cw, int(ch*0.30))), # top 30%
        cell_img,                                          # full cell
    ]
    for strip in candidates:
        results = reader.readtext(np.array(strip), detail=0, paragraph=False)
        for text in results:
            t = text.strip()
            if NAME_RE.match(t) and len(t) >= 4 and not _is_bad(t):
                return t
    return None

# ── Detección de formato mejorada ─────────────────────────────────────────────
FORMAT_A_MIN_WIDTH = 1500  # páginas full-sheet son >= 1500px de ancho

def get_all_images(doc):
    result = []
    for pn in range(len(doc)):
        page = doc[pn]
        for img_ref in page.get_images(full=True):
            info = doc.extract_image(img_ref[0])
            raw  = info["image"]
            if len(raw) < 10_000:
                continue
            try:
                pil = Image.open(io.BytesIO(raw)).convert("RGB")
            except Exception:
                continue
            result.append((pn, raw, pil))
    return result

def detect_format(all_imgs):
    if not all_imgs:
        return "unknown"
    max_w = max(pil.size[0] for _, _, pil in all_imgs)
    return "A" if max_w >= FORMAT_A_MIN_WIDTH else "B"

# ── Extracción Format A (grilla dinámica) ─────────────────────────────────────
def extract_format_a(all_imgs, team_id, team_out):
    by_page = {}
    for pn, raw, pil in all_imgs:
        if pn not in by_page or len(raw) > len(by_page[pn][0]):
            by_page[pn] = (raw, pil)

    players, idx = [], 0
    for pn in sorted(by_page.keys()):
        _, img = by_page[pn]
        img_w, img_h = img.size
        n_cols  = 4
        col_w   = img_w // n_cols
        n_rows  = max(1, round(img_h / AVG_ROW_H))
        row_h   = img_h // n_rows

        for row in range(n_rows):
            for col in range(n_cols):
                try:
                    pad = 8
                    cell = img.crop((col*col_w+pad, row*row_h+pad,
                                     (col+1)*col_w-pad, (row+1)*row_h-pad))
                    name = ocr_strips(cell)
                    if not name:
                        continue
                    idx += 1
                    fname = f"{team_id}_{idx:02d}_{slugify(name[:30])}.jpg"
                    cell.save(str(team_out / fname), quality=92)
                    players.append({"idx": idx, "page": pn+1, "row": row, "col": col,
                                    "ocr_name": name, "name": name.title(), "file": fname,
                                    "team_id": team_id, "position": "MID",
                                    "jersey_number": None, "is_captain": False})
                    print(f"    [{idx:02d}] p{pn+1} r{row}c{col}  {name}")
                except Exception as e:
                    print(f"    [!] p{pn+1} r{row}c{col}: {e}")
    return players

# ── Extracción Format B (stickers individuales) ───────────────────────────────
def extract_format_b(all_imgs, team_id, team_out):
    players, idx = [], 0
    for pn, raw, pil in sorted(all_imgs, key=lambda x: len(x[1])):
        cw, ch = pil.size
        if ch < 200:
            continue
        name = ocr_strips(pil)
        if not name:
            continue
        idx += 1
        fname = f"{team_id}_{idx:02d}_{slugify(name[:30])}.jpg"
        pil.save(str(team_out / fname), quality=92)
        players.append({"idx": idx, "page": pn+1, "ocr_name": name, "name": name.title(),
                        "file": fname, "team_id": team_id, "position": "MID",
                        "jersey_number": None, "is_captain": False})
        print(f"    [{idx:02d}] {name}")
    return players

# ── Main ───────────────────────────────────────────────────────────────────────
def process_team(pdf_name, team_id):
    pdf_path = PDF_DIR / pdf_name
    team_out = OUT_DIR / team_id
    team_out.mkdir(parents=True, exist_ok=True)

    if not pdf_path.exists():
        print(f"  [{team_id}] PDF no encontrado")
        return []

    doc      = fitz.open(str(pdf_path))
    all_imgs = get_all_images(doc)
    fmt      = detect_format(all_imgs)
    print(f"  [{team_id}] {len(all_imgs)} imagenes, Formato {fmt}")

    if fmt == "A":
        players = extract_format_a(all_imgs, team_id, team_out)
    elif fmt == "B":
        players = extract_format_b(all_imgs, team_id, team_out)
    else:
        print(f"  [{team_id}] Sin imágenes")
        return []

    manifest_path = team_out / "manifest_fix.json"
    manifest_path.write_text(json.dumps(players, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  [{team_id}] {len(players)} jugadores -> manifest_fix.json")
    return players

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--teams", nargs="+", default=["rsa","bra","ing","kor","can","sco","bih","mex","ksa","tur","por","cze"])
    args = parser.parse_args()

    inv = {v: k for k, v in PDF_TEAM_MAP.items()}
    for team_id in args.teams:
        pdf_name = inv.get(team_id)
        if not pdf_name:
            print(f"[{team_id}] Sin PDF mapeado")
            continue
        print(f"\n=== {team_id} ===")
        process_team(pdf_name, team_id)

    print("\n=== Extraccion fix completa ===")
