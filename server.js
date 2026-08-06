// ============================================================
//  Backend do checkout — Equipe Fabrício Jiu-Jitsu + Mercado Pago
//  Cria a preferência (Checkout Pro) e recebe a confirmação (webhook).
//  Rode com:  npm install  &&  npm start
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PRODUTOS, freteSedexCentavos } from './produtos.js';

dotenv.config();

const {
  MP_ENV = 'test',                 // test | production
  MP_ACCESS_TOKEN,                 // Access Token (TEST-... ou APP_USR-...)
  SITE_URL = 'https://equipefabricio.com.br',
  SERVER_URL = 'https://seu-servidor.com',
  PORT = 3000,
} = process.env;

const app = express();
app.use(cors());
app.use(express.json());

// Memória simples de pedidos (troque por um banco de dados de verdade depois)
const pedidos = {};

const reais = (cents) => Math.round(cents) / 100;  // Mercado Pago usa valor em reais (decimal)

// ---------- 1) Criar preferência de pagamento ----------
// O site chama este endpoint ao clicar em "Pagar com Mercado Pago".
app.post('/api/mercadopago/criar-preferencia', async (req, res) => {
  try {
    const { produtoId, tamanho, quantidade, frete } = req.body;
    const prod = PRODUTOS[produtoId];
    if (!prod) return res.status(400).json({ erro: 'Produto inválido' });

    const qtd = Math.max(1, parseInt(quantidade, 10) || 1);
    // >>> Preço vem SEMPRE da tabela do servidor, nunca do navegador <<<
    const valorProduto = prod.valor;                               // centavos (unitário)
    const valorFrete = freteSedexCentavos(frete && frete.cep, qtd); // centavos

    const referenceId = 'EF' + Date.now();

    const isLocal = /localhost|127\.0\.0\.1/.test(SITE_URL);

    // Estrutura da preferência do Mercado Pago (Checkout Pro)
    const body = {
      items: [
        {
          id: produtoId,
          title: prod.nome + (tamanho ? ` (Tam. ${tamanho})` : ''),
          quantity: qtd,
          currency_id: 'BRL',
          unit_price: reais(valorProduto),
        },
        {
          id: 'frete-sedex',
          title: 'Frete SEDEX',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: reais(valorFrete),
        },
      ],
      external_reference: referenceId,
      notification_url: `${SERVER_URL}/api/mercadopago/webhook`,
      // Pix + cartão vêm habilitados por padrão; ajuste parcelas se quiser:
      payment_methods: {
        installments: 12,
      },
      statement_descriptor: 'EQUIPE FABRICIO',
    };

    // back_urls / auto_return só com endereço público (o Mercado Pago rejeita localhost)
    if (!isLocal) {
      body.back_urls = {
        success: `${SITE_URL}/obrigado`,
        pending: `${SITE_URL}/pendente`,
        failure: `${SITE_URL}/falha`,
      };
      body.auto_return = 'approved';
    }

    const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Mercado Pago erro:', data);
      return res.status(502).json({ erro: 'Falha ao criar preferência', detalhe: data });
    }

    pedidos[referenceId] = {
      status: 'AGUARDANDO',
      produtoId, tamanho, qtd,
      total: valorProduto * qtd + valorFrete,
      preferenceId: data.id,
    };

    // init_point = produção · sandbox_init_point = teste
    const url = MP_ENV === 'production' ? data.init_point : data.sandbox_init_point;
    if (!url) return res.status(502).json({ erro: 'Mercado Pago não retornou o link de pagamento', detalhe: data });
    return res.json({ init_point: url, reference_id: referenceId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ---------- 2) Webhook (confirmação do pagamento — "baixa na hora") ----------
// O Mercado Pago chama esta URL quando o status do pagamento muda.
app.post('/api/mercadopago/webhook', async (req, res) => {
  // Responde 200 rápido; processa em seguida
  res.sendStatus(200);
  try {
    const topic = req.query.topic || req.body.type;
    const paymentId = (req.body.data && req.body.data.id) || req.query.id;
    if (topic !== 'payment' || !paymentId) return;

    // Consulta o pagamento para confirmar valor e status reais
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    const pay = await r.json();
    const ref = pay.external_reference;
    if (!ref || !pedidos[ref]) return;

    if (pay.status === 'approved') {
      pedidos[ref].status = 'PAGO';
      pedidos[ref].paymentId = paymentId;
      // TODO: confirmar venda, enviar e-mail, dar baixa no estoque, separar p/ envio.
      console.log(`Pedido ${ref} PAGO (pagamento ${paymentId}). Separar para envio.`);
    } else {
      pedidos[ref].status = String(pay.status || 'PENDENTE').toUpperCase();
    }
  } catch (e) {
    console.error('Erro no webhook:', e);
  }
});

// ---------- 3) Consulta de status (o Painel Admin usa para dar baixa) ----------
app.get('/api/mercadopago/pedido/:ref', (req, res) => {
  const p = pedidos[req.params.ref];
  if (!p) return res.status(404).json({ erro: 'Pedido não encontrado' });
  res.json(p);
});
app.get('/api/mercadopago/pedidos', (_req, res) => res.json(pedidos));

app.get('/', (_req, res) => res.send('Backend Mercado Pago ok — ambiente: ' + MP_ENV));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} (${MP_ENV})`));
