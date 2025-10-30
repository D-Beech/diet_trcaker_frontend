from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Exercise(BaseModel):
    name: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight_kg: Optional[float] = None
    distance_km: Optional[float] = None
    time_min: Optional[float] = None

class Food(BaseModel):
    name: str
    quantity_g: Optional[float] = None
    quantity_items: Optional[int] = None

class LogEntry(BaseModel):
    exercise: List[Exercise]
    food: List[Food]
    body_weight_kg: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)