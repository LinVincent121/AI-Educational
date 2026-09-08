/* Extracted from course-v2.js. Load order is intentional. */
/* Re-attach the fidelity route after all legacy calendar/syllabus decorators
 * have loaded. The earlier pass exports its closures so this final hook is
 * deliberately tiny and deterministic. */
(function(){
  const fidelity=window.__calendarFidelity;
  if(!fidelity)return;
  const previous=window.coursePage;
  window.coursePage=function(k){return k==='calendar'?((window.shell||((content)=>content))(fidelity.renderPage(),'calendar')):previous(k)};
  coursePage=window.coursePage;
  window.openCalendarEdit=fidelity.openCalendarEdit;
  window.openCalendarConfig=fidelity.openCalendarConfig;
  window.toggleCalendarSource=fidelity.toggleCalendarSource;
  if(window.render&&location.hash.indexOf('#course/calendar')===0)setTimeout(()=>window.render(),0);
})();

