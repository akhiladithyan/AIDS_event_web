from PIL import Image
import os
import math

DPI = 300

def mm_to_px(mm):
    return int((mm / 25.4) * DPI)

PAGE_WIDTH = mm_to_px(297)
PAGE_HEIGHT = mm_to_px(420)

ORIG_WIDTH = mm_to_px(200)
ORIG_HEIGHT = mm_to_px(20)

BAND_WIDTH = ORIG_HEIGHT
BAND_HEIGHT = ORIG_WIDTH

COLS = 14
ROWS = 2
BANDS_PER_PAGE = COLS * ROWS
GAP_PX = 2

INPUT_FOLDER = r"D:\Nexathon_wristband\wristband_each"
OUTPUT_FOLDER = r"D:\Nexathon_wristband\A3_rotated_sheets"
BLANK_PATH = r"D:\Nexathon_wristband\Image\wristband_nexathon_blank.png"

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
print(f"A3 pages needed: {total_pages}")

blank_band = Image.open(BLANK_PATH)
if blank_band.size != (ORIG_WIDTH, ORIG_HEIGHT):
    blank_band = blank_band.resize((ORIG_WIDTH, ORIG_HEIGHT), Image.LANCZOS)
blank_band = blank_band.rotate(90, expand=True)

total_grid_width = (COLS * BAND_WIDTH) + ((COLS - 1) * GAP_PX)
total_grid_height = (ROWS * BAND_HEIGHT) + ((ROWS - 1) * GAP_PX)

start_x = (PAGE_WIDTH - total_grid_width) // 2
start_y = (PAGE_HEIGHT - total_grid_height) // 2

for page in range(total_pages):

    sheet = Image.new("RGB", (PAGE_WIDTH, PAGE_HEIGHT), "white")

    start = page * BANDS_PER_PAGE
    end = start + BANDS_PER_PAGE
    page_files = files[start:end]

    total_slots = BANDS_PER_PAGE

    for index in range(total_slots):
        r = index // COLS
        c = index % COLS

        current_x = start_x + (c * (BAND_WIDTH + GAP_PX))
        current_y = start_y + (r * (BAND_HEIGHT + GAP_PX))

        if index < len(page_files):
            fname = page_files[index]
            path = os.path.join(INPUT_FOLDER, fname)
            try:
                band = Image.open(path)
                if band.size != (ORIG_WIDTH, ORIG_HEIGHT):
                    band = band.resize((ORIG_WIDTH, ORIG_HEIGHT), Image.LANCZOS)
                band = band.rotate(90, expand=True)
            except Exception as e:
                print(f"Error processing {fname}: {e}")
                band = blank_band
        else:
            band = blank_band

        sheet.paste(band, (int(current_x), int(current_y)))

    save_path = os.path.join(OUTPUT_FOLDER, f"A3_rotated_sheet_{page+1}.png")

    sheet.save(
        save_path,
        format="PNG",
        dpi=(DPI, DPI),
        compress_level=0,
        optimize=False
    )

    print(f"Saved: {save_path}")

print("\nA3 sheets created. Empty slots filled with blank bands.")
