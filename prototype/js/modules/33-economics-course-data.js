/* Economics course view: keep the prototype's interaction model while providing a complete economics-facing dataset. */
(function(){
  const isEconomics=()=>{try{return localStorage.getItem('ai-jiaowu-current-course')==='economics'}catch{return false}};
  const replacements=[
    ['《离散数学》（第 2 版）','《经济学原理》（第 8 版）'],['离散数学教材第1-3章.pdf','经济学原理教材第1-3章.pdf'],['离散数学教材.pdf','经济学原理教材.pdf'],['离散数学结构','经济学原理'],['离散数学','经济学原理'],
    ['集合论基础','经济学基础'],['集合与关系','供求与市场机制'],['集合概念与科学求真','经济学问题与实证求真'],['集合运算律','供求变动规律'],['数理逻辑','经济学分析方法'],['古典数理逻辑','经济学基本模型'],['图与网络','市场结构与竞争'],['图的连通性','市场联系与传导'],['图论','市场结构'],['欧拉图与哈密顿图','完全竞争与垄断竞争'],['代数系统','宏观经济指标'],['群、环、域','宏观经济分析'],['最短路径算法','成本收益比较'],['Dijkstra 算法练习；Kruskal 算法练习','边际成本与边际收益练习'],['Prim 算法练习；流动推销问题练习','市场均衡与政策模拟'],
    ['关系的基本概念及其性质','需求关系与市场机制'],['等价关系','替代品与互补品'],['偏序关系','市场层级与比较'],['映射','价格信号传导'],['邻接矩阵','供求曲线图'],['握手定理','国民收入核算恒等式'],['哈斯图','供求结构图'],
    ['第一章','第一章'],['第二章','第二章'],['第三章','第三章'],['第四章','第四章'],
    ['1.1 集合的基本概念','1.1 经济学研究对象与稀缺性'],['1.2.1 关系的基本概念及其性质','1.2.1 需求、供给与市场机制'],['1.2.2 等价关系','1.2.2 弹性与替代效应'],['1.2.3 偏序关系','1.2.3 均衡与效率'],['1.3 映射','1.3 价格与资源配置'],['2.1 命题逻辑','2.1 生产者与消费者选择'],['2.2 谓词逻辑','2.2 成本、收益与利润'],['3.1 图的基本概念、权图','3.1 市场结构与企业行为'],['3.2 树','3.2 完全竞争市场'],['3.3 有向图、欧拉路','3.3 垄断与价格歧视'],['3.4 哈密尔顿图','3.4 垄断竞争与寡头'],['4.1 代数系统','4.1 国民收入与经济增长'],['4.2 群的定义','4.2 货币与通货膨胀'],['4.3 子群及其陪集','4.3 失业与经济周期'],['4.4 群的同态与同构','4.4 财政政策与乘数'],['4.5 环','4.5 开放经济与国际贸易'],
    ['图论基础','供求分析基础'],['集合基础','经济学基础'],['关系','供求关系'],['欧拉图','市场竞争'],['哈密顿图','企业决策'],['证明题','分析题'],['课本习题','教材练习'],
    ['智能科学与技术 25 级','经济学与管理类 25 级'],['智科25-1；智科25-2','经管25-1；经管25-2'],['智科 25-1；智科 25-2','经管 25-1；经管 25-2'],['张寒','林老师'],['AI120030','ECON101'],['MATH203','ECON101'],
    ['第 4 章','第 2 章'],['第4章','第2章'],['第 3 章','第 3 章'],['第3章','第3章'],['第 1 章','第 1 章'],
    ['46 / 50','42 / 48'],['46 名学生','48 名学生'],['学生 A***21','学生 A***18'],['学生 B***08','学生 B***07'],['学生 C***34','学生 C***29'],['学生 D***17','学生 D***12'],
    ['集合与关系','供求与市场机制'],['图与网络','市场结构与竞争'],['代数系统','宏观经济指标'],['抽象建模能力','经济分析能力'],['算法实践能力','政策分析能力'],
    ['欧拉图与哈密顿图','完全竞争与垄断竞争'],['最短路径算法','成本收益比较'],['关系矩阵','供求模型'],['关系闭包运算','市场传导分析'],
    ['2026 秋季期中试卷','2026 秋季经济学阶段测验'],['离散数学基础题库','经济学原理基础题库'],['历年期中试题库','经济学案例题库'],['关于关系 R 的性质，以下正确的是？','关于需求曲线移动，以下说法正确的是？'],['下列哪项最能体现集合运算的交换律？','下列哪项会导致均衡价格上升？'],['简述欧拉图与哈密顿图的定义及区别。','简述完全竞争市场与垄断市场的主要区别。'],['自反、对称、传递','需求、供给、均衡'],['并集运算满足交换律。','供给减少通常会推动均衡价格上升。'],
    ['本文探讨了离散数学中二元关系的自反性与传递性在排课建模中的应用','本文探讨需求弹性与供给弹性在价格决策和市场预测中的应用'],['莱布尼茨在1679年提出的通用符号系统','亚当·斯密关于分工与市场机制的经典论述'],
    ['# 第一章 集合论基础 · 第二节 关系','# 第一章 经济学基础 · 第二节 供求与均衡'],['设 R 是集合 A 上的二元关系：','设市场需求函数为 Qd(P)，供给函数为 Qs(P)：'],
    ['第 4 章备课草稿','第二章备课草稿'],['第 4 章 · 图论','第二章 · 市场结构'],['教学日历 v3 待审核','经济学教学日历 v1 待审核']
  ];
  replacements.sort((a,b)=>b[0].length-a[0].length);
  const replace=s=>replacements.reduce((v,[a,b])=>v.split(a).join(b),String(s));
  const apply=()=>{if(!isEconomics())return;const root=document.querySelector('#app')||document.body;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>{const next=replace(n.nodeValue);if(next!==n.nodeValue)n.nodeValue=next});root.querySelectorAll('input,textarea').forEach(el=>{if(el.value)el.value=replace(el.value);if(el.placeholder)el.placeholder=replace(el.placeholder)});root.querySelectorAll('[title],[aria-label]').forEach(el=>{if(el.title)el.title=replace(el.title);if(el.getAttribute('aria-label'))el.setAttribute('aria-label',replace(el.getAttribute('aria-label')))});};
  let applying=false;const run=()=>{if(applying)return;applying=true;try{apply()}finally{applying=false}};
  const observer=new MutationObserver(run);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('hashchange',()=>setTimeout(run,30));setInterval(run,700);run();
})();
