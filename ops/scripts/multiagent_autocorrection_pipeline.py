#!/usr/bin/env python3
"""
Multi-Agent Auto-Correction Hardware Synthesis Pipeline for QZ-HUB.

Architecture:
1. Agent Synthesizer (Vertex AI gemini-2.5-flash-image):
   Generates candidates using pure Zero-Cutout stock references + exact micro-texture prompts.
2. Agent Adversarial Forensic Critic (Vertex AI gemini-2.5-flash):
   Audits candidate image directly against the 6 stock PNGs. Returns quantitative scores (0-100)
   and granular corrective feedback for each product.
3. Orchestrator Loop:
   Iterates up to max_retries, incorporating adversarial feedback into subsequent generation attempts.
"""

import os
import sys
import json
import time
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def get_client(project_id="gen-lang-client-0929068122", location="us-central1"):
    from google import genai
    return genai.Client(vertexai=True, project=project_id, location=location)

def audit_candidate_adversarial(client, candidate_bytes: bytes, stock_dir: Path) -> dict:
    from google.genai import types

    tab_bytes = (stock_dir / "smarttabs/smarttab_blanco_frontal.png").read_bytes()
    band_bytes = (stock_dir / "smartbands/smartband_plastico_blanco_frontal.png").read_bytes()
    ring_bytes = (stock_dir / "smartrings/smartring_blanco_frontal.png").read_bytes()
    sound_bytes = (stock_dir / "smartsound/smartsound_blanco_frontal.png").read_bytes()
    watch_bytes = (stock_dir / "smartwatches/smartwatch_blanco_frontal.png").read_bytes()
    phone_bytes = (stock_dir / "smartphones/smartphone_blanco_trasero.png").read_bytes()

    audit_prompt = """You are an Adversarial Forensic Vision Auditor for Zentry Hardware Photography.
Evaluate the CANDIDATE IMAGE (Image 1) against the 6 AUTHENTIC STOCK REFERENCES (Images 2-7).

Evaluate each of the 6 devices with ruthless accuracy:
1. SmartSound: Must have seamless LIGHT-GREY WOVEN FABRIC MESH covering the cylindrical body, a FLAT SMOOTH WHITE TOP PLATE, and upright cylindrical proportions. (FAIL if smooth plain white, fail if squat, fail if micro-perforated top grille).
2. SmartWatch: Must have a POLISHED CIRCULAR SILVER CASE, TWO ROUND BUTTONS on the right edge, LUG STRAP CONNECTIONS, and a DYNAMIC PURPLE/BLUE SWIRL DIAL. (FAIL if square, fail if black bezel, fail if missing side buttons, fail if generic health ring UI).
3. SmartBand: Must have a WHITE SILICONE STRAP WITH DISTINCT PARALLEL RIBBED GROOVES, a POLISHED BRIGHT SILVER RECTANGULAR CAPSULE with a SIDE BUTTON. (FAIL if smooth untextured strap, fail if hollow ring, fail if missing silver capsule).
4. SmartRing: Must have POLISHED SILVER METAL WITH CHAMFERED EDGES and a DISTINCT RECESSED MATTE OFF-WHITE PEBBLED/MOSAIC INLAY. Exactly 2 rings! (FAIL if plain smooth metallic bands without the textured white inlay, fail if wrong count).
5. SmartPhone: Must have a PRISTINE MATTE PEARL-WHITE BACK with ZERO TEXT, and an upper-left vertical pill island with EXACTLY TWO LARGE CIRCULAR STACKED LENSES. (FAIL if logos, text, or 3 lenses).
6. SmartTab: Must be in landscape 16:10 orientation, ultra-thin bezels (<4%), with an iridescent pearlescent swirling fluid wallpaper.

Return strictly valid JSON:
{
  "scores": {
    "smartsound": int (0-100),
    "smartwatch": int (0-100),
    "smartband": int (0-100),
    "smartring": int (0-100),
    "smartphone": int (0-100),
    "smarttab": int (0-100)
  },
  "overall_score": int (0-100),
  "verdict": "PASS" (if overall_score >= 85 and every device >= 80) or "FAIL",
  "device_feedback": {
    "smartsound": "specific critique",
    "smartwatch": "specific critique",
    "smartband": "specific critique",
    "smartring": "specific critique",
    "smartphone": "specific critique",
    "smarttab": "specific critique"
  },
  "correction_directives_for_next_iteration": "concise instructions for the generator to fix the defects"
}"""

    contents = [
        types.Part.from_bytes(data=candidate_bytes, mime_type="image/png"),
        "IMAGE 1: CANDIDATE GENERATED SET",
        types.Part.from_bytes(data=sound_bytes, mime_type="image/png"),
        "IMAGE 2: AUTHENTIC STOCK SmartSound (woven light-grey fabric cylinder, flat white top plate)",
        types.Part.from_bytes(data=watch_bytes, mime_type="image/png"),
        "IMAGE 3: AUTHENTIC STOCK SmartWatch (polished circular silver case, 2 round right buttons, purple/blue swirl dial)",
        types.Part.from_bytes(data=band_bytes, mime_type="image/png"),
        "IMAGE 4: AUTHENTIC STOCK SmartBand (ribbed white silicone strap, polished silver capsule, side button)",
        types.Part.from_bytes(data=ring_bytes, mime_type="image/png"),
        "IMAGE 5: AUTHENTIC STOCK SmartRing (polished silver chamfered ring with textured pebbled white inlay)",
        types.Part.from_bytes(data=phone_bytes, mime_type="image/png"),
        "IMAGE 6: AUTHENTIC STOCK SmartPhone (matte pearl white back, 2 stacked large lenses, zero text)",
        types.Part.from_bytes(data=tab_bytes, mime_type="image/png"),
        "IMAGE 7: AUTHENTIC STOCK SmartTab (landscape 16:10, ultra-thin bezels, iridescent swirl wallpaper)",
        audit_prompt
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.0,
            response_mime_type="application/json"
        )
    )

    try:
        return json.loads(response.text)
    except Exception as e:
        return {"overall_score": 0, "verdict": "ERROR", "error": str(e), "raw": response.text}

def run_multiagent_pipeline(repo_root: Path, max_iterations=3):
    client = get_client()
    stock_dir = repo_root / "public/assets/products"
    staging_dir = repo_root / "public/assets/repertorio/_staging"
    staging_dir.mkdir(parents=True, exist_ok=True)

    from google.genai import types

    # Load 6 stock reference images + scene anchor
    sound_bytes = (stock_dir / "smartsound/smartsound_blanco_frontal.png").read_bytes()
    watch_bytes = (stock_dir / "smartwatches/smartwatch_blanco_frontal.png").read_bytes()
    watch_profile = (stock_dir / "smartwatches/vistas/smartwatch_blanco_perfil_lateral.png").read_bytes()
    band_bytes = (stock_dir / "smartbands/smartband_plastico_blanco_frontal.png").read_bytes()
    ring_bytes = (stock_dir / "smartrings/smartring_blanco_frontal.png").read_bytes()
    phone_bytes = (stock_dir / "smartphones/smartphone_blanco_trasero.png").read_bytes()
    tab_bytes = (stock_dir / "smarttabs/smarttab_blanco_frontal.png").read_bytes()
    anchor_bytes = (stock_dir / "sets/set_nuclear_1h_omni.png").read_bytes()

    history_feedback = ""
    best_candidate_path = None
    best_score = -1

    for iteration in range(1, max_iterations + 1):
        print(f"\n{'='*70}")
        print(f"🔄 [ORCHESTRATOR] Iteration {iteration} of {max_iterations}")
        print(f"{'='*70}")

        base_prompt = f"""High-end commercial catalog studio product photography of the complete seven-piece white Zentry hardware family set on a seamless pure white studio cyclorama (#FFFFFF, RGB 255,255,255) with soft specular reflections and delicate ambient occlusion grounding shadows, shot with an 85mm lens at f/8.

SPATIAL COMPOSITION (7 DEVICES TOTAL):
1. CENTER-BACK: 1x White Zentry SmartTab (MATCHING IMAGE 7 EXACTLY) in 16:10 horizontal landscape (~250mm wide), ultra-thin dark bezels (<4%), polished silver frame, displaying an iridescent pearlescent swirling fluid wallpaper on screen.
2. BACK-LEFT: 1x White Zentry SmartSound Speaker (MATCHING IMAGE 2 EXACTLY):
   - Form: Upright minimalist cylinder.
   - Body finish: Seamless LIGHT-GREY FINELY WOVEN ACOUSTIC FABRIC MESH texture covering the entire cylinder body.
   - Top & Base: Smooth, flat matte-white top plate with rounded rim; subtle darker translucent elevated base. STRICTLY NOT plain white plastic body, MUST HAVE THE VISIBLE WOVEN FABRIC TEXTURE.
3. FRONT-LEFT (in front of tablet): 1x White Zentry SmartBand (MATCHING IMAGE 4 EXACTLY):
   - Strap: Matte white flexible silicone strap with DISTINCT TRANSVERSE PARALLEL RIBBED GROOVES.
   - Central Module: Polished rectangular bright silver metal capsule housing a flush dark vertical screen, with an elongated polished silver button on its right flank. STRICTLY NOT smooth, MUST SHOW THE PARALLEL RIBBING.
4. FOREGROUND-CENTER: Exactly 2x White/Silver Zentry SmartRings (MATCHING IMAGE 5 EXACTLY):
   - Anatomy: Miniature finger scale (~20mm diameter), standing upright on their edges at a 3/4 angle.
   - Materials: Highly polished reflective silver metal with chamfered edges, featuring a distinct recessed matte off-white PEBBLED/MOSAIC TEXTURED INLAY. Showing open circular centers and metallic interior.
5. FOREGROUND-RIGHT: 1x White Zentry SmartWatch (MATCHING IMAGE 3 & 4 EXACTLY):
   - Chassis: STRICTLY CIRCULAR case body (100% ROUND 44mm) in polished satin silver aluminum.
   - Dial Display: Edge-to-edge round display showing a VIBRANT DYNAMIC ABSTRACT SWIRLING PATTERN IN PURPLE, BLUE, AND BLACK.
   - Controls: Exactly TWO distinct round polished silver push-buttons on the right side of the metallic case.
   - Strap: White matte silicone sports strap with clean lug integration.
6. BACK-RIGHT: 1x White Zentry SmartPhone (MATCHING IMAGE 6 EXACTLY):
   - Orientation: Standing upright in 3/4 angle, SHOWN STRICTLY FROM THE BACK (Rear View).
   - Backplate: Pristine frosted pearl-white glass back with 100% ZERO TEXT, ZERO LOGOS, ZERO BRANDING.
   - Camera: Vertical pill-shaped island in upper-left corner with EXACTLY TWO LARGE CIRCULAR CAMERA LENSES stacked vertically and single flash.

STRICT ZERO-DEFECT RULES:
- Zero text or brand logos anywhere on casings.
- SmartSound must have visible light-grey fabric mesh on its body.
- SmartWatch must have circular case, 2 round side buttons, and purple/blue swirl dial.
- SmartBand must have ribbed strap and silver capsule with button.
- SmartRings must be exactly 2 and have textured pebbled white inlay.
"""
        if history_feedback:
            base_prompt += f"\n\nCRITICAL ADVERSARIAL FEEDBACK FROM PREVIOUS RUN - FIX THESE DEFECTS IMMEDIATELY:\n{history_feedback}\n"

        contents = [
            types.Part.from_bytes(data=anchor_bytes, mime_type="image/png"),
            "[IMAGE 1 - SCENE ANCHOR]: Spatial layout, studio lighting, and floor reflection reference.",
            types.Part.from_bytes(data=sound_bytes, mime_type="image/png"),
            "[IMAGE 2 - SMARTSOUND]: Authentic fabric mesh cylinder, smooth flat white top, distinct base.",
            types.Part.from_bytes(data=watch_bytes, mime_type="image/png"),
            "[IMAGE 3 - SMARTWATCH]: Authentic round silver watch, 2 buttons on right, purple/blue swirl screen.",
            types.Part.from_bytes(data=watch_profile, mime_type="image/png"),
            "[IMAGE 3B - SMARTWATCH PROFILE]: Side view showing 2 flat buttons on right.",
            types.Part.from_bytes(data=band_bytes, mime_type="image/png"),
            "[IMAGE 4 - SMARTBAND]: Authentic ribbed silicone strap, rectangular silver capsule, side button.",
            types.Part.from_bytes(data=ring_bytes, mime_type="image/png"),
            "[IMAGE 5 - SMARTRING]: Authentic chamfered silver ring with pebbled white inlay.",
            types.Part.from_bytes(data=phone_bytes, mime_type="image/png"),
            "[IMAGE 6 - SMARTPHONE]: Authentic matte pearl white back, 2 large stacked lenses, zero text.",
            types.Part.from_bytes(data=tab_bytes, mime_type="image/png"),
            "[IMAGE 7 - SMARTTAB]: Authentic landscape 16:10, ultra-thin bezels, iridescent swirl wallpaper.",
            base_prompt
        ]

        print("[AGENT 1 - SYNTHESIZER] Generating image candidate with gemini-2.5-flash-image...")
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0.10,
                response_modalities=["IMAGE", "TEXT"]
            )
        )

        candidate_bytes = None
        for p in response.candidates[0].content.parts:
            if getattr(p, "inline_data", None) and p.inline_data.data:
                candidate_bytes = p.inline_data.data
                break

        if not candidate_bytes:
            print("[ERROR] No image returned in response. Retrying...")
            continue

        cand_filename = f"set_nuclear_1h_fullhouse_iter_{iteration}.png"
        cand_path = staging_dir / cand_filename
        cand_path.write_bytes(candidate_bytes)
        print(f"[STAGING] Saved candidate: {cand_path} ({len(candidate_bytes)} bytes)")

        print("[AGENT 2 - ADVERSARIAL CRITIC] Auditing candidate against 6 authentic stock references...")
        audit = audit_candidate_adversarial(client, candidate_bytes, stock_dir)
        print(f"📊 Audit Result (Iter {iteration}):")
        print(f"   - Overall Score: {audit.get('overall_score')}/100")
        print(f"   - Verdict: {audit.get('verdict')}")
        print(f"   - Device Scores: {json.dumps(audit.get('scores', {}))}")
        if audit.get("device_feedback"):
            for dev, fb in audit["device_feedback"].items():
                print(f"     * {dev}: {fb}")

        score = audit.get("overall_score", 0)
        if score > best_score:
            best_score = score
            best_candidate_path = cand_path

        if audit.get("verdict") == "PASS":
            print(f"\n🎉 [ORCHESTRATOR] SUCCESS! Candidate achieved PASS with score {score}/100!")
            break
        else:
            directives = audit.get("correction_directives_for_next_iteration", "")
            print(f"⚠️  [CRITIC DIRECTIVES]: {directives}")
            history_feedback = directives

    print(f"\n{'='*70}")
    print(f"🏁 Pipeline Complete. Best candidate: {best_candidate_path} (Score: {best_score}/100)")
    print(f"{'='*70}")

    if best_candidate_path and best_candidate_path.exists():
        target_outputs = [
            repo_root / "public/assets/products/sets/set_nuclear_1h_fullhouse.png",
            repo_root / "public/assets/products/sets/set_fullhouse_blanco_studio.png",
            repo_root / "public/assets/repertorio/sets/set_nuclear_1h_fullhouse.png",
            repo_root / "public/assets/repertorio/set_nuclear_1h_fullhouse.png",
            repo_root / "public/assets/repertorio/_anchors/set_nuclear_1h_fullhouse.png",
            repo_root / "public/assets/repertorio/pruebas_set_essential/set_nuclear_1h_fullhouse.png",
        ]
        import shutil
        for t in target_outputs:
            t.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(best_candidate_path, t)
            print(f"✅ Promoted to: {t}")
        return True
    return False

if __name__ == "__main__":
    repo_root = Path(r"D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB")
    run_multiagent_pipeline(repo_root, max_iterations=2)
