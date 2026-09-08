/* Syllabus AI assistant v2 (loads after 05-syllabus-workspace.js):
 *  - keeps the MD preview editable inline and persists edits back to Markdown,
 *  - routes selection AI actions (polish/expand/simplify/rewrite) into the chat
 *    as a real assistant turn with an 接纳 (accept) button that updates the text,
 *  - removes the previous fake "MOCK streaming" typewriter, and
 *  - stretches the right AI column to match the left outline rail height with
 *    an internal scroll for the chat log.
 */
(function(){
  const isSyllabus = () => location.hash === '#course/syllabus';
  const api = () => window.__sylMdApi || null;

  /* ---------- Markdown serialization (DOM -> Markdown) ---------- */
  const escRe = /[&<>"']/g;
  // Plain-text flattening used for leaf paragraph/list/table cells.
  function inline(node){
    let s = '';
    if(!node || !node.childNodes) return s;
    node.childNodes.forEach(n => {
      if(n.nodeType === 3){ s += n.nodeValue; return; }
      if(n.nodeType !== 1) return;
      const tag = n.tagName.toLowerCase();
      if(tag === 'br'){ s += '\n'; return; }
      const inner = inline(n);
      if(tag === 'strong' || tag === 'b') s += '**' + inner + '**';
      else s += inner;
    });
    return s;
  }
  function normalize(t){
    return String(t)
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\n+|\n+$/g, '');
  }
  // Turn rendered <br> (line breaks inside a table cell / list item) back into
  // a literal "<br>" so re-rendering keeps the same line structure.
  function cellText(node){
    return inline(node).split('\n').map(s => s.trim()).filter(Boolean).join('<br>');
  }
  function tableMd(table){
    const rows = [];
    const theadTr = table.querySelector('thead tr');
    const header = theadTr ? Array.from(theadTr.children).map(cellText) : null;
    if(header && header.some(Boolean)){
      rows.push('| ' + header.join(' | ') + ' |');
      rows.push('|' + header.map(() => ' --- ').join('|') + '|');
    }
    Array.from(table.querySelectorAll('tbody tr')).forEach(tr => {
      const cells = Array.from(tr.children).map(cellText);
      if(cells.some(Boolean)) rows.push('| ' + cells.join(' | ') + ' |');
    });
    return rows.join('\n');
  }
  // Block-aware serializer: rendered blocks plus any bare <div>/<p> the browser
  // creates while typing round-trip to Markdown with paragraph breaks, so the
  // 01~08 outline keeps correct line structure, symbols and escaping on edit.
  function mdFromDom(root){
    const paras = [];
    let buf = '';
    const flush = () => {
      const t = normalize(buf);
      buf = '';
      if(t) paras.push(t);
    };
    const handleNode = (node) => {
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
        const t = normalize(cellText(node));
        if(t) paras.push('#'.repeat(Number(tag[1])) + ' ' + t);
        return;
      }
      if(tag === 'ul' || tag === 'ol'){
        flush();
        const list = [];
        node.childNodes.forEach(li => {
          if(li.nodeType !== 1) return;
          const lt = li.tagName.toLowerCase();
          if(lt === 'li'){
            const t = normalize(cellText(li));
            if(t) list.push((tag === 'ol' ? '1. ' : '- ') + t);
          } else handleNode(li);
        });
        if(list.length) paras.push(list.join('\n'));
        return;
      }
      if(tag === 'li'){
        flush();
        const t = normalize(cellText(node));
        if(t) paras.push('- ' + t);
        return;
      }
      if(tag === 'table'){
        flush();
        const t = tableMd(node);
        if(t) paras.push(t);
        return;
      }
      if(tag === 'blockquote'){
        flush();
        const lines = [];
        node.childNodes.forEach(c => {
          if(c.nodeType === 1 && c.textContent && c.textContent.trim()) lines.push(normalize(cellText(c)));
        });
        if(lines.length) paras.push(lines.map(l => '> ' + l).join('\n'));
        return;
      }
      if(tag === 'p' || tag === 'div' || tag === 'section' || tag === 'article'){
        // Structural wrapper (browser splits paragraphs into nested blocks)?
        const hasBlock = Array.from(node.children).some(c => {
          const t = c.tagName.toLowerCase();
          return /^(h[1-6]|ul|ol|table|blockquote|p|div|section)$/.test(t);
        });
        if(hasBlock){
          flush();
          node.childNodes.forEach(handleNode);
          return;
        }
        const t = normalize(inline(node));
        flush();
        if(t) paras.push(t);
        return;
      }
      // inline wrappers (span/strong/em/…)
      Array.from(node.childNodes).forEach(handleNode);
    };
    root.childNodes.forEach(handleNode);
    flush();
    return paras.join('\n\n');
  }

  /* ---------- inline edit persistence ---------- */
  const timers = {};
  function persistPreview(id){
    const root = document.querySelector('[data-outline-preview="' + id + '"]');
    const a = api();
    if(root && a) a.set(id, mdFromDom(root));
  }
  window.onSyllabusPreviewInput = (id) => {
    clearTimeout(timers[id]);
    timers[id] = setTimeout(() => persistPreview(id), 320);
  };
  window.onSyllabusPreviewBlur = (id) => {
    clearTimeout(timers[id]);
    persistPreview(id);
  };

  /* ---------- selection AI actions: straight into the chat ---------- */
  let sylPending = null;
  const clip = (s, n) => String(s).length > n ? String(s).slice(0, n) + '…' : String(s);
  const hideFloat = () => {
    const b = document.getElementById('mdAiFloatingBar');
    if(b) b.remove();
  };

  function mockRewrite(action, original){
    const s = String(original).trim();
    const base = s.replace(/[。．.]$/, '');
    let out;
    switch(action){
      case '扩写':
        out = base + '。同时补充典型例题与易错提示，阐明适用条件与边界情形，便于课堂讲授与课后复习。';
        break;
      case '简化':
        out = base.split(/[，,；;]/).filter(Boolean).slice(0, 2).join('，').replace(/[。．.]$/, '') + '。';
        break;
      case '重写':
        out = '围绕“' + clip(base, 24) + '”重新表述：先阐明核心概念，再给出判断或操作方法，最后举例说明典型应用场景。';
        break;
      default:
        out = base.replace(/能够/g, '能').replace(/进行/g, '做').replace(/对于/g, '对').replace(/主要/g, '') + '。';
        if(out === s) out = base.replace(/[。．.]$/, '') + '（已进一步规范书面表达）。';
        break;
    }
    return out;
  }

  function applySuggestion(ctx, candidate, acceptBtn, ignoreBtn){
    const a = api();
    if(!a) return;
    const id = ctx.id;
    let root = (ctx.previewRoot && ctx.previewRoot.isConnected) ? ctx.previewRoot : document.querySelector('[data-outline-preview="' + id + '"]');
    let replaced = false;
    if(root && ctx.snap){
      const sc = ctx.snap.startContainer, ec = ctx.snap.endContainer;
      if(sc && ec && sc.isConnected && ec.isConnected){
        try{
          const range = document.createRange();
          range.setStart(sc, ctx.snap.startOffset);
          range.setEnd(ec, ctx.snap.endOffset);
          const ca = range.commonAncestorContainer;
          const holder = ca && (ca.nodeType === 1 ? ca : ca.parentElement);
          if(holder && holder.closest && holder.closest('[data-outline-preview]')){
            range.deleteContents();
            range.insertNode(document.createTextNode(candidate));
            replaced = true;
          }
        }catch(e){ replaced = false; }
      }
    }
    if(!replaced){
      const md = a.get(id);
      const i = md.indexOf(ctx.text);
      if(i >= 0) a.set(id, md.slice(0, i) + candidate + md.slice(i + ctx.text.length));
      else a.set(id, (md ? md + '\n\n' : '') + candidate);
    } else if(root){
      a.set(id, mdFromDom(root));
    }
    root = document.querySelector('[data-outline-preview="' + id + '"]') || root;
    if(root) a.refreshPreview(id);
    sylPending = null;
    if(acceptBtn){ acceptBtn.disabled = true; acceptBtn.textContent = '已接纳'; }
    if(ignoreBtn) ignoreBtn.disabled = true;
    if(window.showSyllabusToast) window.showSyllabusToast('已接纳改写建议，大纲文本已更新');
    syncHeights();
  }

  function sendSelectionReply(ctx, action){
    const log = document.getElementById('syllabusChatLog');
    const status = document.getElementById('syllabusChatStatus');
    if(!log) return;
    const user = document.createElement('div');
    user.className = 'chat-msg user';
    user.textContent = '请' + action + '以下文本：' + ctx.text;
    log.appendChild(user);

    const reply = document.createElement('div');
    reply.className = 'chat-msg assistant';
    const candidate = mockRewrite(action, ctx.text);
    reply.innerHTML = '<div class="syl-reply-head">已生成「' + action + '」建议 · 点击「接纳」直接更新大纲文本</div>'
      + '<div class="syl-suggest"></div>';
    reply.querySelector('.syl-suggest').textContent = candidate;
    const actions = document.createElement('div');
    actions.className = 'syl-actions';
    const accept = document.createElement('button');
    accept.type = 'button'; accept.className = 'btn primary'; accept.textContent = '接纳';
    const ignore = document.createElement('button');
    ignore.type = 'button'; ignore.className = 'btn secondary'; ignore.textContent = '忽略';
    accept.onclick = () => applySuggestion(ctx, candidate, accept, ignore);
    ignore.onclick = () => {
      sylPending = null;
      accept.disabled = true;
      ignore.disabled = true;
      ignore.textContent = '已忽略';
    };
    actions.appendChild(accept);
    actions.appendChild(ignore);
    reply.appendChild(actions);
    log.appendChild(reply);
    log.scrollTop = log.scrollHeight;
    if(status) status.textContent = '已生成「' + action + '」改写建议，可点击「接纳」应用';
  }

  window.triggerAiSelectionAction = (action) => {
    hideFloat();
    const ctx = sylPending;
    const sel = window.getSelection();
    if(sel) sel.removeAllRanges();
    if(!ctx || !ctx.text){
      if(window.showSyllabusToast) window.showSyllabusToast('请先在大纲正文中划选要修改的文本');
      return;
    }
    sendSelectionReply(ctx, action);
  };

  window.handleTextSelection = () => {
    const sel = window.getSelection();
    if(!sel || sel.isCollapsed){ hideFloat(); sylPending = null; return; }
    const text = sel.toString().trim();
    if(text.length < 2){ hideFloat(); sylPending = null; return; }
    const range = sel.rangeCount ? sel.getRangeAt(0) : null;
    if(!range) return;
    const anchor = range.startContainer;
    const holder = anchor && (anchor.nodeType === 1 ? anchor : anchor.parentElement);
    const root = holder && holder.closest ? holder.closest('[data-outline-preview]') : null;
    if(!root) return;
    const id = root.getAttribute('data-outline-preview');
    const snap = {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset
    };
    sylPending = { id, text, snap, previewRoot: root };

    let bubble = document.getElementById('mdAiFloatingBar');
    if(!bubble){
      bubble = document.createElement('div');
      bubble.id = 'mdAiFloatingBar';
      bubble.className = 'md-ai-float-bubble';
      document.body.appendChild(bubble);
    }
    bubble.innerHTML = '<span style="font-weight:600;font-size:11px;margin-right:2px;color:#8ce0d3">AI 修改：</span>'
      + '<button type="button" onclick="triggerAiSelectionAction(\'扩写\')">✦ 扩写</button>'
      + '<button type="button" onclick="triggerAiSelectionAction(\'简化\')">✦ 简化</button>'
      + '<button type="button" onclick="triggerAiSelectionAction(\'重写\')">✦ 重写</button>'
      + '<button type="button" onclick="triggerAiSelectionAction(\'润色\')">✦ 润色</button>';
    const rect = range.getBoundingClientRect();
    bubble.style.top = Math.max(10, rect.top + window.scrollY - 42) + 'px';
    bubble.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
  };

  /* ---------- direct chat send (no fake MOCK streaming) ---------- */
  function genericReply(prompt){
    return '已收到你的需求：「' + clip(prompt, 60) + '」。'
      + '建议先在当前区块中确认要点，再进入下一步。更具体的改写可以在大纲正文中划选文字后选择「扩写 / 简化 / 重写 / 润色」，我会把改写结果连同「接纳」按钮发到这里，点击即可直接更新大纲文本。';
  }
  window.sendSyllabusPrompt = () => {
    const input = document.getElementById('syllabusPrompt');
    const log = document.getElementById('syllabusChatLog');
    const status = document.getElementById('syllabusChatStatus');
    if(!input || !log) return;
    const prompt = input.value.trim();
    if(!prompt){
      if(status) status.textContent = '请先描述要生成或修改的内容。';
      input.focus();
      return;
    }
    sylPending = null;
    hideFloat();
    const user = document.createElement('div');
    user.className = 'chat-msg user';
    user.textContent = prompt;
    log.appendChild(user);
    input.value = '';
    log.scrollTop = log.scrollHeight;
    const reply = document.createElement('div');
    reply.className = 'chat-msg assistant';
    reply.innerHTML = '<span class="syl-thinking">正在结合当前大纲内容整理建议…</span>';
    log.appendChild(reply);
    log.scrollTop = log.scrollHeight;
    if(status) status.textContent = '正在生成回复…';
    const finalText = genericReply(prompt);
    setTimeout(() => {
      if(!reply.isConnected) return;
      reply.innerHTML = '';
      reply.textContent = finalText;
      log.scrollTop = log.scrollHeight;
      if(status) status.textContent = '回复完成 · 可直接输入下一项需求';
    }, 420);
  };
  window.sendQuickAiPrompt = (promptText) => {
    const input = document.getElementById('syllabusPrompt');
    if(input) input.value = promptText;
    window.sendSyllabusPrompt();
  };

  /* ---------- match the right AI column height to the left outline rail ----------
     The chat log must scroll internally once messages exceed the allotted
     height: fix the column height to the rail, then let the log flex-shrink
     (min-height:0) so overflow goes into the log's own scrollbar instead of
     stretching the whole page. */
  function syncHeights(){
    if(!isSyllabus()) return;
    const col = document.querySelector('.syllabus-col-right');
    const left = document.querySelector('.syllabus-col-left .outline-progress');
    const log = col ? col.querySelector('#syllabusChatLog') : null;
    if(!col || !left || !log) return;
    const leftH = Math.round(left.getBoundingClientRect().height);
    if(leftH < 160) return;
    col.style.height = leftH + 'px';
    col.style.minHeight = leftH + 'px';
    col.style.maxHeight = leftH + 'px';
    col.style.overflow = 'hidden';
    log.style.flex = '1 1 auto';
    log.style.minHeight = '0';
    log.style.maxHeight = 'none';
    log.style.overflowY = 'auto';
    log.style.overflowX = 'hidden';
  }
  window.addEventListener('hashchange', () => setTimeout(syncHeights, 160));
  setInterval(() => { if(isSyllabus()) syncHeights(); }, 900);
  setTimeout(syncHeights, 220);
  document.addEventListener('DOMContentLoaded', () => setTimeout(syncHeights, 320));
  if(location.hash === '#course/syllabus') setTimeout(syncHeights, 200);
})();
