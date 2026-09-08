# 公共数据字典

## 通用字段

所有实体默认包含：`id: UUID`、`created_at: datetime`、`updated_at: datetime`。用户相关实体增加 `created_by: UUID`；可归档实体增加 `archived_at: datetime|null`、`archived_by: UUID|null`。

## 通用枚举

- `term_type`：`spring` 春季、`summer` 夏季、`autumn` 秋季、`winter` 冬季。
- `course_nature`：`required` 必修、`elective` 选修、`public_required` 公共必修、`professional_required` 专业必修、`professional_elective` 专业选修、`other` 其他。
- `course_role`：`owner` 课程负责人、`teacher` 教师、`secretary` 教学秘书、`viewer` 查看者、`admin` 管理员。
- `file_type`：`pdf`、`docx`、`pptx`、`xlsx`、`csv`。
- `library_scope`：`personal` 个人、`course` 当前课程、`shared` 课程共享。
- `priority`：`high` 高、`medium` 中、`low` 低。

## 跨模块对象

- `User`：用户账号、姓名、角色和状态。
- `Course`：课程基本信息和负责人。
- `CourseTerm`：课程学年、学期和教学周。
- `CourseVersion`：课程教学内容版本。
- `CourseMember`：用户与课程的关系及课程权限。
- `FileAsset`：文件元数据、归属、来源和状态。
- `StructureNode`：教材或课程章节树节点。
- `KnowledgeItem`：知识点、定义、定理、公式、例题等结构化内容。
- `ApprovalTask`：审核任务、意见和处理结果。
- `ProcessingTask`：文件解析、知识库构建等异步任务。
- `Notification`：站内消息和待办提醒。
- `AuditLog`：用户和系统操作记录。
- `Student`：课程花名册中的学生主数据，唯一键为课程范围内的 `student_no`。
- `Class`：课程班级及其学生归属。
- `ScoreRecord`：与课程版本、任务和学生关联的成绩记录。
- `ReviewTask`：版本或正式教学内容的审核任务。
- `ProcessingTask`：文件解析、导入、计算、AI 生成和导出等异步任务。
- `AIAnalysisResult`：带模型、输入快照、来源和人工确认状态的 AI 结果。

## 关系原则

- 教学成果必须关联 `course_id` 和 `course_version_id`。
- 文件、知识点、章节、题目和成绩的关系必须结构化保存。
- AI 结果必须关联来源文件、来源页码、生成时间和人工确认状态。
- 学生、班级、成绩和学情分析必须绑定课程及课程版本；学生主数据不得跨课程复用。

## 学生主数据基础规则

`Student` 必须包含：`student_id`、`course_id`、`student_no`、`student_name`、`class_id`、`status`（`active`、`withdrawn`、`transferred`、`graduated`、`unknown`）、`source_type`（`manual`、`grade_import`、`external_api_reserved`）、`source_ref`、`created_at`、`updated_at`。

- 课程范围内 `student_no` 唯一；学号变更通过别名记录，不修改历史成绩的原始学号快照。
- 退课、转班不删除学生和成绩；后续成绩按最新有效班级归属，历史分析保留当时班级快照。
- 当前版本只支持教师通过成绩导入建立/更新花名册，外部教务接口仅预留。
- 归档课程的学生身份和成绩按学校数据保留策略保存；超期后匿名化，匿名化操作必须记录审计日志。
- 课程资料不允许跨课程引用；个人资料如需用于其他课程，必须复制形成新的课程资料归属，不建立跨课程引用关系。
