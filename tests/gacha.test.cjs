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
  vm.runInContext(rules + roll + '\nglobalThis.api = { state, rate5, softPity, pityStats, validPity, save };', context);
  context.api.random = (...numbers) => { context.Math.random = () => numbers.length ? numbers.shift() : .5; };
  context.api.roll = () => vm.runInContext('rollOne()', context);
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
