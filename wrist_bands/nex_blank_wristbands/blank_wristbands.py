import os
from PIL import Image

def mm_to_px(mm, dpi=300):
    # This formula ensures the physical size translates to
    # the correct number of pixels for high-end printing.
    return int((mm / 25.4) * dpi)

# --- Configuration ---
IMAGE_PATH = "wristband_nexathon_blank.png"
OUTPUT_NAME = "A3_Centered_Wristbands_FullRes.png"
DPI = 300
GAP_PX = 2  # Your 2-pixel gap

# Physical Dimensions (mm)
A3_W, A3_H = 420, 297
WB_W, WB_H = 200, 20

def create_centered_sheet():
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: File not found at {IMAGE_PATH}")
        return

    # 1. Pixel Conversions at 300 DPI
    # A3 Landscape: 4960 x 3508 pixels
    a3_px_w = mm_to_px(A3_W, DPI)
    a3_px_h = mm_to_px(A3_H, DPI)
    # Wristband: 2362 x 236 pixels
    wb_px_w = mm_to_px(WB_W, DPI)
    wb_px_h = mm_to_px(WB_H, DPI)

    # 2. Calculate Grid Capacity
    cols = (a3_px_w + GAP_PX) // (wb_px_w + GAP_PX)
    rows = (a3_px_h + GAP_PX) // (wb_px_h + GAP_PX)

    # 3. Calculate Total Grid Dimensions for perfect centering
    grid_w = (cols * wb_px_w) + ((cols - 1) * GAP_PX)
    grid_h = (rows * wb_px_h) + ((rows - 1) * GAP_PX)

    margin_left = (a3_px_w - grid_w) // 2
    margin_top = (a3_px_h - grid_h) // 2

    # 4. Create high-bit-depth Canvas
    canvas = Image.new('RGB', (a3_px_w, a3_px_h), (255, 255, 255))

    with Image.open(IMAGE_PATH) as img:
        # Using LANCZOS resampling to maintain sharp edges at full resolution
        wristband = img.convert("RGB").resize((wb_px_w, wb_px_h), Image.Resampling.LANCZOS)

        for r in range(rows):
            for c in range(cols):
                x = margin_left + (c * (wb_px_w + GAP_PX))
                y = margin_top + (r * (wb_px_h + GAP_PX))
                canvas.paste(wristband, (x, y))

        # 5. Save with Lossless Settings and DPI Metadata
        # compress_level=0 ensures the fastest save with no quality loss
        canvas.save(
            OUTPUT_NAME,
            format="PNG",
            dpi=(DPI, DPI),
            compress_level=0
        )

    print(f"Success! Placed a {cols}x{rows} grid ({cols * rows} total).")
    print(f"Sheet Pixels: {a3_px_w} x {a3_px_h}")
    print(f"Wristband Pixels: {wb_px_w} x {wb_px_h}")

if __name__ == "__main__":
    create_centered_sheet()