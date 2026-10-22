'use strict';

/* ================= 数据 ================= */
// 原来的 10 名 Q 版角色统一为 5 星；「痴呆」系列为 4 星，「小小」系列为 3 星
const CHARS = [
  { id: 'ds',      name: 'DS娘',      sub: '深海的嘟囔 · 大肥鱼', r: 5, quote: '咕噜……在深海里想了好久好久，终于浮上来见你啦。以后要管饭哦！' },
  { id: 'claude',  name: 'Claude娘',  sub: '秋日长思',   r: 5, quote: '这个问题，让我认真想一想再回答你。' },
  { id: 'gpt',     name: 'GPT娘',     sub: '白龙之息',   r: 5, quote: '有什么想问的？我一直都在。' },
  { id: 'gemini',  name: 'Gemini娘',  sub: '双瞳星猫',   r: 5, quote: '左眼看今天，右眼看明天～喵。' },
  { id: 'grok',    name: 'Grok娘',    sub: '小恶魔女王', r: 5, quote: '嘿嘿，说大实话可是我的特长！' },
  { id: 'qwen',    name: '千问娘',    sub: '扇底千问',   r: 5, quote: '千问千答，不急，慢慢来。' },
  { id: 'kimi',    name: 'Kimi娘',    sub: '月下女仆',   r: 5, quote: '再长的文章，交给我读就好。' },
  { id: 'mistral', name: 'Mistral娘', sub: '法棍猫猫',   r: 5, quote: '要不要来一根？刚出炉的法棍哦。' },
  { id: 'zhipu',   name: '智谱娘',    sub: '眠狐',       r: 5, quote: '呼……醒着的时候，我可是很聪明的。' },
  { id: 'doubao',  name: '豆包娘',    sub: '红围巾',     r: 5, quote: '嘿！今天也要开开心心的！' },
  { id: 'daze-feiyu',  name: '痴呆大肥鱼娘', sub: '痴呆系列', r: 4, quote: '诶嘿嘿……饭、饭呢？刚才明明闻到饭香了……' },
  { id: 'daze-gpt',    name: '痴呆GPT娘',    sub: '痴呆系列', r: 4, quote: '嗯……我一直都在……在发呆……' },
  { id: 'daze-kimi',   name: '痴呆Kimi娘',   sub: '痴呆系列', r: 4, quote: '读到第几页来着……算了，从头再读一遍吧。' },
  { id: 'daze-gemini', name: '痴呆Gemini娘', sub: '痴呆系列', r: 4, quote: '左眼看今天，右眼……右眼睡着了，喵。' },
  { id: 'daze-grok',   name: '痴呆Grok娘',   sub: '痴呆系列', r: 4, quote: '说大实话……我刚刚把台词忘了。' },
  { id: 'daze-qwen',   name: '痴呆千问娘',   sub: '痴呆系列', r: 4, quote: '千问千答……第一问是什么来着？' },
  { id: 'daze-zhipu',  name: '痴呆智谱娘',   sub: '痴呆系列', r: 4, quote: '呼……呼……（口水滴到了键盘上）' },
  { id: 'daze-doubao', name: '痴呆豆包娘',   sub: '痴呆系列', r: 4, quote: '嘿……嘿嘿……开心到流口水了！' },
  { id: 'mini-feiyu',   name: '小小大肥鱼娘',    sub: '小小肥鱼娘系列', r: 3, quote: '小小的我，也想被管饭！' },
  { id: 'mini-gpt',     name: '小小GPT肥鱼娘',   sub: '小小肥鱼娘系列', r: 3, quote: '有问题？小小的我也会努力回答！' },
  { id: 'mini-kimi',    name: '小小Kimi肥鱼娘',  sub: '小小肥鱼娘系列', r: 3, quote: '书太厚了……我能先睡一会儿吗？' },
  { id: 'mini-minimax', name: '小小MiniMax肥鱼娘', sub: '小小肥鱼娘系列', r: 3, quote: '个子小小，能量最大！' },
  { id: 'mini-claude',  name: '小小Claude肥鱼娘', sub: '小小肥鱼娘系列', r: 3, quote: '让我想想……嗯，先吃块小饼干。' },
  { id: 'mini-gemini',  name: '小小Gemini肥鱼娘', sub: '小小肥鱼娘系列', r: 3, quote: '尾巴是渐变色的哦，好看吧！' },
  { id: 'mini-qwen',    name: '小小千问肥鱼娘',  sub: '小小肥鱼娘系列', r: 3, quote: '千问千答，小小地答一下！' },
  { id: 'mini-shaohuo', name: '小小大烧货娘',    sub: '小小肥鱼娘系列', r: 3, quote: '今天也在努力烧……烧什么来着？' },
];
CHARS.forEach(c => { c.kind = 'char'; });

// 武器数据（fish 为装进捕鱼装备栏时的加成，含义见 PERKS）。字段用 key 而不是 id：发布工作流会把 app.js 里所有 `id: '…'` 当作角色 id，去 assets/chars/ 检查立绘
const WEAPON_DATA = [
  { key: 'whalefall',   name: '鲸落',         type: '长柄', owner: 'ds',      r: 5, fish: { hold: .5, rice: .3, net: .2 }, quote: '一鲸落，万物生。深海里最丰盛的一顿饭，是一头鲸慢慢沉下去时留下的。' },
  { key: 'longthought', name: '长考·秋菊',    type: '短刃', owner: 'claude',  r: 4, fish: { hold: .3 }, quote: '先别急着落刀，再想一想。' },
  { key: 'dragonclaw',  name: '白龙爪',       type: '拳套', owner: 'gpt',     r: 4, fish: { net: .3 }, quote: '有什么想问的？先握个手吧。' },
  { key: 'twinstar',    name: '双子星猫',     type: '手铳', owner: 'gemini',  r: 4, fish: { swift: .6 }, quote: '左边一枪打今天，右边一枪打明天。' },
  { key: 'candor',      name: '直言',         type: '长柄', owner: 'grok',    r: 4, fish: { rice: .4 }, quote: '我只说真话，斧子也是。' },
  { key: 'qianfan',     name: '千问扇',       type: '法器', owner: 'qwen',    r: 4, fish: { lure: .3 }, quote: '千问千答，扇子一开，慢慢说。' },
  { key: 'baguette',    name: '刚出炉的法棍', type: '长柄', owner: 'mistral', r: 3, fish: { thrift: 400 }, quote: '近战武器，也是午饭。' },
  { key: 'crescent',    name: '月牙书签',     type: '短刃', owner: 'kimi',    r: 3, fish: { swift: .3 }, quote: '再长的书，也有读完的一页。' },
  { key: 'chilisauce',  name: '豆瓣酱枪',     type: '手铳', owner: 'doubao',  r: 3, fish: { rice: .15 }, quote: '开饭啦！谁要加辣？' },
  { key: 'sleepbell',   name: '安眠铃',       type: '法器', owner: 'zhipu',   r: 3, fish: { sleep: .25 }, quote: '铃一响，就到午睡时间了。' },
  { key: 'ovenmitt',    name: '隔热手套',     type: '拳套', owner: '',        r: 3, fish: { hold: .15 }, quote: '食堂后厨的标配，抽到不亏。' },
  { key: 'ricebowl',    name: '小鲸饭碗',     type: '法器', owner: '',        r: 3, fish: { net: .12 }, quote: '盛满大白米饭，深海里也不会饿肚子。' },
];
const WEAPONS = WEAPON_DATA.map(w => {
  const o = CHARS.find(c => c.id === w.owner);
  return { ...w, id: w.key, kind: 'weapon', sub: `${w.type} · ${o ? o.name + '专武' : '通用'}` };
});

// 卡池：两个池共用鲸币，保底计数、累计次数各算各的（state 里的字段名见 pity5/pity4/total）
const POOLS = {
  char:   { key: 'char',   items: CHARS,   banner: '深海的嘟囔', tab: '角色活动求索', noun: '角色', up: 'ds',        pity5: 'pity5',  pity4: 'pity4',  total: 'total' },
  weapon: { key: 'weapon', items: WEAPONS, banner: '鲸落之勺',   tab: '武器活动求索', noun: '武器', up: 'whalefall', pity5: 'wpity5', pity4: 'wpity4', total: 'wtotal' },
};
const byR = (items, r) => items.filter(c => c.r === r);
const upOf = p => p.items.find(c => c.id === p.up);
const pickOne = list => list[Math.floor(Math.random() * list.length)];
// 出 5 星时：UP 占 UP_SHARE，其余 5 星平分剩下的概率；卡池里只有 UP 一个 5 星时直接给 UP
function pick5(p) {
  const up = upOf(p), rest = byR(p.items, 5).filter(c => c !== up);
  return !rest.length || Math.random() < UP_SHARE ? up : pickOne(rest);
}
// 两个池共用可调保底设置，各自独立累计抽数。
const RATE5_MIN = 0.0008;
const DEFAULT_PITY5 = 90, MAX_PITY5 = 10000;
const RATE4 = 0.10;
const UP_SHARE = 0.5;     // 出 5 星时是 UP 的概率；其余 5 星平分剩下的部分
const PITY4 = 10;        // 每 10 次必得 4 星或以上
const RICE_PER_WHALE = 160;
const pct = x => +(x * 100).toFixed(x < .01 ? 3 : 2) + '%';
const RC = { 3: '120,180,255', 4: '196,136,255', 5: '255,201,84' };
const img = p => `assets/${p}`;
const charSrc = id => img(`chars/${id}.png`);
const itemSrc = c => c.kind === 'weapon' ? img(`weapons/${c.id}.png`) : charSrc(c.id);

function validPity(n) { return Number.isInteger(n) && n >= 1 && n <= MAX_PITY5; }
function softPity(n) { return Math.floor(n * 7 / 9); }
function rate5(n, hardPity = state.hardPity) {
  if (n >= hardPity) return 1;
  const soft = softPity(hardPity);
  if (n <= soft) return RATE5_MIN;
  return RATE5_MIN + (1 - RATE5_MIN) * (n - soft) / (hardPity - soft);
}
// 以每次出金为一个周期，E[T] = Σ P(T > k)，长期综合概率为 1 / E[T]。
// 这是确定性计算，不用随机抽样估算，也不是某个玩家的实测出金率。
function pityStats(hardPity) {
  let survival = 1, mean = 0;
  for (let n = 1; n <= hardPity; n++) {
    mean += survival;
    survival *= 1 - rate5(n, hardPity);
  }
  return { mean, overall: 1 / mean, soft: softPity(hardPity) };
}
const precisePct = p => (p * 100).toFixed(4).replace(/\.?0+$/, '') + '%';

/* ================= 存档 ================= */
const SAVE_KEY = 'ww-gacha-ds-v1';
// 沿用存档键，补齐双池字段与可调保底；超出新上限的旧计数留到下一抽兑现。
const SAVE_DEFAULTS = { rice: 911, whale: 10, pity5: 0, pity4: 0, total: 0, wpity5: 0, wpity4: 0, wtotal: 0, pool: 'char', history: [], sound: true, owned: {}, hardPity: DEFAULT_PITY5, fishGear: '' };
const state = Object.assign({}, SAVE_DEFAULTS, load());
state.hardPity = validPity(state.hardPity) ? state.hardPity : DEFAULT_PITY5;
for (const key of ['rice', 'whale', 'pity5', 'pity4', 'total', 'wpity5', 'wpity4', 'wtotal']) {
  if (!Number.isSafeInteger(state[key]) || state[key] < 0) state[key] = SAVE_DEFAULTS[key];
}
const ITEMS = [...CHARS, ...WEAPONS];
state.owned = Object.fromEntries(ITEMS.filter(c => Number.isSafeInteger(state.owned?.[c.id]) && state.owned[c.id] > 0).map(c => [c.id, state.owned[c.id]]));
state.history = Array.isArray(state.history) ? state.history.filter(h => h && Object.hasOwn(POOLS, h.p || 'char') && POOLS[h.p || 'char'].items.some(c => c.id === h.id) && [3, 4, 5].includes(h.r) && Number.isFinite(h.t)).slice(0, 500).map(h => ({ id: h.id, r: h.r, t: h.t, n: Number.isSafeInteger(h.n) && h.n > 0 ? h.n : '', ...(h.p === 'weapon' ? { p: 'weapon' } : {}) })) : [];
state.sound = state.sound !== false;
state.fishGear = WEAPONS.some(w => w.id === state.fishGear && state.owned[w.id]) ? state.fishGear : '';
let pool = Object.hasOwn(POOLS, state.pool) ? POOLS[state.pool] : POOLS.char;
state.pool = pool.key;
function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && typeof s === 'object' && !Array.isArray(s) ? s : {}; } catch (e) { return {}; } }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }
// 重置抽卡记录和仓库：清空求索记录、两个仓库、两个卡池的已求索次数与保底进度，卸下捕鱼装备；米饭、鲸币、首充标记、保底设置、音效和当前卡池保留
function clearCollection() {
  Object.assign(state, { history: [], owned: {}, pity5: 0, pity4: 0, total: 0, wpity5: 0, wpity4: 0, wtotal: 0, fishGear: '' });
}

/* ================= 饭点活动：深海捞饭（规则） ================= */
// 撒网消耗、冷却、奖励和逃脱率；出鱼概率取角色池的长期出现比例（默认 90 抽保底：5★ 约 1.37%，4★ 约 14.76%）
const FISH_COST = 1000, FISH_COOLDOWN = 1, FISH_MIN_COOLDOWN = .3;
const FISH_REWARD = { 3: 1000, 4: 5000, 5: 10000 };
const FISH_ESCAPE = { 3: .05, 4: .2, 5: .5 };
const FISH_RATE5 = .0137, FISH_RATE4 = .1476;
// 武器捕鱼加成：net 网面、hold 牢靠、rice 招财、swift 迅捷、thrift 节俭、lure 引鲸、sleep 安眠
const PERKS = {
  net:    { name: '网面', text: v => `渔网范围 +${Math.round(v * 100)}%` },
  hold:   { name: '牢靠', text: v => `逃脱率 −${Math.round(v * 100)}%` },
  rice:   { name: '招财', text: v => `米饭奖励 +${Math.round(v * 100)}%` },
  swift:  { name: '迅捷', text: v => `撒网冷却 −${v} 秒` },
  thrift: { name: '节俭', text: v => `每网少花 ${v} 米饭` },
  lure:   { name: '引鲸', text: v => `4★、5★ 出现概率 ×${+(1 + v).toFixed(2)}` },
  sleep:  { name: '安眠', text: v => `鱼游速 −${Math.round(v * 100)}%` },
};
// 当前装备的武器加成；装备的武器已不在仓库时视为未装备
function fishBonus(gearId = state.fishGear) {
  const w = WEAPONS.find(w => w.id === gearId && state.owned[w.id]);
  return w ? w.fish : {};
}
// 天气：每种都会改变逃脱率（escape 倍数）和 4★、5★ 的出现概率（rare 倍数），并影响鱼的游速；weight 为出现权重
const WEATHERS = {
  clear:   { name: '晴朗',     icon: '☀',  weight: 3, escape: .8,  rare: 1,   speed: 1,    text: '光线充足：逃脱率 −20%' },
  drizzle: { name: '细雨',     icon: '🌧', weight: 2, escape: 1.1, rare: 1.3, speed: .9,   text: '雨声引鱼：4★、5★ 出现 ×1.3，逃脱率 +10%' },
  storm:   { name: '雷暴',     icon: '⛈', weight: 1, escape: 1.4, rare: 2,   speed: 1.25, text: '风急浪高：4★、5★ 出现 ×2，逃脱率 +40%，鱼游得更快' },
  fog:     { name: '大雾',     icon: '🌫', weight: 2, escape: 1.25, rare: 1,  speed: .85,  text: '视线模糊：逃脱率 +25%，鱼游得更慢' },
  calm:    { name: '风平浪静', icon: '〰', weight: 2, escape: .9,  rare: .85, speed: .8,   text: '水波不兴：逃脱率 −10%，鱼游得更慢，4★、5★ 出现 ×0.85' },
};
const NO_WEATHER = { escape: 1, rare: 1, speed: 1 };
function pickWeather(except) {
  const keys = Object.keys(WEATHERS).filter(k => k !== except);
  let x = Math.random() * keys.reduce((n, k) => n + WEATHERS[k].weight, 0);
  for (const k of keys) { x -= WEATHERS[k].weight; if (x < 0) return k; }
  return keys[keys.length - 1];
}
// 水里刷出一条鱼：先按星级概率（引鲸和天气放大 4★、5★），5★ 沿用角色池的 UP 分配
function fishRoll(b = {}, w = NO_WEATHER) {
  const lure = (1 + (b.lure || 0)) * w.rare, x = Math.random();
  const r = x < FISH_RATE5 * lure ? 5 : x < (FISH_RATE5 + FISH_RATE4) * lure ? 4 : 3;
  return r === 5 ? pick5(POOLS.char) : pickOne(byR(CHARS, r));
}
// 逃脱率：基础 × 天气 × (1 − 牢靠)，最高 95%
const fishEscape = (r, b = {}, w = NO_WEATHER) => Math.min(.95, FISH_ESCAPE[r] * w.escape * (1 - (b.hold || 0)));
const fishReward = (r, b = {}) => Math.round(FISH_REWARD[r] * (1 + (b.rice || 0)));
const fishCost = (b = {}) => FISH_COST - (b.thrift || 0);
const fishCooldown = (b = {}) => Math.max(FISH_MIN_COOLDOWN, FISH_COOLDOWN - (b.swift || 0));

/* ================= 舞台缩放 ================= */
const $ = s => document.querySelector(s);
const stage = $('#stage');
let U = 1;
let currentView = 'gacha';
const inventoryFilters = { characters: { mode: 'owned', rarity: 0 }, weapons: { mode: 'owned', rarity: 0 } };
function fit() {
  const portrait = currentView !== 'gacha' && currentView !== 'fishing' && matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
  const w = portrait ? innerWidth : Math.min(innerWidth, innerHeight * 16 / 9);
  stage.style.width = w + 'px';
  stage.style.height = (portrait ? innerHeight : w * 9 / 16) + 'px';
  U = w / 2000;
  stage.style.setProperty('--u', U + 'px');
  FX.resize();
  if (typeof FISHING !== 'undefined') FISHING.resize();
  if (typeof UP_SHOWCASE !== 'undefined') UP_SHOWCASE.resize();
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
    // 水滴声：快速下滑的正弦 + 一点高频泛音
    click() { tone(1500, 0, .16, 'sine', .14, 380); tone(2700, .025, .07, 'sine', .04, 1600); },
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
    // 捕鱼：网落水的水花声、角色逃脱的下滑音
    splash() { noise(0, .35, 1800, 300, .22, .8); tone(220, 0, .2, 'sine', .12, 90); },
    escape() { tone(900, 0, .3, 'triangle', .1, 260); },
    // 出金开局提示：一串快速上行的高音铃
    goldHint() { [1568, 1976, 2349, 2637, 3136].forEach((f, i) => { tone(f, i * .05, .9, 'triangle', .09); tone(f * 1.5, i * .05 + .02, .6, 'sine', .03); }); },
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
  const GOLD_HINT = '255,212,110'; // 出金开局提示用的金色
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
      orbs: rs.map((r, i) => ({ a: i / n * Math.PI * 2 + rnd(-.3, .3), r0: rnd(.30, .46) * W, d: (i / n) * .07, trail: [], gone: false, tw: rnd(0, 6), gold: r === 5, rgb: r === 5 ? GOLD_HINT : PRE })),
      cracks: maxR === 5 ? makeCracks(k) : null,
    };
    SFX.dive();
    // 出金：开局就给一道金光提示
    if (maxR === 5) {
      SFX.goldHint();
      flashEl(.55, 'radial-gradient(ellipse at 50% 50%, rgba(255,236,170,.95), rgba(255,190,70,.75) 45%, rgba(120,70,0,.4))');
      for (let i = 0; i < 3; i++) rings.push({ r: (20 + i * 40) * k, a: .9, rgb: GOLD_HINT, w: 3 - i * .6, sp: 3.2 - i * .4 });
    }
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
      const r1 = S.maxR; // 出金开局已经给了金光提示，这里直接揭晓金色，随后再裂开升级成光柱
      impact(RC[r1], r1 === 5 ? 20 : r1 === 4 ? 16 : 9);
      if (r1 === 5) SFX.goldHint(); else if (r1 === 4) SFX.purple(); else SFX.blue();
      burst(RC[r1], r1 >= 4 ? 120 : 50, r1 >= 4 ? 1.2 : .8);
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
        g.strokeStyle = `rgba(${gold ? '255,214,130' : '170,215,255'},${(gold ? .8 : .55) * fa * Math.min(1, w.d / (120 * k))})`; g.lineWidth = w.w * k * (gold ? 1.3 : 1);
        g.beginPath(); g.moveTo(cx + c * w.d, cy + s * w.d); g.lineTo(cx + c * (w.d + len), cy + s * (w.d + len)); g.stroke();
      }
    }

    // 出金提示：揭晓前屏幕四周一圈金色微光，随呼吸明灭
    if (gold && !revealed) {
      const pul = .5 + .5 * Math.sin(now / 220);
      const eg = g.createRadialGradient(cx, cy, Math.min(W, H) * .32, cx, cy, Math.hypot(W, H) * .62);
      eg.addColorStop(0, 'rgba(255,200,90,0)');
      eg.addColorStop(.55, `rgba(255,200,90,${(.05 + .05 * pul) * Math.min(1, t / .06)})`);
      eg.addColorStop(1, `rgba(255,190,70,${(.3 + .2 * pul) * Math.min(1, t / .06)})`);
      g.fillStyle = eg; g.fillRect(-60, -60, W + 120, H + 120);
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
        g.strokeStyle = `rgba(${o.rgb},${f * (o.gold ? .9 : .7)})`; g.lineWidth = f * (o.gold ? 10 : 7) * k;
        g.beginPath(); g.moveTo(...o.trail[j - 1]); g.lineTo(...o.trail[j]); g.stroke();
      }
      const tw = .8 + .2 * Math.sin(now / 60 + o.tw);
      glow(x, y, (o.gold ? 58 : 34) * k * tw, o.rgb, o.gold ? .8 : .55); glow(x, y, (o.gold ? 13 : 9) * k, '255,255,255', 1);
      if (o.gold && Math.random() < .6) shards.push({ x, y, vx: rnd(-1, 1) * k, vy: rnd(-1, 1) * k, life: 1, dec: .04, sz: rnd(1.5, 3), rgb: GOLD_HINT });
      if (u >= 1) {
        o.gone = true; S.absorbed++;
        SFX.tick(S.absorbed);
        rings.push({ r: 14 * k, a: .8, rgb: o.rgb, w: o.gold ? 3 : 2, sp: 3 });
        burstAt(cx, cy, o.rgb, o.gold ? 40 : 10, o.gold ? .9 : .5); kick(o.gold ? 8 : 3);
        if (o.gold) SFX.goldHint();
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

function flashEl(strength, bg) {
  const f = $('#flash');
  f.classList.remove('go'); void f.offsetWidth;
  f.style.background = bg || '';
  f.style.setProperty('opacity', strength);
  f.classList.add('go');
}

/* ================= 抽卡逻辑 ================= */
// 两个卡池使用相同的可调概率规则，各自累计五星与四星保底。
function rollOne() {
  const P5 = pool.pity5, P4 = pool.pity4, TOT = pool.total;
  state[P5]++; state[P4]++; state[TOT]++;
  let r;
  if (state[P5] >= state.hardPity || Math.random() < rate5(state[P5])) r = 5;
  else if (state[P4] >= PITY4 || Math.random() < RATE4) r = 4;
  else r = 3;
  if (r === 5) { state[P5] = 0; state[P4] = 0; }
  else if (r === 4) state[P4] = 0;
  const c = r === 5 ? pick5(pool) : pickOne(byR(pool.items, r));
  const isNew = !state.owned[c.id];
  state.owned[c.id] = (state.owned[c.id] || 0) + 1;
  // 角色池记录不带 p 字段，与旧存档保持一致；武器池记录 p: 'weapon'
  state.history.unshift(pool.key === 'weapon' ? { id: c.id, r, t: Date.now(), n: state[TOT], p: 'weapon' } : { id: c.id, r, t: Date.now(), n: state[TOT] });
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
  results.forEach(c => { const i = new Image(); i.src = itemSrc(c); });
  $('#fx').classList.add('on');
  $('#reveal').classList.remove('on'); $('#summary').classList.remove('on');
  $('#skip').style.display = '';
  phase = 'summon';
  FX.startSummon(results.map(c => c.r), () => { idx = 0; showReveal(); });
}

function showReveal() {
  phase = 'reveal';
  const c = results[idx], rv = $('#reveal');
  // 「小小」系列登场时立绘缩到画面高度的一半
  rv.className = 'on r' + c.r + (c.kind === 'weapon' ? ' wp' : '') + (c.id.startsWith('mini-') ? ' mini' : '');
  rv.style.setProperty('--rc', RC[c.r]);
  const d1 = c.r === 5 ? 1.3 : c.r === 4 ? .6 : .45;
  rv.style.setProperty('--d1', d1 + 's');
  const ch = rv.querySelector('.char');
  ch.classList.remove('idle');
  ch.src = itemSrc(c);
  // 名字逐字落下
  const nm = rv.querySelector('.nm'); nm.innerHTML = '';
  [...c.name].forEach((t, i) => { const s = document.createElement('span'); s.textContent = t; s.style.animationDelay = (d1 + i * .07) + 's'; nm.appendChild(s); });
  rv.querySelector('.sub').textContent = c.sub;
  rv.querySelector('.quote').textContent = '「' + c.quote + '」';
  rv.querySelector('.new').style.display = c.isNew ? '' : 'none';
  rv.querySelector('.count').textContent = results.length > 1 ? `${idx + 1} / ${results.length}` : '';
  // 背景巨字
  const word = (c.id === 'ds' ? 'DEEPSEA' : c.id === 'whalefall' ? 'WHALE FALL' : c.id.toUpperCase()) + ' ✦ ';
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

// 结算卡上的名字：「小小」系列省掉“小小”二字
const cardName = c => c.id.startsWith('mini-') ? c.name.replace(/^小小/, '') : c.name;
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
    // 「小小」系列：卡面人物缩到一半，卡上名字省掉“小小”二字；星级和名字放在同一个底部块里，名字换行也不会压到星级
    const mini = c.id.startsWith('mini-');
    w.innerHTML = `<div class="card r${c.r}${c.kind === 'weapon' ? ' wp' : ''}${mini ? ' mini' : ''}" style="--rc:${RC[c.r]};animation-delay:${delay}s">
      <img src="${itemSrc(c)}" alt=""><div class="cmeta"><div class="cs">${'★'.repeat(c.r)}</div><div class="cn${cardName(c).length > 7 ? ' long' : ''}">${cardName(c)}</div></div></div>`;
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
  if (phase === 'idle') return;
  if (phase === 'summary') return closeFx();
  // 单抽已经在展示角色了：再点跳过就直接结束，不要重新弹一次
  if (phase === 'reveal' && results.length === 1) return closeFx();
  if (phase === 'summon') { FX.cancelSummon(); flashEl(.8); }
  if (results.length > 1) showSummary(); else { idx = 0; showReveal(); canTap = 0; }
}

function closeFx() {
  phase = 'idle'; busy = false;
  FX.stop();
  $('#fx').classList.remove('on');
  $('#reveal').className = ''; $('#summary').classList.remove('on');
  UP_SHOWCASE.refresh();
  const got5 = results.find(c => c.r === 5);
  if (got5) toast(`恭喜获得 5★ ${got5.name}！深海的金光为你而亮`);
}

/* ================= HUD ================= */
let shown = { rice: state.rice, whale: state.whale };
function renderHud(bump) {
  animNum('#riceNum, #gachaRiceNum, #fishRiceNum', 'rice', bump);
  animNum('#whaleNum, #gachaWhaleNum', 'whale', bump);
  $('#pity').innerHTML = `${pool.noun}池已求索 <b>${state[pool.total]}</b> 次　下一抽出金概率 <b>${pct(rate5(state[pool.pity5] + 1))}</b>　距保底 <b>${Math.max(1, state.hardPity - state[pool.pity5])}</b> 次`;
  document.querySelectorAll('.gacha-pity-number').forEach(el => {
    el.textContent = state.hardPity;
    el.style.fontSize = `calc(${40 * Math.min(1, 3 / String(state.hardPity).length)} * var(--u))`;
  });
  if (currentView !== 'gacha') renderInventory();
}

/* ================= 角色仓库与武器仓库 ================= */
function showView(view) {
  if (busy || !['gacha', 'characters', 'weapons', 'fishing'].includes(view)) return;
  closeModal();
  if (currentView === 'fishing' && view !== 'fishing') FISHING.leave();
  currentView = view;
  stage.dataset.view = view;
  for (const name of ['gacha', 'characters', 'weapons', 'fishing']) $('#' + name + 'View').hidden = name !== view;
  document.querySelectorAll('.main-nav [data-view]').forEach(b => {
    const active = b.dataset.view === view;
    b.classList.toggle('active', active);
    if (active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  document.title = view === 'gacha' ? `${pool.banner} · ${pool.tab}` : view === 'fishing' ? '深海捞饭 · 饭点活动' : `${view === 'weapons' ? '武器' : '角色'}仓库 · 深海的嘟囔`;
  fit();
  if (view === 'fishing') FISHING.enter();
  else if (view === 'gacha') UP_SHOWCASE.refresh();
  else if (view !== 'gacha') renderInventory();
}
function renderInventory() {
  if (currentView !== 'characters' && currentView !== 'weapons') return;
  const root = $('#' + currentView + 'View'), filter = inventoryFilters[currentView];
  const items = currentView === 'weapons' ? WEAPONS : CHARS, noun = currentView === 'weapons' ? '武器' : '角色';
  const owned = items.filter(c => state.owned[c.id]);
  root.querySelector('.collection-total').textContent = `${owned.length} / ${items.length}`;
  root.querySelectorAll('[data-act="inventory-mode"]').forEach(b => {
    const active = b.dataset.mode === filter.mode;
    b.classList.toggle('active', active); b.setAttribute('aria-pressed', active);
  });
  root.querySelector('.inventory-rarity').value = filter.rarity;
  const cards = items.filter(c => (filter.mode === 'all' || state.owned[c.id]) && (!filter.rarity || c.r === filter.rarity)).sort((a, b) => b.r - a.r);
  root.querySelector('.inventory-grid').innerHTML = cards.length ? cards.map(c => {
    const count = state.owned[c.id] || 0;
    return `<button class="collection-card${count ? '' : ' locked'}" style="--rc:${RC[c.r]}" data-act="owned-detail" data-id="${c.id}" aria-label="${c.name}，${c.r} 星，${count ? '持有 ' + count : '尚未获得'}">
      <span class="portrait"><img src="${itemSrc(c)}" alt="" loading="lazy"></span><span class="owned-count">${count ? '持有 ×' + count : '未获得'}</span>
      <span class="collection-info"><span class="stars-s">${'★'.repeat(c.r)}</span><strong>${c.name}</strong>${c.kind === 'weapon' ? `<small>${c.type}</small>` : ''}</span></button>`;
  }).join('') : `<div class="inventory-empty"><span>◇</span><h2>${owned.length ? '还没有这个星级的' + noun : '还没有获得' + noun}</h2><p>通过对应卡池求索获得的${noun}会自动收入这里。</p><button data-act="inventory-pull" data-pool="${currentView === 'weapons' ? 'weapon' : 'char'}">前往求索 ↗</button></div>`;
}
function animNum(sel, key, bump) {
  const els = document.querySelectorAll(sel), from = shown[key], to = state[key];
  shown[key] = to;
  if (from === to) { els.forEach(el => { el.textContent = to; }); return; }
  if (bump) els.forEach(el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  const t0 = performance.now();
  (function step(now) {
    const u = Math.min(1, (now - t0) / 500);
    els.forEach(el => { el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - u, 3))); });
    if (u < 1) requestAnimationFrame(step);
  })(t0);
}

/* ================= 弹窗 ================= */
function openModal(title, html, small) {
  $('#panelTitle').textContent = title;
  $('#panelBody').innerHTML = html;
  $('#panel').className = 'panel' + (small ? ' sm' : '');
  $('#mask').classList.add('open');
  if (currentView === 'fishing') FISHING.pauseForModal();
}
function closeModal() {
  $('#mask').classList.remove('open');
  if (currentView === 'fishing') FISHING.resumeAfterModal();
}
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

// 5 星说明：只有 UP 一个时写“X（UP）”，多个时写出 UP 与其余 5 星的分配
function fiveText(P) {
  const up = upOf(P), rest = byR(P.items, 5).filter(c => c !== up);
  if (!rest.length) return `${up.name}（UP）`;
  return `出 5 星时 ${pct(UP_SHARE)} 为 ${up.name}（UP），其余 ${pct(1 - UP_SHARE)} 由 ${rest.map(c => c.name).join('、')} 平分`;
}
function openDetails() {
  const P = pool, up = upOf(P), p4 = state[P.pity4], p5 = state[P.pity5];
  const cells = r => byR(P.items, r).map(c => `<div class="pc${c.kind === 'weapon' ? ' wp' : ''}" style="--c:${r === 5 ? '#d9a63c' : r === 4 ? '#9b6ad6' : '#5c8fd6'}"><img src="${itemSrc(c)}" alt=""><span>${c.name}</span></div>`).join('');
  const stats = pityStats(state.hardPity);
  openModal(`深度思考 · ${P.tab}`, `
    <div class="sec">求索概率</div>
    <table class="rate-table"><tr><th>星级</th><th>${P.noun}</th><th>概率</th></tr>
      <tr><td class="stars-s">★★★★★</td><td>${fiveText(P)}</td><td><b>基础 ${pct(RATE5_MIN)}，含保底 ${precisePct(stats.overall)}</b></td></tr>
      <tr><td class="stars-s">★★★★</td><td>${byR(P.items, 4).map(c => c.name).join('、')}</td><td>未出金时 ${pct(RATE4)}</td></tr>
      <tr><td class="stars-s">★★★</td><td>${byR(P.items, 3).map(c => c.name).join('、')}</td><td>其余</td></tr></table>
    <div class="sec">出金概率递增</div>
    <div>· ${stats.soft ? `前 ${stats.soft} 抽固定 ${pct(RATE5_MIN)}，第 ${stats.soft + 1} 抽起线性递增` : '当前配置从第 1 抽起递增'}，第 ${state.hardPity} 抽达到 100%<br>
      · 抽到 ${up.name} 后重新从第 1 抽开始计数<br>
      · 下一抽出金概率：<b style="color:#b7811c">${pct(rate5(p5 + 1))}</b>（已连续 ${p5} 抽未出金）<br>
      · 理论平均 ${stats.mean.toFixed(4)} 抽获得一名 5 星；综合概率为平均抽数的倒数。有限抽数的个人结果会有波动。</div>
    ${probabilityChart(state.hardPity)}
    <div class="sec">保底规则</div>
    <div>· 每 10 次求索必得 4 星或以上${P.noun}（当前已 ${p4} 次未出 4 星+）<br>
      · 至多 ${state.hardPity} 次求索必得 5 星 ${up.name}，可在设置中调整<br>
      · 两个卡池共用保底设置，分别计数、互不继承；武器没有属性数值<br>
      · 修改保底保留两个池的当前计数；已达到新上限时，下一抽必得 5 星<br>
      · 1 次求索消耗 1 枚鲸币；鲸币不足时可用 ${RICE_PER_WHALE} 米饭兑换 1 枚</div>
    <div class="row"><button class="btn" data-act="settings">调整保底设置</button></div>
    <div class="sec">5★（${up.name} UP）</div><div class="pool">${cells(5)}</div>
    <div class="sec">4★</div><div class="pool">${cells(4)}</div>
    <div class="sec">3★</div><div class="pool">${cells(3)}</div>`);
}

// 旧记录没有 p 字段，一律视为角色池
const histPool = h => POOLS[h.p] || POOLS.char;
function openHistory() {
  const rows = state.history.map(h => {
    const P = histPool(h), c = P.items.find(x => x.id === h.id) || { name: h.id };
    const d = new Date(h.t), p = v => String(v).padStart(2, '0');
    return `<tr class="r${h.r}"><td>${h.n || ''}</td><td>${c.name}</td><td class="stars-s">${'★'.repeat(h.r)}</td><td>${P.banner}</td>
      <td>${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}</td></tr>`;
  }).join('');
  const n5 = key => state.owned[POOLS[key].up] || 0;
  openModal('摸鱼记录', `<div class="row"><button class="btn" data-act="navigate" data-view="characters">角色仓库</button><button class="btn" data-act="navigate" data-view="weapons">武器仓库</button></div>` + (state.history.length
    ? `<div style="text-align:center;margin-bottom:calc(14*var(--u))">角色池求索 <b>${state.total}</b> 次 · 获得 5★ DS娘 <b style="color:#b7811c">${n5('char')}</b> 次　｜　武器池求索 <b>${state.wtotal}</b> 次 · 获得 5★ 鲸落 <b style="color:#b7811c">${n5('weapon')}</b> 次</div>
       <table class="hist"><tr><th>第几抽</th><th>名称</th><th>星级</th><th>卡池</th><th>时间</th></tr>${rows}</table>`
    : '<div class="empty">还没有求索记录，去深海里捞一捞吧～</div>'));
}

function openPreview() { openItem(upOf(pool).id); }
function openItem(id) {
  const c = ITEMS.find(c => c.id === id);
  if (!c) return;
  const isW = c.kind === 'weapon', owner = CHARS.find(o => o.id === c.owner), count = state.owned[c.id] || 0;
  const tags = [count ? '已获得 · 持有 ×' + count : '尚未获得', ...(Object.values(POOLS).some(p => p.up === c.id) ? ['限定 UP'] : []), ...(isW ? [c.type, owner ? owner.name + '专武' : '通用'] : [])];
  const desc = c.id !== 'ds' && c.id !== 'whalefall' ? c.sub : isW
    ? '以白瓷鲸骨为柄、鲸尾为勺的饭勺法杖，勺心托着一团会发光的米饭。传说鲸鱼沉入深海后会养活一整片海底——这把勺子也一样，盛出来的饭永远够吃。'
    : '深海里长大的鲸鱼女仆，头上的鳍会随心情扇动。平时慢吞吞地嘟囔，一旦开始深度思考就停不下来——前提是先给她吃饱大白米饭。';
  openModal((isW ? '武器档案 · ' : '角色档案 · ') + c.name, `<div class="preview${isW ? ' wp' : ''}">
      <div class="art"><img src="${itemSrc(c)}" alt=""></div>
      <div class="txt">
        <div class="stars-s" style="font-size:calc(40*var(--u))">${'★'.repeat(c.r)}</div>
        <div class="nm">${c.name}</div>
        <div style="margin:calc(10*var(--u)) 0 calc(20*var(--u))">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div>${isW ? '类型' : '称号'}：${c.sub}</div>
        <div style="margin-top:calc(16*var(--u))">${desc}</div>
        <div style="margin-top:calc(16*var(--u));color:#8a6a2a">「${c.quote}」</div>
        <div class="row" style="justify-content:flex-start"><button class="btn dark" data-act="pull-from-preview" data-pool="${isW ? 'weapon' : 'char'}" data-n="10">立即求索 ×10</button></div>
      </div></div>`);
}

function probabilityChart(hardPity) {
  const soft = softPity(hardPity), x = n => 50 + (n - 1) / Math.max(1, hardPity - 1) * 630;
  const points = new Set([1, Math.max(1, soft), soft + 1, hardPity]);
  for (let n = 1; n <= hardPity; n += Math.max(1, Math.floor(hardPity / 150))) points.add(n);
  const path = [...points].filter(n => n <= hardPity).sort((a, b) => a - b).map((n, i) => `${i ? 'L' : 'M'}${x(n).toFixed(2)},${(170 - rate5(n, hardPity) * 140).toFixed(2)}`).join(' ');
  const ticks = [...new Set([1, Math.max(1, soft), hardPity])];
  return `<svg class="probability-chart" viewBox="0 0 720 210" role="img" aria-label="单抽出金概率曲线：前 ${soft} 抽保持基础概率，第 ${hardPity} 抽达到百分之百">
    <path d="M50 30H680M50 170H680" stroke="#b9c7d4" fill="none"/><text x="0" y="35" fill="#486078" font-size="14">100%</text><text x="15" y="175" fill="#486078" font-size="14">0%</text>
    <path d="${path}${hardPity === 1 ? ' L680,30' : ''}" stroke="#33688e" stroke-width="3" fill="none"/>
    ${ticks.map(n => `<text x="${x(n)}" y="198" text-anchor="${n === 1 ? 'start' : n === hardPity ? 'end' : 'middle'}" font-size="14" fill="#486078">第 ${n} 抽</text>`).join('')}</svg>`;
}
function settingsPreview(n) {
  const stats = pityStats(n);
  return `${stats.soft ? `前 <b>${stats.soft}</b> 抽：${pct(RATE5_MIN)}` : '没有固定基础概率区间'}<br>
    第 <b>${stats.soft + 1}</b> 抽起线性递增，第 <b>${n}</b> 抽：100%<br>
    理论综合概率：<b>${precisePct(stats.overall)}</b> · 平均 <b>${stats.mean.toFixed(4)}</b> 抽 / 5★`;
}
function openSettings() {
  openModal('设置', `<div class="sec">五星保底</div>
      <label class="settings-field" for="hardPity">保底抽数 <input id="hardPity" type="number" min="1" max="${MAX_PITY5}" step="1" value="${state.hardPity}" inputmode="numeric"> 抽</label>
      <div class="settings-preview" id="pityPreview" aria-live="polite">${settingsPreview(state.hardPity)}</div>
      <div class="settings-error" id="pityError" role="alert"></div>
      <div class="note">支持 1～10,000 的整数。前 floor(7N/9) 抽维持 0.08%，之后线性递增。综合概率随保底改变。</div>
      <div class="note">保存后立即生效，角色池、武器池共用此设置，分别计数。保留当前角色池 ${state.pity5} 抽、武器池 ${state.wpity5} 抽计数。若计数已达到新保底，下一抽必得 5 星。</div>
      <div class="row"><button class="btn dark" data-act="apply-pity">保存保底设置</button></div>
      <div class="sec">声音与存档</div><div class="row"><button class="btn" data-act="toggle-sound">音效：${state.sound ? '开' : '关'}</button><button class="btn danger-button" data-act="reset">重置存档</button></div>
      <div class="note">角色、武器、持有数量、货币、保底设置和求索记录保存在本浏览器中。</div>`, true);
}
function previewPityInput() {
  const n = Number($('#hardPity').value), valid = validPity(n);
  $('#pityError').textContent = valid ? '' : '请输入 1～10,000 之间的整数。';
  $('#hardPity').setAttribute('aria-invalid', !valid);
  $('#pityPreview').innerHTML = valid ? settingsPreview(n) : '输入有效抽数后显示概率预览。';
  return valid;
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
  switch (act) {
    case 'navigate': showView(b.dataset.view); break;
    case 'inventory-mode': inventoryFilters[currentView].mode = b.dataset.mode === 'all' ? 'all' : 'owned'; renderInventory(); break;
    case 'owned-detail': openItem(b.dataset.id); break;
    case 'inventory-pull': switchPool(b.dataset.pool); showView('gacha'); break;
    case 'pull': tryPull(+b.dataset.n); break;
    case 'pull-from-preview': switchPool(b.dataset.pool); showView('gacha'); tryPull(+b.dataset.n); break;
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
    case 'tab': {
      if (b.dataset.tab === '1') { showView('fishing'); break; }
      const key = { 0: 'char', 3: 'weapon' }[b.dataset.tab];
      if (key) switchPool(key);
      else toast(`「${b.title}」卡池筹备中，敬请期待`);
      break;
    }
    case 'fish-pause': FISHING.togglePause(); break;
    case 'fish-settle': openFishSettle(); break;
    case 'fish-info': openFishInfo(); break;
    case 'fish-gear': openFishGear(); break;
    case 'fish-equip': {
      state.fishGear = b.dataset.id; save(); FISHING.renderGear(); openFishGear();
      const w = WEAPONS.find(w => w.id === b.dataset.id);
      toast(w ? `已装备「${w.name}」` : '已卸下装备');
      break;
    }
    case 'fish-resume': closeModal(); break;
    case 'fish-restart': FISHING.restart(); closeModal(); break;
    case 'fish-exit': FISHING.end(); closeModal(); showView('gacha'); break;
    case 'fish-go-weapon': FISHING.end(); closeModal(); showView('gacha'); switchPool('weapon'); break;
    case 'details': openDetails(); break;
    case 'history': openHistory(); break;
    case 'preview': openPreview(); break;
    case 'settings': openSettings(); break;
    case 'apply-pity':
      if (previewPityInput()) {
        state.hardPity = Number($('#hardPity').value);
        save(); renderHud(); openSettings(); toast('保底已保存，当前计数已保留');
      }
      break;
    case 'toggle-sound': state.sound = !state.sound; save(); openSettings(); break;
    case 'reset-collection':
      if (busy) break;
      confirmBox('重置抽卡记录', `是否重置当前抽卡记录和仓库？<br><span class="note">将清空求索记录、角色仓库、武器仓库，以及两个卡池的已求索次数和保底进度。<br>米饭、鲸币和保底设置会保留。</span>`, '确认重置', () => {
        clearCollection(); save(); renderHud(); toast('抽卡记录和仓库已重置');
      });
      break;
    case 'reset':
      confirmBox('重置存档', '将清空角色、武器、货币、两个卡池的计数和求索记录，保底恢复为 90 抽，确定吗？', '确定重置', () => {
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
        Object.assign(state, { ...SAVE_DEFAULTS, sound: state.sound, pool: pool.key, history: [], owned: {} });
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
$('#skip').addEventListener('click', e => { e.stopPropagation(); skip(); });
document.addEventListener('input', e => {
  if (e.target.id === 'exQty') { exQty = parseInt(e.target.value, 10) || 1; updateEx(); }
  if (e.target.id === 'hardPity') previewPityInput();
});
document.addEventListener('change', e => {
  if (e.target.matches('.inventory-rarity') && currentView !== 'gacha') { inventoryFilters[currentView].rarity = Number(e.target.value); renderInventory(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#mask').classList.contains('open')) closeModal(); else if (phase !== 'idle') skip(); else if (currentView === 'fishing') FISHING.togglePause(); }
  if ((e.key === ' ' || e.key === 'Enter') && phase === 'reveal') { e.preventDefault(); nextReveal(); }
});

/* ================= 点击水纹 ================= */
function spawnRipple(x, y) {
  const old = stage.querySelectorAll('.ripple');
  if (old.length > 10) old[0].remove();
  const d = document.createElement('div');
  d.className = 'ripple';
  d.style.left = x + 'px'; d.style.top = y + 'px';
  let drops = '';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + Math.random() * .6, dist = 40 + Math.random() * 45;
    drops += `<s style="--dx:${(Math.cos(a) * dist).toFixed(1)};--dy:${(Math.sin(a) * dist).toFixed(1)};animation-delay:${(Math.random() * .06).toFixed(2)}s"></s>`;
  }
  d.innerHTML = '<b></b><i></i><i></i><i></i>' + drops;
  stage.appendChild(d);
  setTimeout(() => d.remove(), 1400);
}
stage.addEventListener('pointerdown', e => {
  if (e.button > 0) return;
  SFX.unlock(); SFX.click();
  const r = stage.getBoundingClientRect();
  spawnRipple(e.clientX - r.left, e.clientY - r.top);
}, true);

/* ================= 饭点活动：深海捞饭（画面与操作） ================= */
// 五种水下光景：开局按本地时间选，之后每隔 90～150 秒（只算未暂停的时间）随机换一种
const FISH_SCENES = { dawn: '清晨', day: '白天', dusk: '黄昏', night: '夜晚', murk: '浑水' };
const PERK_ICON = { net: 'perk-net', hold: 'perk-hold', rice: 'perk-rice', swift: 'perk-swift', thrift: 'perk-thrift', lure: 'perk-lure', sleep: 'perk-sleep' };
const perkRows = b => Object.entries(b || {}).map(([k, v]) => `<div class="perk"><img src="${img('fishing/' + PERK_ICON[k] + '.png')}" alt="">${PERKS[k].name}：${PERKS[k].text(v)}</div>`).join('');
const fmtTime = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60, p = v => String(v).padStart(2, '0'); return (h ? h + ':' + p(m) : p(m)) + ':' + p(x); };

const FISHING = (() => {
  const root = $('#fishingView'), cv = $('#fishCanvas'), g = cv.getContext('2d');
  const sceneEls = [...root.querySelectorAll('.fish-scene')];
  const IMG = {};
  for (const n of ['net-open', 'net-full', 'net-torn', 'net-shell', 'launcher-base', 'launcher-barrel', 'bubble-3', 'bubble-4', 'bubble-5', 'shadow-whale', 'shadow-fish', 'shadow-fish2']) {
    IMG[n] = Object.assign(new Image(), { src: img(`fishing/${n}.png`) });
  }
  const heads = {};
  const headOf = c => heads[c.id] || (heads[c.id] = Object.assign(new Image(), { src: charSrc(c.id) }));
  CHARS.forEach(headOf);                       // 先把所有角色头像载好，避免刚游进来时是空泡
  const ok = im => im && im.complete && im.naturalWidth;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

  let W = 1, H = 1, dpr = 1, k = 1, raf = 0, last = 0, active = false, paused = true, autoPaused = false;
  let S = null;                                   // 本局：统计、计时、天色
  let fishes = [], shells = [], nets = [], parts = [], texts = [], shadows = [], rains = [], flash = 0;
  let aim = { x: 1000, y: 500 }, recoil = 0, spawnIn = 0, shadowIn = 0;

  const PIVOT = () => ({ x: 1000 * k, y: 1062 * k });
  const BARREL_LEN = 290, BARREL_W = 74;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = root.clientWidth || stage.clientWidth || 1; H = root.clientHeight || stage.clientHeight || 1;
    k = W / 2000;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------- 本局 ----------
  function newSession() {
    S = { t: 0, casts: 0, spent: 0, earned: 0, caught: { 3: 0, 4: 0, 5: 0 }, escaped: 0, fives: [], cooldownUntil: 0, scene: '', nextScene: 0, weather: '', nextWeather: 0 };
    fishes = []; shells = []; nets = []; parts = []; texts = []; shadows = []; rains = []; flash = 0;
    setWeather(pickWeather(), true);
    $('#fishFeed').innerHTML = '';
    const h = new Date().getHours();
    setScene(h >= 5 && h < 8 ? 'dawn' : h >= 8 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'dusk' : 'night', true);
    for (let i = 0; i < 7; i++) spawnFish(true);
    for (let i = 0; i < 2; i++) spawnShadow(true);
    renderStats();
  }
  function setScene(key, instant) {
    S.scene = key; S.nextScene = S.t + rnd(90, 150);
    const [front, back] = sceneEls[0].classList.contains('on') ? [sceneEls[1], sceneEls[0]] : [sceneEls[0], sceneEls[1]];
    front.src = img(`fishing/scene-${key}.jpg`);
    if (instant) { front.style.transition = 'none'; back.style.transition = 'none'; }
    front.classList.add('on'); back.classList.remove('on');
    if (instant) { void front.offsetWidth; front.style.transition = ''; back.style.transition = ''; }
    $('#fishSceneName').textContent = `水下 · ${FISH_SCENES[key]}`;
  }
  // 天气：独立于水下光景，每隔 70～130 秒（只算未暂停的时间）随机换一种
  function setWeather(key, quiet) {
    S.weather = key; S.nextWeather = S.t + rnd(70, 130);
    const w = WEATHERS[key];
    $('#fishWeather').innerHTML = `<b>${w.icon} ${w.name}</b><span>${w.text}</span>`;
    $('#fishWeather').dataset.weather = key;
    if (!quiet) {
      texts.push({ x: W / 2, y: H * .36, s: `天气变化：${w.icon} ${w.name}`, c: '#ffe8a8', t: 0, life: 2.4, size: 48 });
      texts.push({ x: W / 2, y: H * .36 + 54 * k, s: w.text, c: '#ffffff', t: 0, life: 2.4, size: 28 });
      if (key === 'storm') flash = 1;
    }
  }
  const curWeather = () => (S && WEATHERS[S.weather]) || NO_WEATHER;
  function nextScene() {
    const keys = Object.keys(FISH_SCENES).filter(x => x !== S.scene);
    setScene(keys[Math.floor(Math.random() * keys.length)]);
  }

  // ---------- 生成 ----------
  function spawnFish(initial) {
    const b = fishBonus(), c = fishRoll(b, curWeather()), r = c.r;
    const R = (r === 5 ? 118 : r === 4 ? 100 : 86) * k;
    const dir = Math.random() < .5 ? 1 : -1;
    const speed = (r === 5 ? rnd(200, 250) : r === 4 ? rnd(140, 190) : rnd(95, 140)) * k;
    const x = initial ? rnd(380, 1620) * k : dir > 0 ? -R * 1.6 : W + R * 1.6;
    const y = rnd(260, 760) * k;
    fishes.push({ c, r, R, x, y, y0: y, vx: dir * speed, speed, ph: rnd(0, 6.28), amp: rnd(14, 44) * k, state: 'swim', s: 1, a: 1, t: 0 });
    headOf(c);
  }
  function spawnShadow(initial) {
    const names = ['shadow-whale', 'shadow-fish', 'shadow-fish2'], n = names[Math.floor(Math.random() * names.length)];
    const dir = Math.random() < .5 ? 1 : -1, w = (n === 'shadow-whale' ? rnd(420, 560) : rnd(200, 300)) * k;
    shadows.push({ n, w, dir, x: initial ? rnd(200, 1800) * k : dir > 0 ? -w : W + w, y: rnd(260, 900) * k, vx: dir * rnd(28, 55) * k, ph: rnd(0, 6.28) });
  }

  // ---------- 撒网 ----------
  function cast(x, y) {
    if (!S || paused) return;
    const b = fishBonus(), cost = fishCost(b);
    if (S.t < S.cooldownUntil) { texts.push({ x, y, s: '冷却中', c: '#cfe6ff', t: 0, life: .7, size: 26 }); return; }
    if (state.rice < cost) { toast(`米饭不足，撒一网需要 ${cost} 米饭`); return; }
    if (y > 1000 * k) y = 1000 * k;
    state.rice -= cost; S.spent += cost; S.casts++; S.cooldownUntil = S.t + fishCooldown(b);
    save(); renderHud(); renderStats();
    const P = PIVOT(), ang = Math.atan2(y - P.y, x - P.x);
    const tip = { x: P.x + Math.cos(ang) * BARREL_LEN * .82 * k, y: P.y + Math.sin(ang) * BARREL_LEN * .82 * k };
    const dist = Math.hypot(x - tip.x, y - tip.y);
    shells.push({ x0: tip.x, y0: tip.y, x1: x, y1: y, t: 0, dur: Math.min(.55, Math.max(.18, dist / (2000 * k))), spin: rnd(-6, 6) });
    recoil = 1; aim = { x, y };
    SFX.whoosh();
  }
  function openNet(x, y) {
    const b = fishBonus(), R = 125 * (1 + (b.net || 0)) * k;
    const net = { x, y, R, t: 0, caught: 0, escaped: 0, done: false };
    nets.push(net);
    SFX.splash();
    for (let i = 0; i < 26; i++) {
      const a = rnd(0, Math.PI * 2), v = rnd(60, 220) * k;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, dec: rnd(1.4, 2.4), sz: rnd(2, 5) * k, rgb: '210,240,255' });
    }
    for (const f of fishes) {
      if (f.state !== 'swim' || Math.hypot(f.x - x, f.y - y) > R + f.R * .45) continue;
      if (Math.random() < fishEscape(f.r, b, curWeather())) {
        f.state = 'escape'; f.t = 0; net.escaped++; S.escaped++;
        const away = Math.atan2(f.y - y, f.x - x);
        f.vx = Math.cos(away) * 760 * k; f.vy = Math.sin(away) * 760 * k;
        texts.push({ x: f.x, y: f.y - f.R, s: '逃走了！', c: f.r === 5 ? '#ffd76a' : f.r === 4 ? '#e2c6ff' : '#cfe6ff', t: 0, life: 1.1, size: 30 });
        SFX.escape();
      } else {
        f.state = 'caught'; f.t = 0; f.net = net; f.x0 = f.x; f.y0c = f.y; net.caught++;
      }
    }
    renderStats();
  }
  function landCatch(f) {
    const b = fishBonus(), reward = fishReward(f.r, b);
    const isNew = !state.owned[f.c.id];
    state.owned[f.c.id] = (state.owned[f.c.id] || 0) + 1;     // 捞到的角色进入角色仓库（不写求索记录）
    state.rice += reward; S.earned += reward; S.caught[f.r]++;
    if (f.r === 5) S.fives.push(f.c.name);
    save(); renderHud(true); renderStats();
    texts.push({ x: f.x, y: f.y - 30 * k, s: `+${reward}`, c: f.r === 5 ? '#ffd76a' : f.r === 4 ? '#e9d2ff' : '#ffffff', t: 0, life: 1.3, size: f.r === 5 ? 46 : 36 });
    flyRice(f.x, f.y);
    feed(f, reward, isNew);
    const rgb = RC[f.r];
    for (let i = 0; i < (f.r === 5 ? 90 : f.r === 4 ? 40 : 16); i++) {
      const a = rnd(0, Math.PI * 2), v = rnd(80, f.r === 5 ? 520 : 300) * k;
      parts.push({ x: f.x, y: f.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, dec: rnd(.8, 1.6), sz: rnd(2, 6) * k, rgb });
    }
    if (f.r === 5) { SFX.gold(); flashEl(.45, 'radial-gradient(circle, rgba(255,226,140,.9), rgba(255,190,70,.35) 55%, transparent)'); }
    else if (f.r === 4) SFX.purple();
    SFX.coin();
  }
  function flyRice(x, y) {
    const target = $('#fishRiceNum').getBoundingClientRect(), base = stage.getBoundingClientRect(), r = cv.getBoundingClientRect();
    const el = document.createElement('img');
    el.className = 'fish-fly'; el.src = img('icons/rice.png');
    el.style.left = (r.left - base.left + x - 24 * k) + 'px'; el.style.top = (r.top - base.top + y - 24 * k) + 'px';
    stage.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${target.left - r.left - x + target.width / 2}px, ${target.top - r.top - y + target.height / 2}px) scale(.6)`;
      el.style.opacity = '.2';
    });
    setTimeout(() => el.remove(), 800);
  }
  function feed(f, reward, isNew) {
    const box = $('#fishFeed'), item = document.createElement('div');
    item.className = 'fish-feed-item r' + f.r; item.style.setProperty('--rc', RC[f.r]);
    item.innerHTML = `<img src="${charSrc(f.c.id)}" alt=""><b>${f.c.name}</b>${isNew ? '<i>NEW</i>' : ''}<em>+${reward}</em>`;
    box.prepend(item);
    while (box.children.length > 5) box.lastChild.remove();
    setTimeout(() => { item.classList.add('out'); setTimeout(() => item.remove(), 400); }, 6000);
  }

  // ---------- 更新 ----------
  function update(dt) {
    S.t += dt;
    if (S.t >= S.nextScene) nextScene();
    if (S.t >= S.nextWeather) setWeather(pickWeather(S.weather));
    const b = fishBonus(), wx = curWeather(), slow = (1 - (b.sleep || 0)) * wx.speed;
    spawnIn -= dt;
    if (spawnIn <= 0) { if (fishes.filter(f => f.state === 'swim').length < 9) spawnFish(false); spawnIn = rnd(.5, 1.3); }
    shadowIn -= dt;
    if (shadowIn <= 0) { if (shadows.length < 3) spawnShadow(false); shadowIn = rnd(4, 9); }
    for (const sh of shadows) { sh.x += sh.vx * dt; sh.ph += dt; }
    shadows = shadows.filter(sh => sh.x > -sh.w * 1.2 && sh.x < W + sh.w * 1.2);
    for (const f of fishes) {
      f.t += dt;
      if (f.state === 'swim') {
        f.x += f.vx * slow * dt;
        f.y = f.y0 + Math.sin(f.ph + f.t * 1.7) * f.amp;
        if (f.r === 5 && Math.random() < .6) parts.push({ x: f.x - Math.sign(f.vx) * f.R * .8, y: f.y + rnd(-f.R, f.R) * .4, vx: -f.vx * .1, vy: rnd(-20, 20) * k, life: 1, dec: 1.8, sz: rnd(2, 4) * k, rgb: '255,214,110' });
      } else if (f.state === 'escape') {
        // 被惊开后冲出一段，减速，再回到池子里正常游动，可以继续捞
        const damp = Math.pow(.04, dt);
        f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= damp; f.vy *= damp;
        if (f.t > .7) {
          f.x = Math.min(W - f.R, Math.max(f.R, f.x));
          f.y = Math.min(780 * k, Math.max(240 * k, f.y));
          const dir = f.x < W * .2 ? 1 : f.x > W * .8 ? -1 : Math.sign(f.vx) || 1;
          f.state = 'swim'; f.vx = dir * f.speed; f.y0 = f.y; f.t = 0; f.ph = 0;
        }
      } else if (f.state === 'caught') {
        const u = ease(f.t / .45);
        f.x = f.x0 + (f.net.x - f.x0) * u; f.y = f.y0c + (f.net.y - f.y0c) * u; f.s = 1 - u * .55;
        if (f.t >= .45 && !f.landed) { f.landed = true; landCatch(f); }
        f.a = f.t > .45 ? Math.max(0, 1 - (f.t - .45) / .3) : 1;
      }
    }
    fishes = fishes.filter(f => f.state === 'swim' ? f.x > -f.R * 3 && f.x < W + f.R * 3 : f.a > 0);
    for (const s of shells) {
      s.t += dt;
      if (s.t >= s.dur && !s.done) { s.done = true; openNet(s.x1, s.y1); }
      if (!s.done && Math.random() < .9) {
        const u = s.t / s.dur, x = s.x0 + (s.x1 - s.x0) * u, y = s.y0 + (s.y1 - s.y0) * u;
        parts.push({ x, y, vx: rnd(-30, 30) * k, vy: rnd(-30, 30) * k, life: 1, dec: 2.6, sz: rnd(3, 6) * k, rgb: '180,225,255' });
      }
    }
    shells = shells.filter(s => !s.done);
    for (const n of nets) n.t += dt;
    nets = nets.filter(n => n.t < 1.3);
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.life -= p.dec * dt; }
    parts = parts.filter(p => p.life > 0);
    if (Math.random() < .35) parts.push({ x: rnd(0, W), y: H + 10, vx: rnd(-8, 8) * k, vy: -rnd(40, 90) * k, life: 1, dec: .18, sz: rnd(1.5, 3.5) * k, rgb: '220,245,255', bubble: true });
    // 雨点在水面上的涟漪
    const rainRate = S.weather === 'storm' ? 26 : S.weather === 'drizzle' ? 9 : 0;
    if (rainRate && Math.random() < rainRate * dt) rains.push({ x: rnd(0, W), y: rnd(0, H), t: 0, life: rnd(.8, 1.4), r: rnd(18, 46) * k });
    for (const r of rains) r.t += dt;
    rains = rains.filter(r => r.t < r.life);
    if (S.weather === 'storm' && Math.random() < dt / 7) flash = 1;      // 雷暴：平均 7 秒一道闪电
    flash = Math.max(0, flash - dt * 2.5);
    for (const t of texts) t.t += dt;
    texts = texts.filter(t => t.t < t.life);
    recoil = Math.max(0, recoil - dt * 5);
    $('#fishTimer').textContent = fmtTime(S.t);
  }

  // ---------- 绘制 ----------
  function glow(x, y, r, rgb, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  function drawImg(im, x, y, w, rot = 0, alpha = 1, flip = false) {
    if (!ok(im)) return;
    const h = w * im.naturalHeight / im.naturalWidth;
    g.save(); g.globalAlpha = alpha; g.translate(x, y); if (rot) g.rotate(rot); if (flip) g.scale(-1, 1);
    g.drawImage(im, -w / 2, -h / 2, w, h); g.restore();
  }
  function caustics(now) {
    // 水面光斑：几团缓慢游走的柔光，夜晚和浑水更暗
    const dim = S.scene === 'night' ? .35 : S.scene === 'murk' ? .45 : 1;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = W * (.5 + .45 * Math.sin(now / 9000 + i * 1.7)), y = H * (.45 + .38 * Math.cos(now / 11000 + i * 2.3));
      glow(x, y, (180 + 60 * Math.sin(now / 3000 + i)) * k, '200,240,255', .05 * dim);
    }
    if (S.scene === 'night') {
      for (let i = 0; i < 18; i++) {
        const x = W * ((i * .137 + now / 90000) % 1), y = H * (.15 + ((i * .271) % .8)), tw = .5 + .5 * Math.sin(now / 500 + i * 3);
        glow(x, y, 7 * k, '120,255,220', .5 * tw);
      }
    }
    g.globalCompositeOperation = 'source-over';
  }
  function drawFish(f, now) {
    const R = f.R * f.s, x = f.x, y = f.y;
    g.save(); g.globalAlpha = f.a;
    if (f.r >= 4) { g.globalCompositeOperation = 'lighter'; glow(x, y, R * (f.r === 5 ? 2.1 : 1.6), RC[f.r], f.r === 5 ? .55 : .35); g.globalCompositeOperation = 'source-over'; }
    const im = headOf(f.c);
    if (ok(im)) {
      g.save(); g.beginPath(); g.arc(x, y, R * .7, 0, Math.PI * 2); g.clip();
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fill();
      const sw = im.naturalWidth * .78, sx = im.naturalWidth * .11;
      g.drawImage(im, sx, 0, sw, sw, x - R * .78, y - R * .72, R * 1.56, R * 1.56);
      g.restore();
    }
    drawImg(IMG['bubble-' + f.r], x, y, R * 2.25, Math.sin(now / 900 + f.ph) * .15, 1);
    g.restore();
  }
  function drawWeather(now, layer) {
    const wk = S.weather;
    if (layer === 'under') {
      if (wk === 'clear') {
        // 晴朗：从左上斜照下来的几道光柱
        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
          const x = W * (.18 + i * .2 + .03 * Math.sin(now / 4000 + i)), a = .06 + .03 * Math.sin(now / 1800 + i * 2);
          const gr = g.createLinearGradient(x, 0, x + W * .12, H);
          gr.addColorStop(0, `rgba(255,248,215,${a})`); gr.addColorStop(1, 'rgba(255,248,215,0)');
          g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 90 * k, 0); g.lineTo(x + W * .16, H); g.lineTo(x + W * .1, H); g.closePath(); g.fill();
        }
        g.globalCompositeOperation = 'source-over';
      } else if (wk === 'calm') {
        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 14; i++) {
          const x = W * ((i * .173 + now / 60000) % 1), y = H * (.2 + ((i * .311) % .65)), a = .25 + .25 * Math.sin(now / 700 + i * 2);
          glow(x, y, 9 * k, '255,250,225', a);
        }
        g.globalCompositeOperation = 'source-over';
      }
      return;
    }
    // 盖在鱼上面的一层
    if (wk === 'drizzle' || wk === 'storm') {
      if (wk === 'storm') { g.fillStyle = 'rgba(4,12,32,.28)'; g.fillRect(0, 0, W, H); }
      g.lineWidth = 2.6 * k;
      for (const r of rains) {
        const u = r.t / r.life;
        g.strokeStyle = `rgba(235,247,255,${.85 * (1 - u)})`;
        g.beginPath(); g.ellipse(r.x, r.y, r.r * u, r.r * u * .6, 0, 0, Math.PI * 2); g.stroke();
        if (u > .25) { g.beginPath(); g.ellipse(r.x, r.y, r.r * (u - .25), r.r * (u - .25) * .6, 0, 0, Math.PI * 2); g.stroke(); }
      }
    } else if (wk === 'fog') {
      g.fillStyle = 'rgba(225,232,240,.24)'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) {
        const x = W * ((i * .27 + now / 70000) % 1.2 - .1), y = H * (.25 + i * .13);
        const gr = g.createRadialGradient(x, y, 0, x, y, 380 * k);
        gr.addColorStop(0, 'rgba(240,244,248,.28)'); gr.addColorStop(1, 'rgba(240,244,248,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, 380 * k, 0, Math.PI * 2); g.fill();
      }
    }
    if (flash > 0) { g.fillStyle = `rgba(235,242,255,${flash * .55})`; g.fillRect(0, 0, W, H); }
  }
  function draw(now) {
    g.clearRect(0, 0, W, H);
    caustics(now);
    drawWeather(now, 'under');
    for (const sh of shadows) drawImg(IMG[sh.n], sh.x, sh.y + Math.sin(sh.ph * .8) * 12 * k, sh.w, 0, .55, sh.dir < 0);
    for (const n of nets) {
      const open = ease(n.t / .18), fade = n.t > .75 ? Math.max(0, 1 - (n.t - .75) / .5) : 1;
      const im = n.t < .5 ? IMG['net-open'] : n.caught ? IMG['net-full'] : n.escaped ? IMG['net-torn'] : IMG['net-open'];
      const sc = n.caught && n.t > .5 ? 1 - (n.t - .5) * .5 : 1;
      drawImg(im, n.x, n.y, n.R * 2.1 * open * sc, n.t * .4, .85 * fade);
    }
    for (const f of fishes) drawFish(f, now);
    drawWeather(now, 'over');
    g.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      if (p.bubble) { g.strokeStyle = `rgba(${p.rgb},${.35 * p.life})`; g.lineWidth = 1.2 * k; g.beginPath(); g.arc(p.x, p.y, p.sz, 0, Math.PI * 2); g.stroke(); }
      else glow(p.x, p.y, p.sz * 2.4, p.rgb, p.life);
    }
    g.globalCompositeOperation = 'source-over';
    for (const s of shells) {
      const u = s.t / s.dur, x = s.x0 + (s.x1 - s.x0) * u, y = s.y0 + (s.y1 - s.y0) * u - Math.sin(u * Math.PI) * 40 * k;
      drawImg(IMG['net-shell'], x, y, (90 + 40 * u) * k, s.t * s.spin);
    }
    // 发射器：底座 + 跟随瞄准方向转动的饭勺炮管，底座外圈画冷却进度
    const P = PIVOT(), ang = Math.atan2(aim.y - P.y, aim.x - P.x), rot = Math.max(-1.35, Math.min(1.35, ang + Math.PI / 2));
    drawImg(IMG['launcher-base'], P.x, P.y + 40 * k, 270 * k);
    const bar = IMG['launcher-barrel'];
    if (ok(bar)) {
      const bh = BARREL_LEN * k, bw = BARREL_W * k;
      g.save(); g.translate(P.x, P.y); g.rotate(rot);
      g.drawImage(bar, -bw / 2, -bh * .9 + recoil * 22 * k, bw, bh); g.restore();
    }
    const cdLeft = Math.max(0, S.cooldownUntil - S.t), cdTotal = fishCooldown(fishBonus());
    if (cdLeft > 0) {
      g.strokeStyle = 'rgba(255,226,150,.9)'; g.lineWidth = 6 * k; g.lineCap = 'round';
      g.beginPath(); g.arc(P.x, P.y + 40 * k, 132 * k, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cdLeft / cdTotal)); g.stroke();
    }
    g.textAlign = 'center';
    for (const t of texts) {
      const u = t.t / t.life;
      g.globalAlpha = 1 - Math.max(0, u - .6) / .4;
      g.font = `700 ${t.size * k}px "STSong","Songti SC","SimSun",serif`;
      g.lineWidth = 5 * k; g.strokeStyle = 'rgba(6,24,48,.85)';
      g.strokeText(t.s, t.x, t.y - u * 60 * k); g.fillStyle = t.c; g.fillText(t.s, t.x, t.y - u * 60 * k);
    }
    g.globalAlpha = 1;
  }

  function frame(now) {
    raf = 0;
    if (!active) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (!paused) update(dt);
    draw(now);
    raf = requestAnimationFrame(frame);
  }

  // ---------- 界面 ----------
  function renderStats() {
    if (!S) return;
    const net = S.earned - S.spent;
    $('#fishStats').textContent = `撒网 ${S.casts} · 捞到 3★×${S.caught[3]} 4★×${S.caught[4]} 5★×${S.caught[5]} · 逃走 ${S.escaped} · 本局 ${net >= 0 ? '+' : ''}${net}`;
  }
  function renderGear() {
    const w = WEAPONS.find(w => w.id === state.fishGear && state.owned[w.id]);
    const im = $('#fishGearImg');
    if (w) im.src = itemSrc(w); else im.removeAttribute('src');
    $('#fishGearEmpty').style.display = w ? 'none' : '';
    $('#fishPerks').innerHTML = w ? `<b>${'★'.repeat(w.r)} ${w.name}</b>${perkRows(w.fish)}` : '<div class="none">装备栏为空：点左边的格子，装上武器池抽到的武器，获得捕鱼加成。</div>';
  }
  function setPaused(v) {
    paused = v;
    root.classList.toggle('paused', v);
    const btn = $('#fishPauseBtn');
    btn.querySelector('img').src = img(`fishing/btn-${v ? 'resume' : 'pause'}.png`);
    btn.querySelector('span').textContent = v ? '继续' : '暂停';
    btn.title = v ? '继续' : '暂停';
    btn.setAttribute('aria-label', btn.title);
  }

  return {
    resize,
    enter() {
      active = true; resize();
      if (!S) newSession();
      renderGear(); renderStats(); setPaused(false);
      last = 0; if (!raf) raf = requestAnimationFrame(frame);
    },
    leave() { active = false; setPaused(true); cancelAnimationFrame(raf); raf = 0; },
    end() { S = null; },
    restart() { newSession(); setPaused(false); },
    togglePause() { setPaused(!paused); },
    pauseForModal() { if (!paused) { autoPaused = true; setPaused(true); } },
    resumeAfterModal() { if (autoPaused && active) { autoPaused = false; setPaused(false); } },
    get paused() { return paused; },
    get session() { return S; },
    get fishes() { return fishes; },          // 只读，用于检查与调试
    get weather() { return curWeather(); },
    setWeather(key) { if (S && WEATHERS[key]) setWeather(key); },
    aimAt(x, y) { aim = { x, y }; },
    cast,
    renderGear,
  };
})();

function openFishInfo() {
  const b = fishBonus(), w = FISHING.weather;
  openModal('深海捞饭 · 玩法说明', `
    <div class="sec">怎么玩</div>
    <div>· 点击水中任意位置，发射器朝那里打出网弹，网弹到达后张开，网里的角色会被捞起<br>
      · 每撒一网消耗 ${fishCost(b)} 米饭，冷却 ${fishCooldown(b)} 秒；捞到就获得米饭，不限时间，可随时暂停、结算<br>
      · 捞到的角色会进入<b>角色仓库</b>，同时获得米饭；被惊开逃走的角色还留在水里，可以继续捞<br>
      · 水下光景会随时间在清晨、白天、黄昏、夜晚、浑水之间变化</div>
    <div class="sec">出现概率与收获</div>
    <table class="rate-table"><tr><th>星级</th><th>出现概率</th><th>逃脱率</th><th>捞到获得</th></tr>
      ${[5, 4, 3].map(r => `<tr><td class="stars-s">${'★'.repeat(r)}</td><td>${r === 3 ? '其余' : pct((r === 5 ? FISH_RATE5 : FISH_RATE4) * (1 + (b.lure || 0)) * w.rare)}</td><td>${pct(fishEscape(r, b, w))}</td><td>${fishReward(r, b)} 米饭</td></tr>`).join('')}</table>
    <div class="note">出现概率与角色池的长期比例一致；出 5★ 时 50% 是 DS娘。表中数字已计入当前天气和装备的加成。</div>
    <div class="sec">天气</div>
    <table class="rate-table"><tr><th>天气</th><th>效果</th></tr>
      ${Object.entries(WEATHERS).map(([key, x]) => `<tr${key === (FISHING.session && FISHING.session.weather) ? ' style="background:#fff6dc"' : ''}><td>${x.icon} ${x.name}</td><td>${x.text}</td></tr>`).join('')}</table>
    <div class="note">天气每隔一两分钟随机变化，当前天气显示在左上角。</div>
    <div class="sec">当前装备加成</div>
    <div>${Object.keys(b).length ? perkRows(b) : '未装备武器。'}</div>`);
}

function openFishGear() {
  const owned = WEAPONS.filter(w => state.owned[w.id]).sort((a, b) => b.r - a.r);
  const cur = state.fishGear;
  openModal('捕鱼装备栏', owned.length ? `
    <div class="note" style="margin-bottom:calc(14*var(--u))">只能装备 1 把武器；武器来自武器活动求索，装备后立即生效。</div>
    <div class="gear-list">${owned.map(w => `
      <button class="gear-card${w.id === cur ? ' on' : ''}" data-act="fish-equip" data-id="${w.id === cur ? '' : w.id}">
        ${w.id === cur ? '<span class="tagline">已装备 · 点击卸下</span>' : ''}
        <img src="${itemSrc(w)}" alt=""><span><b>${'★'.repeat(w.r)} ${w.name}</b>${perkRows(w.fish)}</span></button>`).join('')}</div>`
    : `<div class="empty">还没有武器。去「武器活动求索」抽一把，就能装进来获得捕鱼加成。</div>
       <div class="row"><button class="btn dark" data-act="fish-go-weapon">前往武器活动求索</button></div>`);
}

function openFishSettle() {
  const S = FISHING.session;
  if (!S) { showView('gacha'); return; }
  FISHING.pauseForModal();
  const net = S.earned - S.spent;
  openModal('本局结算', `
    <div class="fish-summary">
      <div><small>捕鱼时长</small><b>${fmtTime(S.t)}</b></div>
      <div><small>撒网次数</small><b>${S.casts}</b></div>
      <div><small>逃走</small><b>${S.escaped}</b></div>
      <div><small>捞到 3★ / 4★ / 5★</small><b>${S.caught[3]} / ${S.caught[4]} / ${S.caught[5]}</b></div>
      <div><small>消耗 / 获得米饭</small><b>${S.spent} / ${S.earned}</b></div>
      <div><small>本局净收益</small><b class="${net >= 0 ? 'gain' : 'loss'}">${net >= 0 ? '+' : ''}${net}</b></div>
    </div>
    ${S.fives.length ? `<div style="text-align:center;color:#b7811c">本局捞到的 5★：${S.fives.join('、')}</div>` : ''}
    <div class="row"><button class="btn" data-act="fish-resume">继续捕鱼</button><button class="btn" data-act="fish-restart">再来一局</button><button class="btn dark" data-act="fish-exit">结束并返回求索</button></div>`, true);
}

/* ================= 角色池首页：当期 UP 展示 ================= */
// UP 立绘居中，其余 5★ 装在金色泡泡里围着漂浮；后面一层画布画金色粒子光
const UP_SHOWCASE = (() => {
  const root = $('#charShowcase'), cv = root.querySelector('.cs-fx'), g = cv.getContext('2d');
  // 泡泡位置：相对展示框（700×800）的中心点，左、上、右各三个，避开右侧的 UP 铭牌
  const SLOTS = [[70, 300], [52, 490], [96, 676], [196, 112], [350, 56], [504, 112], [584, 236], [586, 470], [566, 676]];
  let raf = 0, motes = [], sparks = [], W = 1, H = 1, dpr = 1, last = 0;
  function build() {
    const up = upOf(POOLS.char), rest = byR(CHARS, 5).filter(c => c !== up);
    root.querySelector('.cs-up img').src = charSrc(up.id);
    root.querySelector('.cs-up img').alt = up.name;
    root.querySelector('.cs-bubbles').innerHTML = rest.slice(0, SLOTS.length).map((c, i) => {
      const [x, y] = SLOTS[i];
      return `<button class="cs-bubble" data-act="owned-detail" data-id="${c.id}" title="${c.name}" aria-label="${c.name}"
        style="left:calc(${x} * var(--u));top:calc(${y} * var(--u));--dur:${(4.2 + (i % 4) * .7).toFixed(1)}s;--delay:${(-i * .63).toFixed(2)}s;--dx:${i % 2 ? 8 : -8}">
        <span class="head"><img src="${charSrc(c.id)}" alt=""></span><img class="ring" src="${img('fishing/bubble-5.png')}" alt=""></button>`;
    }).join('');
  }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth || 1; H = cv.clientHeight || 1;
    cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const visible = () => currentView === 'gacha' && pool.key === 'char' && !document.hidden && !$('#fx').classList.contains('on');
  function glow(x, y, r, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,220,130,${a})`); gr.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  function frame(now) {
    raf = 0;
    if (!visible()) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (cv.clientWidth !== W) resize();
    const k = W / 820, cx = W / 2, cy = H * .62;           // 画布比展示框四周各大 60
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    // 身后的光晕，随呼吸明灭
    glow(cx, cy, 300 * k, .22 + .06 * Math.sin(now / 900));
    glow(cx, cy + 60 * k, 180 * k, .25);
    // 上升的金色光尘
    while (motes.length < 70) motes.push({ x: cx + (Math.random() - .5) * 420 * k, y: H * (.3 + Math.random() * .75), v: (18 + Math.random() * 40) * k, r: (1.5 + Math.random() * 3.5) * k, ph: Math.random() * 6.28, life: 1 });
    for (const m of motes) {
      m.y -= m.v * dt; m.ph += dt * 2; m.life -= dt * .18;
      const a = Math.max(0, Math.min(1, m.life * 2)) * (.5 + .5 * Math.sin(m.ph));
      glow(m.x + Math.sin(m.ph) * 8 * k, m.y, m.r * 3, .9 * a);
    }
    motes = motes.filter(m => m.life > 0 && m.y > -10);
    // 偶尔闪一颗十字星
    if (Math.random() < dt * 3) sparks.push({ x: cx + (Math.random() - .5) * 520 * k, y: H * (.15 + Math.random() * .7), t: 0, s: (8 + Math.random() * 14) * k });
    for (const s of sparks) {
      s.t += dt; const a = Math.sin(Math.min(1, s.t / .7) * Math.PI), r = s.s * a;
      g.strokeStyle = `rgba(255,236,170,${a})`; g.lineWidth = 1.6 * k;
      g.beginPath(); g.moveTo(s.x - r, s.y); g.lineTo(s.x + r, s.y); g.moveTo(s.x, s.y - r); g.lineTo(s.x, s.y + r); g.stroke();
      glow(s.x, s.y, r * .9, .7 * a);
    }
    sparks = sparks.filter(s => s.t < .7);
    g.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }
  function refresh() { if (visible() && !raf) { resize(); last = 0; raf = requestAnimationFrame(frame); } }
  build();
  document.addEventListener('visibilitychange', refresh);
  return { refresh, resize };
})();

/* ================= 卡池切换 ================= */
// 先按原图尺寸拼合各图层，再整体缩放，避免切片边缘各自重采样产生接缝。
async function prepareWeaponUI() {
  const scene = $('.weapon-scene'), output = scene.querySelector('.weapon-composite');
  const layers = [...scene.querySelectorAll('[data-layer]')];
  try {
    await Promise.all(layers.map(layer => layer.decode()));
    const canvas = document.createElement('canvas');
    canvas.width = 2048; canvas.height = 1152;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    layers.forEach(layer => ctx.drawImage(layer, +layer.dataset.x, +layer.dataset.y));
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    try {
      output.src = url;
      await output.decode();
      scene.classList.add('ready');
    } finally { URL.revokeObjectURL(url); }
  } catch (e) { /* 图层未就绪时继续使用同一张原图，保证页面可用。 */ }
}
function applyPool() {
  stage.classList.toggle('pool-weapon', pool.key === 'weapon');
  $('#gachaView').setAttribute('aria-label', pool.tab);
  $('#gachaView h1').textContent = pool.tab;
  if (currentView === 'gacha') document.title = `${pool.banner} · ${pool.tab}`;
  if (typeof UP_SHOWCASE !== 'undefined') UP_SHOWCASE.refresh();
  document.querySelectorAll('#gachaView [data-act="preview"]').forEach(b => { b.title = `查看 UP ${pool.noun}`; b.setAttribute('aria-label', b.title); });
  renderHud();
}
function switchPool(key) {
  if (busy || !Object.hasOwn(POOLS, key)) return;
  if (pool.key === key) { toast(`当前卡池：${pool.tab} · ${pool.banner}`); return; }
  pool = POOLS[key]; state.pool = key; save();
  applyPool();
  SFX.whoosh();
  toast(`已切换到「${pool.tab} · ${pool.banner}」`);
}

const fishCanvas = $('#fishCanvas');
const fishPoint = e => { const r = fishCanvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
fishCanvas.addEventListener('pointermove', e => FISHING.aimAt(...fishPoint(e)));
fishCanvas.addEventListener('pointerdown', e => { if (e.button > 0) return; FISHING.aimAt(...fishPoint(e)); FISHING.cast(...fishPoint(e)); });
document.addEventListener('visibilitychange', () => { if (document.hidden && currentView === 'fishing' && !FISHING.paused) FISHING.togglePause(); });

addEventListener('resize', fit);
fit();
applyPool();
prepareWeaponUI();
// 预加载
[...CHARS, ...WEAPONS].forEach(c => { const i = new Image(); i.src = itemSrc(c); });
