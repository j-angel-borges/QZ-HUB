import os
import sys
import time
import shutil
import vertexai
from vertexai.generative_models import GenerativeModel, Part

sys.stdout.reconfigure(encoding='utf-8')

# Using us-central1 for clean quota
vertexai.init(project='gen-lang-client-0929068122', location='us-central1')
gen_model = GenerativeModel('gemini-2.5-flash-image')

PRODUCTS_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products'
OUTPUT_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\repertorio\sets_generados_final_v2_blanco'

def load_ref(rel_path):
    full_path = os.path.join(PRODUCTS_DIR, rel_path)
    with open(full_path, 'rb') as f:
        return f.read()

ref_band_white = load_ref('smartbands/smartband_plastico_blanco_frontal.png')
ref_ring_white = load_ref('smartrings/smartring_blanco_frontal.png')
ref_tab_white = load_ref('smarttabs/smarttab_blanco_frontal.png')
ref_sound_white = load_ref('smartsound/smartsound_blanco_frontal.png')
ref_phone_white = load_ref('smartphones/smartphone_blanco_trasero.png')
ref_watch_white = load_ref('smartwatches/smartwatch_blanco_frontal.png')

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

CORE_WHITE_HERO_RULES = """
PHOTOGRAPHY STYLE & COMPOSITION (HERO PRODUCT FOCUS & DETAILED TEXTURES):
- SHOT TYPE: Tight commercial hero shot, close-up to medium-tight crop (NO tiny distant objects, NO massive empty borders). The products fill the lower two-thirds of the frame with razor-sharp macro clarity and tactile textures.
- ENVIRONMENT: Premium white Carrara marble surface with subtle, soft natural grey veining and crisp contact reflections. Clean high-key white studio background. Soft diffused 5600K keynote studio lighting.
- COLOR THEME: All devices are in the pristine ZENTRY WHITE / TITANIUM SILVER finish matching the reference images.

STRICT PRODUCT HARDWARE FIDELITY (WHITE EDITION):
- SMART TABS WHITE: 11-inch white bezel/silver aluminum frame tablets in HORIZONTAL LANDSCAPE orientation on low minimalist natural wood stands. Screens are 100% powered off (dark reflective glass in sleep mode).
- SMART BANDS WHITE: Matching reference image 1. 100% SCREENLESS fitness tracking wearables in arctic white/cream silicone with micro-ribbing, housing an ultra-slim seamless silver/matte-white sensor capsule (NO digital display, NO smartwatch screen, NO glass face). Adult wrist size (~6.5 cm loop).
- SMART RINGS WHITE/SILVER: Matching reference image 2. Authentic human finger-sized (~18-20 mm) HOLLOW silver/ceramic smart rings with circular open centers showing the marble background directly through the middle. Visible inner sensor contacts.
- SMART SOUND WHITE (when present): Cylindrical acoustic speaker wrapped in light pearl/ivory acoustic fabric mesh with a precision CNC-machined silver aluminum top ring.
- SMART PHONE WHITE (when present): Pristine white back glass smartphone with aerospace silver rails, showing rear elongated vertical pill camera island with EXACTLY TWO large circular camera lenses.
- SMART WATCH WHITE (when present): Circular 44mm silver watch case with clean arctic white fluoroelastomer strap and clean dark standby face.
"""

# 1. Essential (Extensa 1H) - 1 Tab + 1 Band + 2 Rings
p_v2_extensa_essential = f"""Commercial hero product photograph on white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 4 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE White Smart Tab (Image 3) in HORIZONTAL LANDSCAPE on a low wooden stand, screen off.
2. LEFT: EXACTLY ONE White Zentry Smart Band (Image 1) close to the tablet. 100% SCREENLESS white silicone band (NO screen).
3. RIGHT: EXACTLY TWO White/Silver Zentry Smart Rings (Image 2). Both standing upright on the marble, finger-sized HOLLOW rings with circular open centers.

Tight, crisp, premium keynote hero framing, exactly 4 products.
"""

# 2. OMNI (Extensa 1H) - 2 Tabs + 2 Bands + 2 Rings
p_v2_extensa_omni = f"""Commercial hero product photograph on wide white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 6 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO White Smart Tabs (Image 3) in HORIZONTAL LANDSCAPE side by side on low wooden stands, screens off.
2. LEFT: TWO DISTINCT White Zentry Smart Bands (Image 1) lying close to the tablets. 100% SCREENLESS white silicone bands (NO screens).
3. RIGHT: EXACTLY TWO White/Silver Zentry Smart Rings (Image 2). Finger-sized HOLLOW rings standing upright.

Tight, crisp, premium keynote hero framing, exactly 6 products.
"""

# 3. Integral (Extensa 1H) - 2 Tabs + 2 Bands + 2 Rings + 1 Smart Sound
p_v2_extensa_integral = f"""Commercial hero product photograph on wide white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 7 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO White Smart Tabs (Image 3) in HORIZONTAL LANDSCAPE side by side on low wooden stands, screens off.
2. LEFT: TWO DISTINCT White Zentry Smart Bands (Image 1). 100% SCREENLESS white silicone bands (NO screens).
3. RIGHT: EXACTLY TWO White/Silver Zentry Smart Rings (Image 2). Finger-sized HOLLOW rings.
4. FLANK: EXACTLY ONE White Smart Sound (Image 4). Cylindrical pearl fabric acoustic speaker with silver aluminum top ring.

Tight, crisp, premium keynote hero framing, exactly 7 products.
"""

# 4. Full House (Extensa 1H) - 2 Tabs + 2 Bands + 2 Rings + 1 Sound + 1 Watch + 1 Phone
p_v2_extensa_fullhouse = f"""Commercial hero product photograph on wide white Carrara marble. Close-up detailed composition, razor-sharp focus on materials and textures.
{CORE_WHITE_HERO_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 9 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO White Smart Tabs (Image 3) in HORIZONTAL LANDSCAPE side by side, screens off.
2. LEFT: TWO DISTINCT White Zentry Smart Bands (Image 1). 100% SCREENLESS white bands (NO screens).
3. RIGHT: EXACTLY TWO White/Silver Zentry Smart Rings (Image 2). Finger-sized HOLLOW rings.
4. FLANK: EXACTLY ONE White Smart Sound (Image 4). Cylindrical light mesh speaker.
5. FOREGROUND: EXACTLY ONE White Smart Phone (Image 5). White glass back with silver rails, showing elongated vertical pill camera island with EXACTLY TWO large circular lenses.
6. FOREGROUND: EXACTLY ONE White Smart Watch (Image 6). Circular silver watch with arctic white strap and clean dark standby face.

Masterpiece keynote hero framing, exactly 9 products.
"""

# 5. Portada Zentry Habitats (Lifestyle Escandinavo sobre Roble Natural)
p_v2_portada = """Warm, premium architectural lifestyle hero product photograph of a modern tech home sanctuary. Close-up on a beautiful natural fluted oak wooden table in an airy modern living room. Soft warm ambient sunlight.

CRITICAL HARDWARE SPECIFICATIONS & HERO CLOSE-UP FRAMING:
1. CENTER: EXACTLY ONE White Smart Tab (matching Image 3) in HORIZONTAL LANDSCAPE orientation on a low minimalist wood stand. Display completely dark in sleep mode.
2. LEFT: EXACTLY ONE White Smart Sound (matching Image 4). Cylindrical speaker wrapped in light pearl/ivory acoustic fabric with precision silver metallic top ring.
3. FOREGROUND RIGHT: EXACTLY ONE White Smart Watch (matching Image 6). Minimalist circular silver watch with clean arctic white strap, dark standby circular face.
4. FOREGROUND: EXACTLY ONE White/Silver Smart Ring (matching Image 2). Standing upright on the oak grain, a TINY, delicate human finger-sized (~18-20 mm) HOLLOW silver smart ring showing the table wood right through its circular center.
5. In the soft-focus background: A warm ceramic teacup and blurred hands of family members.

Cozy, calm, premium Scandinavian lifestyle feeling, 50mm f/2.8 depth of field.
"""

print("\n--- INICIANDO LOTE 2 V2 (EXTENSA 1H BLANCO + PORTADA HABITATS) ---")

# 1. Essential
generate_scene('set_extensa_1h_essential.png', p_v2_extensa_essential, [ref_band_white, ref_ring_white, ref_tab_white])
time.sleep(8)

# 2. OMNI
generate_scene('set_extensa_1h_omni.png', p_v2_extensa_omni, [ref_band_white, ref_ring_white, ref_tab_white])
time.sleep(8)

# 3. Integral
generate_scene('set_extensa_1h_integral.png', p_v2_extensa_integral, [ref_band_white, ref_ring_white, ref_tab_white, ref_sound_white])
time.sleep(8)

# 4. Full House
generate_scene('set_extensa_1h_fullhouse.png', p_v2_extensa_fullhouse, [ref_band_white, ref_ring_white, ref_tab_white, ref_sound_white, ref_phone_white, ref_watch_white])
time.sleep(8)

# 5. Portada
generate_scene('portada_extensa_1h.png', p_v2_portada, [ref_band_white, ref_ring_white, ref_tab_white, ref_sound_white, ref_watch_white])
time.sleep(8)

print("\n--- LOTE 2 V2 COMPLETADO EXITOSAMENTE ---")
