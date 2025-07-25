# Assessment API

This document details the API endpoints for managing ADHD assessments and user preferences.

---

## Endpoints

### POST /api/assessment/submit

Submits the results of a user's ADHD assessment.

-   **Method:** `POST`
-   **URL:** `/api/assessment/submit`
-   **Authentication:** Required (Bearer Token)
-   **Body (JSON):**
    ```json
    {
      "responses": "number[]",
      "adhdDetected": "boolean",
      "totalScore": "number",
      "partAScore": "number",
      "partBScore": "number",
      "partASymptomCount": "number",
      "partBSymptomCount": "number"
    }
    ```
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "success": "boolean",
          "message": "string",
          "user": {
            "id": "string",
            "username": "string",
            "hasCompletedAssessment": "boolean",
            "isADHD": "boolean",
            "adhdMode": "boolean",
            "lastAssessmentDate": "string (ISO 8601)"
          },
          "assessmentResult": {
            "adhdDetected": "boolean",
            "totalScore": "number",
            "partAScore": "number",
            "partBScore": "number",
            "partASymptomCount": "number",
            "partBSymptomCount": "number"
          }
        }
        ```
-   **Error Responses:**
    -   **Code:** `400` Bad Request - If required data is missing or invalid.
    -   **Code:** `404` Not Found - If the user is not found.

---

### GET /api/assessment/status

Retrieves the current assessment status for the authenticated user.

-   **Method:** `GET`
-   **URL:** `/api/assessment/status`
-   **Authentication:** Required (Bearer Token)
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "success": "boolean",
          "assessmentStatus": {
            "hasCompletedAssessment": "boolean",
            "isADHD": "boolean",
            "adhdMode": "boolean",
            "lastAssessmentDate": "string (ISO 8601)"
          }
        }
        ```
-   **Error Responses:**
    -   **Code:** `404` Not Found - If the user is not found.

---

### PUT /api/assessment/adhd-mode

Enables or disables ADHD mode for the authenticated user.

-   **Method:** `PUT`
-   **URL:** `/api/assessment/adhd-mode`
-   **Authentication:** Required (Bearer Token)
-   **Body (JSON):**
    ```json
    {
      "enabled": "boolean"
    }
    ```
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "success": "boolean",
          "message": "string",
          "adhdMode": "boolean"
        }
        ```
-   **Error Responses:**
    -   **Code:** `400` Bad Request - If the `enabled` value is not a boolean.
    -   **Code:** `404` Not Found - If the user is not found.

---

### GET /api/assessment/check-required

Checks if the user is required to take the assessment.

-   **Method:** `GET`
-   **URL:** `/api/assessment/check-required`
-   **Authentication:** Required (Bearer Token)
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "success": "boolean",
          "assessmentRequired": "boolean",
          "hasCompletedAssessment": "boolean",
          "lastAssessmentDate": "string (ISO 8601)"
        }
        ```
-   **Error Responses:**
    -   **Code:** `404` Not Found - If the user is not found.
