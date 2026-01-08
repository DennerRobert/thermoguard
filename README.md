# ThermoGuard IoT

Sistema de Monitoramento Térmico para Data Centers com controle de ar-condicionado via infravermelho.

## Arquitetura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   ESP32      │────►│   API        │────►│   Supabase   │◄────│   Frontend   │
│   Sensores   │POST │   Django     │     │   PostgreSQL │     │   Next.js    │
│   DHT22 + IR │◄────│   REST       │◄────│              │     │   Dashboard  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## Stack Tecnológico

### Frontend (Este Repositório)
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS 3** - Estilização
- **Zustand** - Gerenciamento de estado
- **React Hook Form + Zod** - Formulários e validação
- **Recharts** - Gráficos
- **Lucide React** - Ícones

### Backend (Repositório Separado)
- **Python/Django** - API REST
- **Django Rest Framework** - Endpoints
- **PostgreSQL** - Banco de dados (Supabase)

### Hardware
- **ESP32** - Microcontrolador
- **DHT22** - Sensor de temperatura e umidade
- **LED IR** - Transmissor infravermelho

## Funcionalidades

- Monitoramento em tempo real de temperatura e umidade
- Controle de múltiplas unidades de ar-condicionado
- Modo automático (liga/desliga baseado no setpoint)
- Gravação de sinais IR dos controles remotos
- Histórico de leituras com gráficos
- Alertas de temperatura crítica
- Interface responsiva (Mobile First)

## Estrutura do Projeto

```
src/
├── app/
│   ├── globals.css      # Estilos globais
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Dashboard
├── components/
│   ├── header/          # Cabeçalho com status e relógio
│   ├── temperature-gauge/   # Gauge de temperatura
│   ├── humidity-card/   # Card de umidade
│   ├── air-conditioner-status/  # Status das unidades AC
│   ├── control-panel/   # Painel de controle
│   └── temperature-history-chart/  # Gráfico histórico
├── stores/
│   └── thermoguard.ts   # Store Zustand
├── types/
│   └── thermoguard.interface.ts  # Tipos TypeScript
└── schemas/
    └── control-panel.schema.ts   # Schemas Zod
```

## Banco de Dados (Supabase)

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `data_centers` | Cadastro de data centers |
| `rooms` | Salas com setpoint e modo de operação |
| `sensors` | Sensores ESP32 com API key |
| `sensor_readings` | Leituras de temperatura/umidade |
| `air_conditioners` | Unidades de ar-condicionado |
| `ir_signals` | Sinais IR gravados |
| `alerts` | Alertas do sistema |
| `command_logs` | Log de comandos executados |
| `pending_commands` | Fila de comandos para ESP32 |

### Diagrama ER

```
data_centers
    │
    └── rooms
        ├── sensors ─── sensor_readings
        ├── air_conditioners
        │   ├── ir_signals
        │   └── pending_commands
        └── alerts
```

## Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/thermoguard.git
cd thermoguard

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas configurações

# Rodar em desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar produção
npm run lint     # Verificar código
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/` - Estado geral do sistema

### Sensores
- `POST /api/sensors/readings/` - ESP32 envia leitura
- `GET /api/sensors/{id}/readings/` - Histórico de leituras

### Ar-Condicionado
- `POST /api/air-conditioners/{id}/turn-on/` - Ligar
- `POST /api/air-conditioners/{id}/turn-off/` - Desligar
- `POST /api/air-conditioners/turn-off-all/` - Desligar todas

### Configurações
- `PATCH /api/rooms/{id}/settings/` - Alterar setpoint/modo

### ESP32
- `GET /api/devices/{id}/pending-commands/` - Buscar comandos
- `PATCH /api/commands/{id}/confirm/` - Confirmar execução

## Fluxo de Dados

### Leitura de Sensor
```
ESP32 → POST /api/sensors/readings/ → API → Supabase
                                              ↓
Frontend ← GET /api/dashboard/ (polling) ← API
```

### Comando de Ar-Condicionado
```
Frontend → POST /api/air-conditioners/{id}/turn-on/ → API
                                                        ↓
                                              pending_commands
                                                        ↓
ESP32 ← GET /api/devices/{id}/pending-commands/ ← API
   ↓
Transmite IR
   ↓
ESP32 → PATCH /api/commands/{id}/confirm/ → API
```

## Screenshots

### Dashboard
- Gauge de temperatura com indicador de setpoint
- Card de umidade estilo tanque d'água
- Gráfico de histórico (temperatura + umidade)
- Status das unidades de ar-condicionado
- Painel de controle com botões glassmorphism

## Roadmap

- [ ] Integração completa com API Django
- [ ] WebSocket para tempo real
- [ ] Sistema de alertas por email/push
- [ ] App mobile (React Native)
- [ ] Múltiplos data centers
- [ ] Relatórios PDF

## Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## Autor

Desenvolvido por Denner Robert

---

**ThermoGuard IoT** - Monitoramento térmico inteligente para data centers
