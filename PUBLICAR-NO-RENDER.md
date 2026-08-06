# Publicar no Render — guia rápido (amanhã)

Objetivo: deixar o servidor online 24h num endereço https público.

## Opção mais simples: subir por GitHub (o Render lê o render.yaml sozinho)

### 1. Conta
- Crie conta grátis em https://render.com e em https://github.com

### 2. Enviar a pasta backend para o GitHub
- No github.com → New repository → nome `fabricio-jiu-mercadopago` → Create
- Na página do repositório → "uploading an existing file" → arraste TODOS os arquivos
  desta pasta `backend` (server.js, package.json, produtos.js, render.yaml, .env.example)
  → Commit changes
  > NÃO envie o arquivo `.env` (ele tem o token). O GitHub e o Render não precisam dele —
  > o token vai direto no painel do Render (passo 4).

### 3. Criar o serviço no Render
- Render → New → Blueprint → conecte sua conta GitHub → escolha o repositório
- O Render detecta o `render.yaml` e monta tudo. Clique Apply.

### 4. Preencher as 2 variáveis secretas (aba Environment do serviço)
- `MP_ACCESS_TOKEN` = Access Token de PRODUÇÃO (APP_USR-...)
- `SERVER_URL` = o endereço que o Render te deu (ex.: https://fabricio-jiu-mercadopago.onrender.com)
- Salve → o serviço reinicia.

### 5. Testar
- Abra `https://SEU-ENDERECO.onrender.com/` → deve mostrar
  "Backend Mercado Pago ok — ambiente: production".

## Depois de publicar
1. Painel Admin → Pagamentos → URL do servidor:
   `https://SEU-ENDERECO.onrender.com/api/mercadopago/criar-preferencia`
   Ambiente: Produção → Salvar.
2. Mercado Pago (developers) → sua aplicação → Webhooks → URL:
   `https://SEU-ENDERECO.onrender.com/api/mercadopago/webhook` → evento Pagamentos.
3. Faça 1 compra real de valor baixo para validar Pix + cartão.

Obs.: no plano grátis o servidor "dorme" após ~15 min parado; a 1ª compra depois disso
demora ~30–50s para responder. Plano pago (~US$7/mês) fica sempre ligado.
