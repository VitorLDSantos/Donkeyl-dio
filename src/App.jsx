import { useEffect, useState } from "react";
import Jogo from "./Jogo";

function Cartao({ titulo, children }) {
  return (
    <div className="card">
      <h2>{titulo}</h2>
      {children}
    </div>
  );
}

export default function App() {
  const [rodada, setRodada] = useState(0);
  const [pads, setPads] = useState(0);

  useEffect(() => {
    const contar = () =>
      setPads([...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean).length);
    window.addEventListener("gamepadconnected", contar);
    window.addEventListener("gamepaddisconnected", contar);
    contar();
    return () => {
      window.removeEventListener("gamepadconnected", contar);
      window.removeEventListener("gamepaddisconnected", contar);
    };
  }, []);

  return (
    <div className="app">
      <h1>🐒 Macacos em Apuros 🦍</h1>

      {/* trocar a key reinicia o jogo do zero */}
      <Jogo key={rodada} />

      <p className="meta">
        Suba as escadas até o 🏆, pegue 🍌 e desvie dos barris do gorila. Pule em cima de um barril
        para destruí-lo. Cada macaco tem 3 vidas.
      </p>

      <div className="cards">
        <Cartao titulo="🐒 Jogador 1 · teclado">A / D andar · W / S escada · Espaço pular</Cartao>
        <Cartao titulo="🐵 Jogador 2 · teclado">Setas andar e subir/descer escada · Enter pular</Cartao>
        <Cartao titulo="🖱️ Mouse (Jogador 1)">
          Segure o botão esquerdo para andar até o ponteiro (acima ou abaixo = escada) · botão direito pula
        </Cartao>
        <Cartao titulo="🎮 Controle PS4">
          Com 1 controle ele joga de Jogador 2; com 2 controles, J1 e J2. Direcional ou analógico
          esquerdo · X pula. Aperte um botão para ativar.
        </Cartao>
      </div>

      <p className="meta">Controles conectados: {pads}</p>
      <button type="button" onClick={() => setRodada((r) => r + 1)}>Reiniciar</button>
    </div>
  );
}
