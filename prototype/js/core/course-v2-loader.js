/* Ordered loader for the static prototype. Keep this list stable. */
(function () {
  const files = [
    'js/modules/05-syllabus-workspace.js',
    'js/modules/00-course-base.js', 'js/modules/01-syllabus-cleanup.js', 'js/modules/02-calendar-domain.js',
    'js/modules/03-calendar-traceability.js', 'js/modules/04-calendar-fidelity.js',
    'js/modules/06-calendar-semantic.js', 'js/modules/07-calendar-template.js', 'js/modules/08-calendar-config.js',
    'js/modules/09-calendar-affordance.js', 'js/modules/10-syllabus-word-replica.js', 'js/modules/11-syllabus-summary.js',
    'js/modules/12-syllabus-fields.js', 'js/modules/13-syllabus-fields-extra.js', 'js/modules/14-dialog-shell.js',
    'js/modules/15-calendar-route.js', 'js/modules/16-course-basics.js', 'js/modules/17-calendar-edit-guard.js',
    'js/modules/18-calendar-final-config.js', 'js/modules/19-teaching-calendar.js', 'js/modules/20-courseware-prototype.js', 'js/modules/21-courseware-tools.js', 'js/modules/22-system-settings-calendar.js', 'js/modules/23-assignment-prototype.js', 'js/modules/24-learning-analysis.js', 'js/modules/25-learning-analysis-refinement.js', 'js/modules/26-learning-analysis-adjustments.js', 'js/modules/27-preparation-workspace.js', 'js/modules/28-syllabus-ai-chat.js', 'js/modules/30-syllabus-chapter-md.js'
  ];
  const version='20260908-18';
  files.forEach((file) => document.write(`<script src="${file}?v=${version}"><\/script>`));
})();
