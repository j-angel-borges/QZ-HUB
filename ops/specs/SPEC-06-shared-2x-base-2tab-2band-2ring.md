# SPEC-06: Topología Compartida T5 — Base Doble (`2 SmartTabs + 2 SmartBands + 2 SmartRings`)

- **Estado:** `READY_FOR_EXCE`
- **Contrato JSON Ejecutable:** `ops/specs/SPEC-06-shared-2x-base-2tab-2band-2ring.json`
- **Walkthrough Esperado:** `ops/walkthroughs/WTH-06-shared-2x-base-2tab-2band-2ring.md`
- **Topología Física:** **T5** (`2 SmartTabs + 2 SmartBands + 2 SmartRings` = 6 piezas).
- **Impacto Multi-Set (5 tarjetas de `src/repertorio-view.js` cubiertas simultáneamente):**
  1. `set_extensa_1h_omni.png`
  2. `set_nuclear_2h_essential.png`
  3. `set_nuclear_2h_omni.png`
  4. `set_extensa_2h_essential.png`
  5. `set_extensa_2h_omni.png`

## Comando de Ejecución Determinista (`EXCE`)
```bash
python3 ops/scripts/run_deterministic_set.py --spec ops/specs/SPEC-06-shared-2x-base-2tab-2band-2ring.json
```
