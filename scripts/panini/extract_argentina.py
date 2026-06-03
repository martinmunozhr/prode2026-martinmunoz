"""
Extrae los 18 stickers de jugadores de Argentina, les hace OCR al nombre,
y genera un manifest JSON listo para cargar a Supabase.
"""
import fitz
from PIL import Image
import numpy as np
import os, io, json, re

PDF_PATH = r"c:\Users\Tincho\OneDrive\Desktop\ÁLBUM PANINI MUNDIAL 2026 PDF-20260525T225014Z-3-001\ÁLBUM PANINI MUNDIAL 2026 PDF\2. ARGENTINA.pdf"
OUT_DIR  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "crops", "arg")
os.makedirs(OUT_DIR, exist_ok=True)

# ── Extraer imágenes del PDF ──────────────────────────────────────────────────
def get_page_image(pdf_path, page_num):
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    imgs = page.get_images(full=True)
    biggest = max(imgs, key=lambda img: len(doc.extract_image(img[0])["image"]))
    info = doc.extract_image(biggest[0])
    return Image.open(io.BytesIO(info["image"])).convert("RGB")

# ── Grid calibrado ────────────────────────────────────────────────────────────
COL_W = 579   # 2316 / 4

# Página 1: 4 columnas x 4 filas
# Fila 0: cols 0-1 son non-player (logo AFA + panorámica)
ROW_H_P1 = [680, 798, 798, 796]

# Página 2: 4 columnas x 2 filas
# Fila 0: 4 jugadores | Fila 1: panorámica (non-player)
ROW_H_P2 = [862, 675]

def row_top(heights, r):
    return sum(heights[:r])

# ── Definición de celdas de jugadores ────────────────────────────────────────
# (page, row, col)  →  se derivan del layout visual
PLAYER_CELLS = [
    # Página 1, fila 0: solo cols 2 y 3 son jugadores
    (0, 0, 2),  # Emiliano Martínez
    (0, 0, 3),  # Lionel Messi
    # Página 1, filas 1-3: los 4 cols son jugadores
    (0, 1, 0), (0, 1, 1), (0, 1, 2), (0, 1, 3),
    (0, 2, 0), (0, 2, 1), (0, 2, 2), (0, 2, 3),
    (0, 3, 0), (0, 3, 1), (0, 3, 2), (0, 3, 3),
    # Página 2, fila 0: 4 jugadores
    (1, 0, 0), (1, 0, 1), (1, 0, 2), (1, 0, 3),
]

def crop_cell(img, row_heights, row, col, pad=8):
    x0 = col * COL_W + pad
    y0 = row_top(row_heights, row) + pad
    x1 = x0 + COL_W - pad * 2
    y1 = y0 + row_heights[row] - pad * 2
    return img.crop((x0, y0, x1, y1))

def crop_name_strip(sticker_img):
    """Recorta la franja inferior donde está el nombre (último 28% del sticker)."""
    w, h = sticker_img.size
    return sticker_img.crop((0, int(h * 0.72), w, h))

# ── OCR ───────────────────────────────────────────────────────────────────────
print("Cargando modelo OCR (primera vez puede tardar ~30s)...")
import easyocr
reader = easyocr.Reader(["en", "es"], gpu=False, verbose=False)

def ocr_name(strip_img):
    result = reader.readtext(np.array(strip_img), detail=0, paragraph=False)
    # El nombre suele estar en la primera línea legible (todo mayúsculas)
    for text in result:
        cleaned = text.strip()
        # Línea con nombre: solo letras, tildes, espacios, puntos
        if re.match(r"^[A-ZÁÉÍÓÚÑÜ\s\.\-']+$", cleaned) and len(cleaned) > 3:
            return cleaned
    return " | ".join(result)   # fallback: todo lo que detectó

# ── Procesar todos los jugadores ──────────────────────────────────────────────
doc = fitz.open(PDF_PATH)
pages = [get_page_image(PDF_PATH, 0), get_page_image(PDF_PATH, 1)]
row_heights = [ROW_H_P1, ROW_H_P2]

manifest = []
for idx, (page_num, row, col) in enumerate(PLAYER_CELLS):
    img   = pages[page_num]
    rh    = row_heights[page_num]
    cell  = crop_cell(img, rh, row, col)
    strip = crop_name_strip(cell)

    name  = ocr_name(strip)
    fname = f"arg_{idx+1:02d}_{name.replace(' ', '_').lower()[:30]}.jpg"
    cell.save(os.path.join(OUT_DIR, fname), quality=92)

    manifest.append({
        "idx": idx + 1,
        "page": page_num + 1,
        "row": row,
        "col": col,
        "ocr_name": name,
        "file": fname,
        "team_id": "arg",
    })
    print(f"  [{idx+1:02d}] {name}  ->  {fname}")

manifest_path = os.path.join(OUT_DIR, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"\nListo: {len(manifest)} jugadores → {OUT_DIR}")
print(f"Manifest: {manifest_path}")
