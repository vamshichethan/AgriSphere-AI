from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import disease, yield_pred

app = FastAPI(
    title="AgriFlow ML Service",
    description="AI inference endpoints for Crop Disease Detection and Yield Prediction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(disease.router, prefix="/predict", tags=["Disease Detection"])
app.include_router(yield_pred.router, prefix="/predict", tags=["Yield Prediction"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AgriFlow ML Service"}
