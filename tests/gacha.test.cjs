'use strict';

// 用 Node 内置测试运行器检查实际 app.js 中的规则，无需安装依赖。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const rules = source.slice(0, source.indexOf('/* ================= 舞台缩放'));
const roll = source.slice(source.indexOf('function rollOne()'), source.indexOf('let busy = false;'));

function game(saved = {}) {
  let stored = JSON.stringify(saved);
  const context = vm.createContext({
    localStorage: { getItem: () => stored, setItem: (key, value) => { stored = value; } },
    Math: Object.create(Math),
  });
  vm.runInContext(rules + roll + '\nglobalThis.api = { state, rate5, softPity, pityStats, validPity, save, clearCollection };', context);
  context.api.random = (...numbers) => { context.Math.random = () => numbers.length ? numbers.shift() : .5; };
  context.api.roll = () => vm.runInContext('rollOne()', context);
  context.api.pool = key => {
    assert.ok(key === 'char' || key === 'weapon');
    vm.runInContext(`pool = POOLS['${key}']; state.pool = pool.key;`, context);
  };
  context.api.saved = () => JSON.parse(stored);
  return context.api;
}

test('任意受支持保底的分段、单调性、硬保底和输入边界', () => {
  const g = game();
  for (let n = 1; n <= 10000; n++) {
    const soft = g.softPity(n);
    assert.ok(soft >= 0 && soft < n);
    assert.equal(g.rate5(n, n), 1);
    assert.equal(g.rate5(n + 1, n), 1);
    if (soft) assert.equal(g.rate5(soft, n), .0008);
    const probes = [...new Set([1, Math.max(1, soft), soft + 1, Math.max(1, n - 1), n])].sort((a, b) => a - b);
    let previous = 0;
    for (const k of probes) {
      const p = g.rate5(k, n);
      assert.ok(p >= previous && p >= .0008 && p <= 1, `${n} 抽保底的第 ${k} 抽`);
      previous = p;
    }
  }
  for (const n of [0, -1, 90.5, 10001, NaN, Infinity, '90', null]) assert.equal(g.validPity(n), false);
  for (const n of [1, 90, 350, 10000]) assert.equal(g.validPity(n), true);
});

test('90 抽配置的第 70、71、89、90 抽及理论综合概率', () => {
  const g = game();
  assert.equal(g.softPity(90), 70);
  for (let n = 1; n <= 70; n++) assert.equal(g.rate5(n, 90), .0008);
  assert.ok(Math.abs(g.rate5(71, 90) - .05076) < 1e-12);
  assert.ok(Math.abs(g.rate5(89, 90) - .95004) < 1e-12);
  assert.equal(g.rate5(90, 90), 1);
  assert.ok(Math.abs(g.pityStats(90).mean - 73.09664120146422) < 1e-10);
  assert.ok(Math.abs(g.pityStats(90).overall - .01368051915332012) < 1e-12);
});

test('用首次出金分布独立复核平均抽数和概率总和', () => {
  const g = game();
  for (const hard of [1, 2, 9, 30, 90, 120, 350, 1000, 10000]) {
    let surviving = 1, totalProbability = 0, expected = 0;
    for (let n = 1; n <= hard; n++) {
      const firstSuccess = surviving * g.rate5(n, hard);
      totalProbability += firstSuccess;
      expected += n * firstSuccess;
      surviving -= firstSuccess;
    }
    assert.ok(Math.abs(totalProbability - 1) < 1e-11);
    assert.ok(Math.abs(expected - g.pityStats(hard).mean) < 1e-8);
  }
});

test('旧存档保留角色、重复数量、货币和超出新保底的计数', () => {
  const g = game({ rice: 15000, whale: 27, pity5: 300, pity4: 9, total: 800, owned: { ds: 3, kimi: 90 }, first6480: 1 });
  assert.equal(g.state.hardPity, 90);
  assert.equal(g.state.pity5, 300);
  assert.equal(g.state.rice, 15000);
  assert.equal(g.state.whale, 27);
  assert.equal(g.state.owned.kimi, 90);
  assert.equal(g.state.first6480, 1);
  g.random(0); // 保底出金后，UP 判定取 0，命中 DS娘
  const result = g.roll();
  assert.equal(result.r, 5);
  assert.equal(result.isNew, false);
  assert.equal(g.state.owned.ds, 4);
  assert.equal(g.state.pity5, 0);
  assert.equal(g.state.pity4, 0);
  assert.equal(g.state.total, 801);
  g.save();
  const reloaded = game(g.saved());
  assert.equal(reloaded.state.owned.ds, 4);
  assert.equal(reloaded.state.hardPity, 90);
});

test('基础概率边界、十抽四星保底与首次获得标记', () => {
  const g = game();
  g.random(.000799, 0);
  const five = g.roll();
  assert.equal(five.r, 5);
  assert.equal(five.isNew, true);
  assert.equal(g.state.pity5, 0);
  g.state.pity4 = 9;
  g.random(.0008, 0);
  assert.equal(g.roll().r, 4);
  assert.equal(g.state.pity4, 0);
  g.random(.0008, .1, 0);
  assert.equal(g.roll().r, 3);
});

test('改变保底保留计数，一抽保底与十连中途重置', () => {
  const g = game({ pity5: 89, hardPity: 90 });
  g.random(...Array(11).fill(0)); // 11 次出金都命中 UP
  g.state.hardPity = 30;
  assert.equal(g.state.pity5, 89);
  assert.equal(g.roll().r, 5);
  g.state.hardPity = 1;
  for (let n = 0; n < 10; n++) assert.equal(g.roll().r, 5);
  assert.equal(g.state.owned.ds, 11);
  assert.equal(g.state.total, 11);
  assert.equal(g.state.pity5, 0);
  g.state.hardPity = 90;
  assert.equal(g.rate5(1), .0008);
});

test('仓库不受 500 条记录上限影响，损坏字段使用安全默认值', () => {
  const g = game({ owned: { kimi: 800, ds: -1, invalid: 10 }, history: [{ id: '<invalid>', r: 5, t: 1 }], hardPity: 0, whale: -3, rice: null });
  g.random(.5, .5, 0);
  for (let n = 0; n < 510; n++) g.roll();
  assert.ok(g.state.history.length <= 500);
  assert.ok(g.state.owned.kimi >= 800);
  assert.equal(g.state.owned.invalid, undefined);
  assert.equal(g.state.hardPity, 90);
  assert.equal(g.state.whale, 10);
  assert.equal(g.state.rice, 911);
});

test('武器旧存档保留收藏、历史、独立计数和角色进度', () => {
  const g = game({ pool: 'weapon', wpity5: 89, wpity4: 9, wtotal: 349, pity5: 50, total: 800, owned: { ds: 5, whalefall: 2, baguette: 6 }, history: [{ id: 'whalefall', r: 5, t: 1, n: 100, p: 'weapon' }, { id: 'ds', r: 5, t: 2, n: 700 }] });
  assert.equal(g.state.hardPity, 90);
  assert.equal(g.state.owned.whalefall, 2);
  assert.equal(g.state.history.length, 2);
  g.random(.999, 0);
  const result = g.roll();
  assert.equal(result.id, 'whalefall');
  assert.equal(result.kind, 'weapon');
  assert.equal(result.isNew, false);
  assert.equal(g.state.owned.whalefall, 3);
  assert.equal(g.state.wpity5, 0);
  assert.equal(g.state.wpity4, 0);
  assert.equal(g.state.wtotal, 350);
  assert.equal(g.state.pity5, 50);
  assert.equal(g.state.total, 800);
  assert.equal(g.state.history[0].p, 'weapon');
  g.save();
  const reloaded = game(g.saved());
  assert.equal(reloaded.state.pool, 'weapon');
  assert.equal(reloaded.state.owned.whalefall, 3);
  assert.equal(reloaded.state.owned.ds, 5);
});

test('切池分别累计四星保底，两个池均遵守 0.08% 基础概率', () => {
  const g = game({ pity5: 12, pity4: 9, wpity5: 20, wpity4: 8 });
  g.pool('weapon');
  g.random(.0008, .999, 0);
  assert.equal(g.roll().r, 3);
  assert.equal(g.state.wpity4, 9);
  assert.equal(g.state.pity4, 9);
  g.pool('char');
  g.random(.0008, 0);
  assert.equal(g.roll().r, 4);
  assert.equal(g.state.wpity4, 9);
  g.pool('weapon');
  g.random(.0008, 0);
  assert.equal(g.roll().r, 4);
  g.random(.000799, 0);
  assert.equal(g.roll().r, 5);
});

test('共用保底设置保留双池计数，超过上限各自在下一抽兑现', () => {
  const g = game({ pity5: 89, wpity5: 60, hardPity: 90 });
  g.random(...Array(30).fill(0)); // 角色池出金都命中 UP；武器池只有一个 5 星，不消耗随机数
  g.state.hardPity = 30;
  g.pool('weapon');
  assert.equal(g.roll().r, 5);
  assert.equal(g.state.pity5, 89);
  g.pool('char');
  assert.equal(g.roll().r, 5);
  g.state.hardPity = 1;
  for (const key of ['char', 'weapon']) {
    g.pool(key);
    for (let i = 0; i < 10; i++) assert.equal(g.roll().r, 5);
  }
  assert.equal(g.state.owned.ds, 11);
  assert.equal(g.state.owned.whalefall, 11);
});

test('未知卡池与损坏武器字段安全回退，历史序号只接受正整数', () => {
  const g = game({ pool: '__proto__', wpity5: -2, wpity4: '9', wtotal: null, history: [{ id: 'ds', r: 5, t: 1, p: '__proto__' }, { id: 'whalefall', r: 5, t: 2, p: 'weapon', n: '<img>' }] });
  assert.equal(g.state.pool, 'char');
  assert.equal(g.state.wpity5, 0);
  assert.equal(g.state.wpity4, 0);
  assert.equal(g.state.wtotal, 0);
  assert.equal(g.state.history.length, 1);
  assert.equal(g.state.history[0].n, '');
});

test('角色与武器 ID 不重叠且全部展示素材存在', () => {
  const context = vm.createContext({ localStorage: { getItem: () => null } });
  vm.runInContext(rules + '\nglobalThis.items = ITEMS;', context);
  const ids = context.items.map(c => c.id);
  assert.equal(new Set(ids).size, 38);
  for (const c of context.items) {
    const filename = path.join(__dirname, '..', 'assets', c.kind === 'weapon' ? 'weapons' : 'chars', c.id + '.png');
    assert.ok(fs.existsSync(filename), filename);
  }
});

test('角色星级分层：原 10 名为 5 星，痴呆系列 4 星，小小系列 3 星', () => {
  const context = vm.createContext({ localStorage: { getItem: () => null } });
  vm.runInContext(rules + '\nglobalThis.chars = CHARS;', context);
  const by = r => Array.from(context.chars.filter(c => c.r === r), c => c.id);
  assert.deepEqual(by(5).sort(), ['claude', 'doubao', 'ds', 'gemini', 'gpt', 'grok', 'kimi', 'mistral', 'qwen', 'zhipu']);
  assert.equal(by(4).length, 8);
  assert.ok(by(4).every(id => id.startsWith('daze-')));
  assert.equal(by(3).length, 8);
  assert.ok(by(3).every(id => id.startsWith('mini-')));
});

test('角色池出金：UP 占一半，其余 9 名 5 星平分另一半；武器池只有 UP', () => {
  const g = game({ pity5: 200, wpity5: 200 });
  g.random(.4999);
  assert.equal(g.roll().id, 'ds');
  g.state.pity5 = 200; g.random(.5, 0);
  assert.equal(g.roll().id, 'claude');
  g.state.pity5 = 200; g.random(.5, .9999);
  assert.equal(g.roll().id, 'doubao');
  g.state.pity5 = 200; g.random(.5, .5);
  const mid = g.roll();
  assert.equal(mid.r, 5);
  assert.notEqual(mid.id, 'ds');
  g.pool('weapon');
  g.random(.9999);
  assert.equal(g.roll().id, 'whalefall');
});

test('升为 5 星的角色，旧存档里的 4 星、3 星记录照常读入', () => {
  const g = game({ owned: { claude: 2, kimi: 5 }, history: [{ id: 'claude', r: 4, t: 1, n: 3 }, { id: 'kimi', r: 3, t: 2, n: 4 }, { id: 'ds', r: 7, t: 3 }] });
  assert.equal(g.state.history.length, 2);
  assert.equal(g.state.history[0].r, 4);
  assert.equal(g.state.history[1].r, 3);
  assert.equal(g.state.owned.claude, 2);
});

test('重置抽卡记录和仓库：清空记录、仓库、次数和保底进度，保留货币与设置', () => {
  const g = game({ rice: 3000, whale: 42, pity5: 60, pity4: 7, total: 500, wpity5: 30, wpity4: 2, wtotal: 90, hardPity: 120, sound: false, pool: 'weapon', first980: 1, owned: { ds: 2, 'mini-kimi': 9, whalefall: 1 }, history: [{ id: 'ds', r: 5, t: 1, n: 3 }, { id: 'whalefall', r: 5, t: 2, n: 4, p: 'weapon' }] });
  g.clearCollection();
  g.save();
  const s = game(g.saved()).state;
  for (const k of ['pity5', 'pity4', 'total', 'wpity5', 'wpity4', 'wtotal']) assert.equal(s[k], 0, k);
  assert.equal(s.history.length, 0);
  assert.equal(Object.keys(s.owned).length, 0);
  assert.equal(s.rice, 3000);
  assert.equal(s.whale, 42);
  assert.equal(s.hardPity, 120);
  assert.equal(s.sound, false);
  assert.equal(s.pool, 'weapon');
  assert.equal(s.first980, 1);
  const again = game(g.saved());
  again.random(.000799, 0);
  assert.equal(again.roll().isNew, true);
});

test('深海捞饭：出鱼概率与角色池长期比例一致，5★ 中 DS娘 约一半', () => {
  const context = vm.createContext({ localStorage: { getItem: () => null }, Math: Object.create(Math) });
  vm.runInContext(rules + '\nglobalThis.api = { fishRoll, pityStats, FISH_RATE5, FISH_RATE4 };', context);
  const { fishRoll, pityStats, FISH_RATE5, FISH_RATE4 } = context.api;
  assert.ok(Math.abs(FISH_RATE5 - pityStats(90).overall) < 2e-4, '5★ 出现概率应约等于角色池 90 抽保底的综合概率');
  // 用固定的伪随机序列抽 40 万次，检查比例
  // mulberry32：可复现、相邻数不相关的伪随机数
  let seed = 7;
  context.Math.random = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const n = 400000, count = { 3: 0, 4: 0, 5: 0 }; let ds = 0;
  for (let i = 0; i < n; i++) { const c = fishRoll({}); count[c.r]++; if (c.id === 'ds') ds++; }
  assert.ok(Math.abs(count[5] / n - FISH_RATE5) < .0015, `5★ 实际 ${count[5] / n}`);
  assert.ok(Math.abs(count[4] / n - FISH_RATE4) < .004, `4★ 实际 ${count[4] / n}`);
  assert.ok(Math.abs(ds / count[5] - .5) < .05, `DS娘占 5★ ${ds / count[5]}`);
});

test('深海捞饭：逃脱率、奖励、花费、冷却和武器加成', () => {
  const g = game({ owned: { whalefall: 1, candor: 1, baguette: 1, twinstar: 1, qianfan: 1 }, fishGear: 'whalefall' });
  const context = vm.createContext({ localStorage: { getItem: () => JSON.stringify({ owned: { whalefall: 1, candor: 1, baguette: 1, twinstar: 1, qianfan: 1, crescent: 1 }, fishGear: 'whalefall' }) } });
  vm.runInContext(rules + '\nglobalThis.api = { state, fishBonus, fishEscape, fishReward, fishCost, fishCooldown };', context);
  const a = context.api;
  // 无装备
  assert.equal(a.fishEscape(5, {}), .5); assert.equal(a.fishEscape(4, {}), .2); assert.equal(a.fishEscape(3, {}), .05);
  assert.equal(a.fishReward(3, {}), 1000); assert.equal(a.fishReward(4, {}), 5000); assert.equal(a.fishReward(5, {}), 10000);
  assert.equal(a.fishCost({}), 1000); assert.equal(a.fishCooldown({}), 1);
  // 鲸落：牢靠 50%、招财 +30%
  const w = a.fishBonus('whalefall');
  assert.equal(a.fishEscape(5, w), .25);
  assert.equal(a.fishReward(5, w), 13000);
  // 直言招财、法棍节俭、双子星猫迅捷
  assert.equal(a.fishReward(3, a.fishBonus('candor')), 1400);
  assert.equal(a.fishCost(a.fishBonus('baguette')), 600);
  assert.ok(Math.abs(a.fishCooldown(a.fishBonus('twinstar')) - .4) < 1e-9);
  assert.ok(Math.abs(a.fishCooldown(a.fishBonus('crescent')) - .7) < 1e-9);
  // 没有的武器不给加成；读档时装备了不存在的武器会被卸下
  assert.deepEqual({ ...a.fishBonus('dragonclaw') }, {});
  const bad = vm.createContext({ localStorage: { getItem: () => JSON.stringify({ owned: {}, fishGear: 'whalefall' }) } });
  vm.runInContext(rules + '\nglobalThis.s = state;', bad);
  assert.equal(bad.s.fishGear, '');
  // 重置抽卡记录和仓库时一并卸下装备
  g.clearCollection();
  assert.equal(g.state.fishGear, '');
});

test('深海捞饭：天气改变逃脱率和稀有度，逃脱率封顶 95%', () => {
  const context = vm.createContext({ localStorage: { getItem: () => null }, Math: Object.create(Math) });
  vm.runInContext(rules + '\nglobalThis.api = { WEATHERS, fishEscape, fishRoll, pickWeather, FISH_RATE5 };', context);
  const { WEATHERS, fishEscape, fishRoll, pickWeather, FISH_RATE5 } = context.api;
  assert.equal(Object.keys(WEATHERS).length, 5);
  // 每种天气都会让捕捞变容易或变难
  for (const w of Object.values(WEATHERS)) assert.ok(w.escape !== 1 || w.rare !== 1, w.name);
  assert.ok(Math.abs(fishEscape(5, {}, WEATHERS.clear) - .4) < 1e-12);
  assert.ok(Math.abs(fishEscape(5, {}, WEATHERS.storm) - .7) < 1e-12);
  assert.ok(Math.abs(fishEscape(5, { hold: .5 }, WEATHERS.storm) - .35) < 1e-12);
  assert.equal(fishEscape(5, {}, { escape: 3, rare: 1, speed: 1 }), .95);
  // 雷暴：5★ 出现概率翻倍（取恰好落在 1 倍和 2 倍之间的随机数）
  context.Math.random = (() => { const q = [FISH_RATE5 * 1.5, 0]; return () => q.length ? q.shift() : 0; })();
  assert.equal(fishRoll({}, WEATHERS.storm).r, 5);
  context.Math.random = (() => { const q = [FISH_RATE5 * 1.5]; return () => q.length ? q.shift() : 0; })();
  assert.notEqual(fishRoll({}, WEATHERS.clear).r, 5);
  // 换天气时不会抽到同一种
  context.Math.random = () => .999;
  for (const k of Object.keys(WEATHERS)) assert.notEqual(pickWeather(k), k);
});
