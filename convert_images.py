import os
from PIL import Image

def convert_to_webp(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                webp_path = os.path.splitext(file_path)[0] + '.webp'
                
                # Skip if WebP already exists
                if os.path.exists(webp_path):
                    print(f"Skipping {file}, WebP already exists")
                    continue
                
                try:
                    with Image.open(file_path) as img:
                        img.save(webp_path, 'WEBP', quality=85)
                        print(f"Converted {file} to WebP")
                except Exception as e:
                    print(f"Failed to convert {file}: {e}")

if __name__ == "__main__":
    convert_to_webp('/home/ubuntu/aim-centre-360-web/client/public/images')
