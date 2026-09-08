# 我的课程 / 课程总览 PRD

## 1. 模块范围

点击顶部“我的课程”后进入课程选择与管理区域；点击具体课程后进入该课程工作空间的“课程总览”。本模块负责课程创建、课程初始化、教材资料处理、教材结构确认、课程状态查看和课程管理，不负责教学大纲、教学日历、备课、课件、作业、试卷和成绩的详细编辑。

## 已确认业务决策

1. 一门课程只能设置一份主教材；其他教材、历史大纲、教案、课件、作业、试卷、学校模板和人才培养方案均属于可选补充资料。
2. 课程负责人可以转移；转移后保留历史操作记录。
3. 教学秘书可以查看和审核，但不能修改教师资料。
4. 课程资料不允许跨课程引用。
5. 教师生成的课件和作业不需要教学秘书审核，教师确认后即可使用或导出。
6. 教学日历必须提交教学秘书审核，通过后才可作为正式日历使用。
7. 共享资料由创建人管理，共享成员只能查看和引用，不能编辑、删除或再次授权。
8. 创建课程即必须上传一份主教材；其他教材和教学文件均为补充资料。
9. 教材结构存在异常时允许教师强制确认，但必须显示风险并记录确认人、时间和原因。
10. 课程归档后允许查看成绩和历史资料，但禁止创建新内容、修改正式内容和启动新的解析任务。

## 2. 页面清单

| 页面编号 | 页面名称 | 路由建议 | 访问角色 |
|---|---|---|---|
| CO-01 | 我的课程入口 | `/courses` | 教师、教学秘书、管理员 |
| CO-02 | 创建课程 | `/courses/create` | 教师、管理员 |
| CO-03 | 课程资料处理 | `/courses/{course_id}/processing` | 有课程访问权的用户 |
| CO-04 | 教材解析确认 | `/courses/{course_id}/structure-review` | 课程负责人、授权教师、教学秘书 |
| CO-05 | 课程总览 | `/courses/{course_id}/overview` | 有课程访问权的用户 |
| CO-06 | 课程管理 | `/courses/{course_id}/settings` | 课程负责人、授权教学秘书、管理员 |
| CO-07 | 课程成员弹窗 | `CO-06 modal` | 具备成员管理权限的用户 |
| CO-08 | 归档课程弹窗 | `CO-06 modal` | 课程负责人、管理员 |

## 3. CO-01 我的课程入口

### 3.1 查询条件

| 字段 | 类型 | 枚举/规则 |
|---|---|---|
| `keyword` | string | 0-100 字，匹配课程名称、课程编号 |
| `academic_year` | integer | 2000-2100；空值表示全部 |
| `term_type` | enum | `spring` 春季、`summer` 夏季、`autumn` 秋季、`winter` 冬季、空值全部 |
| `course_status` | enum[] | `draft` 草稿、`processing` 资料处理中、`pending_review` 待确认、`active` 可使用、`has_todo` 有待处理事项、`archived` 已归档 |
| `sort_by` | enum | `updated_at` 最近更新、`created_at` 创建时间、`name` 名称 |
| `sort_order` | enum | `asc` 升序、`desc` 降序 |

### 3.2 课程卡片字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `course_id` | UUID | 是 | 课程唯一标识 |
| `course_name` | string | 是 | 1-100 字 |
| `course_code` | string | 是 | 1-50 字，课程编号 |
| `academic_year` | integer | 是 | 如 2026 |
| `term_type` | enum | 是 | 春/夏/秋/冬季 |
| `term_label` | string | 是 | 前端拼接，如“2026 春季” |
| `course_owner_name` | string | 是 | 课程负责人 |
| `current_version_no` | string | 否 | 如 `v1.0` |
| `course_status` | enum | 是 | 课程状态 |
| `current_teaching_week` | integer | 否 | 1-52，无日历时为空 |
| `todo_count` | integer | 是 | 大于等于 0 |
| `material_count` | integer | 是 | 大于等于 0 |
| `updated_at` | datetime | 是 | 最近更新时间 |
| `user_course_role` | enum | 是 | `owner` 负责人、`teacher` 教师、`secretary` 教学秘书、`admin` 管理员 |

### 3.3 交互规则

- 点击卡片或“进入课程”进入 `CO-05`。
- 点击“更多”展示：课程管理、课程资料、版本记录、归档课程、退出课程。
- 已归档课程默认不显示，可通过状态筛选查看。
- 无课程时展示空状态和“创建课程”按钮。
- 课程处于 `processing` 时仍可进入总览，但不能进入依赖知识库的生成操作。

## 4. CO-02 创建课程

### 4.1 表单字段

| 字段 | 类型 | 必填 | 枚举/校验 |
|---|---|---:|---|
| `course_name` | string | 是 | 1-100 字 |
| `course_code` | string | 是 | 1-50 字；仅允许中文、英文、数字、`-`、`_` |
| `academic_year` | integer | 是 | 2000-2100 |
| `term_type` | enum | 是 | `spring`、`summer`、`autumn`、`winter` |
| `credit` | decimal(3,1) | 是 | 0.5-20.0 |
| `total_hours` | integer | 是 | 1-1000 |
| `teaching_object` | string | 是 | 1-200 字；填写专业、年级或班级 |
| `course_nature` | enum | 是 | `required` 必修、`elective` 选修、`public_required` 公共必修、`professional_required` 专业必修、`professional_elective` 专业选修、`other` 其他 |
| `college_name` | string | 否 | 0-100 字 |
| `major_name` | string | 否 | 0-100 字 |
| `class_names` | string[] | 否 | 每项 1-100 字 |
| `course_description` | string | 否 | 0-1000 字 |
| `textbook_name` | string | 否 | 0-200 字 |
| `textbook_author` | string | 否 | 0-200 字 |
| `textbook_edition` | string | 否 | 0-100 字 |
| `textbook_publisher` | string | 否 | 0-200 字 |
| `school_template_file_id` | UUID | 否 | 必须是当前用户可访问的模板文件 |
| `course_owner_id` | UUID | 是 | 默认当前教师；仅管理员可修改 |

展示示例：`academic_year=2026`、`term_type=spring`，前端显示为“2026 春季”。学期不是固定写死的字符串，而是“学年 + 学期类型”的组合。

### 4.2 创建校验

- 课程名称、课程编号、学年、学期、学分、总学时、授课对象和课程性质必填。
- 同一课程负责人下，课程编号 + 学年 + 学期不得重复。
- 未上传主教材时只能保留填写进度，不能完成课程创建并进入课程工作空间。
- 草稿课程不能进入大纲生成、知识库问答和课程 AI 生成操作。
- 主教材上传成功并通过文件检查后，当前教师自动成为课程负责人，课程进入资料处理状态。

### 4.3 按钮和结果

| 按钮 | 行为 |
|---|---|
| 保存为课程草稿 | 保存课程信息和当前上传进度，不完成课程创建，不启动正式解析 |
| 创建课程并开始处理 | 创建课程、保存资料并启动后台处理 |
| 返回 | 有未保存内容时弹窗确认 |

成功提示：`课程已创建，正在处理教材。你可以在当前信息流、课程总览或消息提醒中查看进度。`

## 5. CO-02 资料上传区

### 5.1 支持文件

| `file_type` | 展示名称 | 解析能力 |
|---|---|---|
| `pdf` | PDF | 文本、目录、OCR、页码、图片风险 |
| `docx` | Word | 段落、标题、表格 |
| `pptx` | PPT | 页面标题、文本、备注 |
| `xlsx` | Excel | 工作表、表头、单元格 |
| `csv` | CSV | 字段和行数据 |

主教材单文件默认上限 500MB；超过 500MB 采用分卷上传或对象存储分片合并；60MB PDF 不应要求教师手动拆分。

### 5.2 上传字段

| 字段 | 类型 | 必填 | 枚举/说明 |
|---|---|---:|---|
| `file_id` | UUID | 是 | 文件唯一标识 |
| `file_name` | string | 是 | 1-255 字 |
| `file_size_bytes` | integer | 是 | 大于 0 |
| `file_type` | enum | 是 | `pdf`、`docx`、`pptx`、`xlsx`、`csv` |
| `file_hash` | string | 是 | SHA-256 |
| `library_scope` | enum | 是 | `personal` 个人、`course` 当前课程、`shared` 当前课程共享 |
| `is_primary_textbook` | boolean | 是 | 每门课程必须且只能有一份 true |
| `source_author` | string | 否 | 0-200 字 |
| `source_date` | date | 否 | ISO 日期 |
| `remark` | string | 否 | 0-500 字 |

### 5.3 上传交互

- 支持拖拽、文件选择、批量上传和从个人资料库选择。
- 支持分片上传、断点续传、失败重试和重复文件检测。
- 上传进度按文件展示，不用全局一个总进度覆盖所有文件。
- 检测到相同 `file_hash` 时提示：`检测到相同文件，是否直接使用已有文件？`
- 文件上传成功后才进入解析队列。

## 6. CO-03 课程资料处理页

### 6.1 文件处理字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `processing_task_id` | UUID | 处理任务标识 |
| `file_id` | UUID | 关联文件 |
| `task_type` | enum | `file_check`、`text_extract`、`ocr`、`structure_extract`、`knowledge_index` |
| `task_status` | enum | `queued` 排队、`running` 处理中、`partial_success` 部分成功、`success` 成功、`failed` 失败、`cancelled` 已取消 |
| `current_stage` | enum | `checking`、`uploading`、`extracting_text`、`extracting_structure`、`extracting_knowledge`、`building_index`、`waiting_confirm` |
| `progress_percent` | integer | 0-100 |
| `processed_pages` | integer | PDF 已处理页数 |
| `total_pages` | integer | PDF 总页数 |
| `estimated_remaining_seconds` | integer | 无法估计时为空 |
| `warning_count` | integer | 大于等于 0 |
| `error_code` | enum | `FILE_CORRUPTED`、`UNSUPPORTED_FORMAT`、`OCR_FAILED`、`TEXT_EXTRACTION_FAILED`、`STRUCTURE_EXTRACTION_FAILED`、`INDEX_BUILD_FAILED`、`TIMEOUT`、`UNKNOWN` |
| `error_message` | string | 面向用户的错误说明 |
| `started_at` | datetime | 开始时间 |
| `completed_at` | datetime | 完成时间 |

### 6.2 页面行为

- 任务异步执行，教师可以离开页面。
- 页面刷新后通过 `processing_task_id` 恢复任务状态。
- 处理进度至少每 10 秒刷新一次。
- 失败任务支持“重试”；重试不覆盖原失败记录。
- 部分成功时允许查看已完成章节，并提示未完成页码。
- 全部完成后显示“去确认教材结构”。

提示文案：

- `教材已上传，正在识别目录和章节结构。你可以离开页面，完成后会收到提醒。`
- `第 86—91 页无法完整识别，建议确认章节内容。`
- `教材处理完成，请确认目录后再生成教学大纲。`

## 7. CO-04 教材解析确认页

### 7.1 目录树字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `structure_node_id` | UUID | 是 | 结构节点标识 |
| `parent_node_id` | UUID/null | 是 | 父节点 |
| `node_type` | enum | 是 | `chapter` 章、`section` 节、`subsection` 小节、`appendix` 附录 |
| `title` | string | 是 | 1-200 字 |
| `level` | integer | 是 | 1-4 |
| `sort_order` | integer | 是 | 同级排序，从 1 开始 |
| `start_page` | integer | 是 | 大于等于 1 |
| `end_page` | integer | 是 | 大于等于 start_page |
| `summary` | string | 否 | 0-150 字 |
| `source_file_id` | UUID | 是 | 来源文件 |
| `confidence_score` | decimal(5,4) | 是 | 0-1 |
| `needs_review` | boolean | 是 | 是否需要人工确认 |
| `review_reason` | string | 否 | 0-500 字 |
| `teacher_confirmed` | boolean | 是 | 默认 false |

### 7.2 页面操作

- 修改标题
- 修改层级
- 调整顺序
- 新增节点
- 删除节点
- 合并节点
- 拆分节点
- 修改页码范围
- 标记“不参与大纲生成”
- 重新解析当前节点
- 查看原始页面
- 确认全部结构

### 7.3 确认规则

- 存在 `needs_review=true` 的节点时，允许教师强制确认，但必须显示风险数量、风险页码和风险说明，并记录确认人、确认时间和强制确认原因。
- 页码范围不能交叉，除非节点为附录或教师明确保存覆盖关系。
- 一级章节至少 1 个。
- 删除节点前必须二次确认。
- 确认后生成教材结构快照，不直接覆盖原始解析结果。

确认提示：

> 教材结构确认后，将作为课程资料库和教学大纲生成的基础。后续修改会产生新的结构版本。

## 8. CO-05 课程总览页

### 8.1 页面区域

1. 课程信息区
2. 课程初始化状态区
3. 下一步推荐操作区
4. 待办事项区
5. 课程资产区
6. 课程 AI 对话入口
7. 最近活动区

### 8.2 页面字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `course_name` | string | 课程名称 |
| `course_code` | string | 课程编号 |
| `term_label` | string | 如“2026 春季” |
| `credit` | decimal | 学分 |
| `total_hours` | integer | 总学时 |
| `course_status` | enum | 课程状态 |
| `current_version_no` | string | 当前版本 |
| `owner_name` | string | 负责人 |
| `material_status` | enum | `not_started`、`processing`、`ready`、`error` |
| `structure_status` | enum | `not_started`、`processing`、`pending_confirm`、`confirmed`、`error` |
| `knowledge_base_status` | enum | `not_started`、`building`、`ready`、`error` |
| `syllabus_status` | enum | `not_created`、`draft`、`pending_review`、`approved`、`archived` |
| `calendar_status` | enum | `not_created`、`draft`、`pending_review`、`approved`、`archived` |
| `current_teaching_week` | integer/null | 1-52 |
| `current_chapter_name` | string/null | 当前教学章节 |
| `todo_items` | TodoItem[] | 待办列表 |
| `asset_counts` | object | 各业务资产数量 |
| `recent_activities` | Activity[] | 最近操作 |

### 8.3 推荐操作规则

| 条件 | 主推荐操作 | 次推荐操作 |
|---|---|---|
| 主教材未上传 | 上传主教材 | — |
| 文件处理中 | 查看处理进度 | 返回课程列表 |
| 待确认结构 | 确认教材目录 | 查看解析异常 |
| 结构已确认且无大纲 | 生成教学大纲 | 查看课程资料 |
| 大纲草稿 | 继续编辑大纲 | 运行大纲检查 |
| 大纲待审核 | 查看审核任务 | 查看审核意见 |
| 大纲已通过且无日历 | 生成教学日历 | 查看正式大纲 |
| 日历已通过 | 进入章节备课 | 查看教学日历 |
| 有成绩数据 | 查看学情分析 | 查看成绩明细 |

推荐操作必须由课程状态计算得出，不允许前端写死单一按钮。

### 8.4 资产入口

- 教学大纲
- 教学日历
- 章节备课
- 课件制作
- 作业管理
- 试卷管理
- 成绩与学情
- 课程资料库
- 版本与审核

依赖条件未满足时入口仍可展示，但需要置灰并说明原因，例如：`教材结构确认后可生成教学大纲`。

## 9. CO-06 课程管理页

### 9.1 基本信息字段

与创建课程字段一致，新增：

| 字段 | 类型 | 说明 |
|---|---|---|
| `created_by` | UUID | 创建人，只读 |
| `created_at` | datetime | 创建时间，只读 |
| `updated_at` | datetime | 更新时间，只读 |
| `archived_at` | datetime/null | 归档时间 |
| `archived_by` | UUID/null | 归档人 |

### 9.2 课程管理操作

- 修改基本信息
- 管理成员
- 管理资料归属
- 查看课程版本
- 查看操作记录
- 归档课程

课程负责人转移：当前负责人选择新负责人；新负责人必须是课程成员中的教师，不是成员时先添加；转移前二次确认；转移成功后新负责人获得负责人权限，原负责人降为普通教师或指定角色；全程保留操作记录。

修改学期、总学时、课程编号时提示其对大纲、日历、成绩和版本关联的影响。

## 10. CO-07 成员管理弹窗

### 10.1 字段

| 字段 | 类型 | 必填 | 枚举/说明 |
|---|---|---:|---|
| `user_id` | UUID | 是 | 被添加用户 |
| `display_name` | string | 是 | 只读展示 |
| `account` | string | 是 | 只读展示 |
| `course_role` | enum | 是 | `owner`、`teacher`、`secretary` |
| `permission_scope` | enum | 是 | `course_all` 全课程、`material_only` 仅资料、`review_only` 仅审核查看 |
| `member_status` | enum | 是 | `invited`、`active`、`suspended`、`removed` |
| `joined_at` | datetime/null | 否 | 加入时间 |

### 10.2 规则

- 一个课程只能有一个负责人。
- 负责人转移必须二次确认。
- 移除成员不会删除其历史操作记录。
- 教学秘书可审核，但不默认拥有教师内容编辑权。

## 11. CO-08 归档课程弹窗

显示：课程名称、学期、资料数量、正式版本数量、成绩数据量。

提示：

> 归档后课程不再出现在默认课程列表中，但资料、版本、审核记录和成绩数据会保留。是否继续？

操作：取消、确认归档。

不提供直接删除课程操作。课程归档后允许查看成绩、历史资料、历史版本、审核记录和操作日志；禁止新增课程内容、修改正式内容、上传新主教材和启动新的解析任务。

## 12. 模块验收标准

- 教师可以填写课程信息并保存上传进度；只有主教材上传成功后才能完成课程创建。
- 课程支持 PDF、Word、PPT、Excel、CSV 上传。
- 60MB 级 PDF 上传过程中页面不被阻塞，支持断点续传和失败重试。
- 上传完成后解析以异步任务执行，离开页面后仍继续。
- 系统能展示解析阶段、进度、异常页码和错误原因。
- 解析完成后教师可以修改并确认教材目录。
- 未确认教材结构时，大纲生成入口不可执行。
- 课程总览能根据状态显示唯一主推荐操作。
- 课程资料个人/课程/共享归属在文件级保存。
- 课程负责人可以将负责人权限转移给课程成员中的教师。
- 共享资料创建人可以管理，被共享人只能查看和引用。
- 教学秘书不能修改教师资料；教学日历必须提交教学秘书审核，课件和作业不强制审核。
- 教材结构存在异常时可以强制确认，但必须记录风险和确认审计信息。
- 课程归档后历史资料、成绩、版本、审核记录和操作日志仍可查询，所有写操作被拦截。

## 13. 当前页面与交互规范（2026-09-04）

### 13.1 全局导航与课程工作空间

- 顶部全局导航固定为：首页、我的课程、资料库、消息提醒、系统设置。
- 点击课程卡片后进入课程工作空间；课程内采用左侧固定导航，右侧为业务内容区。
- 左侧导航只放业务入口，不放课程名称、学期、负责人或课程切换控件。课程信息和课程切换放在右侧内容区顶部，使用紧凑的两行标题区。
- 课程内导航固定为：课程总览、教学大纲、教学日历、备课工作台、课件制作、作业管理、学生画像、试卷管理。各入口必须携带当前 `course_id` 和 `course_version_id`，不可跨课程跳转。
- 课程资料库、版本与审核统一中心不占用左侧八项主导航位，通过课程总览资产入口、顶部全局资料库或对应消息提醒进入，进入后仍保持同一课程上下文。
- 所有业务弹窗统一使用居中模态窗口，不使用侧边抽屉。遮罩层不可点击关闭；页面弹窗打开期间禁止背景滚动；关闭按钮固定在弹窗标题右上角；底部操作区固定在弹窗底部并与内容滚动区域分离。

### 13.2 我的课程页面

- 页面标题区保持紧凑，不使用三联式大面积统计布局。
- 课程数量必须与当前筛选结果联动，显示“共 N 门课程”；搜索、学年、学期、状态和排序控件在同一筛选行内排列。
- “筛选”和“重置”使用统一的次级按钮样式；重置后恢复默认排序和全部课程。
- 课程卡片整体可点击进入课程总览，同时支持键盘 `Enter` / `Space` 进入；卡片内的操作菜单需要阻止事件冒泡。
- 卡片显示课程名称、课程编号、学年学期、课程负责人、任课教师、课程性质、学分、总学时、当前版本和课程状态。待办数量仅在存在真实待处理对象时展示，不添加静态解释横条；课程资料数量在课程总览的资产区查看。
- 无课程、无筛选结果、加载中和加载失败均提供明确状态、下一步操作和可重试按钮。

### 13.3 创建课程居中弹窗

- “创建课程”按钮打开居中弹窗，弹窗标题与右上角“关闭”按钮位于同一标题行。
- 遮罩不可关闭弹窗；关闭只能通过右上角按钮、底部取消按钮或完成后的明确返回操作。弹窗出现和关闭使用从中心缩放/淡入淡出过渡，不使用侧滑动画。
- 弹窗内支持课程名称、课程编号、学年、学期、学分、总学时、授课对象、课程负责人、任课教师、课程性质、院系/专业/班级、课程描述、教材信息和主教材上传。
- 课程负责人默认当前教师；管理员可指定负责人。任课教师从课程成员中选择，负责人和任课教师字段必须在创建表单中明确填写并保存。
- 主教材上传按文件展示进度、速度、已上传大小、失败原因和重试按钮；上传失败不清空其他表单内容。
- “创建课程并开始处理”完成创建后，弹窗进入阶段化处理信息流：`思考中`、文件检查、文本提取、目录/章节识别、知识库构建、等待教师确认。每个阶段展示时间、状态、进度和可执行的重试/查看详情操作。
- 处理信息流支持 `queued`、`processing`、`partial`、`success`、`failed`、`timeout`；处理过程中可关闭弹窗并在消息提醒或课程总览恢复任务，不阻塞页面。

### 13.4 课程总览页面

- 课程总览右侧顶部显示课程名称、课程编号、学年学期、负责人、任课教师、版本和归档状态，并提供对齐的课程切换控件；下拉图标与文字垂直居中。
- 不使用没有数据源支撑的“教学进度”指标。概览只展示可由课程、资料、版本、审核、作业、试卷和成绩数据计算出的状态。
- 课程初始化状态、下一步推荐操作、课程资产、待办和最近活动均为可点击入口；点击后路由到对应模块，依赖未满足时说明原因并保持置灰。
- 课程资料数量只在课程总览资产区和课程资料库页面显示，资料实体仍归属课程资料库，不在课程总览内直接编辑。
- 课程归档后保留查看、对比和导出入口；所有编辑、上传、删除、生成、提交审核和重新解析操作均置为只读并给出 `COURSE_ARCHIVED_READONLY` 说明。
