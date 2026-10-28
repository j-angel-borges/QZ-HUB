---
name: zentry-media-synth
description: Motor local de síntesis multimodal determinista para el catálogo de hardware blanco de QZ-HUB. Sobrescribe las skills globales foto-set y gen-z-products para preservar el ADN morfológico real del inventario en public/assets/products/.
---

# Skill: Síntesis Multimodal Determinista QZ-HUB (`zentry-media-synth`)

> **PRIORIDAD #1 DE WORKSPACE:** Esta skill invalida cualquier instrucción de las skills globales `foto-set` y `gen-z-products` que contradiga el catálogo físico de `QZ-HUB` (específicamente la regla global de "SmartBand 100% screenless" y "SmartWatch cuadrado").

## 1. Los 5 Pilares del Sistema Determinista

1. **Inyección de Bytes Puros (`Zero-Cutout`):**
   - Las imágenes de stock en `public/assets/products/` y las anclas en `public/assets/repertorio/_anchors/` se envían a Vertex AI (`gemini-2.5-flash-image`) como `types.Part.from_bytes` sin recortes ni eliminación de fondo.
2. **Jerarquía de Anclaje Visual:**
   - **Imagen 1 (Ancla de Escena):** Todo set nuevo debe incluir como primera referencia un set certificado de `public/assets/repertorio/_anchors/` (ej. `set_nuclear_1h_essential.png` o `set_nuclear_1h_fullhouse.png`) para clonar la iluminación global (`RGB 255,255,255`), temperatura de color, sombras de contacto y estilo de UI Aurora en pantallas.
   - **Imágenes 2..N (Anclas Morfológicas de Stock):** Los PNGs individuales de `public/assets/products/` que correspondan al inventario del set.
3. **ADN Morfológico Estricto (`ops/canon/CANON_HARDWARE_BLANCO.md`):**
   - **SmartTab (`smarttab_blanco_frontal.png`):** Formato horizontal *landscape* 16:10 (~250mm), chasis blanco nieve, micro-biseles simétricos `<4%`, UI de salud/biometría activa.
   - **SmartBand (`smartband_plastico_blanco_frontal.png`):** Correa blanca de silicona estriada en pose vertical 3/4 con **cápsula central OLED vertical activa** mostrando métricas luminosas. **PROHIBIDO usar "screenless".**
   - **SmartRing (`smartring_blanco_frontal.png`):** Anillo cerámico blanco con interior metálico plateado, apoyado de canto en 3/4 (~20mm, ~8% del ancho de la tablet).
   - **SmartSound (`smartsound_blanco_frontal.png`):** Cilindro acústico blanco mate con rejilla superior plana microperforada y anillo LED cálido en la base.
   - **SmartWatch (`smartwatch_blanco_frontal.png`):** Caja **100% CIRCULAR de 44mm**, bisel metálico plateado ultra-fino, 2 botones planos laterales a la derecha, correa deportiva blanca con pasador. **PROHIBIDO chasis cuadrado o rectangular.**
   - **SmartPhone (`smartphone_blanco_trasero.png`):** Mostrado **DE ESPALDAS (Back View)** o en dúo (Frontal + Trasero) según el contrato, dorso blanco perlado liso (**CERO texto, CERO logos**), isla de cámara vertical tipo píldora en esquina superior izquierda con 2 lentes grandes apilados.
4. **Física de Estudio y Cámara:**
   - Lente telefoto medio `85mm`, apertura `f/8` (profundidad de campo total, cero desenfoque *bokeh* en productos traseros), ángulo `15°–20°` *high-angle front studio view*, ciclorama infinito blanco puro (`#FFFFFF`, `RGB 255,255,255`) con sombras de oclusión suaves debajo de cada pieza.
5. **Ejecución vía Script Determinista:**
   - Siempre invoca `python3 ops/scripts/run_deterministic_set.py --spec ops/specs/SPEC-XX.json`.
