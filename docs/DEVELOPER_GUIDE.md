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
| `sync-core.js` | 同步数据模型、排序键、diff / apply（**前后端共用**，服务端 `require` 同一个文件） |
| `icons.js` | 图标来源链、本地/服务端缓存、失败冷却、页面图标发现 |
| `store.js` | `applyState` / `updateState`、本地快照、数据清洗、设置值应用到页面 |
| `background.js` | 背景（Bing / Picsum / 自定义）、按小时轮换、背景快照 |
| `search.js` | 搜索框、引擎按钮/菜单、提交、本地历史、联想词、下拉键盘导航 |
| `tag-board.js` | 首页标签区渲染、折叠展开、标签名缩放、标签搜索、滚动淡出兜底 |
| `drag.js` | 标签与整行分类的指针拖动（iOS 风格） |
| `settings.js` | 设置抽屉各分区、编辑器、导航、快速滚动条、保存 |
| `quick-add.js` | 首页「＋」快速添加弹窗 |
| `backup.js` | 云端备份页、右上角同步状态 |
| `sync.js` | 同步引擎：本地同步存储、推送 / 拉取、跨标签页、页面隐藏时 keepalive |
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
- `SYNC_STORE_KEY`（`mx_sync_v2`）
  - 同步存储：服务端确认的 doc + `rev` + 待发送的 op，所有标签页共用
- `SYNC_META_STORAGE_KEY`
  - 旧版本的「未备份」标记，只在升级后第一次启动时读一次并删除
- `ICON_CACHE_STORAGE_KEY`
  - 本地图标源缓存

### 启动流程

`boot()` 的当前逻辑：

1. 先绑定事件
2. 优先读取本地状态快照
3. 有快照就直接渲染，没有就用访客态
4. 再检查登录状态
5. 如果当前是未登录，则清理登录态快照并退回访客态
6. 已登录：`startUserSync()`——本机有同步存储就先按它渲染再增量拉取；没有就拉完整 doc
7. 渲染右上角同步状态

关键点：

- 从旧版本升级：如果旧的「未备份」标记还在，本地快照和服务端 doc 的差异会作为 op 补发一次

## 4. 同步模型（字段级同步 + 备份）

这是当前项目最重要的设计约束。

### 为什么不是整份上传

以前是「整份状态上传、后写覆盖」：一个过期的窗口 / 设备随便改一点，就会把整份旧数据写回去，覆盖别人的改动。现在每个标签、分类、引擎都有自己的 id，每个设置项是一个独立路径，改动只以「改了哪个对象的哪个字段」的形式上传。

### 数据模型（`public/js/sync-core.js`）

- 同步的数据存成 doc：`categories` / `links` / `engines` 按 id 存成对象，`settings` 按路径存（`background.provider`）
- 位置用**分数排序键** `$k`（字符串，按字典序排）：移到两个元素之间就取两者中间的键，只改被移动的那一项；标签所属分类是 `$p`
- 删除留墓碑 `tomb`，删除优先：A 删、B 同时改名，结果是删除
- `settings.historyLimit` 是本机偏好，不同步
- 页面 UI 仍然用普通数组（`appState.categories[].links[]`），`stateFromDoc` / `diffStateToOps` 负责互转，所以拖拽、设置、快速添加等代码不需要知道同步的存在

### 冲突规则

- 服务端按到达顺序逐条应用 op，**按字段**后写覆盖：A 改名、B 移动同一个标签，两者都生效；A、B 改同一个字段，以后到的为准
- 同时在同一位置插入：两个都保留（键相同时按 id 排）
- 同一项被同时移动：以后到的为准
- 分类被删除时，别人同时往里加的标签会被丢弃
- 服务端和客户端运行同一份 `applyOps`，服务端存的是清洗后的 op，所以所有客户端最终一致

### 客户端流程（`public/js/sync.js`）

- 本地存储 `mx_sync_v2`：`base`（服务端确认的 doc）+ `rev` + `outbox`（正在发送的一批，带 `batchId`）+ `pending`（之后的改动）。页面显示的是 `base + outbox + pending`
- `updateState()`（登录时）→ `commitLocalStateChange()`：用 diff 算出 op，放进 `pending`，1.5 秒后推送；推送回包里带着其他人的改动，一次往返完成合并
- 拉取（`GET /api/sync?since=rev`，没有改动时回包约 50 字节）：页面变为可见 / 获得焦点 / 恢复联网时；用户点击或按键时如果距上次同步超过 30 秒；页面可见但一直没人操作时每 10 分钟兜底一次。不操作就几乎没有请求，后台标签页不轮询。推送的回包本身就带着别人的改动，也算一次同步
- 页面隐藏 / 关闭：把 `pending` 转成 `outbox` 并用 `keepalive` 发出；`batchId` 幂等，之后重发不会重复应用
- 多标签页：同步存储放在 localStorage，其他标签页通过 `storage` 事件直接重绘；推送 / 拉取用 `navigator.locks` 串行，避免两个标签页同时发同一批
- 设置抽屉：打开时记下当时的 doc（`settingsDraftBaseDoc`），保存时只对比草稿和这份 doc，所以只提交在抽屉里改过的字段，期间别处的改动不会被旧草稿覆盖
- 拖拽中收到远端更新会等拖拽结束再重绘
- 离线时改动留在本机，每 15 秒重试

### 备份（找回用，不参与同步）

- **手动备份**：备份页「立即备份」创建，最多 10 条；可重命名、删除
- **自动快照**：服务端在一批改动写入前，如果最近快照已超过 1 小时，就先存一份改动前的状态（内容相同跳过），最多 10 份；恢复备份前一定会存一份
- 两类分开计数，自动快照不会挤掉手动备份
- 恢复：`POST /api/backups/:id/restore`，服务端写入一个 `reset` 批次，所有设备下次同步时切换过去；客户端恢复前会先把待发送的改动推上去

### 右上角状态按钮

`getSyncStatusInfo()` 统一生成状态按钮和备份页状态卡的文案：

- `已同步 · 时间`
- `待同步`（有改动，1.5 秒内上传）
- `同步中…`
- `未同步 · 稍后重试` / `暂时离线`
- 未登录提示

普通成功/失败消息统一走 `showNotice()` 的 toast。

### 相关代码

- `public/js/sync-core.js`：`docFromState()` / `stateFromDoc()` / `diffStateToOps()` / `applyOps()` / `keyBetween()`
- `public/js/sync.js`：`startUserSync()` / `commitLocalStateChange()` / `pushSync()` / `pullSync()` / `syncNow()` / `flushSyncOnHide()`
- `public/js/backup.js`：备份页、`handleRestoreBackup()`、`renderSyncStatus()`
- `server.js`：`GET` / `POST /api/sync`、`sanitizeSyncOp()`、`applySyncBatch()`、`maybeSnapshotBeforeChange()`、`restoreSyncFromState()`
- 数据表：`user_sync`（doc + rev）、`user_sync_log`（最近 500 批 op）
- 测试：`npm test`（`tests/sync-core.test.js`，覆盖排序键、往返一致、并发改名 + 移动、删除优先等）

## 5. 备份数据结构和约束

### `user_backups`

当前约束：

- 手动备份每个用户最多保留 10 条，自动快照最多 10 条（`kind` 列区分）
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
