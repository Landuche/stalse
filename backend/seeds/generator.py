
import json
import random
import argparse
from datetime import datetime, timedelta

FIRST_NAMES = [
    "Ana", "Carlos", "João", "Maria", "Pedro", "Juliana",
    "Lucas", "Beatriz", "Rafael", "Camila", "Gabriel",
    "Larissa", "Felipe", "Mariana", "Bruno", "Fernanda",
    "Thiago", "Isabela", "André", "Patrícia", "Eduardo",
    "Letícia", "Gustavo", "Amanda", "Diego", "Sofia",
    "Matheus", "Bianca", "Leonardo", "Cláudia",
    "Roberto", "Marcos", "Paula", "Renata", "Rodrigo",
    "Vinícius", "Aline", "Daniel", "Carolina", "Igor",
    "Natália", "Marcelo", "Luana", "Fábio", "Vanessa",
    "Ricardo", "Priscila", "Henrique", "Tatiane", "Alex"
]

LAST_NAMES = [
    "Silva", "Souza", "Santos", "Oliveira", "Costa",
    "Pereira", "Almeida", "Lima", "Ferreira", "Rodrigues",
    "Martins", "Gomes", "Ribeiro", "Carvalho", "Araújo",
    "Melo", "Barros", "Cardoso", "Teixeira", "Nunes",
    "Moreira", "Correia", "Mendes", "Barbosa", "Monteiro",
    "Freitas", "Castro", "Vieira", "Dias", "Ramos",
    "Nascimento", "Cavalcanti", "Machado", "Campos",
    "Azevedo", "Andrade", "Batista", "Rezende", "Pinto",
    "Farias", "Lopes", "Cunha", "Peixoto", "Duarte",
    "Tavares", "Moraes", "Moura", "Borges", "Leal",
    "Miranda", "Coelho", "Xavier", "Fonseca", "Macedo",
    "Queiroz", "Medeiros", "Vasconcelos", "Pacheco",
    "Guimarães", "Abreu"
]

CHANNELS = ["Email", "Chat", "Phone", "WhatsApp", "Web"]
STATUSES = ["open", "in_progress", "pending", "closed"]
PRIORITIES = ["low", "medium", "high", "urgent"]

SUBJECTS = [
    "Erro no pagamento do plano anual",
    "Solicitação de reembolso",
    "Problema ao acessar a conta",
    "Redefinição de senha não funciona",
    "Dúvida sobre cobrança mensal",
    "Falha ao finalizar compra",
    "Atualização de dados cadastrais",
    "Cancelamento de assinatura",
    "Erro ao emitir nota fiscal",
    "Aplicativo apresenta lentidão",
    "Pedido não aparece no histórico",
    "Pagamento duplicado no cartão",
    "Problema na autenticação",
    "Solicitação de upgrade de plano",
    "Dificuldade para cadastrar cartão",
    "Integração com sistema externo",
    "Erro ao carregar dashboard",
    "Solicitação de exclusão de conta",
    "Notificações não estão chegando",
    "Dúvida sobre funcionalidades",
    "Instabilidade durante o acesso",
    "Falha no envio de documentos",
    "Alteração de endereço de cobrança",
    "Solicitação de suporte técnico",
    "Erro ao exportar relatório",
    "Conta bloqueada inesperadamente",
    "Problema com código de verificação",
    "Divergência no valor da fatura",
    "Solicitação de segunda via de boleto",
    "Feedback sobre a plataforma"
]

def generate_name():
    first = random.choice(FIRST_NAMES)

    # 40% de chance de usar dois sobrenomes
    if random.random() < 0.40:
        last1, last2 = random.sample(LAST_NAMES, 2)
        return f"{first} {last1} {last2}"

    last = random.choice(LAST_NAMES)
    return f"{first} {last}"

def generate_record(index, start_date):
    created = start_date + timedelta(
        seconds=random.randint(0, 8_640_000)
    )

    return {
        "customer_name": generate_name(),
        "channel": random.choice(CHANNELS),
        "subject": random.choice(SUBJECTS),
        "status": random.choice(STATUSES),
        "priority": random.choice(PRIORITIES),
        "created_at": created.strftime("%Y-%m-%dT%H:%M:%S")
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=8_469)
    parser.add_argument("--output", default="tickets_seed.json")
    parser.add_argument("--format", choices=["jsonl", "json"],
                        default="json")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    if args.count < 0:
        parser.error("--count deve ser maior ou igual a zero")

    random.seed(args.seed)
    start_date = datetime(2026, 1, 1)

    with open(args.output, "w", encoding="utf-8") as f:
        if args.format == "json":
            f.write("[\n")

        for i in range(args.count):
            record = generate_record(i, start_date)
            serialized = json.dumps(record, ensure_ascii=False)

            if args.format == "json":
                if i:
                    f.write(",\n")
                f.write(serialized)
            else:
                f.write(serialized + "\n")

        if args.format == "json":
            f.write("\n]\n")

    print(f"Gerados: {args.count:,} registros")
    print(f"Arquivo: {args.output}")
    print(f"Formato: {args.format}")

if __name__ == "__main__":
    main()
