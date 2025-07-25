# Sessions API

This document details the API endpoints for managing user learning sessions.

---

## Endpoints

### GET /api/sessions

Retrieves a list of all sessions for the authenticated user.

-   **Method:** `GET`
-   **URL:** `/api/sessions`
-   **Authentication:** Required (Bearer Token)
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:** `Array<SessionSummary>`
        ```json
        [
          {
            "_id": "string",
            "title": "string",
            "updatedAt": "string (ISO 8601)"
          }
        ]
        ```

---

### GET /api/sessions/:id

Retrieves the full details of a specific session, including its messages and canvas state.

-   **Method:** `GET`
-   **URL:** `/api/sessions/:id`
-   **Authentication:** Required (Bearer Token)
-   **URL Parameters:**
    -   `id` (string, required): The ID of the session to retrieve.
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:** `SessionDetails`
        ```json
        {
          "session": {
            "_id": "string",
            "title": "string",
            "canvasState": "any[]"
          },
          "messages": [
            {
              "_id": "string",
              "sender": "'user' | 'ai'",
              "text": "string",
              "createdAt": "string (ISO 8601)",
              "fileIds": [
                {
                  "_id": "string",
                  "originalFilename": "string"
                }
              ]
            }
          ]
        }
        ```
-   **Error Responses:**
    -   **Code:** `404` Not Found - If the session does not exist or does not belong to the user.

---

### PUT /api/sessions/:id/canvas

Updates the canvas state for a specific session.

-   **Method:** `PUT`
-   **URL:** `/api/sessions/:id/canvas`
-   **Authentication:** Required (Bearer Token)
-   **URL Parameters:**
    -   `id` (string, required): The ID of the session to update.
-   **Body (JSON):**
    ```json
    {
      "canvasState": "any[]"
    }
    ```
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "message": "Canvas state updated successfully"
        }
        ```
-   **Error Responses:**
    -   **Code:** `404` Not Found - If the session does not exist.
