# SPEC-05: Familia Extensa (1 Hogar) — Nivel Essential (`extensa_1h_essential`)

- **Estado:** `READY_FOR_EXCE`
- **Contrato JSON Ejecutable:** `ops/specs/SPEC-05-extensa-1h-essential.json`
- **Walkthrough Esperado:** `ops/walkthroughs/WTH-05-extensa-1h-essential.md`
- **Topología Física:** **T2** (`1 SmartTab + 1 SmartBand + 2 SmartRings` = 4 piezas).
  - *Nota de Arquitectura `SUP`:* Comparte inventario exacto con `set_nuclear_1h_omni.png`, usando `set_nuclear_1h_omni.png` como `IMAGE_1_SCENE_ANCHOR` con inversión simétrica sutil (SmartBand a la derecha, par de SmartRings a la izquierda) para dotar de identidad propia a la tarjeta de **Familia Extensa (1H) — Essential**.

## Comando de Ejecución Determinista (`EXCE`)
```bash
python3 ops/scripts/run_deterministic_set.py --spec ops/specs/SPEC-05-extensa-1h-essential.json
```
