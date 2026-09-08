/* Extracted from course-v2.js. Load order is intentional. */
/* School-template traceability and guardrails for the static calendar demo. */
(function(){
  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const currentId=()=>{try{return localStorage.getItem('ai-jiaowu-current-course')||'discrete'}catch{return 'discrete'}};
  const isCalendar=()=>location.hash.indexOf('#course/calendar')===0;
  const configFor=()=>{let saved=null;try{saved=JSON.parse(localStorage.getItem('ai-jiaowu-calendar-config-demo-v2-'+currentId())||'null')}catch{};return Object.assign({school:currentId()==='discrete'?'����ӡˢѧԺ �� 2025��2026 ѧ��� 2 ѧ��':'��δ����ѧУУ��',weeks:currentId()==='discrete'?'16':'',weekly:currentId()==='discrete'?'3':'',termStartDate:currentId()==='discrete'?'2026-03-02':'',termEndDate:currentId()==='discrete'?'2026-06-19':'',classWeekdays:currentId()==='discrete'?'��һ':'',holiday:currentId()==='discrete'?'��':'������',adjust:currentId()==='discrete'?'��':'������'},saved||{})};
  const formatDate=value=>{if(!value)return '���ڴ�����';const d=value instanceof Date?value:new Date(value+'T00:00:00');if(Number.isNaN(d.getTime()))return '���ڴ�����';return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0')};
  const dateRange=(index,c)=>{if(!c.termStartDate)return '���ڴ�����';const start=new Date(c.termStartDate+'T00:00:00');if(Number.isNaN(start.getTime()))return '���ڴ�����';start.setDate(start.getDate()+index*7);const end=new Date(start);end.setDate(end.getDate()+6);if(c.termEndDate){const termEnd=new Date(c.termEndDate+'T00:00:00');if(!Number.isNaN(termEnd.getTime())&&end>termEnd)end.setTime(termEnd.getTime())}return formatDate(start)+'��'+formatDate(end);};
  const syncTemplateSource=()=>{
    if(!isCalendar())return;
    const card=document.querySelector('.calendar-source-card');
    if(!card)return;
    const id=currentId(),isDiscrete=id==='discrete';
    const lead=card.querySelector('.calendar-source-lead p');
    if(lead&&!lead.querySelector('.calendar-source-file'))lead.insertAdjacentHTML('beforeend','<small class="calendar-source-file">��Դ�ļ���'+(isDiscrete?'2025-2026-2+AI120030+��ɢ��ѧ+�ź�-02��ѧ����.doc':'��δ����ѧУ��ѧ����ģ��')+'</small>');
    const detail=card.querySelector('#calendarSourceDetail');
    if(detail&&!detail.querySelector('.calendar-mapping-table'))detail.insertAdjacentHTML('beforeend','<div class="calendar-mapping-wrap"><b>�ֶ�ӳ��</b><table class="calendar-mapping-table"><thead><tr><th>ѧУģ��ԭ�ֶ�</th><th>ƽ̨�ṹ���ֶ�</th><th>��;</th></tr></thead><tbody><tr><td>�ܴ� / ѧʱ</td><td>WeekPlan.week_no �� planned_hours</td><td>��������������ѧʱ</td></tr><tr><td>��������</td><td>TeachingItem.teaching_content</td><td>�����½ڡ�֪ʶ�������Ŀ��</td></tr><tr><td>ʵ���ʵ������</td><td>TeachingItem.item_type �� practice_content</td><td>����ʵ�顢ʵ���Ϳ�����ϰ</td></tr><tr><td>������ҵ</td><td>HomeworkPlan.title �� due_date</td><td>ֻ��¼���ţ����ڴ�������Ŀ</td></tr><tr><td>�ڿν�ʦ / ǩ����</td><td>teacher �� review_task</td><td>��������������˹켣</td></tr></tbody></table></div>');
    const meta=card.querySelector('.calendar-meta-grid');
    if(meta&&!meta.querySelector('.calendar-template-id'))meta.insertAdjacentHTML('beforeend','<div class="calendar-template-id"><span>��Դ��¼</span><b>'+esc(isDiscrete?'CAL-TPL-AI120030-20260228':'������')+'</b></div>');
  };
  const syncConfigAndDates=()=>{
    if(!isCalendar())return;
    const c=configFor();
    const grid=document.querySelector('.calendar-config-grid');
    if(grid){grid.querySelectorAll('div').forEach(cell=>{const label=cell.querySelector('span'),value=cell.querySelector('b');if(!label||!value)return;const text=label.textContent.trim();if(text==='У����Դ')value.textContent=c.school+(String(c.school).includes('��δ')?'':' �� ѧУУ��');if(text==='ѧ������')value.textContent=(c.termStartDate||'������')+' �� '+(c.termEndDate||'������');if(text==='��ѧ�� / ��ѧʱ')value.textContent=(c.weeks||'������')+' �� �� '+(c.weekly||'������')+' ѧʱ';if(text==='�ڿ�����')value.textContent=c.classWeekdays||'������';if(text==='�ڼ��� / ͣ��')value.textContent=c.holiday||'��';if(text==='���� / ����')value.textContent=c.adjust||'��'})}
    document.querySelectorAll('.calendar-table tbody tr').forEach((row,index)=>{const date=row.querySelector('.week-date');if(date)date.textContent=dateRange(index,c)});
    const note=document.querySelector('.calendar-table-note span');if(note)note.textContent='�� '+document.querySelectorAll('.calendar-table tbody tr').length+' �� �� ÿ�� '+(c.weekly||'������')+' ѧʱ';
  };
  const decorate=()=>{if(!isCalendar())return;syncTemplateSource();syncConfigAndDates()};
  const style=document.createElement('style');style.id='calendar-template-trace-style';style.textContent=`
    .calendar-source-file{display:block;margin-top:5px;color:#63818a;font-size:10px;line-height:1.45}.calendar-template-id{grid-column:span 2}.calendar-mapping-wrap{grid-column:1 / -1;margin-top:2px;padding:10px;border:1px dashed #cfe6e2;border-radius:8px;background:#fbfefd}.calendar-mapping-wrap>b{display:block;margin-bottom:7px;font-size:11px}.calendar-mapping-table{width:100%;border-collapse:collapse;font-size:10px}.calendar-mapping-table th,.calendar-mapping-table td{padding:7px 6px;border-bottom:1px solid #e8f0ef;text-align:left;vertical-align:top}.calendar-mapping-table th{color:#64808a;font-weight:600;background:#f6fbfa}.calendar-mapping-table tr:last-child td{border-bottom:0}.calendar-mapping-table td:nth-child(2){color:#167c73;font-family:ui-monospace,monospace;font-size:9px}.calendar-config-grid .calendar-template-id b{color:#167c73;font-family:ui-monospace,monospace;font-size:10px}@media(max-width:620px){.calendar-template-id{grid-column:auto}.calendar-mapping-wrap{overflow:auto}.calendar-mapping-table{min-width:590px}}
  `;document.head.appendChild(style);
  window.addEventListener('hashchange',()=>setTimeout(decorate,0));
  if(window.MutationObserver&&!window.__calendarTraceObserver){let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;decorate()},0)});observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});window.__calendarTraceObserver=true}
  setTimeout(decorate,40);

  /* Add the PRD's blocking checks without replacing the existing centered dialog. */
  const originalOpen=window.openCalendarEdit;
  if(originalOpen&&!window.__calendarEditGuard){
    window.openCalendarEdit=function(index){
      originalOpen(index);
      const form=document.getElementById('calendarEditForm'),save=document.getElementById('calendarModalSave');
      if(!form||!save)return;
      const previous=save.onclick;
      save.onclick=function(event){
        let error=form.querySelector('.calendar-form-error');
        if(!error){error=document.createElement('p');error.className='calendar-form-error';form.appendChild(error)}
        const publish=form.elements.homeworkPublish&&form.elements.homeworkPublish.value;
        const due=form.elements.homeworkDue&&form.elements.homeworkDue.value;
        const hours=['lectureHours','experimentHours','practiceHours'].reduce((sum,name)=>sum+Number(form.elements[name]&&form.elements[name].value||0),0);
        const weekStatus=form.elements.weekStatus&&form.elements.weekStatus.value;
        const problems=[];
        if(publish&&due&&due<publish)problems.push('��ҵ��ֹ���ڲ������ڷ�������');
        if(hours<=0)problems.push('����������Ҫ���� 1 ѧʱ');
        if((weekStatus==='holiday'||weekStatus==='suspended')&&hours>0)problems.push('�ڼ��� / ͣ���ܲ���ֱ�Ӱ����ڿΣ����ȴ������λ���μ�¼');
        if(problems.length){error.textContent=problems.join('��')+'����ǰ�ܼƻ�δ���棬�����������ԡ�';error.hidden=false;return}
        error.hidden=true;
        try{const key='ai-jiaowu-calendar-audit-v1';const logs=JSON.parse(localStorage.getItem(key)||'[]');logs.push({id:'AUD-CAL-'+Date.now(),action:'calendar_week_edit',course_id:currentId(),week_no:index+1,created_at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(logs.slice(-100)))}catch{}
        if(typeof previous==='function')previous.call(this,event);
      };
    };
    window.__calendarEditGuard=true;
  }
})();

