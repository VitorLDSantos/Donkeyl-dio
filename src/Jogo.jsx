import { useEffect, useRef } from "react";

const W = 800, H = 450;
// plataformas: d = direção em que o barril rola ao pousar nela
const PL = [{x:0,w:800,y:420,d:1},{x:40,w:760,y:345,d:-1},{x:0,w:760,y:270,d:1},{x:60,w:640,y:195,d:-1},{x:0,w:560,y:120,d:1}];
const LD = [{x:700,a:345,b:420},{x:100,a:270,b:345},{x:640,a:195,b:270},{x:500,a:120,b:195}];
const BAN = [[300,410],[560,335],[200,260],[420,185],[330,110],[740,410]];
const GOAL = { x: 230, y: 120 };
const novo = (i, emoji) => ({ x: 60 + i * 50, y: 420, vy: 0, on: true, clm: false, vid: 3, pts: 0, inv: 0, emoji, win: false });

export default function Jogo() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, c = cv.getContext("2d");
    const P = [novo(0, "🐒"), novo(1, "🐵")];
    let bar = [], ban = BAN.map(([x, y]) => ({ x, y, ok: true })), t = 0, estado = "jogando", venc = -1, raf;
    const K = {}, M = { x: 0, y: 0, seg: false, pulo: false };

    const kd = (e) => { K[e.code] = true; if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter"].includes(e.code)) e.preventDefault(); };
    const ku = (e) => { K[e.code] = false; };
    const pos = (e) => { const r = cv.getBoundingClientRect(); M.x = (e.clientX - r.left) * W / r.width; M.y = (e.clientY - r.top) * H / r.height; };
    const md = (e) => { pos(e); if (e.button === 2) M.pulo = true; else M.seg = true; e.preventDefault(); };
    const mu = (e) => { if (e.button === 2) M.pulo = false; else M.seg = false; };
    const cm = (e) => e.preventDefault();
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); window.addEventListener("mouseup", mu);
    cv.addEventListener("mousemove", pos); cv.addEventListener("mousedown", md); cv.addEventListener("contextmenu", cm);

    const padIn = (g) => { if (!g) return {}; const b = (i) => g.buttons[i] && g.buttons[i].pressed;
      return { l: g.axes[0] < -.4 || b(14), r: g.axes[0] > .4 || b(15), u: g.axes[1] < -.5 || b(12), d: g.axes[1] > .5 || b(13), j: b(0) }; };
    const entrada = (i) => {
      const gs = [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean);
      const g = padIn(gs.length >= 2 ? gs[i] : (gs.length === 1 && i === 1 ? gs[0] : null));
      const p = P[i];
      const o = i === 0 ? { l: K.KeyA, r: K.KeyD, u: K.KeyW, d: K.KeyS, j: K.Space }
                        : { l: K.ArrowLeft, r: K.ArrowRight, u: K.ArrowUp, d: K.ArrowDown, j: K.Enter };
      if (i === 0 && M.seg) { o.l = o.l || M.x < p.x - 8; o.r = o.r || M.x > p.x + 8; o.u = o.u || M.y < p.y - 30; o.d = o.d || M.y > p.y + 12; }
      if (i === 0 && M.pulo) o.j = true;
      return { l: o.l || g.l, r: o.r || g.r, u: o.u || g.u, d: o.d || g.d, j: o.j || g.j };
    };

    const atualiza = (p, i) => {
      const n = entrada(i);
      if (p.inv > 0) p.inv--;
      const lad = LD.find((L) => Math.abs(p.x - L.x) < 14 && p.y >= L.a - 3 && p.y <= L.b + 3);
      if (!p.clm && lad && (n.u || n.d)) { p.clm = true; p.x = lad.x; p.vy = 0; }
      if (p.clm) {
        if (!lad) p.clm = false;
        else {
          p.y += ((n.d ? 1 : 0) - (n.u ? 1 : 0)) * 2;
          if (p.y <= lad.a) { p.y = lad.a; p.clm = false; }
          else if (p.y >= lad.b) { p.y = lad.b; p.clm = false; }
          if (n.j && p.clm) { p.clm = false; p.vy = -6; }
          return;
        }
      }
      const vx = ((n.r ? 1 : 0) - (n.l ? 1 : 0)) * 2.3;
      if (n.j && p.on) p.vy = -8.2;
      const py = p.y; p.vy += .5; p.x = Math.max(12, Math.min(W - 12, p.x + vx)); p.y += p.vy; p.on = false;
      if (p.vy >= 0) for (const q of PL) if (py <= q.y + 1 && p.y >= q.y && p.x + 8 > q.x && p.x - 8 < q.x + q.w) { p.y = q.y; p.vy = 0; p.on = true; break; }
    };

    const passo = () => {
      t++;
      P.forEach((p, i) => { if (p.vid > 0) atualiza(p, i); });
      if (t % 130 === 1) bar.push({ x: 90, y: 112, vx: 1.7, vy: 0 });
      for (const b of bar) {
        const py = b.y + 8; b.vy += .5; b.x += b.vx; b.y += b.vy;
        if (b.vy >= 0) for (const q of PL) if (py <= q.y + 1 && b.y + 8 >= q.y && b.x > q.x && b.x < q.x + q.w) { b.y = q.y - 8; b.vy = 0; b.vx = q.d * 1.7; break; }
      }
      P.forEach((p, i) => {
        if (p.vid <= 0) return;
        for (const b of bar) if (Math.abs(p.x - b.x) < 16 && p.y > b.y - 8 && p.y - 26 < b.y + 8) {
          if (p.vy > 0 && p.y < b.y + 4 && !p.clm) { b.mor = true; p.vy = -5; p.pts += 100; }
          else if (!p.inv) { p.vid--; p.inv = 100; p.x = 60 + i * 50; p.y = 420; p.vy = 0; p.clm = false; }
        }
        for (const b of ban) if (b.ok && Math.abs(p.x - b.x) < 18 && Math.abs(p.y - b.y) < 26) { b.ok = false; p.pts += 50; }
        if (Math.abs(p.x - GOAL.x) < 20 && Math.abs(p.y - GOAL.y) < 2) { p.pts += 500; estado = "vitoria"; venc = i; }
      });
      bar = bar.filter((b) => !b.mor && b.x > -20 && b.x < W + 20 && b.y < H + 20);
      if (estado === "jogando" && P.every((p) => p.vid <= 0)) estado = "fim";
    };

    const em = (s, x, y, sz) => { c.font = sz + "px serif"; c.textAlign = "center"; c.textBaseline = "bottom"; c.fillText(s, x, y); };
    const desenha = () => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#e8590c"); g.addColorStop(.6, "#f4a340"); g.addColorStop(1, "#fbd98b");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff1c1"; c.beginPath(); c.arc(700, 60, 34, 0, 7); c.fill();
      c.strokeStyle = "#5a3a1a"; c.lineWidth = 3;
      for (const L of LD) { c.beginPath(); c.moveTo(L.x - 9, L.a); c.lineTo(L.x - 9, L.b); c.moveTo(L.x + 9, L.a); c.lineTo(L.x + 9, L.b);
        for (let y = L.a + 8; y < L.b; y += 10) { c.moveTo(L.x - 9, y); c.lineTo(L.x + 9, y); } c.stroke(); }
      for (const q of PL) { c.fillStyle = "#8a5a2b"; c.fillRect(q.x, q.y, q.w, 9); c.fillStyle = "#4e2f14"; c.fillRect(q.x, q.y + 9, q.w, 3); }
      em("🦍", 50, 122, 56); em("🏆", GOAL.x, GOAL.y, 34);
      for (const b of ban) if (b.ok) em("🍌", b.x, b.y, 22);
      for (const b of bar) em("🛢️", b.x, b.y + 9, 20);
      P.forEach((p) => { if (p.vid > 0 && !(p.inv > 0 && p.inv % 10 < 5)) em(p.emoji, p.x, p.y + 2, 28); });
      c.font = "bold 16px sans-serif"; c.fillStyle = "#3b2a1a"; c.textBaseline = "top";
      c.textAlign = "left"; c.fillText("🐒 J1  ❤ " + P[0].vid + "   ⭐ " + P[0].pts, 10, 8);
      c.textAlign = "right"; c.fillText("🐵 J2  ❤ " + P[1].vid + "   ⭐ " + P[1].pts, W - 10, 8);
      if (estado !== "jogando") {
        c.fillStyle = "rgba(0,0,0,.6)"; c.fillRect(0, 150, W, 120); c.fillStyle = "#ffd23f"; c.textAlign = "center"; c.textBaseline = "middle";
        c.font = "bold 30px sans-serif";
        c.fillText(estado === "vitoria" ? "Jogador " + (venc + 1) + " pegou o troféu! 🏆" : "Fim de jogo: acabaram as vidas!", W / 2, 195);
        c.font = "16px sans-serif"; c.fillStyle = "#fff3d6"; c.fillText("Aperte Reiniciar para jogar de novo", W / 2, 238);
      }
    };

    const loop = () => { if (estado === "jogando") passo(); desenha(); raf = requestAnimationFrame(loop); };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("mouseup", mu);
    };
  }, []);
  return <canvas ref={ref} width={W} height={H} tabIndex={0} aria-label="Área do jogo" />;
}
