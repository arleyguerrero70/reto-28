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

Consulta `docs/planificacion_mvp.md` para el plan completo y roadmap.
