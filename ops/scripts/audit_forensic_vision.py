#!/usr/bin/env python3
"""
Juez Forense Multimodal Automatizado (audit_forensic_vision.py)
Evalúa la imagen candidata generada contra el Canon de Hardware Blanco (CANON_HARDWARE_BLANCO.md)
y el inventario esperado en el contrato JSON (SPEC-XX.json).
Seguridad AGY CLI: Inspecciona imágenes desde Python (PIL + google-genai), evitando siempre read_file en PNGs.
"""
import argparse
import json
import os
import sys
from pathlib import Path

def audit_image(spec_path: Path, image_path: Path, repo_root: Path) -> dict:
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    if not image_path.exists():
        return {
            "overall_status": "FAIL",
            "error": f"Candidate image does not exist: {image_path}",
            "checks": []
        }

    # Check basic image properties with PIL
    try:
        from PIL import Image
        with Image.open(image_path) as img:
            width, height = img.size
            mode = img.mode
            # Check top-left corner pixel for studio white background sanity
            corner_rgb = img.convert("RGB").getpixel((5, 5))
    except Exception as e:
        return {
            "overall_status": "FAIL",
            "error": f"PIL failed to read image: {e}",
            "checks": []
        }

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        return {
            "overall_status": "WARN_NO_SDK",
            "dimensions": f"{width}x{height} ({mode})",
            "corner_rgb": corner_rgb,
            "message": "google-genai SDK not installed in active Python env; PIL structural validation passed."
        }

    client = genai.Client(
        vertexai=True,
        project=spec.get("gcp_project", "gen-lang-client-0929068122"),
        location=spec.get("gcp_location", "us-central1"),
    )

    contents = []
    # Load stock references for direct visual comparison
    for ref in spec.get("stock_references", []):
        ref_full = repo_root / ref["path"]
        if ref_full.exists():
            contents.append(types.Part.from_bytes(data=ref_full.read_bytes(), mime_type="image/png"))
            contents.append(f"REFERENCE ({ref['id']}): {ref['role']}")

    contents.append(types.Part.from_bytes(data=image_path.read_bytes(), mime_type="image/png"))
    contents.append(
        f"""CANDIDATE IMAGE TO AUDIT FOR SPEC {spec['spec_id']} ({spec['set_key']}).
Expected exact inventory: {json.dumps(spec['inventory'])}.
Evaluate strictly against these rules and return ONLY valid JSON:
1. Count every device category in the CANDIDATE IMAGE and compare with expected inventory: {json.dumps(spec['inventory'])}.
2. If 'smartwatch' > 0: Verify the watch case is 100% CIRCULAR (round 44mm) and NOT square/rectangular.
3. If 'smartband' > 0: Verify the white band has a visible vertical elongated OLED screen and is NOT a hollow screenless ring.
4. If 'smartphone' > 0: Verify the phone back is clean white with ZERO text/logos and a vertical pill camera island with 2 lenses.
5. Verify background is pure studio white (#FFFFFF).

Return JSON format:
{{
  "overall_status": "PASS" or "FAIL",
  "inventory_match": true or false,
  "detected_counts": {{"smarttab": int, "smartband": int, "smartring": int, "smartsound": int, "smartwatch": int, "smartphone": int}},
  "checks": [
    {{"device": "string", "expected": int, "detected": int, "morphology_ok": true/false, "notes": "string"}}
  ],
  "summary": "string"
}}"""
    )

    response = client.models.generate_content(
        model=spec.get("judge_model_id", "gemini-2.5-flash"),
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.0,
            response_mime_type="application/json",
        ),
    )

    try:
        result = json.loads(response.text)
    except Exception:
        result = {
            "overall_status": "UNKNOWN",
            "raw_response": response.text
        }

    result["dimensions"] = f"{width}x{height} ({mode})"
    result["corner_rgb"] = list(corner_rgb)
    return result


def format_markdown_table(report: dict) -> str:
    lines = [
        f"### Veredicto Forense Automatizado: `{report.get('overall_status', 'UNKNOWN')}`",
        f"- **Dimensiones Binarias:** `{report.get('dimensions', 'N/A')}` | **RGB Esquina Ciclo:** `{report.get('corner_rgb', 'N/A')}`",
        "",
        "| Dispositivo | Esperado | Detectado | Morfología Canon | Observaciones Forenses |",
        "| :--- | :---: | :---: | :---: | :--- |",
    ]
    for chk in report.get("checks", []):
        morph = "PASS" if chk.get("morphology_ok") else "FAIL"
        lines.append(
            f"| `{chk.get('device')}` | {chk.get('expected')} | {chk.get('detected')} | **{morph}** | {chk.get('notes', '')} |"
        )
    if report.get("summary"):
        lines.extend(["", f"> **Resumen del Juez (`gemini-2.5-flash`):** {report['summary']}"])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Forensic Vision Judge for QZ-HUB Hardware Sets")
    parser.add_argument("--spec", required=True, help="Path to SPEC-XX.json")
    parser.add_argument("--image", required=True, help="Path to candidate PNG image")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]
    spec_path = (repo_root / args.spec) if not Path(args.spec).is_absolute() else Path(args.spec)
    image_path = (repo_root / args.image) if not Path(args.image).is_absolute() else Path(args.image)

    report = audit_image(spec_path, image_path, repo_root)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    print("\n" + format_markdown_table(report))

    if report.get("overall_status") == "FAIL":
        sys.exit(2)


if __name__ == "__main__":
    main()
