import os
import sys
import time
import shutil
import vertexai
from vertexai.generative_models import GenerativeModel, Part

sys.stdout.reconfigure(encoding='utf-8')

# Vertex AI us-east4
vertexai.init(project='gen-lang-client-0929068122', location='us-east4')
gen_model = GenerativeModel('gemini-2.5-flash-image')

PRODUCTS_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products'
OUTPUT_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\repertorio\sets_generados_final_v2_blanco'
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_ref(rel_path):
    full_path = os.path.join(PRODUCTS_DIR, rel_path)
    with open(full_path, 'rb') as f:
        return f.read()

# RECURSOS OFICIALES EN VERSIÓN BLANCA (WHITE / SILVER TITANIUM)
ref_band_white = load_ref('smartbands/smartband_plastico_blanco_frontal.png')
ref_ring_white = load_ref('smartrings/smartring_blanco_frontal.png')
ref_tab_white = load_ref('smarttabs/smarttab_blanco_frontal.png')
ref_sound_white = load_ref('smartsound/smartsound_blanco_frontal.png')
ref_phone_white = load_ref('smartphones/smartphone_blanco_trasero.png')
ref_watch_white = load_ref('smartwatches/smartwatch_blanco_frontal.png')

print("Referencias de stock en blanco/silver cargadas correctamente.")

def generate_scene(filename, prompt, ref_images, max_retries=3):
    out_path = os.path.join(OUTPUT_DIR, filename)
    print(f"\n==========================================")
    print(f"▶ Generando V2 Blanco: {filename}")
    print(f"==========================================")
    
    parts = []
    for img_bytes in ref_images:
        parts.append(Part.from_data(data=img_bytes, mime_type='image/png'))
    parts.append(prompt)
    
    for attempt in range(max_retries):
        try:
            print(f"Intento {attempt+1}...")
            res = gen_model.generate_content(parts)
            for p in res.candidates[0].content.parts:
                if p.inline_data:
                    with open(out_path, 'wb') as f:
                        f.write(p.inline_data.data)
                    print(f"✓ Guardado exitoso: {out_path} ({os.path.getsize(out_path)} bytes)")
                    return True
            print("Aviso: Sin imagen en respuesta.")
        except Exception as e:
            print(f"Error en intento {attempt+1}: {e}")
            time.sleep(15)
    return False

# MACRO / CLOSE-UP RULES (PRIORIZANDO DETALLE Y FIDELIDAD AL STOCK BLANCO):
CORE_WHITE_HERO_RULES = """
PHOTOGRAPHY STYLE & COMPOSITION (HERO PRODUCT FOCUS & DETAILED TEXTURES):
- SHOT TYPE: Tight commercial hero shot, close-up to medium-tight crop (NO tiny distant objects, NO massive empty borders). The products fill the lower two-thirds of the frame with razor-sharp macro clarity and tactile textures.
- ENVIRONMENT: Premium white Carrara marble surface with subtle, soft natural grey veining and crisp contact reflections. Clean high-key white studio background. Soft diffused 5600K keynote studio lighting.
- COLOR THEME: All devices are in the pristine ZENTRY WHITE / TITANIUM SILVER finish matching the reference images.

STRICT PRODUCT HARDWARE FIDELITY (WHITE EDITION):
- SMART TAB WHITE: 11-inch white bezel/silver aluminum frame tablet in HORIZONTAL LANDSCAPE orientation on a low minimalist natural wood easel stand. Screen is 100% powered off (dark reflective glass in sleep mode).
- SMART BAND WHITE: Matching reference image 1. 100% SCREENLESS fitness tracking wearable in arctic white/cream silicone with micro-ribbing, housing an ultra-slim seamless silver/matte-white sensor capsule (NO digital display, NO smartwatch screen, NO glass face). Adult wrist size (~6.5 cm loop).
- SMART RINGS WHITE/SILVER: Matching reference image 2. Authentic human finger-sized (~18-20 mm) HOLLOW silver/ceramic smart rings with circular open centers showing the marble background directly through the middle. Visible inner sensor contacts.
- SMART SOUND WHITE (when present): Cylindrical acoustic speaker wrapped in light pearl/ivory acoustic fabric mesh with a precision CNC-machined silver aluminum top ring.
- SMART PHONE WHITE (when present): Pristine white back glass smartphone with aerospace silver rails, showing rear elongated vertical pill camera island with EXACTLY TWO large circular camera lenses.
- SMART WATCH WHITE (when present): Circular 44mm silver watch case with clean arctic white fluoroelastomer strap and clean dark standby face.
"""

# --------------------------------------------------------------------------
# 1. Essential Set (Nuclear 1H)
# 1 White Tab Horizontal + 1 White Band Screenless + 1 White Ring Hollow
# --------------------------------------------------------------------------
p_v2_essential = f"""Commercial hero product photograph on white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 3 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE White Smart Tab (Image 3) in HORIZONTAL LANDSCAPE on a low wooden stand, screen off.
2. LEFT: EXACTLY ONE White Zentry Smart Band (Image 1) close to the tablet. 100% SCREENLESS white silicone band with seamless sensor capsule (NO screen).
3. RIGHT: EXACTLY ONE White/Silver Zentry Smart Ring (Image 2) standing upright on the marble, finger-sized HOLLOW ring with open circular center.

Tight, crisp, premium keynote hero framing, exactly 3 products.
"""

# --------------------------------------------------------------------------
# 2. OMNI Set (Nuclear 1H)
# 1 White Tab Horizontal + 1 White Band Screenless + 2 White/Silver Rings Hollow
# --------------------------------------------------------------------------
p_v2_omni = f"""Commercial hero product photograph on white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 4 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE White Smart Tab (Image 3) in HORIZONTAL LANDSCAPE on a low wooden stand, screen off.
2. LEFT: EXACTLY ONE White Zentry Smart Band (Image 1) close to the tablet. 100% SCREENLESS white silicone band (NO screen).
3. RIGHT: EXACTLY TWO White/Silver Zentry Smart Rings (Image 2). Both standing upright on the marble, finger-sized HOLLOW rings with circular open centers.

Tight, crisp, premium keynote hero framing, exactly 4 products.
"""

# --------------------------------------------------------------------------
# 3. Integral Set (Nuclear 1H)
# 1 White Tab Horizontal + 1 White Band Screenless + 2 White Rings + 1 White Smart Sound
# --------------------------------------------------------------------------
p_v2_integral = f"""Commercial hero product photograph on white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 5 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE White Smart Tab (Image 3) in HORIZONTAL LANDSCAPE on a low wooden stand, screen off.
2. LEFT: EXACTLY ONE White Zentry Smart Band (Image 1) close to the tablet. 100% SCREENLESS white silicone band (NO screen).
3. RIGHT: EXACTLY TWO White/Silver Zentry Smart Rings (Image 2). Finger-sized HOLLOW rings.
4. RIGHT FLANK: EXACTLY ONE White Smart Sound (Image 4). Cylindrical light acoustic mesh speaker with CNC silver top ring.

Tight, crisp, premium keynote hero framing, exactly 5 products.
"""

# --------------------------------------------------------------------------
# 4. Full House Set (Nuclear 1H)
# 1 Tab + 1 Band + 2 Rings + 1 Sound + 1 Watch + 1 Phone (All White/Silver)
# --------------------------------------------------------------------------
p_v2_fullhouse = f"""Commercial hero product photograph on white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 7 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE White Smart Tab (Image 3) in HORIZONTAL LANDSCAPE on low wooden stand, screen off.
2. LEFT: EXACTLY ONE White Zentry Smart Band (Image 1). 100% SCREENLESS white band (NO screen).
3. FOREGROUND RIGHT: EXACTLY TWO White/Silver Zentry Smart Rings (Image 2). Standing upright, finger-sized HOLLOW rings.
4. FLANK: EXACTLY ONE White Smart Sound (Image 4). Cylindrical light mesh speaker.
5. FOREGROUND: EXACTLY ONE White Smart Phone (Image 5). White glass back with silver rails, showing elongated vertical pill camera island with EXACTLY TWO large circular lenses.
6. FOREGROUND: EXACTLY ONE White Smart Watch (Image 6). Circular silver watch with arctic white strap and clean dark standby face.

Tight, crisp, premium keynote flagship hero framing, exactly 7 products.
"""

print("\n--- INICIANDO GENERACIÓN LOTE 1 V2 (NUCLEAR 1H BLANCO) ---")

# 1. Essential
generate_scene('set_nuclear_1h_essential.png', p_v2_essential, [ref_band_white, ref_ring_white, ref_tab_white])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_1h_essential.png'), os.path.join(OUTPUT_DIR, 'set_essential.png'))
time.sleep(8)

# 2. OMNI
generate_scene('set_nuclear_1h_omni.png', p_v2_omni, [ref_band_white, ref_ring_white, ref_tab_white])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_1h_omni.png'), os.path.join(OUTPUT_DIR, 'set_omni.png'))
time.sleep(8)

# 3. Integral
generate_scene('set_nuclear_1h_integral.png', p_v2_integral, [ref_band_white, ref_ring_white, ref_tab_white, ref_sound_white])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_1h_integral.png'), os.path.join(OUTPUT_DIR, 'set_integral.png'))
time.sleep(8)

# 4. Full House
generate_scene('set_nuclear_1h_fullhouse.png', p_v2_fullhouse, [ref_band_white, ref_ring_white, ref_tab_white, ref_sound_white, ref_phone_white, ref_watch_white])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_1h_fullhouse.png'), os.path.join(OUTPUT_DIR, 'set_fullhouse.png'))
time.sleep(8)

print("\n--- LOTE 1 V2 COMPLETADO EXITOSAMENTE ---")
