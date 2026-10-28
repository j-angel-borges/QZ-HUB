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
OUTPUT_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\repertorio\sets_generados_final'
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

print("Referencias de stock cargadas correctamente.")

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
            print("Aviso: Respuesta sin datos de imagen binaria.")
        except Exception as e:
            print(f"Error en intento {attempt+1}: {e}")
            time.sleep(12)
    return False

# BASE SPATIAL RULES (PROBADA Y AUDITADA EN V3):
BASE_SCALE_RULES = """
EXTREME SCALE & PROPORTION ENFORCEMENT (CALIBRATED REAL-WORLD SCALE):
- SMART TAB: 11-inch tablet in HORIZONTAL LANDSCAPE orientation on a low minimalist natural wood stand. Screen 100% powered off (pure black obsidian glass, no graphics). Largest device in frame.
- SMART SOUND (when present): Cylindrical acoustic speaker (~15 cm height x 9 cm diameter), dark fabric mesh, CNC aluminum top.
- SMART PHONE (when present): Titanium phone (~16 cm height) lying showing back with elongated vertical pill camera island containing exactly TWO large circular camera lenses.
- SMART WATCH (when present): Circular 44mm watch with dark strap, completely clean standby dark face.
- SMART BAND: 100% SCREENLESS matte black silicone wearable with micro-ribbing and seamless sensor capsule (NO screen, NO glass, NO display). Sized for an adult human wrist (~6.5 cm loop), clearly substantial.
- SMART RINGS: Delicate, authentic human finger-sized HOLLOW jewelry rings (only ~18-20 mm outer diameter, thin ~2 mm band). They are TINY, standing upright or lying on the marble with visible circular openings showing the marble background through the center. NEVER make the rings large or bracelet-sized.
"""

# -------------------------------------------------------------
# 1. SET NUCLEAR 1H: OMNI
# 1 Tab Horizontal + 1 Band Screenless + 2 Rings Tiny (1 black, 1 white/silver)
# -------------------------------------------------------------
p_nuclear_omni = f"""Commercial 3D studio photograph on polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 4 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE Smart Tab (matching Image 1) in HORIZONTAL LANDSCAPE on low wooden easel stand, screen completely powered off.
2. LEFT: EXACTLY ONE Zentry Smart Band (matching Image 2). 100% SCREENLESS matte black silicone tracker (NO screen). Adult wrist scale.
3. RIGHT: EXACTLY TWO Zentry Smart Rings (one black matching Image 3, one white/silver matching Image 4). Both standing upright on the marble, TINY human finger-sized HOLLOW rings with circular center openings.

Luxury clean keynote aesthetic, crisp focus, exactly 4 products.
"""

# -------------------------------------------------------------
# 2. SET NUCLEAR 1H: INTEGRAL
# 1 Tab Horizontal + 1 Band Screenless + 2 Rings Tiny + 1 Smart Sound
# -------------------------------------------------------------
p_nuclear_integral = f"""Commercial 3D studio photograph on polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 5 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE Smart Tab (matching Image 1) in HORIZONTAL LANDSCAPE on low wooden easel stand, screen completely powered off.
2. LEFT: EXACTLY ONE Zentry Smart Band (matching Image 2). 100% SCREENLESS matte black silicone tracker (NO screen). Adult wrist scale.
3. RIGHT: EXACTLY TWO Zentry Smart Rings (matching Image 3). Both standing upright on the marble, TINY human finger-sized HOLLOW rings with circular center openings.
4. FAR RIGHT / FLANK: EXACTLY ONE Smart Sound (matching Image 4). Cylindrical acoustic mesh speaker with precision aluminum top.

Balanced luxury keynote composition, exactly 5 products.
"""

# -------------------------------------------------------------
# 3. SET NUCLEAR 1H: FULL HOUSE
# 1 Tab Horizontal + 1 Band Screenless + 2 Rings Tiny + 1 Sound + 1 Watch + 1 Phone
# -------------------------------------------------------------
p_nuclear_fullhouse = f"""Commercial 3D studio photograph on wide polished white Carrara marble with subtle reflections, seamless white studio cyclorama background. 85mm lens at f/8, softbox 5600K lighting.
{BASE_SCALE_RULES}

EXACT HARDWARE INVENTORY (EXACTLY 7 PRODUCTS TOTAL):
1. CENTER: EXACTLY ONE Smart Tab (Image 1) in HORIZONTAL LANDSCAPE on low wooden easel stand, screen completely powered off.
2. LEFT: EXACTLY ONE Zentry Smart Band (Image 2). 100% SCREENLESS matte black silicone tracker (NO screen). Adult wrist scale.
3. FOREGROUND RIGHT: EXACTLY TWO Zentry Smart Rings (Image 3). Standing upright on the marble, TINY human finger-sized HOLLOW rings with circular center openings.
4. FLANK: EXACTLY ONE Smart Sound (Image 4). Cylindrical fabric mesh speaker.
5. FOREGROUND: EXACTLY ONE Smart Phone (Image 5). Dark titanium phone lying showing rear elongated vertical pill camera island with EXACTLY TWO large circular lenses.
6. FOREGROUND: EXACTLY ONE Smart Watch (Image 6). Circular titanium smartwatch with dark strap and completely clean standby face.

Masterpiece flagship keynote composition, exactly 7 products.
"""

print("\n--- INICIANDO LOTE 1 (NUCLEAR 1H RESTANTE) ---")

# OMNI
generate_scene('set_nuclear_1h_omni.png', p_nuclear_omni, [ref_tab, ref_band, ref_ring_black, ref_ring_white])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_1h_omni.png'), os.path.join(OUTPUT_DIR, 'set_omni.png'))
time.sleep(6)

# INTEGRAL
generate_scene('set_nuclear_1h_integral.png', p_nuclear_integral, [ref_tab, ref_band, ref_ring_black, ref_sound])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_1h_integral.png'), os.path.join(OUTPUT_DIR, 'set_integral.png'))
time.sleep(6)

# FULL HOUSE
generate_scene('set_nuclear_1h_fullhouse.png', p_nuclear_fullhouse, [ref_tab, ref_band, ref_ring_black, ref_sound, ref_phone, ref_watch])
shutil.copy2(os.path.join(OUTPUT_DIR, 'set_nuclear_1h_fullhouse.png'), os.path.join(OUTPUT_DIR, 'set_fullhouse.png'))
time.sleep(6)

print("\n--- LOTE 1 COMPLETADO EXITOSAMENTE ---")
