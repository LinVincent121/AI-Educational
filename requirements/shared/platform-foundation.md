# 平台基础能力规范

> 适用范围：所有业务模块共用的账号、文件、异步任务、通知、日志、搜索、分页、字典和基础服务约束。业务模块不得重复定义与本文件冲突的基础规则。

## 1. 用户、账号与会话

### 1.1 User 字段

| 字段 | 类型 | 必填 | 规则 |
|---|---|---:|---|
| `user_id` | UUID | 是 | 全局唯一，不复用 |
| `account` | string(100) | 是 | 登录账号，系统内唯一 |
| `display_name` | string(100) | 是 | 展示姓名 |
| `email` | string(200) | 否 | 格式校验 |
| `phone` | string(20) | 否 | 脱敏展示 |
| `avatar_file_id` | UUID/null | 否 | 头像文件 |
| `status` | enum | 是 | `active`、`locked`、`disabled`、`pending` |
| `last_login_at` | datetime/null | 否 | 最近登录时间 |
| `created_at` | datetime | 是 | 创建时间 |
| `updated_at` | datetime | 是 | 更新时间 |

### 1.2 会话规则

- 登录成功创建 `session_id`，记录设备、IP、登录时间和过期时间；默认有效期 8 小时，无操作 30 分钟自动续期，最长不超过 7 天。
- 连续 5 次密码错误锁定账号 15 分钟；管理员解锁必须写入审计日志。
- 退出登录立即吊销当前会话；修改密码后吊销该用户其他会话。
- 接口未登录返回 `401`；已登录但无权限返回 `403`；资源不存在或无权查看统一返回 `404`，避免泄露资源存在性。

## 2. 课程上下文与权限基础

- 所有课程内请求必须携带 `course_id`，涉及教学内容时必须同时携带 `course_version_id`。
- 服务端按“用户身份 → 角色 → 课程成员关系 → 资源归属 → 当前状态 → 操作权限”顺序校验。
- 顶部导航的课程切换清空上一课程的缓存、筛选条件和草稿上下文，防止数据串课。
- 跨课程资料、知识库、成绩、题目和 AI 检索结果默认禁止关联；复制后形成新归属。

## 3. 文件基础能力

### 3.1 FileAsset 字段

| 字段 | 类型 | 必填 | 规则 |
|---|---|---:|---|
| `file_id` | UUID | 是 | 文件标识 |
| `owner_id` | UUID | 是 | 上传人 |
| `course_id` | UUID/null | 否 | 课程归属，个人资料可为空 |
| `course_version_id` | UUID/null | 否 | 课程版本归属 |
| `scope` | enum | 是 | `personal`、`course`、`shared` |
| `file_purpose` | enum | 是 | `main_textbook`、`supplementary_material`、`student_roster`、`grade_import`、`courseware`、`assignment`、`exam`、`other` |
| `original_name` | string(255) | 是 | 原始文件名 |
| `storage_key` | string(500) | 是 | 对象存储键，不向前端暴露物理路径 |
| `file_type` | enum | 是 | `pdf`、`docx`、`pptx`、`xlsx`、`csv`、`jpg`、`png` |
| `size_bytes` | bigint | 是 | 大于 0；主教材/课程资料默认上限 500MB，成绩导入/花名册上限 200MB |
| `sha256` | string(64) | 是 | 文件完整性和去重 |
| `status` | enum | 是 | `pending`、`uploading`、`uploaded`、`scanning`、`available`、`processing`、`failed`、`archived` |
| `uploaded_at` | datetime | 是 | 上传完成时间 |
| `archived_at` | datetime/null | 否 | 归档时间 |

### 3.2 上传与下载

- 大于 10MB 使用分片上传；必须支持断点续传、进度显示、失败重试和哈希去重。
- 上传完成后依次执行病毒扫描、格式校验和权限绑定；未达到 `available` 不得被 AI 或业务模块引用。限制按 `file_purpose` 执行：`main_textbook/supplementary_material` ≤500MB，`grade_import/student_roster` ≤200MB。超过 500MB 的资料采用分卷上传或对象存储分片合并，并在业务层呈现为一个逻辑资料。
- 普通文件下载使用短时效签名 URL（默认 10 分钟）；导出记录永久保留，用户可从历史记录重新生成下载链接，每次下载写入 `file_download` 审计事件。
- 重命名不改变 `sha256`；替换文件必须生成新文件版本，不覆盖历史文件。
- 课程归档后文件仍可预览和下载，但禁止上传、替换、删除和重新解析。

## 4. 异步任务与队列

### 4.1 ProcessingTask 字段

`task_id`、`task_type`、`course_id`、`resource_id`、`requested_by`、`status`（`queued`/`running`/`succeeded`/`partial`/`failed`/`cancelled`/`timeout`）、`progress_percent`、`attempt`、`max_attempts`、`started_at`、`finished_at`、`error_code`、`error_message`、`result_ref`。

### 4.2 通用规则

- 文件解析、知识库构建、批量计算、AI 生成和报告导出必须异步执行；前端显示进度和最近更新时间。
- 默认最大重试 3 次，采用指数退避；同一 `idempotency_key` 的任务只能产生一个有效结果。
- 单任务超过业务 SLA 自动标记 `timeout`，保留中间结果并允许重试；不得重复写入成绩或版本。
- 用户可取消 `queued` 任务；`running` 任务仅在服务支持安全中断时允许取消。
- 任务完成、失败或需要人工处理时写入消息通知。

## 5. 消息与通知

### 5.1 Notification 字段

`notification_id`、`recipient_id`、`course_id`、`type`、`title`、`content`、`severity`（`info`/`success`/`warning`/`error`）、`related_type`、`related_id`、`read_at`、`created_at`、`expires_at`。

通知类型至少包括：`review_pending`、`review_returned`、`review_approved`、`file_processing_done`、`file_processing_failed`、`grade_import_done`、`analysis_done`、`export_done`、`system_announcement`。

- 站内消息为必选渠道；邮件/企业微信等外部渠道由系统设置控制，失败不影响站内消息。
- 同一事件、同一接收人、10 分钟内去重；未读计数在顶部导航展示。
- 点击消息跳转到有权限的关联页面；无权限时显示“内容已不可访问”，不得暴露详情。

## 6. 审计日志

### 6.1 AuditLog 字段

`log_id`、`operator_id`、`operation`、`resource_type`、`resource_id`、`course_id`、`before_snapshot`、`after_snapshot`、`result`（`success`/`failure`）、`failure_code`、`ip`、`user_agent`、`request_id`、`created_at`。

- 登录、权限变更、文件上传/下载/删除、版本创建/提交/审核/启用/归档、成绩导入/修订、AI 生成/确认/驳回、导出均必须记录。
- 日志只追加不可修改、不可删除，永久保留；普通教师可查看本人操作日志，教学秘书可查看所负责课程的完整日志，管理员可全局查询。
- `before_snapshot` 和 `after_snapshot` 需脱敏，不保存密码、Token 或完整学生隐私字段。

## 7. 搜索、筛选、分页与导出

- 列表默认分页 20 条，可选 50/100；服务端强制最大 100 条，禁止前端一次加载全量数据。
- 搜索默认匹配名称、编号、标签和标题；最小输入 1 个字符，最大 100 个字符；特殊字符按字面处理。
- 筛选条件、排序字段和分页游标由服务端校验白名单；默认排序为 `updated_at desc`。
- 导出统一异步生成，支持 `xlsx`、`docx`、`pdf`（按业务模块开放）；不设置自动失效时间，导出记录永久保留且不可删除。
- 导出必须继承当前权限、课程范围和脱敏规则，记录导出人、条件、字段和文件哈希。

## 8. API 与错误码

统一响应包含：`request_id`、`code`、`message`、`data`、`timestamp`。分页响应包含 `items`、`page`、`page_size`、`total` 或 `next_cursor`。

公共错误码：`AUTH_REQUIRED`、`FORBIDDEN`、`NOT_FOUND`、`VALIDATION_ERROR`、`DUPLICATE_REQUEST`、`FILE_TOO_LARGE`、`FILE_UNAVAILABLE`、`TASK_RUNNING`、`TASK_TIMEOUT`、`COURSE_ARCHIVED_READONLY`、`RATE_LIMITED`、`INTERNAL_ERROR`。

所有写接口支持 `Idempotency-Key`；服务端生成并透传 `request_id`，便于问题追踪。

## 9. 基础安全与隐私

- 传输使用 HTTPS；对象存储和数据库加密；敏感字段按最小权限返回。
- 学生姓名、学号、联系方式在列表默认脱敏；发送给大模型前必须使用脱敏标识和聚合指标。
- 前端不可保存长期访问 Token；敏感操作需要二次确认，必要时重新验证身份。
- 文件类型采用扩展名、MIME 和文件头三重校验；禁止执行文件和脚本型附件。

## 10. 公共性能基线

- 普通列表/详情查询 P95 ≤ 2 秒；聚合分析查询 P95 ≤ 3 秒。
- 文件上传接口在网络可用时稳定支持主教材/课程资料 500MB、成绩导入/学生花名册 200MB；超过 500MB 的资料通过分卷或对象存储上传；解析和导出采用异步，不阻塞页面。
- 单用户同时运行任务不超过 5 个；系统总任务队列、并发和失败率进入监控指标。
- 服务不可用时前端显示可操作的重试入口和任务编号，不显示堆栈或内部地址。
