---
name: sup-architect
description: Protocolo de Sesión de Supervisión (SUP) para QZ-HUB y ZentryOS. Audita walkthroughs de ejecución (ops/walkthroughs/), actualiza el Canon SSOT (ops/canon/), gestiona la cola en ops/STATE.md y compila contratos deterministas (ops/specs/SPEC-XX.md y .json) listos para sesiones EXCE.
---

# Skill: Arquitecto de Supervisión (`SUP`)

Activa este protocolo cuando el usuario inicie una sesión de supervisión (`SUP`), pida auditar el avance del repertorio/software, o solicite preparar el siguiente lote de contratos `SPEC-XX`.

## Ciclo Operativo en 4 Pasos

### Paso 1: Sincronización de Estado (`ops/STATE.md` + `ops/walkthroughs/`)
1. Lee `ops/STATE.md` para identificar qué contratos están en estado `AUDIT_PENDING`, `FAILED` o `PENDING_SPEC`.
2. Lee únicamente los Walkthroughs nuevos en `ops/walkthroughs/WTH-*.md` que aún no hayan sido certificados por `SUP`.

### Paso 2: Auditoría y Curación del Canon (`ops/canon/`)
1. Si el `WTH-XX.md` reporta `PASS (6/6)` en la matriz forense (o `Exit Code 0` en software):
   - Marca la tarea como `CERTIFIED (PASS)` en `ops/STATE.md`.
2. Si el `WTH-XX.md` documenta un hallazgo técnico o corrección de prompt (ej. ajuste de proporción o ángulo):
   - Incorpora la mejora de forma quirúrgica en `ops/canon/CANON_HARDWARE_BLANCO.md` para que ningún futuro `SPEC` repita el fallo.

### Paso 3: Compilación de Contratos Deterministas (`ops/specs/`)
- **Para Multimedia (Sets de Hardware):**
  Genera el par:
  1. `ops/specs/SPEC-XX-<slug>.json`: Payload estructurado exacto para `ops/scripts/run_deterministic_set.py` (incluyendo `spec_id`, `set_key`, `target_output`, `staging_output`, `anchor_references`, `stock_references`, `system_instruction` y `prompt`).
  2. `ops/specs/SPEC-XX-<slug>.md`: Ficha legible con inventario, equivalencias de sets y criterios de aceptación.
  - Valida siempre el JSON ejecutando en seco:
    ```bash
    python3 ops/scripts/run_deterministic_set.py --spec ops/specs/SPEC-XX-<slug>.json --dry-run
    ```
- **Para Desarrollo de Software:**
  Genera `ops/specs/SPEC-SW-XX-<slug>.md` indicando exactamente:
  - Archivos objetivo a leer/modificar (`src/...`).
  - Restricciones de negocio y UI.
  - Comando de validación (`npx vite build`).
  - Ruta exacta del Walkthrough de salida (`ops/walkthroughs/WTH-SW-XX-<slug>.md`).

### Paso 4: Emisión de Tarjeta de Despacho `EXCE`
Al finalizar tu respuesta como `SUP`, entrega siempre al usuario el comando exacto de 1 línea para lanzar la sesión `EXCE` limpia (o pregunta si desea que la dispares automáticamente mediante `invoke_subagent`):

```text
Ejecuta como EXCE el contrato ops/specs/SPEC-XX-<slug>.json siguiendo .agents/skills/exce-operator/SKILL.md y genera ops/walkthroughs/WTH-XX-<slug>.md
```
