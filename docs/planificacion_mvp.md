# Planificación MVP - Reto 28 Días

## 1. Resumen
Aplicación web open source y 100% gratuita para acompañar el "Reto 28 días". Combina un bot de Telegram (automatizado con grammY) que captura reportes diarios con un dashboard personal construido en React + Vite. El backend en NestJS centraliza lógica, integra Supabase (Postgres) y expone APIs/cron jobs. Se desplegará frontend en Vercel, backend en Render (con jobs en Fly.io para cron críticos). LangChain se reservará para módulos de feedback inteligente y generación de mensajes motivacionales.

## 2. Objetivos del MVP
1. Integración completa entre bot de Telegram y la app web (deep-link, registro privado, opción de compartir en el grupo).
2. Dashboard personal con métricas, recompensas y gráficos básicos (tiempo invertido, progreso de días, estado emocional).
3. Podios globales (constancia, tiempo total, índice meritocrático) visibles en la web con explicaciones claras.
4. Rol de super usuario con acceso a métricas agregadas y panel general.

## 3. Stack y Hosting
- Frontend: React + Vite, TailwindCSS + utilidades Neumorphism (modo oscuro). Hosting principal: Vercel (activar límites de 100 GB/mes y monitorear upgrades; Netlify como plan B).
- Backend: NestJS (Node 18+), con módulos: Auth, Usuarios, Reto, Registros, Podios, Bots, Reportes, Admin. Hospedaje en Render free tier; cron time-sensitive en Fly.io (o Cloudflare cron triggers) para evitar cold starts prolongados.
- Base de datos: Supabase (Postgres + storage). Uso de Row Level Security para privacidad de emociones.
- Bot: grammY alojado dentro del backend (webhook) + job scheduler. LangChain TS para pipeline opcional (feedback, frases motivacionales).

## 4. Arquitectura de Alto Nivel
- **Cliente web** se comunica con **API REST/GraphQL** en NestJS (autenticación JWT/Session).
- **Bot Telegram** (grammY) consume los mismos servicios (SDK interno) para crear/leer registros y disparar notificaciones.
- **Supabase** almacena usuarios, mentores, retos, registros diarios, recompensas, podios, configuraciones de horarios.
- **Servicios programados** (Render cron + Fly.io) ejecutan recordatorios: lunes-viernes 09:00, 15:00, 19:00 (Bogotá), fines/festivos 10:00 y 18:00. El servicio consulta feriados (API externa) para ajustar horarios.
- **LangChain** se conecta desde backend para generación de feedback/mensajes motivacionales si el usuario habilita esa función.

## 5. Flujos principales
### 5.1 Onboarding
1. Usuario crea cuenta en la web (email/password o magic link Supabase Auth).
2. Selecciona de 1 a 5 mentores (catálogo editable por super usuario) y registra:
   - Motivo del reto.
   - Expectativa al finalizar.
3. Web genera enlace profundo al bot (tg://resolve?domain=bot&start=token).
4. Bot valida token, vincula chat privado con usuario y confirma instrucciones.

### 5.2 Captura diaria
- 09:00/15:00 (lunes-viernes): bot saluda según el momento, elige frase aleatoria de mentores del usuario, desea buen inicio y recuerda registrar avance.
- 19:00 (lunes-viernes): mensaje motivacional + encuesta "¿Completaste tu acción hoy?".
- 10:00 y 18:00 (sábados, domingos, festivos): mismos contenidos adaptados a los nuevos horarios.
- Deep-link "Registrar avance" abre chat privado:
  1. Bot solicita: ¿Realizaste la acción? (sí/no), tiempo invertido, sentimiento antes/después (escala Likert), comentario libre.
  2. Guarda registro en la API.
  3. Ofrece botón "Compartir con el grupo" → si acepta, bot envía mensaje al grupo con resumen (sin emociones) y permite adjuntar hasta 2 imágenes.

### 5.3 Dashboard web
- Línea de tiempo de los 28 días (estado, recompensas en días 7/14/21/28).
- Gráfico de barras o área para tiempo invertido por día.
- Módulo de emociones (solo visible para el usuario).
- Panel de recompensas: "escudo de racha" otorgado en días 7/14/21; pueden acumularse y gastarse para congelar un día sin penalización.
- Podios globales con texto explicativo.

### 5.4 Super usuario
- Acceso a vista agregada: total de usuarios activos, tasa de cumplimiento diaria, horas acumuladas, distribución emocional promedio, alertas de inactividad.
- Puede editar catálogo de mentores, frases motivacionales, reglas de multas/recompensas.

## 6. Modelado de Datos (borrador)
- `users`: id, email, nombre, rol (`participant`, `super_admin`), timezone, mentor_ids, motivo, expectativa, telegram_user_id, settings.
- `mentors`: id, nombre, citas, categoría, imagen.
- `challenges`: id, user_id, estado, día_actual, fechas clave.
- `daily_logs`: id, challenge_id, fecha, completado, minutos, mood_before, mood_after, comentario, compartido_en_grupo (bool), shared_message_id.
- `rewards`: id, user_id, tipo (`shield`), obtenido_en_día, usado (bool).
- `penalties`: id, user_id, motivo, monto virtual, fecha.
- `leaderboards`: snapshots por periodo con métricas calculadas.
- `group_posts`: referencia a mensajes/imágenes compartidos voluntariamente.

## 7. Métricas y Podios
1. **Constancia**: ranking por número de reportes consecutivos (se reinicia al fallar o usar escudo).
2. **Tiempo acumulado**: suma de minutos confirmados.
3. **Índice meritocrático** (IM): fórmula propuesta
   - IM = (factor continuidad 40%) + (variación positiva de tiempo 30%) + (mejora emocional 20%) + (cumplimiento de hitos 10%).
   - Mostrar descripción en frontend: "El podio meritocrático premia a quienes mantienen la constancia, mejoran sus tiempos y reportan emociones más positivas con el paso de los días".

## 8. APIs y Servicios
- Auth: registro/login, refresh tokens.
- Usuarios: obtener perfil, actualizar mentores/motivo/expectativa.
- Registros diarios: CRUD (principalmente Create + list by user), endpoints para analítica.
- Podios: endpoint público (solo datos agregados, sin emociones).
- Super Admin: endpoints protegidos para reportes, gestión de mentores, mensajes programados.
- Webhooks: Telegram updates (mensajes privados, encuestas, botones inline), verificación profunda.
- Cron services: scheduler para recordatorios (días laborables vs fines/festivos).

## 9. Seguridad y Privacidad
- Supabase con RLS: sólo el propietario (y super usuario) puede ver `daily_logs` completos; campos de emoción cifrados del lado servidor antes de guardar.
- Mensajes compartidos al grupo omiten emociones y comentarios personales; sólo contienen texto voluntario del usuario.
- Auditar accesos del super usuario y registrar acciones administrativas.
- Transparencia en la UI: banner explicando limitaciones por ser servicio gratuito y open source.

## 10. Roadmap sugerido
1. **Semana 1**: Configuración del repo monorepo (frontend/back), base de datos Supabase, módulos básicos de usuarios y mentores. Bot skeleton (grammY) conectando webhook.
2. **Semana 2**: Flujo onboarding + deep-link, endpoints de registros diarios, almacenamiento de sentimientos, integración inicial Telegram → backend.
3. **Semana 3**: Dashboard personal (gráficos básicos), lógica de recompensas/escudos, cálculo de podios (batch job diario), vista super usuario.
4. **Semana 4**: Integración LangChain para feedback inicial y mensajes motivacionales, pulido de UI Neumorfismo, textos explicativos, pruebas end-to-end.
5. **Post-MVP**: biblioteca colaborativa, grupo de retos colectivos, workshops y mejoras analíticas.
