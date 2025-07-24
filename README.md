### Install

1. Clone the repository:
```bash
git clone <repository-url>
cd ArsharathaApp
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

## Jalan app

### Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Development Server

```bash
cd backend
npm start
```

## 🛠️ Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production

### Backend
- `npm start` - Start the server
- `npm run dev` - Start development server with hot reload

## 🔧 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Docker** - Containerization

## 🐳 Docker Support

The backend includes Docker support. Build and run with:

```bash
cd backend
docker build -t arsharatha-backend .
docker run -p 3000:3000 arsharatha-backend
```