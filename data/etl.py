import json
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
METRICS_FILE = PROCESSED_DIR / "metrics.json"

def get_raw_file() -> Path:
    """
    Varre a pasta data/raw/ e retorna o primeiro arquivo válido (.csv, .json, .parquet).
    Se nenhum for encontrado, cria um CSV mock padrão.
    """
    supported_extensions = ["*.csv", "*.json", "*.parquet"]
    for ext in supported_extensions:
        files = list(RAW_DIR.glob(ext))
        if files:
            # Retorna o arquivo mais recente encontrado
            return sorted(files, key=lambda f: f.stat().st_mtime, reverse=True)[0]

    # Se nenhum arquivo existir, cria o mock inicial em CSV
    mock_file = RAW_DIR / "dataset_sample.csv"
    print("Nenhum dataset encontrado em data/raw/. Gerando dataset mock de teste...")
    df_sample = pd.DataFrame({
        "ticket_id": [1, 2, 3, 4, 5],
        "customer_name": ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Evan Wright"],
        "channel": ["Email", "Chat", "Phone", "Email", "Chat"],
        "subject": ["Login issue", "Billing error", "Password reset", "Refund request", "Bug report"],
        "category": ["Technical", "Billing", "Technical", "Billing", "Technical"],
        "status": ["Open", "Closed", "In Progress", "Closed", "Open"],
        "priority": ["High", "Medium", "Low", "High", "Medium"],
        "created_at": ["2026-10-01", "2026-10-02", "2026-10-02", "2026-10-03", "2026-10-04"]
    })
    df_sample.to_csv(mock_file, index=False)
    return mock_file

def load_dataframe(file_path: Path) -> pd.DataFrame:
    ext = file_path.suffix.lower()
    
    if ext == ".csv":
        try:
            # tenta com UTF-8
            return pd.read_csv(file_path, encoding="utf-8")
        except (UnicodeDecodeError, UnicodeError):
            # Fallback para datasets com caracteres especiais
            return pd.read_csv(file_path, encoding="latin1")
            
    elif ext == ".json":
        try:
            return pd.read_json(file_path, encoding="utf-8")
        except (UnicodeDecodeError, UnicodeError):
            return pd.read_json(file_path, encoding="latin1")
            
    elif ext == ".parquet":
        return pd.read_parquet(file_path)
    else:
        raise ValueError(f"Formato não suportado: {ext}")

def run_etl():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    raw_file = get_raw_file()
    print(f"Lendo dados do arquivo: {raw_file.name}")
    
    df = load_dataframe(raw_file)

    if df.empty:
        print("Aviso: O dataset fornecido está vazio.")
        return

    # Normaliza os nomes das colunas para snake_case
    df.columns = df.columns.astype(str).str.strip().str.lower().str.replace(" ", "_").str.replace("-", "_")

    # Procura dinamicamente por uma coluna de data no arquivo
    date_col = next((c for c in df.columns if any(k in c for k in ["date", "created", "time", "submitted", "timestamp"])), None)
    
    if date_col:
        df["parsed_date"] = pd.to_datetime(df[date_col], errors="coerce")
        df["date_str"] = df["parsed_date"].dt.strftime("%Y-%m-%d").fillna("2026-10-01")
    else:
        # Fallback caso o dataset não tenha coluna 
        base_date = datetime(2026, 10, 1)
        df["date_str"] = [(base_date + timedelta(days=i % 10)).strftime("%Y-%m-%d") for i in range(len(df))]

    # Agrupa tickets por dia
    raw_tickets_per_day = df["date_str"].value_counts().sort_index().to_dict()
    tickets_per_day = {str(k): int(v) for k, v in raw_tickets_per_day.items()}

    # Procura dinamicamente colunas de status, prioridade e categoria
    status_col = next((c for c in df.columns if "status" in c), None)
    priority_col = next((c for c in df.columns if "priority" in c), None)
    category_col = next((c for c in df.columns if any(k in c for k in ["category", "type", "subject", "issue"])), None)

    total_tickets = int(len(df))
    
    closed_tickets = 0
    if status_col:
        closed_tickets = int(df[status_col].astype(str).str.lower().str.contains("closed|fechado|resolved|solved").sum())

    high_priority = 0
    if priority_col:
        high_priority = int(df[priority_col].astype(str).str.lower().str.contains("high|alta|urgent|urgente").sum())

    top_categories = {}
    if category_col:
        raw_categories = df[category_col].astype(str).value_counts().head(10).to_dict()
        top_categories = {str(k): int(v) for k, v in raw_categories.items()}
    else:
        top_categories = {"Geral": total_tickets}

    metrics_payload = {
        "total_tickets": total_tickets,
        "closed_tickets": closed_tickets,
        "high_priority_tickets": high_priority,
        "tickets_per_day": tickets_per_day,
        "top_categories": top_categories
    }

    # Salva o arquivo 
    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, ensure_ascii=False, indent=4)

    print(f"ETL concluído com sucesso! Métricas salvas em: {METRICS_FILE}")

if __name__ == "__main__":
    run_etl()