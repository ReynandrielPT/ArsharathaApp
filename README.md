# VikaAI - Conversational Learning Platform

VikaAI is a revolutionary AI-powered conversational learning platform that transforms education through interactive dialogue and synchronized visual explanations.

## Features

- Conversational AI Tutoring
- Real-time Visual Explanations
- Document Analysis and Summarization
- Adaptive Learning Paths
- ADHD Mode that Enchances Learning Experience for Those with ADHD

## Architecture

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/
│   │   ├── ADHDAssessment.tsx        # ADHD assessment questionnaire
│   │   ├── ADHDAssessmentResult.tsx  # Assessment results display
│   │   └── ...                       # Other UI components
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context
│   ├── services/
│   │   └── assessmentService.ts      # ADHD assessment API service
│   ├── styles/
│   │   ├── assessment-styles.css     # Assessment page styling
│   │   └── result.css               # Results page styling
│   └── App.tsx                      # Main application router
```

### Backend (Node.js + Express + TypeScript)
```
backend/
├── src/
│   ├── controllers/
│   │   └── assessmentController.ts   # ADHD assessment business logic
│   ├── models/
│   │   └── User.ts                  # MongoDB user schema
│   ├── routes/
│   │   └── assessment.ts            # ADHD assessment API routes
│   ├── middleware/
│   │   └── auth.ts                  # JWT authentication middleware
│   └── config/
│       ├── database.ts              # MongoDB connection
│       └── firebase.ts              # Firebase configuration
```

## Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **CSS3** with modern styling
- **Fetch API** for HTTP requests

### Backend
- **Node.js** with Express framework
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Firebase Admin SDK** for additional auth support

### Infrastructure
- **Docker** containerization
- **Docker Compose** for orchestration
- **NGINX** reverse proxy
- **MongoDB** database

## How to Run?

### Prerequisites
- Virtual Machine (VM) or Linux server
- Internet connection
- Gemini API Key
- Google Credentials

### Installation Steps

a. **IMPORTANT STEP**
   ```bash
   Adjust with your own google-credentials.json and fill out the .env with your own LLM API key
   ```

1. **Prepare Virtual Machine**
   ```bash
   # Ensure you have a clean VM with Ubuntu 20.04+ or similar
   ```

2. **Install Docker and Git**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Git
   sudo apt install git -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/ReynandrielPT/ArsharathaApp.git
   ```

4. **Navigate to Project Directory**
   ```bash
   cd ArsharathaApp
   ```

5. **Start Application with Docker Compose**
   ```bash
   sudo docker-compose -f docker-compose.http.yml up --build -d
   ```

