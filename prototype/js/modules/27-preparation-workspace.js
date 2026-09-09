/*
  27-preparation-workspace.js
  备课工作台 - MD预览模式改造、大纲样式继承与学术资料（AI自动扒取/自定义配置）模块
*/
(function(){
  // 注入备课工作台专属样式
  const style = document.createElement('style');
  style.id = 'preparation-workspace-v3-style';
  style.textContent = `
    /* 页面基础与三栏布局 */
    .prep-v3-page { padding-bottom: 24px; color: var(--ink); }
    .prep-v3-workspace { display: grid; grid-template-columns: minmax(0,3fr) minmax(0,5fr) minmax(0,2fr); gap: 16px; align-items: start; }

    /* 顶部备课单元切换 */
    .prep-v3-header-card { background: #fff; border: 1px solid #dcece8; border-radius: 14px; padding: 14px 18px; margin-bottom: 14px; box-shadow: 0 4px 16px rgba(24,84,78,.04); }
    .prep-v3-unit-strip { display: flex; align-items: center; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
    .prep-v3-unit-strip::-webkit-scrollbar { display: none; }
    .prep-v3-unit-pill { flex: 0 0 200px; padding: 9px 12px; border: 1px solid #e1efec; border-radius: 10px; background: #fff; cursor: pointer; text-align: left; transition: all .16s ease; }
    .prep-v3-unit-pill:hover { border-color: #9edfd5; transform: translateY(-1px); }
    .prep-v3-unit-pill.active { border-color: #13a58f; background: #eaf8f4; box-shadow: 0 0 0 2px rgba(19,165,143,.15); }
    .prep-v3-unit-pill b { display: block; font-size: 12px; color: #1e4544; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .prep-v3-unit-pill small { display: block; font-size: 11px; color: #72908d; margin-top: 3px; }
    .prep-v3-unit-pill i { display: block; font-style: normal; font-size: 10px; color: #0b8d7d; margin-top: 4px; font-weight: 600; }

    /* 左侧大纲与侧栏 */
    .prep-v3-sidebar { background: #fff; border: 1px solid #e2efee; border-radius: 14px; padding: 14px; position: sticky; top: 12px; }
    .prep-v3-sidebar h3 { font: 700 15px Georgia, "Microsoft YaHei", serif; margin: 0 0 10px; color: #173f40; }

    /* 中间 MD 编辑/预览工作区 */
    .prep-v3-main { min-width: 0; max-height: calc(100vh - 120px); overflow-y: auto; background: #fff; border: 1px solid #e2efee; border-radius: 14px; padding: 20px; position: relative; }
    .prep-v3-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #edf4f3; padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .prep-v3-mode-group { display: flex; background: #f0f6f5; padding: 3px; border-radius: 9px; gap: 2px; }
    .prep-v3-mode-btn { border: 0; background: transparent; padding: 6px 12px; border-radius: 7px; font-size: 12px; color: #577372; cursor: pointer; font-weight: 500; transition: all .14s ease; }
    .prep-v3-mode-btn.active { background: #fff; color: #0b8d7d; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,.06); }

    /* Markdown 预览与实时编辑呈现模式（标准简洁样式） */
    .prep-md-preview { font: 14px/1.85 system-ui, "Microsoft YaHei", sans-serif; color: #24292f; position: relative; user-select: text; min-height: 520px; }
    .prep-md-preview[contenteditable="true"] { outline: none; padding: 18px 20px; background: #fff; border-radius: 8px; transition: box-shadow .16s ease; }
    .prep-md-preview[contenteditable="true"]:focus-within { box-shadow: 0 0 0 2px rgba(87,110,124,.18); }
    .prep-md-preview h1 { font: 700 24px/1.4 system-ui, "Microsoft YaHei", sans-serif; color: #11181c; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e6e8eb; }
    .prep-md-preview h2 { font: 700 19px/1.5 system-ui; color: #11181c; margin: 20px 0 10px; }
    .prep-md-preview h3 { font: 600 16px/1.5 system-ui; color: #11181c; margin: 16px 0 8px; }
    .prep-md-preview h4, .prep-md-preview h5, .prep-md-preview h6 { font: 600 14px/1.5 system-ui; color: #24292f; margin: 12px 0 6px; }
    .prep-md-preview p { margin: 6px 0 12px; line-height: 1.85; }
    .prep-md-preview ul, .prep-md-preview ol { margin: 6px 0 12px; padding-left: 24px; }
    .prep-md-preview li { margin-bottom: 3px; }
    .prep-md-preview blockquote,
    .prep-md-preview .callout-note,
    .prep-md-preview .callout-warning { margin: 12px 0; padding: 1px 14px; background: transparent; border-left: 3px solid #d0d7de; border-radius: 0; color: #57606a; }
    .prep-md-preview table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    .prep-md-preview th, .prep-md-preview td { border: 1px solid #e2e5e8; padding: 7px 12px; text-align: left; font-size: 13px; }
    .prep-md-preview th { background: #f6f8fa; color: #24292f; font-weight: 600; }
    .prep-md-preview code { background: #f0f1f3; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, Consolas, monospace; color: #24292f; font-size: 12px; }
    .prep-md-preview pre { background: #f6f8fa; color: #24292f; padding: 12px 14px; border: 1px solid #e6e8eb; border-radius: 8px; overflow-x: auto; font-family: ui-monospace, Consolas, monospace; font-size: 13px; line-height: 1.6; }
    .prep-md-preview a { color: #0969da; text-decoration: none; }
    .prep-md-preview blockquote a, .prep-md-preview .callout-note a, .prep-md-preview .callout-warning a { color: #0969da; }

    /* MD 引用卡片样式 */
    .prep-citation-card { display: flex; align-items: flex-start; gap: 10px; background: #f6fcfb; border: 1px solid #cce8e2; border-radius: 9px; padding: 10px 12px; margin: 10px 0; font-size: 12px; }
    .prep-citation-card .cite-icon { color: #0b9c8c; font-size: 16px; flex: 0 0 auto; margin-top: 2px; }
    .prep-citation-card b { color: #164a49; }
    .prep-citation-card small { display: block; color: #6a8885; margin-top: 2px; }

    /* 划词/内联编辑浮动工具栏 (Float Toolbar) */
    .prep-float-toolbar { position: absolute; z-index: 100; display: flex; align-items: center; gap: 4px; background: #16363b; color: #fff; padding: 5px 8px; border-radius: 9px; box-shadow: 0 10px 30px rgba(0,0,0,.22); animation: prepPopIn .15s ease-out; }
    @keyframes prepPopIn { from { opacity: 0; transform: translateY(6px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .prep-float-btn { border: 0; background: transparent; color: #d6f2ed; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
    .prep-float-btn:hover { background: rgba(255,255,255,.15); color: #fff; }
    .prep-float-divider { width: 1px; height: 16px; background: rgba(255,255,255,.2); margin: 0 2px; }

    /* AI 改写 Diff 对比高亮视图 (继承大纲模块样式) */
    .prep-diff-box { background: #fff; border: 2px solid #16bda8; border-radius: 12px; padding: 14px; margin: 14px 0; box-shadow: 0 8px 24px rgba(22,189,168,.12); }
    .prep-diff-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #d0e8e4; padding-bottom: 8px; }
    .prep-diff-head b { font-size: 13px; color: #0b9c8c; display: flex; align-items: center; gap: 6px; }
    .prep-diff-content { font-size: 13px; line-height: 1.8; color: #2d4548; background: #fbfdfe; padding: 12px; border-radius: 8px; border: 1px solid #e4f2ef; }
    .prep-diff-content ins, mark.diff-add { background: #d2f8ef; color: #076d62; text-decoration: none; padding: 2px 4px; border-radius: 4px; font-weight: 600; }
    .prep-diff-content del, mark.diff-del { background: #fee2e2; color: #b91c1c; text-decoration: line-through; padding: 2px 4px; border-radius: 4px; margin-right: 4px; }
    .prep-diff-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }

    /* 右侧列：备课 AI 助手 + 学术资料（Tab 切换，共用一张卡） */
    .prep-v3-right { display: flex; flex-direction: column; gap: 14px; min-width: 0; position: sticky; top: 12px; max-height: calc(100vh - 120px); overflow: visible; }
    .prep-v3-academic { background: #fff; border: 1px solid #e2efee; border-radius: 14px; padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 12px; }

    /* Tab 切换头 */
    .prep-v3-tabs { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid #edf4f3; padding-bottom: 10px; }
    .prep-v3-tabbar { display: flex; background: #f0f6f5; padding: 3px; border-radius: 9px; gap: 2px; }
    .prep-v3-tabbar button { border: 0; background: transparent; padding: 5px 12px; border-radius: 7px; font-size: 12px; color: #577372; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 5px; transition: all .14s ease; }
    .prep-v3-tabbar button.active { background: #fff; color: #0b8d7d; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .prep-v3-tabbar button .cnt { font-size: 10px; font-weight: 700; color: #0b8d7d; background: #e2f4f0; border-radius: 99px; padding: 0 6px; line-height: 15px; }
    .prep-v3-tab-pane { display: none; min-height: 0; }
    .prep-v3-tab-pane.active { display: flex; flex-direction: column; gap: 12px; }

    /* 备课 AI 助手 */
    .prep-ai-chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .prep-ai-chips button { border: 1px solid #d9e9e6; background: #fff; border-radius: 99px; color: #557674; padding: 4px 9px; font-size: 10px; cursor: pointer; }
    .prep-ai-chips button:hover { border-color: #9edfd5; color: #0b9c8c; }
    .prep-ai-assistant .chat-log { height: 200px; margin: 0; background: #f8fcfb; }
    .prep-ai-assistant .chat-compose { margin-top: 2px; }
    .prep-ai-assistant .chat-compose textarea { min-height: 48px; font-size: 12px; }
    .prep-ai-assistant .chat-status { min-height: 16px; margin-top: 2px; }

    /* 学术资料 tab */
    .prep-academic-tools { display: grid; gap: 8px; }
    .prep-scraper-input-wrap { display: flex; gap: 6px; }
    .prep-scraper-input-wrap input { flex: 1; min-width: 0; border: 1px solid #cde4e0; border-radius: 8px; padding: 7px 10px; font-size: 12px; color: #1d3e3f; outline: none; background: #fff; }
    .prep-scraper-input-wrap input:focus { border-color: #13a58f; box-shadow: 0 0 0 2px rgba(19,165,143,.15); }
    .prep-sources-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .prep-source-chip { font-size: 10px; padding: 2px 7px; border-radius: 5px; background: #fff; border: 1px solid #d2e7e3; color: #496c6a; cursor: pointer; user-select: none; }
    .prep-source-chip.active { background: #e0f5f1; border-color: #13a58f; color: #0b8d7d; font-weight: 600; }
    .prep-source-chip.custom { border-color: #cbd5e1; color: #475569; }
    .prep-source-chip.custom.active { background: #f1f5f9; border-color: #475569; color: #0f172a; }
    /* 资料列表：纵向可滚动 */
    .prep-materials-list { display: grid; gap: 10px; max-height: 460px; overflow-y: auto; padding-right: 2px; }
    .prep-materials-list .prep-materials-empty { padding: 18px 6px; text-align: center; color: #89a29e; font-size: 12px; }

    /* 学术资料卡片 */
    .prep-material-card { border: 1px solid #e1efec; border-radius: 11px; padding: 11px 12px; background: #fff; transition: all .16s ease; display: grid; gap: 6px; position: relative; }
    .prep-material-card:hover { border-color: #9edfd5; box-shadow: 0 4px 14px rgba(24,84,78,.06); }
    .prep-material-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
    .prep-mat-tag { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
    .prep-mat-tag.case { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }       /* 课堂案例 */
    .prep-mat-tag.background { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; } /* 背景知识 */
    .prep-mat-tag.reading { background: #faf5ff; color: #7e22ce; border: 1px solid #f3e8ff; }    /* 拓展阅读 */
    .prep-mat-tag.news { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }       /* 最新资讯 */

    .prep-material-title { font-size: 13px; font-weight: 700; color: #193f40; line-height: 1.4; margin: 0; cursor: pointer; }
    .prep-material-title:hover { color: #0b9c8c; text-decoration: underline; }
    .prep-material-abstract { font-size: 11px; color: #5b7978; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }
    .prep-material-meta { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #819b99; border-top: 1px dashed #edf5f4; padding-top: 6px; margin-top: 2px; }
    .prep-material-actions { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
    .prep-mat-btn { border: 1px solid #d4e7e4; background: #f7faf9; border-radius: 6px; padding: 3px 7px; font-size: 10px; color: #3b605f; cursor: pointer; transition: all .12s ease; }
    .prep-mat-btn:hover { border-color: #13a58f; background: #eaf8f4; color: #0b8d7d; }

    /* 教师备注输入 */
    .prep-mat-note-box { font-size: 11px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; padding: 6px 8px; color: #873800; margin-top: 4px; display: flex; justify-content: space-between; align-items: center; }
    .prep-v3-left { min-width: 0; position: sticky; top: 12px; }
    .prep-v3-left .prep-v3-academic { max-height: calc(100vh - 120px); overflow: hidden; }
    body:has(.prep-v3-page) { scrollbar-color: #b8dcd6 #f4faf9; scrollbar-width: thin; }
    .prep-v3-page * { scrollbar-color: #b8dcd6 transparent; scrollbar-width: thin; }
    .prep-v3-page *::-webkit-scrollbar { width: 6px; height: 6px; }
    .prep-v3-page *::-webkit-scrollbar-track { background: transparent; }
    .prep-v3-page *::-webkit-scrollbar-thumb { background: #b8dcd6; border-radius: 99px; border: 1px solid transparent; background-clip: padding-box; }
    .prep-v3-page *::-webkit-scrollbar-thumb:hover { background: #7fc5bb; background-clip: padding-box; }
    .prep-v3-page *::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
    .prep-source-group { display:flex; gap:5px; flex-wrap:wrap; }
    .prep-source-group button { border:1px solid #d2e7e3; background:#fff; color:#496c6a; border-radius:7px; padding:5px 8px; font-size:10px; cursor:pointer; }
    .prep-source-group button.active { background:#e0f5f1; border-color:#13a58f; color:#0b8d7d; font-weight:700; }
    .prep-source-filter { border:1px solid #d2e7e3; background:#fff; color:#496c6a; border-radius:7px; padding:5px 8px; font-size:10px; cursor:pointer; }
    .prep-source-filter.active { background:#e0f5f1; border-color:#13a58f; color:#0b8d7d; font-weight:700; }
    .prep-material-tags { display:flex; gap:4px; flex-wrap:wrap; }
    .prep-material-tags span { font-size:10px; color:#527473; background:#f1f7f6; border:1px solid #dcece8; border-radius:4px; padding:2px 6px; }
    .prep-media-placeholder { display:flex; align-items:center; gap:7px; padding:10px 12px; border-radius:8px; background:#edf7f6; border:1px dashed #9edfd5; color:#0b8d7d; font-size:11px; cursor:pointer; }
    @media(max-width:1100px){ .prep-v3-workspace{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);} .prep-v3-right{grid-column:1 / -1; position:static; max-height:none; overflow:visible;} .prep-v3-left{position:static;} .prep-v3-left .prep-v3-academic{max-height:none;} .prep-v3-main{max-height:none;overflow:visible;} }
    @media(max-width:700px){ .prep-v3-workspace{grid-template-columns:1fr;} .prep-v3-right{grid-column:auto;} }
  `;
  // 补充样式：引用/提示块内部排版与选区反馈（保持素净）
  style.textContent += `
    .prep-md-preview .ct-title { display: block; font-weight: 700; color: #24292f; margin: 0 0 4px; }
    .prep-md-preview .callout-note p, .prep-md-preview .callout-warning p,
    .prep-md-preview blockquote p { margin: 2px 0 0; }
    .prep-md-preview .callout-note ul, .prep-md-preview .callout-warning ul,
    .prep-md-preview blockquote ul { margin: 6px 0 0; padding-left: 20px; }
    .prep-md-preview .callout-note p + ul, .prep-md-preview .callout-warning p + ul,
    .prep-md-preview blockquote p + ul { margin-top: 4px; }
    /* 实时编辑时的选区反馈 */
    #prepPreviewContainer::selection { background: rgba(87,110,124,.18); }
    #prepPreviewContainer ::selection { background: #d7e1e8; }
  `;
  document.head.appendChild(style);

  // 1. 初始化 Mock 数据与 localStorage 支撑
  const STORAGE_KEY = 'ai-jiaowu-prep-workspace-v4';
  const CUSTOM_SOURCES_KEY = 'ai-jiaowu-prep-custom-sources-v1';

  // 课程隔离：教案草稿与学术资料按课程分 key 存储，默认数据互不影响。
  // 离散数学沿用原 key（保留教师已保存内容），其他课程追加课程 id 后缀。
  const prepCourseId = () => { try { return localStorage.getItem('ai-jiaowu-current-course') || 'discrete'; } catch { return 'discrete'; } };
  const prepIsEconomics = () => prepCourseId() === 'economics';
  const prepStorageKey = () => prepCourseId() === 'discrete' ? STORAGE_KEY : STORAGE_KEY + '-' + prepCourseId();

  const defaultCustomSources = [
    { id: 'src-cnki', name: '中国知网 (CNKI)', isPreset: true, enabled: true },
    { id: 'src-wanfang', name: '维普/万方论文网', isPreset: true, enabled: true },
    { id: 'src-smartedu', name: '国家智慧教育平台', isPreset: true, enabled: true },
    { id: 'src-patent', name: '中国专利网 (Patent)', isPreset: false, enabled: true },
    { id: 'src-arxiv', name: 'arXiv 学术预印本', isPreset: false, enabled: true }
  ];

  const defaultAcademicMaterials = [
    {
      id: 'mat-1',
      title: '基于二元关系推导的高校课表冲突判定算法与系统实现',
      type: 'paper',
      category: 'case', // 课堂案例
      categoryLabel: '课堂案例',
      source: '中国知网 (CNKI)',
      url: 'https://kns.cnki.net/kcms/detail/article_10294.html',
      crawledAt: '2026-09-08 10:15',
      abstract: '本文探讨了离散数学中二元关系的自反性与传递性在排课建模中的应用，证明了关系矩阵乘法在快速检测冲突回路中的优势。',
      note: '可在 1.2 节讲解关系矩阵时，作为实际工程案例引入',
      isSaved: true
    },
    {
      id: 'mat-2',
      title: '数学史话：莱布尼茨与符号逻辑在现代离散结构中的演变',
      type: 'text',
      category: 'background', // 背景知识
      categoryLabel: '背景知识',
      source: '国家智慧教育平台',
      url: 'https://smartedu.cn/course/math-history-04',
      crawledAt: '2026-09-07 16:40',
      abstract: '莱布尼茨在1679年提出的通用符号系统，为现代集合论、关系闭包运算奠定了思想基础。',
      note: '适合放在本节课导言部分，激发学生学习兴趣',
      isSaved: true
    },
    {
      id: 'mat-3',
      title: '专利 CN114582910A：一种基于等价类划分的大数据分布式去重方法',
      type: 'link',
      category: 'news', // 最新资讯/专利
      categoryLabel: '最新资讯',
      source: '中国专利网 (Patent)',
      url: 'https://patents.google.com/patent/CN114582910A',
      crawledAt: '2026-09-08 11:05',
      abstract: '公开了一种利用偏序集哈斯图与商集划分的并行数据去重专利架构，吞吐量提升 40%。',
      note: '用于偏序关系与 Hasse 图章节的前沿拓展案例',
      isSaved: true
    },
    {
      id: 'mat-4',
      title: 'arXiv:2608.09124 - Efficient Equivalence Relation Closure in Large Knowledge Graphs',
      type: 'paper',
      category: 'reading', // 拓展阅读
      categoryLabel: '拓展阅读',
      source: 'arXiv 学术预印本',
      url: 'https://arxiv.org/abs/2608.09124',
      crawledAt: '2026-09-06 14:20',
      abstract: '提出了大语言模型知识图谱中等价关系传递闭包的高效计算算法，对比传统 Warshall 算法提升了2个数量级。',
      note: '课后优秀学生拓展阅读论文',
      isSaved: true
    }
  ];

  const defaultMdLessonPlan = `# 第一章 集合论基础 · 第二节 关系

> 教学对象：智能25-1、25-2班 ｜ 授课时间：第 3 周（6 学时） ｜ 授课教师：张寒

## 1. 教学目标
1. 掌握二元关系的基本概念及其五种基本性质（自反、反自反、对称、反对称、传递）。
2. 理解关系的幂、周期性以及传递闭包、自反闭包的计算原理。
3. 掌握等价关系、等价类、划分与商集的等价转换关系。
4. 熟练绘制偏序关系的哈斯图，并能求解极大元与极小元。

## 2. 教学重点与难点

**教学重点**

- 关系矩阵与关系图的表示法；
- 五种基本关系性质的判定规则；
- 等价关系与划分的对应定理；
- 偏序集与哈斯图。

**教学难点**

- 区分“反对称”与“不对称”，学生容易混淆；
- Warshall 算法求传递闭包的矩阵迭代推导；
- 偏序关系中“界”与“最值”的区别。

## 3. 教学引入

以高校自动排课系统的课程时间冲突判定为例，引导学生把实际问题抽象为二元关系矩阵，体会关系表示法的工程应用。

## 4. 教学内容与推导

### 4.1 关系的五种基本性质

设 R 是集合 A 上的二元关系：

- 自反性：对任意 x∈A，都有 (x,x)∈R；
- 对称性：若 (x,y)∈R，则 (y,x)∈R；
- 传递性：若 (x,y)∈R 且 (y,z)∈R，则 (x,z)∈R。

#### 课堂提问

> 设 A={1,2,3}，R={(1,1),(2,2),(1,2),(2,1)}，R 是传递关系吗？为什么？

## 5. 课堂总结与作业
1. 思考题：判断全关系与恒等关系是否既是等价关系，又是偏序关系。
2. 书面作业：教材 P48 习题 3、7、12（哈斯图绘制）。
`;

  // 经济学原理专属默认教案（对应大纲第一章第二节，与离散数学教案完全隔离）
  const economicsMdLessonPlan = `# 第一章 经济学基础与供求分析 · 第二节 需求、供给与市场均衡

> 教学对象：经管25-1、25-2班 ｜ 授课时间：第 2 周（3 学时） ｜ 授课教师：林老师

## 1. 教学目标
1. 掌握需求曲线与供给曲线的含义，理解需求定律与供给定律背后的行为逻辑。
2. 理解市场均衡价格与均衡数量的形成过程，掌握比较静态分析方法。
3. 能够区分“需求量变动”与“需求变动”，并分析价格以外的因素如何移动曲线。
4. 会运用供求模型解释现实市场现象与简单政策效果。

## 2. 教学重点与难点

**教学重点**

- 需求曲线、供给曲线的推导与位移因素；
- 均衡价格的形成与“看不见的手”的协调机制；
- 比较静态分析：供求移动对均衡的影响；
- 价格管制（限价与支持价）的后果分析。

**教学难点**

- 区分“需求量变动”（沿曲线移动）与“需求变动”（曲线整体位移）；
- 供给与需求同时移动时均衡方向的不确定性判断；
- 理解短缺与过剩是价格受到管制时的非均衡表现。

## 3. 教学引入

以 2026 年夏季蔬菜价格波动为案例，请学生先猜测“高温减产—批发价上升—零售价跟涨”的传导链条，再引出供求模型如何把这一过程形式化。

## 4. 教学内容与推导

### 4.1 需求与供给曲线

设市场需求函数为 Qd(P)，供给函数为 Qs(P)：

- 需求定律：价格上升，需求量减少，需求曲线向右下方倾斜；
- 供给定律：价格上升，供给量增加，供给曲线向右上方倾斜；
- 均衡条件：Qd(P*) = Qs(P*)，此时市场出清。

#### 课堂提问

> 若某城市房租限价低于均衡租金，会出现短缺还是过剩？租房市场会出现哪些非价格调整方式？

## 5. 课堂总结与作业
1. 思考题：判断“汽油涨价导致汽车需求下降”中影响的是需求量还是需求，说明曲线如何移动。
2. 书面作业：教材第一章习题 3、7、12（供求曲线移动与均衡计算）。
`;

  // 经济学原理专属默认学术资料（与离散数学资料完全隔离）
  const economicsAcademicMaterials = [
    {
      id: 'emat-1',
      title: '农产品价格支持政策下的供求弹性测算——基于粮食市场的实证分析',
      type: 'paper',
      category: 'case', // 课堂案例
      categoryLabel: '课堂案例',
      source: '中国知网 (CNKI)',
      url: 'https://kns.cnki.net/kcms/detail/article_20481.html',
      crawledAt: '2026-09-08 10:15',
      abstract: '本文利用省级面板数据测算了粮食市场的需求价格弹性与供给弹性，评估最低收购价政策对均衡价格和农户收入的影响。',
      note: '可在 1.2 节讲解均衡变动时，作为价格支持政策案例引入',
      tags: ['供求弹性', '教学应用'],
      isSaved: true
    },
    {
      id: 'emat-2',
      title: '经济思想史话：亚当·斯密与“看不见的手”的市场协调机制',
      type: 'text',
      category: 'background', // 背景知识
      categoryLabel: '背景知识',
      source: '国家智慧教育平台',
      url: 'https://smartedu.cn/course/econ-history-02',
      crawledAt: '2026-09-07 16:40',
      abstract: '1776 年《国富论》中关于分工与市场价格自发协调的论述，奠定了现代供求分析与市场机制思想的基础。',
      note: '适合放在本节课导言部分，激发学生学习兴趣',
      tags: ['经济思想史', '市场机制'],
      isSaved: true
    },
    {
      id: 'emat-3',
      title: '专利 CN115204736B：一种基于电商大数据的消费品价格监测与均衡预测方法',
      type: 'link',
      category: 'news', // 最新资讯/专利
      categoryLabel: '最新资讯',
      source: '中国专利网 (Patent)',
      url: 'https://patents.google.com/patent/CN115204736B',
      crawledAt: '2026-09-08 11:05',
      abstract: '公开了一种利用电商价格大数据实时估计供求缺口并预测均衡价格走势的方法，预警准确率提升 35%。',
      note: '用于弹性与市场均衡章节的前沿拓展案例',
      tags: ['大数据', '价格监测'],
      isSaved: true
    },
    {
      id: 'emat-4',
      title: 'arXiv:2608.10442 - Behavioral Foundations of Demand Curves: Evidence from Field Experiments',
      type: 'paper',
      category: 'reading', // 拓展阅读
      categoryLabel: '拓展阅读',
      source: 'arXiv 学术预印本',
      url: 'https://arxiv.org/abs/2608.10442',
      crawledAt: '2026-09-06 14:20',
      abstract: '通过系列田野实验检验了需求定律的行为基础，讨论参照点效应与需求曲线位移的微观证据。',
      note: '课后优秀学生拓展阅读论文',
      tags: ['行为经济学', '拓展阅读'],
      isSaved: true
    }
  ];

  const currentMdPlanDefault = () => prepIsEconomics() ? economicsMdLessonPlan : defaultMdLessonPlan;
  const currentAcademicMaterialsDefault = () => prepIsEconomics() ? economicsAcademicMaterials : defaultAcademicMaterials;

  // 获取和存取状态
  function getCustomSources() {
    try {
      const stored = localStorage.getItem(CUSTOM_SOURCES_KEY);
      return stored ? JSON.parse(stored) : defaultCustomSources;
    } catch { return defaultCustomSources; }
  }

  function saveCustomSources(sources) {
    try { localStorage.setItem(CUSTOM_SOURCES_KEY, JSON.stringify(sources)); } catch {}
  }

  function getAcademicMaterials() {
    try {
      const stored = localStorage.getItem(prepStorageKey() + '_materials');
      return stored ? JSON.parse(stored) : currentAcademicMaterialsDefault();
    } catch { return currentAcademicMaterialsDefault(); }
  }

  function saveAcademicMaterials(mats) {
    try { localStorage.setItem(prepStorageKey() + '_materials', JSON.stringify(mats)); } catch {}
  }

  function getMdPlan() {
    try {
      return localStorage.getItem(prepStorageKey() + '_md') || currentMdPlanDefault();
    } catch { return currentMdPlanDefault(); }
  }

  function saveMdPlan(content) {
    try { localStorage.setItem(prepStorageKey() + '_md', content); } catch {}
  }

  // 行内 Markdown -> HTML（加粗 / 斜体 / 行内代码 / 链接）
  function renderInlineMd(line) {
    if (!line) return '';
    let s = String(line);
    s = s.replace(/`([^`]+)`/g, (m, c) => '<code>' + c + '</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[\s（(])\_([^_\n]+)\_(?!_)/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  // 引用 / 提示框内部内容（支持普通行与 - 无序列表）
  function renderQuoteInner(lines) {
    let html = '';
    let plain = [];
    const flush = () => {
      if (plain.length) { html += '<p>' + plain.map(renderInlineMd).join('<br>') + '</p>'; plain = []; }
    };
    let i = 0;
    while (i < lines.length) {
      const t = (lines[i] || '').trim();
      i++;
      if (!t) continue;
      const ul = t.match(/^[-*]\s+(.*)$/);
      if (ul) {
        flush();
        const items = [ul[1]];
        while (i < lines.length) {
          const n = (lines[i] || '').trim();
          const nm = n.match(/^[-*]\s+(.*)$/);
          if (!nm) break;
          items.push(nm[1]);
          i++;
        }
        html += '<ul>' + items.map(x => '<li>' + renderInlineMd(x) + '</li>').join('') + '</ul>';
      } else {
        plain.push(t);
      }
    }
    flush();
    return html;
  }

  // 引用块或 [!note]/[!warning] 提示框 -> HTML
  function renderQuoteBlock(q) {
    const marker = (q[0] || '').match(/^\[!(\w+)\]\s?(.*)$/);
    if (marker) {
      const type = marker[1].toLowerCase();
      const title = marker[2] || (type === 'warning' ? '⚠️ 教学难点' : '📌 教学提示');
      const inner = renderQuoteInner(q.slice(1));
      const cls = type === 'warning' ? 'callout-warning' : 'callout-note';
      return '<div class="' + cls + '"><p class="ct-title">' + renderInlineMd(title) + '</p>' + inner + '</div>';
    }
    return '<blockquote>' + renderQuoteInner(q) + '</blockquote>';
  }

  // Markdown 表格 -> HTML
  function renderTableMd(rows) {
    const parsed = rows
      .map(r => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()))
      .filter(r => r.some(c => c !== ''));
    if (!parsed.length) return '';
    let header = parsed[0];
    let body = parsed.slice(1);
    const sep = parsed.findIndex(r => r.length && r.every(c => /^:?-{1,}:?$/.test(c)));
    if (sep > 0) body = parsed.slice(sep + 1);
    const cell = v => renderInlineMd(v);
    const th = '<thead><tr>' + header.map(c => '<th>' + cell(c) + '</th>').join('') + '</tr></thead>';
    const tb = '<tbody>' + body.map(r => '<tr>' + r.map(c => '<td>' + cell(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
    return '<div class="md-table-wrap"><table>' + th + tb + '</table></div>';
  }

  // Markdown 渲染器（块级结构；与实时编辑双向同步的 DOM 结构）
  function renderMarkdown(md) {
    if (!md) return '';
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      const t = (raw || '').trim();
      if (!t) { i++; continue; }
      // 分割线
      if (/^-{3,}$/.test(t)) { html.push('<hr>'); i++; continue; }
      // 标题
      const h = t.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        const lv = h[1].length;
        html.push('<h' + lv + '>' + renderInlineMd(h[2]) + '</h' + lv + '>');
        i++;
        continue;
      }
      // 表格
      if (t.indexOf('|') === 0) {
        const rows = [];
        while (i < lines.length && (lines[i] || '').trim().indexOf('|') === 0) { rows.push((lines[i] || '').trim()); i++; }
        html.push(renderTableMd(rows));
        continue;
      }
      // 引用 / 提示框（连续 > 行为一个块）
      if (t.indexOf('>') === 0) {
        const q = [];
        while (i < lines.length && (lines[i] || '').trim().indexOf('>') === 0) {
          q.push((lines[i] || '').trim().replace(/^>\s?/, ''));
          i++;
        }
        html.push(renderQuoteBlock(q));
        continue;
      }
      // 无序 / 有序列表
      const order = /^\d+[.)]\s+/.test(t);
      const listM = /^[-*]\s+/.test(t) || order;
      if (listM) {
        const items = [];
        const one = (ln) => {
          const u = ln.match(/^[-*]\s+(.*)$/);
          const o = ln.match(/^\d+[.)]\s+(.*)$/);
          return order ? o[1] : u[1];
        };
        items.push(one(t));
        i++;
        while (i < lines.length) {
          const nt = (lines[i] || '').trim();
          const u2 = /^[-*]\s+/.test(nt);
          const o2 = /^\d+[.)]\s+/.test(nt);
          if ((order && o2) || (!order && u2)) { items.push(one(nt)); i++; } else break;
        }
        const tag = order ? 'ol' : 'ul';
        html.push('<' + tag + '>' + items.map(x => '<li>' + renderInlineMd(x) + '</li>').join('') + '</' + tag + '>');
        continue;
      }
      // 普通段落（空行分段）
      const buf = [];
      while (i < lines.length) {
        const ct = (lines[i] || '').trim();
        if (!ct) break;
        if (/^(#{1,6})\s/.test(ct) || /^-{3,}$/.test(ct) || /^[-*]\s+/.test(ct) || /^\d+[.)]\s+/.test(ct) || ct.indexOf('>') === 0 || ct.indexOf('|') === 0) break;
        buf.push(ct);
        i++;
      }
      if (buf.length) html.push('<p>' + buf.map(renderInlineMd).join('<br>') + '</p>');
    }
    return html.join('\n');
  }

  // 备课单元切换条数据：离散数学与经济学原理各自维护，互不影响
  const prepUnitStrip = () => prepIsEconomics() ? [
    { id: 'ech1-2', title: '第一章 · 第二节 需求、供给与市场均衡', week: '第 2 周 · 3 学时', status: '8/10 已确认', style: '', active: true },
    { id: 'ech1-1', title: '第一章 · 第一节 稀缺性、选择与机会成本', week: '第 1 周 · 3 学时', status: '待确认', style: ' style="color:#b66f20"', active: false },
    { id: 'ech2-1', title: '第二章 · 第一节 消费者选择', week: '第 5 周 · 3 学时', status: '生成中', style: ' style="color:#4774b5"', active: false },
    { id: 'ech3-1', title: '第三章 · 第一节 完全竞争市场', week: '第 9 周 · 3 学时', status: '已确认', style: '', active: false }
  ] : [
    { id: 'ch1-2', title: '第一章 · 第二节 关系', week: '第 3 周 · 6 学时', status: '8/10 已确认', style: '', active: true },
    { id: 'ch1-1', title: '第一章 · 第一节 集合', week: '第 2 周 · 4 学时', status: '待确认', style: ' style="color:#b66f20"', active: false },
    { id: 'ch2-1', title: '第二章 · 第一节 命题逻辑', week: '第 6 周 · 2 学时', status: '生成中', style: ' style="color:#4774b5"', active: false },
    { id: 'ch3-1', title: '第三章 · 第一节 图的基本概念', week: '第 10 周 · 3 学时', status: '已确认', style: '', active: false }
  ];

  // 页面全局 HTML 构建
  window.__prepWorkspacePage = function() {
    const customSources = getCustomSources();
    const materials = getAcademicMaterials();
    const mdContent = getMdPlan();
    const econ = prepIsEconomics();
    const unitPills = prepUnitStrip().map(u =>
      `<div class="prep-v3-unit-pill${u.active ? ' active' : ''}" onclick="switchPrepUnit('${u.id}')">
              <b>${u.title}</b>
              <small>${u.week}</small>
              <i${u.style}>${u.status}</i>
            </div>`
    ).join('\n            ');

    return `
      <div class="preparation-page prep-v3-page" data-page="preparation">
        <!-- 页头标题与描述 -->
        <div class="prep-title-row">
          <div>
            <h1>备课工作台 <span class="title-subtitle">MD 格式预览与学术资料库</span></h1>
          </div>
        </div>

        <!-- 顶部备课单元（章节/课时）切换栏 -->
        <div class="prep-v3-header-card">
          <div style="font-size:11px;color:#7a9491;margin-bottom:8px;font-weight:600;">SELECT LESSON UNIT · 备课单元选择器</div>
          <div class="prep-v3-unit-strip">
            ${unitPills}
          </div>
        </div>

        <!-- 主体三栏布局 -->
        <div class="prep-v3-workspace">
          <!-- 左侧：学术资料检索与知识沉淀 -->
          <aside class="prep-v3-left">
            <section class="prep-v3-academic">
              <div class="prep-v3-tabs">
                <div><h3 style="margin:0;color:#173f40;font-size:15px;">学术资料</h3><small style="color:#789490;">检索、核验并沉淀到教案</small></div>
                <button class="btn secondary" style="font-size:10px;padding:5px 8px;" onclick="openCustomSourcesModal()">⚙️ 配置数据源</button>
              </div>
              <div class="prep-academic-tools">
                <div class="prep-scraper-input-wrap">
                  <input id="scraperKeyword" placeholder="搜索论文、专利、教学案例…" value="${econ ? '供求弹性 政策案例' : '二元关系 算法案例'}" oninput="filterAcademicMaterials(this.value)" />
                  <button class="btn primary" style="font-size:11px;padding:6px 10px;" onclick="runAiWebScraper()">🔍 搜索</button>
                </div>
                <div class="prep-source-group" aria-label="数据源类型">
                  <button class="active" onclick="setPrepSourceScope(this,'all')">全网搜索</button>
                  ${customSources.filter(s => s.enabled && s.isPreset).map(s => `<button class="prep-source-filter" title="${s.name}" onclick="togglePrepSourceFilter(this)">${s.name}</button>`).join('')}
                  <button onclick="openCustomSourcesModal()">＋ 添加数据源</button>
                </div>
              </div>
              <div class="prep-materials-list" id="academicMaterialsList">${renderAcademicMaterialsList(materials)}</div>
            </section>
          </aside>

          <!-- 中间：Markdown 工作区（实时预览模式 / 源码模式） -->
          <main class="prep-v3-main" id="prepMainWorkspace">
            <div class="prep-v3-toolbar">
              <div class="prep-v3-mode-group">
                <button class="prep-v3-mode-btn active" id="btnModePreview" onclick="setPrepViewMode('preview')">👁️ MD 实时预览</button>
                <button class="prep-v3-mode-btn" id="btnModeSource" onclick="setPrepViewMode('source')">📝 MD 源码编辑</button>
                <button class="btn primary" style="font-size:12px;padding:6px 10px;margin-left:4px;" onclick="savePrepState()">💾 保存草稿</button>
              </div>
            </div>

            <!-- MD 实时预览/修改区 (支持 contenteditable 实时直接修改) -->
            <div id="prepPreviewContainer" class="prep-md-preview" contenteditable="true" oninput="handleLivePreviewInput()" onmouseup="handlePrepTextSelection(event)">
              ${renderMarkdown(mdContent)}
            </div>

            <!-- MD 源码编辑区（默认隐藏） -->
            <div id="prepSourceContainer" style="display:none;">
              <textarea id="prepSourceTextarea" class="input" style="min-height:500px;font-family:ui-monospace,monospace;font-size:13px;line-height:1.6;" oninput="syncMdFromSource()">${escapeHtml(mdContent)}</textarea>
            </div>

            <!-- 浮动 AI 改写 Diff 效果显示区域 (点击 AI 操作后呈现) -->
          </main>

          <!-- 右侧：备课 AI 助手 -->
          <aside class="prep-v3-right">
            <section class="prep-v3-academic">
              <div class="prep-v3-tabs">
                <h3 style="margin:0;color:#173f40;font-size:15px;">🤖 备课 AI 助手</h3>
                <span class="mock-chip">MOCK</span>
              </div>

              <!-- AI 助手面板 -->
              <div id="prepPaneAi" class="prep-v3-tab-pane active">
                <div class="prep-ai-chips">
                  <button onclick="prepAiAsk('检查当前教案是否覆盖教学目的与重难点')">检查教案</button>
                  <button onclick="prepAiAsk('${econ ? '补充一道供求曲线移动例题' : '补充一道 Hasse 图相关例题'}')">补充例题</button>
                  <button onclick="prepAiAsk('${econ ? '重写「4.1 需求与供给曲线」小节，使讲解更通俗' : '重写「4.1 关系的五种基本性质」小节，使讲解更通俗'}')">重写小节</button>
                </div>
                <div id="prepAiLog" class="chat-log" aria-live="polite">
                  <div class="chat-msg assistant">你好，我可以围绕当前备课单元的 MD 教案回答需求，例如“检查教案覆盖”“补充例题”，也可以选中正文后用“AI 润色 / 改写”。</div>
                </div>
                <div class="chat-compose">
                  <textarea id="prepAiInput" aria-label="向备课 AI 助手描述需求" placeholder="描述对当前教案的修改需求…"></textarea>
                  <button class="btn primary" onclick="sendPrepAiMessage()">发送</button>
                </div>
                <div id="prepAiStatus" class="chat-status">结果以 Markdown 草稿形式给出，可继续编辑后保存</div>
              </div>

            </section>

            <!-- 底部提交操作区 -->
            <div style="border-top:1px solid #edf4f3;padding-top:12px;display:grid;gap:6px;">
              <button class="btn secondary" style="width:100%;justify-content:center;" onclick="prepStartCourseware()">▧ 转为课件素材</button>
              <button class="btn primary" style="width:100%;justify-content:center;" onclick="confirmCurrentPrepUnit()">✓ 确认本节备课</button>
            </div>
          </aside>
        </div>
      </div>
    `;
  };

  // 渲染学术资料卡片 HTML
  function renderAcademicMaterialsList(mats) {
    if (!mats || !mats.length) {
      return `<div class="prep-materials-empty">暂无收集资料，可在上方使用 AI 搜索扒取。</div>`;
    }
    return mats.map(m => `
      <div class="prep-material-card" id="${m.id}">
        <div class="prep-material-top">
          <span class="prep-mat-tag ${m.category}">${m.categoryLabel || '课堂案例'}</span>
          <span style="font-size:10px;color:#819b99;">${m.source}</span>
        </div>
        <div class="prep-material-title" onclick="previewAcademicMaterial('${m.id}')">${escapeHtml(m.title)}</div>
        <p class="prep-material-abstract">${escapeHtml(m.abstract)}</p>
        <div class="prep-material-tags"><span>${escapeHtml(materialTypeLabel(m))}</span>${(m.tags || (prepIsEconomics() ? ['供求', '教学应用'] : ['关系', '教学应用'])).map(t => `<span>#${escapeHtml(t)}</span>`).join('')}</div>
        ${(m.type === 'video' || m.type === 'audio') ? `<div class="prep-media-placeholder" onclick="previewAcademicMaterial('${m.id}')">▶ 视频内容预览 · 点击观看</div>` : ''}

        ${m.note ? `<div class="prep-mat-note-box"><span>📝 <b>备注：</b>${escapeHtml(m.note)}</span><button style="border:0;background:transparent;cursor:pointer;color:#873800;" onclick="editMaterialNote('${m.id}')">✏️</button></div>` : ''}

        <div class="prep-material-meta">
          <span>🕒 抓取时间: ${m.crawledAt}</span>
          <a href="${m.url}" target="_blank" style="color:#0b9c8c;text-decoration:none;">🔗 来源网址</a>
        </div>

        <div class="prep-material-actions">
          <button class="prep-mat-btn" onclick="previewAcademicMaterial('${m.id}')">👁️ 查看详情</button>
          <button class="prep-mat-btn" onclick="editMaterialNote('${m.id}')">✍️ 备注</button>
          <button class="prep-mat-btn" style="color:#0b8d7d;font-weight:600;" onclick="citeMaterialToMarkdown('${m.id}')">📌 引用到教案</button>
        </div>
      </div>
    `).join('');
  }

  // HTML HTML转易函数
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function materialTypeLabel(m) {
    return m.typeLabel || ({paper:'论文', text:'网页', link:'网页', pdf:'PDF', audio:'音频', video:'视频'}[m.type] || '资料');
  }

  /* ===================== MD 实时编辑：预览 DOM <-> Markdown 双向同步 ===================== */
  // 行内节点 -> Markdown 片段
  function prepInlineMd(el) {
    let s = '';
    Array.from(el.childNodes).forEach(n => {
      if (n.nodeType === 3) { s += n.nodeValue; return; }
      if (n.nodeType !== 1) return;
      const tag = n.tagName.toLowerCase();
      if (tag === 'br') { s += '\n'; }
      else if (tag === 'strong' || tag === 'b') { s += '**' + prepInlineMd(n) + '**'; }
      else if (tag === 'em' || tag === 'i') { s += '*' + prepInlineMd(n) + '*'; }
      else if (tag === 'code') { s += '`' + n.textContent + '`'; }
      else if (tag === 'a') { s += '[' + prepInlineMd(n) + '](' + (n.getAttribute('href') || '') + ')'; }
      else if (tag === 'u' || tag === 'span' || tag === 'mark' || tag === 'sub' || tag === 'sup') { s += prepInlineMd(n); }
      else { s += n.textContent; }
    });
    return s;
  }

  // 引用 / 提示框内部节点 -> Markdown 内容行数组
  function prepInnerLines(el) {
    const out = [];
    Array.from(el.childNodes).forEach(c => {
      if (c.nodeType === 3) { const t = String(c.nodeValue || '').trim(); if (t) out.push(t); return; }
      if (c.nodeType !== 1) return;
      const tag = c.tagName.toLowerCase();
      if (tag === 'br') return;
      if (tag === 'p' || tag === 'div') {
        if (c.querySelector && c.querySelector(':scope > ul, :scope > ol, :scope > blockquote')) {
          prepInnerLines(c).forEach(l => out.push(l));
          return;
        }
        const t = prepInlineMd(c).trim();
        if (t) out.push(t);
        return;
      }
      if (tag === 'ul' || tag === 'ol') {
        Array.from(c.children).forEach((li, idx) => {
          const t = prepInlineMd(li).trim();
          out.push((tag === 'ul' ? '- ' : (idx + 1) + '. ') + t);
        });
        return;
      }
      if (tag === 'h1' || tag === 'h2' || tag === 'h3') { out.push(new Array(+tag[1] + 1).join('#') + ' ' + prepInlineMd(c)); return; }
      const t = prepInlineMd(c).trim();
      if (t) out.push(t);
    });
    return out;
  }

  // 提示框 div.callout-* -> Markdown 行数组
  function prepCalloutLines(el, cls) {
    const type = /callout-warning/.test(cls) ? 'warning' : 'note';
    const out = [];
    const titleNode = el.querySelector('.ct-title');
    const title = titleNode ? prepInlineMd(titleNode).trim() : '';
    out.push('> [!' + type + '] ' + title);
    Array.from(el.childNodes).forEach(c => {
      if (c.nodeType === 3) { const t = String(c.nodeValue || '').trim(); if (t) out.push('> ' + t); return; }
      if (c.nodeType !== 1) return;
      if (c.classList && c.classList.contains('ct-title')) return;
      if (c.tagName === 'UL' || c.tagName === 'OL') {
        Array.from(c.children).forEach((li, idx) => {
          const t = prepInlineMd(li).trim();
          out.push('> ' + ((c.tagName === 'UL' ? '- ' : (idx + 1) + '. ') + t));
        });
        return;
      }
      if (c.tagName === 'P' || c.tagName === 'DIV') { prepInnerLines(c).forEach(l => out.push('> ' + l)); return; }
      const t = prepInlineMd(c).trim();
      if (t) out.push('> ' + t);
    });
    return out;
  }

  // 表格 -> Markdown 行数组
  function prepTableLines(table) {
    const rows = Array.from(table.querySelectorAll('tr')).map(tr =>
      Array.from(tr.children).map(td => prepInlineMd(td).trim().replace(/\|/g, '\\|'))
    );
    if (!rows.length) return [];
    const cols = Math.max.apply(null, rows.map(r => r.length));
    const pad = r => { const a = r.slice(); while (a.length < cols) a.push(''); return a; };
    const fmt = r => '|' + pad(r).join('|') + '|';
    const out = [fmt(rows[0])];
    out.push('|' + Array(cols).fill('---').join('|') + '|');
    rows.slice(1).forEach(r => out.push(fmt(r)));
    return out;
  }

  // 单个块级节点 -> Markdown 行数组
  function prepBlockLines(node) {
    if (!node) return [];
    if (node.nodeType === 3) {
      return String(node.nodeValue || '').split('\n').map(x => x.trim()).filter(Boolean);
    }
    if (node.nodeType !== 1) return [];
    const tag = node.tagName.toLowerCase();
    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
      return [new Array(+tag[1] + 1).join('#') + ' ' + prepInlineMd(node)];
    }
    if (tag === 'hr') return ['---'];
    if (tag === 'ul' || tag === 'ol') {
      const res = [];
      Array.from(node.children).forEach((li, idx) => {
        const t = prepInlineMd(li).trim();
        res.push((tag === 'ul' ? '- ' : (idx + 1) + '. ') + t);
      });
      return res;
    }
    if (tag === 'blockquote') {
      const cls = String(node.className || '');
      if (/callout-note|callout-warning/.test(cls)) return prepCalloutLines(node, cls);
      return prepInnerLines(node).map(l => '> ' + l);
    }
    if (tag === 'table') return prepTableLines(node);
    if (tag === 'div') {
      const cls = String(node.className || '');
      if (/callout-note|callout-warning/.test(cls)) return prepCalloutLines(node, cls);
      if (/md-table-wrap/.test(cls)) {
        const tbl = node.querySelector('table');
        return tbl ? prepTableLines(tbl) : [];
      }
      // contenteditable 常用 div 充当段落；含块级子元素则递归拆解
      if (node.querySelector && node.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > ul, :scope > ol, :scope > blockquote, :scope > table, :scope > hr, :scope > div')) {
        const res = [];
        Array.from(node.childNodes).forEach(c => { prepBlockLines(c).forEach(l => res.push(l)); });
        return res;
      }
      const t = prepInlineMd(node).trim();
      return t ? [t] : [];
    }
    if (tag === 'p') { const t = prepInlineMd(node).trim(); return t ? [t] : []; }
    if (tag === 'pre') { return ['```', (node.textContent || '').replace(/\n$/, ''), '```']; }
    if (tag === 'li') { const t = prepInlineMd(node).trim(); return t ? ['- ' + t] : []; }
    const t = prepInlineMd(node).trim();
    return t ? [t] : [];
  }

  // 将实时预览 DOM 序列化为 Markdown（逐块 + 块间空行）
  window.prepSerializeToMd = function() {
    const root = document.getElementById('prepPreviewContainer');
    if (!root) return '';
    const blocks = [];
    Array.from(root.childNodes).forEach(n => {
      if (n.nodeType === 3) {
        const t = String(n.nodeValue || '');
        t.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => blocks.push([x]));
        return;
      }
      if (n.nodeType !== 1) return;
      const lines = prepBlockLines(n);
      if (lines && lines.length) blocks.push(lines);
    });
    return blocks.map(b => b.join('\n')).join('\n\n');
  };

  function prepCommitFromLive() {
    const md = window.prepSerializeToMd();
    saveMdPlan(md);
    const ta = document.getElementById('prepSourceTextarea');
    if (ta && document.activeElement !== ta) ta.value = md;
    return md;
  }

  function prepRenderLive() {
    const pv = document.getElementById('prepPreviewContainer');
    if (pv) pv.innerHTML = renderMarkdown(getMdPlan());
  }

  function prepSyncStatusText(txt) {
    const el = document.getElementById('prepSyncStatus');
    if (el) el.textContent = txt;
  }

  let prepSyncTimer = null;

  // 在实时预览中直接输入 / 修改 -> 同步到 Markdown 源码
  window.handleLivePreviewInput = function() {
    prepSyncStatusText('⏳ 正在实时同步为 Markdown …');
    if (prepSyncTimer) clearTimeout(prepSyncTimer);
    prepSyncTimer = setTimeout(function() {
      prepCommitFromLive();
      prepSyncStatusText('✅ 修改已实时保存 · MD 源码与预览保持同步');
    }, 260);
  };

  // 排版工具条：加粗 / 斜体 / 标题 / 引用 / 列表
  window.execPrepFormat = function(command, value) {
    const pv = document.getElementById('prepPreviewContainer');
    if (!pv) return;
    pv.focus();
    const sel = window.getSelection();
    try {
      if (command === 'bold' || command === 'italic') {
        if (!sel || sel.isCollapsed) {
          document.execCommand('insertText', false, command === 'bold' ? '**加粗文本**' : '*斜体文本*');
        } else {
          document.execCommand('styleWithCSS', false, false);
          document.execCommand(command, false, null);
        }
      } else if (command === 'formatBlock') {
        document.execCommand('formatBlock', false, value || '<p>');
      } else {
        document.execCommand(command, false, null);
      }
    } catch (_) {}
    prepCommitFromLive();
    prepRenderLive();
    prepSyncStatusText('✅ 排版已应用并同步到 Markdown');
  };

  // 插入「提示框 / 警告框」
  window.insertCalloutToLiveEdit = function(type) {
    const pv = document.getElementById('prepPreviewContainer');
    if (!pv) return;
    pv.focus();
    const isWarn = type === 'warning';
    const block = isWarn
      ? '\n> [!warning] ⚠️ 教学难点提示\n> - （点击提示框后可直接输入本课难点内容）\n'
      : '\n> [!note] 📌 教学提示\n> - （点击提示框后可直接输入提示 / 案例内容）\n';
    try { document.execCommand('insertText', false, block); } catch (_) {}
    prepCommitFromLive();
    prepRenderLive();
    prepSyncStatusText(isWarn ? '✅ 已插入「⚠️ 教学难点」提示框' : '✅ 已插入「📌 教学提示」提示框');
    const last = document.querySelector('#prepPreviewContainer .callout-' + (isWarn ? 'warning' : 'note') + ':last-of-type');
    const host = (last && last.querySelector('li')) || last;
    if (host) {
      try {
        const range = document.createRange();
        range.setStart(host, 0);
        range.collapse(true);
        const ss = window.getSelection();
        ss.removeAllRanges();
        ss.addRange(range);
      } catch (_) {}
    }
  };

  // 工具栏按钮点击不夺走 contenteditable 焦点/选区
  document.addEventListener('mousedown', function(e) {
    const b = e.target && e.target.closest ? e.target.closest('.prep-fmt-btn, .prep-float-btn') : null;
    if (b) e.preventDefault();
  }, true);

  // 2. 交互逻辑实现

  // (1) MD 模式切换（预览实时编辑 vs 源码）
  window.setPrepViewMode = function(mode) {
    const btnPreview = document.getElementById('btnModePreview');
    const btnSource = document.getElementById('btnModeSource');
    const boxPreview = document.getElementById('prepPreviewContainer');
    const boxSource = document.getElementById('prepSourceContainer');
    const liveBar = document.getElementById('prepLiveEditBar');
    const textarea = document.getElementById('prepSourceTextarea');

    if (mode === 'preview') {
      btnPreview.classList.add('active');
      btnSource.classList.remove('active');
      // 切回预览时，把源码里最新的 Markdown 渲染到实时预览区
      if (textarea) {
        const content = textarea.value;
        if (boxPreview) boxPreview.innerHTML = renderMarkdown(content);
      }
      boxPreview.style.display = 'block';
      boxSource.style.display = 'none';
      if (liveBar) liveBar.style.display = 'flex';
    } else {
      btnSource.classList.add('active');
      btnPreview.classList.remove('active');
      // 切到源码前，先把手写预览区内容同步成 Markdown
      if (boxPreview && boxPreview.style.display !== 'none') {
        try { if (window.prepSerializeToMd) { const md = window.prepSerializeToMd(); saveMdPlan(md); if (textarea) textarea.value = md; } } catch (_) {}
      }
      boxSource.style.display = 'block';
      boxPreview.style.display = 'none';
      if (liveBar) liveBar.style.display = 'none';
    }
  };

  // 源码同步到预览
  window.syncMdFromSource = function() {
    const textarea = document.getElementById('prepSourceTextarea');
    const preview = document.getElementById('prepPreviewContainer');
    if (textarea && preview) {
      const content = textarea.value;
      saveMdPlan(content);
      preview.innerHTML = renderMarkdown(content);
    }
  };

  // (2) 划词浮动工具栏 (Float Toolbar)
  window.handlePrepTextSelection = function(event) {
    // 清除已有的浮动栏
    const existing = document.getElementById('prepFloatToolbar');
    if (existing) existing.remove();

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const mainRect = document.getElementById('prepMainWorkspace').getBoundingClientRect();

    // 相对定位
    const top = rect.top - mainRect.top - 42;
    const left = Math.max(10, rect.left - mainRect.left);

    const toolbar = document.createElement('div');
    toolbar.id = 'prepFloatToolbar';
    // 与“课程大纲”复用同一套 AI 交互视觉样式
    toolbar.className = 'md-ai-float-bubble';
    toolbar.style.top = top + 'px';
    toolbar.style.left = left + 'px';
    toolbar.innerHTML = `
      <span style="font-weight:600;font-size:11px;margin-right:2px;color:#8ce0d3">AI 修改：</span>
      <button type="button" onclick="applyAiActionToSelection('expand', '${escapeHtml(selectedText)}')">✦ 扩写</button>
      <button type="button" onclick="applyAiActionToSelection('simplify', '${escapeHtml(selectedText)}')">✦ 简化</button>
      <button type="button" onclick="applyAiActionToSelection('rewrite', '${escapeHtml(selectedText)}')">✦ 重写</button>
      <button type="button" onclick="applyAiActionToSelection('polish', '${escapeHtml(selectedText)}')">✦ 润色</button>
    `;

    document.getElementById('prepMainWorkspace').appendChild(toolbar);
  };

  // (3) AI 操作与 Diff 效果高亮展示
  let prepPendingRange = null;
  let prepPendingNewText = '';
  let prepPendingOldText = '';

  // 浮动工具条通过内联属性传入文本，先还原 HTML 实体
  function decodePrepEntities(s) {
    if (!s || s.indexOf('&') === -1) return s || '';
    const div = document.createElement('div');
    div.innerHTML = s;
    return div.textContent || '';
  }

  window.applyAiActionToSelection = function(actionType, text) {
    const toolbar = document.getElementById('prepFloatToolbar');
    if (toolbar) toolbar.remove();

    // 在移除浮动栏前保留原始选区，便于「应用变更」时原位替换
    let range = null;
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount && !sel.isCollapsed) range = sel.getRangeAt(0).cloneRange();
    } catch (_) {}

    const selectedText = decodePrepEntities(text).trim();
    const econAction = prepIsEconomics();
    const actionMap = {
      polish: { title: 'AI 润色修饰', result: selectedText + '（针对语言流畅度与教学严谨度进行了提炼表达）' },
      rewrite: { title: 'AI 改写为递演逻辑', result: '引入实际案例对比：' + selectedText + '，引导学生通过反例深入推导。' },
      expand: { title: 'AI 扩写教学步骤', result: selectedText + (econAction ? '。在讲解该步骤时，教师可在板书绘制供求曲线示意图，并引导学生开展 3 分钟小组讨论。' : '。在讲解该步骤时，教师可在板书列出映射矩阵，并引导学生开展 3 分钟小组讨论。') },
      simplify: { title: 'AI 精简提炼', result: selectedText.substring(0, Math.max(10, Math.floor(selectedText.length * 0.6))) + '…' },
      academic: { title: 'AI 学术规范化表达', result: '规范学术表述：根据' + (econAction ? '经济学原理' : '形式逻辑定义') + '，' + selectedText }
    };

    const target = actionMap[actionType] || actionMap.polish;
    prepPendingRange = range;
    prepPendingNewText = target.result;
    prepPendingOldText = selectedText;
    const prompt = `请对以下教案内容进行${target.title.replace(/^AI /,'')}：\n“${selectedText}”`;
    const input = document.getElementById('prepAiInput');
    if (input) input.value = prompt;
    prepAiAsk(prompt, target.result);
  };

  function showDiffPreview(oldText, newText, title) {
    const container = document.getElementById('prepDiffContainer');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
      <div class="prep-diff-box">
        <div class="prep-diff-head">
          <b>✨ ${title} (对比预览)</b>
          <span style="font-size:11px;color:#789491;">继承教学大纲差异高亮规范</span>
        </div>
        <div class="prep-diff-content">
          <del class="diff-del">${escapeHtml(oldText)}</del>
          <ins class="diff-add">${escapeHtml(newText)}</ins>
        </div>
        <div class="prep-diff-actions">
          <button class="btn secondary" style="font-size:11px;padding:5px 10px;" onclick="closeDiffPreview()">放弃</button>
          <button class="btn primary" style="font-size:11px;padding:5px 10px;" onclick="acceptDiffChange()">应用变更</button>
        </div>
      </div>
    `;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  window.closeDiffPreview = function() {
    const container = document.getElementById('prepDiffContainer');
    if (container) container.style.display = 'none';
  };

  window.acceptDiffChange = function() {
    closeDiffPreview();
    const newText = prepPendingNewText;
    let appliedInDom = false;

    // 优先：在实时预览中把原选区原位替换为 AI 结果
    const pv = document.getElementById('prepPreviewContainer');
    if (pv && prepPendingRange) {
      try {
        const range = prepPendingRange;
        const textNode = document.createTextNode(newText);
        range.deleteContents();
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        appliedInDom = true;
      } catch (_) {}
    }
    prepPendingRange = null;

    if (appliedInDom) {
      // 从更新后的 DOM 重新同步 Markdown 源码
      prepCommitFromLive();
      prepSyncStatusText('✅ AI 改写已应用 · 修改已同步到 Markdown');
    } else {
      // 兜底：若选区丢失，则基于 Markdown 源码替换首个匹配片段
      let md = getMdPlan();
      const oldText = prepPendingOldText;
      if (oldText && md.indexOf(oldText) !== -1) {
        md = md.replace(oldText, newText);
        saveMdPlan(md);
        const ta = document.getElementById('prepSourceTextarea');
        if (ta) ta.value = md;
        prepRenderLive();
        prepSyncStatusText('✅ AI 改写已应用至 Markdown（源码级替换）');
      } else {
        alert('AI 结果已生成，但因选区变化未能自动替换。请在源码模式中手工粘贴。\n\n' + newText);
        return;
      }
    }
  };

  // (4) AI 网页自动扒取引擎模拟
  window.runAiWebScraper = function() {
    const input = document.getElementById('scraperKeyword');
    const keyword = input ? input.value.trim() : '';
    if (!keyword) {
      alert('请先输入要扒取和检索的核心主题。');
      return;
    }

    const configuredSources = getCustomSources().filter(s => s.enabled);
    const selectedNames = Array.from(document.querySelectorAll('.prep-source-filter.active')).map(el => el.textContent.trim());
    const sources = selectedNames.length ? configuredSources.filter(s => selectedNames.includes(s.name)) : configuredSources;
    const sourceNames = sources.map(s => s.name).join('、');

    const list = document.getElementById('academicMaterialsList');
    if (list) {
      list.innerHTML = `
        <div class="prep-materials-empty" style="text-align:left;padding:18px 10px;">
          <div style="font-size:14px;margin-bottom:6px;">⚡ AI 扒取引擎正在调度中...</div>
          <div>跨站点抓取 [${sourceNames}] 中，提取结构化学术知识...</div>
        </div>
      `;
    }

    setTimeout(() => {
      const newScrapedMaterial = {
        id: 'mat-scraped-' + Date.now(),
        title: `AI 扒取：基于“${keyword}”的专利与教学前沿分析`,
        type: 'video',
        typeLabel: '视频',
        sourceType: 'web',
        tags: [keyword, '前沿分析', '教学案例'],
        category: 'news',
        categoryLabel: '最新资讯',
        source: sources[sources.length - 1]?.name || '中国专利网 (Patent)',
        url: 'https://example.com/scraped-knowledge',
        crawledAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        abstract: `系统依据老师配置的数据源，自动抓取了最新的专利/文献。针对【${keyword}】提取出3项关键推导步骤。`,
        note: 'AI 自动扒取固化材料，支持添加到当前单元基础知识库',
        isSaved: true
      };

      const mats = getAcademicMaterials();
      mats.unshift(newScrapedMaterial);
      saveAcademicMaterials(mats);

      if (list) list.innerHTML = renderAcademicMaterialsList(mats);
      prepRefreshMatBadge();
      alert(`AI 扒取完成！已从 [${sourceNames}] 提取最新相关资料并固化保存。`);
    }, 1200);
  };

  // (5) 教案一键引用
  window.citeMaterialToMarkdown = function(matId) {
    const mats = getAcademicMaterials();
    const mat = mats.find(m => m.id === matId);
    if (!mat) return;

    const citationMd = `\n\n> 📌 **引用学术资料**：《${mat.title}》\n> - **来源**：${mat.source} | **类型**：${materialTypeLabel(mat)} | **标签**：${(mat.tags || []).map(t => '#' + t).join('、') || '未标注'}\n> - **分类**：\`${mat.categoryLabel}\` | **抓取时间**：${mat.crawledAt} | [打开原网页/PDF](${mat.url})\n${mat.note ? `> - **教师备注**：${mat.note}\n` : ''}\n`;

    const mdContent = getMdPlan() + citationMd;
    saveMdPlan(mdContent);

    // 刷新显示
    const preview = document.getElementById('prepPreviewContainer');
    const textarea = document.getElementById('prepSourceTextarea');
    if (preview) preview.innerHTML = renderMarkdown(mdContent);
    if (textarea) textarea.value = mdContent;

    alert(`已将《${mat.title}》生成的 Markdown 引用卡片成功插入教案！`);
  };

  window.filterAcademicMaterials = function(keyword) {
    const list = document.getElementById('academicMaterialsList'); if (!list) return;
    const q = String(keyword || '').toLowerCase();
    const mats = getAcademicMaterials().filter(m => !q || [m.title, m.abstract, m.source, ...(m.tags || [])].join(' ').toLowerCase().includes(q));
    list.innerHTML = renderAcademicMaterialsList(mats);
  };

  window.setPrepSourceScope = function(btn, scope) {
    document.querySelectorAll('.prep-source-group button').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active');
    const list = document.getElementById('academicMaterialsList'); if (!list) return;
    const mats = getAcademicMaterials();
    const filtered = scope === 'all' ? mats : mats.filter(m => scope === 'academic' ? /知网|万方|维普|arXiv|教育平台/.test(m.source) : scope === 'professional' ? /专利|专业/.test(m.source) : scope === 'custom' ? m.sourceType === 'custom' : scope === 'web' ? m.sourceType === 'web' : true);
    list.innerHTML = renderAcademicMaterialsList(filtered);
  };

  window.togglePrepSourceFilter = function(btn) {
    if (!btn) return;
    btn.classList.toggle('active');
  };

  // (6) 查看学术资料多模态详情弹窗
  window.previewAcademicMaterial = function(matId) {
    const mats = getAcademicMaterials();
    const mat = mats.find(m => m.id === matId);
    if (!mat) return;

    const overlay = document.createElement('div');
    overlay.className = 'prep-edit-overlay';
    overlay.id = 'materialPreviewModal';
    overlay.innerHTML = `
      <div class="prep-edit-modal" style="width:min(700px,94vw);" role="dialog">
        <div class="prep-edit-head">
          <h3>🎓 学术资料详情</h3>
          <button class="prep-edit-close" onclick="document.getElementById('materialPreviewModal').remove()">×</button>
        </div>
        <div class="prep-edit-pane" style="padding:20px;display:grid;gap:12px;">
          <div><span class="prep-mat-tag ${mat.category}">${mat.categoryLabel}</span> <span style="font-size:12px;color:#6b8785;margin-left:8px;">来源: ${mat.source}</span></div>
          <h2 style="font-size:17px;color:#143738;margin:0;">${escapeHtml(mat.title)}</h2>
          <div class="prep-material-tags"><span>类型：${escapeHtml(materialTypeLabel(mat))}</span>${(mat.tags || []).map(t => `<span>#${escapeHtml(t)}</span>`).join('')}</div>
          <div style="font-size:11px;color:#819b99;">抓取时间戳 (Timestamp): ${mat.crawledAt}</div>
          <div style="background:#f6faf9;border:1px solid #dcece8;padding:12px;border-radius:8px;font-size:13px;line-height:1.7;">
            <b>核心摘要/正文提取：</b><br>${escapeHtml(mat.abstract)}
          </div>
          ${mat.note ? `<div style="background:#fffbe6;border:1px solid #ffe58f;padding:10px;border-radius:8px;font-size:12px;color:#873800;"><b>📝 教师备注：</b>${escapeHtml(mat.note)}</div>` : ''}
          <div><a href="${mat.url}" target="_blank" style="color:#0b9c8c;font-size:12px;text-decoration:none;">🔗 打开原始 Web 页/阅读 PDF 全文 →</a></div>
        </div>
        <div class="prep-edit-foot">
          <button class="btn secondary" onclick="document.getElementById('materialPreviewModal').remove()">关闭</button>
          <button class="btn primary" onclick="citeMaterialToMarkdown('${mat.id}');document.getElementById('materialPreviewModal').remove();">引用到教案</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  // (7) 添加/修改教师备注
  window.editMaterialNote = function(matId) {
    const mats = getAcademicMaterials();
    const mat = mats.find(m => m.id === matId);
    if (!mat) return;

    const note = prompt(`对学术资料《${mat.title}》添加/修改备注说明：`, mat.note || '');
    if (note !== null) {
      mat.note = note.trim();
      saveAcademicMaterials(mats);

      const list = document.getElementById('academicMaterialsList');
      if (list) list.innerHTML = renderAcademicMaterialsList(mats);
      prepRefreshMatBadge();
    }
  };

  // (8) ⚙️ 自定义数据源配置弹窗
  window.openCustomSourcesModal = function() {
    const sources = getCustomSources();

    const overlay = document.createElement('div');
    overlay.className = 'prep-edit-overlay';
    overlay.id = 'customSourcesModal';
    overlay.innerHTML = `
      <div class="prep-edit-modal" style="width:min(600px,94vw);" role="dialog">
        <div class="prep-edit-head">
          <h3>⚙️ 检索数据源配置 (系统内置 + 教师自定义)</h3>
          <button class="prep-edit-close" onclick="document.getElementById('customSourcesModal').remove()">×</button>
        </div>
        <div class="prep-edit-pane" style="padding:20px;display:grid;gap:14px;">
          <p style="font-size:12px;color:#5a7674;margin:0;">
            老师可在此自主配置爬取的外部目标网址（如专利网、学术预印本、科技新闻网）。备课搜索时，系统将使用 AI 扒取这些站点的内容。
          </p>

          <div style="display:grid;gap:8px;" id="customSourcesListContainer">
            ${sources.map((s, idx) => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid #dcece8;border-radius:8px;background:${s.isPreset ? '#f9fcfb' : '#fff'};">
                <div>
                  <b style="font-size:13px;color:#184243;">${escapeHtml(s.name)}</b>
                  <span style="font-size:10px;color:#859e9c;margin-left:6px;">${s.isPreset ? '[系统预置]' : '[教师自定义]'}</span>
                </div>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#496c6a;cursor:pointer;">
                  <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="toggleSourceEnabled(${idx}, this.checked)" /> 启用
                </label>
              </div>
            `).join('')}
          </div>

          <div style="border-top:1px dashed #d5ece7;padding-top:12px;display:grid;gap:8px;">
            <b style="font-size:12px;color:#173f40;">＋ 添加教师自定义数据源 (如：专利网/新站点)</b>
            <div style="display:flex;gap:6px;">
              <input id="newSourceName" placeholder="数据源名称 (如: 知识产权局专利网)" style="flex:1;border:1px solid #cde4e0;border-radius:8px;padding:6px 10px;font-size:12px;" />
              <button class="btn primary" style="font-size:11px;" onclick="addNewCustomSource()">添加源</button>
            </div>
          </div>
        </div>
        <div class="prep-edit-foot">
          <button class="btn primary" onclick="document.getElementById('customSourcesModal').remove();location.reload();">保存配置</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window.toggleSourceEnabled = function(index, checked) {
    const sources = getCustomSources();
    if (sources[index]) {
      sources[index].enabled = checked;
      saveCustomSources(sources);
    }
  };

  window.addNewCustomSource = function() {
    const input = document.getElementById('newSourceName');
    const name = input ? input.value.trim() : '';
    if (!name) {
      alert('请输入自定义数据源名称。');
      return;
    }

    const sources = getCustomSources();
    sources.push({
      id: 'src-custom-' + Date.now(),
      name: name,
      isPreset: false,
      enabled: true
    });
    saveCustomSources(sources);
    document.getElementById('customSourcesModal').remove();
    openCustomSourcesModal();
  };

  // 其他辅助函数
  window.savePrepState = function() {
    alert('已成功保存当前备课草稿！');
  };

  window.prepStartCourseware = function() {
    alert('已将教案材料转存为课件制作素材！即将跳转课件制作。');
    location.hash = '#course/courseware';
  };

  window.confirmCurrentPrepUnit = function() {
    alert('本节备课已确认！状态更新为【已确认】。');
  };

  window.switchPrepUnit = function(unitId) {
    document.querySelectorAll('.prep-v3-unit-pill').forEach(p => p.classList.remove('active'));
    event.currentTarget.classList.add('active');
  };

  // 右侧 Tab 切换：ai 助手 / materials 学术资料
  window.prepRightTab = function(which) {
    const btnAi = document.getElementById('prepTabBtnAi');
    const btnMat = document.getElementById('prepTabBtnMat');
    const paneAi = document.getElementById('prepPaneAi');
    const paneMat = document.getElementById('prepPaneMat');
    if (which === 'materials') {
      if (btnAi) { btnAi.classList.remove('active'); btnAi.setAttribute('aria-selected', 'false'); }
      if (btnMat) { btnMat.classList.add('active'); btnMat.setAttribute('aria-selected', 'true'); }
      if (paneAi) paneAi.classList.remove('active');
      if (paneMat) paneMat.classList.add('active');
    } else {
      if (btnMat) { btnMat.classList.remove('active'); btnMat.setAttribute('aria-selected', 'false'); }
      if (btnAi) { btnAi.classList.add('active'); btnAi.setAttribute('aria-selected', 'true'); }
      if (paneMat) paneMat.classList.remove('active');
      if (paneAi) paneAi.classList.add('active');
    }
  };

  // 同步右侧学术资料角标数量
  function prepRefreshMatBadge() {
    const badge = document.getElementById('prepMatCount');
    if (!badge) return;
    try {
      const stored = localStorage.getItem(prepStorageKey() + '_materials');
      const arr = stored ? JSON.parse(stored) : currentAcademicMaterialsDefault();
      badge.textContent = (arr && arr.length) ? arr.length : 0;
    } catch (_) {}
  }

  /* ===================== 备课 AI 助手（Mock 对话） ===================== */
  function prepAiCannedReply(text) {
    const t = text || '';
    if (prepIsEconomics()) {
      if (/检查|覆盖/.test(t)) return '已检查当前教案：教学目标的 4 项与经济学大纲目标全部对应；教学重点与难点均已给出讲解方向；「4.1 需求与供给曲线」建议补充一道政策案例互动题后再保存。';
      if (/例题|题目/.test(t)) return '建议补充：设某地住房市场需求函数 Qd=100-2P，供给函数 Qs=20+3P，请学生求解均衡价格与数量，并讨论限价 P=12 时的市场状况。可插入「4.1」小节后。';
      if (/重写|改写/.test(t)) return '重写建议：先用生活实例引出需求定律与供给定律，再用同一组供求曲线逐条演示位移因素，最后对比“需求量变动”与“需求变动”。可选中正文后使用“AI 改写”，查看差异并应用。';
      if (/引入|导入/.test(t)) return '可在「3. 教学引入」补充：以新能源车补贴退坡后的市场价格变化为例，把政策调整抽象为供求曲线位移，衔接政策效果评估。';
      if (/作业|思考|总结/.test(t)) return '作业建议：补充判断收入上升对正常品与低档品需求的差异化影响，说明支持价格政策为何会带来过剩，并绘制供求曲线示意图。';
    } else {
      if (/检查|覆盖/.test(t)) return '已检查当前教案：教学目标的 4 项与大纲目标全部对应；教学重点与难点均已给出讲解方向；「4.1 关系的五种基本性质」建议补充一道反例互动题后再保存。';
      if (/例题|题目/.test(t)) return '建议补充：设 A={1,2,3,4}，R={(1,1),(2,2),(3,3),(4,4),(1,2),(2,1),(3,4)}。请学生判断 R 的各条性质并用关系矩阵验证。可插入「4.1」小节后。';
      if (/重写|改写/.test(t)) return '重写建议：先列出三种基本性质的定义，再用同一组矩阵逐条验证，最后对比“反对称”与“不对称”的反例。可选中正文后使用“AI 改写”，查看差异并应用。';
      if (/引入|导入|排课/.test(t)) return '可在「3. 教学引入」补充：以教务系统排课冲突为例，把“同一教室被两门课占用”抽象为关系与矩阵判定，衔接排课算法应用。';
      if (/作业|思考|总结/.test(t)) return '作业建议：补充判断空关系、全关系分别满足哪些性质，说明等价关系为何必须自反，并对比哈斯图与关系图。';
    }
    return '已收到：' + (t.length > 40 ? t.slice(0, 40) + '…' : t) + '。我将围绕当前备课单元生成建议草稿；也可选中 MD 正文直接使用“AI 润色 / 改写”。';
  }

  // 发送一条提问（支持快捷词与输入框）
  window.prepAiAsk = function(text, generatedSelectionResult) {
    const log = document.getElementById('prepAiLog');
    const input = document.getElementById('prepAiInput');
    const status = document.getElementById('prepAiStatus');
    if (!log) return;
    const question = (text !== undefined ? String(text) : (input ? input.value : '')).trim();
    if (!question) {
      if (input) input.focus();
      return;
    }
    if (input) input.value = '';
    const user = document.createElement('div');
    user.className = 'chat-msg user';
    user.textContent = question;
    log.appendChild(user);
    const pending = document.createElement('div');
    pending.className = 'chat-msg assistant';
    pending.textContent = '正在思考…';
    log.appendChild(pending);
    log.scrollTop = log.scrollHeight;
    if (status) status.textContent = 'AI 正在生成建议…';
    setTimeout(function() {
      pending.textContent = generatedSelectionResult || prepAiCannedReply(question);
      if (generatedSelectionResult) {
        const adopt = document.createElement('button');
        adopt.className = 'btn primary'; adopt.style.cssText = 'font-size:11px;padding:4px 9px;margin-top:6px;';
        adopt.textContent = '采纳到教案'; adopt.onclick = function(){ acceptDiffChange(); };
        pending.appendChild(document.createElement('br')); pending.appendChild(adopt);
      }
      log.scrollTop = log.scrollHeight;
      if (status) status.textContent = '建议已生成 · 可继续编辑教案或提问';
    }, 700);
  };

  window.sendPrepAiMessage = function() {
    window.prepAiAsk(undefined);
  };

  // AI 助手输入框：Ctrl/⌘ + Enter 或普通 Enter 均可发送（单行输入，不换行）
  document.addEventListener('keydown', function(e) {
    if ((e.key === 'Enter') && e.target && e.target.id === 'prepAiInput') {
      e.preventDefault();
      window.prepAiAsk(undefined);
    }
  });

  const _prevCoursePagePrep = window.coursePage;
  window.coursePage = function(k) {
    if (k === 'preparation') {
      const content = window.__prepWorkspacePage ? window.__prepWorkspacePage() : '';
      return window.__courseShellV2 ? window.__courseShellV2(content, k) : content;
    }
    return typeof _prevCoursePagePrep === 'function' ? _prevCoursePagePrep(k) : (window.__courseShellV2 ? window.__courseShellV2('', k) : '');
  };

  if ((location.hash === '#course/preparation' || location.hash.indexOf('preparation') !== -1) && typeof window.render === 'function') {
    setTimeout(window.render, 0);
  }
})();
