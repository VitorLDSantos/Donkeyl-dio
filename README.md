# Macacos em Apuros

Jogo de plataforma para 2 jogadores locais (Donkey Kong + Super Mario, só com macacos), em React.js.

## Como rodar

1. `npm install`
2. `npm run dev`
3. Abra o endereço que aparecer no terminal (normalmente http://localhost:5173)

## Controles

- Jogador 1: A/D andar, W/S escada, Espaço pular
- Jogador 2: setas andar e escada, Enter pular
- Mouse (Jogador 1): botão esquerdo segurado anda até o ponteiro, botão direito pula
- Controle PS4: 1 controle = Jogador 2; 2 controles = J1 e J2. Direcional ou analógico esquerdo, X pula
  (aperte um botão para o navegador reconhecer o controle)

## Arquivos principais

- `src/Jogo.jsx`: lógica e desenho do jogo (canvas)
- `src/App.jsx`: tela, instruções e botão Reiniciar
- `src/estilos.css`: visual
