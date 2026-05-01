from pydantic import BaseModel, Field
from typing import Optional

class IngredientRequest(BaseModel):
    name_vn: str = Field(..., min_length=1, description="Tên tiếng Việt của nguyên liệu")
    name_en: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    default_unit: Optional[str] = 'g'
    gram_per_unit: Optional[float] = 1.0
    calories_per_100g: float = Field(..., ge=0, description="Calo trên 100g")
    protein_per_100g: Optional[float] = 0
    fat_per_100g: Optional[float] = 0
    carbs_per_100g: Optional[float] = 0
