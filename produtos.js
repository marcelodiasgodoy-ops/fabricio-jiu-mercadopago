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
  'rash-amarelo': { nome: 'Rash Guard Preta com Amarelo', valor: 20000, pesoKg: 0.3 },
  'rash-branco': { nome: 'Rash Guard Preta com Branco', valor: 20000, pesoKg: 0.3 },
  'kimono-atama-branco': { nome: 'Kimono Atama Ultra Light Branco', valor: 53000, pesoKg: 1.4 },
  'kimono-atama-preto': { nome: 'Kimono Atama Ultra Light Preto', valor: 56000, pesoKg: 1.4 },
  'camisa-school-preta': { nome: 'Camisa Fabricio School Preta', valor: 10000, pesoKg: 0.25 },
  'praia-bege-listra': { nome: 'Bermuda Praia Bege com Listra', valor: 15000, pesoKg: 0.4 },
  'praia-bege-marrom': { nome: 'Bermuda Praia Bege com Marrom', valor: 15000, pesoKg: 0.4 },
  'praia-bege-preta': { nome: 'Bermuda Praia Bege e Preta', valor: 15000, pesoKg: 0.4 },
  'praia-bicolor': { nome: 'Bermuda Praia Bi-Color', valor: 15000, pesoKg: 0.4 },
  'praia-branca-azul': { nome: 'Bermuda Praia Branca e Azul', valor: 15000, pesoKg: 0.4 },
  'praia-branco-listra': { nome: 'Bermuda Praia Branca com Listra Azul e Preta', valor: 15000, pesoKg: 0.4 },
  'praia-camuflada': { nome: 'Bermuda Praia Camuflada', valor: 15000, pesoKg: 0.4 },
  'praia-grafitte': { nome: 'Bermuda Praia Grafite com Detalhe Lateral', valor: 15000, pesoKg: 0.4 },
  'praia-preta': { nome: 'Bermuda Praia Preta', valor: 15000, pesoKg: 0.4 },
  'social-azul': { nome: 'Bermuda Social Azul', valor: 18000, pesoKg: 0.4 },
  'social-cinza': { nome: 'Bermuda Social Cinza', valor: 18000, pesoKg: 0.4 },
  'social-grafitte': { nome: 'Bermuda Social Grafite', valor: 18000, pesoKg: 0.4 },
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
