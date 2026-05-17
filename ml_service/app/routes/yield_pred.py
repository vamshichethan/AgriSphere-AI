from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.yield_model import load_yield_model, predict_yield

router = APIRouter()

yield_model, encoders = load_yield_model()


class YieldRequest(BaseModel):
    state: str
    district: str
    crop: str
    season: str
    area_hectares: float


@router.post("/yield")
def predict_crop_yield(request: YieldRequest):
    """
    Predict expected yield (quintals/hectare) and total production
    based on state, district, crop type, season, and area under cultivation.
    """
    try:
        result = predict_yield(
            state=request.state,
            district=request.district,
            crop=request.crop,
            season=request.season,
            area_hectares=request.area_hectares,
            model=yield_model,
            encoders=encoders,
        )
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yield prediction failed: {str(e)}")
