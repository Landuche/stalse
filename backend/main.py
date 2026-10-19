import os
import json
from datetime import datetime
from math import ceil
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Ticket
from schemas import TicketResponse, TicketUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mini Inbox - Stalse", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schema de Paginação
class PaginatedTicketResponse(BaseModel):
    items: List[TicketResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/ticket-webhook")

def init_db_seeds():
    db = SessionLocal() if 'SessionLocal' in globals() else next(get_db())
    count = db.query(Ticket).count()
    if count == 0:
        seed_path = os.path.join(os.path.dirname(__file__), "seeds", "tickets_seed.json")
        if os.path.exists(seed_path):
            with open(seed_path, "r", encoding="utf-8") as f:
                seeds = json.load(f)
                for item in seeds:
                    ticket = Ticket(
                        customer_name=item["customer_name"],
                        channel=item["channel"],
                        subject=item["subject"],
                        status=item["status"],
                        priority=item["priority"],
                        created_at=datetime.fromisoformat(item["created_at"])
                    )
                    db.add(ticket)
                db.commit()
                print("Seeds inseridas!")
    db.close()

@app.on_event("startup")
def startup_event():
    global SessionLocal
    from database import SessionLocal
    init_db_seeds()

@app.get("/tickets", response_model=PaginatedTicketResponse)
def get_tickets(
    search: Optional[str] = Query(None, description="Filtro por nome do cliente ou assunto"),
    page: int = Query(1, ge=1, description="Número da página (começa em 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página (max 100)"),
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)

    # Filtro por busca (se fornecido)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Ticket.customer_name.ilike(search_term)) | (Ticket.subject.ilike(search_term))
        )

    # Contagem total de itens correspondentes
    total_items = query.count()
    total_pages = ceil(total_items / page_size) if total_items > 0 else 1

    # Cálculo do offset e busca limitada no banco
    offset = (page - 1) * page_size
    tickets = query.order_by(Ticket.created_at.desc()).offset(offset).limit(page_size).all()

    return {
        "items": tickets,
        "total": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    return ticket

@app.patch("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")

    old_status = ticket.status
    old_priority = ticket.priority

    if payload.status is not None:
        ticket.status = payload.status
    if payload.priority is not None:
        ticket.priority = payload.priority

    db.commit()
    db.refresh(ticket)

    # Manda Webhook para o n8n se o status virar closed ou priority virar maior que high
    if (ticket.status == "closed" and old_status != "closed") or (ticket.priority == "high" and old_priority != "high") or (ticket.priority == "urgent" and old_priority != "urgent"):
        webhook_data = {
            "event": "ticket_updated",
            "ticket_id": ticket.id,
            "customer_name": ticket.customer_name,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "updated_at": datetime.utcnow().isoformat()
        }
        try:
            async with httpx.AsyncClient() as client:
                await client.post(N8N_WEBHOOK_URL, json=webhook_data, timeout=5.0)
        except Exception as e:
            print(f"Erro no webhook n8n: {e}")

    return ticket

@app.get("/metrics")
def get_metrics():
    metrics_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "metrics.json")
    if not os.path.exists(metrics_path):
        # Fallback
        return {
            "total_tickets": 0,
            "closed_tickets": 0,
            "high_priority_tickets": 0,
            "tickets_per_day": {},
            "top_categories": {}
        }
    
    with open(metrics_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data