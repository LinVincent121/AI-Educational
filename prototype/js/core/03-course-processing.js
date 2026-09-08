/* Extracted from index.html and enhanced for course data creation & multi-KB processing. */
(function(){
  function clearUploadTimer(){
    if(window.__uploadTimer){
      clearInterval(window.__uploadTimer);
      window.__uploadTimer=null;
    }
  }

  function clearProcessingTimer(){
    if(window.__processingTimer){
      clearTimeout(window.__processingTimer);
      window.__processingTimer=null;
    }
  }

  window.simulateTextbookUpload = function(input){
    clearUploadTimer();
    const file = input && input.files && input.files[0],
          box = document.getElementById('uploadProgress');
    if(!file || !box) return;

    window.__uploadState = { status: 'uploading', fileName: file.name, percent: 0 };
    box.hidden = false;
    box.dataset.state = 'uploading';
    document.getElementById('uploadFileName').textContent = file.name;

    const bar = document.getElementById('uploadBar'),
          percent = document.getElementById('uploadPercent'),
          status = document.getElementById('uploadStatus'),
          track = document.getElementById('uploadTrack');

    let value = 0;
    function paint(){
      value = Math.min(100, value + Math.round(9 + Math.random() * 13));
      bar.style.transform = 'scaleX(' + (value / 100) + ')';
      percent.textContent = value + '%';
      track.setAttribute('aria-valuenow', String(value));
      status.textContent = value < 100 ? '正在上传主教材…' : '上传完成，等待课程处理';
      if(value >= 100){
        clearUploadTimer();
        box.dataset.state = 'success';
        window.__uploadState.status = 'uploaded';
        window.__uploadState.percent = 100;
      }
    }
    paint();
    window.__uploadTimer = setInterval(paint, 130);
  };

  window.startCourseProcessing = function(){
    clearProcessingTimer();
    clearUploadTimer();

    const modal = document.getElementById('modal'),
          stream = document.getElementById('stream');

    const mode = window.__courseCreateDataMode || 'new';
    const isReuse = (mode === 'reuse');
    const mountedKbs = window.__selectedKbFolders || [];
    const kbName = mountedKbs.length > 0 ? mountedKbs.map(f => f.name).join('、') : '离散数学';
    const totalFiles = mountedKbs.length > 0 ? mountedKbs.reduce((acc, f) => acc + f.count, 0) : 4;

    modal.classList.add('course-processing');
    document.getElementById('modalTitle').textContent = isReuse ? '创建课程 · 复用解析中' : '创建课程 · 全新分析处理中';

    const stages = isReuse ? [
      ['历史知识库识别', '定位并读取原课程【' + kbName + '】(' + (mountedKbs.length || 1) + ' 个知识库，共 ' + totalFiles + ' 份资料) 历史资产'],
      ['解析历史大纲与日历', '解析原课程正式大纲 v2 与 16 周教学日历编排结构'],
      ['提取备课与课件资产', '抽取章节备课重点难点、例题及课件制作模板'],
      ['模块数据自动回写', '将原有课程数据自动关联解析并回写到当前各课程模块'],
      ['自动解析完成', '历史课程资产全部完成结构化映射，等待教师确认']
    ] : [
      ['文件与知识库检查', '验证主教材及挂载知识库【' + kbName + '】(共 ' + totalFiles + ' 份资料) 完整性'],
      ['文本与结构提取', '读取段落、表格与页码，必要时进行 OCR 识别'],
      ['目录与章节识别', '整理全新的章节层级并标记需要确认的页码'],
      ['知识库索引构建', '生成可供课程 AI 检索与问答的多维向量索引'],
      ['大纲/日历/备课智能生成', '智能生成全新的教学大纲、教学日历及备课架构'],
      ['等待确认', '全新课程初始化完成，快照已生成，等待教师确认目录']
    ];

    const leadHeading = isReuse ? '正在定位历史课程资产并解析…' : '正在全新构建课程资产与知识库…';
    const leadSub = isReuse ? '系统正自动从知识库【' + kbName + '】回写大纲、日历、备课与课件' : '系统将按阶段完成教材检查、全新的结构提取、向量索引和内容生成';
    const taskId = isReuse ? 'TASK-REUSE-20260908-009' : 'TASK-NEW-20260908-001';

    stream.innerHTML = `
      <div id="processFeed" class="process-feed" aria-live="polite">
        <div class="process-lead">
          <span class="process-dot live"></span>
          <div>
            <strong id="processHeading">${leadHeading}</strong>
            <small id="processSub">${leadSub}</small>
            <span class="process-task-id">处理任务 · ${taskId}</span>
          </div>
        </div>
        <div class="process-progress">
          <div class="process-progress-meta">
            <span>分析处理进度</span>
            <strong id="processPercent">0%</strong>
          </div>
          <div class="process-track" role="progressbar" aria-label="课程资料处理进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <i id="processBar"></i>
          </div>
        </div>
        <div id="processChain" class="process-chain"></div>
        <div id="processLive" class="process-live">
          <span class="process-live-label">分析中</span>正在初始化课程数据处理引擎…
        </div>
        <div id="processResult" class="process-result" hidden>
          <strong>${isReuse ? '历史课程资料复用解析完成' : '全新课程初始化与分析完成'}</strong>
          <p>${isReuse ? '系统已自动从知识库【' + kbName + '】识别并解析原有课程的大纲、日历、备课与课件数据，并已自动回写填入当前各课程模块中。' : '系统已根据资料库与课程信息完成全新大纲、日历、备课与课件数据的智能生成。'}</p>
          <button id="keepInCourse" class="btn primary">进入课程工作空间 →</button>
        </div>
      </div>
    `;

    const chain = document.getElementById('processChain');
    stages.forEach((stage, index) => {
      const row = document.createElement('div');
      row.className = 'process-step' + (index === 0 ? ' active' : '');
      row.dataset.stage = String(index);
      row.innerHTML = `
        <span class="process-icon">${index + 1}</span>
        <div class="process-step-main">
          <b>${stage[0]}</b>
          <small>${stage[1]}</small>
        </div>
        <span class="process-step-state">${index === 0 ? '进行中' : '等待'}</span>
      `;
      chain.appendChild(row);
    });

    document.getElementById('keepInCourse').onclick = function(){
      window.closeAI();
      location.hash = '#course/overview';
    };

    let index = 0;
    const progress = isReuse ? [20, 45, 70, 90, 100] : [15, 35, 58, 80, 92, 100];

    function paintStage(){
      const rows = [...document.querySelectorAll('#processChain .process-step')],
            heading = document.getElementById('processHeading'),
            sub = document.getElementById('processSub'),
            live = document.getElementById('processLive'),
            bar = document.getElementById('processBar'),
            percent = document.getElementById('processPercent');

      if(!rows.length || !bar || !percent){
        clearProcessingTimer();
        return;
      }

      rows.forEach((row, i) => {
        row.classList.toggle('complete', i < index);
        row.classList.toggle('active', i === index);
        row.querySelector('.process-step-state').textContent = i < index ? '完成' : (i === index ? '进行中' : '等待');
      });

      const stage = stages[index];
      heading.textContent = (index === stages.length - 1) ? (isReuse ? '历史数据复用解析完成' : '分析处理完成') : ('正在处理 · ' + stage[0]);
      sub.textContent = stage[1];
      live.innerHTML = '<span class="process-live-label">' + (index === stages.length - 1 ? '已完成' : '分析中') + '</span>' +
                       (index === stages.length - 1 ? (isReuse ? '原课程大纲、日历、备课与课件已自动回写至当前课程。' : '全新大纲、日历与教学资产已成功生成，可进入课程工作空间查看。') :
                                                      ('正在' + stage[0] + '，已完成当前阶段的校验与记录。'));

      const value = progress[index];
      bar.style.transform = 'scaleX(' + (value / 100) + ')';
      bar.parentElement.setAttribute('aria-valuenow', String(value));
      percent.textContent = value + '%';

      if(index === stages.length - 1){
        rows[index].classList.add('complete');
        rows[index].classList.remove('active');
        rows[index].querySelector('.process-step-state').textContent = isReuse ? '已自动回写' : '分析完成';
        document.getElementById('processResult').hidden = false;
        document.querySelector('.process-dot').classList.remove('live');
        document.getElementById('modalTitle').textContent = isReuse ? '复用数据解析与回写完成' : '课程初始化与分析完成';
        clearProcessingTimer();
        return;
      }

      index += 1;
      window.__processingTimer = setTimeout(paintStage, 750);
    }

    paintStage();
  };

  window.closeAI = function(){
    clearProcessingTimer();
    clearUploadTimer();
    if(window.__modalCloseTimer){
      clearTimeout(window.__modalCloseTimer);
      window.__modalCloseTimer = null;
    }

    const modal = document.getElementById('modal');
    const bg = document.getElementById('modalBg');

    if(modal) modal.className = 'modal';
    if(bg) bg.className = 'modal-bg';

    document.querySelectorAll('.create-footer').forEach(el => el.remove());
    document.body.classList.remove('modal-lock');
    document.documentElement.classList.remove('modal-lock');
    window.__uploadState = null;
  };

  const modalCloseBtn = document.getElementById('modalClose');
  if(modalCloseBtn){
    modalCloseBtn.onclick = window.closeAI;
  }
  const modalBg = document.getElementById('modalBg');
  if(modalBg){
    modalBg.onclick = window.closeAI;
  }
})();
