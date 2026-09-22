# App Fitness

Ver [DISENO.md](DISENO.md) para el diseño completo (alcance, licencias, modelo de datos, paleta).

## Requerimientos e instalación

### Backend (`backend/`, Python 3.12+)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.\.venv\Scripts\python -m scripts.import_exercises   # carga los ejercicios (una vez)
.\.venv\Scripts\python -m scripts.apply_names es      # nombres en español (una vez)
.\.venv\Scripts\python -m scripts.seed_recipes        # carga las recetas (una vez)
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

`requirements-translate.txt` es aparte: solo hace falta si vas a correr `scripts/translate_instructions.py` (traducción automática de instrucciones), no para levantar el servidor.

Pruebas: `.\.venv\Scripts\python -m pytest`

### App móvil (`mobile/`, Node.js LTS)

```bash
cd mobile
npm install
copy .env.example .env   # llenar con la configuración de Firebase
npx expo start
```

### Firebase

Ambos `.env` (`backend/.env`, `mobile/.env`) no se suben al repositorio porque tienen la configuración del proyecto de Firebase. Cada quien que clone el repo debe crear los suyos a partir de los `.env.example`.
