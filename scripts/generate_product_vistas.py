import os
import sys
import time
from google import genai
from PIL import Image

PROJECT_ID = 'gen-lang-client-0929068122'
MODEL_ID = 'gemini-2.5-flash-image'
LOCATIONS = ['us-east4', 'us-central1']

def generate_with_retry(contents, output_path, max_attempts=5):
    dir_salida = os.path.dirname(os.path.abspath(output_path))
    if dir_salida:
        os.makedirs(dir_salida, exist_ok=True)
        
    for attempt in range(max_attempts):
        loc = LOCATIONS[attempt % len(LOCATIONS)]
        try:
            print(f'[{attempt+1}/{max_attempts}] Conectando a Vertex AI en {loc}...')
            client = genai.Client(vertexai=True, project=PROJECT_ID, location=loc)
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=contents
            )
            
            if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if getattr(part, 'inline_data', None) and part.inline_data.data:
                        with open(output_path, 'wb') as f:
                            f.write(part.inline_data.data)
                        print(f'-> Exito! Guardado en: {output_path}')
                        return True
                    elif getattr(part, 'text', None):
                        print(f'Texto del modelo: {part.text[:120]}')
            print('No se encontro imagen binaria en la respuesta.')
        except Exception as e:
            print(f'Error ({loc}): {e}')
            if '429' in str(e) or 'ResourceExhausted' in str(e):
                wait_t = 15 + attempt * 5
                print(f'Cuota excedida. Esperando {wait_t}s...')
                time.sleep(wait_t)
            else:
                time.sleep(5)
    return False

def load_image_ref(image_path):
    if not os.path.exists(image_path):
        print(f'Alerta: No se encontro la imagen de referencia {image_path}')
        return None
    try:
        return Image.open(image_path)
    except Exception as e:
        print(f'Error abriendo imagen: {e}')
        return None

BASE_DIR = r'D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products'

VISTAS_CONFIG = [
    # SMARTBANDS (Completar vistas faltantes)
    {
        'output': os.path.join(BASE_DIR, 'smartbands', 'vistas', 'smartband_blanco_perfil_lateral.png'),
        'ref': os.path.join(BASE_DIR, 'smartbands', 'smartband_plastico_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a modern screenless smartband health tracker, white matte silicone band, side profile view (perfil lateral), showing the slim ergonomic curve and pure cylindrical curvature of the band, 100% screenless top surface with zero display, pure solid white seamless background, studio softbox lighting, 8k resolution, razor-sharp edge definition.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartbands', 'vistas', 'smartband_blanco_angulo_cenital.png'),
        'ref': os.path.join(BASE_DIR, 'smartbands', 'smartband_plastico_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a modern screenless smartband health tracker, white matte silicone band, direct top-down overhead flat-lay view (cenital 90 degrees), showing the clean elongated oval form with 100% screenless surface, completely blank matte sensor face with zero display and zero screen, pure solid white background, minimal luxury industrial design, crisp 8k render.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartbands', 'vistas', 'smartband_negro_perspectiva_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smartbands', 'smartband_plastico_negro_frontal.png'),
        'prompt': 'Commercial studio product photography of a premium screenless smartband health tracker, matte obsidian black silicone strap, standing in dynamic 3D three-quarters perspective view, completely screenless blank top capsule with no display, pure solid white background, studio rim lighting, luxury industrial aesthetic, razor sharp 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartbands', 'vistas', 'smartband_negro_acostado_mesa.png'),
        'ref': os.path.join(BASE_DIR, 'smartbands', 'smartband_plastico_negro_frontal.png'),
        'prompt': 'Commercial studio product photography of a screenless smartband health tracker, matte obsidian black finish, resting flat horizontally on a studio tabletop, horizontal orientation, 100% screenless seamless pebble top, pure white background, subtle realistic ground contact shadow, clean 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartbands', 'vistas', 'smartband_negro_detalle_capsula.png'),
        'ref': os.path.join(BASE_DIR, 'smartbands', 'smartband_plastico_negro_frontal.png'),
        'prompt': 'Extreme macro close-up hero shot of the central sensor capsule of a screenless obsidian black smartband, highlighting the sleek matte texture, satin curve with zero screen, zero display, pure solid white seamless background, exquisite studio macro optics, 8k resolution.'
    },

    # SMARTRINGS (Blanco y Negro)
    {
        'output': os.path.join(BASE_DIR, 'smartrings', 'vistas', 'smartring_blanco_perspectiva_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smartrings', 'smartring_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a luxury minimalist smart ring, pristine ceramic white exterior with polished titanium inner band, hollow circular wearable ring with open see-through center hole, standing upright at a dynamic 45-degree angle in 3D perspective, resting on a pure solid white studio surface, soft studio lighting, sharp reflections, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartrings', 'vistas', 'smartring_blanco_acostado_mesa.png'),
        'ref': os.path.join(BASE_DIR, 'smartrings', 'smartring_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a luxury minimalist smart ring, pure ceramic white finish, resting flat horizontally on a white studio tabletop, showing the circular hollow aperture and smooth curved edge, pure solid white background, subtle natural contact shadow, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartrings', 'vistas', 'smartring_blanco_perfil_lateral.png'),
        'ref': os.path.join(BASE_DIR, 'smartrings', 'smartring_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a luxury smart ring, ceramic white band, direct side profile view, showcasing the slim 2.5mm thickness, bevelled edges and micro bio-sensor dome interior, pure solid white seamless background, studio lighting, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartrings', 'vistas', 'smartring_blanco_angulo_cenital.png'),
        'ref': os.path.join(BASE_DIR, 'smartrings', 'smartring_blanco_frontal.png'),
        'prompt': 'Top-down overhead 90-degree flat-lay photography of a smart ring, white ceramic, perfectly round hollow ring lying flat, see-through circular opening in the center, pure solid white background, symmetrical luxury composition, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartrings', 'vistas', 'smartring_blanco_detalle_macro.png'),
        'ref': os.path.join(BASE_DIR, 'smartrings', 'smartring_blanco_frontal.png'),
        'prompt': 'Extreme macro close-up studio shot of a white ceramic smart ring, focusing on the inner titanium sensor nodes and mirror-smooth ceramic surface, pure solid white studio background, high-end jewelry commercial look, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartrings', 'vistas', 'smartring_negro_perspectiva_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smartrings', 'smartring_negro_frontal.png'),
        'prompt': 'Commercial studio product photography of a sleek smart ring, matte brushed black titanium finish, hollow ring with open center hole, standing upright at a 45-degree angle in 3D perspective, pure solid white seamless background, dramatic studio rim light, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartrings', 'vistas', 'smartring_negro_acostado_mesa.png'),
        'ref': os.path.join(BASE_DIR, 'smartrings', 'smartring_negro_frontal.png'),
        'prompt': 'Commercial studio product photography of a sleek matte black titanium smart ring, lying flat horizontally on a studio tabletop, hollow center, pure solid white background, realistic soft contact shadow, 8k.'
    },

    # SMARTTABS (Blanco)
    {
        'output': os.path.join(BASE_DIR, 'smarttabs', 'vistas', 'smarttab_blanco_horizontal_atril.png'),
        'ref': os.path.join(BASE_DIR, 'smarttabs', 'smarttab_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of an ultra-thin modern tablet, matte aluminum white silver finish, oriented horizontally (landscape orientation), propped up gracefully at an elegant 60-degree angle, blank clean glass front with symmetrical ultra-thin bezels, pure solid white background, crisp studio softbox lighting, 8k resolution.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smarttabs', 'vistas', 'smarttab_blanco_acostado_mesa.png'),
        'ref': os.path.join(BASE_DIR, 'smarttabs', 'smarttab_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of an ultra-thin white silver tablet, resting completely flat horizontally on a white studio surface, showing the premium matte white finish and flush rear camera module, pure solid white background, subtle contact shadow, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smarttabs', 'vistas', 'smarttab_blanco_perspectiva_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smarttabs', 'smarttab_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a modern white silver tablet in landscape horizontal orientation, dynamic three-quarters 3D isometric perspective, showing both the front slim bezel glass and sleek metal side edges, pure solid white background, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smarttabs', 'vistas', 'smarttab_blanco_perfil_lateral.png'),
        'ref': os.path.join(BASE_DIR, 'smarttabs', 'smarttab_blanco_frontal.png'),
        'prompt': 'Side profile view of an ultra-thin 5.5mm white silver tablet, pure solid white seamless background, studio lighting highlighting CNC machined flat edges, USB-C port and speaker grilles, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smarttabs', 'vistas', 'smarttab_blanco_trasera_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smarttabs', 'smarttab_blanco_trasero.png'),
        'prompt': 'Commercial studio photography of the rear back panel of a white silver tablet, horizontal landscape orientation, matte sandblasted metal texture, subtle centered minimalist logo, corner camera pill, pure solid white background, 8k.'
    },

    # SMARTSOUND (Blanco)
    {
        'output': os.path.join(BASE_DIR, 'smartsound', 'vistas', 'smartsound_blanco_perspectiva_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smartsound', 'smartsound_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a premium cylindrical smart speaker, textured white acoustic fabric body with circular chamfered aluminum top ring, standing upright in 3D three-quarters perspective, pure solid white background, studio soft lighting, sharp texture detail, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartsound', 'vistas', 'smartsound_blanco_acostado_mesa.png'),
        'ref': os.path.join(BASE_DIR, 'smartsound', 'smartsound_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of the white acoustic smart speaker, standing solidly on a studio tabletop, eye-level heroic angle, pure solid white background, natural contact shadow, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartsound', 'vistas', 'smartsound_blanco_angulo_cenital.png'),
        'ref': os.path.join(BASE_DIR, 'smartsound', 'smartsound_blanco_frontal.png'),
        'prompt': 'Direct top-down overhead 90-degree view of the smart speaker, showing the circular brushed aluminum top ring and subtle touch controls, pure solid white background, pristine industrial design, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartsound', 'vistas', 'smartsound_blanco_detalle_textura.png'),
        'ref': os.path.join(BASE_DIR, 'smartsound', 'smartsound_blanco_frontal.png'),
        'prompt': 'Extreme macro close-up of the acoustic woven textile fabric of the white smart speaker and the seamless brushed metal interface ring, pure solid white background, high fidelity 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartsound', 'vistas', 'smartsound_blanco_perfil_lateral.png'),
        'ref': os.path.join(BASE_DIR, 'smartsound', 'smartsound_blanco_frontal.png'),
        'prompt': 'Direct side profile view of the cylindrical white smart speaker, perfectly vertical silhouette, acoustic fabric texture, pure solid white background, 8k.'
    },

    # SMARTPHONES (Blanco)
    {
        'output': os.path.join(BASE_DIR, 'smartphones', 'vistas', 'smartphone_blanco_trasera_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smartphones', 'smartphone_blanco_trasero.png'),
        'prompt': 'Commercial studio product photography of a flagship smartphone, pure ceramic white matte glass back, vertical pill-shaped camera island with exactly two camera lenses, standing upright at a 3D three-quarters angle, pure solid white background, studio lighting with elegant specular highlights, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartphones', 'vistas', 'smartphone_blanco_acostado_mesa.png'),
        'ref': os.path.join(BASE_DIR, 'smartphones', 'smartphone_blanco_trasero.png'),
        'prompt': 'Commercial studio product photography of a ceramic white flagship smartphone, resting horizontally flat on a white studio tabletop, showing the back panel and vertical dual-lens pill camera, pure solid white background, realistic contact shadow, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartphones', 'vistas', 'smartphone_blanco_perspectiva_frontal_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smartphones', 'smartphone_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of the front of a flagship smartphone, ultra-narrow symmetrical bezels, clean blank screen, 3D dynamic perspective, flat metal polished frame, pure solid white background, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartphones', 'vistas', 'smartphone_blanco_perfil_lateral.png'),
        'ref': os.path.join(BASE_DIR, 'smartphones', 'smartphone_blanco_frontal.png'),
        'prompt': 'Slim side profile view of a ceramic white flagship smartphone, showing flat polished aluminum rails, minimal buttons, pure solid white background, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartphones', 'vistas', 'smartphone_blanco_detalle_camara.png'),
        'ref': os.path.join(BASE_DIR, 'smartphones', 'smartphone_blanco_trasero.png'),
        'prompt': 'Extreme macro close-up shot of the dual-lens pill-shaped camera module of the white ceramic smartphone, deep sapphire glass lenses, matte glass body, pure solid white background, 8k.'
    },

    # SMARTWATCHES (Blanco)
    {
        'output': os.path.join(BASE_DIR, 'smartwatches', 'vistas', 'smartwatch_blanco_perspectiva_3d.png'),
        'ref': os.path.join(BASE_DIR, 'smartwatches', 'smartwatch_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of a luxury smartwatch, circular 44mm silver aluminum case with a white silicone sports strap, standing in dynamic 3D three-quarters perspective, clean resting watch face, pure solid white background, soft studio lighting, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartwatches', 'vistas', 'smartwatch_blanco_acostado_mesa.png'),
        'ref': os.path.join(BASE_DIR, 'smartwatches', 'smartwatch_blanco_frontal.png'),
        'prompt': 'Commercial studio product photography of the silver and white smartwatch, lying flat horizontally on a studio tabletop, straps neatly laid out, pure solid white background, soft realistic contact shadow, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartwatches', 'vistas', 'smartwatch_blanco_perfil_lateral.png'),
        'ref': os.path.join(BASE_DIR, 'smartwatches', 'smartwatch_blanco_frontal.png'),
        'prompt': 'Side profile view of the circular smartwatch, highlighting the tactile rotating digital crown and flush action button, brushed silver finish, white strap, pure solid white background, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartwatches', 'vistas', 'smartwatch_blanco_angulo_cenital.png'),
        'ref': os.path.join(BASE_DIR, 'smartwatches', 'smartwatch_blanco_frontal.png'),
        'prompt': 'Direct top-down overhead 90-degree flat-lay of the circular smartwatch, white strap extended vertically, perfectly circular crystal display, pure solid white background, 8k.'
    },
    {
        'output': os.path.join(BASE_DIR, 'smartwatches', 'vistas', 'smartwatch_blanco_detalle_corona.png'),
        'ref': os.path.join(BASE_DIR, 'smartwatches', 'smartwatch_blanco_frontal.png'),
        'prompt': 'Extreme macro close-up of the rotating crown and silver chassis bevel of the luxury smartwatch, fine knurled metal texture, pure solid white background, 8k.'
    }
]

def main():
    print(f"Iniciando generacion de {len(VISTAS_CONFIG)} vistas de productos...")
    success_count = 0
    for idx, item in enumerate(VISTAS_CONFIG):
        out_path = item['output']
        if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
            print(f"[{idx+1}/{len(VISTAS_CONFIG)}] Ya existe y es valida: {os.path.basename(out_path)}")
            success_count += 1
            continue
            
        print(f"\n==========================================")
        print(f"[{idx+1}/{len(VISTAS_CONFIG)}] Generando: {os.path.basename(out_path)}")
        
        contents = []
        if 'ref' in item and os.path.exists(item['ref']):
            ref_img = load_image_ref(item['ref'])
            if ref_img:
                contents.append(ref_img)
                print(f"Referencia adjunta: {os.path.basename(item['ref'])}")
                
        contents.append(item['prompt'])
        
        ok = generate_with_retry(contents, out_path)
        if ok:
            success_count += 1
        
        time.sleep(12)

    print(f"\n==========================================")
    print(f"Proceso finalizado: {success_count}/{len(VISTAS_CONFIG)} vistas listas.")

if __name__ == '__main__':
    main()
