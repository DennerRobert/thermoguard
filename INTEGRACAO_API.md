# Integração API ThermoGuard - Guia de Uso

## ✅ Implementação Concluída

A integração completa entre o frontend Next.js e a API ThermoGuard foi implementada com sucesso.

## 📋 O que foi implementado

### 1. Configuração Base
- ✅ Cliente HTTP centralizado (`src/lib/api-client.ts`)
- ✅ Gerenciador de tokens JWT (`src/utils/token-manager.ts`)
- ✅ Tratamento de erros (`src/utils/error-handler.ts`)
- ✅ Variáveis de ambiente (`.env.local`)

### 2. Interfaces TypeScript
- ✅ Interfaces de resposta da API (`src/interfaces/api-responses.interface.ts`)
- ✅ Atualização da interface User
- ✅ Atualização das interfaces ThermoGuard

### 3. Serviços da API
- ✅ Serviço de autenticação (`src/services/auth.service.ts`)
- ✅ Serviço de sensores (`src/services/sensors.service.ts`)
- ✅ Serviço de ar-condicionados (`src/services/air-conditioners.service.ts`)
- ✅ Serviço de dashboard (`src/services/dashboard.service.ts`)
- ✅ Serviço de salas (`src/services/rooms.service.ts`)
- ✅ Serviço de data centers (`src/services/datacenters.service.ts`)

### 4. Stores Zustand
- ✅ Store de autenticação com API real
- ✅ Store ThermoGuard com polling automático
- ✅ Gerenciamento de estado com loading/error

### 5. Componentes
- ✅ LoginForm com integração real
- ✅ Dashboard com polling de dados
- ✅ ControlPanel com chamadas à API

## 🚀 Como usar

### 1. Configuração Inicial

Certifique-se de que a API está rodando:
```bash
# A API deve estar rodando em http://localhost:8000
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Variáveis de Ambiente

O arquivo `.env.local` já foi criado com:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_ROOM_ID=4e753ac4-d939-4ad5-a1b0-247a10902e10
```

**Importante:** Substitua o `NEXT_PUBLIC_DEFAULT_ROOM_ID` pelo UUID da sala que você deseja monitorar.

### 4. Iniciar o Frontend

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### 5. Login

Use as credenciais:
- **Email:** admin@admin.com
- **Password:** admin

## 📡 Funcionalidades Implementadas

### Autenticação
- ✅ Login com JWT
- ✅ Logout
- ✅ Refresh automático de token
- ✅ Persistência de sessão no localStorage

### Dashboard em Tempo Real
- ✅ Polling automático a cada 1 minuto
- ✅ Atualização de temperatura e umidade
- ✅ Sincronização de status dos ar-condicionados
- ✅ Histórico de temperatura das últimas 30 leituras (últimos 30 minutos)
- ✅ Cleanup correto ao desmontar componente

### Controle de Ar-Condicionados
- ✅ Ligar/Desligar ACs individuais
- ✅ Desligar todos os ACs
- ✅ Alternar modo manual/automático
- ✅ Atualizar setpoint de temperatura
- ✅ Gravar sinais IR

### Tratamento de Erros
- ✅ Mensagens de erro amigáveis em português
- ✅ Retry automático em caso de token expirado
- ✅ Feedback visual de loading

## 🔧 Configurações Importantes

### API Client
O cliente HTTP em `src/lib/api-client.ts` possui:
- Auto-refresh de token JWT
- Retry logic
- Timeout de requisições
- Tratamento de erros padronizado

### Polling
O sistema de polling está configurado para:
- **Status:** Temporariamente desabilitado para evitar rate limit
- **Intervalo configurado:** 1 minuto (60 segundos)
- **Endpoints:** `fetchSensorData()`, `fetchAirConditioners()` e `fetchTemperatureHistory()`
- **Cleanup:** Automático ao desmontar componente
- **Justificativa:** As leituras dos sensores são gravadas a cada 1 minuto no banco de dados

**⚠️ Importante:** O polling está desabilitado até que o rate limiting no backend seja ajustado. Para reativar, edite `src/stores/thermoguard.ts` e descomente o código de polling em `startPolling()`.

### Room ID
O sistema usa o roomId definido em `NEXT_PUBLIC_DEFAULT_ROOM_ID` no arquivo `.env.local`. 

**Configuração:**
1. Obtenha o UUID da sala no banco de dados
2. Adicione ao `.env.local`: `NEXT_PUBLIC_DEFAULT_ROOM_ID=seu-room-uuid`
3. Reinicie o servidor Next.js

**Fallback:** Se não houver roomId no ambiente, o sistema tenta buscar automaticamente a primeira sala da API.

## 📝 Próximos Passos (Opcional)

### Para adicionar WebSocket (futuro):
1. Instalar biblioteca: `npm install socket.io-client`
2. Criar serviço WebSocket em `src/services/websocket.service.ts`
3. Substituir polling por eventos em tempo real

### Para adicionar seletor de salas:
1. Criar componente `RoomSelector`
2. Adicionar ao header ou sidebar
3. Atualizar `roomId` na store ao selecionar

### Para adicionar mais funcionalidades:
- Sistema de alertas
- Relatórios e estatísticas
- Gerenciamento de usuários
- Configurações avançadas

## 📡 Endpoints Utilizados

### Dados do Sensor (Temperatura/Umidade)
1. **Busca sensores da sala:** `GET /api/sensors/` (filtra por `room`)
2. **Busca última leitura:** `GET /api/sensors/{sensor_id}/readings/?limit=1`

### Histórico de Temperatura
1. **Busca sensores da sala:** `GET /api/sensors/` (filtra por `room`)
2. **Busca últimas 30 leituras:** `GET /api/sensors/{sensor_id}/readings/?limit=30`

### Ar-Condicionados
- **Lista ACs:** `GET /api/air-conditioners/`
- **Ligar/Desligar:** `POST /api/air-conditioners/{id}/control/`

### Autenticação
- **Login:** `POST /api/auth/login/`
- **Refresh token:** `POST /api/auth/token/refresh/`

## 🐛 Troubleshooting

### API retorna HTTP 429 (Throttled)
**Problema:** A API está limitando requisições (rate limit).

**Solução no backend Django:**
```python
# Em settings.py
REST_FRAMEWORK = {
    # ... outras configs ...
    'DEFAULT_THROTTLE_CLASSES': [],  # Desabilita throttling
    # OU aumentar os limites:
    # 'DEFAULT_THROTTLE_RATES': {
    #     'anon': '10000/hour',
    #     'user': '100000/hour',
    # }
}
```

### API não responde
- Verifique se a API está rodando em `http://localhost:8000`
- Verifique o CORS no backend Django
- Verifique o console do navegador para erros

### Token expira rapidamente
- Ajuste o tempo de expiração no backend
- O refresh automático está implementado

### Polling não funciona
- O polling está **desabilitado** por padrão para evitar rate limit
- Para reativar, ajuste o throttling no backend primeiro
- Depois, descomente o código de polling em `src/stores/thermoguard.ts`

### Sem dados no dashboard
- Verifique se há data centers cadastrados
- Verifique se há salas cadastradas
- Verifique se há sensores e ACs cadastrados
- Verifique se há leituras no banco: `/admin/sensors/sensorreading/`
- O ESP32 ainda não está integrado, então as leituras precisam ser criadas manualmente ou via API

## 📦 Estrutura de Arquivos

```
src/
├── lib/
│   └── api-client.ts           # Cliente HTTP
├── utils/
│   ├── token-manager.ts        # Gerenciamento de tokens
│   ├── error-handler.ts        # Tratamento de erros
│   └── room-selector.ts        # Seleção automática de sala
├── services/
│   ├── auth.service.ts         # Autenticação
│   ├── sensors.service.ts      # Sensores
│   ├── air-conditioners.service.ts  # Ar-condicionados
│   ├── dashboard.service.ts    # Dashboard
│   ├── rooms.service.ts        # Salas
│   └── datacenters.service.ts  # Data Centers
├── interfaces/
│   ├── user.interface.ts       # Interface User
│   └── api-responses.interface.ts  # Interfaces da API
├── types/
│   └── thermoguard.interface.ts    # Tipos ThermoGuard
├── stores/
│   ├── auth.ts                 # Store de autenticação
│   └── thermoguard.ts          # Store principal
└── components/
    ├── LoginForm/              # Formulário de login
    ├── control-panel/          # Painel de controle
    └── dashboard/              # Dashboard
```

## ✨ Recursos Avançados

### Refresh Automático de Token
O sistema detecta automaticamente quando o token expira e faz refresh sem interromper a experiência do usuário.

### Retry Logic
Em caso de falha de rede, o sistema tenta novamente automaticamente.

### Error Handling
Todos os erros são tratados e exibidos em português com mensagens amigáveis.

### Loading States
Todos os botões e ações mostram feedback visual durante processamento.

## 🎯 Checklist de Testes

Para testar a integração completa:

- [ ] Login com credenciais corretas
- [ ] Login com credenciais incorretas (ver mensagem de erro)
- [ ] Logout (redireciona para login)
- [ ] Acesso ao dashboard após login
- [ ] Visualização de temperatura e umidade
- [ ] Visualização de ar-condicionados
- [ ] Ligar um ar-condicionado
- [ ] Desligar um ar-condicionado
- [ ] Desligar todos os ar-condicionados
- [ ] Alternar modo manual/automático
- [ ] Alterar setpoint de temperatura
- [ ] Polling funcionando (ver requisições no Network tab)
- [ ] Refresh automático de token
- [ ] Comportamento com API offline

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do backend
3. Verifique as configurações de CORS no backend
4. Verifique se todos os recursos estão cadastrados no banco de dados

---

**Implementado com sucesso!** 🎉
