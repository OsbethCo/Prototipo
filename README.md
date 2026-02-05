# My React Project

This is a simple React application built with TypeScript.

## Getting Started

To get started with this project, follow the instructions below.

### Prerequisites

Make sure you have the following installed:

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd my-react-project
   ```

3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application

To run the application in development mode, use the following command:
```
npm start
```
This will start the development server and open the application in your default web browser.

## Ejecutar backend y frontend (Windows)

Instrucciones rápidas para ejecutar ambos servidores en Windows (PowerShell o cmd).

- Abrir una terminal para el backend, instalar dependencias e iniciar el servidor:

```powershell
cd backend
npm install
# opción 1: ejecutar directamente el servidor
node server.js

# opción 2: si quieres usar npm start, actualiza primero `backend/package.json`
# para que el script `start` apunte a `node server.js`, luego:
npm start
```

- Abrir otra terminal en la raíz del proyecto para el frontend, instalar dependencias e iniciar:

```powershell
cd ..\
npm install
npm start
```

Notas:
- El backend expone la API en `http://localhost:3001` por defecto.
- El frontend corre en `http://localhost:3000`.
- Para probar endpoints protegidos por JWT (por ejemplo `/api/productos`) primero haz login en `/api/auth/login` y añade el header `Authorization: Bearer <token>`.
- Si encuentras un error sobre ejecución de scripts en PowerShell (npm.ps1), puedes usar `cmd` en su lugar o ajustar la política de ejecución:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Comandos útiles para pruebas rápidas (PowerShell):

```powershell
# Login y obtener token
$resp = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body (ConvertTo-Json @{ usuario='admin'; password='123' })
$token = $resp.token

# Llamada autenticada a productos
Invoke-RestMethod -Uri 'http://localhost:3001/api/productos' -Headers @{ Authorization = "Bearer $token" }
```

Si quieres, actualizo `backend/package.json` para que `npm start` funcione sin editar manualmente.

### Building for Production

To create a production build of the application, run:
```
npm run build
```
This will generate a `build` folder with the optimized production files.

### Folder Structure

- `src/`: Contains the source code of the application.
  - `components/`: Contains React components.
  - `types/`: Contains TypeScript type definitions.
- `public/`: Contains static files, including the main HTML file.
- `package.json`: Contains project metadata and dependencies.
- `tsconfig.json`: TypeScript configuration file.

### License

This project is licensed under the MIT License.