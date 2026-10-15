'use strict';

/* ================= 数据 ================= */
const CHARS = [
  { id: 'ds',      name: 'DS娘',      sub: '深海的嘟囔 · 大肥鱼', r: 5, quote: '咕噜……在深海里想了好久好久，终于浮上来见你啦。以后要管饭哦！' },
  { id: 'claude',  name: 'Claude娘',  sub: '秋日长思',   r: 4, quote: '这个问题，让我认真想一想再回答你。' },
  { id: 'gpt',     name: 'GPT娘',     sub: '白龙之息',   r: 4, quote: '有什么想问的？我一直都在。' },
  { id: 'gemini',  name: 'Gemini娘',  sub: '双瞳星猫',   r: 4, quote: '左眼看今天，右眼看明天～喵。' },
  { id: 'grok',    name: 'Grok娘',    sub: '小恶魔女王', r: 4, quote: '嘿嘿，说大实话可是我的特长！' },
  { id: 'qwen',    name: '千问娘',    sub: '扇底千问',   r: 4, quote: '千问千答，不急，慢慢来。' },
  { id: 'kimi',    name: 'Kimi娘',    sub: '月下女仆',   r: 3, quote: '再长的文章，交给我读就好。' },
  { id: 'mistral', name: 'Mistral娘', sub: '法棍猫猫',   r: 3, quote: '要不要来一根？刚出炉的法棍哦。' },
  { id: 'zhipu',   name: '智谱娘',    sub: '眠狐',       r: 3, quote: '呼……醒着的时候，我可是很聪明的。' },
  { id: 'doubao',  name: '豆包娘',    sub: '红围巾',     r: 3, quote: '嘿！今天也要开开心心的！' },
];
const BY_R = { 5: CHARS.filter(c => c.r === 5), 4: CHARS.filter(c => c.r === 4), 3: CHARS.filter(c => c.r === 3) };
const RATE5 = 0.0001;    // DS娘：0.01%（万分之一）
const RATE4 = 0.10;
const PITY5 = 350;       // 至多 350 次必得 5 星
const PITY4 = 10;        // 每 10 次必得 4 星或以上
const RICE_PER_WHALE = 160;
const pct = x => +(x * 100).toFixed(4) + '%';
const RC = { 3: '120,180,255', 4: '196,136,255', 5: '255,201,84' };
const BANNER = '深海的嘟囔';
const img = p => `assets/${p}`;
const charSrc = id => img(`chars/${id}.png`);

/* ================= 存档 ================= */
const SAVE_KEY = 'ww-gacha-ds-v1';
const state = Object.assign({ rice: 911, whale: 10, pity5: 0, pity4: 0, total: 0, history: [], sound: true, owned: {} }, load());
function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }

/* ================= 舞台缩放 ================= */
const $ = s => document.querySelector(s);
const stage = $('#stage');
let U = 1;
function fit() {
  const w = Math.min(innerWidth, innerHeight * 16 / 9);
  stage.style.width = w + 'px';
  stage.style.height = w * 9 / 16 + 'px';
  U = w / 2000;
  stage.style.setProperty('--u', U + 'px');
  FX.resize();
}

/* ================= 音效（WebAudio 合成） ================= */
const SFX = (() => {
  let ac = null, master = null;
  function ctx() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ac = new C(); master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, t0, dur, type = 'sine', vol = .3, f2) {
    const a = ctx(); if (!a || !state.sound) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, a.currentTime + t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + t0 + dur);
    g.gain.setValueAtTime(0, a.currentTime + t0);
    g.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + .01);
    g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + dur);
    o.connect(g); g.connect(master); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + .05);
  }
  function noise(t0, dur, f1, f2, vol = .25, q = 1.5) {
    const a = ctx(); if (!a || !state.sound) return;
    const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(); s.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f1, a.currentTime + t0); bp.frequency.exponentialRampToValueAtTime(f2, a.currentTime + t0 + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0, a.currentTime + t0);
    g.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + dur * .7);
    g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + dur);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(a.currentTime + t0);
  }
  return {
    unlock: ctx,
    click() { tone(880, 0, .08, 'triangle', .15); },
    coin() { tone(1318, 0, .12, 'triangle', .2); tone(1760, .07, .25, 'triangle', .2); },
    // 开场俯冲：低频下坠 + 气流
    dive() { noise(0, 1.2, 3500, 300, .2, .9); tone(70, 0, 1.6, 'sine', .3, 45); },
    // 蓄力：越来越尖的上扬噪声 + 锯齿上滑
    riser(dur) { noise(0, dur, 400, 7000, .28, 2); tone(180, 0, dur, 'sawtooth', .05, 900); tone(90, 0, dur, 'sine', .25, 160); },
    // 冲击：超低音轰鸣 + 爆裂
    boom(big) {
      tone(big ? 70 : 85, 0, big ? 1.8 : 1.1, 'sine', big ? .8 : .6, 28);
      tone(big ? 140 : 170, 0, .35, 'square', .12, 60);
      noise(0, big ? .9 : .5, 4000, 200, big ? .5 : .38, .6);
    },
    // 出金前兆：玻璃碎裂般的高频碎响
    crack() { for (let i = 0; i < 7; i++) { noise(i * .045, .07, 6000, 2500, .25, 3); tone(2200 + i * 260, i * .045, .12, 'triangle', .06); } },
    // 光球被吸入：一颗一声，音高逐级上升
    tick(i) { tone(660 * Math.pow(1.122, i), 0, .16, 'triangle', .12); },
    summon(long) { noise(0, long ? 3.4 : 2.6, 200, 4200, .22, 1.2); tone(55, 0, long ? 3.5 : 2.7, 'sine', .25, 110); },
    impact() { tone(90, 0, .9, 'sine', .55, 40); noise(0, .5, 3000, 300, .35, .7); },
    gold() { [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => { tone(f, i * .07, 1.6, 'triangle', .14); tone(f * 2, i * .07 + .02, 1.2, 'sine', .05); }); },
    purple() { [440, 554, 659, 880].forEach((f, i) => tone(f, i * .08, 1.1, 'triangle', .13)); },
    blue() { [587, 784].forEach((f, i) => tone(f, i * .08, .8, 'triangle', .12)); },
    whoosh() { noise(0, .45, 600, 2600, .14, .8); },
  };
})();

/* ================= 画布特效引擎 ================= */
const FX = (() => {
  const cv = $('#fxCanvas'), g = cv.getContext('2d');
  const bgImg = new Image(); bgImg.src = img('bg_blur.jpg');
  const tailImg = new Image(); tailImg.src = img('icons/tail.png');
  let goldTail = null; // 金色剪影版鲸尾徽记（首次用到时生成）
  let W = 0, H = 0, dpr = 1, raf = 0, mode = 'off', last = 0;
  let parts = [], rings = [], shards = [], motes = [], warps = [];
  let S = null; // summon state
  let ambientRGB = RC[3], ambientR = 3, shake = 0;

  const PRE = '205,232,255';
  const T_ORB0 = .07, T_ORB1 = .37, TR = .42, TR2 = .58; // 光球出现/吸入/第一次揭晓/金光升级

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = stage.clientWidth || 1; H = stage.clientHeight || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = t => t * t * (3 - 2 * t);
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function spawnPart(p, far) {
    const maxD = Math.hypot(W, H) * .6;
    p.a = rnd(0, Math.PI * 2); p.r = far ? rnd(maxD * .7, maxD) : rnd(30, maxD);
    p.sp = rnd(.6, 1.6); p.w = rnd(.6, 2.2);
    return p;
  }
  function makeCracks(k) {
    const out = [];
    for (let i = 0; i < 9; i++) {
      const base = i / 9 * Math.PI * 2 + rnd(-.2, .2);
      const pts = [[0, 0]]; let a = base, r = 0;
      while (r < W * .5) { r += rnd(18, 46) * k; a += rnd(-.35, .35); pts.push([Math.cos(a) * r, Math.sin(a) * r * .7]); }
      out.push(pts);
      if (Math.random() < .7) { // 分叉
        const j = 2 + Math.floor(Math.random() * 3), bp = [pts[j]]; let ba = base + rnd(-.9, .9), br = Math.hypot(...pts[j]);
        for (let s = 0; s < 6; s++) { br += rnd(16, 34) * k; ba += rnd(-.3, .3); bp.push([Math.cos(ba) * br, Math.sin(ba) * br * .7]); }
        out.push(bp);
      }
    }
    return out;
  }

  // rs：本次每一抽的星级，决定光球数量和最终颜色
  function startSummon(rs, onDone) {
    resize();
    const k = W / 1400, maxR = Math.max(...rs);
    parts = Array.from({ length: 300 }, () => spawnPart({}, false));
    warps = Array.from({ length: 160 }, () => ({ a: rnd(0, Math.PI * 2), d: rnd(0, W * .6), sp: rnd(8, 22), w: rnd(.6, 2.4) }));
    rings = []; shards = []; motes = []; shake = 0;
    const n = rs.length;
    S = {
      maxR, t0: performance.now(), D: maxR === 5 ? 5000 : maxR === 4 ? 3700 : 3100, onDone, done: false,
      stage: 0, lastRing: 0, flare: 0, chroma: 0, absorbed: 0,
      color: PRE,
      orbs: rs.map((r, i) => ({ a: i / n * Math.PI * 2 + rnd(-.3, .3), r0: rnd(.30, .46) * W, d: (i / n) * .07, trail: [], gone: false, tw: rnd(0, 6) })),
      cracks: maxR === 5 ? makeCracks(k) : null,
    };
    SFX.dive();
    mode = 'summon'; loop();
  }
  function finishSummon() { if (S && !S.done) { S.done = true; const f = S.onDone; S = null; f && f(); } }
  function cancelSummon() { S = null; }

  function setAmbient(r) {
    ambientR = r; ambientRGB = RC[r];
    if (mode !== 'ambient') { mode = 'ambient'; motes = []; loop(); }
  }
  function burstAt(x, y, rgb, n, pow) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), v = rnd(2, 11) * pow * (W / 1400);
      shards.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, dec: rnd(.008, .02), sz: rnd(1.5, 4.5), rgb });
    }
  }
  const burst = (rgb, n, pow) => burstAt(W / 2, H * .5, rgb, n, pow);
  function kick(amount) { shake = Math.max(shake, amount * (W / 1400)); }
  function stop() { mode = 'off'; cancelAnimationFrame(raf); raf = 0; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); }

  function loop() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    if (mode === 'off') return;
    const dt = Math.min(3, (now - (last || now)) / 16.67); last = now;
    // 镜头震动
    const ox = shake ? rnd(-shake, shake) : 0, oy = shake ? rnd(-shake, shake) : 0;
    shake = shake > .3 ? shake * Math.pow(.86, dt) : 0;
    g.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
    if (mode === 'summon' && S) drawSummon(now, dt);
    else if (mode === 'ambient') drawAmbient(dt);
    raf = requestAnimationFrame(frame);
  }

  function drawBackdrop(alpha, zoom) {
    const grd = g.createRadialGradient(W / 2, H * .5, 0, W / 2, H * .5, Math.hypot(W, H) * .6);
    grd.addColorStop(0, '#16264a'); grd.addColorStop(1, '#03070f');
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = grd; g.fillRect(-60, -60, W + 120, H + 120);
    if (bgImg.complete && bgImg.naturalWidth && alpha > 0) {
      const zw = W * zoom, zh = H * zoom;
      g.globalAlpha = alpha; g.drawImage(bgImg, (W - zw) / 2, (H - zh) / 2, zw, zh); g.globalAlpha = 1;
    }
  }

  function impact(rgb, power) {
    const k = W / 1400;
    S.color = rgb; S.flare = 1; S.chroma = 1;
    kick(power);
    flashEl(Math.min(1, .35 + power / 40));
    for (let i = 0; i < 4; i++) rings.push({ r: 30 * k + i * 26 * k, a: 1, rgb, w: 5 - i, sp: 2.4 - i * .3 });
    rings.push({ r: 40 * k, a: .9, rgb: '255,80,80', w: 2, sp: 2.2, ox: -5 * k });
    rings.push({ r: 40 * k, a: .9, rgb: '80,220,255', w: 2, sp: 2.2, ox: 5 * k });
  }

  function drawSummon(now, dt) {
    const t = Math.min(1, (now - S.t0) / S.D);
    const cx = W / 2, cy = H * .5, k = W / 1400, gold = S.maxR === 5;

    // ---- 节点事件 ----
    if (S.stage === 0 && t >= T_ORB1 - .05) { S.stage = 1; SFX.riser((TR - T_ORB1 + .05) * S.D / 1000); }
    if (S.stage === 1 && t >= TR) {
      S.stage = 2; SFX.boom();
      const r1 = S.maxR >= 4 ? 4 : 3; // 出金时先闪紫光，后面再“升级”
      impact(RC[r1], r1 === 4 ? 16 : 9);
      if (r1 === 4) SFX.purple(); else SFX.blue();
      burst(RC[r1], r1 === 4 ? 110 : 50, r1 === 4 ? 1.1 : .8);
    }
    if (gold && S.stage === 2 && t >= TR2 - .09) { S.stage = 3; SFX.crack(); }
    if (gold && S.stage === 3 && t >= TR2) {
      S.stage = 4; SFX.boom(true); SFX.gold();
      impact(RC[5], 30); burst(RC[5], 260, 1.8); burst('255,255,255', 60, 1.2);
    }
    const revealed = S.stage >= 2;
    const rgb = S.color;
    const tGold = gold && S.stage >= 4 ? clamp01((t - TR2) / .12) : 0;

    // ---- 背景：一路推近 ----
    drawBackdrop(.18 * (1 - t * .7), 1 + t * .35);
    g.globalCompositeOperation = 'lighter';

    // 俯冲速度线（开场：冲入深海）
    if (t < .36) {
      const fa = Math.min(1, t / .05) * (1 - clamp01((t - .26) / .1));
      g.lineCap = 'round';
      for (const w of warps) {
        w.d += w.sp * dt * k * (1 + t * 3);
        if (w.d > W * .75) { w.d = rnd(10, 60) * k; w.a = rnd(0, Math.PI * 2); }
        const len = w.d * .18, c = Math.cos(w.a), s = Math.sin(w.a) * .62;
        g.strokeStyle = `rgba(170,215,255,${.55 * fa * Math.min(1, w.d / (120 * k))})`; g.lineWidth = w.w * k;
        g.beginPath(); g.moveTo(cx + c * w.d, cy + s * w.d); g.lineTo(cx + c * (w.d + len), cy + s * (w.d + len)); g.stroke();
      }
    }

    // 涡旋粒子：向中心螺旋收拢（蓄力时加速）
    const charge = clamp01((t - (T_ORB1 - .05)) / (TR - T_ORB1 + .05));
    const spd = (1 + t * 4 + charge * 8) * dt;
    const orbR = revealed ? (40 + 60 * ease(clamp01((t - TR) / .4))) * k : (26 - 14 * charge) * k * (1 + t);
    for (const p of parts) {
      const ox = cx + Math.cos(p.a) * p.r, oy = cy + Math.sin(p.a) * p.r * .62;
      p.r -= p.sp * 2.4 * spd * k * (1 + 260 / (p.r + 40));
      p.a += .006 * spd * (1 + 120 / (p.r + 30));
      if (p.r < Math.max(orbR, 10 * k) * .5) { spawnPart(p, true); continue; }
      const x = cx + Math.cos(p.a) * p.r, y = cy + Math.sin(p.a) * p.r * .62;
      const al = Math.min(1, p.r / (120 * k)) * (t < .08 ? t / .08 : 1) * .8;
      g.strokeStyle = `rgba(${rgb},${al})`; g.lineWidth = p.w * k;
      g.beginPath(); g.moveTo(ox, oy); g.lineTo(x, y); g.stroke();
    }

    // 符文法阵
    const ringA = Math.min(1, t * 4) * (revealed ? 1 : .7);
    const spin = 1 + charge * 6 + (revealed ? 2 : 0);
    g.save(); g.translate(cx, cy); g.scale(1, .62);
    [[orbR * 2.4 + 70 * k, now / 1800 * spin, 16], [orbR * 3.4 + 120 * k, -now / 2600 * spin, 24], [orbR * 4.6 + 190 * k, now / 4000 * spin, 36]].forEach(([R, rot, n], li) => {
      g.save(); g.rotate(rot);
      g.strokeStyle = `rgba(${rgb},${(.42 - li * .1) * ringA})`; g.lineWidth = 1.6 * k; g.setLineDash([14 * k, 10 * k]);
      g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.fillStyle = `rgba(${rgb},${(.8 - li * .2) * ringA})`;
      for (let i = 0; i < n; i += 2) {
        const d = 6 * k;
        g.save(); g.rotate(i * Math.PI * 2 / n); g.translate(R, 0);
        g.beginPath(); g.moveTo(-d, 0); g.lineTo(0, -d * .6); g.lineTo(d, 0); g.lineTo(0, d * .6); g.closePath(); g.fill();
        g.restore();
      }
      g.restore();
    });
    g.restore();

    // 光球：每一抽一颗，绕场后依次被吸入中心
    g.lineCap = 'round';
    S.orbs.forEach((o, i) => {
      if (o.gone) return;
      const u = clamp01((t - T_ORB0 - o.d) / (T_ORB1 - T_ORB0 - o.d * .6));
      if (u <= 0) return;
      const rr = o.r0 * (1 - ease(u)), a = o.a + u * Math.PI * 3.2;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .55;
      o.trail.push([x, y]); if (o.trail.length > 16) o.trail.shift();
      for (let j = 1; j < o.trail.length; j++) {
        const f = j / o.trail.length;
        g.strokeStyle = `rgba(${PRE},${f * .7})`; g.lineWidth = f * 7 * k;
        g.beginPath(); g.moveTo(...o.trail[j - 1]); g.lineTo(...o.trail[j]); g.stroke();
      }
      const tw = .8 + .2 * Math.sin(now / 60 + o.tw);
      glow(x, y, 34 * k * tw, PRE, .55); glow(x, y, 9 * k, '255,255,255', 1);
      if (u >= 1) {
        o.gone = true; S.absorbed++;
        SFX.tick(S.absorbed);
        rings.push({ r: 14 * k, a: .8, rgb: PRE, w: 2, sp: 3 });
        burstAt(cx, cy, PRE, 10, .5); kick(3);
      }
    });

    // 冲击波
    if (revealed && now - S.lastRing > 300) { S.lastRing = now; rings.push({ r: orbR, a: .55, rgb, w: 1.5, sp: 1.6 }); }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.r += 7 * k * dt * r.sp; r.a -= .013 * dt;
      if (r.a <= 0) { rings.splice(i, 1); continue; }
      g.strokeStyle = `rgba(${r.rgb},${r.a})`; g.lineWidth = r.w * k;
      g.beginPath(); g.ellipse(cx + (r.ox || 0), cy, r.r, r.r * .62, 0, 0, Math.PI * 2); g.stroke();
    }

    // 放射光柱（揭晓后旋转）
    if (revealed && S.maxR >= 4) {
      const n = tGold ? 18 : 10, len = Math.hypot(W, H);
      const rot = now / (tGold ? 1800 : 2600);
      const al = (tGold ? .36 : .16) * Math.min(1, (t - TR) * 6);
      const lg = g.createRadialGradient(cx, cy, 0, cx, cy, len * .7);
      lg.addColorStop(0, `rgba(${rgb},${al})`); lg.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = lg;
      for (let i = 0; i < n; i++) {
        const a = rot + i * Math.PI * 2 / n, w = i % 2 ? .022 : .06;
        g.beginPath(); g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(a - w) * len, cy + Math.sin(a - w) * len);
        g.lineTo(cx + Math.cos(a + w) * len, cy + Math.sin(a + w) * len);
        g.closePath(); g.fill();
      }
    }

    // 出金前兆：金色裂纹从中心爬出
    if (S.cracks && t > TR2 - .1 && t < TR2 + .12) {
      const grow = clamp01((t - (TR2 - .1)) / .09), fade = 1 - clamp01((t - TR2) / .12);
      g.save(); g.translate(cx, cy);
      g.shadowColor = 'rgba(255,200,80,1)'; g.shadowBlur = 14 * k;
      for (const pts of S.cracks) {
        const m = Math.max(2, Math.floor(pts.length * grow));
        g.strokeStyle = `rgba(255,236,170,${fade})`; g.lineWidth = 2.6 * k;
        g.beginPath(); g.moveTo(...pts[0]);
        for (let j = 1; j < m; j++) g.lineTo(...pts[j]);
        g.stroke();
      }
      g.restore();
      if (grow < 1 && Math.random() < .5) kick(4);
    }

    // 金光：天顶光柱
    if (tGold > 0) {
      const bw = (60 + 220 * ease(tGold)) * k * (1 + .05 * Math.sin(now / 70));
      const top = cy - (cy + 40) * ease(Math.min(1, tGold * 3));
      const lg = g.createLinearGradient(cx - bw, 0, cx + bw, 0);
      lg.addColorStop(0, 'rgba(255,200,80,0)'); lg.addColorStop(.35, 'rgba(255,200,80,.35)');
      lg.addColorStop(.5, 'rgba(255,250,225,.95)'); lg.addColorStop(.65, 'rgba(255,200,80,.35)'); lg.addColorStop(1, 'rgba(255,200,80,0)');
      g.fillStyle = lg; g.fillRect(cx - bw, top, bw * 2, cy - top + 30 * k);
      // 光柱里上升的金粒
      if (Math.random() < .9) shards.push({ x: cx + rnd(-bw * .6, bw * .6), y: cy, vx: 0, vy: -rnd(4, 12) * k, life: 1, dec: .02, sz: rnd(1.5, 3.5), rgb: '255,226,140', float: true });
    }

    drawShards(dt);

    // 整屏染色
    if (revealed && S.maxR >= 4) {
      const u = Math.min(1, (t - TR) / .2);
      const strong = tGold ? .5 * tGold : .22;
      const tint = g.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * .6);
      tint.addColorStop(0, `rgba(${rgb},${strong * u})`); tint.addColorStop(1, `rgba(${rgb},${strong * .25 * u})`);
      g.fillStyle = tint; g.fillRect(-60, -60, W + 120, H + 120);
    }

    // 中心光核（蓄力时收缩、揭晓时爆开）
    const pulse = 1 + Math.sin(now / (60 + 60 * (1 - charge))) * (.05 + charge * .12);
    const coreA = revealed ? .9 : .5 + charge * .5;
    glow(cx, cy, orbR * (tGold ? 6 : 3.4) * pulse * (1 - tGold * .35), rgb, coreA * (1 - tGold * .4));
    glow(cx, cy, orbR * 1.1 * pulse * (1 - tGold * .55), '255,255,255', 1);

    // 鲸尾徽记在金光中显形
    if (tGold > 0 && tailImg.complete && tailImg.naturalWidth) {
      if (!goldTail) goldTail = tintImage(tailImg, ['#fff6d8', '#ffd36a', '#e09a2a']);
      const sz = (230 + 40 * ease(tGold)) * k * (1 + .03 * Math.sin(now / 160));
      g.globalCompositeOperation = 'source-over';
      g.shadowColor = 'rgba(255,190,60,.95)'; g.shadowBlur = 30 * k;
      g.globalAlpha = ease(tGold);
      g.drawImage(tailImg, cx - sz / 2, cy - sz / 2, sz, sz);
      g.shadowBlur = 0;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = ease(tGold) * (.22 + .12 * Math.sin(now / 120));
      g.drawImage(goldTail, cx - sz / 2, cy - sz / 2, sz, sz);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'lighter';
    }


    // 变形镜头光晕（横向拉长）+ 色差
    S.flare = Math.max(revealed ? .35 : charge * .4, S.flare - .025 * dt);
    if (S.flare > 0) {
      g.save(); g.translate(cx, cy); g.scale(1, .035);
      glow(0, 0, W * (.35 + .4 * S.flare), rgb, S.flare); glow(0, 0, W * .25 * S.flare, '255,255,255', S.flare);
      g.restore();
    }
    if (S.chroma > 0) {
      const off = 10 * k * S.chroma;
      glow(cx - off, cy, orbR * 3, '255,40,60', .35 * S.chroma); glow(cx + off, cy, orbR * 3, '40,200,255', .35 * S.chroma);
      S.chroma = Math.max(0, S.chroma - .05 * dt);
    }

    // 暗角（蓄力时收紧）
    g.globalCompositeOperation = 'source-over';
    const vg = g.createRadialGradient(cx, cy, Math.min(W, H) * (.35 - charge * .15 + (revealed ? .25 : 0)), cx, cy, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,4,12,${revealed ? .35 : .55 + charge * .3})`);
    g.fillStyle = vg; g.fillRect(-60, -60, W + 120, H + 120);

    // 收尾：光吞没画面
    const wo = gold ? .88 : .84;
    if (t > wo) {
      g.fillStyle = `rgba(${gold ? '255,244,214' : '255,255,255'},${ease((t - wo) / (1 - wo))})`;
      g.fillRect(-60, -60, W + 120, H + 120);
    }
    if (t >= 1) { flashEl(1); finishSummon(); }
  }

  function tintImage(im, stops) {
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const x = c.getContext('2d');
    x.drawImage(im, 0, 0);
    x.globalCompositeOperation = 'source-in';
    const lg = x.createLinearGradient(0, 0, 0, c.height);
    stops.forEach((s, i) => lg.addColorStop(i / (stops.length - 1), s));
    x.fillStyle = lg; x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function drawAmbient(dt) {
    const k = W / 1400;
    g.globalCompositeOperation = 'source-over';
    const grd = g.createRadialGradient(W / 2, H * .55, 0, W / 2, H * .55, Math.hypot(W, H) * .65);
    if (ambientR === 5) { grd.addColorStop(0, '#5a4110'); grd.addColorStop(.55, '#20180a'); grd.addColorStop(1, '#070502'); }
    else if (ambientR === 4) { grd.addColorStop(0, '#3a2466'); grd.addColorStop(.6, '#130d26'); grd.addColorStop(1, '#05040b'); }
    else { grd.addColorStop(0, '#1d3a6b'); grd.addColorStop(.6, '#0b1730'); grd.addColorStop(1, '#03070f'); }
    g.fillStyle = grd; g.fillRect(-60, -60, W + 120, H + 120);
    if (bgImg.complete && bgImg.naturalWidth) { g.globalAlpha = .1; g.drawImage(bgImg, 0, 0, W, H); g.globalAlpha = 1; }
    g.globalCompositeOperation = 'lighter';
    // 上升的光尘
    const want = ambientR === 5 ? 140 : 80;
    while (motes.length < want) motes.push({ x: rnd(0, W), y: rnd(H * .3, H * 1.1), v: rnd(.3, 1.6), sz: rnd(1, 3.2), ph: rnd(0, 6.28), rgb: ambientRGB });
    for (const m of motes) {
      m.y -= m.v * dt * k * 1.5; m.ph += .05 * dt;
      if (m.y < -10) { m.y = H + 10; m.x = rnd(0, W); m.rgb = ambientRGB; }
      const a = (.35 + .35 * Math.sin(m.ph)) * Math.min(1, m.y / (H * .3));
      glow(m.x + Math.sin(m.ph * .5) * 6 * k, m.y, m.sz * 4 * k, m.rgb, a);
    }
    if (ambientR >= 4 && Math.random() < (ambientR === 5 ? .3 : .1) * dt) {
      shards.push({ x: rnd(W * .2, W * .8), y: rnd(H * .1, H * .85), vx: 0, vy: 0, life: 1, dec: .02, sz: rnd(3, 7), rgb: ambientR === 5 ? '255,230,150' : '220,190,255', star: true });
    }
    drawShards(dt);
    g.globalCompositeOperation = 'source-over';
  }

  function drawShards(dt) {
    const k = W / 1400;
    for (let i = shards.length - 1; i >= 0; i--) {
      const s = shards[i];
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (!s.float) { s.vx *= .985; s.vy = s.vy * .985 + .04 * dt; }
      s.life -= s.dec * dt;
      if (s.life <= 0) { shards.splice(i, 1); continue; }
      if (s.star) {
        const r = s.sz * k * 3 * Math.sin(s.life * Math.PI);
        g.strokeStyle = `rgba(${s.rgb},${s.life})`; g.lineWidth = 1.4 * k;
        g.beginPath(); g.moveTo(s.x - r, s.y); g.lineTo(s.x + r, s.y); g.moveTo(s.x, s.y - r); g.lineTo(s.x, s.y + r); g.stroke();
        glow(s.x, s.y, r * .8, s.rgb, s.life * .8);
      } else {
        glow(s.x, s.y, s.sz * k * 2.4, s.rgb, s.life);
      }
    }
  }

  function glow(x, y, r, rgb, a) {
    if (r <= 0 || a <= 0) return;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(${rgb},${a})`); rg.addColorStop(.4, `rgba(${rgb},${a * .45})`); rg.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }

  // 把舞台内某个 DOM 元素的中心换算成画布坐标
  function centerOf(el) {
    const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect();
    return [a.left + a.width / 2 - b.left, a.top + a.height / 2 - b.top];
  }

  return { resize, startSummon, finishSummon, cancelSummon, setAmbient, stop, burst, burstAt, kick, centerOf, get summoning() { return !!S; } };
})();

function flashEl(strength) {
  const f = $('#flash');
  f.classList.remove('go'); void f.offsetWidth;
  f.style.setProperty('opacity', strength);
  f.classList.add('go');
}

/* ================= 抽卡逻辑 ================= */
function rollOne() {
  state.pity5++; state.pity4++; state.total++;
  const x = Math.random();
  let r;
  if (state.pity5 >= PITY5 || x < RATE5) r = 5;
  else if (state.pity4 >= PITY4 || x < RATE5 + RATE4) r = 4;
  else r = 3;
  if (r === 5) { state.pity5 = 0; state.pity4 = 0; }
  else if (r === 4) state.pity4 = 0;
  const pool = BY_R[r];
  const c = pool[Math.floor(Math.random() * pool.length)];
  const isNew = !state.owned[c.id];
  state.owned[c.id] = (state.owned[c.id] || 0) + 1;
  state.history.unshift({ id: c.id, r, t: Date.now(), n: state.total });
  if (state.history.length > 500) state.history.length = 500;
  return { ...c, isNew };
}

let busy = false;
function tryPull(n) {
  if (busy) return;
  if (state.whale >= n) return doPull(n);
  const lack = n - state.whale, cost = lack * RICE_PER_WHALE;
  if (state.rice >= cost) {
    confirmBox('鲸币不足',
      `还需要 <b>${lack}</b> 枚鲸币<br>是否消耗 <img class="ico" src="${img('icons/rice.png')}"> <b>${cost}</b> 米饭兑换并求索？`,
      '兑换并求索', () => { state.rice -= cost; state.whale += lack; renderHud(true); doPull(n); });
  } else {
    confirmBox('米饭不足',
      `求索 ${n} 次需要 ${n} 枚鲸币（或 ${cost} 米饭）<br>当前米饭不够啦，去食堂补充一些吧？`,
      '前往食堂', () => openShop('rice'));
  }
}

let results = [], idx = 0, phase = 'idle', canTap = 0, lastN = 1;
function doPull(n) {
  closeModal();
  busy = true; lastN = n;
  state.whale -= n;
  results = Array.from({ length: n }, rollOne);
  save(); renderHud();
  // 预加载立绘
  results.forEach(c => { const i = new Image(); i.src = charSrc(c.id); });
  $('#fx').classList.add('on');
  $('#reveal').classList.remove('on'); $('#summary').classList.remove('on');
  $('#skip').style.display = '';
  phase = 'summon';
  FX.startSummon(results.map(c => c.r), () => { idx = 0; showReveal(); });
}

function showReveal() {
  phase = 'reveal';
  const c = results[idx], rv = $('#reveal');
  rv.className = 'on r' + c.r;
  rv.style.setProperty('--rc', RC[c.r]);
  const d1 = c.r === 5 ? 1.3 : c.r === 4 ? .6 : .45;
  rv.style.setProperty('--d1', d1 + 's');
  const ch = rv.querySelector('.char');
  ch.classList.remove('idle');
  ch.src = charSrc(c.id);
  // 名字逐字落下
  const nm = rv.querySelector('.nm'); nm.innerHTML = '';
  [...c.name].forEach((t, i) => { const s = document.createElement('span'); s.textContent = t; s.style.animationDelay = (d1 + i * .07) + 's'; nm.appendChild(s); });
  rv.querySelector('.sub').textContent = c.sub;
  rv.querySelector('.quote').textContent = '「' + c.quote + '」';
  rv.querySelector('.new').style.display = c.isNew ? '' : 'none';
  rv.querySelector('.count').textContent = results.length > 1 ? `${idx + 1} / ${results.length}` : '';
  // 背景巨字
  const word = (c.id === 'ds' ? 'DEEPSEA' : c.id.toUpperCase()) + ' ✦ ';
  rv.querySelectorAll('.bgtext span').forEach(s => { s.textContent = word.repeat(8); });
  const st = rv.querySelector('.stars'); st.innerHTML = '';
  const base = c.r === 5 ? 1.25 : d1 - .05;
  for (let i = 0; i < c.r; i++) {
    const s = document.createElement('img'); s.src = img('icons/star.png');
    const delay = base + i * .12;
    s.style.animationDelay = delay + 's'; st.appendChild(s);
    // 每颗星落定时迸出火花
    setTimeout(() => {
      if (results[idx] !== c || phase !== 'reveal') return;
      const [x, y] = FX.centerOf(s);
      FX.burstAt(x, y, c.r === 5 ? '255,214,110' : RC[c.r], c.r === 5 ? 22 : 10, .45);
      SFX.tick(i + (c.r === 5 ? 4 : 1));
    }, (delay + .2) * 1000);
  }
  void rv.offsetWidth; rv.classList.add('play');
  FX.setAmbient(c.r);
  SFX.whoosh();
  if (c.r === 5) {
    // 剪影 → 金光炸开：震屏 + 金粒 + 轰鸣
    setTimeout(() => {
      if (results[idx] !== c || phase !== 'reveal') return;
      SFX.boom(true); SFX.gold(); FX.kick(22); flashEl(.7);
      FX.burst(RC[5], 220, 1.7); FX.burst('255,255,255', 50, 1.1);
      rv.classList.add('shake');
    }, 950);
    setTimeout(() => { if (phase === 'reveal' && results[idx] === c) ch.classList.add('idle'); }, 2100);
  } else if (c.r === 4) {
    setTimeout(() => { if (results[idx] !== c || phase !== 'reveal') return; SFX.purple(); SFX.boom(); FX.kick(9); FX.burst(RC[4], 90, 1.1); }, 480);
  } else {
    setTimeout(() => { if (results[idx] !== c || phase !== 'reveal') return; SFX.blue(); FX.burst(RC[3], 30, .7); }, 380);
  }
  canTap = performance.now() + (c.r === 5 ? 1500 : 550);
}

function nextReveal() {
  if (performance.now() < canTap) return;
  idx++;
  if (idx < results.length) showReveal();
  else if (results.length > 1) showSummary();
  else closeFx();
}

function showSummary() {
  phase = 'summary';
  const has5 = results.some(c => c.r === 5);
  FX.setAmbient(has5 ? 5 : 3);
  $('#reveal').className = '';
  $('#skip').style.display = 'none';
  const box = $('#summary .cards'); box.innerHTML = '';
  results.forEach((c, i) => {
    const w = document.createElement('div'); w.className = 'cardwrap r' + c.r;
    const delay = .15 + i * .09;
    w.innerHTML = `<div class="card r${c.r}" style="--rc:${RC[c.r]};animation-delay:${delay}s">
      <img src="${charSrc(c.id)}" alt=""><div class="cs">${'★'.repeat(c.r)}</div><div class="cn">${c.name}</div></div>`;
    box.appendChild(w);
    // 卡片翻开时：高星级迸光
    setTimeout(() => {
      if (phase !== 'summary') return;
      const [x, y] = FX.centerOf(w);
      if (c.r === 5) { FX.burstAt(x, y, RC[5], 120, 1.2); FX.kick(14); SFX.boom(true); SFX.gold(); }
      else if (c.r === 4) { FX.burstAt(x, y, RC[4], 30, .7); SFX.tick(6); }
      else SFX.tick(1);
    }, (delay + .25) * 1000);
  });
  $('#summary').classList.add('on');
  $('#summary [data-act=again]').textContent = lastN === 10 ? '再来十次' : '再来一次';
}

function skip() {
  if (phase === 'summary') return closeFx();
  if (phase === 'summon') { FX.cancelSummon(); flashEl(.8); }
  if (results.length > 1) showSummary(); else { idx = 0; showReveal(); canTap = 0; }
}

function closeFx() {
  phase = 'idle'; busy = false;
  FX.stop();
  $('#fx').classList.remove('on');
  $('#reveal').className = ''; $('#summary').classList.remove('on');
  const got5 = results.some(c => c.r === 5);
  if (got5) toast('恭喜获得 5★ DS娘！深海的金光为你而亮');
}

/* ================= HUD ================= */
let shown = { rice: state.rice, whale: state.whale };
function renderHud(bump) {
  animNum('#riceNum', 'rice', bump);
  animNum('#whaleNum', 'whale', bump);
  $('#pity').innerHTML = `已求索 <b>${state.total}</b> 次　距 5★ 保底还有 <b>${PITY5 - state.pity5}</b> 次`;
}
function animNum(sel, key, bump) {
  const el = $(sel), from = shown[key], to = state[key];
  shown[key] = to;
  if (from === to) { el.textContent = to; return; }
  if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  const t0 = performance.now();
  (function step(now) {
    const u = Math.min(1, (now - t0) / 500);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - u, 3)));
    if (u < 1) requestAnimationFrame(step);
  })(t0);
}

/* ================= 弹窗 ================= */
function openModal(title, html, small) {
  $('#panelTitle').textContent = title;
  $('#panelBody').innerHTML = html;
  $('#panel').className = 'panel' + (small ? ' sm' : '');
  $('#mask').classList.add('open');
}
function closeModal() { $('#mask').classList.remove('open'); }
let confirmCb = null;
function confirmBox(title, html, okText, cb) {
  confirmCb = cb;
  openModal(title, `<div style="text-align:center;padding:calc(20*var(--u)) 0">${html}</div>
    <div class="row"><button class="btn" data-act="modal-close">取消</button><button class="btn dark" data-act="confirm-ok">${okText}</button></div>`, true);
}

let toastT = 0;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

/* 食堂兑换：米饭充值 / 鲸币兑换 */
const PACKS = [
  { amt: 60, price: 6, icon: 'bowl' }, { amt: 300, price: 30, icon: 'bowl' }, { amt: 980, price: 98, icon: 'rice' },
  { amt: 1980, price: 198, icon: 'rice' }, { amt: 3280, price: 328, icon: 'rice' }, { amt: 6480, price: 648, icon: 'rice' },
];
let shopTab = 'rice', exQty = 1;
function openShop(tab) {
  shopTab = tab || shopTab;
  const tabs = `<div class="tabs"><button data-act="shop-tab" data-tab="rice" class="${shopTab === 'rice' ? 'on' : ''}">米饭充值</button>
    <button data-act="shop-tab" data-tab="whale" class="${shopTab === 'whale' ? 'on' : ''}">鲸币兑换</button></div>`;
  let body;
  if (shopTab === 'rice') {
    body = `<div class="packs">${PACKS.map((p, i) => `
      <div class="pack" data-act="buy" data-i="${i}">
        ${state['first' + p.amt] ? '' : '<div class="bonus">首充双倍</div>'}
        <img src="${img('icons/' + p.icon + '.png')}" alt=""><div class="amt">${p.amt} 米饭</div>
        <div class="price">¥ ${p.price}</div></div>`).join('')}</div>
      <div class="note">本页为离线演示版，支付未上线：点击即可模拟购买，不会产生任何真实扣费。</div>`;
  } else {
    const max = Math.max(1, Math.floor(state.rice / RICE_PER_WHALE));
    exQty = Math.min(Math.max(1, exQty), Math.max(1, max));
    body = `<div class="exch">
        <div class="side"><img src="${img('icons/rice.png')}" alt="">米饭 × <span id="exCost">${exQty * RICE_PER_WHALE}</span></div>
        <div class="arrow">➜</div>
        <div class="side"><img src="${img('icons/whale.png')}" alt="">鲸币 × <span id="exGet">${exQty}</span></div></div>
      <div class="stepper">
        <button class="wide" data-act="ex-set" data-v="1">最小</button><button data-act="ex-step" data-v="-1">−</button>
        <input id="exQty" type="number" min="1" value="${exQty}">
        <button data-act="ex-step" data-v="1">＋</button><button class="wide" data-act="ex-set" data-v="${max}">最大</button></div>
      <div class="note">兑换比例：${RICE_PER_WHALE} 米饭 = 1 鲸币　｜　当前米饭 ${state.rice}</div>
      <div class="row"><button class="btn dark" data-act="exchange">确认兑换</button></div>`;
  }
  openModal('食堂兑换', tabs + body);
}
function updateEx() {
  const max = Math.max(1, Math.floor(state.rice / RICE_PER_WHALE));
  exQty = Math.min(Math.max(1, exQty | 0), max);
  const q = $('#exQty'); if (q) q.value = exQty;
  $('#exCost').textContent = exQty * RICE_PER_WHALE; $('#exGet').textContent = exQty;
}

function openDetails() {
  const pool = r => BY_R[r].map(c => `<div class="pc" style="--c:${r === 5 ? '#d9a63c' : r === 4 ? '#9b6ad6' : '#5c8fd6'}"><img src="${charSrc(c.id)}" alt=""><span>${c.name}</span></div>`).join('');
  openModal('深度思考 · 卡池详情', `
    <div class="sec">求索概率</div>
    <table class="rate-table"><tr><th>星级</th><th>角色</th><th>基础概率</th></tr>
      <tr><td class="stars-s">★★★★★</td><td>DS娘（UP）</td><td><b>${pct(RATE5)}</b></td></tr>
      <tr><td class="stars-s">★★★★</td><td>${BY_R[4].map(c => c.name).join('、')}</td><td>${pct(RATE4)}</td></tr>
      <tr><td class="stars-s">★★★</td><td>${BY_R[3].map(c => c.name).join('、')}</td><td>${pct(1 - RATE5 - RATE4)}</td></tr></table>
    <div class="sec">保底规则</div>
    <div>· 每 10 次求索必得 4 星或以上角色（当前已 ${state.pity4} 次未出 4 星+）<br>
      · 至多 ${PITY5} 次求索必得 5 星 DS娘（当前已 ${state.pity5} 次未出 5 星）<br>
      · 1 次求索消耗 1 枚鲸币；鲸币不足时可用 ${RICE_PER_WHALE} 米饭兑换 1 枚</div>
    <div class="sec">5★ UP</div><div class="pool">${pool(5)}</div>
    <div class="sec">4★</div><div class="pool">${pool(4)}</div>
    <div class="sec">3★</div><div class="pool">${pool(3)}</div>`);
}

function openHistory() {
  const rows = state.history.map(h => {
    const c = CHARS.find(x => x.id === h.id) || { name: h.id };
    const d = new Date(h.t), p = v => String(v).padStart(2, '0');
    return `<tr class="r${h.r}"><td>${h.n || ''}</td><td>${c.name}</td><td class="stars-s">${'★'.repeat(h.r)}</td><td>${BANNER}</td>
      <td>${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}</td></tr>`;
  }).join('');
  const n5 = state.history.filter(h => h.r === 5).length;
  openModal('摸鱼记录', state.history.length
    ? `<div style="text-align:center;margin-bottom:calc(14*var(--u))">累计求索 <b>${state.total}</b> 次 · 获得 5★ DS娘 <b style="color:#b7811c">${n5}</b> 次</div>
       <table class="hist"><tr><th>第几抽</th><th>角色</th><th>星级</th><th>卡池</th><th>时间</th></tr>${rows}</table>`
    : '<div class="empty">还没有求索记录，去深海里捞一捞吧～</div>');
}

function openPreview() {
  const c = BY_R[5][0];
  openModal('角色预览', `<div class="preview">
      <div class="art"><img src="${charSrc(c.id)}" alt=""></div>
      <div class="txt">
        <div class="stars-s" style="font-size:calc(40*var(--u))">★★★★★</div>
        <div class="nm">${c.name}</div>
        <div style="margin:calc(10*var(--u)) 0 calc(20*var(--u))"><span class="tag">限定 UP</span><span class="tag">深海</span><span class="tag">女仆</span></div>
        <div>称号：${c.sub}</div>
        <div style="margin-top:calc(16*var(--u))">深海里长大的鲸鱼女仆，头上的鳍会随心情扇动。平时慢吞吞地嘟囔，一旦开始深度思考就停不下来——前提是先给她吃饱大白米饭。</div>
        <div style="margin-top:calc(16*var(--u));color:#8a6a2a">「${c.quote}」</div>
        <div class="row" style="justify-content:flex-start"><button class="btn dark" data-act="pull-from-preview" data-n="10">立即求索 ×10</button></div>
      </div></div>`);
}

function openSettings() {
  openModal('设置', `<div style="text-align:center">
      <div class="row"><button class="btn" data-act="toggle-sound">音效：${state.sound ? '开' : '关'}</button></div>
      <div class="row"><button class="btn" data-act="reset">重置存档</button></div>
      <div class="note">存档保存在本浏览器中（米饭、鲸币、保底计数与记录）。</div></div>`, true);
}

/* ================= 事件 ================= */
document.addEventListener('click', e => {
  SFX.unlock();
  const b = e.target.closest('[data-act]');
  if (!b) {
    if (e.target === $('#mask')) closeModal();
    else if ($('#fx').classList.contains('on') && phase === 'reveal') nextReveal();
    return;
  }
  const act = b.dataset.act;
  if (act !== 'pull') SFX.click();
  switch (act) {
    case 'pull': tryPull(+b.dataset.n); break;
    case 'pull-from-preview': tryPull(+b.dataset.n); break;
    case 'shop-rice': openShop('rice'); break;
    case 'shop-whale': openShop('whale'); break;
    case 'shop-tab': openShop(b.dataset.tab); break;
    case 'buy': {
      const p = PACKS[+b.dataset.i], first = !state['first' + p.amt], got = first ? p.amt * 2 : p.amt;
      confirmBox('确认购买', `<img class="ico" src="${img('icons/rice.png')}"> <b>${p.amt}</b> 米饭${first ? '（首充双倍，实得 ' + got + '）' : ''}<br>价格 ¥${p.price}<br><span style="color:#8a93a8;font-size:.85em">演示版 · 不会真实扣费</span>`,
        '模拟支付', () => { state.rice += got; state['first' + p.amt] = 1; save(); renderHud(true); SFX.coin(); toast(`购买成功，获得 ${got} 米饭`); openShop('rice'); });
      break;
    }
    case 'ex-step': exQty += +b.dataset.v; updateEx(); break;
    case 'ex-set': exQty = +b.dataset.v; updateEx(); break;
    case 'exchange': {
      const cost = exQty * RICE_PER_WHALE;
      if (state.rice < cost) { toast('米饭不足，先去充值吧'); openShop('rice'); break; }
      state.rice -= cost; state.whale += exQty; save(); renderHud(true); SFX.coin();
      toast(`兑换成功，获得 ${exQty} 枚鲸币`); closeModal(); break;
    }
    case 'tab':
      if (b.dataset.tab === '0') toast('当前卡池：角色活动求索 · 深海的嘟囔');
      else toast(`「${b.title}」卡池筹备中，敬请期待`);
      break;
    case 'details': openDetails(); break;
    case 'history': openHistory(); break;
    case 'preview': openPreview(); break;
    case 'settings': openSettings(); break;
    case 'toggle-sound': state.sound = !state.sound; save(); openSettings(); break;
    case 'reset':
      confirmBox('重置存档', '将清空米饭、鲸币、保底计数和求索记录，确定吗？', '确定重置', () => {
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
        Object.assign(state, { rice: 911, whale: 10, pity5: 0, pity4: 0, total: 0, history: [], owned: {} });
        Object.keys(state).filter(k => k.startsWith('first')).forEach(k => delete state[k]);
        save(); renderHud(); toast('存档已重置');
      });
      break;
    case 'modal-close': closeModal(); break;
    case 'confirm-ok': { const cb = confirmCb; confirmCb = null; closeModal(); cb && cb(); break; }
    case 'fx-close': closeFx(); break;
    case 'again': closeFx(); tryPull(lastN); break;
  }
});
$('#skip').addEventListener('click', e => { e.stopPropagation(); SFX.click(); skip(); });
document.addEventListener('input', e => { if (e.target.id === 'exQty') { exQty = parseInt(e.target.value, 10) || 1; updateEx(); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#mask').classList.contains('open')) closeModal(); else if (phase !== 'idle') skip(); }
  if ((e.key === ' ' || e.key === 'Enter') && phase === 'reveal') { e.preventDefault(); nextReveal(); }
});

addEventListener('resize', fit);
fit();
renderHud();
// 预加载
CHARS.forEach(c => { const i = new Image(); i.src = charSrc(c.id); });
