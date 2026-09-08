/* Extracted from course-v2.js. Load order is intentional. */
/* expose the Word-only chapter fields in the existing chapter editor */
(function(){
  const defaults={
    '1':{method:'课堂讲授、知识运用示例、引导讨论；基于 MOOC 平台、教材和其他拓展材料开展自学。',homework:'集合有几种表示形式？\n如何利用集合等值式证明集合等式？\n如何利用关系矩阵证明关系的性质？'},
    '1.1':{method:'课堂讲授、知识运用示例、引导讨论；基于 MOOC 平台、教材和其他拓展材料开展自学。',homework:'集合有几种表示形式？\n如何利用集合等值式证明集合等式？'},
    '1.2':{method:'课堂讲授、知识运用示例、引导讨论；基于教材和 MOOC 平台开展自学。',homework:'如何利用关系矩阵证明关系的性质？'},
    '2.1':{method:'课堂讲授、例题分析和引导讨论。',homework:'什么是命题？如何判断命题？\n如何求命题的范式？\n如何进行命题的推理？'},
    '2.2':{method:'课堂讲授、例题分析，突出形式化表达。',homework:'谓词公式与命题公式有何区别？\n如何求谓词公式的前束范式？'},
    '3':{method:'例题分析和讲解，突出方法论，培养复杂问题的分析与解决能力。',homework:'连通图在实际中有何应用？\n如何构造最优二元树？'},
    '4':{method:'指导学习方法和学习资源，查找资料、观看 MOOC 平台视频并进行数据分析与总结。',homework:'如何判断代数系统构成群？'}
  };
  const storageKey='ai-jiaowu-syllabus-chapter-details-discrete';
  const getDetail=code=>{let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{};const form=document.getElementById('chapterEditorForm'),parentIndex=Number(form&&form.dataset.chapterIndex),childIndex=form&&form.dataset.childIndex===''?null:Number(form.dataset.childIndex),chapters=window.__syllabusChapters||[],parent=chapters[parentIndex],target=parent&&childIndex!=null?(parent.children||[])[childIndex]:parent,key=target&&target.id;return Object.assign({},defaults[code]||{},saved[key]||{},saved[code]||{})};
  const chapterCode=()=>{const form=document.getElementById('chapterEditorForm');return form&&form.elements.code&&form.elements.code.value||''};
  const ensureFields=()=>{
    const form=document.getElementById('chapterEditorForm');
    if(!form||form.dataset.wordFieldsBound)return;
    const firstCard=form.querySelector('.chapter-editor-main .chapter-editor-card');
    const requirements=form.elements.requirements;
    if(!firstCard||!requirements)return;
    const methodLabel=document.createElement('label');methodLabel.className='chapter-editor-label chapter-editor-textarea';methodLabel.innerHTML='教学方法<textarea name="teachingMethod" placeholder="填写课堂讲授、例题分析、讨论或 MOOC 自学安排"></textarea>';
    const homeworkLabel=document.createElement('label');homeworkLabel.className='chapter-editor-label chapter-editor-textarea';homeworkLabel.innerHTML='作业与思考题<textarea name="homework" placeholder="每行填写一道作业或思考题"></textarea>';
    requirements.closest('.chapter-editor-label').after(methodLabel,homeworkLabel);
    form.dataset.wordFieldsBound='1';
    form.addEventListener('submit',()=>setTimeout(()=>{
      const parentIndex=Number(form.dataset.chapterIndex),childIndex=form.dataset.childIndex===''?null:Number(form.dataset.childIndex);const chapters=window.__syllabusChapters||[];const chapter=chapters[parentIndex];const target=chapter&&childIndex!=null?(chapter.children||[])[childIndex]:chapter;const key=target&&target.id||form.elements.code.value.trim();let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{}
      saved[key]=Object.assign({},saved[key]||{}, {teachingMethod:form.elements.teachingMethod.value.trim(),homework:form.elements.homework.value.trim()});
      try{localStorage.setItem(storageKey,JSON.stringify(saved))}catch{}
    },0));
  };
  const fillFields=()=>{ensureFields();const form=document.getElementById('chapterEditorForm');if(!form||!form.elements.teachingMethod)return;const d=getDetail(chapterCode());form.elements.teachingMethod.value=d.teachingMethod||d.method||'';form.elements.homework.value=d.homework||''};
  const observe=()=>{if(window.MutationObserver){const o=new MutationObserver(()=>{const form=document.getElementById('chapterEditorForm');if(form&&!form.dataset.wordFieldsBound)fillFields()});o.observe(document.body,{childList:true,subtree:true})}};
  document.addEventListener('click',()=>setTimeout(fillFields,0),true);
  document.addEventListener('keydown',()=>setTimeout(fillFields,0),true);
  observe();
})();

(function(){
  const style=document.createElement('style');
  style.id='word-syllabus-trace-style';
  style.textContent='.word-trace-grid{display:grid;grid-template-columns:1.05fr 1.45fr .7fr;gap:7px;margin-bottom:2px}.word-trace-grid>div{padding:8px 9px;border-radius:7px;background:#f3faf8;border:1px solid #e5f0ed}.word-trace-grid span,.word-trace-grid b{display:block}.word-trace-grid span{color:var(--muted);font-size:10px}.word-trace-grid b{margin-top:2px;color:var(--ink);font-size:11px;line-height:1.45}@media(max-width:620px){.word-trace-grid{grid-template-columns:1fr}}';
  document.head.appendChild(style);
})();

(function(){
  const refresh=()=>{if(location.hash!=='#course/syllabus')return;const list=Array.isArray(window.__syllabusChapters)?window.__syllabusChapters:[];const total=list.reduce((sum,ch)=>sum+Number(ch.hours||0),0);const diff=48-total;const diffLabel=diff===0?'已与学校模板 48 学时对齐':'与学校模板 48 学时相差 '+Math.abs(diff)+' 学时';const wordDiff=document.querySelector('.word-diff');if(wordDiff){const first=wordDiff.querySelector('span');if(first)first.textContent='当前编辑版本 v3 · '+total+' 学时';const badge=wordDiff.querySelector('b');if(badge)badge.textContent=diffLabel}const source=document.querySelector('.syllabus-template-summary-source');if(source)source.innerHTML=source.innerHTML.replace(/课程大纲 v3 · 当前配置 \d+ 学时/,'课程大纲 v3 · 当前配置 '+total+' 学时');const note=document.querySelector('.word-review-note p');if(note)note.textContent=note.textContent.replace(/当前 v3 草稿仍为 \d+ 学时/,'当前 v3 草稿仍为 '+total+' 学时');};
  window.refreshWordSyllabusPreviewStats=refresh;
  document.addEventListener('click',()=>setTimeout(refresh,140),true);
  window.addEventListener('hashchange',()=>setTimeout(refresh,240));
  setTimeout(refresh,260);
})();

(function(){
  const numerals={'第一章':'1','第二章':'2','第三章':'3','第四章':'4'};
  const bind=()=>{if(location.hash!=='#course/syllabus')return;document.querySelectorAll('.word-chapter-actions button').forEach(button=>{const chapter=button.closest('.word-chapter');const label=chapter&&chapter.querySelector('.official-chapter-code');const code=label&&(numerals[label.textContent.trim()]||label.textContent.trim().replace(/[^0-9]/g,''));if(!code||button.dataset.editorBound)return;button.dataset.editorBound='1';button.onclick=e=>{e.preventDefault();e.stopPropagation();window.openOfficialChapterEditor(code)}})};
  window.addEventListener('hashchange',()=>setTimeout(bind,300));
  setTimeout(bind,320);
})();

(function(){
  const templateMap={"1":'ch1',"3":'ch2'};
  const findById=id=>{const list=Array.isArray(window.__syllabusChapters)?window.__syllabusChapters:[];const chapterIndex=list.findIndex(ch=>ch&&ch.id===id);return chapterIndex<0?null:{chapterIndex,childIndex:null}};
  window.openOfficialChapterEditor=code=>{const id=templateMap[String(code)],target=id&&findById(id);if(!target){const message=String(code)==='2'?'学校模板第二章“古典数理逻辑”尚未纳入当前 v3 草稿，已保留为模板预览。':String(code)==='4'?'学校模板第四章“群、环和域”尚未纳入当前 v3 草稿，已保留为模板预览。':'该模板章节尚未映射到当前 v3 草稿。';if(window.showSyllabusToast)window.showSyllabusToast(message);else alert(message);return}window.openChapterEditor(target.chapterIndex,target.childIndex);setTimeout(()=>{const summary=document.getElementById('chapterHoursSummary');if(summary)summary.innerHTML=[['当前草稿','32'],['模板总学时','48'],['理论教学','48'],['实验 / 上机','0'],['大作业','0']].map(x=>'<div class="hours-kpi"><span>'+x[0]+'</span><strong>'+x[1]+'<small style="display:inline;font:11px system-ui"> 学时</small></strong></div>').join('')},0)};
})();
