#!/usr/bin/env python3
"""
QZ-HUB AGENT BRIDGE & CLAUDE-STYLE REMOTE SESSION CONTROLLER (v3.0)
===================================================================
Connects your laptop's Antigravity (AGY) sessions, real-time transcripts,
artifacts (*.md), tasks, screenshots, and terminal to your mobile PWA via Firebase.
"""

import os
import sys
import time
import json
import subprocess
import threading
import traceback
import base64
import glob
from datetime import datetime, timezone
from io import BytesIO

# Fix Windows console encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure requests
try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

# Ensure PIL for screen captures
try:
    from PIL import ImageGrab
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/qz-hub/databases/(default)/documents"
COLLECTION_TASKS = "qz_remote_tasks"
COLLECTION_TELEMETRY = "qz_remote_telemetry"
COLLECTION_MEDIA = "qz_remote_media"
COLLECTION_LOGS = "qz_remote_terminal_logs"
COLLECTION_SESSIONS = "qz_remote_sessions"

BRAIN_DIR = os.path.expanduser(r"~\.gemini\antigravity-cli\brain")
DEVICE_NAME = os.environ.get("COMPUTERNAME", "PC-Local-JoseAngel")
IS_RUNNING = True
LAST_PROCESSED_TASK_ID = None

CURRENT_TARGET_SESSION_ID = None
LAST_TRANSCRIPT_LINE_COUNT = 0


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ─── FIRESTORE REST API CLIENT ────────────────────────────────────────────────
def get_firestore_doc(collection, doc_id="master"):
    url = f"{FIRESTORE_BASE_URL}/{collection}/{doc_id}"
    try:
        r = requests.get(url, timeout=8)
        if r.status_code == 200:
            data = r.json()
            return parse_firestore_fields(data.get("fields", {}))
        return None
    except Exception:
        return None


def set_firestore_doc(collection, doc_id, data_dict):
    url = f"{FIRESTORE_BASE_URL}/{collection}/{doc_id}"
    fields = encode_firestore_fields(data_dict)
    payload = {"fields": fields}
    try:
        r = requests.patch(url, json=payload, timeout=8)
        return r.status_code == 200
    except Exception:
        return False


def parse_firestore_fields(fields):
    result = {}
    for k, v in fields.items():
        if "stringValue" in v:
            result[k] = v["stringValue"]
        elif "integerValue" in v:
            result[k] = int(v["integerValue"])
        elif "doubleValue" in v:
            result[k] = float(v["doubleValue"])
        elif "booleanValue" in v:
            result[k] = v["booleanValue"]
        elif "mapValue" in v:
            result[k] = parse_firestore_fields(v["mapValue"].get("fields", {}))
        elif "arrayValue" in v:
            values = v["arrayValue"].get("values", [])
            parsed_list = []
            for item in values:
                if "stringValue" in item:
                    parsed_list.append(item["stringValue"])
                elif "mapValue" in item:
                    parsed_list.append(parse_firestore_fields(item["mapValue"].get("fields", {})))
                else:
                    parsed_list.append(item)
            result[k] = parsed_list
    return result


def encode_firestore_fields(data):
    fields = {}
    for k, v in data.items():
        if isinstance(v, str):
            fields[k] = {"stringValue": v}
        elif isinstance(v, bool):
            fields[k] = {"booleanValue": v}
        elif isinstance(v, int):
            fields[k] = {"integerValue": str(v)}
        elif isinstance(v, float):
            fields[k] = {"doubleValue": v}
        elif isinstance(v, dict):
            fields[k] = {"mapValue": {"fields": encode_firestore_fields(v)}}
        elif isinstance(v, list):
            vals = []
            for item in v:
                if isinstance(item, str):
                    vals.append({"stringValue": item})
                elif isinstance(item, dict):
                    vals.append({"mapValue": {"fields": encode_firestore_fields(item)}})
            fields[k] = {"arrayValue": {"values": vals}}
    return fields


# ─── SCREENSHOT CAPTURE ───────────────────────────────────────────────────────
def capture_screen_base64():
    if not HAS_PIL:
        return None
    try:
        screenshot = ImageGrab.grab()
        max_width = 1280
        if screenshot.width > max_width:
            ratio = max_width / float(screenshot.width)
            new_height = int((float(screenshot.height) * float(ratio)))
            screenshot = screenshot.resize((max_width, new_height))

        buffered = BytesIO()
        screenshot.save(buffered, format="JPEG", quality=75)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"Error capturando pantalla: {e}")
        return None


def push_terminal_log_chunk(line, stream_type="stdout"):
    try:
        log_payload = {
            "timestamp": now_iso(),
            "type": stream_type,
            "line": line.rstrip("\r\n"),
            "activeCmd": ProcessManager.get_active_cmd()
        }
        set_firestore_doc(COLLECTION_LOGS, "live_stream", log_payload)
    except Exception:
        pass


# ─── PROCESS MANAGER ──────────────────────────────────────────────────────────
class ProcessManager:
    active_process = None
    active_cmd = ""
    lock = threading.Lock()

    @classmethod
    def is_running(cls):
        with cls.lock:
            return cls.active_process is not None and cls.active_process.poll() is None

    @classmethod
    def get_active_cmd(cls):
        with cls.lock:
            return cls.active_cmd if (cls.active_process is not None and cls.active_process.poll() is None) else "idle"

    @classmethod
    def start(cls, cmd, cwd=None):
        if not cwd or not os.path.exists(cwd):
            cwd = os.getcwd()

        clean_cmd = cmd.strip()
        # Formato optimizado para agy no interactivo si se envía un prompt
        if clean_cmd.startswith("agy ") and not any(flag in clean_cmd for flag in ["--print", "-p", "-i", "--help", "version", "agent", "plugin"]):
            prompt_content = clean_cmd[4:].strip()
            if (prompt_content.startswith('"') and prompt_content.endswith('"')) or (prompt_content.startswith("'") and prompt_content.endswith("'")):
                clean_cmd = f'agy -p --dangerously-skip-permissions {prompt_content}'
            else:
                clean_cmd = f'agy -p --dangerously-skip-permissions "{prompt_content}"'

        with cls.lock:
            if cls.active_process and cls.active_process.poll() is None:
                try:
                    cls.active_process.terminate()
                except Exception:
                    pass

            try:
                print(f"🚀 [Bridge] Ejecutando: {clean_cmd}")
                push_terminal_log_chunk(f"$ {clean_cmd}", "cmd-input")

                proc = subprocess.Popen(
                    clean_cmd,
                    shell=True,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                    cwd=cwd,
                    encoding="utf-8",
                    errors="replace"
                )
                cls.active_process = proc
                cls.active_cmd = clean_cmd

                t = threading.Thread(target=cls._reader, args=(proc,), daemon=True)
                t.start()
                return True, f"Proceso iniciado: {clean_cmd}"
            except Exception as e:
                return False, str(e)

    @classmethod
    def _reader(cls, proc):
        try:
            while True:
                line = proc.stdout.readline()
                if not line:
                    if proc.poll() is not None:
                        break
                    time.sleep(0.05)
                    continue

                print(line, end="", flush=True)
                push_terminal_log_chunk(line, "stdout")
        except Exception as e:
            print(f"Error en reader: {e}")
        finally:
            with cls.lock:
                if cls.active_process == proc:
                    cls.active_process = None
                    cls.active_cmd = ""
            push_terminal_log_chunk("[Proceso finalizado]", "info")

    @classmethod
    def send_stdin(cls, text):
        with cls.lock:
            if cls.active_process and cls.active_process.poll() is None:
                try:
                    print(f"📥 [STDIN] -> {text}")
                    cls.active_process.stdin.write(text + "\n")
                    cls.active_process.stdin.flush()
                    push_terminal_log_chunk(f"> {text}", "stdin")
                    return True, "Input enviado exitosamente"
                except Exception as e:
                    return False, f"Error escribiendo a stdin: {e}"
            else:
                return False, "No hay proceso interactivo activo"

    @classmethod
    def kill(cls):
        with cls.lock:
            if cls.active_process and cls.active_process.poll() is None:
                try:
                    cls.active_process.terminate()
                except Exception:
                    pass
            cls.active_process = None
            cls.active_cmd = ""
            push_terminal_log_chunk("[Proceso detenido por el usuario]", "info")
            return True


# ─── ANTIGRAVITY SESSION SCANNER & REALTIME SYNC ──────────────────────────────
def scan_antigravity_sessions():
    """Escanea ~/.gemini/antigravity-cli/brain para extraer sesiones reales, markdowns y transcripciones."""
    if not os.path.exists(BRAIN_DIR):
        return [], None

    sessions = []
    try:
        entries = [d for d in os.listdir(BRAIN_DIR) if os.path.isdir(os.path.join(BRAIN_DIR, d))]
    except Exception:
        return [], None

    for conv_id in entries:
        conv_path = os.path.join(BRAIN_DIR, conv_id)
        transcript_path = os.path.join(conv_path, ".system_generated", "logs", "transcript.jsonl")

        title = "Sesión Antigravity"
        last_msg_snippet = ""
        total_messages = 0

        if os.path.exists(transcript_path):
            try:
                with open(transcript_path, "r", encoding="utf-8", errors="ignore") as tf:
                    for line in tf:
                        if not line.strip():
                            continue
                        try:
                            d = json.loads(line)
                            step_type = d.get("type", "")
                            content = d.get("content", "")
                            if step_type == "USER_INPUT" and title == "Sesión Antigravity" and content:
                                clean_t = content.replace("<USER_REQUEST>", "").replace("</USER_REQUEST>", "").strip()
                                first_line = clean_t.split("\n")[0][:70]
                                if first_line:
                                    title = first_line
                            if content:
                                total_messages += 1
                                last_msg_snippet = content.replace("\n", " ")[:100]
                        except Exception:
                            pass
            except Exception:
                pass

        artifacts = []
        try:
            for f in os.listdir(conv_path):
                if f.endswith(".md"):
                    f_path = os.path.join(conv_path, f)
                    try:
                        f_size = os.path.getsize(f_path)
                        artifacts.append({
                            "filename": f,
                            "path": f_path,
                            "size": f_size,
                            "updatedAt": datetime.fromtimestamp(os.path.getmtime(f_path), tz=timezone.utc).isoformat()
                        })
                    except Exception:
                        pass
        except Exception:
            pass

        tasks_count = 0
        tasks_dir = os.path.join(conv_path, ".system_generated", "tasks")
        if os.path.exists(tasks_dir):
            try:
                tasks_count = len([f for f in os.listdir(tasks_dir) if f.endswith(".log")])
            except Exception:
                pass

        try:
            mtime = os.path.getmtime(conv_path)
        except Exception:
            mtime = 0

        sessions.append({
            "id": conv_id,
            "title": title,
            "mtime": mtime,
            "updatedAt": datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat(),
            "artifactsCount": len(artifacts),
            "artifacts": artifacts,
            "totalMessages": total_messages,
            "lastMessage": last_msg_snippet,
            "tasksCount": tasks_count
        })

    sessions.sort(key=lambda s: s["mtime"], reverse=True)
    active_session = sessions[0] if sessions else None
    return sessions[:15], active_session


def get_session_transcript_feed(conv_id):
    """Lee el transcript de la sesión y formatea los mensajes para el chat móvil."""
    conv_path = os.path.join(BRAIN_DIR, conv_id)
    transcript_path = os.path.join(conv_path, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(transcript_path):
        return []

    messages = []
    try:
        with open(transcript_path, "r", encoding="utf-8", errors="ignore") as tf:
            for line in tf:
                if not line.strip():
                    continue
                try:
                    d = json.loads(line)
                    msg_type = d.get("type", "")
                    content = d.get("content", "")
                    tool_calls = d.get("tool_calls", [])
                    step_idx = d.get("step_index", 0)

                    if msg_type == "USER_INPUT" and content:
                        clean_text = content.replace("<USER_REQUEST>", "").replace("</USER_REQUEST>", "")
                        if "<ADDITIONAL_METADATA>" in clean_text:
                            clean_text = clean_text.split("<ADDITIONAL_METADATA>")[0]
                        clean_text = clean_text.strip()
                        if clean_text:
                            messages.append({
                                "id": f"step_{step_idx}_user",
                                "sender": "user",
                                "text": clean_text,
                                "type": "text"
                            })

                    elif msg_type == "PLANNER_RESPONSE":
                        if content and content.strip():
                            messages.append({
                                "id": f"step_{step_idx}_bot",
                                "sender": "bot",
                                "text": content.strip(),
                                "type": "text"
                            })
                        elif tool_calls:
                            tool_names = [tc.get("name", "tool") for tc in tool_calls if isinstance(tc, dict)]
                            actions = [tc.get("args", {}).get("toolAction", "") for tc in tool_calls if isinstance(tc, dict) and "args" in tc]
                            summary = ", ".join(filter(None, actions)) or ", ".join(tool_names)
                            messages.append({
                                "id": f"step_{step_idx}_tool",
                                "sender": "bot",
                                "text": f"🛠️ **Acción:** {summary}",
                                "type": "tool_activity"
                            })
                except Exception:
                    pass
    except Exception as e:
        print(f"Error leyendo transcript: {e}")

    return messages[-35:]


# ─── TELEMETRY & SESSION SYNC LOOP ────────────────────────────────────────────
def telemetry_and_sessions_loop():
    global CURRENT_TARGET_SESSION_ID
    while IS_RUNNING:
        try:
            sessions, active_session = scan_antigravity_sessions()

            target_id = CURRENT_TARGET_SESSION_ID or (active_session["id"] if active_session else None)

            telemetry_data = {
                "deviceName": DEVICE_NAME,
                "status": "online",
                "lastSeen": now_iso(),
                "os": sys.platform,
                "cwd": os.getcwd(),
                "hasScreenCapture": HAS_PIL,
                "activeProcess": ProcessManager.get_active_cmd(),
                "isInteractiveRunning": ProcessManager.is_running(),
                "activeSessionId": target_id or "none",
                "activeSessionTitle": active_session["title"] if active_session else "Sin sesión activa"
            }
            set_firestore_doc(COLLECTION_TELEMETRY, "pc_host", telemetry_data)

            if sessions:
                sessions_payload = {
                    "updatedAt": now_iso(),
                    "total": len(sessions),
                    "activeId": target_id or sessions[0]["id"],
                    "sessions": sessions
                }
                set_firestore_doc(COLLECTION_SESSIONS, "session_list", sessions_payload)

                current_conv_id = target_id or sessions[0]["id"]
                current_meta = next((s for s in sessions if s["id"] == current_conv_id), sessions[0])
                messages_feed = get_session_transcript_feed(current_conv_id)

                active_doc_payload = {
                    "id": current_conv_id,
                    "title": current_meta.get("title", "Sesión Antigravity"),
                    "updatedAt": now_iso(),
                    "artifacts": current_meta.get("artifacts", []),
                    "messages": messages_feed,
                    "tasksCount": current_meta.get("tasksCount", 0)
                }
                set_firestore_doc(COLLECTION_SESSIONS, "active_session", active_doc_payload)

        except Exception as e:
            print(f"Error en telemetry loop: {e}")

        time.sleep(3.5)


# ─── TASK WORKER LOOP (RECEIVES COMMANDS FROM MOBILE) ─────────────────────────
def task_worker_loop():
    global LAST_PROCESSED_TASK_ID, CURRENT_TARGET_SESSION_ID
    print("🟢 Escuchando comandos y tareas remotas de QZ-HUB...")

    while IS_RUNNING:
        try:
            task_doc = get_firestore_doc(COLLECTION_TASKS, "current_task")
            if task_doc and task_doc.get("status") == "pending":
                task_id = task_doc.get("id")
                if task_id and task_id != LAST_PROCESSED_TASK_ID:
                    LAST_PROCESSED_TASK_ID = task_id
                    action = task_doc.get("action")
                    print(f"⚡ [Bridge Task] [{action}] ID: {task_id}")

                    task_doc["status"] = "running"
                    task_doc["startedAt"] = now_iso()
                    set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

                    if action == "exec_command":
                        cmd = task_doc.get("command", "").strip()
                        cwd = task_doc.get("cwd", os.getcwd())

                        if ProcessManager.is_running() and not cmd.startswith("agy") and not cmd.startswith("python"):
                            success, msg = ProcessManager.send_stdin(cmd)
                            task_doc["status"] = "completed"
                            task_doc["result"] = {"message": msg, "mode": "stdin"}
                        else:
                            success, msg = ProcessManager.start(cmd, cwd)
                            task_doc["status"] = "completed" if success else "error"
                            task_doc["result"] = {"message": msg, "mode": "process_started"}

                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

                    elif action == "send_stdin":
                        text = task_doc.get("input", "")
                        success, msg = ProcessManager.send_stdin(text)
                        task_doc["status"] = "completed" if success else "error"
                        task_doc["result"] = {"message": msg}
                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

                    elif action == "kill_process":
                        ProcessManager.kill()
                        task_doc["status"] = "completed"
                        task_doc["result"] = {"message": "Proceso detenido"}
                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

                    elif action == "take_screenshot":
                        img_b64 = capture_screen_base64()
                        if img_b64:
                            media_doc = {
                                "timestamp": now_iso(),
                                "type": "screenshot",
                                "data": img_b64,
                                "source": DEVICE_NAME
                            }
                            set_firestore_doc(COLLECTION_MEDIA, "latest_screenshot", media_doc)
                            task_doc["status"] = "completed"
                            task_doc["result"] = {"message": "Captura exitosa"}
                        else:
                            task_doc["status"] = "error"
                            task_doc["result"] = {"error": "Error al capturar pantalla"}

                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

                    elif action == "read_markdown" or action == "read_artifact":
                        filepath = task_doc.get("filepath", "")
                        if not filepath and "sessionId" in task_doc and "filename" in task_doc:
                            filepath = os.path.join(BRAIN_DIR, task_doc["sessionId"], task_doc["filename"])

                        if filepath and os.path.exists(filepath) and os.path.isfile(filepath):
                            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                                content = f.read()
                            task_doc["status"] = "completed"
                            task_doc["result"] = {
                                "content": content,
                                "filepath": filepath,
                                "filename": os.path.basename(filepath)
                            }
                        else:
                            task_doc["status"] = "error"
                            task_doc["result"] = {"error": f"El archivo {filepath} no existe"}

                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

                    elif action == "switch_session":
                        req_session_id = task_doc.get("sessionId", "")
                        if req_session_id:
                            CURRENT_TARGET_SESSION_ID = req_session_id
                            print(f"🔄 [Bridge] Sesión activa cambiada a: {req_session_id}")
                        task_doc["status"] = "completed"
                        task_doc["result"] = {"activeSessionId": CURRENT_TARGET_SESSION_ID}
                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

        except Exception as e:
            print(f"Error procesando tarea: {e}")
            traceback.print_exc()

        time.sleep(1.0)


def main():
    print("=" * 65)
    print("🤖 QZ-HUB AGENT BRIDGE & CLAUDE REMOTE COMPANION (v3.0)")
    print(f"Dispositivo: {DEVICE_NAME}")
    print(f"Directorio de Trabajo: {os.getcwd()}")
    print(f"Directorio Antigravity Brain: {BRAIN_DIR}")
    print("=" * 65)

    t1 = threading.Thread(target=telemetry_and_sessions_loop, daemon=True)
    t2 = threading.Thread(target=task_worker_loop, daemon=True)

    t1.start()
    t2.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo bridge...")


if __name__ == "__main__":
    main()
