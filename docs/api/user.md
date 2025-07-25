# User API

This document details the API endpoint for user profile management.

---

## Endpoints

### GET /api/user/profile

Retrieves the profile information for the authenticated user.

-   **Method:** `GET`
-   **URL:** `/api/user/profile`
-   **Authentication:** Required (Bearer Token)
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "username": "string"
        }
        ```
-   **Error Responses:**
    -   **Code:** `404` Not Found - If the user profile cannot be found.
