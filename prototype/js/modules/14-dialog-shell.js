/* Extracted from course-v2.js. Load order is intentional. */
/* The legacy Word preview is intentionally not loaded here. The syllabus workflow above
   keeps the school-template fields in the focused editor and avoids rendering duplicate
   non-interactive preview content below the active step. */

/* Keep every product dialog in the same centered shell as the syllabus editor. */
(function(){
  const style=document.createElement('style');
  style.id='modal-center-unified';
  style.textContent=`
    .modal{inset:auto;left:50%;top:50%;right:auto;bottom:auto;width:min(600px,calc(100vw - 32px));height:auto;max-height:min(760px,calc(100vh - 32px));display:flex;flex-direction:column;padding:0;overflow:hidden;border:1px solid #dceceb;border-radius:18px;box-shadow:0 28px 80px rgba(24,54,79,.24);opacity:0;visibility:hidden;transform:translate(-50%,-50%) scale(.94);transition:opacity .2s ease,transform .22s cubic-bezier(.22,.8,.25,1),visibility 0s linear .22s}
    .modal.open{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1);transition-delay:0s}
    .modal.closing{opacity:0;visibility:hidden;transform:translate(-50%,-50%) scale(.94);transition-delay:0s}
    .modal-bg{display:block;opacity:0;visibility:hidden;transition:opacity .18s ease,visibility 0s linear .18s}
    .modal-bg.open{opacity:1;visibility:visible;transition-delay:0s}
    .modal-bg.closing{opacity:0;visibility:hidden;transition-delay:0s}
    .modal .modal-header{position:relative;z-index:2;flex:0 0 auto;padding:22px 72px 14px 26px;background:#fff;border-bottom:1px solid #edf3f2}
    .modal .modal-header .eyebrow{margin:0 0 4px}
    .modal .modal-header h2{margin:0;font:700 22px/1.3 Georgia,"Microsoft YaHei",serif}
    .modal .modal-header #modalClose{position:absolute;top:17px;right:18px;z-index:4;margin:0}
    .modal > .muted{flex:0 0 auto;margin:0;padding:12px 26px 0;font-size:12px}
    .modal > .stream{flex:1 1 auto;min-height:120px;max-height:470px;margin:0;padding:14px 26px 24px;overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:0;scrollbar-width:thin}
    .modal > .stream::-webkit-scrollbar{width:7px}
    .modal > .stream::-webkit-scrollbar-thumb{background:#cfe6e2;border-radius:8px}
    .modal > .modal-bottom{position:static;z-index:2;flex:0 0 auto;justify-content:flex-end;margin:0;padding:14px 26px 18px;border-top:1px solid #edf3f2;background:rgba(255,255,255,.98);box-shadow:0 -8px 20px rgba(24,54,79,.06)}
    .modal.create-open,.modal.create-open.open,.modal.create-open.closing{left:50%;top:50%;right:auto;width:min(680px,calc(100vw - 32px));height:auto;max-height:calc(100vh - 32px);padding:0;border-radius:18px;overflow:hidden;animation:none!important}
    .modal.create-open{opacity:0;visibility:hidden;transform:translate(-50%,-50%) scale(.94);transition:opacity .2s ease,transform .22s cubic-bezier(.22,.8,.25,1),visibility 0s linear .22s}
    .modal.create-open.open{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1);transition-delay:0s}
    .modal.create-open.closing{opacity:0;visibility:hidden;transform:translate(-50%,-50%) scale(.94);transition-delay:0s}
    .modal.create-open .modal-header{padding:22px 72px 14px 26px;flex:0 0 auto}
    .modal.create-open .modal-header #modalClose{position:absolute;top:17px;right:18px;margin:0}
    .modal.create-open > .muted{display:none}
    .modal.create-open > #stream{max-height:none;min-height:0;padding:0 26px 24px}
    .modal.create-open .form-actions{position:sticky;bottom:0;z-index:3;margin:18px -26px -24px;padding:14px 26px 18px;background:rgba(255,255,255,.98);border-top:1px solid var(--line);box-shadow:0 -10px 22px rgba(24,54,79,.08)}
    .modal.create-open > .create-footer{position:static;flex:0 0 auto;margin:0;padding:14px 26px 18px;background:rgba(255,255,255,.98);border-top:1px solid var(--line);box-shadow:0 -10px 22px rgba(24,54,79,.08)}
    .modal.course-processing > .create-footer{display:none!important}
    @media(max-width:620px){.modal,.modal.create-open{width:calc(100vw - 20px);max-height:calc(100vh - 20px);border-radius:15px}.modal .modal-header,.modal.create-open .modal-header{padding:18px 60px 12px 18px}.modal .modal-header h2{font-size:20px}.modal .modal-header #modalClose,.modal.create-open .modal-header #modalClose{top:14px;right:14px}.modal > .muted{padding-left:18px;padding-right:18px}.modal > .stream,.modal.create-open > #stream{padding-left:18px;padding-right:18px}.modal > .modal-bottom{padding:12px 18px 14px}.modal.create-open .form-actions{margin-left:-18px;margin-right:-18px;padding-left:18px;padding-right:18px}.modal.create-open > .create-footer{padding-left:18px;padding-right:18px}}
    @media(prefers-reduced-motion:reduce){.modal,.modal.open,.modal.closing,.modal.create-open,.modal.create-open.open,.modal.create-open.closing,.modal-bg,.modal-bg.open,.modal-bg.closing{transition:none!important;animation:none!important}.modal.open,.modal.create-open.open{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1)}}
  `;
  document.head.appendChild(style);
})();
