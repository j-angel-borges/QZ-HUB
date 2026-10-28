# Reglas de Directorio: Catálogo de Hardware Stock (`public/assets/products/`)

> **Ámbito:** Este archivo se carga automáticamente cuando `agy` opera sobre `public/assets/products/`.

1. **Inmutabilidad del Catálogo Stock (`READ-ONLY`):**
   - Los archivos PNG dentro de `smarttabs/`, `smartbands/`, `smartrings/`, `smartsound/`, `smartwatches/` y `smartphones/` son **Referencias Maestras Inmutables**. Ninguna sesión `SUP` ni `EXCE` debe sobrescribirlos, recortarlos ni alterarlos.
2. **Mandato `Zero-Cutout`:**
   - Jamás apliques `rembg`, `PIL.Image.crop` ni máscaras de transparencia sobre estos activos antes de enviarlos a Vertex AI. La iluminación global de estudio (`RGB 255,255,255`) contenida en el PNG original es indispensable para que `gemini-2.5-flash-image` preserve el volumen 3D, biseles CNC y reflejos especulares.
3. **Seguridad Binaria en CLI:**
   - **PROHIBIDO** invocar `read_file` sobre cualquier archivo `.png`, `.jpg` o `.webp`. Para auditar dimensiones o morfología, ejecuta `python3 ops/scripts/audit_forensic_vision.py`.
4. **Canon Morfológico Vigente:**
   - Consulta siempre `../../ops/canon/CANON_HARDWARE_BLANCO.md`.
   - **SmartWatch (`smartwatch_blanco_frontal.png`):** Caja **100% CIRCULAR** de 44mm con bisel metálico plateado ultra-delgado y 2 botones planos laterales derechos. Prohibido describirlo como cuadrado o cojín.
   - **SmartBand (`smartband_plastico_blanco_frontal.png`):** Pulsera blanca estriada con **cápsula central OLED vertical activa**. Prohibido aplicar reglas de "screenless / cero pantalla".
   - **SmartPhone (`smartphone_blanco_trasero.png`):** Dorso blanco perlado limpio (**cero texto/logos**), isla vertical tipo píldora con 2 lentes grandes apilados.
