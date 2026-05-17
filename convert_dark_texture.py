from PIL import Image
import os

def convert_to_webp(file_path):
    webp_path = os.path.splitext(file_path)[0] + '.webp'
    try:
        with Image.open(file_path) as img:
            img.save(webp_path, 'WEBP', quality=85)
            print(f"Converted {file_path} to WebP")
    except Exception as e:
        print(f"Failed to convert {file_path}: {e}")

if __name__ == "__main__":
    convert_to_webp('/home/ubuntu/aim-centre-360-web/client/public/images/hero/panel-1-texture-dark.jpg')
