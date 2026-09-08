import os
import csv
import re
from PIL import Image, ImageDraw, ImageFont

DPI = 300


def mm_to_px(mm):
    return int((mm / 25.4) * DPI)


def pt_to_px(pt):
    return int(pt * DPI / 72)


def clean_filename(text):
    return re.sub(r'[\\/*?:"<>|]', "", text)


# --- 1. SET YOUR BASE PATH HERE ---
# Make sure all your CSVs and the 'Image' folder are inside this folder
BASE_DIR = r"D:\Nexathon_wristband"

image_path = os.path.join(BASE_DIR, "Image", "wristband_nexathon.png")
audiowide_path = os.path.join(BASE_DIR, "Audiowide-Regular.ttf")

# Mapping: { "CSV_FILENAME": "FOLDER_NAME" }
tasks = {
    "idea-force-data.csv": "idea-force_wristband_each",
    "visionx-data.csv": "visionx_wristband_each",
    "propers-data.csv": "propers_wristband_each",
    "freezeframe-data.csv": "freezeframe_wristband_each",
    "shortflix-data.csv": "shortflix_wristband_each"
}

text_color = "#00c5d5"
MAX_NAME_LEN = 21

# Load Fonts (Using try-except to handle missing font files)
try:
    name_font = ImageFont.truetype("arialbd.ttf", pt_to_px(27))
    event_font = ImageFont.truetype("arial.ttf", pt_to_px(23))
    number_font = ImageFont.truetype(audiowide_path, pt_to_px(27))
except:
    print("Warning: Specific fonts not found, using default.")
    name_font = event_font = number_font = ImageFont.load_default()

# Coordinates
name_x, name_y = mm_to_px(370), mm_to_px(15)
event_x, event_y = mm_to_px(412), mm_to_px(31.5)
number_x, number_y = mm_to_px(333), mm_to_px(29.5)

# --- 2. THE PROCESSING LOOP ---
for csv_file, folder_name in tasks.items():
    csv_path = os.path.join(BASE_DIR, csv_file)
    save_folder = os.path.join(BASE_DIR, folder_name)

    if not os.path.exists(csv_path):
        print(f"Skipping {csv_file}: File not found in {BASE_DIR}")
        continue

    os.makedirs(save_folder, exist_ok=True)
    print(f"\n>>> Starting {csv_file}...")

    with open(csv_path, newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        saved_count = 0

        for row in reader:
            number_text = row["number"]
            name_text = row["name"][:MAX_NAME_LEN]
            event_text = row["event"]
            safe_name = clean_filename(name_text)

            # Open background
            img = Image.open(image_path).copy()
            draw = ImageDraw.Draw(img)

            # Draw Text
            draw.text((name_x, name_y), name_text, fill=text_color, font=name_font)
            draw.text((event_x, event_y), event_text, fill=text_color, font=event_font)
            draw.text((number_x, number_y), number_text, fill=text_color, font=number_font)

            # Save
            filename = f"{number_text}-{safe_name}.png"
            output_path = os.path.join(save_folder, filename)
            img.save(output_path, format="PNG", dpi=(DPI, DPI))

            saved_count += 1
            if saved_count % 10 == 0:
                print(f"  Generated {saved_count} images so far...")

    print(f"Done! {saved_count} total images saved to: {folder_name}")

print("\nAll events processed successfully.")