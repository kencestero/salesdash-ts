/**
 * Google Drive Service
 *
 * Handles uploading contractor documents (W-9, Agreements) to Google Drive.
 * Uses a service account for authentication.
 *
 * Environment Variables Required:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_PRIVATE_KEY
 * - GOOGLE_DRIVE_CONTRACTOR_FOLDER_ID
 */

import { google } from "googleapis";
import { Readable } from "stream";

const CONTRACTOR_FOLDER_ID = process.env.GOOGLE_DRIVE_CONTRACTOR_FOLDER_ID;

interface UploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  error?: string;
}

interface DriveAuth {
  auth: ReturnType<typeof google.auth.JWT>;
  drive: ReturnType<typeof google.drive>;
}

/**
 * Get authenticated Google Drive client
 */
function getDriveClient(): DriveAuth | null {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!serviceAccountEmail || !privateKey) {
    console.error("Google Drive: Missing service account credentials");
    return null;
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });
  return { auth, drive };
}

/**
 * Find or create a folder in Google Drive
 */
async function findOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  parentFolderId: string,
  folderName: string
): Promise<string | null> {
  try {
    // Search for existing folder
    const searchResponse = await drive.files.list({
      q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      spaces: "drive",
    });

    const existingFolder = searchResponse.data.files?.[0];
    if (existingFolder?.id) {
      return existingFolder.id;
    }

    // Create new folder
    const createResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id",
    });

    return createResponse.data.id || null;
  } catch (error) {
    console.error(`Failed to find/create folder '${folderName}':`, error);
    return null;
  }
}

/**
 * Get target folder ID - uploads directly to GOOGLE_DRIVE_CONTRACTOR_FOLDER_ID
 * The folder structure is managed manually in Google Drive
 */
function getTargetFolderId(): string | null {
  if (!CONTRACTOR_FOLDER_ID) {
    console.error("GOOGLE_DRIVE_CONTRACTOR_FOLDER_ID not configured");
    return null;
  }
  return CONTRACTOR_FOLDER_ID;
}

/**
 * Generate standardized file name
 * Format: LASTNAME_FIRSTNAME_DOCTYPE_YYYY-MM-DD.ext
 */
export function generateFileName(
  lastName: string,
  firstName: string,
  docType: string,
  originalFileName: string
): string {
  const cleanLast = lastName.toUpperCase().replace(/[^A-Z]/g, "") || "UNKNOWN";
  const cleanFirst = firstName.toUpperCase().replace(/[^A-Z]/g, "") || "UNKNOWN";

  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let docLabel: string;
  switch (docType) {
    case "W9":
      docLabel = "W9";
      break;
    case "CONTRACTOR_AGREEMENT":
      docLabel = "ContractorAgreement";
      break;
    default:
      docLabel = "Document";
  }

  // Get file extension from original filename
  const ext = originalFileName.split(".").pop()?.toLowerCase() || "pdf";

  return `${cleanLast}_${cleanFirst}_${docLabel}_${date}.${ext}`;
}

/**
 * Upload a file to Google Drive
 */
export async function uploadToGoogleDrive(params: {
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
  docType: string;
  userLastName: string;
  userFirstName: string;
}): Promise<UploadResult> {
  const { fileName, mimeType, fileBuffer, docType, userLastName, userFirstName } = params;

  const client = getDriveClient();
  if (!client) {
    return {
      success: false,
      error: "Google Drive service not configured",
    };
  }

  const { drive } = client;

  try {
    // Get target folder ID
    const targetFolderId = getTargetFolderId();
    if (!targetFolderId) {
      return {
        success: false,
        error: "Google Drive folder not configured",
      };
    }

    // Generate standardized file name
    const standardizedFileName = generateFileName(
      userLastName,
      userFirstName,
      docType,
      fileName
    );

    // Convert Buffer to Readable stream
    const stream = Readable.from(fileBuffer);

    // Upload file
    const response = await drive.files.create({
      requestBody: {
        name: standardizedFileName,
        parents: [targetFolderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: "id, webViewLink",
    });

    if (!response.data.id) {
      return {
        success: false,
        error: "Upload succeeded but no file ID returned",
      };
    }

    return {
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink || undefined,
    };
  } catch (error: unknown) {
    // Enhanced error logging for debugging
    const err = error as { code?: number; message?: string; errors?: Array<{ message: string; domain: string; reason: string }> };
    console.error("Google Drive upload failed:", {
      message: err.message,
      code: err.code,
      errors: err.errors,
      fullError: JSON.stringify(error, null, 2),
    });
    
    // Build detailed error message
    let errorMessage = "Upload failed";
    if (err.code === 404) {
      errorMessage = "Folder not found or not accessible by service account";
    } else if (err.code === 403) {
      errorMessage = "Permission denied - service account may not have Editor access";
    } else if (err.code === 401) {
      errorMessage = "Authentication failed - check service account credentials";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get a file's download URL (for admin download)
 * Returns a URL that can be used to download the file
 */
export async function getFileDownloadUrl(fileId: string): Promise<string | null> {
  const client = getDriveClient();
  if (!client) {
    return null;
  }

  const { drive } = client;

  try {
    // Get file metadata to verify it exists
    const file = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    if (!file.data.id) {
      return null;
    }

    // Return the direct download link
    // Format: https://drive.google.com/uc?export=download&id=FILE_ID
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch (error) {
    console.error("Failed to get file download URL:", error);
    return null;
  }
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFromGoogleDrive(fileId: string): Promise<boolean> {
  const client = getDriveClient();
  if (!client) {
    return false;
  }

  const { drive } = client;

  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error("Failed to delete file from Google Drive:", error);
    return false;
  }
}
