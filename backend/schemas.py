from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    customer_name: str
    channel: str
    subject: str
    status: str
    priority: str
    created_at: datetime

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None