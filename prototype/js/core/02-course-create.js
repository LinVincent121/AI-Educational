/* Extracted from index.html and enhanced for course creation mode and multi-KB mounting. */
function filterCourses(){
  const q=(document.getElementById('courseKeyword').value||'').trim().toLowerCase(),
        y=document.getElementById('courseYear').value,
        t=document.getElementById('courseTerm').value,
        s=document.getElementById('courseStatus').value;
  let shown=0;
  document.querySelectorAll('#courseCards .course-tile').forEach(c=>{
    const ok=(!q||c.dataset.name.toLowerCase().includes(q)||c.textContent.toLowerCase().includes(q))&&
             (!y||c.dataset.year===y)&&
             (!t||c.dataset.term===t)&&
             (!s||c.dataset.status===s);
    c.style.display=ok?'':'none';
    if(ok)shown++;
  });
  document.querySelector('#courseEmpty').style.display=shown?'none':'block';
  const countEl=document.getElementById('courseCount');
  if(countEl)countEl.textContent=shown;
}

function resetCourses(){
  document.getElementById('courseKeyword').value='';
  document.getElementById('courseYear').value='';
  document.getElementById('courseTerm').value='';
  document.getElementById('courseStatus').value='';
  filterCourses();
}

window.__courseCreateDataMode = 'new';
window.__selectedKbFolders = [];
let __tempKbSelected = new Set();

const ALL_KB_FOLDERS = [
  {id:'discrete', scope:'personal', name:'离散数学', count:4, detail:'主教材及课堂资料 (包含大纲、日历与备课)'},
  {id:'teaching', scope:'personal', name:'教学设计', count:3, detail:'例题集与思政案例'},
  {id:'research', scope:'personal', name:'研究与灵感', count:2, detail:'教学研究参考'},
  {id:'shared-course', scope:'shared', name:'课程共享资料', count:6, detail:'罗文秋 · 课程组共享'},
  {id:'shared-school', scope:'shared', name:'学校模板', count:12, detail:'教务处 · 全校共享模板'}
];

function toggleCourseDataMode(mode){
  window.__courseCreateDataMode = mode;
  const cardNew = document.getElementById('modeCardNew');
  const cardReuse = document.getElementById('modeCardReuse');
  if(cardNew && cardReuse){
    cardNew.classList.toggle('active', mode==='new');
    cardReuse.classList.toggle('active', mode==='reuse');
    const radioNew = cardNew.querySelector('input[type="radio"]');
    const radioReuse = cardReuse.querySelector('input[type="radio"]');
    if(radioNew) radioNew.checked = (mode === 'new');
    if(radioReuse) radioReuse.checked = (mode === 'reuse');
  }
  const modeHint = document.getElementById('courseModeHint');
  if(modeHint){
    if(mode === 'new'){
      modeHint.innerHTML = '<b>✦ 新建模式指引：</b>系统将根据资料库和课程信息开始全新创建，自动开启全新的教学大纲、教学日历、备课与课件生成流程。';
      modeHint.className = 'form-hint mode-hint-new';
    }else{
      modeHint.innerHTML = '<b>↺ 复用模式指引：</b>系统将从知识库智能识别历史对应课程，自动将原有课程的大纲、日历、备课与课件等解析并回写到当前各课程模块中。';
      modeHint.className = 'form-hint mode-hint-reuse';
    }
  }
}

function openKbFolderPicker(){
  let overlay = document.getElementById('kbPickerOverlay');
  if(overlay) overlay.remove();

  __tempKbSelected = new Set((window.__selectedKbFolders || []).map(f => f.id));

  overlay = document.createElement('div');
  overlay.id = 'kbPickerOverlay';
  overlay.className = 'kb-picker-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '选择知识库文件夹');

  renderKbPickerContent(overlay);

  overlay.onclick = (e) => {
    if(e.target === overlay) closeKbFolderPicker();
  };

  document.body.appendChild(overlay);
}

function renderKbPickerContent(overlay){
  const personalList = ALL_KB_FOLDERS.filter(f => f.scope === 'personal');
  const sharedList = ALL_KB_FOLDERS.filter(f => f.scope === 'shared');

  overlay.innerHTML = `
    <div class="kb-picker-dialog">
      <div class="kb-picker-head">
        <div>
          <span class="eyebrow">KNOWLEDGE BASE MULTI-SELECTOR</span>
          <h3>选择挂载知识库文件夹（可多选）</h3>
        </div>
        <button type="button" class="kb-picker-close" onclick="closeKbFolderPicker()" aria-label="关闭">×</button>
      </div>
      <div class="kb-picker-body">
        <p class="muted" style="margin:0;font-size:12px">支持勾选多个知识库文件夹挂载至当前课程，系统将自动汇总其中的文件资料与历史课程数据。</p>
        <div class="kb-picker-group">
          <div class="kb-picker-group-title">个人知识库</div>
          ${personalList.map(f => {
            const isChecked = __tempKbSelected.has(f.id);
            return `
              <div class="kb-folder-item ${isChecked ? 'is-selected' : ''}" onclick="toggleKbFolderTemp('${f.id}')">
                <div class="kb-folder-checkbox">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} tabindex="-1">
                </div>
                <div class="kb-folder-left">
                  <span class="kb-folder-icon">📁</span>
                  <div>
                    <b>${f.name}</b>
                    <small>${f.detail}</small>
                  </div>
                </div>
                <span class="kb-folder-count">${f.count} 份资料</span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="kb-picker-group">
          <div class="kb-picker-group-title">共享知识库</div>
          ${sharedList.map(f => {
            const isChecked = __tempKbSelected.has(f.id);
            return `
              <div class="kb-folder-item ${isChecked ? 'is-selected' : ''}" onclick="toggleKbFolderTemp('${f.id}')">
                <div class="kb-folder-checkbox">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} tabindex="-1">
                </div>
                <div class="kb-folder-left">
                  <span class="kb-folder-icon">📂</span>
                  <div>
                    <b>${f.name}</b>
                    <small>${f.detail}</small>
                  </div>
                </div>
                <span class="kb-folder-count">${f.count} 份资料</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="kb-picker-foot">
        <button type="button" class="btn secondary" onclick="closeKbFolderPicker()">取消</button>
        <button type="button" id="confirmKbBtn" class="btn primary" onclick="confirmKbFolders()">确认挂载 (${__tempKbSelected.size} 个文件夹)</button>
      </div>
    </div>
  `;
}

function toggleKbFolderTemp(id){
  if(__tempKbSelected.has(id)){
    __tempKbSelected.delete(id);
  }else{
    __tempKbSelected.add(id);
  }
  const overlay = document.getElementById('kbPickerOverlay');
  if(overlay) renderKbPickerContent(overlay);
}

function confirmKbFolders(){
  window.__selectedKbFolders = ALL_KB_FOLDERS.filter(f => __tempKbSelected.has(f.id));
  renderMountedKbBox();
  closeKbFolderPicker();
}

function closeKbFolderPicker(){
  const overlay = document.getElementById('kbPickerOverlay');
  if(overlay) overlay.remove();
}

function removeKbFolder(id){
  window.__selectedKbFolders = (window.__selectedKbFolders || []).filter(f => f.id !== id);
  renderMountedKbBox();
}

function renderMountedKbBox(){
  const box = document.getElementById('kbMountBox');
  if(!box) return;

  const list = window.__selectedKbFolders || [];
  if(list.length === 0){
    box.classList.remove('is-mounted');
    box.innerHTML = `
      <div class="kb-mount-info">
        <span class="kb-mount-icon">▤</span>
        <div class="kb-mount-text">
          <b>未挂载知识库文件夹</b>
          <small>未选择文件夹，可点击右侧按钮打开资料库选择（可多选挂载）</small>
        </div>
      </div>
      <button type="button" id="kbMountBtn" class="btn secondary" onclick="openKbFolderPicker()">＋ 选择挂载知识库 ⌄</button>
    `;
  } else {
    box.classList.add('is-mounted');
    const totalFiles = list.reduce((acc, f) => acc + f.count, 0);
    box.innerHTML = `
      <div class="kb-mount-info-mounted">
        <div class="kb-mount-head-line">
          <span class="tag ok">已挂载 ${list.length} 个知识库</span>
          <small class="muted">共关联 ${totalFiles} 份资料资产</small>
        </div>
        <div class="kb-mounted-tags">
          ${list.map(f => `
            <span class="kb-tag">
              <i class="kb-tag-icon">${f.scope==='shared'?'📂':'📁'}</i>
              <b>${f.name}</b>
              <small>(${f.count} 份资料)</small>
              <button type="button" class="kb-tag-del" onclick="removeKbFolder('${f.id}')" title="移除此知识库">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <button type="button" id="kbMountBtn" class="btn secondary" onclick="openKbFolderPicker()">＋ 管理 / 追加挂载 ⌄</button>
    `;

    // Auto-fill course name if blank
    const nameInput = document.querySelector('#createForm input[placeholder="如：离散数学"]');
    if(nameInput && !nameInput.value.trim() && list[0]){
      nameInput.value = list[0].name;
    }
  }
}

function saveCourseDraft(e){
  if(e){
    e.preventDefault();
    e.stopPropagation();
  }
  alert('已保存为课程草稿');
  if(window.closeAI) window.closeAI();
}

function openCourseCreate(){
  document.body.classList.add('modal-lock');
  document.documentElement.classList.add('modal-lock');
  document.querySelector('.modal-bottom').style.display='none';
  document.getElementById('modalTitle').textContent='创建课程';

  window.__courseCreateDataMode = 'new';
  window.__selectedKbFolders = [];

  document.getElementById('stream').innerHTML=`
    <form id="createForm" class="create-form">
      <div class="create-mode-section">
        <label class="form-section-title">课程数据来源模式 <small class="muted">（选择创建全新数据或复用历史课程数据）</small></label>
        <div class="create-mode-options">
          <div class="create-mode-card active" id="modeCardNew" onclick="toggleCourseDataMode('new')">
            <input type="radio" name="courseDataMode" value="new" checked>
            <div class="mode-card-header">
              <span class="mode-icon">✦</span>
              <strong class="mode-title">新建课程资料</strong>
              <span class="mode-badge">智能创建</span>
            </div>
            <p class="mode-desc">根据资料库和课程信息开始全新创建。系统将根据主教材和课程设置智能生成全新的教学大纲、教学日历、备课与课件数据。</p>
          </div>
          <div class="create-mode-card" id="modeCardReuse" onclick="toggleCourseDataMode('reuse')">
            <input type="radio" name="courseDataMode" value="reuse">
            <div class="mode-card-header">
              <span class="mode-icon">↺</span>
              <strong class="mode-title">复用原课程资料</strong>
              <span class="mode-badge">数据继承</span>
            </div>
            <p class="mode-desc">从知识库识别历史课程数据，自动将原有课程的大纲、日历、备课、课件等解析并回写到当前各课程模块中。</p>
          </div>
        </div>
      </div>

      <div id="courseModeHint" class="form-hint mode-hint-new">
        <b>✦ 新建模式指引：</b>系统将根据资料库和课程信息开始全新创建，自动开启全新的教学大纲、教学日历、备课与课件生成流程。
      </div>

      <div class="kb-mount-group">
        <label class="form-section-title">挂载知识库 <small class="muted">（可选，从资料库中选择对应文件夹关联课程数据，支持多选）</small></label>
        <div class="kb-mount-box" id="kbMountBox">
          <div class="kb-mount-info">
            <span class="kb-mount-icon">▤</span>
            <div class="kb-mount-text">
              <b>未挂载知识库文件夹</b>
              <small>未选择文件夹，可点击右侧按钮打开资料库选择（可多选挂载）</small>
            </div>
          </div>
          <button type="button" id="kbMountBtn" class="btn secondary" onclick="openKbFolderPicker()">＋ 选择挂载知识库 ⌄</button>
        </div>
      </div>

      <label>课程名称<input required placeholder="如：离散数学"></label>
      <label>课程编号<input required pattern="[A-Za-z0-9_\\\\-\\\\u4e00-\\\\u9fa5]+" placeholder="如：MATH203"></label>

      <div class="form-two">
        <label>学年<input required type="number" min="2000" max="2100" value="2026"></label>
        <label>学期<select required><option>春季</option><option>夏季</option><option selected>秋季</option><option>冬季</option></select></label>
      </div>

      <div class="form-two">
        <label>学分<input required type="number" min="0.5" max="20" step="0.5" value="3"></label>
        <label>总学时<input required type="number" min="1" max="1000" value="32"></label>
      </div>

      <label>授课对象<input required placeholder="专业、年级或班级"></label>

      <div class="form-two">
        <label>课程负责人<select required><option selected>林老师（当前用户）</option><option>王老师</option><option>陈老师</option></select></label>
        <label>任课教师（可多选）<input placeholder="如：林老师、王老师" value="林老师"></label>
      </div>

      <p class="form-hint member-hint">课程负责人默认当前教师；管理员可在课程成员设置中调整。</p>

      <label>课程性质<select required><option>必修</option><option>选修</option><option>公共必修</option><option>专业必修</option><option>专业选修</option><option>其他</option></select></label>

      <label>主教材（未挂载知识库时上传）<input id="mainTextbook" type="file" accept=".pdf,.docx" onchange="simulateTextbookUpload(this)"></label>

      <div id="uploadProgress" class="upload-progress" hidden role="status" aria-live="polite">
        <div class="upload-file-row">
          <span id="uploadFileName">主教材文件</span>
          <strong id="uploadPercent">0%</strong>
        </div>
        <div id="uploadTrack" class="upload-track" role="progressbar" aria-label="主教材上传进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <i id="uploadBar"></i>
        </div>
        <small id="uploadStatus">选择文件后开始上传</small>
      </div>

      <p class="form-hint">点击“创建课程并开始分析处理”后，系统将自动进入课程分析与阶段性解析流程。</p>

      <div class="form-actions">
        <button type="button" class="btn secondary" onclick="saveCourseDraft(event)">保存为课程草稿</button>
        <button id="createCourseSubmit" class="btn primary" type="submit">创建课程并开始分析处理 →</button>
      </div>
    </form>
  `;

  document.getElementById('modal').classList.add('open','create-open');
  document.getElementById('modalBg').classList.add('open','create-open');

  document.getElementById('createForm').onsubmit = function(e){
    e.preventDefault();
    startCourseProcessing();
  };
}
