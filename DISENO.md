# App Fitness – Documento de diseño (v0.1)

## 1. Alcance

**MVP (fase 1)**
- Login: correo + contraseña, teléfono (OTP por SMS), Google.
- Perfil: altura, peso (kg), sexo (M/F), objetivo, nivel de actividad.
- Biblioteca de ejercicios con imagen, filtros (grupo muscular, nivel, equipo, duración).
- Planes de entrenamiento (semanales) generados según objetivo + nivel.
- Registro de entrenamientos y peso.
- Ajustes, perfil, idioma, unidades, tema claro/oscuro.

**Fase 2**
- Dieta: calorías/macros (Mifflin-St Jeor + factor de actividad + ajuste por objetivo), plan de comidas, registro.
- Sueño: registro manual de horas y calidad, tendencia semanal.
- Ciclo menstrual: registro, predicción, fases (solo si sexo = F u opt-in).

**Fase 3**
- Animaciones de ejercicios generadas con IA (Lottie/video corto).
- Notificaciones, integración Health Connect / Apple Health.

## 2. Stack

| Capa | Elección | Nota |
|---|---|---|
| App | React Native + **Expo** (SDK actual, TypeScript) | Un solo código para Android/iOS |
| Navegación | Expo Router | Tabs + stacks, rutas por archivo |
| Estado/datos | TanStack Query + Zustand | Caché de API + estado local |
| Estilos | StyleSheet + tokens de tema propios | Sin librería pesada; control total del diseño |
| Auth | **Firebase Auth** (correo, teléfono/SMS, Google) | FastAPI verifica el ID token con firebase-admin |
| Pagos | **RevenueCat** (App Store + Google Play) | Webhook a FastAPI para estado de suscripción |
| Backend | **FastAPI** (Python 3.12) | Ya tienes Python |
| ORM/migraciones | SQLModel/SQLAlchemy 2 + Alembic | |
| BD | PostgreSQL (SQLite en desarrollo) | |
| Imágenes | Almacenamiento local/S3-compatible + CDN | |
| Build iOS sin Mac | **EAS Build** (nube de Expo) | Requiere cuenta Apple Developer ($99/año) |

### Sobre iOS sin Mac
Expo lo permite: se desarrolla en Windows, se prueba en Android/emulador y en iPhone con Expo Go / dev build vía EAS, y EAS compila el `.ipa` en la nube. No hace falta migrar nada después; es el mismo proyecto.

## 3. Contenido de ejercicios (DECIDIDO)

La app tendrá suscripción de pago (50 MXN/mes), por lo que **no se usa Darebee** (licencia CC BY-NC-SA, prohíbe uso comercial).

- **Base:** free-exercise-db (dominio público, ~800 ejercicios, imágenes incluidas). Se importa a nuestra BD y las imágenes se alojan en nuestro almacenamiento.
- **Complemento:** contenido propio (rutinas, planes, ilustraciones/animaciones IA en fase 3). Los planes de entrenamiento son diseño propio.
- **Idiomas:** la fuente está en inglés. Tabla `exercise_translations` (es, en, pt, fr, de). Traducción automática al importar, con revisión humana posterior de los textos más vistos.
- Cada ejercicio guarda `source`, `source_url`, `license` para trazabilidad.

## 4. Modelo de datos (inicial)

```
users(id, firebase_uid, email, phone, created_at)
subscriptions(user_id, status, expires_at, store, product_id)
exercise_translations(exercise_id, lang, name, instructions)
profiles(user_id, name, birth_date, height_cm, weight_kg, sex, goal,
         activity_level, units, locale)
exercises(id, slug, muscle_groups[], equipment[],
          level, type, duration_min, image_url, animation_url,
          source, source_url, license)
workout_plans(id, name, goal, level, weeks, days_per_week)
plan_days(id, plan_id, day_index, title)
plan_day_exercises(day_id, exercise_id, sets, reps, seconds, rest_s, order)
user_plans(id, user_id, plan_id, start_date, status)
workout_logs(id, user_id, date, plan_day_id, duration_min, notes)
weight_logs(user_id, date, weight_kg)
sleep_logs(user_id, date, sleep_start, sleep_end, quality)
cycle_logs(user_id, start_date, end_date, symptoms[], flow)
meal_plans / meals / food_logs   -- fase 2
```

## 5. API (FastAPI, prefijo `/v1`)

```
(Login lo hace Firebase en el cliente; el backend valida "Authorization: Bearer <firebase id token>")
POST /webhooks/revenuecat
GET  /me/subscription
GET/PUT /me/profile
GET  /exercises?muscle=&level=&equipment=&q=
GET  /exercises/{id}
GET  /plans            POST /me/plans/{id}/start
GET/POST /me/workouts
GET/POST /me/weight | /me/sleep | /me/cycle
GET  /me/nutrition/targets
```
JWT de acceso corto + refresh token. Rate limit en endpoints de auth.

## 6. Estructura del repositorio

```
App_Ejercicio/
  mobile/            # Expo + TypeScript
    app/             # Expo Router: (auth)/, (tabs)/, settings/
    src/{components,theme,api,store,hooks}
  backend/           # FastAPI
    app/{api,models,schemas,services,core}
    scripts/import_exercises.py
    alembic/
  docs/
  DISENO.md
```

## 7. Navegación

Tabs inferiores, solo teléfono (sin layout de tablet/escritorio):

1. **Inicio** – resumen del día: sesión de hoy, meta calórica, semana de plan.
2. **Rutinas** – plan semanal por día, biblioteca de ejercicios con buscador.
3. **Dieta** – metas de calorías/macros, menú de recetas del día.
4. **Reloj** – conectar Apple Health / Google Fit / Garmin (pantalla preparada; sin integración real todavía).
5. **Perfil** – datos, objetivo, suscripción, apariencia, idioma, cerrar sesión.

Onboarding: login → datos básicos (altura, peso, edad, sexo) → objetivo, actividad, equipo → resumen.

## 8. Diseño visual (v2 — extraído del diseño hecho en Replit, `Fitness-movil`)

Reemplaza la paleta clara "verde salvia" original: se adoptó el sistema que el usuario diseñó en Replit, portado tal cual a `mobile/src/theme`, `mobile/src/components/{FitnessUI,DepthOrb,Motion}.tsx`.

**Principios**
- Tema oscuro por defecto (con claro y "sistema" como alternativas reales, no solo `prefers-color-scheme`).
- Sin emojis. Iconografía de línea (Feather, vía `@expo/vector-icons`).
- Animación 3D discreta con `react-native-reanimated` (perspective/rotateX/rotateY), sin librerías 3D pesadas: `DepthOrb` (login, splash) y transiciones de aparición (`Reveal` en `Motion.tsx`).
- Tarjetas tipo *bento*, un solo acento (naranja quemado) usado con moderación.

**Paleta** (`mobile/src/theme/colors.ts`)
| Token | Claro | Oscuro |
|---|---|---|
| fondo | `#F7F3EE` | `#07080B` |
| superficie (card) | `#FFFFFF` | `#111216` |
| texto (foreground) | `#17110E` | `#F7F1EB` |
| texto suave (mutedForeground) | `#786B63` | `#BBA79C` |
| acento (primary) | `#C8541F` | `#F07832` |
| borde | `#D8C8BC` | `#49332B` |

**Tipografía**: Inter (Regular/Medium/SemiBold/Bold vía `@expo-google-fonts/inter`).

**Responsive**: solo teléfono, vertical.

## 9. Privacidad y seguridad
- Datos de salud (incluido ciclo menstrual) son sensibles: consentimiento explícito, cifrado en tránsito y en reposo, exportar/eliminar cuenta (requerido por App Store y Play).
- Contraseñas con Argon2/bcrypt; OTP con expiración y límite de intentos.
- Aviso: la app no es consejo médico; límites de seguridad en objetivos (p. ej., no recomendar déficit extremo).

## 10. Hoja de ruta
1. Base: repo, backend con auth + perfil + ejercicios, app con onboarding y tabs.
2. Importación de ejercicios + biblioteca con filtros.
3. Planes y registro de entrenamientos.
4. Ajustes, tema, tablet.
5. Nutrición, sueño, ciclo.
6. Pruebas, EAS Build, publicación.

## Decisiones tomadas
- Monetización: suscripción 50 MXN/mes -> sin Darebee, free-exercise-db + contenido propio.
- Auth: Firebase Auth. Pagos: RevenueCat.
- Idiomas: es, en, pt, fr, de (i18n desde el inicio: i18next en app, traducciones en BD para contenido).

- Precio: 50 MXN/mes, 7 días de prueba gratis.
- Gratis vs. premium: parte de los ejercicios queda bloqueada (`is_premium`; se muestra nombre y portada, sin detalle) hasta suscribirse. Planes, nutrición y bienestar son premium.
- Idiomas: español por defecto, inglés segundo; pt/fr/de terciarios. Cadena de respaldo: idioma pedido -> es -> en (API y app).

## Pendiente
- Criterio editorial de qué ejercicios son gratis (hoy 1 de cada 3, provisional).
- Proyecto Firebase y cuentas de desarrollador (Google Play $25 único, Apple $99/año).
