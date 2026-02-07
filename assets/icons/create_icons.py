#!/usr/bin/env python3
"""
Create placeholder PNG icons for TimerTools PWA
This script creates basic circular icons with timer symbol
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        # Create image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Colors
        bg_color = (37, 99, 235, 255)  # Blue color
        white = (255, 255, 255, 255)
        
        # Draw background circle
        margin = size // 20
        draw.ellipse([margin, margin, size-margin, size-margin], fill=bg_color)
        
        # Draw clock face
        clock_margin = size // 8
        draw.ellipse([clock_margin, clock_margin, size-clock_margin, size-clock_margin], 
                    outline=white, width=max(1, size//50))
        
        # Draw hour markers
        center = size // 2
        outer_radius = center - clock_margin
        inner_radius = outer_radius - size//20
        
        for i in range(4):  # 12, 3, 6, 9 o'clock positions
            angle = i * 90
            import math
            x1 = center + outer_radius * math.cos(math.radians(angle - 90))
            y1 = center + outer_radius * math.sin(math.radians(angle - 90))
            x2 = center + inner_radius * math.cos(math.radians(angle - 90))
            y2 = center + inner_radius * math.sin(math.radians(angle - 90))
            draw.line([(x1, y1), (x2, y2)], fill=white, width=max(1, size//50))
        
        # Draw clock hands
        hand_length = size // 4
        # Hour hand (pointing up)
        draw.line([(center, center), (center, center - hand_length)], 
                 fill=white, width=max(2, size//40))
        # Minute hand (pointing right)
        draw.line([(center, center), (center + hand_length//2, center)], 
                 fill=white, width=max(1, size//50))
        
        # Center dot
        dot_size = max(2, size//25)
        draw.ellipse([center-dot_size, center-dot_size, center+dot_size, center+dot_size], 
                    fill=white)
        
        # Save image
        img.save(filename, 'PNG')
        print(f"Created {filename} ({size}x{size})")
    
    # Create all required icon sizes
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        create_icon(size, f'icon-{size}x{size}.png')
        
    # Create additional specialized icons
    create_icon(96, 'icon-192.png')  # For basic reference
    create_icon(96, 'pomodoro-96x96.png')
    create_icon(96, 'timer-96x96.png')
    create_icon(96, 'multi-96x96.png')
    create_icon(96, 'cooking-96x96.png')
    create_icon(96, 'workout-96x96.png')
    
    print("All icons created successfully!")
    
except ImportError:
    print("PIL (Pillow) not installed. Creating simple HTML-based icons instead...")
    
    # Create basic HTML files that can be used as icon references
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        html_content = f'''<!DOCTYPE html>
<html>
<head><title>Timer Icon {size}x{size}</title></head>
<body style="margin:0;width:{size}px;height:{size}px;background:#2563eb;display:flex;align-items:center;justify-content:center;border-radius:50%;">
<div style="color:white;font-size:{size//4}px;font-weight:bold;">⏰</div>
</body>
</html>'''
        
        with open(f'icon-{size}x{size}.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    print("Created HTML-based icon templates. Consider installing Pillow for proper PNG icons.")
    print("Run: pip install Pillow")