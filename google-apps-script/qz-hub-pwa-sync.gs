/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: QZ HUB PWA DEDICATED CLOUD SYNC & JOURNAL ENGINE
 * ==============================================================================
 * 
 * Carpeta Base de Datos PWA: 1kr4dPvYh0Q2wVVR3dKBgnj8eiKKD_6YL
 * URL Carpeta PWA DB: https://drive.google.com/drive/folders/1kr4dPvYh0Q2wVVR3dKBgnj8eiKKD_6YL
 * 
 * Carpeta Registros Journal: 17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0
 * URL Carpeta Journal: https://drive.google.com/drive/folders/17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0
 */

var PWA_DB_FOLDER_ID = "1kr4dPvYh0Q2wVVR3dKBgnj8eiKKD_6YL";
var JOURNAL_FOLDER_ID = "17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0";
var PWA_DB_FILENAME = "qz_hub_pwa_master_db.json";

function getPwaDbFolder() {
  return DriveApp.getFolderById(PWA_DB_FOLDER_ID);
}

function getJournalFolder() {
  return DriveApp.getFolderById(JOURNAL_FOLDER_ID);
}

function getPwaMasterDbFile() {
  var folder = getPwaDbFolder();
  var files = folder.getFilesByName(PWA_DB_FILENAME);
  if (files.hasNext()) {
    return files.next();
  }
  return folder.createFile(PWA_DB_FILENAME, JSON.stringify({
    version: "2.0",
    tasks: [],
    mit: [],
    objectives: [],
    timeblocks: {},
    history: [],
    journalHistory: [],
    updatedAt: new Date().toISOString()
  }, null, 2), MimeType.PLAIN_TEXT);
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
    
    var action = data.action || "sync_pwa_push";
    
    // --- 1. SINCRONIZACIÓN COMPLETA DE LA PWA EN CARPETA 1kr4dPvYh0Q2wVVR3dKBgnj8eiKKD_6YL ---
    if (action === "sync_pwa_push" || action === "cloud_push" || data.type === "cloud_sync") {
      var dbFile = getPwaMasterDbFile();
      var currentDb = {};
      try {
        currentDb = JSON.parse(dbFile.getContent());
      } catch(err) {
        currentDb = {};
      }
      
      var payload = data.payload || data;
      
      if (payload.tasks && payload.tasks.length > 0) currentDb.tasks = payload.tasks;
      if (payload.mit && payload.mit.length > 0) currentDb.mit = payload.mit;
      if (payload.objectives && payload.objectives.length > 0) currentDb.objectives = payload.objectives;
      if (payload.history && payload.history.length > 0) currentDb.history = payload.history;
      if (payload.journalHistory && payload.journalHistory.length > 0) currentDb.journalHistory = payload.journalHistory;
      if (payload.timeblocks && Object.keys(payload.timeblocks).length > 0) {
        currentDb.timeblocks = currentDb.timeblocks || {};
        Object.assign(currentDb.timeblocks, payload.timeblocks);
      }
      
      currentDb.updatedAt = new Date().toISOString();
      dbFile.setContent(JSON.stringify(currentDb, null, 2));
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "pwa_synced",
        updatedAt: currentDb.updatedAt,
        folderId: PWA_DB_FOLDER_ID
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 2. GUARDADO DE JOURNALING EN CARPETA 17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0 ---
    if (action === "journal_save" || data.date) {
      var dateStr = data.date || new Date().toISOString().split('T')[0];
      var content = data.content || data.body || "Sin contenido registrado.";
      var filename = data.filename || (dateStr + "-journal-bitacora.md");
      
      var markdownContent = "# 📝 DIARIO DE REFLEXIÓN Y REGISTRO - " + dateStr + "\n\n";
      markdownContent += "> **Fecha de Registro:** " + new Date().toLocaleString() + "  \n";
      markdownContent += "> **Origen:** QZ HUB - Operational Cockpit  \n\n";
      markdownContent += "---\n\n";
      markdownContent += content + "\n";
      
      var jFolder = getJournalFolder();
      var existingFiles = jFolder.getFilesByName(filename);
      var file;
      var isUpdate = false;
      
      if (existingFiles.hasNext()) {
        file = existingFiles.next();
        file.setContent(markdownContent);
        isUpdate = true;
      } else {
        file = jFolder.createFile(filename, markdownContent, MimeType.PLAIN_TEXT);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: isUpdate ? "updated" : "created",
        filename: filename,
        fileUrl: file.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var dbFile = getPwaMasterDbFile();
    var dbContent = dbFile.getContent();
    return ContentService.createTextOutput(dbContent).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
