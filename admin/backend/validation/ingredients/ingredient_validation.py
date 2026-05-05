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
    
    # New nutrition fields
    sugar: Optional[float] = 0
    fiber: Optional[float] = 0
    saturated_fat: Optional[float] = 0
    cholesterol: Optional[float] = 0
    sodium: Optional[float] = 0
    potassium: Optional[float] = 0
    calcium: Optional[float] = 0
    iron: Optional[float] = 0
    vitamin_c: Optional[float] = 0
    vitamin_a: Optional[float] = 0
    vitamin_d: Optional[float] = 0
    
    # Storage & Usage
    storage_method: Optional[str] = None
    weight_min: Optional[float] = None
    weight_max: Optional[float] = None
    notes: Optional[str] = None
    suitability: Optional[list] = [] # Danh sách các tag phù hợp
    unit_conversions: Optional[list] = [] # Dữ liệu quy đổi
    substitutions: Optional[list] = [] # Dữ liệu thay thế
