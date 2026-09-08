# 需求文档总目录

## 文档状态

| 文档 | 状态 | 说明 |
|---|---|---|
| `00-product-principles.md` | 已形成 | 产品定位、术语和统一原则 |
| `01-module-blueprint.md` | 历史参考 | 信息架构蓝图，不作为冲突规则依据 |
| `modules/02-10*.md` | 已形成 | 教学业务模块 PRD |
| `modules/11-grade-analysis.md` | 当前 PRD | 学生画像（成绩与学情分析） |
| `modules/12-version-review.md` | 当前 PRD | 版本与审核统一中心 |
| `modules/13-home.md` | 当前 PRD | 首页/全局总览 |
| `modules/03-syllabus.md` | 已封版（2026-09-05） | 课程大纲字段、样式、交互和业务规则唯一依据；对应原型缓存版本 `20260905-81` |
| `product-audit.md` | 已完成最终审查 | 全量需求一致性审计、整改记录和原型准入结论 |
| `modules/01-course-workspace.md` | 当前 PRD | 我的课程/课程总览完整需求，包含页面、字段、流程、AI、埋点和验收 |
| `shared/data-dictionary.md` | 公共规范 | 跨模块数据对象、字段和枚举 |
| `shared/permission-status.md` | 公共规范 | 跨模块角色、权限、状态和审核规则 |
| `shared/system-architecture.md` | 公共规范 | 跨模块系统、接口、异步任务和异常处理规则 |
| `shared/ai-common-rules.md` | 公共规范 | 跨模块大模型介入、性能和输出规则 |
| `shared/analytics-common-rules.md` | 公共规范 | 跨模块埋点和指标规则 |
| `shared/platform-foundation.md` | 公共规范 | 账号、文件、异步任务、通知、审计和安全基础能力 |

## 阅读顺序

1. `01-module-blueprint.md`
2. 对应模块的 `modules/*.md`
3. `shared/` 下的公共规范

## PRD 约定

- 字段名采用 `snake_case`，展示名称使用中文。
- 枚举值为稳定英文编码，前端展示中文标签。
- 所有时间统一使用 ISO 8601，服务端保存 UTC，前端按用户时区显示。
- 所有 AI 结果必须标记来源、生成时间和人工确认状态。
- 正式业务内容不允许直接覆盖，必须生成新版本。
- 每个业务模块只保留一份完整 PRD；页面不单独建文档。
- Prompt 默认写在所属模块 PRD 内，只有跨模块复用的规则才放入公共 AI 规范。
- 本目录中的“当前 PRD”表示可指导原型和开发，评审意见以模块文档更新为准。
