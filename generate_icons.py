from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    # Create a white background
    img = Image.new('RGB', (size, size), color='white')
    d = ImageDraw.Draw(img)
    
    # Draw a simple "A" logo if no logo file exists
    # In a real scenario, we would resize the actual logo
    try:
        # Try to load a font, fallback to default
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size * 0.6))
    except:
        font = ImageFont.load_default()
        
    # Draw text centered
    text = "A"
    # Get text bounding box
    left, top, right, bottom = d.textbbox((0, 0), text, font=font)
    text_width = right - left
    text_height = bottom - top
    
    position = ((size - text_width) / 2, (size - text_height) / 2 - top)
    
    # Draw black text
    d.text(position, text, fill="black", font=font)
    
    img.save(output_path)
    print(f"Generated {output_path}")

if __name__ == "__main__":
    public_dir = '/home/ubuntu/aim-centre-360-web/client/public'
    create_icon(192, os.path.join(public_dir, 'pwa-192x192.png'))
    create_icon(512, os.path.join(public_dir, 'pwa-512x512.png'))
