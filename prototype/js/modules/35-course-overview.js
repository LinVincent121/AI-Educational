/* 课程总览 v2：按 01-课程工作空间 PRD CO-05 重构，整合大纲/日历/备课/课件/作业/试卷/学情的既定演示数据。
   仅接管 #course/overview 路由（链式覆盖），不改动其他页面。 */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const cid = () => { try { return localStorage.getItem('ai-jiaowu-current-course') || 'discrete' } catch { return 'discrete' } };
  const readJson = k => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v && typeof v === 'object' ? v : null } catch { return null } };

  /* 各模块既定演示事实（与 05 大纲、19 日历、20 课件、27 备课、32 试卷、34 作业、24 学情页面一致） */
  const COURSES = {
    discrete: {
      name: '离散数学', code: 'AI120030', term: '2026 秋季', version: 'v3', statusTag: 'ok', statusText: '可使用',
      owner: '林老师', teacher: '张寒', credit: '3 学分', hours: '48 学时',
      classes: '智科 25-1 / 25-2', students: '46 / 50 名学生',
      week: '第 3 周 / 16 周', weekChapter: '第一章 · 第二节 关系', weekHours: '本周 6 学时',
      textbook: '《离散数学》（第 2 版）', structure: '4 章 · 章节树已确认', kb: '61 个知识点 · 42 个已映射章节',
      syllabusVersion: 'v3', syllabusTag: '已定版', syllabusNote: '教秘审核通过 · 8 大结构区块',
      calendarVersion: 'v3', calendarDefault: 'pending_review',
      prepChapter: '第 4 章 · 图论', prepNote: '草稿 · 上次编辑 2 小时前 · 4 章主线已建立',
      courseware: '3 个章节课件 · 第二章 57 / 91 页已生成 · 知识点覆盖 82%',
      assignment: '知识库 268 题 · 214 道已验证 · 章节作业 3 份 · 1 份待核对',
      exam: '题库 2 个 · 214 题（教材解析 128 + 历史导入 86）· 期中试卷待审核',
      learningAvg: '78.6', learningPass: '86%', learningWatch: '4 人需关注', learningNote: '章节掌握 71% · 图与网络 58% / 代数系统 49% 偏弱',
      materials: '24 份文件 · 3 个解析任务进行中',
      review: '待审核 2 项 · 教学日历今日 18:00 截止',
      todos: [
        { t: '教学日历 v3 待教秘核对', s: '审核 SLA 3 个工作日 · 截止今天 18:00', tag: '即将逾期', hot: true, href: '#course/calendar' },
        { t: '期中试卷 v3 待教秘审核', s: '正式试卷必须审核 · 截止明天 12:00', tag: '审核中', href: '#course/exam' },
        { t: '成绩导入存在 4 条 warning', s: '2 条成绩异常待核查 · 导入批次 9 月 2 日', tag: '待核查', href: '#course/students' }
      ],
      activities: [
        { t: '大纲 v3 更新章节结构', time: '今天 10:24', href: '#course/syllabus' },
        { t: '教学日历 v3 提交教秘核对', time: '昨天 17:40', href: '#course/calendar' },
        { t: '第二章课件生成至 57 / 91 页', time: '9 月 8 日', href: '#course/courseware' },
        { t: '导入成绩完成 · 4 条 warning', time: '9 月 2 日', href: '#course/students' }
      ]
    },
    economics: {
      name: '经济学原理', code: 'ECON101', term: '2026 秋季', version: 'v1', statusTag: 'ok', statusText: '可使用',
      owner: '林老师', teacher: '林老师', credit: '3 学分', hours: '48 学时',
      classes: '经管 25-1 / 25-2', students: '48 名学生 · 2 个班级',
      week: '第 3 周 / 16 周', weekChapter: '1.2 需求、供给与市场均衡', weekHours: '本周 4 学时',
      textbook: '《经济学原理》（第 8 版）', structure: '4 章 · 12 小节 · 章节树已确认', kb: '61 个知识点 · 42 个已映射章节',
      syllabusVersion: 'v1', syllabusTag: '已定版', syllabusNote: '教秘审核通过 · 8 大结构区块',
      calendarVersion: 'v1', calendarDefault: 'pending_review',
      prepChapter: '第二章 · 市场结构与竞争', prepNote: '草稿 · 上次编辑 2 小时前 · 4 章主线已建立',
      courseware: '3 个章节课件 · 第二章 57 / 91 页已生成 · 知识点覆盖 82%',
      assignment: '知识库 268 题 · 214 道已验证 · 3 份章节作业 · 1 份待核对',
      exam: '题库 2 个 · 214 题（教材解析 128 + 案例导入 86）· 阶段测验待审核',
      learningAvg: '78.6', learningPass: '86%', learningWatch: '4 人需关注', learningNote: '章节掌握 71% · 市场结构与竞争 58% / 宏观经济指标 49% 偏弱',
      materials: '24 份文件 · 3 个解析任务进行中',
      review: '待审核 2 项 · 教学日历今日 18:00 截止',
      todos: [
        { t: '经济学教学日历 v1 待教秘核对', s: '审核 SLA 3 个工作日 · 截止今天 18:00', tag: '即将逾期', hot: true, href: '#course/calendar' },
        { t: '经济学阶段测验待教秘审核', s: '正式试卷必须审核 · 截止明天 12:00', tag: '审核中', href: '#course/exam' },
        { t: '案例题库解析 6 道题待核对', s: '《经济学案例题库.xlsx》解析 42 题 · 6 道待核对', tag: '待核对', href: '#course/assignment' }
      ],
      activities: [
        { t: '大纲 v1 教秘审核通过并定版', time: '9 月 8 日', href: '#course/syllabus' },
        { t: '经济学教学日历 v1 提交核对', time: '昨天 17:40', href: '#course/calendar' },
        { t: '上传《经济学案例题库.xlsx》· 解析 42 题', time: '9 月 7 日', href: '#course/assignment' },
        { t: '第二章备课草稿更新', time: '2 小时前', href: '#course/preparation' }
      ]
    }
  };
  const facts = () => COURSES[cid()] || COURSES.discrete;

  /* 读取各模块落在 localStorage 的实时状态（缺失时回落演示默认值） */
  const liveSyllabusBlocks = () => {
    const st = readJson('ai-jiaowu-syllabus-outline-state-v4-' + cid());
    if (!st || !st.status || typeof st.status !== 'object') return 8;
    const done = Object.values(st.status).filter(v => v === 'done').length;
    return done >= 6 ? done : 8;
  };
  const calendarKey = () => cid() === 'discrete' ? 'ai-jiaowu-calendar-demo-v1' : 'ai-jiaowu-calendar-demo-v1-' + cid();
  const liveCalendarStatus = () => {
    const st = readJson(calendarKey());
    return st && st.status ? st.status : facts().calendarDefault;
  };
  const calendarText = s => ({ draft: '草稿', editing: '编辑中', pending_review: '待教秘核对', approved: '已发布' }[s] || '待教秘核对');

  /* 推荐操作按 PRD 8.3 由课程状态计算，不写死按钮 */
  function recommend() {
    const d = facts(), cal = liveCalendarStatus();
    const state = { material: 'ready', structure: 'confirmed', kb: 'ready', syllabus: 'approved', calendar: cal, grades: true };
    if (state.material === 'not_started') return { main: ['上传主教材', '#materials'], sub: null };
    if (state.material === 'processing') return { main: ['查看资料处理进度', '#materials'], sub: ['返回课程列表', '#courses'] };
    if (state.structure !== 'confirmed') return { main: ['确认教材目录', '#materials'], sub: ['查看解析异常', '#notifications'] };
    if (state.syllabus === 'not_created') return { main: ['生成教学大纲', '#course/syllabus'], sub: ['查看课程资料', '#materials'] };
    if (state.syllabus === 'draft') return { main: ['继续编辑大纲', '#course/syllabus'], sub: ['运行大纲检查', '#course/syllabus'] };
    if (state.syllabus === 'pending_review') return { main: ['查看大纲审核任务', '#course/version-review'], sub: ['查看审核意见', '#notifications'] };
    if (state.calendar === 'not_created') return { main: ['生成教学日历', '#course/calendar'], sub: ['查看正式大纲', '#course/syllabus'] };
    if (state.calendar === 'pending_review') return { main: ['查看教学日历审核任务', '#course/calendar'], sub: ['继续「' + d.prepChapter + '」备课', '#course/preparation'] };
    if (state.calendar === 'approved') return { main: ['进入章节备课', '#course/preparation'], sub: ['查看学情分析', '#course/students'] };
    return { main: ['完善并提交教学日历', '#course/calendar'], sub: ['查看正式大纲', '#course/syllabus'] };
  }

  let styleAdded = false;
  function addStyle() {
    if (styleAdded) return; styleAdded = true;
    const style = document.createElement('style');
    style.textContent = `
      .ov-page{--ov-ink:#132d3d;--ov-muted:#6b8284;--ov-line:#d9e6e1;--ov-mint:#0c8f82;--ov-mint-soft:#e8f7f2;--ov-coral:#d9824c;--ov-coral-soft:#fff1e8;display:grid;gap:15px;color:var(--ov-ink)}
      .ov-hero{display:flex;justify-content:space-between;gap:24px;padding:24px 28px;background:linear-gradient(120deg,#142f40,#20545a);border-radius:18px;color:#f4fffc;overflow:hidden;position:relative}
      .ov-hero:after{content:'OV';position:absolute;right:22px;bottom:-30px;font:700 120px/1 Georgia,serif;color:rgba(255,255,255,.05)}
      .ov-kicker{font-size:10px;letter-spacing:.18em;color:#83d8c7}
      .ov-hero h1{margin:7px 0 10px;font:700 28px/1.15 Georgia,'Microsoft YaHei',serif}
      .ov-hero h1 small{margin-left:9px;padding:3px 9px;border:1px solid rgba(255,255,255,.28);border-radius:999px;font:600 11px/1 system-ui;vertical-align:4px;color:#cfeee7}
      .ov-hero-meta{display:flex;gap:7px 16px;flex-wrap:wrap;max-width:640px;color:#b8d4d0;font-size:12px}
      .ov-hero-meta b{color:#f0a16a;font-weight:700}
      .ov-hero-meta span:before{content:'·';margin-right:16px;color:rgba(255,255,255,.35)}
      .ov-hero-meta span:first-child:before{content:'';margin:0}
      .ov-week{position:relative;z-index:1;flex:0 0 252px;padding:16px 18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:14px;backdrop-filter:blur(2px)}
      .ov-week span{display:block;color:#83d8c7;font-size:10px;letter-spacing:.12em}
      .ov-week b{display:block;margin:8px 0 5px;font:700 21px/1 ui-monospace,monospace}
      .ov-week em{display:block;font-style:normal;color:#d7ece7;font-size:12px;line-height:1.6}
      .ov-init{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .ov-init-step{display:flex;gap:11px;align-items:flex-start;padding:13px 15px;background:#fff;border:1px solid var(--ov-line);border-radius:13px}
      .ov-init-step i{flex:0 0 22px;height:22px;border-radius:50%;background:var(--ov-mint-soft);color:var(--ov-mint);font:700 12px/22px system-ui;text-align:center;font-style:normal}
      .ov-init-step b{display:block;font-size:12px}
      .ov-init-step small{display:block;margin-top:4px;color:var(--ov-muted);font-size:10.5px;line-height:1.5}
      .ov-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .ov-stat{display:block;padding:14px 16px;background:#fff;border:1px solid var(--ov-line);border-radius:13px;text-decoration:none;color:var(--ov-ink);transition:.16s}
      .ov-stat:hover{border-color:#8fd4c9;transform:translateY(-1px)}
      .ov-stat span{display:block;color:var(--ov-muted);font-size:11px}
      .ov-stat strong{display:block;margin-top:7px;font:700 22px/1 ui-monospace,monospace}
      .ov-stat em{display:block;margin-top:6px;font-style:normal;font-size:10.5px}
      .ov-stat em.mint{color:var(--ov-mint)}.ov-stat em.coral{color:var(--ov-coral)}
      .ov-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:15px;align-items:start}
      .ov-panel{background:#fff;border:1px solid var(--ov-line);border-radius:15px;box-shadow:0 8px 22px rgba(24,64,71,.05);margin-bottom:15px}
      .ov-panel-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:16px 19px 11px;border-bottom:1px solid #eef5f2}
      .ov-panel-head h2{margin:0;font:700 16px/1.2 Georgia,'Microsoft YaHei',serif}
      .ov-panel-head a{color:var(--ov-mint);font-size:11px;text-decoration:none;white-space:nowrap}
      .ov-panel-body{padding:13px 19px 17px}
      .ov-rec{display:flex;gap:13px;align-items:center;padding:15px 16px;border:1px solid #cbe8e1;background:linear-gradient(135deg,#f2fbf8,#ffffff);border-radius:13px}
      .ov-rec-icon{flex:0 0 42px;height:42px;border-radius:12px;background:var(--ov-coral);color:#fff;font-size:19px;display:grid;place-items:center}
      .ov-rec-main{flex:1;min-width:0}
      .ov-rec-main b{display:block;font-size:14px}
      .ov-rec-main small{display:block;margin-top:4px;color:var(--ov-muted);font-size:11px;line-height:1.5}
      .ov-rec-actions{display:flex;flex-direction:column;gap:7px}
      .ov-todo{display:flex;gap:11px;align-items:center;padding:11px 4px;border-bottom:1px dashed #e8f0ec;text-decoration:none;color:var(--ov-ink)}
      .ov-todo:last-child{border-bottom:0}
      .ov-todo-dot{flex:0 0 8px;height:8px;border-radius:50%;background:var(--ov-coral)}
      .ov-todo-dot.calm{background:#9db8b3}
      .ov-todo-text{flex:1;min-width:0}
      .ov-todo-text b{display:block;font-size:12.5px}
      .ov-todo-text small{display:block;margin-top:3px;color:var(--ov-muted);font-size:10.5px}
      .ov-todo-tag{flex:0 0 auto;padding:3px 8px;border-radius:999px;font-size:10px;background:#eef6f3;color:#32756c;white-space:nowrap}
      .ov-todo-tag.hot{background:var(--ov-coral-soft);color:#a95c2b}
      .ov-ai{display:grid;gap:9px}
      .ov-ai-desc{margin:0;color:var(--ov-muted);font-size:11.5px;line-height:1.65}
      .ov-ai-quick{display:grid;gap:7px}
      .ov-ai-quick button{display:flex;justify-content:space-between;align-items:center;gap:9px;padding:10px 12px;border:1px solid var(--ov-line);border-radius:10px;background:#fbfdfb;color:#315d5b;font-size:11.5px;cursor:pointer;text-align:left;transition:.15s}
      .ov-ai-quick button:hover{border-color:#8fd4c9;background:#f2fbf8}
      .ov-ai-quick button span{color:var(--ov-coral)}
      .ov-activity{display:grid;gap:2px}
      .ov-activity a{display:flex;gap:11px;align-items:flex-start;padding:9px 2px;text-decoration:none;color:var(--ov-ink)}
      .ov-activity i{flex:0 0 7px;height:7px;margin-top:6px;border-radius:50%;background:var(--ov-mint)}
      .ov-activity b{display:block;font-size:12px;font-weight:600}
      .ov-activity time{display:block;margin-top:2px;color:var(--ov-muted);font-size:10.5px}
      .ov-assets{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
      .ov-asset{display:flex;flex-direction:column;gap:8px;padding:15px 16px;background:#fff;border:1px solid var(--ov-line);border-radius:14px;text-decoration:none;color:var(--ov-ink);transition:.16s;position:relative}
      .ov-asset:hover{border-color:#8fd4c9;transform:translateY(-2px);box-shadow:0 10px 26px rgba(24,64,71,.07)}
      .ov-asset-top{display:flex;justify-content:space-between;align-items:center;gap:9px}
      .ov-asset-top b{display:flex;align-items:center;gap:8px;font-size:13px}
      .ov-asset-top b em{font-style:normal;font-size:15px}
      .ov-asset small{color:var(--ov-muted);font-size:10.5px;line-height:1.6}
      .ov-asset .ov-asset-status{position:absolute;right:14px;bottom:12px;color:var(--ov-mint);font-size:10.5px}
      .ov-asset .tag{border:0}
      @media(max-width:1080px){.ov-grid{grid-template-columns:1fr}.ov-stats{grid-template-columns:repeat(2,1fr)}.ov-init{grid-template-columns:1fr}.ov-assets{grid-template-columns:repeat(2,1fr)}.ov-hero{flex-direction:column}.ov-week{flex:auto}}
      @media(max-width:640px){.ov-stats,.ov-assets{grid-template-columns:1fr}.ov-hero h1{font-size:23px}.ov-rec{flex-direction:column;align-items:flex-start}.ov-rec-actions{flex-direction:row;width:100%}.ov-rec-actions .btn{flex:1}}
    `;
    document.head.appendChild(style);
  }

  function page() {
    const d = facts(), blocks = liveSyllabusBlocks(), cal = liveCalendarStatus(), rec = recommend();
    const hero = `<header class="ov-hero"><div class="ov-hero-main"><div class="ov-kicker">COURSE OVERVIEW / 课程工作空间</div><h1>${esc(d.name)}<small>${esc(d.code)} · ${esc(d.version)}</small></h1><div class="ov-hero-meta"><span>${esc(d.term)}</span><span>负责人 <b>${esc(d.owner)}</b></span><span>任课 <b>${esc(d.teacher)}</b></span><span>${esc(d.credit)} · ${esc(d.hours)}</span><span>${esc(d.classes)}</span><span>${esc(d.students)}</span><span class="tag ${d.statusTag === 'ok' ? 'ok' : 'gray'}">${esc(d.statusText)}</span></div></div><div class="ov-week"><span>CURRENT TEACHING WEEK</span><b>${esc(d.week)}</b><em>本周章节：${esc(d.weekChapter)}<br>${esc(d.weekHours)}</em></div></header>`;
    const init = `<div class="ov-init"><div class="ov-init-step"><i>✓</i><div><b>主教材解析</b><small>${esc(d.textbook)} · 解析完成，资料就绪</small></div></div><div class="ov-init-step"><i>✓</i><div><b>教材结构确认</b><small>${esc(d.structure)} · 学时分配已锁定</small></div></div><div class="ov-init-step"><i>✓</i><div><b>课程知识库</b><small>${esc(d.kb)} · 备课与出题可引用</small></div></div></div>`;
    const stats = `<div class="ov-stats"><a class="ov-stat" href="#notifications"><span>待办与审核</span><strong>${d.todos.length + 2}</strong><em class="coral">2 项即将逾期</em></a><a class="ov-stat" href="#course/syllabus"><span>教学大纲</span><strong>${esc(d.syllabusVersion)}</strong><em class="mint">${blocks} / 8 区块完成 · ${esc(d.syllabusTag)}</em></a><a class="ov-stat" href="#course/calendar"><span>教学日历</span><strong>16 周</strong><em class="${cal === 'pending_review' ? 'coral' : 'mint'}">${calendarText(cal)} · ${esc(d.calendarVersion)}</em></a><a class="ov-stat" href="#course/students"><span>班级学情</span><strong>${esc(d.learningAvg)}</strong><em class="mint">及格率 ${esc(d.learningPass)} · ${esc(d.learningWatch)}</em></a></div>`;
    const todoList = d.todos.map(t => `<a class="ov-todo" href="${t.href}"><i class="ov-todo-dot ${t.hot ? '' : 'calm'}"></i><span class="ov-todo-text"><b>${esc(t.t)}</b><small>${esc(t.s)}</small></span><span class="ov-todo-tag ${t.hot ? 'hot' : ''}">${esc(t.tag)}</span></a>`).join('');
    const recBlock = `<div class="ov-rec"><div class="ov-rec-icon">✦</div><div class="ov-rec-main"><b>${esc(rec.main[0])}</b><small>根据当前课程状态计算：日历 ${calendarText(cal)}、大纲 ${esc(d.syllabusTag)}、成绩数据已接入学情分析。</small></div><div class="ov-rec-actions"><a class="btn primary" href="${rec.main[1]}">${esc(rec.main[0])} →</a>${rec.sub ? `<a class="btn secondary" href="${rec.sub[1]}">${esc(rec.sub[0])}</a>` : ''}</div></div>`;
    const activityList = d.activities.map(a => `<a href="${a.href}"><i></i><span><b>${esc(a.t)}</b><time>${esc(a.time)}</time></span></a>`).join('');
    const assets = [
      ['📘', '教学大纲', `版本 ${d.syllabusVersion} · ${esc(d.syllabusNote)} · 章节 4 章`, d.syllabusTag, '#course/syllabus'],
      ['🗓️', '教学日历', `16 周教学内容总表 + 排课日历 · ${esc(d.calendarVersion)} · ${calendarText(cal)}`, calendarText(cal) === '待教秘核对' ? '审核' : 'ok', '#course/calendar'],
      ['✏️', '章节备课', `当前：${esc(d.prepChapter)} · ${esc(d.prepNote)}`, '备课中', '#course/preparation'],
      ['▧', '课件制作', esc(d.courseware), '生成中', '#course/courseware'],
      ['📋', '作业管理', esc(d.assignment), '知识库', '#course/assignment'],
      ['📄', '试卷管理', esc(d.exam), '待审核', '#course/exam'],
      ['📈', '成绩与学情', `均分 ${esc(d.learningAvg)} · 及格率 ${esc(d.learningPass)} · ${esc(d.learningNote)}`, 'ok', '#course/students'],
      ['▤', '课程资料库', esc(d.materials), 'ok', '#materials'],
      ['⚖️', '版本与审核', esc(d.review), '审核', '#course/version-review']
    ].map(a => `<a class="ov-asset" href="${a[4]}"><div class="ov-asset-top"><b><em>${a[0]}</em>${a[1]}</b><span class="tag ${a[3] === 'ok' ? 'ok' : ''}">${a[3]}</span></div><small>${a[2]}</small><span class="ov-asset-status">进入 →</span></a>`).join('');
    return `<div class="ov-page">${hero}${init}${stats}<div class="ov-grid"><div><section class="ov-panel"><div class="ov-panel-head"><h2>下一步推荐操作</h2><span style="color:#8aa5a0;font-size:10px">由课程状态计算</span></div><div class="ov-panel-body">${recBlock}</div></section><section class="ov-panel"><div class="ov-panel-head"><h2>待办事项</h2><a href="#notifications">查看消息 →</a></div><div class="ov-panel-body">${todoList}</div></section></div><div><section class="ov-panel"><div class="ov-panel-head"><h2>课程 AI 助手</h2><span class="tag">对话入口</span></div><div class="ov-panel-body ov-ai"><p class="ov-ai-desc">面向本课程的 AI 对话入口，可基于大纲、日历、备课与学情数据生成建议草稿；所有输出均标记来源并需教师确认。</p><div class="ov-ai-quick"><button onclick="openAI('汇总本周教学安排与待办风险')">汇总本周教学安排与待办风险 <span>→</span></button><button onclick="openAI('基于学情数据生成教学建议')">基于学情数据生成教学建议 <span>→</span></button><button onclick="openAI('检查教学日历与大纲的一致性')">检查教学日历与大纲的一致性 <span>→</span></button></div></div></section><section class="ov-panel"><div class="ov-panel-head"><h2>最近活动</h2><a href="#notifications">全部记录 →</a></div><div class="ov-panel-body ov-activity">${activityList}</div></section></div></div><section class="ov-panel"><div class="ov-panel-head"><h2>课程资产与教学流程</h2><a href="#materials">资料库 →</a></div><div class="ov-panel-body ov-assets">${assets}</div></section></div>`;
  }

  function draw() {
    const app = document.getElementById('app'), shell = window.__courseShellV2, head = window.__courseHeader;
    if (app && shell && head) app.innerHTML = shell(head('overview') + page(), 'overview');
  }

  addStyle();
  const previousCoursePage = window.coursePage;
  window.coursePage = function (key) {
    const shell = window.__courseShellV2, head = window.__courseHeader;
    return key === 'overview' && shell && head ? shell(head('overview') + page(), 'overview') : previousCoursePage(key);
  };
  coursePage = window.coursePage;
  const previousRender = window.render;
  window.render = function () {
    if (location.hash === '#course/overview') { draw(); return; }
    return previousRender();
  };
  window.addEventListener('hashchange', () => { if (location.hash === '#course/overview') draw(); });
  if (location.hash === '#course/overview') draw();
})();
