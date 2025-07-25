# Authentication API

This document details the API endpoints for user authentication, including registration and login.

---

## Endpoints

### POST /api/auth/register

Registers a new user in the system.

-   **Method:** `POST`
-   **URL:** `/api/auth/register`
-   **Description:** Creates a new user account.
-   **Body (JSON):**
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
-   **Success Response:**
    -   **Code:** `201` Created
    -   **Content:**
        ```json
        {
          "message": "User registered successfully"
        }
        ```
-   **Error Responses:**
    -   **Code:** `400` Bad Request - If the username is too long or validation fails.
    -   **Code:** `409` Conflict - If the username already exists.

---

### POST /api/auth/login

Logs in an existing user and returns a JWT.

-   **Method:** `POST`
-   **URL:** `/api/auth/login`
-   **Description:** Authenticates a user and provides a session token.
-   **Body (JSON):**
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "token": "string",
          "user": {
            "id": "string",
            "username": "string",
            "hasCompletedAssessment": "boolean",
            "isADHD": "boolean",
            "adhdMode": "boolean"
          }
        }
        ```
-   **Error Responses:**
    -   **Code:** `400` Bad Request - If validation fails.
    -   **Code:** `401` Unauthorized - If credentials are invalid.
