# Protocolo Operativo de Sesiones `SUP` y `EXCE`

## 1. Naturaleza del Flujo Determinista
El sistema divide el trabajo cognitivo en dos planos:
1. **Plano de Control (`SUP`):** Razonamiento arquitectónico, auditoría cruzada de Walkthroughs (`ops/walkthroughs/WTH-XX.md`), mantenimiento del Canon (`ops/canon/`) y emisión de contratos cerrados (`ops/specs/SPEC-XX.{md,json}`).
2. **Plano de Datos (`EXCE`):** Ejecución sin estado (*stateless*) en una ventana de contexto limpia. Lee únicamente el contrato `SPEC-XX` asignado, ejecuta el comando determinista (`run_deterministic_set.py` o `npx vite build`), audita el resultado y vuelca la telemetría en `ops/walkthroughs/WTH-XX.md`.

## 2. Prohibiciones Estrictas por Rol
- **En sesión `EXCE`:**
  - Prohibido leer `WTH-*` históricos de otros sets (evita contaminación de contexto).
  - Prohibido modificar `ops/canon/*` o inventar scripts de Python ad-hoc cuando existe `ops/scripts/run_deterministic_set.py`.
  - Prohibido dar por terminada la sesión sin escribir `ops/walkthroughs/WTH-XX.md` y actualizar la fila correspondiente en `ops/STATE.md`.
- **En sesión `SUP`:**
  - Prohibido ejecutar generaciones masivas de imágenes en bucle dentro de la misma sesión de supervisión si esto degrada la ventana de contexto; delega mediante tarjeta de comando `EXCE` o `invoke_subagent` con workspace `inherit`.
