import os
import sys
import time
import shutil
import vertexai
from vertexai.generative_models import GenerativeModel, Part

sys.stdout.reconfigure(encoding='utf-8')

# Using us-central1
vertexai.init(project='gen-lang-client-0929068122', location='us-central1')
gen_model = GenerativeModel('gemini-2.5-flash-image')

PRODUCTS_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products'
OUTPUT_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\repertorio\sets_generados_final'

def load_ref(rel_path):
    full_path = os.path.join(PRODUCTS_DIR, rel_path)
    with open(full_path, 'rb') as f:
        return f.read()

ref_band = load_ref('smartbands/smartband_plastico_negro_frontal.png')
ref_ring_black = load_ref('smartrings/smartring_negro_frontal.png')
ref_ring_white = load_ref('smartrings/smartring_blanco_frontal.png')
ref_tab = load_ref('smarttabs/smarttab_negro_frontal.png')
ref_sound = load_ref('smartsound/smartsound_negro_frontal.png')
ref_sound_white = load_ref('smartsound/smartsound_blanco_frontal.png')
ref_phone = load_ref('smartphones/smartphone_negro_trasero.png')
ref_watch = load_ref('smartwatches/smartwatch_negro_frontal.png')
ref_watch_white = load_ref('smartwatches/smartwatch_blanco_frontal.png')

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
- SMART TABS: 11-inch tablets placed in HORIZONTAL LANDSCAPE orientation on low minimalist wood stands. Screens 100% powered off (pure black obsidian glass, no graphics).
- SMART SOUND (when present): Cylindrical acoustic speaker (~15 cm height x 9 cm diameter), dark fabric mesh, CNC aluminum top.
- SMART PHONE (when present): Titanium phone (~16 cm height) lying showing back with elongated vertical pill camera island containing exactly TWO large circular camera lenses.
- SMART WATCH (when present): Circular 44mm watch with dark strap, completely clean standby dark face.
- SMART BANDS: 100% SCREENLESS matte black silicone wearables with micro-ribbing and seamless sensor capsules (NO screens, NO displays). Sized for an adult human wrist (~6.5 cm loop), clearly substantial.
- SMART RINGS: Delicate, authentic human finger-sized HOLLOW jewelry rings (only ~18-20 mm outer diameter, thin ~2 mm band). They are TINY, standing upright or lying on the marble with visible circular openings showing the marble background through the center. NEVER make the rings large or bracelet-sized.
"""

# 1. Essential (Extensa 1H) - 1 Tab + 1 Band + 2 Rings
p_extensa_essential = f"""Commercial 3D studio photograph on polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 4 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE Smart Tab (matching Image 1) in HORIZONTAL LANDSCAPE on low wooden easel stand, screen completely powered off.
2. LEFT: EXACTLY ONE Zentry Smart Band (matching Image 2). 100% SCREENLESS matte black silicone tracker (NO screen). Adult wrist scale.
3. RIGHT: EXACTLY TWO Zentry Smart Rings (one black matching Image 3, one white/silver matching Image 4). Both standing upright on the marble, TINY human finger-sized HOLLOW rings with circular center openings.

Luxury clean keynote aesthetic, crisp focus, exactly 4 products.
"""

# 2. OMNI (Extensa 1H) - 2 Tabs + 2 Bands + 2 Rings
p_extensa_omni = f"""Commercial 3D studio photograph on wide polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 6 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO Smart Tabs (Image 1) in HORIZONTAL LANDSCAPE side by side on low wooden easel stands, screens completely powered off.
2. LEFT: TWO DISTINCT Zentry Smart Bands (Image 2) lying flat side by side. 100% SCREENLESS matte black silicone trackers (NO screens).
3. RIGHT: EXACTLY TWO Zentry Smart Rings (Image 3). Both standing upright on the marble, TINY human finger-sized HOLLOW rings with circular center openings.

Luxury clean keynote aesthetic, crisp focus, exactly 6 products.
"""

# 3. Integral (Extensa 1H) - 2 Tabs + 2 Bands + 2 Rings + 1 Smart Sound
p_extensa_integral = f"""Commercial 3D studio photograph on wide polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 7 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO Smart Tabs (Image 1) in HORIZONTAL LANDSCAPE side by side on low wooden easel stands, screens completely powered off.
2. LEFT: TWO DISTINCT Zentry Smart Bands (Image 2) lying flat side by side. 100% SCREENLESS matte black silicone trackers (NO screens).
3. RIGHT: EXACTLY TWO Zentry Smart Rings (Image 3). Both standing upright on the marble, TINY human finger-sized HOLLOW rings with circular center openings.
4. FLANK: EXACTLY ONE Smart Sound (Image 4). Cylindrical acoustic mesh speaker with aluminum top ring.

Luxury clean keynote aesthetic, crisp focus, exactly 7 products.
"""

# 4. Full House (Extensa 1H) - 2 Tabs + 2 Bands + 2 Rings + 1 Sound + 1 Watch + 1 Phone
p_extensa_fullhouse = f"""Commercial 3D studio photograph on wide polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 9 PRODUCTS TOTAL):
1. CENTER: EXACTLY TWO Smart Tabs (Image 1) in HORIZONTAL LANDSCAPE side by side on low wooden easel stands, screens completely powered off.
2. LEFT: TWO DISTINCT Zentry Smart Bands (Image 2) lying flat. 100% SCREENLESS matte black silicone trackers (NO screens).
3. RIGHT: EXACTLY TWO Zentry Smart Rings (Image 3). Both standing upright, TINY human finger-sized HOLLOW rings.
4. FLANK: EXACTLY ONE Smart Sound (Image 4). Cylindrical fabric mesh speaker.
5. FOREGROUND: EXACTLY ONE Smart Phone (Image 5). Dark titanium phone showing rear elongated vertical pill camera island with EXACTLY TWO large circular lenses.
6. FOREGROUND: EXACTLY ONE Smart Watch (Image 6). Circular titanium smartwatch with dark strap and completely clean standby face.

Masterpiece flagship keynote composition, exactly 9 products.
"""

# 5. Portada Habitats (Lifestyle Escandinavo sobre Roble Natural)
p_extensa_portada = """Warm, premium architectural lifestyle product photograph of a modern tech home sanctuary. Close-up on a beautiful natural fluted oak wooden table in an airy modern living room. Soft warm ambient sunlight.

CRITICAL HARDWARE SPECIFICATIONS & SPATIAL SCALES:
1. CENTER / MIDGROUND: EXACTLY ONE Smart Tab (matching Image 1) placed in HORIZONTAL LANDSCAPE orientation on a low minimalist wood stand. Display completely dark in sleep mode.
2. LEFT: EXACTLY ONE Smart Sound (matching Image 4). Cylindrical speaker wrapped in light beige acoustic fabric with a precision metallic top ring.
3. FOREGROUND RIGHT: EXACTLY ONE Smart Watch (matching Image 6). Minimalist circular smartwatch with clean white strap resting on the oak wood, with its circular screen COMPLETELY POWERED OFF (deep dark reflective glass, ZERO numbers, ZERO graphics, 100% dark standby face).
4. FOREGROUND: EXACTLY ONE Smart Ring (matching Image 3). Standing upright on the wood grain, a TINY, delicate human finger-sized (~18-20 mm) HOLLOW metallic smart ring showing the table wood right through its circular center.
5. In the soft-focus background: A warm ceramic teacup and blurred hands of family members.

Cozy, calm, premium Scandinavian lifestyle feeling, 50mm f/2.8 depth of field.
"""

print("\n--- INICIANDO LOTE 2 (EXTENSA 1H + PORTADA HABITATS) ---")

# 1. Essential
generate_scene('set_extensa_1h_essential.png', p_extensa_essential, [ref_tab, ref_band, ref_ring_black, ref_ring_white])
time.sleep(8)

# 2. OMNI
generate_scene('set_extensa_1h_omni.png', p_extensa_omni, [ref_tab, ref_band, ref_ring_black])
time.sleep(8)

# 3. Integral
generate_scene('set_extensa_1h_integral.png', p_extensa_integral, [ref_tab, ref_band, ref_ring_black, ref_sound])
time.sleep(8)

# 4. Full House
generate_scene('set_extensa_1h_fullhouse.png', p_extensa_fullhouse, [ref_tab, ref_band, ref_ring_black, ref_sound, ref_phone, ref_watch])
time.sleep(8)

# 5. Portada Habitats
generate_scene('portada_extensa_1h.png', p_extensa_portada, [ref_tab, ref_band, ref_ring_white, ref_sound_white, ref_watch_white])
time.sleep(8)

print("\n--- LOTE 2 COMPLETADO EXITOSAMENTE ---")
