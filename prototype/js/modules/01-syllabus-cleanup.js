/* Extracted from course-v2.js. Load order is intentional. */
/* Syllabus UI cleanup: keep the official content, remove template extraction/mapping chrome. */
(function(){
  const style=document.createElement('style');
  style.id='syllabus-content-cleanup-style';
  style.textContent='.syllabus-progress small,.outline-progress small,.syllabus-step small,.progress-step small{display:none!important}.outline-trace-block{display:none!important}.official-info-intro{margin-top:10px;padding-top:10px;border-top:1px solid #e7f0ef}.official-info-intro>span{display:block;color:var(--muted);font-size:10px}.official-info-intro>p{margin:3px 0 0;color:var(--ink);font-size:11px;line-height:1.6}.word-info-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}@media(max-width:900px){.word-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:620px){.word-info-grid{grid-template-columns:1fr!important}}';
  document.head.appendChild(style);
  const layoutStyle=document.createElement('style');
  layoutStyle.id='syllabus-basic-info-layout-style';
  layoutStyle.textContent='.basic-info-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.basic-intro-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px;margin-top:14px;padding-top:14px;border-top:1px solid #e7f0ef}.basic-intro-grid .outline-field-wide{grid-column:1 / -1}@media(max-width:900px){.basic-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.basic-intro-grid{grid-template-columns:1fr}}@media(max-width:620px){.basic-info-grid{grid-template-columns:1fr!important}.basic-intro-grid{grid-template-columns:1fr}}';
  document.head.appendChild(layoutStyle);
  const cleanSyllabusPage=()=>{
    if(location.hash!=='#course/syllabus')return;
    document.getElementById('outlineTraceBlock')?.remove();
    document.querySelectorAll('.syllabus-template-summary,.syllabus-template-details,.syllabus-template-summary-source,.word-review-note,.word-diff,.word-trace-grid,.word-chapter-actions,.word-source-line').forEach(node=>node.remove());
    const note=document.querySelector('.syllabus-editor .overview-note');
    if(note&&note.textContent!=='章节支持层级化编辑与上下移动；点击任意章节进入编辑，可查看能力矩阵、课时总览、教材位置和思政信息。')note.textContent='章节支持层级化编辑与上下移动；点击任意章节进入编辑，可查看能力矩阵、课时总览、教材位置和思政信息。';
    const outline=document.querySelector('.official-outline');
    if(outline){
      const head=outline.querySelector('.official-outline-head');
      if(head){
        head.querySelector('.eyebrow')?.remove();
        head.querySelector('.tag')?.remove();
        const title=head.querySelector('h2');
        const desc=head.querySelector('p');
        if(title)title.textContent='教学大纲结构';
        if(desc)desc.textContent='课程基本信息、章节内容、课程目标与考核安排';
      }
      const wordHead=outline.querySelector('.word-outline-head');
      if(wordHead){
        wordHead.querySelector('.eyebrow')?.remove();
        wordHead.querySelector('h2 .tag')?.remove();
        const title=wordHead.querySelector('h2');
        const desc=wordHead.querySelector('p');
        if(title)title.textContent='《离散数学》课程教学大纲';
        if(desc)desc.textContent='课程基本信息、章节内容、课程目标与考核安排';
      }
      const sections=[...outline.querySelectorAll('.official-section')];
      const objectiveEditorSection=sections.find(section=>(section.querySelector('summary')?.textContent||'').includes('课程目标编辑'));
      if(objectiveEditorSection){const sub=objectiveEditorSection.querySelector('summary small');if(sub)sub.remove();}
      const info=sections.find(section=>(section.querySelector('summary')?.textContent||'').includes('课程基本信息'));
      const intro=sections.find(section=>(section.querySelector('summary')?.textContent||'').includes('课程简介'));
      if(info&&intro){
        const introBody=intro.querySelector('.official-section-body');
        const infoBody=info.querySelector('.official-section-body');
        if(introBody&&infoBody&&!infoBody.querySelector('.official-info-intro')){
          const block=document.createElement('div');
          block.className='official-info-intro';
          block.innerHTML='<span>课程简介</span>'+introBody.innerHTML;
          infoBody.appendChild(block);
        }
        intro.remove();
      }
      outline.querySelectorAll('.official-section>.official-section-number').forEach((node,index)=>{node.textContent=String(index+1).padStart(2,'0');});
      outline.querySelectorAll('.official-section>summary small,.official-chapter>summary small').forEach(node=>node.remove());
      outline.querySelectorAll('.official-footnote').forEach(node=>{node.textContent=node.textContent.replace('模板合计','课时合计');});
      outline.querySelectorAll('.word-assessment-table th').forEach(node=>{node.textContent=node.textContent.replace('（模板原文）','');});
    }
    const editor=document.getElementById('chapterEditorBg');
      if(editor){
        editor.querySelector('.chapter-editor-head .eyebrow')?.replaceChildren(document.createTextNode('章节编辑'));
        editor.querySelector('.template-banner')?.remove();
        editor.querySelectorAll('.chapter-editor-card h3').forEach(node=>{
          if(node.firstChild&&node.firstChild.nodeType===3&&node.textContent.includes('教材来源与位置'))node.firstChild.textContent='教材引用信息';
          node.querySelectorAll('small').forEach(small=>{
            if(small.textContent.includes('映射'))small.textContent='结构化关联';
            if(small.textContent.includes('模板'))small.textContent=small.textContent.includes('课时')?'理论 / 实验 / 大作业':'可继续编辑';
          });
        });
        editor.querySelectorAll('#chapterSourceList .source-row').forEach(row=>{
          const label=row.querySelector('dt')?.textContent||'';
          if(label.includes('模板')||label.includes('来源文件'))row.remove();
        });
        const relation=editor.querySelector('.chapter-editor-card h3 small');
      if(relation&&relation.textContent.includes('映射'))relation.textContent='结构化关联';
      editor.querySelectorAll('.chapter-editor-card h3 small').forEach(node=>{
        if(node.textContent.includes('映射'))node.textContent='结构化关联';
        if(node.textContent.includes('模板'))node.textContent=node.textContent.includes('课时')?'理论 / 实验 / 大作业':'可继续编辑';
      });
      const heading=editor.querySelector('#chapterTemplateHeading');
      const detail=editor.querySelector('#chapterTemplateNote');
      if(heading)heading.textContent='教材引用信息';
      if(detail)detail.textContent='展示章节、页码和知识点来源。';
      const diff=editor.querySelector('#chapterHoursDiff');
      if(diff){
        const match=diff.textContent.match(/章节合计\s+([^，]+)\s*学时/);
        diff.textContent=match?'当前课程版本章节合计 '+match[1]+' 学时；请在教学日历确认总学时。':'请在教学日历确认课程总学时。';
      }
      editor.querySelectorAll('#chapterHoursSummary .hours-kpi span').forEach(node=>{if(node.textContent.includes('模板'))node.textContent='课程总学时';});
    }
  };
  /* DOM cleanup is triggered after route renders; a body-wide observer here causes
     self-triggering mutations (section labels are normalized on every pass). */
  const observe=()=>{};
  window.addEventListener('hashchange',()=>setTimeout(cleanSyllabusPage,0));
  setTimeout(cleanSyllabusPage,0);
  observe();
})();
