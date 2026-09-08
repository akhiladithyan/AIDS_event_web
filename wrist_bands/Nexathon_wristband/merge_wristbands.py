import os
import shutil

BASE_PATH = r"D:\Nexathon_wristband"

SOURCE_FOLDERS = [
    "idea-force_wristband_each",
    "propers_wristband_each",
    "visionx_wristband_each",
    "freezeframe_wristband_each",
    "shortflix_wristband_each"
]

DEST_FOLDER = os.path.join(BASE_PATH, "wristband_each")
os.makedirs(DEST_FOLDER, exist_ok=True)

counter = 1

for folder in SOURCE_FOLDERS:
    folder_path = os.path.join(BASE_PATH, folder)

    if not os.path.exists(folder_path):
        print("Missing folder:", folder_path)
        continue

    files = sorted([
        f for f in os.listdir(folder_path)
        if f.lower().endswith(".png")
    ])

    print(f"\nCopying from {folder} → {len(files)} files")

    for file in files:
        src = os.path.join(folder_path, file)

        new_name = f"{counter:04d}_{file}"
        dst = os.path.join(DEST_FOLDER, new_name)

        shutil.copy2(src, dst)
        counter += 1

print("\n✅ All wristbands merged into wristband_each folder.")
