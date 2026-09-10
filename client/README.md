# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
## Local Development Setup

To run the app locally:

1. Copy the example env files and set your local values:
   - `cp server/.env.example server/.env`
   - `cp client/.env.example client/.env`
2. In `server/.env`, make sure `FRONTEND_URL` is set to `http://localhost:5174`.
3. In `client/.env`, make sure `VITE_BACKEND_URL` is set to `http://localhost:5001`.
4. Install dependencies in each folder:
   - `cd server && npm install`
   - `cd client && npm install`
5. Start the server and client in separate terminals:
   - `cd server && npm run dev`
   - `cd client && npm run dev`

This will run the backend on port `5001` and the frontend on port `5174`.
