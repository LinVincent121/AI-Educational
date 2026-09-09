/* Prototype: multi-agent review group for the syllabus workspace. */
(function () {
  const roles = [
    ['教学设计专家', '检查目标、内容、课时和课堂可实施性'],
    ['学科专家', '检查专业准确性、知识衔接和内容深度'],
    ['教务主任', '检查模板、字段完整性和教务规范'],
    ['质量监控员', '检查目标、章节、作业和考核覆盖'],
    ['评估审查员', '检查培养目标、指标点和考核映射']
  ];
  const suggestions = [
    { role: '教学设计专家', level: '高', location: '课程目标', text: '补充一个与课程目标对应的课堂实践或案例环节。' },
    { role: '学科专家', level: '中', location: '课程教学内容', text: '增加一个专业应用案例，帮助学生理解知识点的实际使用场景。' },
    { role: '教务主任', level: '高', location: '学时分配表', text: '核对章节学时合计与课程总学时，确保与学校模板一致。' },
    { role: '质量监控员', level: '中', location: '考核与成绩评定', text: '补充课程目标与考核方式的对应关系。' },
    { role: '评估审查员', level: '低', location: '目标与毕业要求支撑', text: '进一步说明课程目标对毕业要求指标点的支撑依据。' }
  ];
  const extraByRole = {
    '教学设计专家': [{ level: '中', location: '教学方法', text: '增加一个课堂提问或小组讨论，强化目标达成。' }, { level: '低', location: '课程总结', text: '补充课后延伸任务，形成课内外学习衔接。' }],
    '学科专家': [{ level: '中', location: '知识衔接', text: '补充本章与前后章节的知识关联说明。' }, { level: '低', location: '参考资料', text: '增加一条近年专业参考资料或应用案例。' }],
    '教务主任': [{ level: '中', location: '教材信息', text: '补充教材版本、出版社和适用专业信息。' }, { level: '低', location: '格式规范', text: '统一各区块标题层级和表格字段命名。' }],
    '质量监控员': [{ level: '中', location: '知识点覆盖', text: '检查重点知识点是否均有教学活动或考核方式支撑。' }, { level: '低', location: '作业设计', text: '补充作业与章节目标的对应说明。' }],
    '评估审查员': [{ level: '中', location: '指标点映射', text: '为每个支撑关系补充可观察的达成依据。' }, { level: '低', location: '考核证据', text: '明确各考核环节对应的课程目标证据。' }]
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const key = 'ai-jiaowu-syllabus-agent-review-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const save = value => { try { localStorage.setItem(key, JSON.stringify(value.slice(-20))); } catch {} };
  let selected = new Set();
  let selectedRoles = new Set(roles.map(r => r[0]));
  let activeSuggestions = suggestions;
  let prepReviewSource = '';

  const style = document.createElement('style');
  style.textContent = `
    .syl-agent-drawer{position:fixed;z-index:1200;top:0;right:0;width:min(480px,92vw);height:100vh;background:#fff;box-shadow:-12px 0 35px rgba(20,65,60,.18);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .2s ease}
    .syllabus-3col-workspace.agent-review-mode{grid-template-columns:minmax(0,6fr) minmax(0,4fr);gap:12px;align-items:stretch}
    .agent-review-mode .syllabus-col-left{display:none}.agent-review-mode .syllabus-col-right{display:none}
    .prep-v3-workspace.agent-review-mode{grid-template-columns:minmax(0,6fr) minmax(0,4fr);gap:12px;align-items:stretch}.prep-v3-workspace.agent-review-mode .prep-v3-left{display:none}.prep-v3-workspace.agent-review-mode .prep-v3-right{display:none}.prep-v3-workspace.agent-review-mode .prep-v3-main{height:calc(100vh - 180px);max-height:none;overflow-y:auto}
    .syl-agent-drawer.inline{position:relative;inset:auto;z-index:1;width:auto;height:calc(100vh - 140px);min-height:0;transform:none;box-shadow:var(--shadow);border:1px solid var(--line);border-radius:14px;grid-column:2;grid-row:1}
    .prep-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}.agent-review-active{background:#087c72!important;border-color:#087c72!important}
    .syl-agent-accept{border:1px solid #bfe6dd;background:#f0fbf8;color:#0b897b;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;white-space:nowrap}.syl-agent-accept.accepted{background:#0b9c8c;color:#fff;border-color:#0b9c8c}
    .syl-agent-drawer.inline .syl-agent-body{min-height:0;overflow-y:auto}.syl-agent-drawer.inline+.syl-agent-overlay{display:none}.syl-agent-foot{flex-wrap:wrap}.syl-agent-foot .btn{white-space:nowrap}
    .agent-review-mode .syllabus-col-mid{height:calc(100vh - 140px);overflow-y:auto}.syl-review-document{padding:4px 2px 18px}.syl-review-md-section{padding:12px 14px;border-bottom:1px solid #e6efed}.syl-review-md-section h3{margin:0 0 8px;color:#1d5149;font-size:14px}.syl-review-md-section .md-preview-rendered{font-size:12px;line-height:1.7}
    .syl-agent-thinking-lines{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px}.syl-agent-thinking-lines li{opacity:.22;color:#52746e;font-size:12px;line-height:1.5}.syl-agent-thinking-lines li:before{content:'○';display:inline-block;width:18px;color:#9abbb5}.syl-agent-thinking-lines li.visible{opacity:1;color:#15927f}.syl-agent-thinking-lines li.visible:before{content:'✓';color:#0b9c8c}.syl-agent-suggest-actions{display:flex;gap:5px;align-items:center;margin-left:auto}.syl-agent-edit{border:1px solid #d9e8e5;background:#fff;color:#4e716c;border-radius:6px;padding:4px 7px;font-size:11px;cursor:pointer;white-space:nowrap}
    .syl-agent-role{display:flex;align-items:center;gap:8px}.syl-agent-role input{margin-left:auto;accent-color:#0b9c8c}.syl-agent-avatar{position:relative;width:30px;height:34px;flex:0 0 30px;animation:syl-agent-bob 1.8s ease-in-out infinite}.syl-agent-avatar:before{content:"";position:absolute;left:9px;top:2px;width:12px;height:12px;border-radius:50%;background:#f1b58d;border:2px solid #fff;box-shadow:0 0 0 1px #d7e9e5}.syl-agent-avatar:after{content:"";position:absolute;left:5px;top:16px;width:20px;height:16px;border-radius:11px 11px 6px 6px;background:#0b9c8c;box-shadow:inset 0 -4px 0 rgba(0,0,0,.08)}.syl-agent-avatar i,.syl-agent-avatar b{position:absolute;display:block;top:18px;width:10px;height:3px;border-radius:4px;background:#f1b58d;transform-origin:2px 2px}.syl-agent-avatar i{left:0;animation:syl-agent-wave 1.4s ease-in-out infinite}.syl-agent-avatar b{right:0;transform:rotate(-8deg)}@keyframes syl-agent-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes syl-agent-wave{0%,100%{transform:rotate(18deg)}50%{transform:rotate(48deg)}}
    .syl-agent-drawer.open{transform:translateX(0)} .syl-agent-head{padding:18px 20px;border-bottom:1px solid #e5efed;display:flex;justify-content:space-between;gap:12px}
    .syl-agent-head h2{margin:0;font-size:18px;color:#193f3a}.syl-agent-head p{margin:5px 0 0;color:#78908d;font-size:12px}.syl-agent-body{padding:14px 18px;overflow:auto;flex:1;background:#f8fbfa}
    .syl-agent-roster{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:12px}.syl-agent-role{padding:9px;background:#fff;border:1px solid #dcebe8;border-radius:9px;font-size:11px}.syl-agent-role b{display:block;color:#315a55}.syl-agent-role small{color:#15927f}.syl-agent-summary{background:#eef9f6;border:1px solid #cce9e2;border-radius:9px;padding:10px 12px;margin-bottom:12px;font-size:12px;color:#315a55;line-height:1.6}
    .syl-agent-card{background:#fff;border:1px solid #dcebe8;border-radius:10px;padding:12px;margin-bottom:9px}.syl-agent-card h4{margin:0 0 6px;color:#214b45;font-size:13px}.syl-agent-card p{margin:4px 0;color:#536f6b;font-size:12px;line-height:1.6}.syl-agent-suggest{border-top:1px dashed #dcebe8;margin-top:8px;padding-top:8px}.syl-agent-suggest label{display:flex;gap:8px;align-items:flex-start;font-size:12px;color:#365b56;line-height:1.5}.syl-agent-suggest em{font-style:normal;font-size:10px;color:#d27b38;border:1px solid #f0d3b4;border-radius:4px;padding:1px 4px;white-space:nowrap}.syl-agent-foot{padding:12px 18px;border-top:1px solid #e5efed;background:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px}.syl-agent-foot small{color:#6e8884}.syl-agent-overlay{position:fixed;inset:0;background:rgba(17,48,45,.2);z-index:1199;display:none}.syl-agent-overlay.open{display:block}
  `;
  document.head.appendChild(style);

  function renderDrawer() {
    if (document.getElementById('sylAgentDrawer')) return;
    const overlay = document.createElement('div'); overlay.id = 'sylAgentOverlay'; overlay.className = 'syl-agent-overlay';
    const drawer = document.createElement('aside'); drawer.id = 'sylAgentDrawer'; drawer.className = 'syl-agent-drawer';
    drawer.innerHTML = `<header class="syl-agent-head"><div><h2>专家讨论组</h2><p>当前大纲 · 评审意见与修改建议</p></div><button class="icon-btn" aria-label="关闭">×</button></header><div class="syl-agent-body"><div class="syl-agent-roster">${roles.map((r, i) => `<label class="syl-agent-role"><span class="syl-agent-avatar" aria-hidden="true"><i></i><b></b></span><span><b>${r[0]}</b><small>● 参与评审</small></span><input type="checkbox" data-agent-role="${i}" checked aria-label="${r[0]}参与评审"></label>`).join('')}</div><div class="syl-agent-summary">勾选参与评审的专家，启动评审，自动输出评审意见</div><div id="sylAgentResults"><button type="button" class="btn primary" id="sylAgentStart">启动专家评审</button></div></div><footer class="syl-agent-foot"><small id="sylAgentCount">尚未选择建议</small><button type="button" class="btn primary" id="sylAgentApply" disabled>基于采纳意见生成修改</button></footer>`;
    document.body.append(overlay, drawer);
    const close = () => {
      setReviewButton(false);
      drawer.classList.remove('open', 'inline'); overlay.classList.remove('open');
      const workspace = document.querySelector('.syllabus-3col-workspace, .prep-v3-workspace');
      if (workspace) workspace.classList.remove('agent-review-mode');
      document.body.appendChild(drawer);
      setTimeout(() => window.render?.(), 0);
    };
    drawer.querySelector('.icon-btn').onclick = close; overlay.onclick = close;
    drawer.querySelectorAll('[data-agent-role]').forEach(input => input.onchange = () => {
      const role = roles[Number(input.dataset.agentRole)][0];
      input.checked ? selectedRoles.add(role) : selectedRoles.delete(role);
      input.closest('.syl-agent-role')?.querySelector('small').replaceChildren(document.createTextNode(input.checked ? '● 参与评审' : '○ 未参与'));
    });
    drawer.querySelector('#sylAgentStart').onclick = runReview;
    drawer.querySelector('#sylAgentApply').onclick = rerunReview;
    drawer.querySelector('#sylAgentApply').textContent = '重新评审';
    drawer.querySelector('#sylAgentApply').disabled = false;
    drawer.querySelector('#sylAgentApply').style.display = 'none';
    const generate = document.createElement('button'); generate.type = 'button'; generate.className = 'btn primary'; generate.id = 'sylAgentGenerate'; generate.textContent = '基于采纳意见生成修改'; generate.disabled = true; generate.style.display = 'none'; generate.onclick = applySuggestions;
    drawer.querySelector('.syl-agent-foot')?.insertBefore(generate, drawer.querySelector('#sylAgentApply'));
  }
  function open() {
    setReviewButton(true);
    renderDrawer();
    const drawer = document.getElementById('sylAgentDrawer'), overlay = document.getElementById('sylAgentOverlay'), syllabus = location.hash === '#course/syllabus', workspace = document.querySelector(syllabus ? '.syllabus-3col-workspace' : '.prep-v3-workspace');
    if (workspace) { workspace.classList.add('agent-review-mode'); const mid = workspace.querySelector(syllabus ? '.syllabus-col-mid' : '.prep-v3-main'); if (!syllabus) prepReviewSource = document.getElementById('prepPreviewContainer')?.innerHTML || ''; if (mid) mid.innerHTML = syllabus ? reviewDocument() : prepReviewDocument(); workspace.appendChild(drawer); drawer.classList.add('inline'); }
    drawer.classList.add('open'); overlay.classList.remove('open');
  }
  function setReviewButton(active) {
    document.querySelectorAll('[data-agent-review]').forEach(button => { button.textContent = active ? '专家评审中' : '✦ 专家评审'; button.classList.toggle('agent-review-active', active); });
  }
  function reviewDocument() {
    const sections = window.__sylMdApi?.all?.() || [];
    return `<header class="outline-section-header"><div><div class="outline-step-label">完整教学大纲 / 专家评审</div><h2>教学大纲全文</h2><p class="muted">已合并 8 个大纲区块，评审结果将作用于完整内容。</p></div><span class="tag ok">评审对象</span></header><div class="syl-review-document" aria-label="完整教学大纲 Markdown 预览">${sections.map(s => `<section class="syl-review-md-section"><h3>${s.title}</h3><div class="md-preview-rendered">${window.__sylMdApi?.html?.(s.content) || esc(s.content)}</div></section>`).join('')}</div>`;
  }
  function prepReviewDocument() {
    return `<header class="outline-section-header"><div><div class="outline-step-label">备课内容 / 专家评审</div><h2>本节备课全文</h2><p class="muted">基于当前备课单元的完整 Markdown 内容进行评审。</p></div><span class="tag ok">评审对象</span></header><div class="syl-review-document"><section class="syl-review-md-section"><div class="md-preview-rendered">${prepReviewSource || '<p>当前备课内容为空</p>'}</div></section></div>`;
  }
  function runReview() {
    const results = document.getElementById('sylAgentResults'); if (!results) return;
    const rerun = document.getElementById('sylAgentApply'); if (rerun) rerun.style.display = 'none';
    const chosenRoles = new Set(selectedRoles);
    activeSuggestions = suggestions.filter(s => chosenRoles.has(s.role));
    chosenRoles.forEach(role => (extraByRole[role] || []).slice(0, Math.random() < .5 ? 1 : 2).forEach(s => activeSuggestions.push({ role, ...s })));
    if (!activeSuggestions.length) { window.showSyllabusToast?.('请至少选择一位专家参与评审。'); return; }
    const thinking = location.hash === '#course/preparation'
      ? ['读取当前备课单元的教案、教学目标和教材内容', '核对教学重点难点、课堂活动与学时安排', '检查教案结构、知识覆盖和课堂可实施性', '形成可供教师确认的备课修改建议']
      : ['读取当前大纲区块与课程上下文', '核对目标、章节、课时与教学要求的对应关系', '整理可能存在的缺失项和可优化内容', '形成可供教师确认的大纲修改建议'];
    results.innerHTML = [...chosenRoles].map(role => `<article class="syl-agent-card syl-agent-thinking"><h4>${role} <span class="tag">分析中</span></h4><ul class="syl-agent-thinking-lines">${thinking.map((line, i) => `<li data-thinking-step="${i}">${line}</li>`).join('')}</ul></article>`).join('');
    let step = 0; const thinkingTimer = setInterval(() => { results.querySelectorAll(`[data-thinking-step="${step}"]`).forEach(el => el.classList.add('visible')); step++; if (step >= thinking.length) clearInterval(thinkingTimer); }, 820);
    setTimeout(() => {
      clearInterval(thinkingTimer);
      results.innerHTML = [...chosenRoles].map(role => { const list = activeSuggestions.map((s, i) => ({ s, i })).filter(x => x.s.role === role); return `<article class="syl-agent-card"><h4>${role} <span class="tag ok">已完成</span></h4><p>评审分析摘要：已完成上下文检查，整理出以下可处理意见。</p>${list.map(({ s, i }) => `<div class="syl-agent-suggest" data-agent-index="${i}"><label><em>${s.level}优先级</em><span class="syl-agent-suggest-text"><b>${s.location}</b><br>${s.text}</span><span class="syl-agent-suggest-actions"><button type="button" class="syl-agent-accept" data-agent-suggestion="${i}">采纳</button><button type="button" class="syl-agent-edit" data-agent-edit="${i}">修改</button></span></label></div>`).join('')}</article>`; }).join('');
      results.querySelectorAll('[data-agent-suggestion]').forEach(button => button.onclick = () => { const i = Number(button.dataset.agentSuggestion); if(selected.has(i)){ selected.delete(i); button.classList.remove('accepted'); button.textContent = '采纳'; } else { selected.add(i); button.classList.add('accepted'); button.textContent = '已采纳'; } updateCount(); });
      results.querySelectorAll('[data-agent-edit]').forEach(button => button.onclick = () => { const i = Number(button.dataset.agentEdit), value = window.prompt('修改专家建议', activeSuggestions[i]?.text || ''); if(!value?.trim()) return; activeSuggestions[i].text = value.trim(); const text = button.closest('[data-agent-index]')?.querySelector('.syl-agent-suggest-text'); if(text) text.innerHTML = `<b>${esc(activeSuggestions[i].location)}</b><br>${esc(activeSuggestions[i].text)}`; });
      selected = new Set(); updateCount(); if (rerun) rerun.style.display = '';
    }, 3000 + Math.floor(Math.random() * 2001));
  }
  function rerunReview() {
    if (!selectedRoles.size) {
      window.showSyllabusToast?.('请至少选择一位专家参与评审。');
      return;
    }
    selected.clear(); updateCount(); runReview();
  }
  function updateCount() { const count = document.getElementById('sylAgentCount'), generate = document.getElementById('sylAgentGenerate'), ready = selected.size > 0; if (count) count.textContent = `已采纳 ${selected.size} 条建议`; if (generate) { generate.disabled = !ready; generate.style.display = ready ? '' : 'none'; generate.classList.toggle('syl-agent-generate-ready', ready); } }
  function applySuggestions() {
    const chosen = activeSuggestions.filter((_, i) => selected.has(i));
    if (!chosen.length) { window.showSyllabusToast?.('请先采纳至少一条专家建议。'); return; }
    const section = window.__sylMdApi?.active?.() || 'purpose';
    if (location.hash === '#course/preparation') {
      prepReviewSource += '<p><em>专家评审修改示意：已根据采纳意见完成教学目标与课堂活动优化。</em></p>';
      const main = document.querySelector('.prep-v3-workspace.agent-review-mode .prep-v3-main'); if (main) main.innerHTML = prepReviewDocument();
    } else if (section !== 'content' && window.__sylMdApi) {
      const old = window.__sylMdApi.get(section); const block = '\n\n> 专家评审修改示意：已完成课程目标、教学内容与考核关系优化。';
      window.__sylMdApi.set(section, old.replace(/\s*$/, '') + block); window.__sylMdApi.refreshPreview(section);
      const mid = document.querySelector('.agent-review-mode .syllabus-col-mid'); if(mid) mid.innerHTML = reviewDocument();
    }
    const history = read(); history.push({ at: new Date().toISOString(), section, accepted: chosen.map(s => ({ role: s.role, location: s.location, text: s.text })) }); save(history);
    document.getElementById('sylAgentGenerate').disabled = true;
    window.showSyllabusToast?.('已基于专家建议生成大纲修改草稿，并保留修改记录');
  }
  function injectButton() {
    const syllabus = location.hash === '#course/syllabus';
    const prep = location.hash === '#course/preparation';
    if (!syllabus && !prep) return;
    const head = document.querySelector(syllabus ? '.syllabus-head-actions' : '.prep-title-row'); if (!head || head.querySelector('[data-agent-review]')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn primary'; b.dataset.agentReview = '1'; b.textContent = '✦ 专家评审'; b.onclick = open; b.style.marginLeft = 'auto'; head.appendChild(b);
  }
  window.openSyllabusAgentReview = open;
  setInterval(injectButton, 500); window.addEventListener('hashchange', () => setTimeout(injectButton, 80));
})();
