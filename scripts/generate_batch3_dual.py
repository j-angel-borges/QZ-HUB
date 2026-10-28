import os
import sys
import time
import shutil
import vertexai
from vertexai.generative_models import GenerativeModel, Part

sys.stdout.reconfigure(encoding='utf-8')

# Using us-east4 for fresh quota
vertexai.init(project='gen-lang-client-0929068122', location='us-east4')
gen_model = GenerativeModel('gemini-2.5-flash-image')

PRODUCTS_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products'
OUTPUT_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\repertorio\sets_generados_final'

def load_ref(rel_path):
    full_path = os.path.join(PRODUCTS_DIR, rel_path)
    with open(full_path, 'rb') as f:
        return f.read()

ref_band = load_ref('smartbands/smartband_plastico_negro_frontal.png')
ref_ring_black = load_ref('smartrings/smartring_negro_frontal.png')
ref_tab = load_ref('smarttabs/smarttab_negro_frontal.png')
ref_sound = load_ref('smartsound/smartsound_negro_frontal.png')
ref_phone = load_ref('smartphones/smartphone_negro_trasero.png')
ref_watch = load_ref('smartwatches/smartwatch_negro_frontal.png')

def generate_scene(filename, prompt, ref_images, max_retries=3):
    out_path = os.path.join(OUTPUT_DIR, filename)
    print(f"\n==========================================")
    print(f"▶ Generando: {filename}")
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

BASE_SCALE_RULES = """
EXTREME SCALE & PROPORTION ENFORCEMENT (CALIBRATED REAL-WORLD SCALE):
- SMART TABS: 11-inch tablets placed in HORIZONTAL LANDSCAPE orientation on low minimalist wood stands side by side. Screens 100% powered off (pure black obsidian glass, no graphics).
- SMART SOUND (when present): Cylindrical acoustic speakers (~15 cm height x 9 cm diameter), dark fabric mesh, CNC aluminum top.
- SMART PHONES (when present): Titanium phones (~16 cm height) lying showing back with elongated vertical pill camera island containing exactly TWO large circular camera lenses.
- SMART WATCHES (when present): Circular 44mm watches with dark straps, completely clean standby dark faces.
- SMART BANDS: 100% SCREENLESS matte black silicone wearables with micro-ribbing and seamless sensor capsules (NO screens, NO displays). Sized for an adult human wrist (~6.5 cm loop), clearly substantial.
- SMART RINGS: Delicate, authentic human finger-sized HOLLOW jewelry rings (only ~18-20 mm outer diameter, thin ~2 mm band). They are TINY, standing upright or lying on the marble with visible circular openings showing the marble background through the center. NEVER make the rings large or bracelet-sized.
"""

# 1. Essential (Nuclear 2H) - 2 Tabs + 2 Bands + 2 Rings
p_nuclear2h_essential = f"""Commercial 3D studio photograph on wide polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY FOR TWO SIBLINGS (EXACTLY 6 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO Smart Tabs (Image 1) in HORIZONTAL LANDSCAPE side by side on low wooden easel stands, screens completely powered off.
2. LEFT: TWO DISTINCT Zentry Smart Bands (Image 2) lying flat side by side. 100% SCREENLESS matte black silicone trackers (NO screens).
3. RIGHT: EXACTLY TWO Zentry Smart Rings (Image 3). Both standing upright on the marble, TINY human finger-sized (~18-20 mm) HOLLOW rings with circular center openings.

Luxury clean keynote aesthetic, crisp focus, exactly 6 products.
"""

# 2. OMNI (Nuclear 2H) - 2 Tabs + 2 Bands + 2 Rings
p_nuclear2h_omni = f"""Commercial 3D studio photograph on wide polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 6 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO Smart Tabs (Image 1) in HORIZONTAL LANDSCAPE side by side on low wooden easel stands, screens completely powered off.
2. LEFT: TWO DISTINCT Zentry Smart Bands (Image 2) lying flat side by side. 100% SCREENLESS matte black silicone trackers (NO screens).
3. RIGHT: EXACTLY TWO Zentry Smart Rings (Image 3). Both standing upright on the marble, TINY human finger-sized (~18-20 mm) HOLLOW rings.

Symmetrical keynote quality, exactly 6 products.
"""

# 3. Integral (Nuclear 2H) - 2 Tabs + 2 Bands + 2 Rings + 2 Smart Sounds
p_nuclear2h_integral = f"""Commercial 3D studio photograph on wide polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 8 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO Smart Tabs (Image 1) in HORIZONTAL LANDSCAPE side by side on low wooden easel stands, screens completely powered off.
2. LEFT: TWO DISTINCT Zentry Smart Bands (Image 2) lying flat side by side. 100% SCREENLESS matte black silicone trackers (NO screens).
3. RIGHT: EXACTLY TWO Zentry Smart Rings (Image 3). Both standing upright on the marble, TINY human finger-sized (~18-20 mm) HOLLOW rings with circular center openings.
4. OUTER FLANKS: EXACTLY TWO Smart Sounds (Image 4). Two modern cylindrical acoustic speakers flanking the scene.

Flawless industrial aesthetics, cohesive contact shadows, exactly 8 products.
"""

# 4. Full House (Nuclear 2H) - 2 Tabs + 2 Bands + 2 Rings + 2 Sounds + 2 Watches + 2 Phones
p_nuclear2h_fullhouse = f"""Commercial 3D studio photograph of the ultimate flagship hardware ecosystem for siblings arranged harmoniously on an expansive polished white Carrara marble surface, white cyclorama studio background. Softbox 5600K.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 12 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO Smart Tabs (Image 1) in HORIZONTAL LANDSCAPE side by side on low wooden easels, screens powered off (black glass).
2. LEFT: TWO DISTINCT Smart Bands (Image 2). TWO separate 100% SCREENLESS matte black fitness tracking bands (NO screens).
3. RIGHT: EXACTLY TWO Smart Rings (Image 3). Both standing upright, perfectly HOLLOW TINY human finger-sized (~18-20 mm) rings.
4. FLANKS: EXACTLY TWO Smart Sounds (Image 4). Two cylindrical acoustic fabric speakers on outer sides.
5. FOREGROUND: EXACTLY TWO Smart Phones (Image 5). Two dark titanium smartphones resting diagonally showing their elongated vertical pill camera islands with EXACTLY TWO large circular lenses.
6. FOREGROUND: EXACTLY TWO Smart Watches (Image 6). Two classic circular titanium smartwatches with dark straps and clean dark standby faces.

Masterpiece flagship keynote composition, crisp focus across all items.
"""

print("\n--- INICIANDO LOTE 3 Y 4 (NUCLEAR 2H Y EXTENSA 2H) ---")

# 1. Essential
generate_scene('set_nuclear_2h_essential.png', p_nuclear2h_essential, [ref_tab, ref_band, ref_ring_black])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_2h_essential.png'), os.path.join(OUTPUT_DIR, 'set_extensa_2h_essential.png'))
time.sleep(8)

# 2. OMNI
generate_scene('set_nuclear_2h_omni.png', p_nuclear2h_omni, [ref_tab, ref_band, ref_ring_black])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_2h_omni.png'), os.path.join(OUTPUT_DIR, 'set_extensa_2h_omni.png'))
time.sleep(8)

# 3. Integral
generate_scene('set_nuclear_2h_integral.png', p_nuclear2h_integral, [ref_tab, ref_band, ref_ring_black, ref_sound])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_2h_integral.png'), os.path.join(OUTPUT_DIR, 'set_extensa_2h_integral.png'))
time.sleep(8)

# 4. Full House
generate_scene('set_nuclear_2h_fullhouse.png', p_nuclear2h_fullhouse, [ref_tab, ref_band, ref_ring_black, ref_sound, ref_phone, ref_watch])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_2h_fullhouse.png'), os.path.join(OUTPUT_DIR, 'set_extensa_2h_fullhouse.png'))
time.sleep(8)

print("\n--- LOTES 3 Y 4 COMPLETADOS EXITOSAMENTE ---")
