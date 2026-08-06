// ============================================================
//  FONTE DA VERDADE DOS PREÇOS
//  Os preços ficam AQUI, no servidor — nunca no navegador.
//  O valor cobrado é sempre calculado a partir desta tabela,
//  então o cliente não consegue alterar o valor pelo site.
//
//  valor = em CENTAVOS (R$ 159,90 => 15990)
//  Mantenha os IDs iguais aos do Painel Admin / loja.
// ============================================================

export const PRODUTOS = {
  'tiger-preta':  { nome: 'Bermuda Tiger Preta',   valor: 15990, pesoKg: 0.4 },
  'p2':           { nome: 'Bermuda Floral Menta',  valor: 14990, pesoKg: 0.4 },
  'p3':           { nome: 'Bermuda Camo Nude',     valor: 16990, pesoKg: 0.4 },
  'p4':           { nome: 'Walkshort Marinho',     valor: 13990, pesoKg: 0.4 },
};

// Frete SEDEX estimado por região (1º dígito do CEP), em centavos, até 1kg.
// Troque pelos seus valores reais ou integre a API dos Correios depois.
export function freteSedexCentavos(cep, qtd = 1) {
  const d = String(cep || '').replace(/\D/g, '');
  const r = parseInt(d[0], 10);
  let base = 4690; // Norte/Centro-Oeste (padrão)
  if (r === 2) base = 2150;                 // Rio de Janeiro
  else if ([0, 1, 3].includes(r)) base = 2890; // Sudeste
  else if ([8, 9].includes(r)) base = 3350;     // Sul
  else if ([4, 5].includes(r)) base = 3990;     // Nordeste
  const kgAdicional = Math.max(0, Math.ceil(qtd * 0.4) - 1);
  return base + kgAdicional * 700;
}
