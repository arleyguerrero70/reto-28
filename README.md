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

## Bot (apps/bot)
- Requisitos: configurar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_GROUP_ID` y `API_BASE_URL` en tu `.env`. El bot lee los secretos de la raíz del monorepo.
- Características actuales:
  - Comando `/start` con soporte para deep-link (payload en `ctx.match`).
  - Comando `/registro` con botón inline "Registrar avance" que inicia el flujo de registro diario.
  - **Registro diario completo**: el bot parsea mensajes con formato `minutos|emoción antes|emoción después|nota opcional` y los envía automáticamente a `POST /daily-logs` del backend. Valida que el usuario tenga cuenta vinculada y reto activo.
  - Recordatorios automáticos en el grupo (`node-cron`) con horarios diferenciados entre semana (09:00/15:00/19:00) y fines de semana (10:00/18:00) usando la zona horaria `TZ`.
  - Comando `/frase` que obtiene una frase motivacional basada en los mentores del usuario (consulta al backend).
- **Vinculación de cuenta**: los usuarios deben tener su `telegram_user_id` guardado en la tabla `users`. Ejecuta `supabase/sql/003_add_telegram_user_id.sql` en Supabase y luego actualiza el usuario con `PATCH /users/:id` incluyendo `telegramUserId`.
- Ejecuta `npm run bot:dev` para modo polling durante el desarrollo; en producción configura webhook y un worker para los jobs recurrentes.

## Backend (apps/api)
- Configuración: copia `.env.example` a `.env` y rellena las claves de Supabase, Telegram y LangChain. El servidor expone un `GET /health` para validar la conexión con Supabase.
- Módulos incluidos:
  - `auth`: solicita Magic Links con Supabase Auth y valida tokens (`POST /auth/magic-link`, `POST /auth/verify`).
  - `users`: CRUD básico del perfil del reto (`POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`).
  - `challenges`: operaciones sobre el reto de 28 días (`POST /challenges`, `GET /challenges/user/:userId`, `PATCH /challenges/:id`).
- El pipeline de validación global usa `class-validator`/`class-transformer`, así que todos los DTOs cuentan con tipado y saneamiento de entrada.
- **Seeds y SQL**:
  - Ejecuta `supabase/sql/001_extend_users_challenges.sql` en el SQL Editor de Supabase para añadir las columnas adicionales.
  - Ejecuta `supabase/sql/002_daily_logs_rewards.sql` para crear las tablas de registros diarios, recompensas y penalizaciones.
  - Ejecuta `supabase/sql/003_add_telegram_user_id.sql` para agregar el campo `telegram_user_id` a la tabla `users`.
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

  # Buscar usuario por Telegram ID
  curl -X GET http://localhost:3000/users/telegram/1199433316

  # Vincular cuenta de Telegram a un usuario
  curl -X PATCH http://localhost:3000/users/<USER_ID> ^
    -H "Content-Type: application/json" ^
    -d "{\"telegramUserId\":\"1199433316\"}"

  # Registrar avance diario
  curl -X POST http://localhost:3000/daily-logs ^
    -H "Content-Type: application/json" ^
    -d "{\"challengeId\":\"<CHALLENGE_ID>\",\"logDate\":\"2025-11-15\",\"completed\":true,\"minutesSpent\":45,\"moodBefore\":\"Motivado\",\"moodAfter\":\"Orgulloso\",\"note\":\"Sesión productiva\"}"

  # Obtener registros de un reto
  curl -X GET http://localhost:3000/daily-logs/challenge/<CHALLENGE_ID>

  # Obtener recompensas de un usuario
  curl -X GET http://localhost:3000/daily-logs/rewards/<USER_ID>
  ```

Consulta `docs/planificacion_mvp.md` para el plan completo y roadmap.
