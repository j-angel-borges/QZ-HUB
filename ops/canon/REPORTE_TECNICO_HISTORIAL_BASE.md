# REPORTE TÉCNICO DE ESTADO, HISTORIAL DE OPERACIONES Y ARQUITECTURA DE GENERACIÓN VISUAL DE HARDWARE QUARZ / ZENTRYOS

**Fecha del Reporte:** 26 de Octubre, 2026  
**Destino del Documento:** `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products\REPORTE_TECNICO_HISTORIAL_Y_ESTRUCTURA_PARA_MODELO_SUPERIOR.md`  
**Repositorio Base:** `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB`  
**Directorio Primario de Productos:** `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products`  
**Directorio de Destino para Repertorio Web:** `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\repertorio`

---

## 1. Objetivo y Requerimientos Planteados por el Usuario

1. **Objetivo Central:**
   Generar desde cero todas las escenas y portadas de los sets comerciales de hardware del ecosistema Quarz / ZentryOS en su versión blanca/silver (`_blanco_`), asegurando fidelidad 100% idéntica a los archivos base de stock ubicados en `public/assets/products/`.

2. **Requerimientos Específicos del Usuario a lo Largo de las Sesiones:**
   - **Fidelidad Estricta de Hardware:** Los productos en los sets no deben diferir en forma, botones, pantallas o cámaras respecto a las imágenes base de stock.
   - **Encuadre Cerrado (Hero Close-up):** Priorizar el producto y sus detalles; evitar planos lejanos con fondos vacíos sobredimensionados.
   - **Determinismo Espacial y Escala:** Corregir desproporciones físicas (el SmartRing no puede tener el tamaño de la SmartBand o de un plato; la SmartTab debe situarse en posición horizontal apaisada 16:10).
   - **Pureza de Fondo y Superficie:** Fondo blanco de catálogo limpio o mármol suave, sin manchas oscuras, charcos de sombra dura ni artefactos extraños.
   - **Operativa de Sesiones Desacopladas (SUP y EXCE):** Establecer una dinámica donde una sesión de soporte/supervisión (SUP) elabore los prompts y la contextualización, y sesiones ejecutoras limpias (EXCE) realicen las llamadas al modelo de difusión (`gemini-2.5-flash-image` vía Vertex AI) entregando walkthroughs técnicos.
   - **Preservación de Fondos de Stock:** En lugar de recortar los productos en PNG transparente, utilizar cada producto sobre su fondo blanco original de fábrica como base de referencia.
   - **Incorporación de Vistas Múltiples:** Usar las imágenes de `public/assets/products/smartwatches/vistas/` para alimentar la comprensión espacial o RAG visual del modelo.
   - **Entrega de Instrucciones Paso a Paso:** Indicar al usuario las acciones exactas para cada sesión ejecutora (cuándo abrir sesión limpia, comando `cd` de terminal, prompt a copiar y archivo de retorno esperado).

---

## 2. Inventario de Archivos y Directorios Involucrados

### A. Archivos Base de Stock (Activos de Hardware Originales)
Ubicación: `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products\`

- **SmartTab:**
  - `smarttabs/smarttab_blanco_frontal.png` (1024x1024 px, orientación vertical original, bisel delgado con pantalla activa clara).
  - `smarttabs/smarttab_blanco_trasero.png` (896x1152 px).
- **SmartBand:**
  - `smartbands/smartband_plastico_blanco_frontal.png` (1024x1024 px, bucle cerrado continuo de silicona blanca con cápsula frontal OLED vertical).
  - `smartbands/smartband_plastico_blanco_trasero.png` (1024x1024 px).
- **SmartRing:**
  - `smartrings/smartring_blanco_frontal.png` (1024x1024 px, anillo erguido de pie en perspectiva 3/4 mostrando circunferencia vertical y núcleo metálico).
  - `smartrings/smartring_blanco_trasero.png` (1024x1024 px).
- **SmartSound:**
  - `smartsound/smartsound_blanco_frontal.png` (1152x896 px, altavoz cilíndrico blanco con micro-rejilla superior plana).
- **SmartPhone:**
  - `smartphones/smartphone_blanco_trasero.png` (1024x1024 px, proporción 2:1, trasera blanca satinada, isla vertical tipo píldora con 2 lentes circulares).
  - `smartphones/smartphone_blanco_frontal.png` (1024x1024 px).
- **SmartWatch:**
  - `smartwatches/smartwatch_blanco_frontal.png` (1024x1024 px, base exterior cuadrada 814x792 px, pantalla interior circular de 177 px de radio con dial de acento azul/cian).
  - `smartwatches/smartwatch_blanco_trasero.png` (1024x1024 px).
  - `smartwatches/vistas/smartwatch_blanco_perfil_lateral.png` (1024x1024 px, muestra los dos pulsadores rectangulares planos laterales y ausencia de corona giratoria).
  - `smartwatches/vistas/smartwatch_blanco_angulo_cenital.png` (1024x1024 px).
  - `smartwatches/vistas/smartwatch_blanco_acostado_mesa.png` (1024x1024 px).
  - `smartwatches/vistas/smartwatch_blanco_detalle_corona.png` (1024x1024 px).

### B. Directorios Operativos de Soporte y Ejecución
- `public/assets/products/ag. prompts-sups/`:
  - `CANON_SISTEMA_DETERMINISTA_HARDWARE.md` (Documento vivo actual con la síntesis de reglas).
  - `prompt_set_04_nuclear_1h_fullhouse.md` (Prompt activo redactado para el Set 04).
- `public/assets/products/ag. wths-exce/`:
  - Directorio receptor para los walkthroughs técnicos de las sesiones ejecutoras.
- `public/assets/products/sets/`:
  - `set_essential_blanco.png` (819 KB).
  - `set_essential_blanco_CANON_HITO_V4.png` (819 KB).
  - `set_essential_blanco_studio.png` (999 KB).
  - `set_omni_blanco.png` (798 KB).
- `public/assets/repertorio/pruebas_set_essential/`:
  - `set_nuclear_1h_essential.png` (811 KB, 1024x1024 px).
  - `set_nuclear_1h_omni.png` (888 KB, 1024x1024 px).
  - `set_nuclear_1h_integral.png` (860 KB, 896x1152 px).
  - `set_nuclear_1h_fullhouse_v1_inicial.png` (927 KB, 896x1152 px).
  - `set_nuclear_1h_fullhouse_v2_corregido.png` (979 KB, 896x1152 px).
  - `set_nuclear_1h_fullhouse.png` (992 KB, 896x1152 px).

---

## 3. Matriz Completa de Sets Requeridos por el Sistema (Código Web)

Definida en `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\src\repertorio-view.js`:
- Matriz de 4 Tipologías de Hogar x 4 Niveles de Equipamiento = **16 Sets Totales**:
  1. `nuclear_1h`: Essential (Tab + Band + Ring), OMNI (Tab + Band + 2 Rings), Integral (+ Sound), Full House (+ Watch + Phone).
  2. `extensa_1h`: Essential (Tab + Band + 2 Rings), OMNI (2 Tabs + 2 Bands + 2 Rings), Integral (+ Sound), Full House (+ Watch + Phone).
  3. `nuclear_2h`: Essential (2 Tabs + 2 Bands + 2 Rings), OMNI (2 Tabs + 2 Bands + 2 Rings), Integral (+ 2 Sounds), Full House (+ 2 Watches + 2 Phones).
  4. `extensa_2h`: Essential (2 Tabs + 2 Bands + 2 Rings), OMNI (2 Tabs + 2 Bands + 2 Rings), Integral (+ 2 Sounds), Full House (+ 2 Watches + 2 Phones).

---

## 4. Historial Técnico de Operaciones y Técnicas Ejecutadas

### Fase 1: Enfoque de Composición 2D Directa (Sin Difusión Inicial)
- **Operación:** Se creó un script en Python con OpenCV (`prueba_essential_directa_100pct_real.png`, `prueba_fullhouse_v3.png`, `prueba_essential_limpia_sin_sombras.png`) mediante extracción de contornos sobre los PNGs de stock, rotación de la SmartTab a horizontal y posicionamiento manual en un lienzo de 1376x768 px.
- **Resultado Técnico:** Fidelidad de píxel 100% a las imágenes base, pero apariencia plana de fotomontaje/recorte 2D sin cohesión fotográfica ni integración volumétrica 3D entre dispositivos y suelo.

### Fase 2: Enfoque Multimodal Image-to-Image en Vertex AI
- **Operación:** Se inyectaron las composiciones directas 2D como imagen de referencia en `gemini-2.5-flash-image` con prompts descriptivos para transformar el ciclorama y agregar sombras de estudio (`vertex_essential_conditioned_v1.png`, `vertex_fullhouse_conditioned_v1.png`).
- **Resultado Técnico:** La IA generó sombras artificiales oscuras en el suelo, artefactos difusos y reinterpretaciones de los dispositivos.

### Fase 3: Enfoque de Geometría en Dos Fases (Hito V4)
- **Operación:**
  1. *Fase 1 (Geometría sobre Ciclorama Blanco Puro):* Se redactó `prompt_set_01_essential_v2.md` inyectando los 3 PNGs de stock (`smarttab_blanco_frontal.png`, `smartband_plastico_blanco_frontal.png`, `smartring_blanco_frontal.png`) ordenando recrear la escena sobre fondo blanco puro (#FFFFFF) con la tablet apaisada 16:10, la SmartBand erguida en bucle continuo y el SmartRing erguido en 3/4 a escala de ~20 mm.
  2. Se generó `set_essential_blanco.png` (conservado como `set_essential_blanco_CANON_HITO_V4.png`).
  3. *Fase 2 (Escenografía de Estudio):* Se inyectó `set_essential_blanco.png` como ancla de entrada fija y se aplicó `prompt_set_01_essential_fase2_marmol.md` para transferir la superficie de mármol Carrara satinado, micro-reflejos y luz 85mm, generando `set_essential_blanco_studio.png`.
- **Resultado Técnico:** Coincidencia morfológica aprobada en los 3 dispositivos de ese set.

### Fase 4: Expansión a OMNI e Integral
- **Operación:**
  - Se redactó `prompt_set_02_omni.md` para duplicar el anillo a dos SmartRings gemelos erguidos a escala microscópica, generando `set_omni_blanco.png` y consolidando en `pruebas_set_essential/`:
    - `set_nuclear_1h_essential.png` (1024x1024 px).
    - `set_nuclear_1h_omni.png` (1024x1024 px).
    - `set_nuclear_1h_integral.png` (896x1152 px, incorporando el SmartSound cilíndrico).
- **Resultado Técnico:** Las 3 imágenes fueron aprobadas y conservadas en `pruebas_set_essential/` como referencias de atmósfera, suelo de mármol Carrara satinado (`floor RGB ~215-230`) y ciclorama blanco-platino (`top RGB ~240-248`).

### Fase 5: Intentos en Set 04 (Full House) y Detección de Discrepancias
- **Operación:**
  - Se redactaron sucesivas versiones del prompt para Full House (`prompt_set_04_nuclear_1h_fullhouse.md`) inyectando `set_nuclear_1h_integral.png` junto con los activos de SmartWatch y SmartPhone.
  - Se generaron `set_nuclear_1h_fullhouse_v1_inicial.png` y `set_nuclear_1h_fullhouse_v2_corregido.png`.
- **Resultado Técnico reportado:**
  - En la V1, el usuario seleccionó la distribución espacial y atmósfera como la preferida, pero marcó errores de fidelidad en el SmartWatch (pantalla cuadrada tipo Apple Watch) y en el SmartPhone (módulo de cámara difuso).
  - En la V2 y pruebas posteriores en sesiones nuevas, los prompts suministrados continuaron produciendo fallas de fidelidad en la SmartBand y el SmartWatch.

### Fase 6: Reestructuración y Purgas Realizadas en el Sistema de Archivos
- **Operaciones de Purga:**
  - Se eliminaron directorios temporales creados (`00_SYSTEM_RULES`, `01_CATALOG_DNA`, `02_SCENE_TEMPLATES`, `03_STAGING_PIPELINE`, `00_SUP_ENGINEERING`, `01_EXCE_OPERATIONS`).
  - Se eliminaron archivos de recorte alfa (`asset_cutout.png`).
  - Se eliminaron walkthroughs obsoletos en `ag. wths-exce/`.
  - Se consolidaron los documentos en `ag. prompts-sups/`:
    - `CANON_SISTEMA_DETERMINISTA_HARDWARE.md`
    - `prompt_set_04_nuclear_1h_fullhouse.md`

---

## 5. Análisis Técnico del Estado Actual de los Prompts y los Modelos

1. **Sensibilidad del Modelo a la Nomenclatura Textual:**
   - En `gemini-2.5-flash-image`, la inclusión de términos como *"square smartwatch"* o descripciones de pantalla *"standby obsidian"* sobrepasó la atención sobre los tensores visuales inyectados, provocando que el modelo recurriera a representaciones dominantes pre-entrenadas (Apple Watch rectangular y módulos de iPhone).
   - El hardware real de stock presenta una base exterior cuadrada (814x792 px) con una pantalla interior circular de 177 px de radio, dos pulsadores planos laterales en el SmartWatch, y una isla vertical tipo píldora de 2 lentes circulares en el SmartPhone.
2. **Comportamiento en Sesiones Nuevas:**
   - La transferencia de prompts textuales hacia sesiones limpias de AGY no ha logrado replicar de forma determinista la geometría exacta de todos los 7 dispositivos simultáneos en una sola llamada de difusión, persistiendo inconsistencias morfológicas en los wearables y el teléfono.

---

## 6. Localización del Documento

Este reporte se encuentra guardado en el sistema local en:  
`D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\public\assets\products\REPORTE_TECNICO_HISTORIAL_Y_ESTRUCTURA_PARA_MODELO_SUPERIOR.md`
