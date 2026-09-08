/* Keep the materials route aligned with the shared shell without touching other routes. */
(function(){
  function alignMaterials(){
    if(location.hash.slice(1)!=='materials')return;
    const page=document.querySelector('.materials-page');
    if(!page)return;
    page.querySelector('.ml-page-head > div:not(.ml-head-actions)')?.remove();
    const search=page.querySelector('.ml-page-head .ml-head-actions .ml-search');
    const actions=page.querySelector('.ml-folder-actions');
    const sort=actions?.querySelector('.ml-ghost-btn');
    if(search&&actions&&search.parentElement!==actions)actions.insertBefore(search,sort||null);
    page.querySelector('.ml-page-head .ml-upload-head')?.remove();
    const headActions=page.querySelector('.ml-page-head .ml-head-actions');
    if(headActions&&!headActions.children.length)headActions.remove();
    const pageHead=page.querySelector('.ml-page-head');
    if(pageHead&&!pageHead.children.length)pageHead.remove();
    if(!page.querySelector('#materialFileInput')){
      const input=document.createElement('input');
      input.id='materialFileInput'; input.type='file'; input.multiple=true; input.hidden=true;
      input.addEventListener('change',()=>materialUpload(input.files));
      page.appendChild(input);
    }
  }
  window.addEventListener('hashchange',()=>setTimeout(alignMaterials,0));
  const app=document.getElementById('app');
  if(app)new MutationObserver(alignMaterials).observe(app,{childList:true,subtree:true});
  setTimeout(alignMaterials,0);
})();
