# CANON MAESTRO: SISTEMA DETERMINISTA DE HARDWARE BLANCO (`QZ-HUB`)

> **SSOT INMUTABLE (`ops/canon/CANON_HARDWARE_BLANCO.md`):** Este documento consolida las leyes físicas, ópticas y morfológicas probadas empíricamente en las generaciones certificadas (`Set 01 Essential` a `Set 04 Fullhouse`). Tiene prioridad absoluta sobre cualquier prompt o skill global.

---

## 1. Leyes de Condicionamiento Multimodal (Vertex AI `gemini-2.5-flash-image`)

1. **Inyección de Activos Íntegros (`Zero-Cutout`):**
   - **JAMÁS** recortes ni elimines el fondo de las imágenes de referencia (`public/assets/products/`).
   - Se inyectan directamente los bytes binarios del PNG original con su fondo blanco de estudio (`RGB 255,255,255`). Esto preserva el micro-contraste de bordes blancos sobre blanco, sombras de contacto y reflejos especulares.
2. **Anclaje Compuesto en Dos Capas:**
   - **Ancla de Escena (`_anchors/`):** Todo set nuevo incluye como primera referencia un set certificado (`set_nuclear_1h_essential.png` o `set_nuclear_1h_fullhouse.png`) para heredar la iluminación global, el horizonte de ciclorama y el lenguaje gráfico de las pantallas.
   - **Anclas Morfológicas (`public/assets/products/`):** Se inyectan los PNGs individuales exactos de cada categoría de hardware presente en el set.
3. **Configuración del Modelo:**
   - **Proyecto GCP:** `gen-lang-client-0929068122` (`location="us-central1"`).
   - **Modelo de Síntesis:** `gemini-2.5-flash-image` (`temperature=0.15`, `aspect_ratio="4:3"`).
   - **Modelo de Auditoría Forense:** `gemini-2.5-flash` (`temperature=0.0`).

---

## 2. ADN Morfológico y Escala Física de los 6 Dispositivos

| Código | Dispositivo | Archivo Stock Maestro (`public/assets/products/`) | Escala Física Real | Geometría, Materiales y Reglas Anti-Alucinación |
| :--- | :--- | :--- | :--- | :--- |
| **`st`** | **Zentry SmartTab** | `smarttabs/smarttab_blanco_frontal.png` | **~250 mm ancho** (Ancla 100%) | Tablet de aluminio blanco mate en orientación **HORIZONTAL (Landscape 16:10)**. Biseles simétricos ultra-delgados (`<4%`), esquinas redondeadas de radio suave, pantalla encendida con dashboard biométrico oscuro/Aurora. |
| **`sb`** | **Zentry SmartBand** | `smartbands/smartband_plastico_blanco_frontal.png` | **~45 mm alto** (~25% de la Tab) | Pulsera de silicona blanca con textura estriada transversal en pose vertical 3/4. Incorpora **cápsula central OLED vertical alargada ACTIVA** mostrando métricas luminosas. **PROHIBIDO describirla como "screenless" o aro hueco.** |
| **`sr`** | **Zentry SmartRing** | `smartrings/smartring_blanco_frontal.png` | **~20 mm diámetro** (~8% de la Tab) | Anillo inteligente en cerámica blanca brillante exterior y titanio plateado interior. Pose: **apoyado de canto (upright) en ángulo 3/4** mostrando el hueco interior metálico. Jamás omitirlo ni aplastarlo. |
| **`ss`** | **Zentry SmartSound** | `smartsound/smartsound_blanco_frontal.png` | **~95 mm diámetro × 85 mm alto** | Cilindro acústico compacto en polímero blanco mate sedoso. Superficie superior plana con **rejilla metálica microperforada gris claro** y sutil anillo LED cálido en la base inferior. |
| **`sw`** | **Zentry SmartWatch** | `smartwatches/smartwatch_blanco_frontal.png` | **Caja Ø 44 mm** (~32% alto de Tab) | **CAJA ESTRICTAMENTE CIRCULAR (100% redonda)** en aluminio blanco/plata, bisel metálico plateado ultra-delgado, **2 botones planos laterales en el flanco derecho**, pantalla circular encendida con anillos de salud y correa deportiva blanca con pasador. **PROHIBIDO chasis cuadrado, rectangular o corte cojín.** |
| **`sp`** | **Zentry SmartPhone** | `smartphones/smartphone_blanco_trasero.png` | **~150 mm alto × 72 mm ancho** | Mostrado **DE ESPALDAS (Back View)** en ángulo vertical 3/4. Dorso de cristal blanco perlado mate **100% LIMPIO (CERO texto, CERO logos, CERO letras)**. Isla de cámara **vertical tipo píldora** en la esquina superior izquierda con **2 lentes grandes apilados verticalmente**, aro metálico plateado y flash LED lateral. |

---

## 3. Matriz Maestra de los 16 Sets (`src/repertorio-view.js`) y Equivalencias de Inventario

El catálogo de `src/repertorio-view.js` define 16 combinaciones (`4 familias × 4 niveles`). El análisis de inventario revela **7 topologías físicas únicas**, permitiendo reutilización directa o variaciones de ángulo sin regenerar a ciegas:

| Topología Física | Inventario Exacto | Sets que comparten esta Topología (`set_<familia>_<nivel>.png`) | Estado Actual |
| :--- | :--- | :--- | :--- |
| **T1 (Base 1x)** | `1 Tab + 1 Band + 1 Ring` | `set_nuclear_1h_essential.png` | **CERTIFICADO** |
| **T2 (Base 1x + 2 Rings)** | `1 Tab + 1 Band + 2 Rings` | `set_nuclear_1h_omni.png`, `set_extensa_1h_essential.png` | `nuclear_1h_omni` **CERTIFICADO** / `SPEC-05` listo |
| **T3 (Integral 1x)** | `1 Tab + 1 Band + 2 Rings + 1 Sound` | `set_nuclear_1h_integral.png` | **CERTIFICADO** |
| **T4 (Fullhouse 1x)** | `1 Tab + 1 Band + 2 Rings + 1 Sound + 1 Watch + 1 Phone` | `set_nuclear_1h_fullhouse.png` | **CERTIFICADO** |
| **T5 (Base 2x)** | `2 Tabs + 2 Bands + 2 Rings` | `set_extensa_1h_omni.png`, `set_nuclear_2h_essential.png`, `set_nuclear_2h_omni.png`, `set_extensa_2h_essential.png`, `set_extensa_2h_omni.png` | `SPEC-06` listo |
| **T6 (Integral 2x - 1 Sound)** | `2 Tabs + 2 Bands + 2 Rings + 1 Sound` | `set_extensa_1h_integral.png` | `PENDING_SPEC` (`SPEC-07`) |
| **T7 (Fullhouse 2x Base - 1x Comp)** | `2 Tabs + 2 Bands + 2 Rings + 1 Sound + 1 Watch + 1 Phone` | `set_extensa_1h_fullhouse.png` | `PENDING_SPEC` (`SPEC-08`) |
| **T8 (Integral 2x Full)** | `2 Tabs + 2 Bands + 2 Rings + 2 Sounds` | `set_nuclear_2h_integral.png`, `set_extensa_2h_integral.png` | `PENDING_SPEC` (`SPEC-09`) |
| **T9 (Fullhouse 2x Total - 12 pzas)** | `2 Tabs + 2 Bands + 2 Rings + 2 Sounds + 2 Watches + 2 Phones` | `set_nuclear_2h_fullhouse.png`, `set_extensa_2h_fullhouse.png` | `PENDING_SPEC` (`SPEC-10`) |
