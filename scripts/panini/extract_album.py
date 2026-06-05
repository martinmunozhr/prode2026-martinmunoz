"""
Extrae figuritas individuales desde los PDFs del album Panini (fuente limpia).
Detecta la grilla por proyeccion de contenido (no division ciega) -> recorta cada
celda. NO identifica nombres (eso lo hace el humano mirando el montaje). Genera:
  out/<team>/p{P}_r{R}_c{C}.jpg   (cada celda)
  out/<team>/_montage_p{P}.png    (montaje etiquetado para revisar)

Uso: python extract_album.py "<ruta pdf>" <team_id>
"""
import sys, fitz, numpy as np, cv2
from pathlib import Path

ZOOM = 3
OUT = Path(__file__).parent / "album_crops"


def render(page):
    pix = page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM))
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    return cv2.cvtColor(img, cv2.COLOR_RGBA2RGB) if pix.n == 4 else img.copy()


def segments(profile, thr, min_len, bridge):
    """Devuelve (start,end) de tramos con profile>thr, uniendo huecos < bridge."""
    on = profile > thr
    # cerrar huecos chicos dentro de una figurita
    segs, start = [], None
    gap = 0
    for i, v in enumerate(on):
        if v:
            if start is None:
                start = i
            gap = 0
        else:
            if start is not None:
                gap += 1
                if gap > bridge:
                    if (i - gap) - start >= min_len:
                        segs.append((start, i - gap))
                    start = None
                    gap = 0
    if start is not None and len(on) - start >= min_len:
        segs.append((start, len(on)))
    return segs


COLS = 4
CARD_ASPECT = 0.72  # ancho/alto de una figurita


def detect_cells(img):
    """Grilla fija de 4 columnas; filas por geometria (celdas uniformes del template)."""
    h, w, _ = img.shape
    rows_n = max(1, round(h * CARD_ASPECT * COLS / w))
    cw, ch = w / COLS, h / rows_n
    rows = [(int(r * ch), int((r + 1) * ch)) for r in range(rows_n)]
    cols = [(int(c * cw), int((c + 1) * cw)) for c in range(COLS)]
    return rows, cols


def main():
    pdf, team = sys.argv[1], sys.argv[2]
    doc = fitz.open(pdf)
    tdir = OUT / team
    tdir.mkdir(parents=True, exist_ok=True)
    total = 0
    for pi, page in enumerate(doc, 1):
        img = render(page)
        rows, cols = detect_cells(img)
        # montaje etiquetado
        mont = img.copy()
        for r0, r1 in rows:
            for c0, c1 in cols:
                cv2.rectangle(mont, (c0, r0), (c1, r1), (255, 0, 0), 3)
        cv2.imwrite(str(tdir / f"_montage_p{pi}.png"),
                    cv2.cvtColor(cv2.resize(mont, (mont.shape[1] // 2, mont.shape[0] // 2)), cv2.COLOR_RGB2BGR))
        for ri, (r0, r1) in enumerate(rows, 1):
            for ci, (c0, c1) in enumerate(cols, 1):
                # inset chico para sacar bordes/recuadro
                dy, dx = int((r1 - r0) * 0.02), int((c1 - c0) * 0.02)
                cell = img[r0 + dy:r1 - dy, c0 + dx:c1 - dx]
                cv2.imwrite(str(tdir / f"p{pi}_r{ri}_c{ci}.jpg"),
                            cv2.cvtColor(cell, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 88])
                total += 1
        print(f"  pag {pi}: {len(rows)} filas x {len(cols)} cols = {len(rows)*len(cols)} celdas")
    print(f"total celdas: {total} -> {tdir}")


if __name__ == "__main__":
    main()
