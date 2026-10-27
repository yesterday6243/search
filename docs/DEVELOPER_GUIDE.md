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

- 这里的 DOM id 集中在 `public/js/state.js` 顶部获取，再被各功能文件直接引用
- 任何 id/class 改动，都要同步检查 `public/js/` 和 `styles.css`

### `public/styles.css`

负责：

- 全站视觉样式
- 搜索区、标签卡片、设置抽屉、备份弹层
- 拖拽高亮、局部毛玻璃遮罩、确认弹层样式
- 设置右侧快速滚动条和模块分界标记

接手时注意：

- 近期 UI 调整主要集中在这里
- 设置页和备份弹层按钮现在统一走冷白玻璃体系，不要再单独引入黄橙 CTA

### `public/js/`（原 `public/app.js`，已按功能拆分）

前端按功能拆成多个**普通脚本**（不是 ES 模块），共享同一个全局作用域，按 `index.html` 里的顺序加载：

| 文件 | 负责 |
| --- | --- |
| `utils.js` | 格式化、转义、id、URL 解析、`fetchJson` |
| `icons.js` | 图标来源链、本地/服务端缓存、失败冷却、页面图标发现 |
| `store.js` | `applyState` / `updateState`、本地快照、数据清洗、设置值应用到页面 |
| `background.js` | 背景（Bing / Picsum / 自定义）、按小时轮换、背景快照 |
| `search.js` | 搜索框、引擎按钮/菜单、提交、本地历史、联想词、下拉键盘导航 |
| `tag-board.js` | 首页标签区渲染、折叠展开、标签名缩放、标签搜索、滚动淡出兜底 |
| `drag.js` | 标签与整行分类的指针拖动（iOS 风格） |
| `settings.js` | 设置抽屉各分区、编辑器、导航、快速滚动条、保存 |
| `quick-add.js` | 首页「＋」快速添加弹窗 |
| `backup.js` | 云端备份页、右上角备份状态 |
| `auth.js` | 登录 / 注册 / 退出、加载用户数据 |
| `dialogs.js` | 遮罩、确认弹窗、toast |
| `state.js` | DOM 引用、常量、共享可变状态（`appState`、`authState` 等） |
| `main.js` | `bindEvents()` 与 `boot()`，最后加载 |

规则：

- 功能文件里只写函数声明（和少量字面量变量），**不要在加载时调用其他文件的函数**；需要初始化的逻辑放进 `boot()` / `bindEvents()`
- `state.js` 在功能文件之后、`main.js` 之前加载（它会调用 `loadIconSourceCache` / `loadPersistedBackgroundSnapshot`）
- 新增文件时在 `index.html` 按顺序加 `<script src="/js/xxx.js">`，版本号由服务端自动加
- 为什么不是 ES 模块：大量顶层 `let` 状态被多个函数直接重新赋值，改成 `import/export` 需要整体改写；有自动化测试后再逐步迁移

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

- 登录且本机没有未备份改动时，启动会加载云端**最新**的一份备份（自动备份最新版本与最新手动备份里 `createdAt` 较新的那份）
- 本机有未备份改动时用本地快照，并重新排队自动备份
- 以前这里只看最新**手动**备份，会把刚自动备份过的新数据回退成旧的手动备份，不要改回去

## 4. 备份 / 同步模型（自动备份 + 手动备份）

这是当前项目最重要的设计约束。

### 当前规则

- 本地所有修改先写本地
- 不自动从云端拉取覆盖本地（恢复永远是用户手动操作）
- **自动备份**：每次本地改动（`markSyncDirty()`）都会重置一个 30 秒计时器；30 秒内没有新改动时，把当前状态写成一个新的自动备份版本（带时间戳，保留最近 20 个，内容相同只刷新时间）。频繁修改只会在最后一次修改 30 秒后提交一次
- 自动备份请求进行中又有改动：请求完成后不清除「未备份」状态，并立即再排一次
- 切到后台 / 关闭页面（`visibilitychange` / `pagehide`）时立即提交待处理的自动备份（`keepalive` 请求）；退出登录前也会先提交
- 失败后 60 秒重试；重新打开页面时如果还有未备份改动，会重新排队
- **手动备份**：备份页「立即备份」创建，最多保留 10 条，超出时删除最早的一条；可重命名、删除
- 自动备份最新版本固定显示在备份列表第一行，下面可展开历史版本；只能恢复，不能重命名或删除

### 多窗口 / 多标签页

- 每个标签页有自己的内存状态。`store.js` 的 `handleCrossTabStorage` 监听 `storage` 事件：其他标签页写入本地快照（`mx_state_snapshot_v1`）且 `updatedAt` 更新时，本页直接采用，并取消本页待提交的自动备份（由改动的那页负责提交）
- 拖拽进行中收到更新会等拖拽结束后再应用
- 设置页打开期间其他窗口改了数据：提示一次，保存时弹确认，避免用旧草稿覆盖
- 不同设备之间仍是后写覆盖，靠自动备份历史版本找回

### 右上角状态按钮语义

右上角按钮现在只表示备份状态，不再承担普通通知。

可能状态：

- `待自动备份`（有改动，30 秒计时中）
- `正在自动备份…`
- `已自动备份 · 时间`
- `未备份改动`（未在计时，例如自动备份失败等待重试前）
- `已备份数据 · 时间`（手动备份）
- `已同步数据 · 时间`
- 未登录提示

普通成功/失败消息统一走 `showNotice()` 的 toast。

### 前端相关函数

在 `public/js/backup.js` 中重点看这些：

- `markSyncDirty()` / `scheduleAutoBackup()` / `runAutoBackup()` / `flushAutoBackup()`
- `renderAutoBackupRow()`
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

- `public/boot.js` 首屏背景预载脚本（原 `index.html` 内联脚本，已外置以满足 CSP）
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

### 如果改静态资源引用（缓存与版本号）

`server.js` 在返回 `index.html` 时，把其中所有本地 `src="/..."` / `href="/..."` 改写成 `/文件?v=<内容哈希前 10 位>`：

- 带 `?v=` 的请求：`Cache-Control: public, max-age=31536000, immutable`（浏览器一年内不再请求）
- `index.html` 与不带版本号的文件：`Cache-Control: no-cache`（每次用 ETag 校验，未变化返回 304）
- 文件内容一变哈希就变，部署后用户自动拿到新文件；哈希按文件 mtime 缓存，开发时改文件即时生效
- 新增资源时直接在 `index.html` 里写 `/xxx.js` 即可，不要手写 `?v=`
- 只有 `index.html` 里的引用会加版本号；JS 里动态拼接的资源路径（如图标）走 `no-cache` 校验

### 如果加脚本、事件或外部资源（CSP）

`server.js` 的 `setSecurityHeaders` 对所有响应设置 CSP 与常规安全头。新增代码时：

- 不要写内联 `<script>` 或 `onclick=""` / `onload=""` 这类内联事件属性，会被 `script-src 'self'` 拦截；用 `addEventListener`
- 图标 `<img>` 的加载/失败由 `document` 上捕获阶段的 `load` / `error` 监听统一处理（标记 `data-icon-managed`），不要再加内联 `onload/onerror`
- 不要用 `eval` / `new Function`
- 前端 `fetch` 只能请求本站（`connect-src 'self'`）；需要第三方数据时走后端接口代理
- 内联 `style=""`（如 CSS 变量）可以用；图片可以来自任意来源
- 确实需要新的外部脚本 / 字体 / 接口来源时，修改 `CONTENT_SECURITY_POLICY` 并在这里记录原因

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
