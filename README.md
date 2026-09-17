# AMMERHA

AMMERHA is organized as a modular monolith product with three clear application boundaries:

- `frontend/` - Expo React Native mobile app foundation.
- `backend/` - TypeScript API foundation with MySQL persistence through Prisma.
- `ai/` - Provider-neutral deterministic AI simulation layer.

The MVP keeps product code separated so frontend, backend, and AI work can move in parallel without introducing microservice complexity.

## Developer Ownership

- Fathi: `frontend/`
- Shanti: `backend/`
- Jabr: `ai/`

## Boundary Rules

- Frontend calls backend through `frontend/src/services/api`.
- Frontend calls AI through `frontend/src/services/ai`.
- Backend owns persistence and does not depend on AI internals.
- AI exposes contracts and deterministic simulation only; no paid external AI APIs are required.
