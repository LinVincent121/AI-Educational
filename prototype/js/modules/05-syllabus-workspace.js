/* Extracted from course-v2.js. Enhanced for 3-column syllabus workspace, Markdown presentation, selection AI actions, template configuration, and outline import. */
(function(){
  document.addEventListener('click', event => {
    const button = event.target.closest?.('.outline-section[data-outline-section="support"] .outline-section-actions button');
    if(!button || !button.getAttribute('onclick')?.includes("saveOutlineSection('support'")) return;
    const values = [...document.querySelectorAll('.support-weight')].map(input => Number(input.value) || 0);
    const total = values.reduce((sum, value) => sum + value, 0);
    if(Math.abs(total - 1) > 0.0001){
      event.preventDefault();
      event.stopImmediatePropagation();
      window.showSyllabusToast?.('权重合计必须等于 1.0，当前为 ' + total.toFixed(1));
    }
  }, true);
})();

(function(){
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const sylStyle = document.createElement('style');
  sylStyle.id = 'syllabus-workspace-v4-style';
  sylStyle.textContent = `
    .syllabus-col-right{display:flex;flex-direction:column;position:sticky;top:14px;min-width:0}
    .syllabus-col-right .chat-log{height:auto;flex:1 1 auto;min-height:150px;margin-top:10px;margin-bottom:10px}
    .syllabus-col-right .chat-compose,.syllabus-col-right .ai-quick-chips,.syllabus-col-right .chat-status{flex:0 0 auto}
    .syllabus-col-right .chat-status{min-height:18px;margin-top:8px}
    .syllabus-col-right .chat-msg{max-width:100%}
    .syllabus-col-right .chat-msg.assistant{width:100%;box-sizing:border-box}
    .md-preview-rendered[contenteditable="true"]{cursor:text;transition:border-color .16s ease,box-shadow .16s ease}
    .md-preview-rendered[contenteditable="true"]:hover{border-color:#9edfd5}
    .md-preview-rendered[contenteditable="true"]:focus{outline:2px solid rgba(19,165,143,.4);outline-offset:1px;border-color:#13a58f}
    .md-preview-rendered[contenteditable="true"]:empty::before{content:attr(data-placeholder);display:block;color:#9db4b1;font-size:12px}
    .outline-section-header.no-sub h2{margin:4px 0 0}
    .syl-suggest{display:block;width:100%;box-sizing:border-box;margin:8px 0 6px;padding:8px 10px;background:#f0fbf8;border:1px solid #bfe6dd;border-radius:8px;color:#27483f;font-size:12px;line-height:1.7;white-space:pre-wrap;word-break:break-word}
    .syl-actions{display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap}
    .syl-actions .btn{padding:4px 10px;font-size:11px;border-radius:7px}
    .syl-actions .btn:disabled{cursor:default;opacity:.75}
    .syl-reply-head{font-size:12px;color:#39514e}
    .outline-progress-item.compact{min-height:46px}
    .outline-progress-item.compact .outline-progress-copy b{margin:1px 0}
    .syllabus-col-mid .outline-section-body{padding:16px 4px 4px}
    .syllabus-col-mid .outline-section-actions{margin-top:14px;padding-top:2px}
    .syllabus-content-tree .chapter-tree{margin-bottom:6px}
    .syllabus-content-tree .syllabus-tree-toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px;padding-top:12px;border-top:1px solid #edf3f2}
    @media(max-width:1100px){.syllabus-col-right{position:static;height:auto!important}}
  `;
  document.head.appendChild(sylStyle);
  const stateKey = 'ai-jiaowu-syllabus-outline-state-v4';
  const fieldKey = 'ai-jiaowu-syllabus-outline-fields-v4';

  const courseId = () => {
    try { return localStorage.getItem('ai-jiaowu-current-course') || 'discrete'; } catch { return 'discrete'; }
  };

  let scope = courseId();
  const scopedKey = key => key + '-' + scope;

  const sections = [
    {id:'basic', title:'01 课程基本信息', short:'', status:'done'},
    {id:'purpose', title:'02 课程目标', short:'课程目的与目标编辑', status:'pending'},
    {id:'support', title:'03 课程目标与毕业要求支撑', short:'目标、权重与支撑矩阵', status:'draft'},
    {id:'content', title:'04 课程教学内容与基本要求', short:'章节、子章节与教材位置', status:'done'},
    {id:'hours', title:'05 课程学时分配表', short:'理论、实验与大作业学时', status:'pending'},
    {id:'ideology', title:'06 课程思政案例', short:'案例与价值引领目标', status:'pending'},
    {id:'assessment', title:'07 课程考核与成绩评定', short:'考核方式与成绩占比', status:'pending'},
    {id:'reference', title:'08 教材、参考书与审签', short:'主要教材与审签信息', status:'done'}
  ];

  const defaultMdFields = {
    basic: `# 01 课程基本信息

## 课程概要
- **课程名称**：离散数学 (Discrete Mathematics)
- **课程编号**：AI120030
- **课程类别**：学科基础必修课
- **适用专业**：智能科学与技术专业
- **学分 / 学时**：3 学分 / 48 学时 (理论讲授 48 学时 / 实验上机 0 学时)

## 课程简介
本课程是智能科学与技术专业的学科基础课程，为数据结构、数据库原理、操作系统和人工智能等后续课程提供必要的理论准备。课程围绕数理逻辑、集合与关系、代数结构和图论展开，帮助学生建立处理离散量的基本方法，培养抽象思维、严谨逻辑推理与算法建模能力。`,

    purpose: `# 02 课程目标与培养要求

## 课程目的
本课程旨在使学生了解和掌握离散量的基本处理方法，掌握数理逻辑推理、二元关系、图论和代数系统的基本理论，为后续计算机与人工智能核心课程奠定坚实的理论基础。

## 课程目标清单
- **课程目标 1**：能阐明典型离散的基本数据结构，能够理解集合论、命题逻辑、谓词逻辑、图论与群环域等基本概念，并能够演算和分析典型图论算法。
- **课程目标 2**：能够针对复杂工程问题，运用离散数学结构的基本思想和基本方法开展逻辑建模、方案分析和优劣评估。
- **课程目标 3**：能够通过多种渠道检索离散数学结构领域资料，开展自主学习并完成学习报告，持续追踪计算机领域发展动态。`,

    support: `# 03 课程目标与毕业要求支撑矩阵

| 课程目标 | 权重 | 支撑的毕业要求指标点 | 对应教学内容 | 教学方法与手段 |
|---|---|---|---|---|
| 课程目标 1 | 0.4 | 1.3 抽象数学思维<br>1.6 离散数学与代数结构基础 | 第一章：第1~5节<br>第二章：第1~4节 | 课堂讲授、知识运用示例、引导讨论，基于 MOOC 平台开展自学 |
| 课程目标 2 | 0.3 | 2.3 图论与群环域分析 | 第三章：第1~3节 | 例题分析与讲解，突出方法论，培养复杂工程建模能力 |
| 课程目标 3 | 0.3 | 4.1 自主学习与行业追踪 | 第四章：第1~2节 | 指导学习方法与资源，查找资料并撰写分析总结报告 |`,

    content: `# 04 课程教学内容与基本要求

> 点击下方按钮可快捷“＋ 新增章节”、“↥ 导入已有大纲”或“⚙ 教学大纲模板设置”。

## 第一章 集合论基础 (8 学时)
- **1.1 集合的基本概念**：列举法、描述法、文氏图、空集、全集与幂集。
- **1.2 关系的基本概念及其性质**：二元关系、关系矩阵、自反/对称/传递性质。
- **1.3 等价关系与偏序关系**：等价类、商集、偏序集与 Hasse 图。

## 第二章 古典数理逻辑 (10 学时)
- **2.1 命题逻辑**：命题联结词、真值表、主析取范式与主合取范式。
- **2.2 谓词逻辑**：个体变元、谓词与前束范式。

## 第三章 图与网络 (12 学时)
- **3.1 图的基本概念与矩阵表示**：无向图、有向图、度、邻接矩阵与关联矩阵。
- **3.2 树与图的算法**：生成树、最优二叉树、欧拉图与哈密顿图判定。

## 第四章 群、环和域 (12 学时)
- **4.1 代数系统**：运算封闭性、单位元、逆元与代数结构。
- **4.2 群、环与域**：子群、陪集、拉格朗日定理、群的同态与同构。`,

    hours: `# 05 学时分配表

| 章次 | 教学内容名称 | 理论讲授学时 | 实验 / 上机 | 大作业 | 合计学时 |
|---|---|---|---|---|---|
| 第一章 | 集合论基础 | 12 | 0 | 0 | 12 |
| 第二章 | 古典数理逻辑 | 12 | 0 | 0 | 12 |
| 第三章 | 图论 | 12 | 0 | 0 | 12 |
| 第四章 | 群、环和域 | 12 | 0 | 0 | 12 |
| **合计** | **全课程教学计划** | **48** | **0** | **0** | **48** |`,

    ideology: `# 06 课程思政典型案例

| 序号 | 案例名称 | 所属章节 | 案例教学目标 | 案例教学内容 |
|---|---|---|---|---|
| 01 | 集合概念与科学求真 | 第一章 第1~2节 | 理论联系实际、实事求是 | 以康托尔、罗素的科学探索历程切入，说明科学证明的严谨性与探索精神。 |
| 02 | 等价关系与团队协作 | 第一章 第3节 | 建立个人与团队协调关系 | 用同寝室关系解释等价关系（自反、对称、传递），引导同窗友爱与包容协作。 |
| 03 | 数理逻辑与民族自信 | 第二章 第1~2节 | 爱国情怀与民族自信 | 以重大国家事件命题演算为例，引导严谨求实与爱国情怀。 |`,

    assessment: `# 07 课程考核与成绩评定细则

## 考核构成与成绩占比
- **出勤与平时表现**：占比 **10%**（记录课堂考勤与互动）
- **平时作业与小测验**：占比 **30%**（考察概念理解与算法表达）
- **期末终结性考试**：占比 **60%**（综合评价全课程目标达成度）

## 课程目标与考核映射关系
- **课程目标 1** 对应考核：期末考试 (40%) + 平时作业 (10%)
- **课程目标 2** 对应考核：期末考试 (20%) + 平时作业 (10%)
- **课程目标 3** 对应考核：平时作业 (10%) + 过程性小论文 (10%)`,

    reference: `# 08 教材、参考书与审签信息

## 主要教材
- 欧阳丹彤、杨凤杰 等：《离散数学结构》（第 2 版），高等教育出版社，2011。

## 推荐参考书
1. 耿素云、屈婉玲：《离散数学》（修订版），高等教育出版社，2008。
2. 李盘林：《离散数学》，高等教育出版社，2002。

## 大纲审签信息
- **执笔教师**：张寒
- **审阅负责人**：罗文秋
- **审定负责人**：徐长波`
  };

  const readJson = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v && typeof v === 'object' ? v : fallback; } catch { return fallback; }
  };

  const state = Object.assign({ active: 'basic', status: {}, mdMode: {} }, readJson(scopedKey(stateKey), {}));
  const fields = Object.assign({}, defaultMdFields, readJson(scopedKey(fieldKey), {}));

  const syncScope = () => {
    const next = courseId();
    if(next === scope) return;
    scope = next;
    const freshState = readJson(scopedKey(stateKey), {});
    state.active = freshState.active || 'basic';
    state.status = Object.assign({}, freshState.status || {});
    const freshFields = readJson(scopedKey(fieldKey), {});
    Object.assign(fields, defaultMdFields, freshFields);
  };

  const statusNames = { done: '已完成', draft: 'AI 草稿', pending: '待补充', review: '待确认' };
  const statusClass = { done: 'done', draft: 'draft', pending: 'pending', review: 'review' };
  const activeSection = () => sections.find(x => x.id === state.active) || sections[0];
  const sectionStatus = section => state.status[section.id] || section.status;

  // Markdown Renderer: clean, semantic and reversible blocks so the live
  // preview can be edited inline and serialized back to Markdown.
  // Markdown Renderer: line-oriented, so headings can sit flush against a
  // following list/table (the authored outlines do not always use blank lines
  // between blocks). Emits clean, block-scoped DOM for reversible inline edits.
  const escMd = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const inlineMd = (seg) => escMd(seg)
    .replace(/&lt;br\s*\/?&gt;/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  function renderMarkdownToHtml(mdText) {
    if(!mdText) return '';
    const out = [];
    const lines = String(mdText).split('\n');

    let para = [];
    const flushPara = () => {
      const clean = para.map(l => l.trim()).filter(Boolean);
      para = [];
      if(!clean.length) return;
      out.push(`<p class="md-p">${clean.map(l => inlineMd(l)).join('<br>')}</p>`);
    };

    const isPipeRow = l => /^\s*\|.*\|\s*$/.test(l.trim());
    const isSepRow = l => { const t = l.trim().replace(/^\|/, '').replace(/\|$/, ''); return t.split('|').every(c => /^:?-{2,}:?$/.test(c.trim())); };
    const renderTable = (rows) => {
      const clean = rows.map(l => l.trim().replace(/^\|/, '').replace(/\|$/, '').trim());
      const sep = clean.findIndex(l => isSepRow(l));
      const header = clean[0] || '';
      const data = sep >= 0 ? clean.slice(sep + 1) : clean.slice(1);
      const cells = row => row.split('|').map(c => c.trim()).filter((c, i, arr) => !(i === arr.length - 1 && c === '') && !(i === 0 && c === ''));
      const headCells = cells(header);
      if(!headCells.length) return false;
      out.push(`<div class="md-table-wrap"><table class="md-table"><thead><tr>${headCells.map(c => `<th>${inlineMd(c)}</th>`).join('')}</tr></thead><tbody>`);
      data.filter(r => r.split('|').some(c => c.trim())).forEach(r => {
        const cs = cells(r);
        if(cs.length < headCells.length) while(cs.length < headCells.length) cs.push('');
        out.push(`<tr>${cs.slice(0, headCells.length).map(c => `<td>${inlineMd(c)}</td>`).join('')}</tr>`);
      });
      out.push(`</tbody></table></div>`);
      return true;
    };

    let i = 0;
    while(i < lines.length){
      const raw = lines[i];
      const line = raw.trim();

      if(line === ''){
        flushPara();
        i += 1;
        continue;
      }

      const heading = line.match(/^(#{1,3})\s+(.*)$/);
      if(heading){
        flushPara();
        const level = heading[1].length;
        out.push(`<h${level} class="md-h${level}">${inlineMd(heading[2])}</h${level}>`);
        i += 1;
        continue;
      }

      if(isPipeRow(line)){
        flushPara();
        const rows = [];
        while(i < lines.length && isPipeRow(lines[i])){ rows.push(lines[i]); i += 1; }
        if(!renderTable(rows)){
          // not actually a table (no header cells) — emit as plain paragraph
          rows.forEach(r => para.push(r));
        }
        continue;
      }

      if(/^[-*]\s+/.test(line)){
        flushPara();
        const items = [];
        while(i < lines.length && /^[-*]\s+/.test(lines[i].trim())){
          items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
          i += 1;
        }
        out.push(`<ul class="md-ul">${items.map(t => `<li class="md-li">${inlineMd(t)}</li>`).join('')}</ul>`);
        continue;
      }

      if(/^>/.test(line)){
        flushPara();
        const quote = [];
        while(i < lines.length && /^>/.test(lines[i].trim())){
          quote.push(lines[i].trim().replace(/^>\s?/, ''));
          i += 1;
        }
        out.push(`<blockquote class="md-quote">${quote.map(t => `<p class="md-p">${inlineMd(t)}</p>`).join('')}</blockquote>`);
        continue;
      }

      para.push(raw);
      i += 1;
    }
    flushPara();
    return '<div class="md-content-body">' + out.join('') + '</div>';
  }

  // Page Header (action rail aligned to the right, level with the page title)
  const pageHeader = () => `
    <div class="syllabus-page-head">
      <div class="syllabus-page-title">
        <h1>教学大纲</h1>
      </div>
      <div class="syllabus-head-actions">
        <button type="button" class="btn secondary" data-syl="preview" onclick="(window.__syllabusOpenPreview ? window.__syllabusOpenPreview() : alert('教学大纲预览将在正式版本中开放'))">教学大纲预览</button>
        <button type="button" class="btn secondary" data-syl="import" onclick="openImportSyllabusModal()">↥ 导入已有大纲</button>
        <button type="button" class="btn secondary" data-syl="template" onclick="openSyllabusTemplateModal()">⚙ 大纲模板设置</button>
        <select aria-label="大纲版本" class="version-select" onchange="selectOutlineVersion(this.value)">
          <option value="v3">v3 · 当前编辑</option>
          <option value="v2">v2 · 已发布</option>
          <option value="v1">v1 · 历史版本</option>
        </select>
        <button type="button" class="btn secondary" data-syl="draft" onclick="saveOutlineSection(window.__sylActive(), false)">保存草稿</button>
        <button type="button" class="btn primary" data-syl="version-save" onclick="saveOutlineSection(window.__sylActive(), true)">保存版本 →</button>
      </div>
    </div>
  `;

  // Left Progress Rail (Col 1)
  const progressRail = () => `
    <nav class="outline-progress" aria-label="教学大纲完成进度">
      <div class="outline-progress-head">
        <div>
          <span class="eyebrow">OUTLINE FLOW</span>
          <strong>大纲完成进度</strong>
        </div>
        <span class="outline-progress-count">${sections.filter(s => sectionStatus(s) === 'done').length}/${sections.length}</span>
      </div>
      <div class="outline-progress-list">
        ${sections.map((s, i) => {
          const st = sectionStatus(s), active = state.active === s.id;
          return `
            <div class="outline-progress-item ${active ? 'active ' : ''}${statusClass[st]} ${s.short ? '' : 'compact'}" role="button" tabindex="0" onclick="selectOutlineSection('${s.id}')">
              <span class="outline-progress-marker">${st === 'done' ? '✓' : String(i + 1).padStart(2, '0')}</span>
              <div class="outline-progress-copy">
                <b>${s.title}</b>
                ${s.short ? `<small>${s.short}</small>` : ''}
              </div>
              <span class="tag ${statusClass[st]}">${statusNames[st]}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="outline-progress-foot">
        <span class="dot"></span>
        <span>共 ${sections.length} 个大纲结构区块</span>
      </div>
    </nav>
  `;

  // Middle Section Header & Actions (Col 2)
  const sectionHeader = (section) => {
    const st = sectionStatus(section);
    const sub = section.id === 'basic' ? '' : section.short;
    return `
      <header class="outline-section-header${sub ? '' : ' no-sub'}">
        <div>
          <div class="outline-step-label">第 ${String(sections.indexOf(section) + 1).padStart(2, '0')} 项 / 共 08 项</div>
          <h2>${section.title}</h2>
          ${sub ? `<p class="muted">${sub}</p>` : ''}
        </div>
        <div class="outline-section-meta">
          <span class="tag ${statusClass[st]}">${statusNames[st]}</span>
          ${section.id === 'content'
            ? '<span class="tag gray" style="background:#f0f2f3;color:#76858d">章节结构视图</span>'
            : `<div class="md-view-switch">
              <button type="button" class="btn secondary ${state.mdMode[section.id] !== 'edit' ? 'active' : ''}" onclick="toggleMdMode('${section.id}', 'preview')">📄 MD 预览</button>
              <button type="button" class="btn secondary ${state.mdMode[section.id] === 'edit' ? 'active' : ''}" onclick="toggleMdMode('${section.id}', 'edit')">✏️ 编辑源码</button>
            </div>`}
        </div>
      </header>
    `;
  };

  const sectionActions = (id) => {
    const index = sections.findIndex(x => x.id === id), next = sections[index + 1];
    return `
      <footer class="outline-section-actions">
        <button type="button" class="btn secondary" onclick="saveOutlineSection('${id}', false)">保存草稿</button>
        <button type="button" class="btn primary" onclick="saveOutlineSection('${id}', true)">${next ? '保存并进入下一项 →' : '确认大纲并提交审核'}</button>
      </footer>
    `;
  };

  // Middle Column Body (Col 2 Markdown Panel)
  const mdSectionBody = (id) => {
    // 04 课程教学内容：章节树视图（章节列表不做 md 化；md 只用于章节编辑页/其余区块）
    if(id === 'content'){
      return `
        <div class="syllabus-content-tree" data-md-section="${id}">
          <div class="outline-content-toolbar">
            <small>点击任意章节进入二级编辑页；使用 ↑ ↓ 调整一级章节顺序。</small>
          </div>
          <div id="syllabusTree" class="chapter-tree"></div>
          <div class="syllabus-tree-toolbar">
            <button type="button" class="btn secondary" data-syl-tree-action="add" onclick="window.showSyllabusToast && window.showSyllabusToast('新增章节请在右侧 AI 助手描述，或点击左侧进度栏 04 章节后使用「导入」')">＋ 新增章节</button>
            <button type="button" class="btn secondary" onclick="openImportSyllabusModal()">↥ 导入已有大纲</button>
            <button type="button" class="btn secondary" onclick="openSyllabusTemplateModal()">⚙ 大纲模板设置</button>
          </div>
        </div>
      `;
    }

    const isEditMode = state.mdMode[id] === 'edit';
    const content = fields[id] || defaultMdFields[id] || '';

    return `
      <div class="md-workspace" data-md-section="${id}">
        <div class="md-content-area">
          ${isEditMode ? `
            <textarea id="mdTextarea_${id}" class="md-textarea" data-outline-md="${id}" oninput="updateMdField('${id}', this.value)">${esc(content)}</textarea>
          ` : `
            <div id="mdWorkspacePreview" class="md-preview-rendered" data-outline-preview="${id}" contenteditable="true" spellcheck="false" role="textbox" aria-multiline="true" aria-label="MD 预览（可直接编辑）" data-placeholder="（当前内容为空，可直接输入 Markdown 文本）" oninput="onSyllabusPreviewInput('${id}')" onblur="onSyllabusPreviewBlur('${id}')" onmouseup="handleTextSelection(event)">
              ${renderMarkdownToHtml(content)}
            </div>
          `}
        </div>
      </div>
    `;
  };

  // Right Column AI Assistant Panel (Col 3)
  const aiAssistantPanel = () => `
    <div class="ai-chat-head">
      <div>
        <h2>AI助手</h2>
        <p class="muted" style="margin:2px 0 0;font-size:11px">划选大纲文本或直接提问，AI 回复可一键「接纳」回写</p>
      </div>
    </div>
    <div id="syllabusChatLog" class="chat-log outline-chat-log" aria-live="polite">
      <div class="chat-msg assistant">你好，我是 AI 助手。可以直接输入需求；也可以划选大纲正文中的文本，选择“扩写 / 简化 / 重写 / 润色”，改写结果会直接出现在对话里，点击「接纳」即可更新大纲内容。</div>
    </div>
    <div class="chat-compose">
      <textarea id="syllabusPrompt" aria-label="描述大纲需求" placeholder="直接输入需求，或划选大纲文本后使用 AI 指令..."></textarea>
      <button type="button" class="btn primary" onclick="sendSyllabusPrompt()">发送</button>
    </div>
    <div class="ai-quick-chips" style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
      <button type="button" class="btn secondary" style="font-size:10px;padding:3px 7px" onclick="sendQuickAiPrompt('扩写当前大纲区块内容')">✦ 扩写本区块</button>
      <button type="button" class="btn secondary" style="font-size:10px;padding:3px 7px" onclick="sendQuickAiPrompt('检查毕业要求指标点支撑匹配度')">✦ 检查指标点</button>
      <button type="button" class="btn secondary" style="font-size:10px;padding:3px 7px" onclick="sendQuickAiPrompt('补充课程思政案例与教学目标')">✦ 补充思政</button>
    </div>
    <div id="syllabusChatStatus" class="chat-status">AI 回复可通过「接纳」直接更新大纲文本。</div>
  `;

  // 3-Column Page Layout Assembly
  const page = () => {
    syncScope();
    const current = activeSection();
    return window.shell(`
      ${pageHeader()}
      <div class="syllabus-3col-workspace">
        <div class="syllabus-col-left">
          ${progressRail()}
        </div>
        <main class="syllabus-col-mid panel" data-outline-section="${current.id}">
          ${sectionHeader(current)}
          <div class="outline-section-body">
            ${mdSectionBody(current.id)}
          </div>
          ${sectionActions(current.id)}
        </main>
        <aside class="syllabus-col-right panel ai-chat">
          ${aiAssistantPanel()}
        </aside>
      </div>
    `, 'syllabus');
  };

  /* Keep the syllabus header a single, right-aligned action rail. Legacy modules
     (Word preview / version snapshot) also inject buttons into .syllabus-head-actions,
     so we dedupe by semantic role and reorder after every render pass. */
  const normalizeSyllabusHeader = () => {
    const head = document.querySelector('.syllabus-head-actions');
    if(!head) return;
    const bucket = {};
    const other = [];
    [...head.children].forEach(el => {
      const t = (el.textContent || '').trim();
      let role = 'other';
      if(el.tagName === 'SELECT') role = 'version';
      else if(t === '教学大纲预览') role = 'preview';
      else if(t.includes('导入已有大纲')) role = 'import';
      else if(t.includes('大纲模板')) role = 'template';
      else if(t === '保存草稿') role = 'draft';
      else if(/^保存版本/.test(t)) role = 'version-save';
      if(role === 'other') other.push(el);
      else (bucket[role] = bucket[role] || []).push(el);
    });
    const chosen = {};
    ['preview', 'import', 'template', 'draft', 'version', 'version-save'].forEach(role => {
      const arr = bucket[role];
      if(!arr || !arr.length) return;
      const keep = arr.find(el => el.dataset && el.dataset.syl) || arr[0];
      chosen[role] = keep;
      arr.forEach(el => { if(el !== keep) el.remove(); });
    });
    // Idempotent reorder: only mutate when the current order differs, otherwise
    // every 600ms appendChild would ping the page observers (busy loop).
    const order = ['preview', 'import', 'template', 'draft', 'version', 'version-save'];
    const expect = [...order, ...other.map(() => '__other__')].filter(r => r === '__other__' || chosen[r]);
    const actual = [...head.children].map(el => {
      const t = (el.textContent || '').trim();
      if(el.tagName === 'SELECT') return 'version';
      if(t === '教学大纲预览') return 'preview';
      if(t.includes('导入已有大纲')) return 'import';
      if(t.includes('大纲模板')) return 'template';
      if(t === '保存草稿') return 'draft';
      if(/^保存版本/.test(t)) return 'version-save';
      return '__other__';
    });
    const wanted = [];
    order.forEach(role => { if(chosen[role]) wanted.push(role); });
    other.forEach(() => wanted.push('__other__'));
    const changed = actual.length !== wanted.length || actual.some((r, i) => r !== wanted[i]);
    if(changed){
      order.forEach(role => { if(chosen[role]) head.appendChild(chosen[role]); });
      other.forEach(el => head.appendChild(el));
    }
    head.style.visibility = 'visible';
  };

  window.normalizeSyllabusHeader = normalizeSyllabusHeader;
  window.__sylActive = () => state.active;
  const runNormalize = () => {
    if(location.hash === '#course/syllabus') normalizeSyllabusHeader();
  };
  window.addEventListener('hashchange', () => setTimeout(runNormalize, 60));
  setInterval(runNormalize, 600);
  setTimeout(runNormalize, 120);

  const persist = () => {
    try {
      localStorage.setItem(scopedKey(stateKey), JSON.stringify(state));
      localStorage.setItem(scopedKey(fieldKey), JSON.stringify(fields));
    } catch {}
  };

  const sectionMd = id => fields[id] != null ? fields[id] : (defaultMdFields[id] || '');

  /* Public bridge used by the syllabus AI chat module (28-syllabus-ai-chat.js):
     read/update the current Markdown and rebuild an inline-edited preview in
     place, so accepting AI suggestions does not reset the whole chat. */
  window.__sylMdApi = {
    get: (id) => sectionMd(id || state.active),
    set: (id, md) => { fields[id] = md; persist(); },
    html: (md) => renderMarkdownToHtml(md),
    active: () => state.active,
    refreshPreview: (id) => {
      const el = document.querySelector(`[data-outline-preview="${id}"]`);
      if(el){
        el.innerHTML = renderMarkdownToHtml(sectionMd(id));
        el.scrollTop = 0;
      }
    }
  };

  // 04 章节树视图：等待 18 的渲染树覆盖就绪后填充章节行
  const scheduleContentTree = (id) => {
    if(id !== 'content') return;
    const tryFill = () => {
      if(!document.getElementById('syllabusTree')) return;
      if(document.querySelector('#syllabusTree .chapter-row')) return;
      if(typeof window.renderSyllabusTree === 'function'){
        window.renderSyllabusTree();
      } else if(typeof window.__renderSyllabusTree === 'function'){
        window.__renderSyllabusTree();
      }
    };
    setTimeout(tryFill, 60);
    setTimeout(tryFill, 320);
    setTimeout(tryFill, 900);
  };
  window.__scheduleSyllabusContentTree = scheduleContentTree;

  /* Patch the syllabus 3-column workspace in place when switching 01~08 tabs:
     only the left progress rail and the middle section are repainted, so the
     page does not flash/remount the whole layout (the old code called
     window.render() → innerHTML replacement on every tab click). Falls back to
     a full render when the workspace is not on screen. */
  const renderMiddleSection = (id) => {
    const mid = document.querySelector('.syllabus-col-mid');
    const left = document.querySelector('.syllabus-col-left');
    if(!mid) return false;
    const section = sections.find(x => x.id === id) || sections[0];
    if(left){
      left.innerHTML = progressRail();
    }
    mid.setAttribute('data-outline-section', section.id);
    mid.innerHTML =
      sectionHeader(section)
      + '<div class="outline-section-body">'
      + mdSectionBody(section.id)
      + '</div>'
      + sectionActions(section.id);
    return true;
  };

  const rerender = () => {
    persist();
    const id = state.active || sections[0].id;
    const inPlace = location.hash === '#course/syllabus' && !!document.querySelector('.syllabus-3col-workspace');
    if(inPlace && renderMiddleSection(id)){
      scheduleContentTree(id);
      return;
    }
    if(window.render) window.render();
    scheduleContentTree(id);
  };

  window.toggleMdMode = (id, mode) => {
    state.mdMode[id] = mode;
    rerender();
  };

  window.updateMdField = (id, value) => {
    fields[id] = value;
    persist();
  };

  window.selectOutlineSection = id => {
    syncScope();
    if(!sections.some(x => x.id === id)) return;
    state.active = id;
    rerender();
  };

  window.selectOutlineVersion = v => {
    try { localStorage.setItem('ai-jiaowu-syllabus-outline-version', v); } catch {};
    if(window.showSyllabusToast) window.showSyllabusToast('已切换到 ' + v + '，当前仅查看大纲相关内容');
  };

  window.saveOutlineSection = (id, complete) => {
    syncScope();
    const textarea = document.querySelector(`[data-outline-md="${id}"]`);
    if(textarea) fields[id] = textarea.value;

    state.status[id] = complete ? 'done' : 'draft';
    const index = sections.findIndex(x => x.id === id), next = sections[index + 1];
    if(complete && next) state.active = next.id;
    persist();
    if(window.showSyllabusToast) window.showSyllabusToast(complete ? (next ? sections[index].title + '已确认，进入下一项' : '教学大纲已确认，审核任务已创建') : (sections.find(x => x.id === id).title + '已保存为草稿'));
    rerender();
  };

  // Requirement 4: Selection AI Action Floating Menu & Trigger
  window.handleTextSelection = (event) => {
    const sel = window.getSelection();
    if(!sel) return;
    const selectedText = sel.toString().trim();

    let bubble = document.getElementById('mdAiFloatingBar');
    if(!selectedText || selectedText.length < 2){
      if(bubble) bubble.remove();
      return;
    }

    if(!bubble){
      bubble = document.createElement('div');
      bubble.id = 'mdAiFloatingBar';
      bubble.className = 'md-ai-float-bubble';
      document.body.appendChild(bubble);
    }

    bubble.innerHTML = `
      <span style="font-weight:600;font-size:11px;margin-right:2px;color:#8ce0d3">AI 修改：</span>
      <button type="button" onclick="triggerAiSelectionAction('扩写')">✦ 扩写</button>
      <button type="button" onclick="triggerAiSelectionAction('简化')">✦ 简化</button>
      <button type="button" onclick="triggerAiSelectionAction('重写')">✦ 重写</button>
      <button type="button" onclick="triggerAiSelectionAction('润色')">✦ 润色</button>
    `;

    // Position bubble above selection
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    bubble.style.top = Math.max(10, rect.top + window.scrollY - 42) + 'px';
    bubble.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
  };

  window.triggerAiSelectionAction = (action) => {
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';
    const bubble = document.getElementById('mdAiFloatingBar');
    if(bubble) bubble.remove();

    if(!selectedText) return;

    const promptText = `请对以下教学大纲内容进行${action}：\n"${selectedText}"`;
    const promptInput = document.getElementById('syllabusPrompt');
    if(promptInput){
      promptInput.value = promptText;
      promptInput.focus();
      promptInput.classList.add('prompt-highlight');
      setTimeout(() => promptInput.classList.remove('prompt-highlight'), 1600);
    }

    if(window.showSyllabusToast){
      window.showSyllabusToast(`已将划选文本与“${action}”指令送到右侧 AI 助手`);
    }
  };

  window.sendQuickAiPrompt = (promptText) => {
    const input = document.getElementById('syllabusPrompt');
    if(input){
      input.value = promptText;
      input.focus();
      window.sendSyllabusPrompt();
    }
  };

  // Requirement 1: Import Syllabus Modal Function
  window.openImportSyllabusModal = () => {
    let overlay = document.getElementById('importSyllabusModal');
    if(overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'importSyllabusModal';
    overlay.className = 'kb-picker-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="kb-picker-dialog">
        <div class="kb-picker-head">
          <div>
            <span class="eyebrow">IMPORT OUTLINE</span>
            <h3>导入已有教学大纲文件</h3>
          </div>
          <button type="button" class="kb-picker-close" onclick="document.getElementById('importSyllabusModal').remove()">×</button>
        </div>
        <div class="kb-picker-body">
          <p class="muted" style="margin:0;font-size:12px">支持上传本地 Word (.docx/.doc)、PDF 或 Markdown (.md) 教学大纲文件，系统将智能提取段落并转换为结构化大纲。</p>
          <div class="import-upload-zone" style="border:2px dashed #bce3dc;border-radius:12px;padding:30px 20px;text-align:center;background:#f6fbf9;cursor:pointer" onclick="document.getElementById('importFileInput').click()">
            <span style="font-size:32px;color:#0b9c8c;display:block;margin-bottom:8px">↥</span>
            <b style="font-size:14px;color:var(--ink);display:block">点击选择文件 或 将文件拖拽至此处</b>
            <small class="muted" style="display:block;margin-top:4px">支持 .docx, .doc, .pdf, .md 格式（最大 50MB）</small>
            <input id="importFileInput" type="file" accept=".docx,.doc,.pdf,.md" hidden onchange="startSyllabusFileImport(this.files)">
          </div>
          <div id="importParseProgress" hidden style="margin-top:14px">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)">
              <span id="importParseStep">正在读取文本与目录...</span>
              <strong id="importParsePercent">0%</strong>
            </div>
            <div class="upload-track" style="height:7px;margin:8px 0;background:#e4f0ee;border-radius:99px;overflow:hidden">
              <i id="importParseBar" style="display:block;height:100%;width:0%;background:var(--mint);transition:width 0.2s"></i>
            </div>
          </div>
        </div>
        <div class="kb-picker-foot">
          <button type="button" class="btn secondary" onclick="document.getElementById('importSyllabusModal').remove()">取消</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window.startSyllabusFileImport = (files) => {
    const file = files && files[0];
    if(!file) return;
    const progressBox = document.getElementById('importParseProgress');
    const stepText = document.getElementById('importParseStep');
    const percentText = document.getElementById('importParsePercent');
    const bar = document.getElementById('importParseBar');
    if(!progressBox) return;

    progressBox.hidden = false;
    let val = 0;
    const steps = ['验证文件有效性...', '读取大纲段落与结构...', '识别课程目标与能力支撑...', '生成 Markdown 大纲数据...'];

    const timer = setInterval(() => {
      val += 25;
      bar.style.width = val + '%';
      percentText.textContent = val + '%';
      stepText.textContent = steps[Math.min(steps.length - 1, Math.floor(val / 25))];

      if(val >= 100){
        clearInterval(timer);
        setTimeout(() => {
          document.getElementById('importSyllabusModal')?.remove();
          if(window.showSyllabusToast) window.showSyllabusToast(`成功从文件【${file.name}】解析并导入教学大纲数据`);
          rerender();
        }, 400);
      }
    }, 280);
  };

  // Requirement 2: Syllabus Template Modal & Configuration Interface Modal
  window.openSyllabusTemplateModal = () => {
    let overlay = document.getElementById('templateModal');
    if(overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'templateModal';
    overlay.className = 'kb-picker-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="kb-picker-dialog tpl-config-dialog">
        <div class="kb-picker-head">
          <div>
            <span class="eyebrow">SYLLABUS TEMPLATES</span>
            <h3>教学大纲模板设置</h3>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <button type="button" class="btn primary" onclick="openSyllabusTemplateConfigInterface()">⚙ 进入教学大纲模板配置界面 →</button>
            <button type="button" class="kb-picker-close" onclick="document.getElementById('templateModal').remove()">×</button>
          </div>
        </div>
        <div class="kb-picker-body">
          <p class="muted" style="margin:0;font-size:12px">选择模板即可应用于当前课程。如需自定义增删结构区块或修改字段属性，请点击右上角配置界面。</p>
          <div class="template-card-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px">
            <div class="panel" style="padding:14px;border-color:var(--mint);background:var(--mint-soft)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <b style="font-size:14px;color:var(--ink)">标准本科教学大纲模板</b>
                <span class="tag ok">默认启用</span>
              </div>
              <p class="muted" style="font-size:11px;margin:0 0 12px;line-height:1.5">包含 01~08 完整标准结构（基本信息、课程目标、矩阵支撑、章节内容、学时分配、思政案例等）。</p>
              <div style="display:flex;gap:6px">
                <button type="button" class="btn primary" style="font-size:11px;padding:5px 9px" onclick="applySyllabusTemplate('standard')">应用此模板</button>
                <button type="button" class="btn secondary" style="font-size:11px;padding:5px 9px" onclick="openSyllabusTemplateConfigInterface()">编辑配置</button>
              </div>
            </div>
            <div class="panel" style="padding:14px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <b style="font-size:14px;color:var(--ink)">工程教育认证大纲模板</b>
                <span class="tag gray">可应用</span>
              </div>
              <p class="muted" style="font-size:11px;margin:0 0 12px;line-height:1.5">强化毕业要求指标点支撑矩阵、能力达成度计算公式与过程性考核映射关系。</p>
              <div style="display:flex;gap:6px">
                <button type="button" class="btn secondary" style="font-size:11px;padding:5px 9px" onclick="applySyllabusTemplate('engineering')">应用此模板</button>
                <button type="button" class="btn secondary" style="font-size:11px;padding:5px 9px" onclick="openSyllabusTemplateConfigInterface()">编辑配置</button>
              </div>
            </div>
          </div>
        </div>
        <div class="kb-picker-foot">
          <button type="button" class="btn secondary" onclick="document.getElementById('templateModal').remove()">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window.applySyllabusTemplate = (name) => {
    document.getElementById('templateModal')?.remove();
    if(window.showSyllabusToast) window.showSyllabusToast(`大纲模板【${name==='engineering'?'工程教育认证模板':'标准本科模板'}】已应用并更新`);
    rerender();
  };

  // Requirement 2 Sub-feature: Template Configuration Interface (教学大纲模板配置界面)
  window.openSyllabusTemplateConfigInterface = () => {
    document.getElementById('templateModal')?.remove();

    let overlay = document.getElementById('templateConfigInterfaceModal');
    if(overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'templateConfigInterfaceModal';
    overlay.className = 'kb-picker-overlay';
    overlay.setAttribute('role', 'dialog');

    overlay.innerHTML = `
      <div class="kb-picker-dialog tpl-config-dialog">
        <div class="kb-picker-head">
          <div>
            <span class="eyebrow">TEMPLATE CONFIGURATOR</span>
            <h3>教学大纲模板配置界面</h3>
          </div>
          <button type="button" class="kb-picker-close" onclick="document.getElementById('templateConfigInterfaceModal').remove()">×</button>
        </div>
        <div class="tpl-config-body">
          <div class="tpl-config-left">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <b style="font-size:12px;color:var(--ink)">自定义左侧大纲结构 (01~08)</b>
              <button type="button" class="btn secondary" style="font-size:10px;padding:3px 6px" onclick="alert('已增加新自定义结构区块')">＋ 添加结构</button>
            </div>
            <div class="tpl-sec-list">
              ${sections.map((s, i) => `
                <div class="tpl-sec-item ${i===0?'active':''}" onclick="selectTplConfigSection('${s.id}')">
                  <span><b>${s.title}</b></span>
                  <small style="color:var(--muted)">[编辑]</small>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="tpl-config-right">
            <div class="panel" style="padding:14px">
              <h4 style="margin:0 0 10px;font-size:14px">结构名称与基础属性配置</h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
                <label class="outline-field"><span>结构编号</span><input value="01"></label>
                <label class="outline-field"><span>结构名称</span><input value="课程基本信息"></label>
              </div>
              <label class="outline-field" style="margin-bottom:10px">
                <span>内容数据类型配置</span>
                <select>
                  <option selected>文本输出 (Markdown 格式)</option>
                  <option>表格添加 / 矩阵定义</option>
                  <option>多项选择配置</option>
                  <option>数值约束 (学时/权重和等于1.0)</option>
                </select>
              </label>
              <label class="outline-field">
                <span>默认 Markdown 模板初始内容</span>
                <textarea style="min-height:120px"># 01 课程基本信息&#10;&#10;## 课程概要&#10;- **课程名称**：{{course_name}}&#10;- **学时学分**：3 学分 / 48 学时</textarea>
              </label>
            </div>
          </div>
        </div>
        <div class="kb-picker-foot">
          <button type="button" class="btn secondary" onclick="document.getElementById('templateConfigInterfaceModal').remove()">取消</button>
          <button type="button" class="btn primary" onclick="saveTemplateConfigInterface()">保存模板配置</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window.selectTplConfigSection = (id) => {
    if(window.showSyllabusToast) window.showSyllabusToast('切换配置结构区块：' + id);
  };

  window.saveTemplateConfigInterface = () => {
    document.getElementById('templateConfigInterfaceModal')?.remove();
    if(window.showSyllabusToast) window.showSyllabusToast('教学大纲模板结构配置已成功保存！');
    rerender();
  };

  /* AI 对话发送已移交 28-syllabus-ai-chat.js：直接在对话内生成建议并提供「接纳」回写，
     这里不再保留 Mock 逐字流式实现。 */

  window.__syllabusWorkspacePage = page;
  window.coursePage = function(k){
    if(k === 'syllabus'){
      return page();
    }
    return window.__courseShellV2 ? window.__courseShellV2('', k) : '';
  };

  if(location.hash === '#course/syllabus' && window.render){
    setTimeout(window.render, 0);
  }
})();
