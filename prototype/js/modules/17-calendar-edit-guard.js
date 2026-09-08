/* Extracted from course-v2.js. Load order is intentional. */
/* Bind calendar edit validation after the final calendar route is attached. */
(function(){
  if(window.__calendarEditGuard||typeof window.openCalendarEdit!=='function')return;
  const currentId=()=>{try{return localStorage.getItem('ai-jiaowu-current-course')||'discrete'}catch{return 'discrete'}};
  const originalOpen=window.openCalendarEdit;
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
      if(publish&&due&&due<publish)problems.push('作业截止日期不能早于发布日期');
      if(hours<=0)problems.push('本周至少需要安排 1 学时');
      if((weekStatus==='holiday'||weekStatus==='suspended')&&hours>0)problems.push('节假日 / 停课周不能直接安排授课，请先创建补课或调课记录');
      if(problems.length){error.textContent=problems.join('；')+'。当前周计划未保存，请修正后重试。';error.hidden=false;return}
      error.hidden=true;
      try{const key='ai-jiaowu-calendar-audit-v1';const logs=JSON.parse(localStorage.getItem(key)||'[]');logs.push({id:'AUD-CAL-'+Date.now(),action:'calendar_week_edit',course_id:currentId(),week_no:index+1,created_at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(logs.slice(-100)))}catch{}
      if(typeof previous==='function')previous.call(this,event);
    };
  };
  window.__calendarEditGuard=true;
})();

