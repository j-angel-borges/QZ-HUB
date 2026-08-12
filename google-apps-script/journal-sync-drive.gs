/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: QZ HUB MULTI-DEVICE CLOUD SYNC & JOURNAL STORAGE ENGINE
 * ==============================================================================
 * 
 * ID Carpeta Google Drive: 17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0
 * URL Carpeta: https://drive.google.com/drive/folders/17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0
 * 
 * INSTRUCCIONES DE ACTUALIZACIÓN EN SCRIPT.GOOGLE.COM:
 * 1. Entra a tu proyecto en https://script.google.com
 * 2. Reemplaza todo el código existente por este script.
 * 3. Haz clic en "Guardar" y luego en "Desplegar" -> "Gestionar despliegues" -> "Editar" -> "Nueva versión" -> "Desplegar".
 */

var DRIVE_FOLDER_ID = "17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0";
var DB_FILENAME = "qz_hub_cloud_db.json";

function getFolder() {
  return DriveApp.getFolderById(DRIVE_FOLDER_ID);
}

function getCloudDbFile() {
  var folder = getFolder();
  var files = folder.getFilesByName(DB_FILENAME);
  if (files.hasNext()) {
    return files.next();
  }
  return folder.createFile(DB_FILENAME, JSON.stringify({
    mit: [],
    objectives: [],
    timeblocks: {},
    history: [],
    updatedAt: new Date().toISOString()
  }), MimeType.PLAIN_TEXT);
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var action = data.action || "journal";
    
    // --- ACCIÓN A: MULTI-DEVICE CLOUD PUSH (TIMEBLOCKING, MIT, OBJETIVOS, TAREAS) ---
    if (action === "cloud_push" || data.type === "cloud_sync") {
      var dbFile = getCloudDbFile();
      var currentDb = {};
      try {
        currentDb = JSON.parse(dbFile.getContent());
      } catch(err) {
        currentDb = {};
      }
      
      if (data.payload) {
        if (data.payload.timeblocks) {
          currentDb.timeblocks = currentDb.timeblocks || {};
          Object.assign(currentDb.timeblocks, data.payload.timeblocks);
        }
        if (data.payload.mit) currentDb.mit = data.payload.mit;
        if (data.payload.objectives) currentDb.objectives = data.payload.objectives;
        if (data.payload.history) currentDb.history = data.payload.history;
        if (data.payload.tasks) currentDb.tasks = data.payload.tasks;
      }
      
      currentDb.updatedAt = new Date().toISOString();
      dbFile.setContent(JSON.stringify(currentDb, null, 2));
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "cloud_pushed",
        updatedAt: currentDb.updatedAt
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- ACCIÓN B: GUARDADO DE JOURNALING EN .MD ---
    var dateStr = data.date || new Date().toISOString().split('T')[0];
    var content = data.content || data.body || "Sin contenido registrado.";
    var filename = data.filename || (dateStr + "-journal-bitacora.md");
    
    var markdownContent = "# 📝 DIARIO DE REFLEXIÓN Y REGISTRO - " + dateStr + "\n\n";
    markdownContent += "> **Fecha de Registro:** " + new Date().toLocaleString() + "  \n";
    markdownContent += "> **Origen:** QZ HUB - Operational Cockpit  \n\n";
    markdownContent += "---\n\n";
    markdownContent += content + "\n";
    
    var folder = getFolder();
    var existingFiles = folder.getFilesByName(filename);
    var file;
    var isUpdate = false;
    
    if (existingFiles.hasNext()) {
      file = existingFiles.next();
      file.setContent(markdownContent);
      isUpdate = true;
    } else {
      file = folder.createFile(filename, markdownContent, MimeType.PLAIN_TEXT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: isUpdate ? "updated" : "created",
      filename: filename,
      fileUrl: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "cloud_pull";
    
    if (action === "cloud_pull") {
      var dbFile = getCloudDbFile();
      var dbContent = dbFile.getContent();
      return ContentService.createTextOutput(dbContent).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "active",
      service: "QZ HUB Multi-Device Cloud Sync Service",
      folderId: DRIVE_FOLDER_ID
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
