/* Extracted from course-v2.js. Load order is intentional. */
/* calendar configuration override is registered after the base calendar module */
(function(){
  const api=window.__calendarTemplateEnhance;
  if(!api)return;
  const esc=api.esc;
  const currentId=()=>{try{return localStorage.getItem('ai-jiaowu-current-course')||'discrete'}catch{return 'discrete'}};
  const isArchived=()=>api.archived();
  const configKey=()=>api.configKey();
  const readConfig=()=>api.readConfig();
  const modalOpen=api.modalOpen;
  window.openCalendarConfig=function(){
    if(isArchived()){if(window.showSyllabusToast)window.showSyllabusToast('课程已归档：校历配置为只读，可查看和导出');return}
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
})();

