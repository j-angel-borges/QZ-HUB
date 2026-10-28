# QZ-HUB — Cola Maestra de Estado Operativo (`ops/STATE.md`)

> **Última actualización:** 2026-10-27
> **Protocolo:** Doble Sesión AGY CLI (`SUP` & `EXCE`). Matriz de 16 Sets del Repertorio 100% Sincronizada y Certificada en Vite.

---

## 1. Pipeline Multimedia: Los 16 Sets del Repertorio (`public/assets/repertorio/` y `public/assets/products/sets/`)

| ID Set | Clave en `repertorio-view.js` | Familia / Hogar | Inventario Físico Exacto | Fuente Generada (Gemini Web) | Activo Final (`/assets/repertorio/`) | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `nuclear_1h_essential` | Nuclear 1H | `1st, 1sb, 1sr` (3 pzas) | Histórico Batch Base | `set_nuclear_1h_essential.png` | `CERTIFIED (PASS)` |
| **02** | `nuclear_1h_omni` | Nuclear 1H | `1st, 1sb, 2sr` (4 pzas) | Histórico Batch Base | `set_nuclear_1h_omni.png` | `CERTIFIED (PASS)` |
| **03** | `nuclear_1h_integral` | Nuclear 1H | `1st, 1sb, 2sr, 1ss` (5 pzas) | Histórico Batch Base | `set_nuclear_1h_integral.png` | `CERTIFIED (PASS)` |
| **04** | `nuclear_1h_fullhouse` | Nuclear 1H | `1st, 1sb, 2sr, 1ss, 1sw, 1sp` (7 pzas) | Gemini Batch 7-piezas (`xwcc`) | `set_nuclear_1h_fullhouse.png` | `CERTIFIED (PASS)` |
| **05** | `extensa_1h_essential` | Extensa 1H | `1st, 1sb, 2sr` (4 pzas — *Equiv. OMNI 1H*) | Histórico Batch Base | `set_extensa_1h_essential.png` | `CERTIFIED (PASS)` |
| **06** | `extensa_1h_omni` | Extensa 1H | `2st, 2sb, 2sr` (6 pzas — *Topología T5*) | Gemini Batch Dual Base (`sbyq1`) | `set_extensa_1h_omni.png` | `CERTIFIED (PASS)` |
| **07** | `extensa_1h_integral` | Extensa 1H | `2st, 2sb, 2sr, 1ss` (7 pzas) | Pendiente generación exacta 7 pzas | *Ninguna (Placeholder)* | `PENDING_IMAGE` |
| **08** | `extensa_1h_fullhouse` | Extensa 1H | `2sb, 1st, 2sr, 1ss, 1sw, 1sp` (8 pzas) | Gemini Batch 8-piezas (`4p3c`) | `set_extensa_1h_fullhouse.png` | `CERTIFIED (PASS)` |
| **09** | `nuclear_2h_essential` | Nuclear 2H | `2st, 2sb, 2sr` (6 pzas — *Topología T5*) | Gemini Batch Dual Base (`sbyq1`) | `set_nuclear_2h_essential.png` | `CERTIFIED (PASS)` |
| **10** | `nuclear_2h_omni` | Nuclear 2H | `2st, 2sb, 2sr` (6 pzas — *Topología T5*) | Gemini Batch Dual Base (`sbyq1`) | `set_nuclear_2h_omni.png` | `CERTIFIED (PASS)` |
| **11** | `nuclear_2h_integral` | Nuclear 2H | `2st, 2sb, 2sr, 2ss` (8 pzas — *Topología T8*) | Gemini Batch Dual Sound (`o950u`) | `set_nuclear_2h_integral.png` | `CERTIFIED (PASS)` |
| **12** | `nuclear_2h_fullhouse` | Nuclear 2H | `2st, 2sb, 2sr, 2ss, 2sw, 2sp` (12 pzas — *T9*) | Gemini Batch Dual Total (`az9gw`) | `set_nuclear_2h_fullhouse.png` | `CERTIFIED (PASS)` |
| **13** | `extensa_2h_essential` | Extensa 2H | `2st, 2sb, 2sr` (6 pzas — *Topología T5*) | Gemini Batch Dual Base (`sbyq1`) | `set_extensa_2h_essential.png` | `CERTIFIED (PASS)` |
| **14** | `extensa_2h_omni` | Extensa 2H | `2st, 2sb, 2sr` (6 pzas — *Topología T5*) | Gemini Batch Dual Base (`sbyq1`) | `set_extensa_2h_omni.png` | `CERTIFIED (PASS)` |
| **15** | `extensa_2h_integral` | Extensa 2H | `2st, 2sb, 2sr, 2ss` (8 pzas — *Topología T8*) | Gemini Batch Dual Sound (`o950u`) | `set_extensa_2h_integral.png` | `CERTIFIED (PASS)` |
| **16** | `extensa_2h_fullhouse` | Extensa 2H | `2st, 2sb, 2sr, 2ss, 2sw, 2sp` (12 pzas — *T9*) | Gemini Batch Dual Total (`az9gw`) | `set_extensa_2h_fullhouse.png` | `CERTIFIED (PASS)` |

---

## 2. Pipeline de Desarrollo de Software (`QZ-HUB`)

| ID Tarea | Módulo / Alcance | Contrato (`ops/specs/`) | Walkthrough (`ops/walkthroughs/`) | Verificación Build | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SW-01** | Campañas WhatsApp & Despachador Cola | `SPEC-SW-01-campanas-ws-despachador.md` | `WTH-SW-01-campanas-ws-qz-hub.md` | `npx vite build` (`OK`) | `CERTIFIED (PASS)` |
| **SW-02** | Fix Dispatcher Name Safety & Multibrand | Contrato Inline `SUP` | `WTH-SW-02-fix-dispatcher-name-safety.md` | `npx vite build` (`OK`) | `CERTIFIED (PASS)` |

---

## 3. Comandos Rápidos para Despachar la Próxima Sesión `EXCE`

- **Opción A (Ejecutar `SPEC-05` en nueva sesión `EXCE`):**
  ```text
  Ejecuta como EXCE el contrato ops/specs/SPEC-05-extensa-1h-essential.json siguiendo .agents/skills/exce-operator/SKILL.md y genera ops/walkthroughs/WTH-05-extensa-1h-essential.md
  ```
- **Opción B (Ejecutar `SPEC-06` que resuelve 5 sets de Topología T5 simultáneamente):**
  ```text
  Ejecuta como EXCE el contrato ops/specs/SPEC-06-shared-2x-base-2tab-2band-2ring.json siguiendo .agents/skills/exce-operator/SKILL.md y genera ops/walkthroughs/WTH-06-shared-2x-base-2tab-2band-2ring.md
  ```
