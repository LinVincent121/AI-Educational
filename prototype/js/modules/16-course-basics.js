/* Extracted from course-v2.js. Load order is intentional. */
/* Course basics editor: keep the global course list editable without adding a backend. */
(function(){
  const STORAGE='ai-jiaowu-course-basics-v1';
  const termLabels={spring:'春季',summer:'夏季',autumn:'秋季',winter:'冬季'};
  const defaults={
    discrete:{id:'discrete',name:'离散数学',code:'MATH203',year:'2026',term:'autumn',credits:'3',hours:'48',audience:'智能科学与技术 25 级',leader:'林老师',teachers:'张寒',nature:'专业必修',textbook:'《离散数学》（第 2 版）'},
    structure:{id:'structure',name:'数据结构',code:'CS201',year:'2026',term:'autumn',credits:'3',hours:'32',audience:'计算机类 25 级',leader:'王老师',teachers:'王老师',nature:'专业必修',textbook:'主教材尚未确认'},
    algorithm:{id:'algorithm',name:'算法设计',code:'CS305',year:'2026',term:'autumn',credits:'3',hours:'32',audience:'计算机类 24 级',leader:'王老师',teachers:'王老师',nature:'专业必修',textbook:'主教材尚未确认'},
    database:{id:'database',name:'数据库原理',code:'CS202',year:'2025',term:'autumn',credits:'3',hours:'48',audience:'计算机类 24 级',leader:'林老师',teachers:'林老师',nature:'专业必修',textbook:'主教材已归档'},
    economics:{id:'economics',name:'经济学原理',code:'ECON101',year:'2026',term:'autumn',credits:'3',hours:'48',audience:'经济学与管理类 25 级',leader:'林老师',teachers:'林老师',nature:'专业必修',textbook:'《经济学原理》（第 8 版）'}
  };
  const nameToId={'离散数学':'discrete','数据结构':'structure','算法设计':'algorithm','数据库原理':'database','经济学原理':'economics'};
  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const readStore=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')||{}}catch{return {}}};
  const getCourse=id=>Object.assign({},defaults[id]||{id},readStore()[id]||{});
  const saveCourse=(id,next)=>{const store=readStore();store[id]=Object.assign({},getCourse(id),next,{id,updatedAt:new Date().toISOString()});try{localStorage.setItem(STORAGE,JSON.stringify(store))}catch{}return store[id]};
  const isArchived=id=>id==='database';
  const notify=message=>{if(window.showSyllabusToast)window.showSyllabusToast(message);else alert(message)};

  const syncCard=(card,data)=>{
    card.dataset.courseId=data.id;
    card.dataset.name=data.name;
    card.dataset.year=data.year;
    card.dataset.term=data.term;
    card.dataset.status=isArchived(data.id)?'archived':(card.dataset.status||'active');
    const code=card.querySelector('.tile-top .muted');if(code)code.textContent=data.code;
    const title=card.querySelector('h2');if(title)title.textContent=data.name;
    const desc=card.querySelector('p');if(desc)desc.textContent=data.year+' '+(termLabels[data.term]||data.term)+'　·　课程负责人：'+data.leader+'　·　任课教师：'+data.teachers;
    const meta=card.querySelectorAll('.tile-meta span');
    if(meta[0])meta[0].textContent='学分 '+data.credits+' · '+data.hours+' 学时';
    const edit=card.querySelector('.course-edit-button');
    if(edit)edit.setAttribute('aria-label','编辑 '+data.name+' 基础信息');
  };

  const bindCard=card=>{
    const originalName=(card.querySelector('h2')||{}).textContent||'';
    const id=card.dataset.courseId||nameToId[originalName.trim()];
    if(!id)return;
    const data=getCourse(id);syncCard(card,data);
    if(card.dataset.courseEditorBound)return;
    const entry=card.querySelector('button.btn');
    if(entry){
      const actions=document.createElement('div');actions.className='course-card-actions';
      entry.replaceWith(actions);actions.appendChild(entry);
      const edit=document.createElement('button');edit.type='button';edit.className='btn secondary course-edit-button';edit.textContent='编辑';edit.setAttribute('aria-label','编辑 '+data.name+' 基础信息');
      if(isArchived(id)){edit.disabled=true;edit.title='课程已归档，仅支持查看、对比和导出'}
      edit.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(!isArchived(id))window.openCourseEditor(id)});
      actions.appendChild(edit);
    }
    card.addEventListener('click',event=>{if(event.target.closest('.course-edit-button'))return;try{localStorage.setItem('ai-jiaowu-current-course',id)}catch{}},true);
    card.dataset.courseEditorBound='1';
  };
  const decorate=()=>{
    if(location.hash!=='#courses')return;
    const cards=[...document.querySelectorAll('#courseCards .course-tile')];
    cards.filter(card=>(card.dataset.courseId||nameToId[(card.querySelector('h2')||{}).textContent.trim()])!=='discrete').forEach(card=>card.remove());
    const discrete=document.querySelector('#courseCards .course-tile');
    if(discrete&&!document.querySelector('#courseCards .course-tile[data-course-id="economics"]')){
      const economics=discrete.cloneNode(true); economics.dataset.courseId='economics'; economics.dataset.name='经济学原理'; economics.dataset.courseEditorBound='';
      const title=economics.querySelector('h2'); if(title)title.textContent='经济学原理';
      const code=economics.querySelector('.tile-top .muted'); if(code)code.textContent='ECON101';
      const button=economics.querySelector('button'); if(button)button.textContent='进入课程 →';
      document.getElementById('courseCards').appendChild(economics);
    }
    document.querySelectorAll('#courseCards .course-tile').forEach(bindCard);
    const count=document.getElementById('courseCount');if(count)count.textContent=document.querySelectorAll('#courseCards .course-tile').length;
    if(window.filterCourses)window.filterCourses();
  };

  const field=(label,name,value,attrs='')=>'<label>'+label+'<input name="'+name+'" value="'+esc(value)+'" '+attrs+'></label>';
  const selectField=(label,name,value,options)=>'<label>'+label+'<select name="'+name+'">'+options.map(item=>'<option value="'+esc(item[0])+'" '+(item[0]===value?'selected':'')+'>'+esc(item[1])+'</option>').join('')+'</select></label>';
  const formMarkup=data=>'<form id="courseEditForm" class="course-edit-form" data-course-id="'+esc(data.id)+'"><div class="course-edit-note"><span class="tag ok">Mock 数据 · 本地保存</span><span>修改后将同步到课程卡片，刷新页面仍会保留。</span></div><div class="form-two">'+field('课程名称','name',data.name,'required')+field('课程编号','code',data.code,'required')+'</div><div class="form-two">'+field('学年','year',data.year,'required type="number" min="2000" max="2100"')+selectField('学期','term',data.term,Object.entries(termLabels))+'</div><div class="form-two">'+field('学分','credits',data.credits,'required type="number" min="0.5" max="20" step="0.5"')+field('总学时','hours',data.hours,'required type="number" min="1" max="1000"')+'</div>'+field('授课对象','audience',data.audience,'required')+'<div class="form-two">'+selectField('课程负责人','leader',data.leader,[['林老师','林老师（当前用户）'],['王老师','王老师'],['陈老师','陈老师']])+field('任课教师','teachers',data.teachers,'required placeholder="如：张寒、王老师"')+'</div>'+selectField('课程性质','nature',data.nature,[['必修','必修'],['选修','选修'],['公共必修','公共必修'],['专业必修','专业必修'],['专业选修','专业选修'],['其他','其他']])+field('主教材','textbook',data.textbook,'placeholder="填写教材名称或版本"')+'<div class="course-edit-actions"><button type="button" class="btn secondary" id="courseEditCancel">取消</button><button type="submit" class="btn primary">保存修改</button></div></form>';

  const style=document.createElement('style');style.id='course-basics-editor-style';style.textContent=`
    .course-card-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px}.course-card-actions .course-edit-button{margin-left:auto}.course-card-actions .btn{padding:8px 11px}.course-card-actions .course-edit-button:disabled{opacity:.55;cursor:not-allowed}
    .modal.course-edit-open{display:flex;flex-direction:column;left:50%;right:auto;top:50%;width:min(620px,calc(100vw - 32px));height:auto;max-height:calc(100vh - 32px);padding:0;border-radius:18px;transform:translate(-50%,-50%) scale(.94);opacity:0;visibility:hidden;overflow:hidden;background:#fff;box-shadow:0 24px 80px rgba(24,54,79,.22);transition:opacity .18s ease,transform .2s cubic-bezier(.22,.8,.25,1),visibility 0s linear .2s}.modal.course-edit-open.open{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1);transition-delay:0s}.modal.course-edit-open.closing{opacity:0;visibility:hidden;transform:translate(-50%,-50%) scale(.94);transition-delay:0s}.modal.course-edit-open .modal-header{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 72px 14px 26px;flex:0 0 auto;background:#fff;border-bottom:1px solid var(--line)}.modal.course-edit-open .modal-header .eyebrow{display:none}.modal.course-edit-open .modal-header h2{margin:0;font-size:20px;line-height:1.3}.modal.course-edit-open .modal-header #modalClose{position:absolute;top:17px;right:18px;margin:0}.modal.course-edit-open>.muted{display:none}.modal.course-edit-open>#stream{flex:1 1 auto;min-height:0;overflow:auto;scrollbar-width:none;-ms-overflow-style:none;margin:0;padding:16px 26px 22px;background:#f7fbfa}.modal.course-edit-open>#stream::-webkit-scrollbar{width:0;height:0}.course-edit-form{display:flex;flex-direction:column;gap:11px}.course-edit-form label{display:flex;flex-direction:column;gap:5px;color:var(--muted);font-size:12px}.course-edit-form input,.course-edit-form select{width:100%;border:1px solid var(--line);border-radius:8px;padding:9px 10px;color:var(--ink);background:#fff;font:14px system-ui,"Microsoft YaHei",sans-serif}.course-edit-form input:focus,.course-edit-form select:focus{outline:2px solid #bdebe3;outline-offset:1px;border-color:#7acdbf}.course-edit-note{display:flex;align-items:center;gap:9px;padding:10px 11px;border:1px solid #d8ece8;border-radius:9px;background:#effaf7;color:#39736e;font-size:11px}.course-edit-actions{position:sticky;bottom:-1px;display:flex;justify-content:flex-end;gap:8px;margin:4px 0 -22px;padding:13px 0 22px;background:linear-gradient(to bottom,rgba(247,251,250,0),#f7fbfa 18px);z-index:2}.course-edit-readonly{padding:10px 11px;border:1px solid #f0ddb0;border-radius:9px;background:#fff8e9;color:#896e36;font-size:11px}.modal-bg.course-edit-open{animation:course-edit-shade-in .18s ease-out both}.modal-bg.course-edit-open.closing{animation:course-edit-shade-out .18s ease-in both}@keyframes course-edit-shade-in{from{opacity:0}to{opacity:1}}@keyframes course-edit-shade-out{from{opacity:1}to{opacity:0}}@media(max-width:620px){.modal.course-edit-open{width:calc(100vw - 20px);max-height:calc(100vh - 20px);border-radius:15px}.modal.course-edit-open .modal-header{padding:18px 60px 12px 18px}.modal.course-edit-open .modal-header #modalClose{top:14px;right:14px}.modal.course-edit-open>#stream{padding-left:18px;padding-right:18px}.course-edit-actions{margin-right:0;margin-left:0}}
  `;document.head.appendChild(style);
  const editModalCleanupStyle=document.createElement('style');editModalCleanupStyle.id='course-edit-modal-cleanup-style';editModalCleanupStyle.textContent='.modal.course-edit-open>.modal-bottom{display:none!important}';document.head.appendChild(editModalCleanupStyle);

  let closeTimer=null;
  const modal=()=>document.getElementById('modal');
  const bg=()=>document.getElementById('modalBg');
  const finishClose=()=>{const m=modal(),shade=bg();if(!m||!shade)return;m.classList.remove('open','course-edit-open','closing');shade.classList.remove('open','course-edit-open','closing');document.body.classList.remove('modal-lock');document.documentElement.classList.remove('modal-lock');closeTimer=null};
  const closeEditor=()=>{const m=modal(),shade=bg();if(!m||!m.classList.contains('course-edit-open'))return;if(closeTimer)clearTimeout(closeTimer);m.classList.add('closing');shade.classList.add('closing');closeTimer=setTimeout(finishClose,190)};
  const previousClose=window.closeAI;
  window.closeAI=function(){if(modal()&&modal().classList.contains('course-edit-open'))return closeEditor();return previousClose.apply(this,arguments)};
  window.openCourseEditor=function(id){
    const data=getCourse(id),m=modal(),shade=bg(),title=document.getElementById('modalTitle'),stream=document.getElementById('stream');
    if(!m||!shade||!title||!stream)return;
    if(closeTimer){clearTimeout(closeTimer);closeTimer=null}
    m.classList.remove('open','create-open','closing','course-processing','course-edit-open');shade.classList.remove('open','create-open','closing','course-edit-open');
    title.textContent='编辑课程基础信息';stream.innerHTML=formMarkup(data);m.classList.add('open','course-edit-open');shade.classList.add('open','course-edit-open');document.body.classList.add('modal-lock');document.documentElement.classList.add('modal-lock');
    const form=document.getElementById('courseEditForm');
    if(isArchived(id)){const note=document.createElement('div');note.className='course-edit-readonly';note.textContent='课程已归档，基础信息为只读；如需修改请先创建新版本。';form.insertBefore(note,form.firstChild);form.querySelectorAll('input,select').forEach(input=>input.disabled=true);const save=form.querySelector('button[type="submit"]');if(save)save.disabled=true}
    form.addEventListener('submit',event=>{event.preventDefault();if(isArchived(id))return;const next={name:form.elements.name.value.trim(),code:form.elements.code.value.trim(),year:form.elements.year.value.trim(),term:form.elements.term.value,credits:form.elements.credits.value.trim(),hours:form.elements.hours.value.trim(),audience:form.elements.audience.value.trim(),leader:form.elements.leader.value,teachers:form.elements.teachers.value.trim(),nature:form.elements.nature.value,textbook:form.elements.textbook.value.trim()};if(!next.name||!next.code||!next.audience||!next.teachers){notify('请补齐课程名称、编号、授课对象和任课教师后再保存');return}saveCourse(id,next);closeEditor();setTimeout(()=>{decorate();notify('课程基础信息已保存');},210)});
    document.getElementById('courseEditCancel').onclick=closeEditor;
    setTimeout(()=>{const input=form.querySelector('input[name="name"]');if(input)input.focus()},30);
  };
  const previousBg= document.getElementById('modalBg')&&document.getElementById('modalBg').onclick;
  if(document.getElementById('modalBg'))document.getElementById('modalBg').onclick=function(event){if(modal()&&modal().classList.contains('course-edit-open'))return;return previousBg&&previousBg.call(this,event)};
  const syncCourseSwitcher=()=>{
    const ids=['discrete','economics'],wrap=document.getElementById('courseSwitch');
    if(!wrap)return;
    wrap.querySelectorAll('.course-option').forEach((button,index)=>{const data=getCourse(ids[index]);if(!data)return;const name=button.querySelector('b'),meta=button.querySelector('small');if(name)name.textContent=data.name;if(meta)meta.textContent=data.code+' · '+data.year+' '+(termLabels[data.term]||data.term);button.setAttribute('aria-label',data.name+' '+data.code)});
    const currentName=wrap.closest('.side-course-switch')&&wrap.closest('.side-course-switch').querySelector('.side-current-course strong');if(currentName){const id=(()=>{try{return localStorage.getItem('ai-jiaowu-current-course')||'discrete'}catch{return 'discrete'}})();currentName.textContent=getCourse(id).name}
  };
  window.addEventListener('hashchange',()=>setTimeout(decorate,0));
  window.addEventListener('hashchange',()=>setTimeout(syncCourseSwitcher,0));
  setTimeout(()=>{decorate();syncCourseSwitcher()},0);
})();
