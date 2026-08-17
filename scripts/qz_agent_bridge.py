#!/usr/bin/env python3
"""
QZ-HUB AGENT BRIDGE & INTERACTIVE REMOTE TERMINAL (v2.1)
========================================================
Thread-safe Class-based Process Manager for AGY, PowerShell, Python & Bash.
"""

import os
import sys
import time
import json
import subprocess
import threading
import traceback
import base64
from datetime import datetime, timezone
from io import BytesIO

# Requerimientos básicos
try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

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

DEVICE_NAME = os.environ.get("COMPUTERNAME", "PC-Local-JoseAngel")
IS_RUNNING = True
LAST_PROCESSED_TASK_ID = None

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def get_firestore_doc(collection, doc_id="master"):
    url = f"{FIRESTORE_BASE_URL}/{collection}/{doc_id}"
    try:
        r = requests.get(url, timeout=8)
        if r.status_code == 200:
            data = r.json()
            return parse_firestore_fields(data.get("fields", {}))
        return None
    except Exception as e:
        return None

def set_firestore_doc(collection, doc_id, data_dict):
    url = f"{FIRESTORE_BASE_URL}/{collection}/{doc_id}"
    fields = encode_firestore_fields(data_dict)
    payload = {"fields": fields}
    try:
        r = requests.patch(url, json=payload, timeout=8)
        return r.status_code == 200
    except Exception as e:
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
        screenshot.save(buffered, format="JPEG", quality=70)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"Error capturando pantalla: {e}")
        return None

def push_terminal_log_chunk(line, stream_type="stdout"):
    """Envía un fragmento de salida en tiempo real a Firestore."""
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

class ProcessManager:
    """Administrador de procesos thread-safe sin dependencias de variables globales sueltas."""
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

        with cls.lock:
            if cls.active_process and cls.active_process.poll() is None:
                try:
                    cls.active_process.terminate()
                except Exception:
                    pass

            try:
                proc = subprocess.Popen(
                    cmd,
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
                cls.active_cmd = cmd
                
                t = threading.Thread(target=cls._reader, args=(proc,), daemon=True)
                t.start()
                return True, "Proceso iniciado en streaming"
            except Exception as e:
                return False, str(e)

    @classmethod
    def _reader(cls, proc):
        accumulated_lines = []
        try:
            for raw_line in iter(proc.stdout.readline, ''):
                if not raw_line:
                    break
                print(raw_line, end="")
                accumulated_lines.append(raw_line)
                push_terminal_log_chunk(raw_line, "stdout")
                
                if len(accumulated_lines) > 200:
                    accumulated_lines = accumulated_lines[-100:]
        except Exception as e:
            print(f"Error en reader thread: {e}")
        finally:
            with cls.lock:
                if cls.active_process == proc:
                    cls.active_process = None
                    cls.active_cmd = ""

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
            return True

def telemetry_loop():
    while IS_RUNNING:
        try:
            is_active = ProcessManager.is_running()
            telemetry_data = {
                "deviceName": DEVICE_NAME,
                "status": "online",
                "lastSeen": now_iso(),
                "os": sys.platform,
                "cwd": os.getcwd(),
                "hasScreenCapture": HAS_PIL,
                "activeProcess": ProcessManager.get_active_cmd(),
                "isInteractiveRunning": is_active
            }
            set_firestore_doc(COLLECTION_TELEMETRY, "pc_host", telemetry_data)
        except Exception as e:
            pass
        time.sleep(4)

def task_worker_loop():
    global LAST_PROCESSED_TASK_ID
    print("🟢 Escuchando comandos remotos de QZ-HUB...")
    
    while IS_RUNNING:
        try:
            task_doc = get_firestore_doc(COLLECTION_TASKS, "current_task")
            if task_doc and task_doc.get("status") == "pending":
                task_id = task_doc.get("id")
                if task_id and task_id != LAST_PROCESSED_TASK_ID:
                    LAST_PROCESSED_TASK_ID = task_id
                    action = task_doc.get("action")
                    print(f"⚡ Procesando comando remoto [{action}] ID: {task_id}")
                    
                    task_doc["status"] = "running"
                    task_doc["startedAt"] = now_iso()
                    set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)
                    
                    if action == "exec_command":
                        cmd = task_doc.get("command", "").strip()
                        cwd = task_doc.get("cwd", os.getcwd())
                        
                        # Si hay un proceso interactivo activo y el comando no es para arrancar uno nuevo
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
                        task_doc["result"] = {"message": "Proceso terminado"}
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
                            task_doc["result"] = {"message": "Captura de pantalla realizada exitosamente"}
                        else:
                            task_doc["status"] = "error"
                            task_doc["result"] = {"error": "No se pudo tomar captura"}
                        
                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)

                    elif action == "read_markdown":
                        filepath = task_doc.get("filepath", "")
                        if os.path.exists(filepath) and os.path.isfile(filepath):
                            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                                content = f.read()
                            task_doc["status"] = "completed"
                            task_doc["result"] = {"content": content, "filepath": filepath}
                        else:
                            task_doc["status"] = "error"
                            task_doc["result"] = {"error": f"El archivo {filepath} no existe"}
                        
                        task_doc["completedAt"] = now_iso()
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)
        except Exception as e:
            print(f"Error procesando tarea: {e}")
            traceback.print_exc()
        
        time.sleep(1.2)

def main():
    print("=" * 60)
    print("🤖 QZ-HUB INTERACTIVE AGENT BRIDGE (v2.1)")
    print(f"Dispositivo: {DEVICE_NAME}")
    print(f"Directorio: {os.getcwd()}")
    print("=" * 60)
    
    t1 = threading.Thread(target=telemetry_loop, daemon=True)
    t2 = threading.Thread(target=task_worker_loop, daemon=True)
    
    t1.start()
    t2.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nDeteniendo bridge...")

if __name__ == "__main__":
    main()
