/* Extracted from course-v2.js. Load order is intentional. */
/* teaching calendar: template fidelity, centered dialogs and archive read-only pass */
(function(){
  const style=document.createElement('style');
  style.id='calendar-template-fidelity-style';
  style.textContent=`
    .modal.calendar-edit-open{right:auto;left:50%;top:50%;width:min(760px,calc(100vw - 32px));height:min(760px,calc(100vh - 32px));max-height:calc(100vh - 32px);padding:28px;border-radius:18px;transform:translate(-50%,-50%) scale(.94);opacity:0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(24,54,79,.22);transition:none}
    .modal.calendar-edit-open.open{animation:modal-center-in .22s cubic-bezier(.22,.8,.25,1) forwards}
    .modal.calendar-edit-open .modal-header{position:relative;z-index:11;flex:0 0 auto;padding-bottom:12px;background:#fff}
    .modal.calendar-edit-open .modal-header #modalClose{position:absolute;top:-18px;right:0;margin:0}
    .modal.calendar-edit-open .modal-header h2{margin:5px 0 0;padding-right:84px}
    .modal.calendar-edit-open #stream{flex:1 1 auto;min-height:0;overflow:auto;scrollbar-width:none;-ms-overflow-style:none;padding-right:2px}
    .modal.calendar-edit-open #stream::-webkit-scrollbar{width:0;height:0}
    .modal.calendar-edit-open .modal-bottom{position:sticky;right:auto;bottom:0;z-index:12;display:flex!important;justify-content:flex-end;margin:14px -28px -28px;padding:14px 28px 20px;background:rgba(255,255,255,.97);border-top:1px solid var(--line);box-shadow:0 -18px 30px rgba(255,255,255,.98),0 -10px 22px rgba(24,54,79,.11)}
    .calendar-config-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .calendar-config-form-grid .span-2{grid-column:1 / -1}
    .calendar-config-form fieldset{margin:0;padding:9px 10px;border:1px solid var(--line);border-radius:9px}
    .calendar-config-form legend{padding:0 4px;color:var(--muted);font-size:11px}
    .weekday-grid{display:flex;gap:7px;flex-wrap:wrap}
    .weekday-grid label,.calendar-toggle{display:inline-flex!important;flex-direction:row!important;align-items:center;gap:5px!important;color:var(--ink)!important;font-size:11px!important}
    .weekday-grid input,.calendar-toggle input{width:auto!important}
    .calendar-toggle-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
    .calendar-signatures{margin-top:14px}
    .calendar-signatures .head{align-items:flex-start}
    .calendar-signatures .head h2{margin-bottom:2px}
    .calendar-signatures .head p{margin:0;color:var(--muted);font-size:11px}
    .signature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}
    .signature-cell{padding:10px 11px;border:1px solid #e7f0ee;border-radius:9px;background:#fbfefd}
    .signature-cell span,.signature-cell b,.signature-cell small{display:block}
    .signature-cell span{color:var(--muted);font-size:10px}
    .signature-cell b{margin-top:4px;font-size:12px}
    .signature-cell small{margin-top:3px;color:#0b9c8c;font-size:10px}
    .calendar-archive-notice{display:flex;align-items:flex-start;gap:9px;margin:0 0 14px;padding:10px 12px;border:1px solid #d8e4ea;border-radius:9px;background:#f3f7f9;color:#58727d;font-size:11px;line-height:1.55}
    .calendar-archive-notice b{color:#456271;white-space:nowrap}
    .calendar-readonly,.calendar-readonly:hover{opacity:.52!important;cursor:not-allowed!important;transform:none!important}
    @media(max-width:620px){.modal.calendar-edit-open{width:calc(100vw - 20px);height:calc(100vh - 20px);max-height:calc(100vh - 20px);padding:22px}.modal.calendar-edit-open .modal-bottom{margin:14px -22px -22px;padding:12px 22px 16px}.calendar-config-form-grid,.calendar-toggle-grid{grid-template-columns:1fr}.calendar-config-form-grid .span-2{grid-column:auto}.signature-grid{grid-template-columns:1fr}.modal.calendar-edit-open .modal-header h2{padding-right:76px}}
  `;
  document.head.appendChild(style);

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const currentId=()=>{try{return localStorage.getItem('ai-jiaowu-current-course')||'discrete'}catch{return 'discrete'}};
  const archived=()=>currentId()==='database';
  const courseInfo={
    discrete:{name:'离散数学',hours:48,weekly:3,date:'2026 年 2 月 28 日',teacher:'张寒'},
    structure:{name:'数据结构',hours:32,weekly:'待配置',date:'待填写',teacher:'任课教师'},
    algorithm:{name:'算法设计',hours:32,weekly:'待配置',date:'待填写',teacher:'任课教师'},
    database:{name:'数据库原理',hours:48,weekly:'待配置',date:'2025 年 9 月',teacher:'任课教师'}
  };
  const info=()=>courseInfo[currentId()]||courseInfo.discrete;
  const defaultConfig=()=>({
    school:currentId()==='discrete'?'北京印刷学院 · 2025—2026 学年第 2 学期':'尚未配置学校校历',
    academicYear:currentId()==='discrete'?'2025—2026':'2026',termType:currentId()==='discrete'?'春季':'秋季',
    termStartDate:currentId()==='discrete'?'2026-03-02':'',termEndDate:currentId()==='discrete'?'2026-06-19':'',
    weeks:currentId()==='discrete'?'16':'',weekly:currentId()==='discrete'?'3':'',firstClassDate:currentId()==='discrete'?'2026-03-02':'',
    classWeekdays:currentId()==='discrete'?['周一']:[],holiday:currentId()==='discrete'?'无':'待配置',
    makeup:currentId()==='discrete'?'无':'待配置',adjust:currentId()==='discrete'?'无':'待配置',calendarSource:currentId()==='discrete'?'school_calendar':'manual',
    generationMode:'semi_automatic',includeReviewWeek:true,includeExamWeek:false,includeHomeworkPlan:true,teacherInstruction:''
  });
  const configKey=()=>`ai-jiaowu-calendar-config-demo-v1-${currentId()}`;
  const readConfig=()=>{let saved=null;try{saved=JSON.parse(localStorage.getItem(configKey())||'null')}catch{};return Object.assign(defaultConfig(),saved||{})};
  const modalOpen=(title,eyebrow,muted,body,saveText,saveHandler,cancelText='取消',hideCancel=false)=>{
    const modal=document.getElementById('modal'),bg=document.getElementById('modalBg'),stream=document.getElementById('stream'),bottom=document.querySelector('.modal-bottom');
    if(!modal||!bg||!stream||!bottom)return;
    modal.classList.remove('create-open','course-processing','closing');bg.classList.remove('create-open','closing');
    document.body.classList.add('modal-lock');document.documentElement.classList.add('modal-lock');
    document.getElementById('modalTitle').textContent=title;const mark=modal.querySelector('.modal-header .eyebrow');if(mark)mark.textContent=eyebrow;
    const mutedEl=modal.querySelector(':scope > .muted');if(mutedEl)mutedEl.textContent=muted||'';stream.innerHTML=body;
    bottom.style.display='flex';bottom.innerHTML='<button id="calendarModalCancel" class="btn secondary" type="button">'+esc(cancelText)+'</button><button id="calendarModalSave" class="btn primary" type="button">'+esc(saveText||'保存')+'</button>';
    modal.classList.add('open','calendar-edit-open');bg.classList.add('open');
    const cancel=document.getElementById('calendarModalCancel');if(cancel){cancel.onclick=()=>window.closeAI();cancel.style.display=hideCancel?'none':''}
    document.getElementById('calendarModalSave').onclick=saveHandler;
    setTimeout(()=>{const first=stream.querySelector('textarea,input,select,button');if(first)first.focus()},30);
  };

  /* Full school-calendar configuration: fields are based on TC-02 and the Word template's exception columns. */
  window.openCalendarConfig=function(){
    if(archived()){if(window.showSyllabusToast)window.showSyllabusToast('课程已归档：校历配置为只读，可查看和导出');return}
    const c=readConfig(),days=['周一','周二','周三','周四','周五','周六','周日'];
    const body='<form id="calendarConfigForm" class="calendar-edit-form calendar-config-form"><div class="calendar-config-form-grid">'+
      '<label>学校校历<input name="school" value="'+esc(c.school)+'"></label><label>校历来源<select name="calendarSource"><option value="school_calendar" '+(c.calendarSource==='school_calendar'?'selected':'')+'>学校校历</option><option value="manual" '+(c.calendarSource==='manual'?'selected':'')+'>手动配置</option></select></label>'+
      '<label>学年<input name="academicYear" value="'+esc(c.academicYear)+'"></label><label>学期<select name="termType"><option '+(c.termType==='春季'?'selected':'')+'>春季</option><option '+(c.termType==='夏季'?'selected':'')+'>夏季</option><option '+(c.termType==='秋季'?'selected':'')+'>秋季</option><option '+(c.termType==='冬季'?'selected':'')+'>冬季</option></select></label>'+
      '<label>学期开始日期<input name="termStartDate" type="date" value="'+esc(c.termStartDate)+'"></label><label>学期结束日期<input name="termEndDate" type="date" value="'+esc(c.termEndDate)+'"></label>'+
      '<label>首次授课日期<input name="firstClassDate" type="date" value="'+esc(c.firstClassDate)+'"></label><label>教学周数<input name="weeks" type="number" min="1" max="52" value="'+esc(c.weeks)+'"></label>'+
      '<label>默认周学时<input name="weekly" type="number" min="1" max="40" value="'+esc(c.weekly)+'"></label><label>生成方式<select name="generationMode"><option value="automatic" '+(c.generationMode==='automatic'?'selected':'')+'>规则自动分配</option><option value="semi_automatic" '+(c.generationMode==='semi_automatic'?'selected':'')+'>AI 建议后确认</option><option value="blank" '+(c.generationMode==='blank'?'selected':'')+'>空白日历</option></select></label>'+
      '<fieldset class="span-2"><legend>授课星期</legend><div class="weekday-grid">'+days.map(d=>'<label><input type="checkbox" name="classWeekdays" value="'+d+'" '+((c.classWeekdays||[]).includes(d)?'checked':'')+'>'+d+'</label>').join('')+'</div></fieldset>'+
      '<fieldset class="span-2"><legend>教学节点</legend><div class="calendar-toggle-grid"><label class="calendar-toggle"><input type="checkbox" name="includeReviewWeek" '+(c.includeReviewWeek?'checked':'')+'>包含复习周</label><label class="calendar-toggle"><input type="checkbox" name="includeExamWeek" '+(c.includeExamWeek?'checked':'')+'>包含考试周</label><label class="calendar-toggle"><input type="checkbox" name="includeHomeworkPlan" '+(c.includeHomeworkPlan?'checked':'')+'>包含作业计划</label></div></fieldset>'+
      '<label>节假日 / 停课<input name="holiday" value="'+esc(c.holiday)+'" placeholder="例：清明节 4/4 停课"></label><label>补课安排<input name="makeup" value="'+esc(c.makeup)+'" placeholder="例：4/6 补第 5 周周一"></label>'+
      '<label>调课记录<input name="adjust" value="'+esc(c.adjust)+'" placeholder="例：第 8 周改为线上授课"></label><label>教师特殊安排<input name="teacherInstruction" value="'+esc(c.teacherInstruction)+'" placeholder="最多 2000 字"></label>'+
      '</div><p class="calendar-edit-hint">字段对应学校教学日历的校历、教学周、周学时、节假日 / 停课、补课和调课信息；保存后只更新配置，不会自动改写已保存的周计划。</p></form>';
    modalOpen('配置校历与周次','教学日历 · 校历设置','学校模板规则 · Mock 数据',body,'保存配置',()=>{const form=document.getElementById('calendarConfigForm');if(!form)return;const next={school:form.elements.school.value.trim()||'尚未配置学校校历',calendarSource:form.elements.calendarSource.value,academicYear:form.elements.academicYear.value.trim(),termType:form.elements.termType.value,termStartDate:form.elements.termStartDate.value,termEndDate:form.elements.termEndDate.value,firstClassDate:form.elements.firstClassDate.value,weeks:form.elements.weeks.value.trim(),weekly:form.elements.weekly.value.trim(),generationMode:form.elements.generationMode.value,classWeekdays:[...form.querySelectorAll('input[name="classWeekdays"]:checked')].map(x=>x.value),includeReviewWeek:form.elements.includeReviewWeek.checked,includeExamWeek:form.elements.includeExamWeek.checked,includeHomeworkPlan:form.elements.includeHomeworkPlan.checked,holiday:form.elements.holiday.value.trim()||'无',makeup:form.elements.makeup.value.trim()||'无',adjust:form.elements.adjust.value.trim()||'无',teacherInstruction:form.elements.teacherInstruction.value.trim()};try{localStorage.setItem(configKey(),JSON.stringify(next))}catch{}window.closeAI();if(window.showSyllabusToast)window.showSyllabusToast('校历配置已保存，请重新检查教学日历');setTimeout(()=>window.render(),220)});
  };

  const decorateCalendar=()=>{
    if(!location.hash.includes('course/calendar'))return;
    const m=info(),isArchived=archived();
    const meta=document.querySelector('.calendar-meta-grid');
    if(meta&&!meta.dataset.templateFieldsBound){
      meta.dataset.templateFieldsBound='1';
      meta.insertAdjacentHTML('afterbegin','<div><span>课程名称</span><b>'+esc(m.name)+'</b></div><div><span>总学时 / 周学时</span><b>'+esc(m.hours)+' / '+esc(m.weekly)+'</b></div>');
    }
    const source=document.querySelector('.calendar-source-card');
    if(source&&!document.querySelector('.calendar-signatures')){
      source.insertAdjacentHTML('afterend','<section class="panel calendar-signatures"><div class="head"><div><h2>填表与审签</h2><p>对应学校教学日历 Word 模板的签字栏，原型用电子确认状态代替手写签名。</p></div><span class="tag gray">模板字段</span></div><div class="signature-grid"><div class="signature-cell"><span>任课教师签字</span><b>'+esc(m.teacher)+'</b><small>'+(!isArchived?'待线上确认':'历史签名')+'</small></div><div class="signature-cell"><span>教研室主任签字</span><b>'+(!isArchived?'待审核':'历史记录')+'</b><small>'+(!isArchived?'提交审核后填写':'只读')+'</small></div><div class="signature-cell"><span>填表日期</span><b>'+esc(m.date)+'</b><small>来源：学校模板</small></div></div></section>');
    }
    if(isArchived){
      const sourceCard=document.querySelector('.calendar-source-card');
      if(sourceCard&&!document.querySelector('.calendar-archive-notice'))sourceCard.insertAdjacentHTML('beforebegin','<div class="calendar-archive-notice"><b>已归档 · 只读</b><span>课程归档后保留历史日历的查看与导出能力，编辑、AI 建议、复制版本和提交审核均已停用。</span></div>');
      const status=document.getElementById('calendarStatus');if(status){status.textContent='已归档';status.className='tag gray'}
      document.querySelectorAll('.calendar-title-actions button,.calendar-config-card button,.calendar-plan-actions .btn:not(:nth-child(2)),.calendar-actions .btn,.calendar-table .table-action').forEach(btn=>{btn.disabled=true;btn.classList.add('calendar-readonly');btn.title='课程已归档，仅可查看和导出'});
      const version=document.querySelector('.version-card strong');if(version)version.textContent='v2 · 已归档';
      const versionTag=document.querySelector('.version-card>.tag');if(versionTag){versionTag.textContent='已归档';versionTag.className='tag gray'}
    }
  };
  window.__calendarTemplateEnhance={modalOpen,readConfig,configKey,archived,esc};
  /* Calendar decoration is now invoked explicitly after each route render.
   * Avoid observing the whole app: the observer used to retrigger route renders
   * while the calendar table was being inserted and could lock up the browser.
   */
  window.addEventListener('hashchange',()=>setTimeout(decorateCalendar,0));
  setTimeout(decorateCalendar,100);
})();

