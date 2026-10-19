from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String, index=True, nullable=False)
    channel = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    status = Column(String, default="open", nullable=False)     
    priority = Column(String, default="medium", nullable=False) 
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)