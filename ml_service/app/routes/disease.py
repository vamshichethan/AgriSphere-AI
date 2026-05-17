from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.disease_model import load_model, predict_disease

router = APIRouter()

# Load model once at startup
disease_model = load_model()


class DiseaseRequest(BaseModel):
    image_url: str


@router.post("/disease")
def classify_disease(request: DiseaseRequest):
    """
    Classify crop disease from a publicly accessible image URL.
    Returns crop name, disease label, confidence score, and treatment lookup key.
    """
    try:
        result = predict_disease(request.image_url, disease_model)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
