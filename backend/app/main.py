from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ai import router as ai_router
from app.form.router import router as form_router
from app.risk.router import router as risk_router

app = FastAPI(title="AI Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.2:3000",
        "http://192.168.56.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router, prefix="/api")
app.include_router(form_router, prefix="/api")
app.include_router(risk_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
