# Developer Guide

## 1. 项目定位

`mx search` 是一个本地体验优先的个人搜索首页。

当前设计原则：

- 页面响应优先于“强一致云同步”
- 用户手动决定什么时候备份、什么时候同步
- 小体量实现，避免引入不必要的复杂基础设施
- 前端尽量把高频体验问题收在本地缓存层解决

这意味着：

- 本地状态是当前工作副本
- 后端状态更像用户账号层的数据持久化和备份容器
- 后端备份不是实时协作系统

## 2. 目录职责

### `public/index.html`

负责：

- 页面主体 DOM 骨架
- 搜索区、标签区、设置抽屉
- 登录弹层、备份/同步弹层、确认弹层
- 设置滚动条和分区骨架

接手时注意：

- 这里的 DOM id 在 `public/app.js` 里大量直接引用
- 任何 id/class 改动，都要同步检查 `app.js` 和 `styles.css`

### `public/styles.css`

负责：

- 全站视觉样式
- 搜索区、标签卡片、设置抽屉、备份弹层
- 拖拽高亮、局部毛玻璃遮罩、确认弹层样式
- 设置右侧快速滚动条和模块分界标记

接手时注意：

- 近期 UI 调整主要集中在这里
- 设置页和备份弹层按钮现在统一走冷白玻璃体系，不要再单独引入黄橙 CTA

### `public/app.js`

这是前端主控文件，负责：

- 页面启动 `boot()`
- 本地状态管理
- 搜索引擎切换和搜索提交
- 标签区渲染与拖拽
- 设置抽屉
- 登录/注册
- 备份/同步弹层
- 自定义确认弹层
- 背景切换与本地背景快照
- 图标缓存、本地命中、服务端共享缓存提升

如果要改功能，绝大多数入口都在这个文件。

### `server.js`

负责：

- Express 服务启动
- SQLite 表结构维护
- 用户注册/登录/会话
- 用户状态读写
- 手动备份相关 API
- 图标共享缓存 API
- Bing 背景 API
- 静态资源服务

接手时注意：

- 这是单文件后端，不复杂，但功能集中
- 改接口前先全文搜索相关 helper，避免只改 route 没改底层逻辑

### `searchindex.db`

SQLite 数据库，当前包含：

- 用户表
- 会话表
- 用户状态表
- 用户备份表
- 应用默认状态表
- 服务器共享图标缓存表

## 3. 当前前端状态模型

核心状态对象是 `appState`，结构大致是：

- `settings`
- `engines`
- `selectedEngineId`
- `categories`
- `history`

### 本地持久化 key

定义在 `public/app.js` 顶部：

- `LOCAL_HISTORY_STORAGE_KEY`
  - 本地搜索历史
- `STATE_SNAPSHOT_STORAGE_KEY`
  - 当前登录用户的本地状态快照
- `UI_PREFS_STORAGE_KEY`
  - UI 偏好，如搜索框高度、透明度等
- `BACKGROUND_SNAPSHOT_STORAGE_KEY`
  - 当前背景图快照
- `SYNC_META_STORAGE_KEY`
  - 最近一次手动备份/同步状态
- `ICON_CACHE_STORAGE_KEY`
  - 本地图标源缓存

### 启动流程

`boot()` 的当前逻辑：

1. 先绑定事件
2. 优先读取本地状态快照
3. 有快照就直接渲染，没有就用访客态
4. 再检查登录状态
5. 如果当前是未登录，则清理登录态快照并退回访客态
6. 渲染右上角备份状态

关键点：

- 现在不会在启动时自动从后端拉用户状态覆盖本地
- 这是刻意设计，不是漏掉了同步

## 4. 手动备份 / 手动同步模型

这是当前项目最重要的设计约束。

### 当前规则

- 本地所有修改先写本地
- 不自动从云端拉取覆盖本地
- 不自动把本地改动推到云端“正式状态”
- 用户只通过备份弹层显式操作后端备份

### 右上角状态按钮语义

右上角按钮现在只表示备份状态，不再承担普通通知。

可能状态：

- `未备份改动`
- `已备份数据 · 时间`
- `已同步数据 · 时间`
- 未登录提示

普通成功/失败消息统一走 `showNotice()` 的 toast。

### 前端相关函数

在 `public/app.js` 中重点看这些：

- `handleManualSyncClick()`
- `openSyncModal()`
- `closeSyncModal()`
- `refreshBackupList()`
- `renderBackupList()`
- `handleBackupNow()`
- `handleRestoreBackup()`
- `handleDeleteBackup()`
- `handleRenameBackup()`
- `renderSyncStatus()`

### 后端相关接口

在 `server.js` 中对应：

- `GET /api/backups`
- `GET /api/backups/:backupId`
- `POST /api/backups`
- `PATCH /api/backups/:backupId`
- `DELETE /api/backups/:backupId`

### 为什么这样做

因为项目已经明确从“自动同步”切成了“手动备份 / 手动同步”，目标是避免：

- 多设备静默覆盖
- 后端状态自动回灌把本地页面改乱
- 刷新后 UI 被后台同步重新洗一遍

如果以后有人想恢复自动同步，必须先重新设计冲突策略，不要直接改回去。

## 5. 备份数据结构和约束

### `user_backups`

当前约束：

- 每个用户最多保留最近 3 条
- 每条备份包含完整状态 JSON
- 备份支持 `name`
- 允许重命名和删除

### 默认命名

后端会用时间生成默认名，前端允许用户在列表里重命名。

如果要调整命名规则，优先修改：

- `sanitizeBackupName(...)`
- `formatBackupName(...)`

## 6. 图标缓存策略

图标相关是最近一轮优化重点。

### 当前优先级

1. 本地缓存
2. 服务端共享缓存
3. 外部 favicon / icon 源
4. 默认兜底图标

### 目标

- 避免弱网环境下新用户反复拉第三方站点图标
- 避免同一个坏图标源反复抖动
- 让当前用户机器一旦成功解析到图标，就能提升到服务端共享缓存

### 前端重点函数

- `loadIconSourceCache()`
- `persistIconSourceCache()`
- `mergeServerDefaultIconCache(...)`
- `enqueueServerIconPromote(...)`
- `flushPendingIconPromoteHosts()`
- `createIconSourceCandidates(...)`
- `renderEngineButtonIcon(...)`

### 后端重点逻辑

- `app_icon_cache` 表
- `GET /api/icon-cache`
- `POST /api/icon-cache/promote`
- 图标内容校验逻辑，避免把 HTML 错页缓存成图标

接手时注意：

- 不要只看前端图标加载失败，要同时检查本地缓存、服务端缓存、外部源回退顺序

## 7. 背景策略

背景图现在做了两件事：

1. 本地快照
- 避免刷新时先看到错误默认图，再跳回真实背景

2. 仅在背景配置变化时刷新
- 普通标签/分类改动不应触发背景重载

前端重点逻辑：

- `loadPersistedBackgroundSnapshot()`
- `persistBackgroundSnapshot(...)`
- `buildBackgroundRefreshKey(...)`
- `refreshBackgroundNow(...)`
- `scheduleNextBackgroundSwitch()`

接手时注意：

- 如果你改背景逻辑，务必同时检查首屏快照恢复，否则很容易重新引入“先闪一张错图”的问题

## 8. 设置页结构

设置页目前分成 5 个大模块：

1. 基础信息
2. 背景图
3. 搜索引擎
4. 标签分类
5. 搜索历史

右侧快速滚动条：

- 滑块逻辑保留原实现
- 轨道上的 4 条浅色横杠按这 5 个模块的真实位置动态对齐
- 这些横杠只作视觉标记，不能点击

如果修改设置区结构，必须同步检查：

- `data-trail-section` 标记
- `updateSettingsQuickScroll()`
- `updateSettingsQuickGuides(...)`
- 右侧轨道样式

## 9. 确认弹层和局部遮罩

项目已经移除了浏览器原生 `confirm`。

现在统一使用自定义确认弹层，支持：

- 普通确认
- 输入框确认（例如重命名备份）
- 局部毛玻璃遮罩

### 相关前端函数

- `openConfirmDialog(...)`
- `resolveConfirmDialog(...)`

### 遮罩规则

- 不额外糊整屏
- 只糊当前操作来源区域
  - 备份操作糊备份弹层
  - 设置操作糊设置抽屉

这是有意的视觉约束，不要随手改回全屏遮罩。

## 10. 后端主要表

建议接手者先在 `server.js` 里看建表逻辑。

当前主要表：

- `users`
- `sessions`
- `user_state`
- `user_backups`
- `app_state`
- `app_icon_cache`

### 各自职责

- `users`
  - 用户账号
- `sessions`
  - 登录态
- `user_state`
  - 用户主状态
- `user_backups`
  - 手动备份记录
- `app_state`
  - 后端默认模板，用于新用户初始状态
- `app_icon_cache`
  - 共享图标缓存

## 11. 默认模板机制

当前新用户默认布局不是死写在前端里，而是优先来自后端 `app_state`。

这意味着：

- 你可以把当前较成熟的布局和设置提升为平台默认模板
- 之后新注册用户会直接继承这份模板

接手时注意：

- 如果你改默认模板，不只是改 `defaultState`
- 还要确认 `app_state` 的读写逻辑是否符合预期

## 12. 修改时的联动检查清单

### 如果改备份/同步

同时检查：

- `public/index.html` 里的备份弹层
- `public/app.js` 里的状态按钮、弹层函数、状态文案
- `server.js` 的备份路由和备份表
- `SYNC_META_STORAGE_KEY` 的写入逻辑

### 如果改背景

同时检查：

- `public/index.html` 首屏背景预载脚本
- `BACKGROUND_SNAPSHOT_STORAGE_KEY`
- `refreshBackgroundNow(...)`
- 背景 provider 对应设置项显隐

### 如果改图标

同时检查：

- 本地图标缓存
- 服务端图标缓存
- 失败冷却
- 搜索引擎按钮图标和标签图标是否共用逻辑

### 如果改设置页

同时检查：

- 分区标题
- 右侧轨道滑块
- 4 条分界横杠
- 设置抽屉内部滚动同步

### 如果改确认交互

同时检查：

- 自定义确认弹层
- 局部毛玻璃遮罩
- 是否误引入浏览器原生 `alert/confirm/prompt`

## 13. 当前已知限制

这些不是 bug，而是当前产品决策：

1. 没有自动多设备同步
2. 没有并发版本控制
3. 搜索历史不进后端
4. 前后端目前仍是单文件主控，模块化程度一般
5. 没有自动化测试

对于当前项目体量，这些都可以接受。但如果以后要扩大用户规模，优先补：

- 状态版本控制
- 更细粒度的局部重渲染
- 自动化回归测试

## 14. 建议的接手顺序

给下一个开发者的建议顺序：

1. 先跑起来项目
2. 手动走一遍登录、设置、备份、同步、重命名、删除流程
3. 看 `OPTIMIZATION_LOG.md`
4. 再开始改代码

不要一上来就改同步策略或重构 `app.js`，先理解现在为什么改成“本地优先 + 手动备份/同步”。
