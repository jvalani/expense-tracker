# Expense Tracker

A full-stack expense tracking application built with Node.js and React.

## Project Structure

- `server/`: Backend API built with Express and MongoDB.
- `ui/`: Frontend application built with React, Vite, and Tailwind CSS.
- `docker-compose.yml`: Docker configuration for running the application and its database.

## Prerequisites

- Node.js (Version specified in `.nvmrc`, currently `v18.16.0`)
- Docker (for running the database and the app in containers)
- npm or yarn

## Getting Started

### 1. Setup Environment Variables

Copy the example environment files and fill in your details:

```bash
# In the server directory
cp server/.env.example server/.env

# In the ui directory
cp ui/.env.example ui/.env
```

### 2. Run with Docker (Recommended)

To start the entire stack (backend, frontend, and database):

```bash
docker-compose up --build
```

### 3. Run Locally

#### Backend

```bash
cd server
npm install
npm start
```

#### Frontend

```bash
cd ui
npm install
npm run dev
```

## Best Practices Followed

- **Version Control**: Root `.gitignore` to prevent tracking sensitive or unnecessary files.
- **Environment Consistency**: `.nvmrc` to pin Node.js version.
- **Code Style**: `.editorconfig` for consistent indentation and formatting.
- **Documentation**: Comprehensive `README.md` for easy onboarding.
- **Security**: `.env.example` templates to prevent accidental exposure of secrets.

## License

MIT
