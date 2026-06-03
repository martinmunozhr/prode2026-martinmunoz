"""
Analiza el layout del PDF de Argentina y calibra coordenadas del grid.
Genera una imagen con las líneas del grid superpuestas para verificar.
"""
import fitz
from PIL import Image, ImageDraw, ImageFont
import os, io

PDF_PATH = r"c:\Users\Tincho\OneDrive\Desktop\ÁLBUM PANINI MUNDIAL 2026 PDF-20260525T225014Z-3-001\ÁLBUM PANINI MUNDIAL 2026 PDF\2. ARGENTINA.pdf"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
CROPS_DIR = os.path.join(OUT_DIR, "crops")
os.makedirs(CROPS_DIR, exist_ok=True)

def extract_main_image(pdf_path, page_num):
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    imgs = page.get_images(full=True)
    biggest = max(imgs, key=lambda img: len(doc.extract_image(img[0])["image"]))
    info = doc.extract_image(biggest[0])
    return Image.open(io.BytesIO(info["image"])).convert("RGB")

# ── Grid layout para Argentina ──────────────────────────────────────────────
# Página 1: 2316x3072, 4 columnas x 4 filas
# Fila 1 (header): logo AFA + panorámica + Martínez + Messi  (layout irregular)
# Filas 2-4: 4 jugadores uniformes
#
# Página 2: 2316x1537, 4 columnas x 1 fila de jugadores + panorámica abajo

PAGE1_W, PAGE1_H = 2316, 3072
PAGE2_W, PAGE2_H = 2316, 1537

COL_W = PAGE1_W // 4  # 579

# Filas página 1: fila 0 (header) ligeramente más alta
ROW_HEIGHTS_P1 = [680, 798, 798, 796]  # suma ≈ 3072
# Filas página 2
ROW_HEIGHTS_P2 = [900, 637]            # fila jugadores + panorámica

def row_y(heights, row_idx):
    return sum(heights[:row_idx])

def draw_grid(img, col_w, row_heights, label="page"):
    overlay = img.copy()
    draw = ImageDraw.Draw(overlay)
    W, H = img.size
    # columnas
    for c in range(1, 4):
        x = c * col_w
        draw.line([(x, 0), (x, H)], fill=(255, 0, 0), width=4)
    # filas
    y = 0
    for h in row_heights[:-1]:
        y += h
        draw.line([(0, y), (W, y)], fill=(0, 255, 0), width=4)
    # números de celda
    y = 0
    for r, rh in enumerate(row_heights):
        for c in range(4):
            cx = c * col_w + col_w // 2
            cy = y + rh // 2
            draw.ellipse([cx-20, cy-20, cx+20, cy+20], fill=(255, 255, 0))
            draw.text((cx-8, cy-8), f"{r},{c}", fill=(0,0,0))
        y += rh
    return overlay

# ── Página 1 ─────────────────────────────────────────────────────────────────
img1 = extract_main_image(PDF_PATH, 0)
grid1 = draw_grid(img1, COL_W, ROW_HEIGHTS_P1, "p1")
grid1_small = grid1.resize((600, 796))
grid1_small.save(os.path.join(OUT_DIR, "grid_p1.jpg"), quality=85)
print("Grid p1 guardado")

# ── Página 2 ─────────────────────────────────────────────────────────────────
img2 = extract_main_image(PDF_PATH, 1)
grid2 = draw_grid(img2, COL_W, ROW_HEIGHTS_P2, "p2")
grid2_small = grid2.resize((600, 398))
grid2_small.save(os.path.join(OUT_DIR, "grid_p2.jpg"), quality=85)
print("Grid p2 guardado")

# ── Crops de prueba: fila 1 de p1 (Martínez y Messi) + fila 1 de p2 ─────────
def crop_cell(img, col_w, row_heights, row, col, padding=10):
    x0 = col * col_w + padding
    y0 = row_y(row_heights, row) + padding
    x1 = x0 + col_w - padding * 2
    y1 = y0 + row_heights[row] - padding * 2
    return img.crop((x0, y0, x1, y1))

# Martínez = row 0, col 2  |  Messi = row 0, col 3
for label, row, col, img, rh in [
    ("martinez", 0, 2, img1, ROW_HEIGHTS_P1),
    ("messi",    0, 3, img1, ROW_HEIGHTS_P1),
    ("balerdi",  0, 0, img2, ROW_HEIGHTS_P2),
    ("otamendi", 0, 1, img2, ROW_HEIGHTS_P2),
]:
    crop = crop_cell(img, COL_W, rh, row, col)
    crop.save(os.path.join(CROPS_DIR, f"{label}.jpg"), quality=90)
    print(f"Crop {label}: {crop.size}")

print("Listo. Revisá grid_p1.jpg y grid_p2.jpg para calibrar.")
