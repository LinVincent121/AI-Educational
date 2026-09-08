/* Chapter editor → unified Markdown editing block (v2).
 * Loads last (after 12/13/18). Rebuilds the centered chapter-editor layout:
 *  1) Left column = 章节基本信息 card + ONE "章节教学内容(Markdown)" editor
 *     whose sections include 教学内容/教学基本要求/重点难点/教学方法/课程思政/
 *     作业思考题/知识点罗列与解释/能力矩阵 (saved back into the original
 *     structured fields);
 *  2) 教材来源与位置 card moves right below that Markdown editor;
 *  3) Right column hosts the chapter AI assistant;
 *  4) The now-redundant single cards (知识点与课程目标 / 思政融合 / 能力矩阵 /
 *     课时总览) are hidden but kept in the DOM so 12/13/18 keep filling the
 *     structured inputs they own.
 * The Markdown editor supports selecting text → floating 扩写/简化/重写/润色 →
 * chat reply with 接纳 that rewrites the selection in place (same interaction
 * as the syllabus workspace).
 */
(function(){
  const STYLE = document.createElement('style');
  STYLE.textContent = `
    .cm-md-card .cm-md-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 10px}
    .cm-md-card .cm-md-hint{font-size:10px}
    .cm-md-source{width:100%;min-height:300px;box-sizing:border-box;border:1px solid #dceae8;border-radius:10px;padding:12px 14px;font:13px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--ink);background:#fbfefd;resize:vertical}
    .cm-md-source:focus{outline:2px solid #b9e4dd;outline-offset:1px;border-color:#8fd5cb}
    .cm-md-preview{max-height:520px;overflow:auto;padding:14px 16px;border:1px solid #e1efec;border-radius:10px;background:#fff;user-select:text;-webkit-user-select:text;line-height:1.75}
    .cm-md-preview[contenteditable="true"]:focus{outline:2px solid rgba(19,165,143,.35);outline-offset:1px}
    .chapter-ai-rail{display:grid;gap:0;align-content:start}
    .cm-ai-card{padding:14px;border:1px solid #dceae8;border-radius:12px;background:#fff;box-shadow:0 5px 16px rgba(54,113,126,.045)}
    .cm-ai-card .cm-ai-log{height:300px;margin:10px 0;padding:10px;border:1px solid #e6efee;border-radius:10px;background:#f8fcfb;display:grid;align-content:start;gap:9px;overflow-y:auto}
    .cm-ai-card .cm-ai-suggest{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}
    .cm-ai-card .cm-ai-suggest button{border:1px solid #d9e9e6;background:#fff;border-radius:99px;color:#557674;padding:4px 8px;font-size:10px;cursor:pointer}
    .cm-ai-card .cm-ai-suggest button:hover{border-color:#9edfd5;color:#0b9c8c}
    .cm-ai-card .cm-ai-compose{display:flex;gap:7px;align-items:flex-end}
    .cm-ai-card .cm-ai-compose textarea{flex:1;min-height:52px;resize:vertical;border:1px solid var(--line);border-radius:8px;padding:8px 9px;font:12px system-ui;color:var(--ink)}
    .cm-ai-card .cm-ai-status{min-height:16px;margin-top:6px;color:var(--muted);font-size:10px}
    .cm-reply-actions{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
    .cm-reply-actions .btn{padding:4px 10px;font-size:11px;border-radius:7px}
    .cm-reply-suggest{white-space:pre-wrap;word-break:break-word;background:#f0fbf8;border:1px solid #bfe6dd;border-radius:8px;padding:8px 10px;margin-top:6px;color:#27483f;font-size:12px;line-height:1.7}
    #cmMdFloatBar{position:absolute;z-index:1002;display:flex;align-items:center;gap:4px;padding:6px 9px;background:#18364f;color:#fff;border-radius:8px;box-shadow:0 8px 24px rgba(24,54,79,.35)}
    #cmMdFloatBar button{border:0;background:#254a67;color:#c5f2eb;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer;white-space:nowrap}
    #cmMdFloatBar button:hover{background:var(--mint);color:#fff}
    .cm-source-card{grid-column:1;margin-top:0}
    .cm-md-card{grid-column:1}
    .chapter-md-hidden{display:none!important}
    .chapter-editor-body[data-cm-layout]{grid-template-columns:minmax(0,1fr) minmax(320px,.66fr);align-items:start}
    .chapter-editor-body[data-cm-layout] .cm-md-source,
    .chapter-editor-body[data-cm-layout] .cm-md-preview{min-height:480px}
    .chapter-editor-body[data-cm-layout] .cm-ai-card{position:sticky;top:0;display:flex;flex-direction:column}
    .chapter-editor-body[data-cm-layout] .cm-ai-log{flex:1 1 auto;height:420px}
  `;
  document.head.appendChild(STYLE);

  /* ---------- markdown blocks that round-trip to structured fields ---------- */
  const MD_FIELDS = [
    { md: '教学内容',       names: ['content'] },
    { md: '教学基本要求',   names: ['requirements'] },
    { md: '重点难点',       names: ['keyPoints', 'difficultPoints'], joinLabel: true },
    { md: '教学方法与手段', names: ['teachingMethod', 'method'] },
    { md: '课程思政',       names: ['ideology'] },
    { md: '作业与思考题',   names: ['homework', 'homeworkItem'] },
    { md: '知识点罗列与解释', names: [], section: 'knowledge' },
    { md: '能力矩阵',       names: [], section: 'ability' }
  ];
  const SEP = /^##\s+/;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* ---------- field accessors ---------- */
  function formRef(){ return document.getElementById('chapterEditorForm'); }
  function fieldVal(names){
    const form = formRef();
    if(!form) return '';
    for(const n of names){
      const el = form.elements && form.elements[n];
      if(el && el.value) return String(el.value).trim();
    }
    return '';
  }
  function setField(names, value){
    const form = formRef();
    if(!form) return;
    const el = form.elements && form.elements[names[0]];
    if(el) el.value = value;
  }
  function knowledgeNames(){
    const v = fieldVal(['knowledgePoints']);
    return v.split(/[、,，;；]/).map(s => s.trim()).filter(Boolean);
  }
  function abilityLines(){
    const matrix = document.getElementById('chapterAbilityMatrix');
    if(!matrix) return [];
    const checked = new Set([...document.querySelectorAll('#chapterEditorChecks input:checked')].map(x => x.dataset.indicator).filter(Boolean));
    // fallback: indicators already stored in the form field
    const stored = fieldVal(['indicators']).split(/[、,，;；]/).map(s => s.trim()).filter(Boolean);
    stored.forEach(c => checked.add(c));
    const lines = [];
    matrix.querySelectorAll('tbody tr').forEach(tr => {
      const tds = tr.querySelectorAll('td');
      if(tds.length < 4) return;
      const goalTd = tds[0];
      let goal = (goalTd.childNodes[0] && goalTd.childNodes[0].nodeValue || goalTd.textContent || '').trim();
      const code = (tds[1].querySelector('b')?.textContent || '').trim();
      const name = (tds[1].querySelector('span')?.textContent || '').trim();
      const chapters = (tds[2].textContent || '').trim();
      const level = (tds[3].textContent || '').trim();
      if(!code) return;
      lines.push({ code, name, goal, chapters, level, checked: checked.has(code) || tr.classList.contains('current-row') });
    });
    return lines;
  }

  /* ---------- collect md from the structured fields ---------- */
  function collectMd(){
    const blocks = [];
    MD_FIELDS.forEach(f => {
      if(f.section === 'knowledge'){
        const names = knowledgeNames();
        if(names.length){
          blocks.push('## ' + f.md + '\n' + names.map(n => '- ' + n + '：（可在此补充该知识点的解释）').join('\n'));
        }
        return;
      }
      if(f.section === 'ability'){
        const rows = abilityLines().filter(r => r.checked);
        if(rows.length){
          blocks.push('## ' + f.md + '\n' + rows.map(r =>
            '- ' + (r.goal ? r.goal + '｜' : '') + '指标 ' + r.code + ' ' + r.name
            + '（支撑：' + (r.chapters || '—') + '；强度：' + (r.level || '中') + '）'
          ).join('\n'));
        }
        return;
      }
      const v = fieldVal(f.names);
      if(v) blocks.push('## ' + f.md + '\n' + v);
    });
    return blocks.join('\n\n');
  }

  /* ---------- split md back into sections ---------- */
  function splitSections(text){
    const sections = {};
    const lines = String(text || '').split('\n');
    let cur = null;
    lines.forEach(line => {
      if(SEP.test(line)){
        cur = line.replace(SEP, '').trim();
        sections[cur] = sections[cur] || [];
        return;
      }
      if(cur) sections[cur].push(line);
    });
    Object.keys(sections).forEach(k => sections[k] = sections[k].join('\n').replace(/^\n+|\n+$/g, ''));
    return sections;
  }
  function syncBack(text){
    const split = splitSections(text);
    MD_FIELDS.forEach(f => {
      const body = (split[f.md] || '').trim();
      if(f.section === 'knowledge'){
        const names = [];
        String(body).split('\n').forEach(line => {
          const m = line.match(/^[-*]\s*([^：:]+)[：:]?\s*/);
          if(m) names.push(m[1].trim());
        });
        if(names.length) setField(['knowledgePoints'], names.join('、'));
        return;
      }
      if(f.section === 'ability'){
        const codes = [];
        String(body).split('\n').forEach(line => {
          const m = line.match(/指标\s*([0-9]+(?:\.[0-9]+)*)/);
          if(m) codes.push(m[1]);
        });
        if(codes.length) setField(['indicators'], codes.join('、'));
        return;
      }
      if(f.joinLabel){
        let kp = [], dp = [];
        String(body).split('\n').forEach(line => {
          const t = line.trim().replace(/^[-*]\s*/, '');
          if(!t) return;
          if(/^重点\s*[:：]/.test(t)) kp.push(t.replace(/^重点\s*[:：]\s*/, ''));
          else if(/^难点\s*[:：]/.test(t)) dp.push(t.replace(/^难点\s*[:：]\s*/, ''));
          else kp.push(t);
        });
        setField(['keyPoints'], kp.join('；'));
        setField(['difficultPoints'], dp.join('；'));
      } else {
        setField(f.names, body);
      }
    });
  }

  /* ---------- DOM -> markdown (block aware, mirrors workspace serializer) ---------- */
  function nodeText(node){
    let s = '';
    node.childNodes.forEach(n => {
      if(n.nodeType === 3){ s += n.nodeValue; return; }
      if(n.nodeType !== 1) return;
      const tag = n.tagName.toLowerCase();
      if(tag === 'br'){ s += '\n'; return; }
      const inner = nodeText(n);
      s += (tag === 'strong' || tag === 'b') ? '**' + inner + '**' : inner;
    });
    return s;
  }
  function mdFromDom(root){
    const paras = [];
    let buf = '';
    const flush = () => {
      const t = buf.replace(/\u00a0/g,' ').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/^\n+|\n+$/g,'');
      buf = '';
      if(t) paras.push(t);
    };
    const walk = (node) => {
      if(node.nodeType === 3){
        const v = node.nodeValue || '';
        if(v.trim() !== '') buf += v;
        return;
      }
      if(node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if(tag === 'br'){ buf += '\n'; return; }
      if(/^h[1-6]$/.test(tag)){
        flush();
        const t = nodeText(node).replace(/\n/g, ' ').replace(/^\s+|\s+$/g, '');
        if(t) paras.push('#'.repeat(Number(tag[1])) + ' ' + t);
        return;
      }
      if(tag === 'ul' || tag === 'ol'){
        flush();
        const list = [];
        node.childNodes.forEach(li => {
          if(li.nodeType !== 1) return;
          if(li.tagName.toLowerCase() === 'li'){
            const t = nodeText(li).replace(/\n/g, ' ').replace(/^\s+|\s+$/g, '');
            if(t) list.push((tag === 'ol' ? '1. ' : '- ') + t);
          } else walk(li);
        });
        if(list.length) paras.push(list.join('\n'));
        return;
      }
      if(tag === 'li'){
        flush();
        const t = nodeText(node).replace(/\n/g, ' ').replace(/^\s+|\s+$/g, '');
        if(t) paras.push('- ' + t);
        return;
      }
      if(tag === 'table'){
        flush();
        const rows = [];
        const trs = node.querySelectorAll('tr');
        trs.forEach(tr => {
          const cells = [...tr.children].map(c => nodeText(c).replace(/\n/g, '<br>').trim());
          rows.push('| ' + cells.join(' | ') + ' |');
        });
        if(rows.length){
          const head = rows.shift();
          const colCount = head.split('|').length - 2; // leading/trailing empty cells
          paras.push(head);
          paras.push('|' + Array.from({length: colCount}, () => ' --- ').join('|') + '|');
          rows.forEach(r => paras.push(r));
        }
        return;
      }
      if(tag === 'blockquote'){
        flush();
        const t = nodeText(node).trim();
        if(t) paras.push('> ' + t.replace(/\n/g, '\n> '));
        return;
      }
      if(tag === 'p' || tag === 'div' || tag === 'section' || tag === 'article'){
        const hasBlock = [...node.children].some(c => /^(h[1-6]|ul|ol|table|blockquote|p|div|section)$/i.test(c.tagName));
        if(hasBlock){
          flush();
          node.childNodes.forEach(walk);
          return;
        }
        const t = nodeText(node);
        flush();
        if(t.trim()) paras.push(t.replace(/^\s+|\s+$/g, ''));
        return;
      }
      node.childNodes.forEach(walk);
    };
    root.childNodes.forEach(walk);
    flush();
    return paras.join('\n\n');
  }

  /* ---------- build the in-modal md editor & AI assistant ---------- */
  function install(form){
    if(!form) return;
    const main = form.querySelector('.chapter-editor-main');
    const side = form.querySelector('.chapter-editor-side');
    const bodyEl = form.querySelector('.chapter-editor-body');
    if(!main || !side || form.dataset.cmBound) return;
    form.dataset.cmBound = '1';
    if(bodyEl) bodyEl.setAttribute('data-cm-layout', '1');

    // 1) hide the redundant structured cards (kept for their inputs)
    [...main.querySelectorAll('.chapter-editor-card')].forEach(card => {
      const txt = card.querySelector('h3')?.textContent || '';
      if(/知识点与课程目标|思政/.test(txt)) card.classList.add('chapter-md-hidden');
    });
    [...side.querySelectorAll('section')].forEach(card => {
      const txt = card.querySelector('h3')?.textContent || '';
      if(/能力矩阵|课时总览/.test(txt)) card.classList.add('chapter-md-hidden');
    });

    // hide stray field labels inside the basic-info card (they live in the md now)
    const textNames = new Set(['content','requirements','keyPoints','difficultPoints','teachingMethod','method','homework','homeworkItem','ideology','knowledgePoints']);
    [...(form.elements || [])].forEach(el => {
      if(textNames.has(el.name) && /^(TEXTAREA|INPUT)$/i.test(el.tagName)){
        const label = el.closest('.chapter-editor-label');
        if(label && label.classList.contains('chapter-editor-textarea')) label.classList.add('chapter-md-hidden');
        // inline textarea blocks inside chapter-editor-two keep small helper labels; hide their label only if a textarea
        if(el.tagName === 'TEXTAREA' && label && /重点|难点|知识点|课程目标|能力指标/.test(label.textContent || '')) {
          label.classList.add('chapter-md-hidden');
        }
      }
    });
    // hide whole 知识点与课程目标 card content that holds textarea/inputs we keep values from
    main.querySelectorAll('.chapter-editor-card.chapter-md-hidden').forEach(card => card.classList.add('chapter-md-hidden'));

    // 2) Markdown card
    const mdCard = document.createElement('section');
    mdCard.className = 'chapter-editor-card cm-md-card';
    mdCard.innerHTML = [
      '<h3>章节教学内容（Markdown）</h3>',
      '<div class="cm-md-toolbar">',
      '  <div class="md-view-switch">',
      '    <button type="button" class="btn secondary active cm-md-mode" data-mode="preview">📄 预览</button>',
      '    <button type="button" class="btn secondary cm-md-mode" data-mode="edit">✏️ 编辑源码</button>',
      '  </div>',
      '  <span class="muted cm-md-hint">选中文本可使用 扩写 / 简化 / 重写 / 润色，AI 回复点「接纳」直接更新</span>',
      '</div>',
      '<textarea class="cm-md-source" spellcheck="false" hidden placeholder="用 Markdown 编写本节完整教学内容…"></textarea>',
      '<div class="cm-md-preview md-content-body" contenteditable="true" spellcheck="false" onmouseup="window.__cmSel && window.__cmSel(event)" data-cm-preview="1"></div>'
    ].join('');
    const basicCard = main.querySelector('.chapter-editor-card:not(.chapter-md-hidden)');
    if(basicCard) basicCard.after(mdCard);
    else main.prepend(mdCard);

    const source = mdCard.querySelector('.cm-md-source');
    const preview = mdCard.querySelector('.cm-md-preview');
    const modeBtns = mdCard.querySelectorAll('.cm-md-mode');
    const renderPreview = () => {
      const a = window.__sylMdApi;
      const mdText = source.value || '';
      const html = a && a.html ? a.html(mdText) : ('<div class="md-content-body">' + esc(mdText).replace(/\n/g,'<br>') + '</div>');
      preview.innerHTML = html;
    };
    modeBtns.forEach(b => b.addEventListener('click', () => {
      modeBtns.forEach(x => x.classList.toggle('active', x === b));
      const mode = b.dataset.mode;
      if(mode === 'preview'){
        source.hidden = true;
        preview.hidden = false;
        renderPreview();
      } else {
        preview.hidden = true;
        source.hidden = false;
        source.value = mdFromDom(preview); // round-trip current dom edits
      }
    }));
    preview.addEventListener('input', () => { /* dom edits persist on blur/save */ });
    source.addEventListener('input', () => {});

    // 3) move the 教材来源与位置 card below the md card (left column)
    const sourceCard = side.querySelector('section');
    if(sourceCard){
      sourceCard.classList.add('cm-source-card');
      mdCard.after(sourceCard);
    }
    // hide the remaining right-rail cards (能力矩阵 / 课时总览)
    side.querySelectorAll('section').forEach(card => {
      if(card.querySelector('h3') && /能力矩阵|课时总览/.test(card.querySelector('h3').textContent || '')) card.classList.add('chapter-md-hidden');
    });
    // left column stacks: basic card + md card + source card
    main.style.display = 'grid';
    main.style.gridTemplateColumns = 'minmax(0,1fr)';
    main.style.alignContent = 'start';
    const sourceMoved = main.querySelector('.cm-source-card');
    if(sourceMoved && mdCard) mdCard.after(sourceMoved);

    // 4) AI assistant card on the right
    const aiCard = document.createElement('section');
    aiCard.className = 'cm-ai-card';
    aiCard.innerHTML = [
      '<div class="ai-chat-head"><div><h3 style="margin:0">章节 AI 助手</h3><p class="muted" style="margin:3px 0 0;font-size:11px">可修改教学内容，或对划选文本做扩写 / 润色</p></div><span class="mock-chip">MOCK</span></div>',
      '<div class="cm-ai-log" aria-live="polite"><div class="chat-msg assistant">我会结合当前章节与大纲内容给出建议；也可以先在左侧 Markdown 预览中划选文字，选择“扩写 / 简化 / 重写 / 润色”，我会把改写结果连同「接纳」按钮发到这里。</div></div>',
      '<div class="cm-ai-suggest">',
      '  <button type="button" onclick="window.__cmQuick(\'把教学内容整理成适合课堂讲授的分步骤讲解\')">整理讲解</button>',
      '  <button type="button" onclick="window.__cmQuick(\'提炼本节重点与难点\')">提炼重点难点</button>',
      '  <button type="button" onclick="window.__cmQuick(\'补充一个课程思政案例\')">补充思政案例</button>',
      '</div>',
      '<div class="cm-ai-compose"><textarea aria-label="输入修改要求" placeholder="描述要修改的内容…"></textarea><button type="button" class="btn primary" onclick="window.__cmSend()">发送</button></div>',
      '<div class="cm-ai-status" aria-live="polite"></div>'
    ].join('');
    side.prepend(aiCard);

    // save-time sync back (capture phase -> original submit handler still reads fields)
    form.addEventListener('submit', () => {
      try {
        if(!source.hidden) source.value = source.value; // already authoritative
        else source.value = mdFromDom(preview);
        syncBack(source.value);
      } catch(e) {}
    }, true);

    refresh(form);
  }
  function refresh(form){
    if(!form) return;
    const card = form.querySelector('.cm-md-card');
    if(!card) return;
    const source = card.querySelector('.cm-md-source');
    const preview = card.querySelector('.cm-md-preview');
    if(!source || !preview) return;
    const md = collectMd();
    if(source.dataset.fingerprint === md && !preview.hidden) return; // unchanged
    source.value = md;
    const a = window.__sylMdApi;
    preview.innerHTML = a && a.html ? a.html(md) : '';
    source.dataset.fingerprint = md;
    source.hidden = true;
    preview.hidden = false;
  }

  /* ---------- selection → floating actions → chat ---------- */
  let cmPending = null; // { text, snap, root }
  function hideFloat(){ const b = document.getElementById('cmMdFloatBar'); if(b) b.remove(); }
  window.__cmSel = function(ev){
    const sel = window.getSelection();
    if(!sel || sel.isCollapsed){ hideFloat(); cmPending = null; return; }
    const text = sel.toString().trim();
    if(text.length < 2){ hideFloat(); cmPending = null; return; }
    const range = sel.rangeCount ? sel.getRangeAt(0) : null;
    if(!range) return;
    const holder = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    if(!holder || !holder.closest || !holder.closest('[data-cm-preview]')) return;
    cmPending = {
      text,
      snap: { sc: range.startContainer, so: range.startOffset, ec: range.endContainer, eo: range.endOffset },
      root: holder.closest('[data-cm-preview]')
    };
    let bar = document.getElementById('cmMdFloatBar');
    if(!bar){ bar = document.createElement('div'); bar.id = 'cmMdFloatBar'; document.body.appendChild(bar); }
    bar.innerHTML = '<span style="font-weight:600;font-size:11px;color:#8ce0d3">AI 修改：</span>'
      + '<button type="button" onclick="window.__cmAction(\'扩写\')">✦ 扩写</button>'
      + '<button type="button" onclick="window.__cmAction(\'简化\')">✦ 简化</button>'
      + '<button type="button" onclick="window.__cmAction(\'重写\')">✦ 重写</button>'
      + '<button type="button" onclick="window.__cmAction(\'润色\')">✦ 润色</button>';
    const rect = range.getBoundingClientRect();
    bar.style.top = Math.max(10, rect.top + window.scrollY - 44) + 'px';
    bar.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
  };
  function clip(s, n){ return String(s).length > n ? String(s).slice(0, n) + '…' : String(s); }
  function mockRewrite(action, text){
    const s = String(text).trim();
    const base = s.replace(/[。．.]$/, '');
    switch(action){
      case '扩写': return base + '。同时补充典型例题与易错提示，阐明适用条件与边界情形，便于课堂讲授与课后复习。';
      case '简化': return base.split(/[，,；;]/).filter(Boolean).slice(0, 2).join('，').replace(/[。．.]$/, '') + '。';
      case '重写': return '围绕“' + clip(base, 24) + '”重新表述：先阐明核心概念，再给出判断或操作方法，最后举例说明典型应用场景。';
      default: return base.replace(/能够/g,'能').replace(/进行/g,'做').replace(/对于/g,'对').replace(/主要/g,'') + '。';
    }
  }
  function logEl(){ return document.querySelector('.cm-ai-log'); }
  function statusEl(){ return document.querySelector('.cm-ai-status'); }
  function pushMsg(cls, html){ const log = logEl(); if(!log) return; const d = document.createElement('div'); d.className = 'chat-msg ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function pushStatus(t){ const s = statusEl(); if(s) s.textContent = t || ''; }

  function appendToMd(text){
    const card = document.querySelector('.cm-md-card');
    if(!card) return;
    const source = card.querySelector('.cm-md-source');
    const preview = card.querySelector('.cm-md-preview');
    const target = source && !source.hidden ? source : preview;
    const cur = source && !source.hidden ? source.value : mdFromDom(preview);
    const next = (cur ? cur + '\n\n' : '') + text;
    if(source && !source.hidden){ source.value = next; }
    else {
      const a = window.__sylMdApi;
      preview.innerHTML = a.html ? a.html(next) : '';
    }
  }
  function acceptSelection(candidate){
    const ctx = cmPending;
    cmPending = null;
    if(!ctx) return;
    const sc = ctx.snap.sc, so = ctx.snap.so, ec = ctx.snap.ec, eo = ctx.snap.eo;
    if(sc && ec && sc.isConnected && ec.isConnected){
      try{
        const range = document.createRange();
        range.setStart(sc, so);
        range.setEnd(ec, eo);
        range.deleteContents();
        range.insertNode(document.createTextNode(candidate));
      }catch(e){}
    }
    const preview = document.querySelector('[data-cm-preview]');
    if(preview){
      const source = document.querySelector('.cm-md-source');
      if(source) source.value = mdFromDom(preview);
    }
  }
  function sendSelection(action){
    const ctx = cmPending;
    if(!ctx){ pushStatus('请先在左侧 Markdown 预览中划选要修改的文本'); return; }
    hideFloat();
    pushMsg('user', esc('请' + action + '以下文本：' + clip(ctx.text, 200)));
    const candidate = mockRewrite(action, ctx.text);
    const reply = document.createElement('div');
    reply.className = 'chat-msg assistant';
    reply.innerHTML = '<div style="font-size:11px;color:#39514e">已生成「' + action + '」建议，点击「接纳」直接更新</div><div class="cm-reply-suggest"></div>';
    reply.querySelector('.cm-reply-suggest').textContent = candidate;
    const actions = document.createElement('div');
    actions.className = 'cm-reply-actions';
    const ok = document.createElement('button'); ok.type='button'; ok.className='btn primary'; ok.textContent='接纳';
    const no = document.createElement('button'); no.type='button'; no.className='btn secondary'; no.textContent='忽略';
    ok.onclick = () => { acceptSelection(candidate); ok.disabled = true; ok.textContent = '已接纳'; no.disabled = true; pushStatus('已更新教学内容'); };
    no.onclick = () => { cmPending = null; no.disabled = true; ok.disabled = true; no.textContent = '已忽略'; };
    actions.appendChild(ok); actions.appendChild(no);
    reply.appendChild(actions);
    const log = logEl();
    if(log){ log.appendChild(reply); log.scrollTop = log.scrollHeight; }
  }
  function sendPrompt(prompt){
    pushMsg('user', esc(prompt));
    const text = '已收到需求：「' + clip(prompt, 60) + '」。可在左侧 Markdown 预览中直接改文字；划选某段后用「扩写 / 简化 / 重写 / 润色」，我会把改写建议连同「接纳」按钮发到这里，点击即可更新教学内容。';
    const log = logEl();
    const reply = document.createElement('div');
    reply.className = 'chat-msg assistant';
    reply.textContent = text;
    if(log){ log.appendChild(reply); log.scrollTop = log.scrollHeight; }
    pushStatus('回复完成');
  }
  window.__cmAction = action => sendSelection(action);
  window.__cmSend = () => {
    const ta = document.querySelector('.cm-ai-compose textarea');
    if(!ta) return;
    const v = ta.value.trim();
    if(!v){ pushStatus('请先输入要修改的内容'); return; }
    ta.value = '';
    sendPrompt(v);
  };
  window.__cmQuick = p => { const ta = document.querySelector('.cm-ai-compose textarea'); if(ta) ta.value = p; sendPrompt(p); };

  /* ---------- hook into the chapter editor open (deterministic only) ---------- */
  let lastEnsure = 0;
  function ensure(){
    const now = Date.now();
    if(now - lastEnsure < 80) return; // throttle re-entrancy
    lastEnsure = now;
    const bg = document.getElementById('chapterEditorBg');
    if(!bg || !bg.classList.contains('open')) return;
    const form = formRef();
    if(!form) return;
    if(!form.dataset.cmBound) install(form);
    else refresh(form); // re-open for another chapter: refill from fields
    hideFloat();
  }
  // Late-injected textarea labels (13 注入 method/homework) are hidden inside
  // install + a single lightweight pass right after we open the editor.
  const hideTextLabels = (form) => {
    if(!form) return;
    const textNames = new Set(['content','requirements','keyPoints','difficultPoints','teachingMethod','method','homework','homeworkItem','ideology','knowledgePoints']);
    [...(form.elements || [])].forEach(el => {
      if(textNames.has(el.name) && /^(TEXTAREA|INPUT)$/i.test(el.tagName)){
        const label = el.closest('.chapter-editor-label');
        if(label && label.closest('.chapter-editor-main')) label.classList.add('chapter-md-hidden');
      }
    });
  };
  const runOnce = (fn, ms) => setTimeout(fn, ms);
  const wrapOpener = () => {
    const raw = window.openChapterEditor;
    if(raw && !raw.__cmWrapped){
      const wrapped = function(){
        const r = raw.apply(this, arguments);
        runOnce(ensure, 40); runOnce(ensure, 260); runOnce(ensure, 900);
        runOnce(() => { const f = formRef(); if(f) hideTextLabels(f); }, 400);
        return r;
      };
      wrapped.__cmWrapped = true;
      window.openChapterEditor = wrapped;
    }
    const official = window.openOfficialChapterEditor;
    if(official && !official.__cmWrapped2){
      const ow = function(){
        const r = official.apply(this, arguments);
        runOnce(ensure, 40); runOnce(ensure, 260); runOnce(ensure, 900);
        runOnce(() => { const f = formRef(); if(f) hideTextLabels(f); }, 400);
        return r;
      };
      ow.__cmWrapped2 = true;
      window.openOfficialChapterEditor = ow;
    }
  };
  // Watch for the chapter-editor modal. The modal element is created lazily on
  // first open (then stays in the DOM), so keep retrying until it appears, then
  // observe its class (open/close) and children.
  let moBound = false;
  if(window.MutationObserver){
    const mo = new MutationObserver(() => { wrapOpener(); ensure(); });
    const bindMo = () => {
      if(moBound) return;
      const bg = document.getElementById('chapterEditorBg');
      if(!bg) return;
      mo.observe(bg, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      moBound = true;
      ensure();
    };
    const retry = setInterval(bindMo, 500);
    // stop retrying once bound; also run an immediate attempt now
    const origBind = bindMo;
    window.__syllabusChapterMdBound = () => { clearInterval(retry); return moBound; };
    bindMo();
  }
  wrapOpener();
  runOnce(ensure, 700);
  runOnce(ensure, 1600);
  window.__syllabusChapterMd = { ensure, refresh };
})();