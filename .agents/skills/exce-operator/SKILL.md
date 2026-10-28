---
name: exce-operator
description: Protocolo de Sesión de Ejecución Efímera Stateless (EXCE) para QZ-HUB y ZentryOS. Ejecuta un único contrato determinista (ops/specs/SPEC-XX), valida con el juez forense de visión o compilador Vite, y escribe el reporte técnico en ops/walkthroughs/WTH-XX.md.
---

# Skill: Operador de Ejecución Stateless (`EXCE`)

Activa este protocolo cuando el usuario te asigne ejecutar un contrato específico `ops/specs/SPEC-XX`.

## Reglas de Aislamiento de Contexto
1. **No leas historial innecesario:** Lee únicamente el contrato `ops/specs/SPEC-XX` asignado y, si es multimedia, `ops/canon/CANON_HARDWARE_BLANCO.md`.
2. **Cero improvisación de scripts:** Para generación de sets multimedia, utiliza exclusivamente `ops/scripts/run_deterministic_set.py` y `ops/scripts/audit_forensic_vision.py`.
3. **Prohibido `read_file` sobre `.png`/`.jpg`:** Nunca abras imágenes con `read_file`.

---

## Flujo A: Ejecución de Contrato Multimedia (`SPEC-XX-*.json`)

1. **Verificación Pre-Vuelo (`--dry-run`):**
   ```bash
   python3 ops/scripts/run_deterministic_set.py --spec ops/specs/SPEC-XX-<slug>.json --dry-run
   ```
2. **Síntesis y Auditoría Forense:**
   ```bash
   python3 ops/scripts/run_deterministic_set.py --spec ops/specs/SPEC-XX-<slug>.json
   ```
   - El script cargará las imágenes ancla (`_anchors/`) y stock (`public/assets/products/`) íntegras (`Zero-Cutout`), llamará a Vertex AI (`gemini-2.5-flash-image`), guardará el candidato en `public/assets/repertorio/_staging/`, ejecutará automáticamente el juez forense (`ops/scripts/audit_forensic_vision.py`), y si obtiene `PASS` promoverá el activo a `public/assets/repertorio/sets/` y `public/assets/repertorio/`.
3. **Reintento Quirúrgico (Máximo 2 intentos si falla el Juez Forense):**
   - Si el juez forense reporta `FAIL` en algún dispositivo (ej. omisión del anillo o reloj cuadrado), puedes pasar `--seed` o ajustar el énfasis léxico mediante `--prompt-override` documentando el ajuste exacto.
4. **Cierre y Walkthrough (`ops/walkthroughs/WTH-XX-<slug>.md`):**
   - Escribe el reporte en `ops/walkthroughs/WTH-XX-<slug>.md` incluyendo:
     - Estado final (`PASS` / `FAIL`) y rutas generadas.
     - Tabla Forense devuelta por `audit_forensic_vision.py`.
     - Lecciones aprendidas para la sesión `SUP`.
   - Actualiza la fila del set en `ops/STATE.md` a `AUDIT_PENDING` (o `CERTIFIED (PASS)` si pasó 100% los controles).

---

## Flujo B: Ejecución de Contrato de Software (`SPEC-SW-XX-*.md`)

1. Lee el contrato `ops/specs/SPEC-SW-XX-<slug>.md` y únicamente los archivos de código fuente listados en él.
2. Aplica las ediciones quirúrgicas con `edit_file` / `write_file`.
3. Ejecuta validación de compilación:
   ```bash
   npx vite build
   ```
4. Escribe `ops/walkthroughs/WTH-SW-XX-<slug>.md` con el resumen de cambios, archivos tocados y salida del build (`Exit Code 0`), y actualiza `ops/STATE.md`.
