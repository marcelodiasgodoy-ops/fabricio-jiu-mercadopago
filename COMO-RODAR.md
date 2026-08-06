# Backend do Checkout Mercado Pago — passo a passo

Este servidor cria o pagamento no Mercado Pago (Checkout Pro) com o **valor travado**
(produto + frete) e recebe a confirmação automática. Siga na ordem.

O que cada ponto que você pediu resolve:
- **Pix e Cartão** → habilitados por padrão no Checkout Pro (o cliente escolhe na hora).
- **Baixa na hora do pagamento** → o Webhook (item "Produção", passo 4) marca o pedido
  como PAGO no instante em que o Mercado Pago aprova.
- **Controle das operações** → tudo no Mercado Pago (Atividade/Vendas) e nos endpoints
  `/api/mercadopago/pedidos` (lista) e `/api/mercadopago/pedido/:ref`.
- **Preço certo automático** → o preço vem de `produtos.js` (no servidor), nunca do
  navegador; o cliente não consegue pagar valor diferente.

---

## Parte 1 — Testar no seu Mac (ambiente de teste)

### 1. Instalar o Node.js
Baixe em https://nodejs.org (versão LTS) e instale.

### 2. Pegar o Access Token de TESTE
- mercadopago.com.br/developers → **Suas integrações** → sua aplicação
- **Credenciais de teste** → copie o **Access Token** (começa com `TEST-`).

### 3. Configurar
- Nesta pasta `backend`, copie `.env.example` para `.env` e preencha:
  - `MP_ENV=test`
  - `MP_ACCESS_TOKEN=` (cole o Access Token de teste)
  - `SITE_URL=http://localhost`
  - `SERVER_URL=http://localhost:3000`

### 4. Rodar
No Terminal, dentro da pasta `backend`:
```
npm install
npm start
```
Deve aparecer: `Servidor rodando na porta 3000 (test)`. Deixe aberto.

### 5. Ligar o site ao servidor
- No **Painel Admin → Pagamentos**, campo URL do servidor:
  `http://localhost:3000/api/mercadopago/criar-preferencia`
- Ambiente: **Teste**. Salvar.
- Faça uma compra de teste no Checkout. Use os cartões de teste do Mercado Pago
  (mercadopago.com.br/developers → documentação → Cartões de teste). Não cobra de verdade.

---

## Parte 2 — Colocar no ar (produção)

### 1. Publicar o servidor (Render — tem plano grátis)
- Conta em https://render.com → **New → Web Service** → aponte para a pasta `backend`
  (via GitHub ou "Deploy from folder").
- Build Command: `npm install` — Start Command: `npm start`.

### 2. Variáveis de ambiente (aba Environment do Render)
- `MP_ENV` = `production`
- `MP_ACCESS_TOKEN` = Access Token de **produção** (começa com `APP_USR-`)
- `SITE_URL` = https://equipefabricio.com.br
- `SERVER_URL` = o endereço que o Render der (ex.: https://fabricio-jiu.onrender.com)

### 3. Apontar o site para o servidor
- No **Painel Admin → Pagamentos**, troque a URL para:
  `https://SEU-ENDERECO-RENDER/api/mercadopago/criar-preferencia`
- Ambiente: **Produção**. Salvar.

### 4. Cadastrar o Webhook (a "baixa na hora")
- mercadopago.com.br/developers → sua aplicação → **Webhooks / Notificações**
- URL: `https://SEU-ENDERECO-RENDER/api/mercadopago/webhook`
- Evento: **Pagamentos (payment)**.

---

## Onde mexer depois
- **Preços e produtos:** `backend/produtos.js` (valores em centavos). Mantenha os mesmos
  IDs do Painel Admin.
- **Frete:** `produtos.js`, função `freteSedexCentavos`.
- **Banco de dados:** hoje os pedidos ficam na memória. Para produção séria, troque por
  um banco (ex.: PostgreSQL grátis no Render).

## Segurança
- O **Access Token** só no servidor (variável de ambiente), nunca no site. ✅
- **Preço recalculado no servidor** a partir de `produtos.js`. ✅
- Sempre teste com credenciais de **teste** antes de virar para **produção**.

## Referências
- Checkout Pro: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- Cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards
