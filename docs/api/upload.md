# Upload API

This document details the API endpoint for file uploads.

---

## Endpoints

### POST /api/upload

Uploads one or more files to be associated with a learning session.

-   **Method:** `POST`
-   **URL:** `/api/upload`
-   **Authentication:** Required (Bearer Token)
-   **Content-Type:** `multipart/form-data`
-   **Form Data:**
    -   `files`: The file(s) to upload.
    -   `sessionId` (string, optional): The ID of an existing session to add the files to.
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "message": "Files uploaded successfully",
          "files": [
            {
              "fileId": "string",
              "filename": "string"
            }
          ]
        }
        ```
-   **Error Responses:**
    -   **Code:** `400` Bad Request - If no files are provided.
    -   **Code:** `413` Payload Too Large - If the total file size exceeds the server limit (e.g., 20MB).
