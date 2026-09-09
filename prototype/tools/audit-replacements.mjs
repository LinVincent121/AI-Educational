/* 审计 33-economics-course-data.js 的替换表：
 * 1) 找出「某规则输出 ⊇ 其他规则输入」的级联词对（历史上导致 供求供求供求… 无限增长的根源）；
 *    运行时已用 \u2060 守卫 + 负向后行断言防护，此处仅作登记，提醒新增规则时注意。
 * 2) 用与运行时相同的守卫算法模拟两轮替换，断言幂等（第二轮不再产生任何变化）。
 * 用法：node tools/audit-replacements.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'js', 'modules', '33-economics-course-data.js');
const src = readFileSync(file, 'utf8');

const start = src.indexOf('const replacements=[');
const end = src.indexOf('];', start);
if (start < 0 || end < 0) { console.error('未找到 replacements 数组'); process.exit(1); }
const replacements = eval(src.slice(start + 'const replacements='.length, end + 1)); // eslint-disable-line no-eval

replacements.sort((a, b) => b[0].length - a[0].length);
const rules = replacements.filter(([a, b]) => a !== b); // 恒等规则是无操作，跳过
console.log(`共 ${replacements.length} 条规则（${replacements.length - rules.length} 条恒等规则已忽略）\n`);

// —— 1) 级联词对登记 ——
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let cascades = 0;
for (const [input, output] of rules) {
  for (const [input2] of rules) {
    if (output.includes(input2)) {
      cascades++;
      const self = input === input2 ? '自身输入' : `规则输入「${input2}」`;
      console.log(`[已防护] 「${input}」→「${output}」的输出包含${self}，运行时由 \\u2060 守卫保证不重复增长`);
    }
  }
}
if (!cascades) console.log('未发现输出包含其他规则输入的级联词对。');
console.log('');

// —— 2) 幂等性模拟（与运行时同一套守卫算法） ——
const GUARD = '\u2060';
const protect = s => rules.reduce((out, [src2]) => out.replace(new RegExp(escapeRe(src2), 'g'), m => GUARD + m), String(s));
const pattern = new RegExp('(?<!' + GUARD + ')(?:' + rules.map(([a]) => escapeRe(a)).join('|') + ')', 'g');
const replace = s => String(s).replace(pattern, match => protect(new Map(rules).get(match) || match));

const samples = [
  '关系', '二元关系与等价关系', '1.2 关系与性质', '关系的基本概念及其性质',
  '第一章 · 第二节 关系', '判断给定关系是否满足自反性', '《离散数学》（第 2 版）第 4 章 · 图论',
  '设 R 是集合 A 上的二元关系：', '供求关系', '需求关系与市场机制',
];
let failed = 0;
for (const s of samples) {
  const once = replace(s);
  const twice = replace(once);
  const ok = once === twice;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  「${s}」→「${once.replace(/\u2060/g, '·')}」 二次扫描${ok ? '无变化' : '仍在增长: ' + twice.replace(/\u2060/g, '·')}`);
}
console.log('');
if (failed) { console.error(`${failed} 个样例未通过幂等性检查`); process.exit(1); }
console.log('全部样例通过：替换结果可被重复扫描而不增长。');
