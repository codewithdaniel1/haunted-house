"""Fetch the selected CC0 Poly Haven assets for Haunted House."""

import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1] / "public" / "assets"
HEADERS = {"User-Agent": "HauntedHouseDev/1.0"}
MODELS = ["wooden_bookshelf_worn", "GothicCabinet_01", "Chandelier_01", "ornate_mirror_01", "gothic_coffee_table"]
TEXTURES = ["decrepit_wallpaper", "old_wood_floor", "worn_cracked_plaster"]


def get(url):
    with urlopen(Request(url, headers=HEADERS), timeout=60) as response:
        return response.read()


def save(url, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        return
    print(destination.relative_to(ROOT.parent), flush=True)
    destination.write_bytes(get(url))


for asset_id in MODELS:
    meta = json.loads(get(f"https://api.polyhaven.com/files/{asset_id}"))
    package = meta["gltf"]["1k"]["gltf"]
    directory = ROOT / "models" / asset_id
    save(package["url"], directory / f"{asset_id}_1k.gltf")
    for relative_path, file in package["include"].items():
        save(file["url"], directory / relative_path)

for asset_id in TEXTURES:
    meta = json.loads(get(f"https://api.polyhaven.com/files/{asset_id}"))
    for slot, suffix in [("Diffuse", "color"), ("nor_gl", "normal"), ("Rough", "roughness")]:
        file = meta[slot]["2k"]["jpg"]
        save(file["url"], ROOT / "materials" / f"{asset_id}_{suffix}.jpg")
