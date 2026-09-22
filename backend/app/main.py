from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import exercises, plans, profile, recipes
from app.db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Fitness API", version="0.1.0", lifespan=lifespan)
# Desarrollo: la app web de Expo corre en otro origen. En producción, limitar a dominios propios.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(exercises.router, prefix="/v1")
app.include_router(profile.router, prefix="/v1")
app.include_router(plans.router, prefix="/v1")
app.include_router(recipes.router, prefix="/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
