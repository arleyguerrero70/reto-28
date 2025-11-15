# Reto 28 días

Aplicación web open source para acompañar el reto de hábitos de 28 días. El monorepo incluye:

- `apps/web`: frontend React + Vite (modo oscuro neumórfico).
- `apps/api`: backend NestJS con integración a Supabase y métricas.
- `apps/bot`: bot de Telegram con grammY y flujos de deep-link.
- `docs/`: documentación funcional y técnica.

## Requisitos
- Node.js 22+
- npm 10+
- Cuenta Supabase, bot de Telegram registrado, proyecto Vercel/Render/Fly.io.

## Comandos útiles
- `npm run web:dev`: arranca el frontend.
- `npm run api:dev`: arranca el backend NestJS.
- `npm run bot:dev`: arranca el bot en modo desarrollo.
- `npm run api:seed`: inserta un usuario y un reto demo en Supabase (requiere `SUPABASE_SERVICE_ROLE_KEY`).

## Backend (apps/api)
- Configuración: copia `.env.example` a `.env` y rellena las claves de Supabase, Telegram y LangChain. El servidor expone un `GET /health` para validar la conexión con Supabase.
- Módulos incluidos:
  - `auth`: solicita Magic Links con Supabase Auth y valida tokens (`POST /auth/magic-link`, `POST /auth/verify`).
  - `users`: CRUD básico del perfil del reto (`POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`).
  - `challenges`: operaciones sobre el reto de 28 días (`POST /challenges`, `GET /challenges/user/:userId`, `PATCH /challenges/:id`).
- El pipeline de validación global usa `class-validator`/`class-transformer`, así que todos los DTOs cuentan con tipado y saneamiento de entrada.
- **Seeds y SQL**:
  - Ejecuta `supabase/sql/001_extend_users_challenges.sql` en el SQL Editor de Supabase para añadir las columnas adicionales.
  - Luego corre `npm run api:seed` para crear un usuario demo (`demo@reto28.app`) y su reto activo.
- **Pruebas rápidas (curl)**:
  ```bash
  # Obtener usuarios paginados
  curl -X GET http://localhost:3000/users

  # Crear un usuario manualmente
  curl -X POST http://localhost:3000/users ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"user@test.com\",\"fullName\":\"User Test\",\"mentorIds\":[\"mentor-a\"],\"motivation\":\"Mejorar hábitos\",\"expectation\":\"Terminar fuerte\"}"

  # Crear o consultar reto
  curl -X POST http://localhost:3000/challenges ^
    -H "Content-Type: application/json" ^
    -d "{\"userId\":\"<USER_ID>\",\"startsAt\":\"2025-11-15T00:00:00Z\",\"timezone\":\"America/Bogota\",\"goalDescription\":\"Practicar hábito diario\"}"

  # Solicitar magic link
  curl -X POST http://localhost:3000/auth/magic-link ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"user@test.com\",\"redirectTo\":\"https://reto28.app/callback\"}"
  ```

Consulta `docs/planificacion_mvp.md` para el plan completo y roadmap.
