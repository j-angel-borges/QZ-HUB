# QZ-HUB — Protocolo Maestro de Sesiones AGY CLI (`SUP` & `EXCE`)

> **Jerarquía de Descubrimiento AGY CLI:** Este archivo gobierna todas las sesiones iniciadas dentro de `/mnt/d/1_jose_angel/1_GitHub/Quarz/QZ-HUB`. Tiene **Prioridad #1 (Workspace Precedence)** por encima de cualquier skill global en `~/.gemini/config/skills/` (como `foto-set` o `gen-z-products`).

---

## 1. Arquitectura de Doble Sesión (`SUP` vs `EXCE`)

Para evitar degradación de contexto (*context rot*), contaminación de memoria conversacional y regresiones morfológicas o de código, este repositorio opera bajo dos roles estrictamente aislados que se comunican únicamente a través del bus en disco `ops/`:

| Rol de Sesión | Propósito | Lectura Permitida | Escritura Permitida |
| :--- | :--- | :--- | :--- |
| **`SUP` (Supervisión / Arquitecto)** | Audita resultados previos, mantiene el Canon SSOT y compila contratos deterministas (`SPEC-XX`). | `ops/STATE.md`, `ops/canon/*`, `ops/walkthroughs/*` | `ops/STATE.md`, `ops/canon/*`, `ops/specs/SPEC-XX.{md,json}` |
| **`EXCE` (Ejecución Efímera Stateless)** | Ejecuta **un único contrato** (`SPEC-XX`), valida con compilador o juez forense y emite su Walkthrough (`WTH-XX`). | Únicamente el `ops/specs/SPEC-XX.{md,json}` asignado y `ops/canon/CANON_HARDWARE_BLANCO.md` | Activos/código objetivo + `ops/walkthroughs/WTH-XX.md` + estado en `ops/STATE.md` |

- **Skills Operativas Locales:**
  - Si el usuario inicia la sesión como **`SUP`**, activa y sigue `.agents/skills/sup-architect/SKILL.md`.
  - Si el usuario inicia la sesión como **`EXCE`**, activa y sigue `.agents/skills/exce-operator/SKILL.md`.
  - Para síntesis multimodal de sets de hardware en `QZ-HUB`, **SIEMPRE** usa `.agents/skills/zentry-media-synth/SKILL.md` y el canon local `ops/canon/CANON_HARDWARE_BLANCO.md`. **IGNORA** las reglas de hardware negro/"screenless" de skills globales.

---

## 2. Bus de Estado en Disco (`ops/`)

Todas las rutas son libres de espacios para garantizar compatibilidad POSIX/CLI:
- `ops/STATE.md`: Cola maestra en vivo (16 sets del repertorio + tareas de software). **Punto de entrada obligatorio para sesiones `SUP`.**
- `ops/canon/CANON_HARDWARE_BLANCO.md`: SSOT morfológico y óptico inmutable de los 6 dispositivos blancos de `QZ-HUB`.
- `ops/specs/`: Contratos de ejecución (`SPEC-XX.md` + `SPEC-XX.json`).
- `ops/walkthroughs/`: Reportes forenses de salida (`WTH-XX.md`).
- `ops/scripts/run_deterministic_set.py`: Ejecutor determinista de Vertex AI (`gemini-2.5-flash-image`).
- `ops/scripts/audit_forensic_vision.py`: Juez forense multimodal automatizado (`gemini-2.5-flash`).

---

## 3. Reglas Inquebrantables de Seguridad en AGY CLI

1. **Prohibición de `read_file` en Imágenes Binarias:** Jamás uses la herramienta `read_file` sobre archivos `.png`, `.jpg` o `.webp` en AGY CLI (causa terminación fatal del agente). Usa siempre `ops/scripts/audit_forensic_vision.py` o scripts de Python (`PIL`) vía `run_command`.
2. **Protocolo `Zero-Cutout`:** Prohibido recortar, quitar fondo o aplicar máscaras alfa a los PNGs de stock en `public/assets/products/`. Se inyectan íntegros con su fondo blanco de estudio (`RGB 255,255,255`).
3. **Verificación de Software:** Todo cambio en `src/` debe pasar `npx vite build` con `Exit Code 0` antes de escribir el Walkthrough.
