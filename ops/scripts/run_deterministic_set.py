#!/usr/bin/env python3
"""
Ejecutor Determinista de Síntesis Multimodal (run_deterministic_set.py)
Lee un contrato cerrado ops/specs/SPEC-XX.json, verifica la existencia e integridad
de todas las referencias Zero-Cutout, invoca Vertex AI (gemini-2.5-flash-image),
audita con audit_forensic_vision.py y promueve el activo final si aprueba.
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

from audit_forensic_vision import audit_image, format_markdown_table


def validate_spec(spec: dict, repo_root: Path) -> list[str]:
    errors = []
    required_keys = [
        "spec_id",
        "set_key",
        "staging_output",
        "target_outputs",
        "inventory",
        "anchor_references",
        "stock_references",
        "system_instruction",
        "prompt",
    ]
    for k in required_keys:
        if k not in spec:
            errors.append(f"Missing required key in spec JSON: '{k}'")

    for ref in spec.get("anchor_references", []) + spec.get("stock_references", []):
        ref_path = repo_root / ref["path"]
        if not ref_path.exists():
            errors.append(f"Reference image not found on disk: {ref['path']} ({ref['id']})")
        elif ref_path.stat().st_size < 1024:
            errors.append(f"Reference image appears empty/corrupted: {ref['path']}")

    return errors


def main():
    parser = argparse.ArgumentParser(description="Deterministic Hardware Set Runner for QZ-HUB")
    parser.add_argument("--spec", required=True, help="Path to ops/specs/SPEC-XX.json")
    parser.add_argument("--dry-run", action="store_true", help="Validate spec and reference files without calling Vertex AI")
    parser.add_argument("--skip-audit", action="store_true", help="Skip automated forensic vision audit after generation")
    parser.add_argument("--prompt-override", default=None, help="Optional lexical override appended to the spec prompt")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]
    spec_path = (repo_root / args.spec) if not Path(args.spec).is_absolute() else Path(args.spec)

    if not spec_path.exists():
        print(f"[ERROR] Spec file not found: {spec_path}", file=sys.stderr)
        sys.exit(1)

    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    errors = validate_spec(spec, repo_root)
    if errors:
        print(f"[FAIL] Pre-flight validation failed for {spec.get('spec_id', spec_path.name)}:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    total_refs = len(spec["anchor_references"]) + len(spec["stock_references"])
    print(f"[PASS] Pre-flight validation OK for {spec['spec_id']} ({spec['set_key']}).")
    print(f"       - Verified {total_refs} Zero-Cutout reference images on disk.")
    print(f"       - Expected Inventory: {json.dumps(spec['inventory'])}")
    print(f"       - Target Outputs ({len(spec['target_outputs'])}): {', '.join(spec['target_outputs'])}")

    if args.dry_run:
        print("[DRY-RUN] Exiting cleanly without invoking Vertex AI.")
        sys.exit(0)

    from google import genai
    from google.genai import types

    client = genai.Client(
        vertexai=True,
        project=spec.get("gcp_project", "gen-lang-client-0929068122"),
        location=spec.get("gcp_location", "us-central1"),
    )

    contents = []
    for ref in spec["anchor_references"] + spec["stock_references"]:
        ref_path = repo_root / ref["path"]
        contents.append(types.Part.from_bytes(data=ref_path.read_bytes(), mime_type="image/png"))
        contents.append(f"[{ref['id']}]: {ref['role']}")

    final_prompt = spec["prompt"]
    if args.prompt_override:
        final_prompt += f"\n\nADDITIONAL LEXICAL CORRECTION:\n{args.prompt_override}"
    contents.append(final_prompt)

    print(f"[VERTEX-AI] Generating candidate image with {spec.get('model_id', 'gemini-2.5-flash-image')}...")
    response = client.models.generate_content(
        model=spec.get("model_id", "gemini-2.5-flash-image"),
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=spec["system_instruction"],
            temperature=spec.get("temperature", 0.15),
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    staging_path = repo_root / spec["staging_output"]
    staging_path.parent.mkdir(parents=True, exist_ok=True)

    saved_image = False
    for part in response.candidates[0].content.parts:
        if part.inline_data and part.inline_data.data:
            staging_path.write_bytes(part.inline_data.data)
            saved_image = True
            break

    if not saved_image:
        print("[ERROR] Vertex AI response did not contain an image part.", file=sys.stderr)
        sys.exit(1)

    print(f"[STAGING] Candidate saved to: {staging_path.relative_to(repo_root)} ({staging_path.stat().st_size} bytes)")

    if not args.skip_audit:
        print("[FORENSIC-JUDGE] Auditing candidate image with gemini-2.5-flash...")
        report = audit_image(spec_path, staging_path, repo_root)
        print("\n" + format_markdown_table(report) + "\n")
        if report.get("overall_status") == "FAIL":
            print("[REJECTED] Candidate failed forensic validation. Kept in _staging/ for inspection; NOT promoted to production.")
            sys.exit(2)

    for target_rel in spec["target_outputs"]:
        target_path = repo_root / target_rel
        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(staging_path, target_path)
        print(f"[PROMOTED] Copied certified asset to: {target_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
