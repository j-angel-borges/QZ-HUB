/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: SINCRONIZACIÓN AUTOMÁTICA DE JOURNAL ZENTRY HUB A DRIVE
 * ==============================================================================
 * 
 * ID Carpeta Google Drive: 17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0
 * URL Carpeta: https://drive.google.com/drive/folders/17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0
 * 
 * INSTRUCCIONES DE DESPLIEGUE (3 PASOS):
 * 1. Ingresa a https://script.google.com y crea un "Nuevo proyecto".
 * 2. Pega todo este código en el editor de Apps Script.
 * 3. Haz clic en "Desplegar" -> "Nuevo despliegue":
 *    - Tipo: Aplicación Web
 *    - Ejecutar como: Yo (tu cuenta de Google)
 *    - Quién tiene acceso: Cualquier persona (Anyone)
 * 4. Copia la "URL de la aplicación web" generada y pégala en Zentry Hub.
 */

var DRIVE_FOLDER_ID = "17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0";

function doPost(e) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
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
    
    var dateStr = data.date || new Date().toISOString().split('T')[0];
    var content = data.content || data.body || "Sin contenido registrado.";
    var filename = data.filename || (dateStr + "-journal-bitacora.md");
    
    var markdownContent = "# 📝 DIARIO DE REFLEXIÓN Y REGISTRO - " + dateStr + "\n\n";
    markdownContent += "> **Fecha de Registro:** " + new Date().toLocaleString() + "  \n";
    markdownContent += "> **Origen:** Zentry Hub - SSOT Dashboard  \n\n";
    markdownContent += "---\n\n";
    markdownContent += content + "\n";
    
    // Buscar si ya existe una entrada para esta fecha en la carpeta
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
    
    var responseOutput = {
      status: "success",
      action: isUpdate ? "updated" : "created",
      message: "Entrada guardada exitosamente en Google Drive: " + filename,
      filename: filename,
      fileUrl: file.getUrl(),
      fileId: file.getId(),
      folderId: DRIVE_FOLDER_ID
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(responseOutput))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errorOutput = {
      status: "error",
      message: "Error al procesar la solicitud: " + error.toString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "Zentry Hub Journal Sync Service",
    folderId: DRIVE_FOLDER_ID,
    folderUrl: "https://drive.google.com/drive/folders/" + DRIVE_FOLDER_ID
  })).setMimeType(ContentService.MimeType.JSON);
}
