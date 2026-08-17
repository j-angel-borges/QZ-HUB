#!/usr/bin/env python3
"""
QZ-HUB AGENT BRIDGE & REMOTE CONTROL DAEMON
===========================================
Conecta tu máquina local con QZ-HUB (Vercel / Celular) a través de Firebase Firestore
y Google Cloud Platform (Vertex AI).

Permite:
- Ejecutar comandos de terminal de forma remota desde tu celular.
- Tomar capturas de pantalla de tu PC en tiempo real y enviarlas a QZ-HUB.
- Ejecutar agentes y sub-agentes con Vertex AI / Gemini usando tus créditos de GCP.
- Leer y transmitir archivos Markdown (.md) y entregables a tu celular.
"""

import os
import sys
import time
import json
import subprocess
import threading
import traceback
import base64
from datetime import datetime
from io import BytesIO

# Requerimientos básicos
try:
    import requests
except ImportError:
    print("Instalando requests...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

# Requerimiento para capturas de pantalla
try:
    from PIL import ImageGrab
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("Nota: Para capturas de pantalla automáticas instala Pillow: pip install Pillow")

# Configuración por defecto
FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/qz-hub/databases/(default)/documents"
COLLECTION_TASKS = "qz_remote_tasks"
COLLECTION_TELEMETRY = "qz_remote_telemetry"
COLLECTION_MESSAGES = "qz_agent_messages"
COLLECTION_MEDIA = "qz_remote_media"

DEVICE_NAME = os.environ.get("COMPUTERNAME", "PC-Local-JoseAngel")
IS_RUNNING = True
LAST_PROCESSED_TASK_ID = None

def get_firestore_doc(collection, doc_id="master"):
    """Obtiene un documento de Firestore vía REST API."""
    url = f"{FIRESTORE_BASE_URL}/{collection}/{doc_id}"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            return parse_firestore_fields(data.get("fields", {}))
        return None
    except Exception as e:
        print(f"Error leyendo Firestore {collection}/{doc_id}: {e}")
        return None

def set_firestore_doc(collection, doc_id, data_dict):
    """Guarda un documento en Firestore vía REST API."""
    url = f"{FIRESTORE_BASE_URL}/{collection}/{doc_id}"
    fields = encode_firestore_fields(data_dict)
    payload = {"fields": fields}
    try:
        r = requests.patch(url, json=payload, timeout=10)
        return r.status_code == 200
    except Exception as e:
        print(f"Error escribiendo Firestore {collection}/{doc_id}: {e}")
        return False

def parse_firestore_fields(fields):
    """Convierte campos de Firestore a dict normal de Python."""
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
    """Convierte dict de Python a formato de campos de Firestore."""
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
    """Toma una captura de pantalla y la comprime en base64 JPEG."""
    if not HAS_PIL:
        return None
    try:
        screenshot = ImageGrab.grab()
        # Redimensionar para optimizar ancho de banda (max 1280px)
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

def execute_terminal_command(command, cwd=None):
    """Ejecuta un comando en la shell y retorna stdout y stderr."""
    if not cwd or not os.path.exists(cwd):
        cwd = os.getcwd()
    
    try:
        proc = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=cwd
        )
        stdout, stderr = proc.communicate(timeout=60)
        return {
            "exitCode": proc.returncode,
            "stdout": stdout,
            "stderr": stderr
        }
    except subprocess.TimeoutExpired:
        proc.kill()
        return {
            "exitCode": -1,
            "stdout": "",
            "stderr": "Tiempo de espera agotado (60s)."
        }
    except Exception as e:
        return {
            "exitCode": -1,
            "stdout": "",
            "stderr": str(e)
        }

def telemetry_loop():
    """Envía latido (heartbeat) y telemetría a Firestore cada 5 segundos."""
    while IS_RUNNING:
        try:
            telemetry_data = {
                "deviceName": DEVICE_NAME,
                "status": "online",
                "lastSeen": datetime.utcnow().isoformat() + "Z",
                "os": sys.platform,
                "cwd": os.getcwd(),
                "hasScreenCapture": HAS_PIL
            }
            set_firestore_doc(COLLECTION_TELEMETRY, "pc_host", telemetry_data)
        except Exception as e:
            print(f"Error en loop de telemetría: {e}")
        time.sleep(5)

def task_worker_loop():
    """Escucha y procesa comandos remotos enviados desde QZ-HUB."""
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
                    
                    # Marcar tarea como ejecutando
                    task_doc["status"] = "running"
                    task_doc["startedAt"] = datetime.utcnow().isoformat() + "Z"
                    set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)
                    
                    if action == "exec_command":
                        cmd = task_doc.get("command", "")
                        cwd = task_doc.get("cwd", os.getcwd())
                        res = execute_terminal_command(cmd, cwd)
                        
                        task_doc["status"] = "completed"
                        task_doc["result"] = res
                        task_doc["completedAt"] = datetime.utcnow().isoformat() + "Z"
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)
                        print(f"✅ Comando ejecutado. Exit code: {res['exitCode']}")

                    elif action == "take_screenshot":
                        img_b64 = capture_screen_base64()
                        if img_b64:
                            media_doc = {
                                "timestamp": datetime.utcnow().isoformat() + "Z",
                                "type": "screenshot",
                                "data": img_b64,
                                "source": DEVICE_NAME
                            }
                            set_firestore_doc(COLLECTION_MEDIA, "latest_screenshot", media_doc)
                            task_doc["status"] = "completed"
                            task_doc["result"] = {"message": "Captura de pantalla realizada exitosamente"}
                        else:
                            task_doc["status"] = "error"
                            task_doc["result"] = {"error": "No se pudo tomar la captura (Pillow no instalado o error de display)"}
                        
                        task_doc["completedAt"] = datetime.utcnow().isoformat() + "Z"
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
                        
                        task_doc["completedAt"] = datetime.utcnow().isoformat() + "Z"
                        set_firestore_doc(COLLECTION_TASKS, "current_task", task_doc)
        except Exception as e:
            print(f"Error procesando tarea: {e}")
            traceback.print_exc()
        
        time.sleep(1.5)

def main():
    print("=" * 60)
    print("🤖 QZ-HUB REMOTE AGENT BRIDGE INICIADO")
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
