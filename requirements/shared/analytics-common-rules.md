# 公共埋点与指标规则

## 事件公共字段

每个事件必须包含：`event_id`、`event_name`、`user_id`、`session_id`、`course_id`、`course_version_id`、`page_route`、`timestamp`、`role`、`result`、`error_code`。

## 命名规则

格式：`对象_动作_结果`，使用小写英文和下划线；例如 `course_create_success`、`file_upload_fail`。

## 结果值

- `success`：操作成功。
- `fail`：操作失败。
- `cancel`：用户取消。
- `abandon`：用户离开且未完成。
- `confirm`：用户确认系统结果。
- `reject`：用户拒绝或大幅修改系统结果。

## 指标原则

点击生成不等于认可；确认、保存、复用、导出和进入后续模块更接近用户认可。大量修改、重试、删除、放弃和重新上传属于负向信号。
