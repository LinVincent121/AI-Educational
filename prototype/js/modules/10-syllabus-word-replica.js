/* Extracted from course-v2.js. Load order is intentional. */
/* small affordance styles for the editable Word-template chapters */
(function(){
  const style=document.createElement('style');
  style.id='word-syllabus-edit-affordance-style';
  style.textContent='.word-chapter-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:3px}.word-chapter-actions span{color:#7b929b;font-size:10px}.word-chapter-actions .btn{padding:7px 9px;font-size:11px;white-space:nowrap}#chapterEditor .hours-summary{grid-template-columns:repeat(auto-fit,minmax(104px,1fr))}';
  document.head.appendChild(style);
})();

