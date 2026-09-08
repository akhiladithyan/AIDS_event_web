from PIL import Image
import os
import math

DPI = 300

def mm_to_px(mm):
    return int((mm / 25.4) * DPI)

A4_WIDTH = mm_to_px(210)
A4_HEIGHT = mm_to_px(297)

BAND_WIDTH = mm_to_px(200)
BAND_HEIGHT = mm_to_px(20)

BANDS_PER_PAGE = 14
GAP_PX = 2

INPUT_FOLDER = r"D:\Nexathon_wristband\wristband_each"
OUTPUT_FOLDER = r"D:\Nexathon_wristband\A4_sheets"
BLANK_BAND_PATH = r"D:\Nexathon_wristband\Image\wristband_nexathon_blank.png"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

files = sorted([
    f for f in os.listdir(INPUT_FOLDER)
    if f.lower().endswith(".png")
])

if not files:
    print("❌ No wristband PNG files found.")
    exit()

total_pages = math.ceil(len(files) / BANDS_PER_PAGE)

print(f"Total wristbands: {len(files)}")
print(f"A4 pages needed: {total_pages}")

blank_band = Image.open(BLANK_BAND_PATH)
if blank_band.size != (BAND_WIDTH, BAND_HEIGHT):
    blank_band = blank_band.resize((BAND_WIDTH, BAND_HEIGHT), Image.LANCZOS)

x_pos = (A4_WIDTH - BAND_WIDTH) // 2
total_content_height = (BANDS_PER_PAGE * BAND_HEIGHT) + ((BANDS_PER_PAGE - 1) * GAP_PX)
start_y = (A4_HEIGHT - total_content_height) // 2

for page in range(total_pages):

    a4 = Image.new("RGB", (A4_WIDTH, A4_HEIGHT), "white")

    start = page * BANDS_PER_PAGE
    end = start + BANDS_PER_PAGE
    page_files = files[start:end]

    current_y = start_y

    for fname in page_files:
        path = os.path.join(INPUT_FOLDER, fname)
        try:
            band = Image.open(path)
            if band.size != (BAND_WIDTH, BAND_HEIGHT):
                band = band.resize((BAND_WIDTH, BAND_HEIGHT), Image.LANCZOS)
            a4.paste(band, (x_pos, int(current_y)))
            current_y += BAND_HEIGHT + GAP_PX
        except Exception as e:
            print(f"Error processing {fname}: {e}")

    remaining = BANDS_PER_PAGE - len(page_files)

    for _ in range(remaining):
        a4.paste(blank_band, (x_pos, int(current_y)))
        current_y += BAND_HEIGHT + GAP_PX

    save_path = os.path.join(OUTPUT_FOLDER, f"A4_sheet_{page+1}.png")

    a4.save(
        save_path,
        format="PNG",
        dpi=(DPI, DPI),
        compress_level=0,
        optimize=False
    )

    print(f"Saved: {save_path}")

print("\nAll A4 sheets filled completely.")
