import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = decodeURIComponent(new URL('../', import.meta.url).pathname).replace(/^\//, '').replace(/\//g, '\\');
const index = readFileSync(resolve(root, 'index.html'), 'utf8');
const loader = readFileSync(resolve(root, 'js', 'core', 'course-v2-loader.js'), 'utf8');
const files = [...loader.matchAll(/'([^']+\.js)'/g)].map(([, file]) => file);
const errors = [];

if (!index.includes('css/styles.css')) errors.push('index.html 未加载 css/styles.css');
for (const file of files) {
  const path = resolve(root, file);
  if (!existsSync(path)) errors.push(`loader 引用了不存在的文件: ${file}`);
  else {
    const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    if (result.status !== 0) errors.push(`JS 语法错误: ${file}\n${result.stderr.trim()}`);
  }
}

const active = files.map((file) => readFileSync(resolve(root, file), 'utf8')).join('\n');
const globals = [...active.matchAll(/window\.([A-Za-z0-9_]+)\s*=/g)].map(([, name]) => name);
const duplicates = [...new Set(globals.filter((name, i) => globals.indexOf(name) !== i))];
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${files.length} 个模块、入口和 JS 语法检查通过`);
if (duplicates.length) console.warn(`WARN: 仍存在重复全局覆盖（后续应逐步收敛）: ${duplicates.join(', ')}`);

