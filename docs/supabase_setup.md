# Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2. En la sección **API**, copia `Project URL`, `anon key` y `service_role`. Cárgalos en `.env` usando las variables de `.env.example`.
3. Activa **Row Level Security** en las tablas `daily_logs`, `rewards`, `penalties` y define policies:
   - Solo el propietario (`auth.uid() = user_id`).
   - Rol `super_admin` con acceso de lectura.
4. Habilita Storage para recibir imágenes compartidas desde Telegram (bucket `group-posts`).
5. Configura la base de datos con las tablas descritas en `docs/planificacion_mvp.md`.
6. Genera una contraseña para el usuario de base y guárdala en `SUPABASE_DB_PASSWORD`.
7. Descarga el CLI de Supabase para manejar migraciones locales (opcional) y sincroniza con el repo en la carpeta `.supabase` (ignorada por Git).
