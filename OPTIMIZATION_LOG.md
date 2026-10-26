# Optimization Log

## Usage Rule
- 每次开始修复/优化前，先快速检查本文件，避免同类问题回归。
- 每次完成修复/优化后，追加一条记录，写明：
  - 现象
  - 根因
  - 处理方案
  - 涉及文件

## Recent Records

### 2026-10-27 - 「＋」卡片展开时先透明后变毛玻璃
- 现象：
  - 展开分类时「＋」先是透明的，动画结束后变成和右侧展开按钮一样的毛玻璃。
- 根因：
  - 「＋」使用 `backdrop-filter`；展开动画期间所在区域有 `clip-path`，会成为毛玻璃的「背景根」，此时取不到背后的背景图，模糊无效，看起来透明；动画结束后才恢复毛玻璃。
- 处理方案：
  - 「＋」去掉毛玻璃，始终保持虚线框 + 浅色透明底，与毛玻璃展开按钮区分，也少一个模糊开销。
- 涉及文件：
  - `public/styles.css`

### 2026-10-27 - 展开/收起：上方不动、图标提前加载、去掉闪烁
- 现象：
  - 有时收起后整个上半部分跟着移动，右侧按钮位置也变了，并伴随「闪一下」。
  - 展开后才开始加载图标。
- 根因：
  - 页面滚到靠下时收起，页面高度变短，浏览器把滚动位置强制收回到新的最大值，屏幕上所有内容（包括点的这一行）瞬间位移（复现：190px）。
  - 上一轮把标签图标改为懒加载，折叠行里的图标要等露出来才下载。
  - 收起动画结束时，裁切动画先结束、清理稍后执行，可能有一帧露出被隐藏的标签。
- 处理方案：
  - 滚动预留：收起前在标签区下方放一个不可见占位，保持页面高度，避免滚动位置被收回；用户往上滚时逐步归还，占位始终在视口下方，可见内容不移动（复现场景位移 190px → 0）。
  - 图标：可见图标仍优先加载，折叠行的图标在浏览器空闲时立即补齐（约 1.5 秒内）；展开时该行图标立即加载。
  - 收起裁切动画 `fill: forwards`，与清理同时移除，无空白帧。
- 涉及文件：
  - `public/js/tag-board.js`

### 2026-10-27 - 展开/收起去掉淡入淡出，改为抽屉式裁切
- 现象：
  - 展开时新标签淡入并依次错开出现，最后一个约半秒后才完全显示；收起时标签淡出，并短暂与下方滑上来的行重叠。
- 根因：
  - 淡入淡出延迟了用户主动请求的内容，也表达不了「这一行被拉开」的空间关系；半透明期间标签已可点击，看得见与点得着不一致。
- 处理方案：
  - 标签全程不透明：展开时这一行的裁切边缘（`clip-path`）从原高度打开到完整高度，收起时从完整高度收回；与下方各行的平移使用同一时长与缓动，边缘始终贴着下一行（实测全程间距恒定 24px）。
  - 收起期间保留溢出绘制，由裁切负责遮住；动画结束或被再次点击打断时清理。
- 涉及文件：
  - `public/js/tag-board.js`

### 2026-10-27 - 展开分类掉帧（靠上的分类更明显，线上比本地明显）
- 现象：
  - 本地展开流畅；部署后展开掉帧，且展开越靠上的分类越卡，靠下的流畅。
- 根因：
  - 展开动画是对 `max-height` 做过渡：每一帧下方所有分类行都会移动，浏览器每帧都要重排并重绘它们。靠上的分类下面行数多，所以更卡。
  - 实测每帧重排只有约 0.1ms，真正的开销是重绘：移动的行要重绘，压在其上的毛玻璃也要重新模糊。
  - 线上仍是旧版本（GitHub 停在 `c8291de`），带有全屏 `backdrop-filter`：行在移动时整屏（约 200 万像素）每帧重新模糊。本地是新版本（全屏模糊已改为预渲染），所以本地流畅。
- 处理方案：
  - 展开 / 收起改为 FLIP：布局只变化一次，下方各行用 `transform` 从原位置滑到新位置（合成线程，不重排不重绘）；展开时新露出的标签淡入并轻微错开，收起时多余标签在下方行滑上来的同时淡出。
  - 删除 `max-height` 过渡；连续快速点击会取消上一次动画，不会残留位移。
  - 需要部署最新代码才能在线上生效。
- 涉及文件：
  - `public/js/tag-board.js`
  - `public/styles.css`

### 2026-10-27 - 展开按钮改为箭头 + 使用流畅度优化
- 展开 / 收起：
  - 右侧「＋ / −」改为向下箭头，展开后旋转 180° 朝上（与首页「＋」添加卡片区分）；无可展开内容时仍显示小圆点；尺寸按 `--tile-size` 比例。
- 流畅度（问题与处理）：
  - 背景遮罩使用全屏 `backdrop-filter: blur(8px)`，浏览器在任何内容变化时都要重算整屏模糊 → 改为在静态图层上用 `filter: blur()` 渲染背景的模糊副本（只栅格化一次），「背景清晰度」设置效果不变。
  - 每个标签、网格、图标都有 `transform: translateZ(0)`，强制生成数百个合成层 → 删除。
  - 任何状态变化（如切换搜索引擎）都会重建整个标签区 → 只有分类数据或标签搜索词变化时才重建（切换引擎 1.2ms，不再重建）。
  - 标签名自适应每缩小 1px 就强制一次重排 → 改为批量测量、按比例一次算出字号（187 个标签 384ms → 13ms，结果一致）。
  - 标签图标改为 `loading="lazy"`：折叠行和首屏以下的图标不再在启动时抢网络（测试面板 179 个图标首屏只请求约 60 个）；图标发现跳过尚未开始加载的图标。
- 涉及文件：
  - `public/styles.css`
  - `public/js/tag-board.js`
  - `public/js/store.js`
  - `public/js/icons.js`

### 2026-10-26 - 标签区几何统一按比例缩放（以最大尺寸为准）+ 手机一行 4 个
- 现象：
  - 不同尺寸下圆角比例不一致（各断点写死 26 / 22 / 18 / 16px 等），图标形状与最大尺寸有差距。
  - 手机一行只能放 3 个标签，图标偏大。
- 根因：
  - 每个断点各自写死尺寸、圆角、内边距、字号，比例随断点漂移。
- 处理方案：
  - 以最大尺寸（92px 标签）为基准测出比例，所有形状改为 `--tile-size` 的倍数：标签圆角 0.283、图标 0.370（圆角 0.412，悬停 0.0217）、分类名/展开按钮 0.783（圆角 0.278）、间距、侧栏、「＋」卡片、展开图标线条等。
  - 断点只改 `--tile-size`（手机再改列数），删除所有断点里的尺寸/圆角覆盖。
  - 手机：侧栏与间距也按比例，标签尺寸由屏幕宽度解出（宽度 = 列数·t + 2·侧栏·t + 2·侧间距·t + (列数−1)·间距·t），侧栏比例收紧到 0.8；360px 以上一行 4 个，350px 以下 3 个；页边距 12px。
  - 文字：标签名与分类名从比例字号开始，放不下时由 JS 缩小（不换行），最小 10px。
  - 拖动浮层与淡出副本在分类行外，显式传入 `--tile-size` 保持比例。
  - 验证（1600 / 1024 / 768 / 600 / 414 / 375 / 360 / 320）：各比例与最大尺寸一致；无横向溢出；分类名都能放下。
- 涉及文件：
  - `public/styles.css`
  - `public/js/drag.js`
  - `public/js/tag-board.js`

### 2026-10-26 - 备份拆分：自动备份 + 手动备份
- 需求：
  - 改动后自动备份；频繁改动有 30 秒冷却，30 秒内没有新改动时一并提交；备份页第一行固定显示自动备份。
- 处理方案：
  - 后端：`user_backups` 新增 `kind` 列（迁移老数据为 `manual`）；新增 `PUT /api/backups/auto` 覆盖写入每个用户唯一的自动备份；手动备份的列表、上限清理、重命名、删除只作用于 `manual`；列表接口返回 `autoBackup`。
  - 前端：`markSyncDirty()` 触发 30 秒防抖计时；请求期间的新改动会再提交一次；切后台 / 关闭页面用 `keepalive` 立即提交，退出登录前先提交；失败 60 秒后重试；重新打开页面时继续未完成的自动备份。
  - 状态按钮增加「待自动备份」「正在自动备份…」「已自动备份 · 时间」；备份页第一行固定自动备份（只能恢复），手动计数显示为「手动 N / 10」。
  - 验证：三次改动（0 / 8 / 16 秒）只在 46 秒时提交一次且内容为最新；隐藏页面立即提交；11 条手动备份只保留 10 条且自动备份不受影响；自动备份不可重命名 / 删除、可恢复；用本地库副本验证迁移。
- 涉及文件：
  - `server.js`
  - `public/js/backup.js`
  - `public/js/state.js`
  - `public/js/main.js`
  - `public/js/auth.js`
  - `public/index.html`
  - `public/settings-themes.css`
  - `docs/API.md`
  - `docs/DEVELOPER_GUIDE.md`

### 2026-10-26 - 小尺寸下标签悬浮上移被裁掉（彻底修复）
- 现象：
  - 最大尺寸正常；其余尺寸下鼠标悬停时标签上移 4px，顶部被切掉一截。
- 根因（多层补丁互相抵消）：
  - 折叠分类用 `max-height` + 裁切隐藏多余行，同时裁掉了上移的部分。
  - 桌面端的补丁是「折叠行加 8px 顶部内边距 + 分类名和展开按钮下移 8px 对齐」，导致折叠行与普通行布局不一致。
  - 小尺寸为了对齐又把内边距清零，裁切问题回来了。
- 处理方案：
  - 所有分类行统一在裁切框内预留 `--lift-room`（8px 顶部内边距），并用等量负外边距抵消：标签位置在折叠/非折叠、所有断点下完全一致，上移始终有空间。
  - 删除 `--category-hover-safe-top` 下移补丁和小尺寸里的覆盖规则。
  - 验证（1600 / 1280 / 1024 / 768 / 600 / 414 / 320）：上移后的标签顶部都在裁切框内；折叠行与普通行标签偏移均为 0；分类名与首行标签居中对齐；隐藏行不会露出；展开时首行不位移。
- 涉及文件：
  - `public/styles.css`

### 2026-10-26 - 有图标的网站显示「:]」占位图
- 现象：
  - 部分网站明明有图标，标签却显示一个「:]」笑脸，且一直不更新。
- 根因（环环相扣）：
  - 「:]」是 unavatar.io 的 logo：它对不认识的网站返回 200 的占位图；icon.horse 同理（按域名生成占位图）。
  - 浏览器把这张 200 图片当成成功结果缓存；服务端「共享图标」又把它存进全站缓存，所有用户都拿到占位图。
  - 缓存里已有图标，页面图标发现就不再重试；失败记录还会阻止 7 天内重试。
  - 服务端按响应头/扩展名判断图片类型：`.ico` 常以 `octet-stream` / `text/plain` 返回，`favicon.ico?v=2` 这类地址也识别失败。
- 处理方案：
  - 前端图标链移除 icon.horse、unavatar；校验函数把这两个来源及 unavatar logo 视为「无图标」，已缓存的会被自动清掉。
  - 服务端：按文件字节识别图片类型；拒绝 unavatar 占位图（取图、共享、发现三处）；启动时清理共享缓存里已有的占位图。
  - 图标发现增加 Web App Manifest 图标与根路径兜底（`/apple-touch-icon.png`、`/favicon.svg`、`/favicon.ico`、`/favicon.png`），页面本身拒绝访问时也会尝试；请求使用浏览器 UA。
  - 失败记录 key 升级为 `mx_icon_discover_v2`，之前失败的网站会重新尝试。
  - 验证：12 个国内常见网站（小红书、千问、元宝、微信读书、中科大测速、智慧教育平台等）全部识别成功；占位图启动清理生效。
- 涉及文件：
  - `server.js`
  - `public/js/icons.js`
  - `public/js/state.js`

### 2026-10-21 - 拆分 app.js 为按功能的脚本
- 现象：
  - `public/app.js` 5832 行，所有功能混在一个文件里，难以定位和维护。
- 根因 / 取舍：
  - 原计划用原生 ES 模块，但约 150 个顶层共享变量被多处直接重新赋值（如 `appState = …`），改成 `import/export` 需要重写大部分代码，在没有自动化测试的情况下风险过高。
- 处理方案：
  - 用脚本把 247 个函数按功能机械拆分到 `public/js/` 下 14 个普通脚本（共享全局作用域），代码本身不改；校验每一行原代码恰好出现一次（0 缺失 / 0 多余）。
  - 加载顺序：功能文件（只有函数声明）→ `state.js`（DOM 引用、常量、状态）→ `main.js`（`boot()`）。
  - 删除拖动重写后遗留的无用常量 `CATEGORY_DROP_*`。
  - 回归：247 个函数全部存在、控制台无脚本错误；登录用户冒烟测试覆盖设置保存、备份、快速添加、标签/整行拖动、联想词、搜索提交。
- 涉及文件：
  - `public/js/*.js`（新增）、`public/app.js`（删除）
  - `public/index.html`
  - `docs/DEVELOPER_GUIDE.md`
  - `README.md`

### 2026-10-21 - 静态资源内容哈希版本号 + 长期缓存
- 现象：
  - JS / CSS 没有缓存策略：要么每次都下载，要么部署后浏览器仍用旧文件。
- 处理方案：
  - 服务端渲染 `index.html` 时把本地资源引用改写为 `?v=<sha256 前 10 位>`，无需构建工具或改文件名。
  - 带版本号的资源一年 `immutable` 缓存；`index.html` 与未带版本号的文件 `no-cache` + ETag 校验。
  - 哈希按文件 mtime/size 缓存，改文件即刻换新哈希；`/` 与前端路由的兜底路由共用同一渲染逻辑。
  - 路径限制在 `public/` 内；`../` 之类的请求只会落到兜底路由返回首页。
- 涉及文件：
  - `server.js`
  - `docs/DEVELOPER_GUIDE.md`

### 2026-10-21 - 首页「＋」快速添加标签
- 现象：
  - 添加标签必须进入设置页，步骤多。
- 处理方案：
  - 每个分类网格末尾渲染「＋」卡片（`.tag-add-card`，尺寸与标签一致，随断点变化；标签搜索过滤时不显示）。
  - 点击打开主题弹窗（手机为底部抽屉）：粘贴网址后防抖 450ms 调 `POST /api/site-meta` 识别名称与图标，名称可修改；支持 `github.com` 这类省略协议的输入。
  - 校验无效网址、同分类重复网址；按回车时若名称未识别完成，最多等待 3 秒。
  - 添加后：若该分类折叠且新标签在隐藏行，自动展开；新标签弹入动画；标记为未备份改动。
  - 「＋」不参与拖动，但计入折叠行数、参与让位动画；拖入其他分类时落在「＋」之前。
  - 后端把图标发现拆为 `fetchPageDocument` + `resolvePageIconAsDataUrl`，`discover` 与 `site-meta` 共享。
- 涉及文件：
  - `server.js`
  - `public/app.js`
  - `public/index.html`
  - `public/styles.css`
  - `public/settings-themes.css`
  - `docs/API.md`

### 2026-10-21 - 搜索联想 + 下拉键盘导航
- 现象：
  - 输入时只能看到本地历史，没有搜索引擎联想词；下拉列表不支持键盘选择。
- 处理方案：
  - 新增 `GET /api/suggest` 后端代理（CSP 只允许同源）：按当前引擎选择 Google / Bing / 百度 / DuckDuckGo，失败回退，服务端缓存 10 分钟，按 IP 每分钟 120 次。
  - 下拉面板：有输入时显示最多 4 条匹配历史 + 联想词；已输入部分常规、补全部分加粗；与输入完全相同的联想词过滤掉。
  - 联想行：点击直接搜索；右侧 ↖ 填入输入框并继续联想。
  - 新结果返回前保留上一轮仍匹配的联想词，避免面板闪烁；过期响应丢弃，输入防抖 140ms。
  - ↑/↓ 在历史与联想之间移动并在输入框预览，Esc 恢复原输入并关闭。
  - 设置「04 搜索历史」新增「搜索联想」开关（`settings.searchSuggestions`，默认开启，随设置同步）。
- 涉及文件：
  - `server.js`
  - `public/app.js`
  - `public/index.html`
  - `public/styles.css`
  - `public/settings-themes.css`
  - `docs/API.md`

### 2026-10-21 - 安全响应头与内容安全策略（CSP）
- 现象：
  - 响应没有任何安全头；页面大量拼接 HTML，一旦出现注入没有兜底。
- 根因：
  - 首屏背景预载是内联 `<script>`；图标 `<img>` 使用内联 `onload` / `onerror`，这两者都会阻止启用严格 CSP。
- 处理方案：
  - 内联脚本外置为 `public/boot.js`（仍在 `<head>` 同步加载，首屏行为不变）。
  - 图标加载/失败改为 `document` 捕获阶段统一监听（`data-icon-managed` 标记）。
  - 新增 `setSecurityHeaders`：CSP（`script-src 'self'`、`object-src 'none'`、`frame-ancestors 'none'` 等）、`nosniff`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`、`COOP`，HTTPS 下加 HSTS。
  - 验证：首页、设置页各分区、登录/备份弹窗均无 CSP 违规；图标加载与失败回退链正常。
- 涉及文件：
  - `server.js`
  - `public/boot.js`
  - `public/index.html`
  - `public/app.js`
  - `docs/DEVELOPER_GUIDE.md`

### 2026-10-21 - 登录防暴力破解 + 启动失败静默退出修复
- 现象：
  - `/api/auth/login` 可无限次尝试密码。
  - 不存在的账号几乎立即返回，真实账号要等待 scrypt，可通过耗时探测账号是否存在。
  - 端口被占用时日志仍打印「running」，随后进程以 0 静默退出。
- 根因：
  - 登录接口没有任何限流；Express 未配置 `trust proxy`，nginx 后面所有请求的 `req.ip` 都是代理地址。
  - Express 5 把 listen 错误传给 `app.listen` 回调，原代码忽略了该参数。
- 处理方案：
  - 按 IP 与账号双维度限流：15 分钟窗口，第 5 次失败起等待时间翻倍，第 10 次锁定至窗口结束；返回 429 + `Retry-After`。
  - 新增 `TRUST_PROXY`（默认 `loopback, uniquelocal`），只信任本机/内网代理的 `X-Forwarded-For`。
  - 不存在的账号执行一次假哈希校验，统一响应耗时。
  - `app.listen` 回调处理错误，打印原因并以 1 退出。
- 涉及文件：
  - `server.js`
  - `docs/API.md`
  - `README.md`

### 2026-10-21 - 分类整行拖动改为指针拖动（iOS 风格）
- 现象：
  - 分类拖动使用浏览器原生拖拽，只有一张静态拖影和一条蓝色插入线，没有整行移动动画。
- 根因：
  - HTML5 Drag & Drop 无法自定义跟随元素和让位动画。
- 处理方案：
  - 改为指针事件实现：整行（分类名 + 标签 + 展开按钮）抬起放大并跟随指针，锁定纵向；其他行用 FLIP 平滑让位；松手落位后保存，Esc 取消。
  - 触屏长按约 0.26 秒开始拖动；标签搜索过滤时禁用整行拖动。
  - 删除原生拖拽的落点计算、指示线及相关样式。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-10-21 - 搜索框细节：清空按钮、历史面板对齐与「搜索」按钮
- 现象：
  - 清空按钮不是正圆；历史面板总是刚好显示 8 条；面板左右与搜索框不对齐；「使用」文字无交互。
- 根因：
  - 清空按钮是 flex 子项，默认 `flex-shrink: 1` 被输入框挤压。
  - 面板高度按 66px/行计算，实际行高约 80px，恰好显示整数行。
  - 面板右边距写死 `84px`，搜索框高度改变后就错位；展开动画横向缩放也会让边缘内缩。
- 处理方案：
  - 清空按钮改为谷歌风格纯 × 图标（固定尺寸、不收缩、无底色/旋转）。
  - 行高固定 64px，面板显示 7.5 行，提示可滚动。
  - 右边距改为 `calc(var(--search-height) + 16px)`；展开动画只做纵向缩放。
  - 「使用」改为「搜索」按钮：灰色竖线分隔，悬停显示灰色圆角矩形轮廓，点击直接用当前引擎搜索；点击行其他位置仍为填入输入框。
- 涉及文件：
  - `public/app.js`
  - `public/index.html`
  - `public/styles.css`

### 2026-10-21 - 标签滚动淡出改为原生滚动驱动动画
- 现象：
  - 快速滑动时标签会先越过搜索框再消失，像是强制实现的。
- 根因：
  - 原方案在 `scroll` 事件后用 JS 逐个 `getBoundingClientRect` 并写透明度，主线程总比合成线程滚动慢至少一帧。
  - 折叠分类行使用 `overflow: hidden`，会把该行变成滚动容器。
- 处理方案：
  - 改用 CSS `animation-timeline: view()`，由浏览器在合成线程上与滚动同步淡出；不支持的浏览器自动回退到原 JS 方案。
  - 折叠行改用 `overflow: clip`（裁切效果相同，但不是滚动容器）。
- 涉及文件：
  - `public/styles.css`
  - `public/app.js`

### 2026-10-21 - 云端备份页重做 + 弹窗统一主题
- 现象：
  - 备份页仍是旧的深色 UI，信息单薄。
- 处理方案：
  - 备份页改为：状态卡（未备份改动 / 已最新 + 立即备份）、备份记录列表（最新标记、相对时间、内容摘要、大小、恢复/删除/重命名）、加载骨架屏、空状态、手机底部抽屉。
  - 登录、确认弹窗跟随设置主题色；删除类确认按钮为红色。
  - `GET /api/backups` 增加 `summary` 与 `backupLimit`。
- 涉及文件：
  - `public/index.html`
  - `public/app.js`
  - `public/settings-themes.css`
  - `server.js`
  - `docs/API.md`

### 2026-10-21 - 搜索框动效
- 现象：
  - 搜索框状态切换生硬，没有过渡。
- 根因：
  - `.search-bar` 未设置任何 `transition`。
- 处理方案：
  - 聚焦上浮 + 强调色边框与光晕、图标变色；下拉面板展开动画；切换引擎时图标弹入；尊重系统「减少动态效果」。
- 涉及文件：
  - `public/styles.css`
  - `public/app.js`

### 2026-04-06 - 同分类拖拽换位临界回归修复
- 现象：
  - 前面的标签拖到后面的标签上，会落到“后面标签的前一个位置”。
  - `1` 拖到 `2` 时会回到原位，看起来没有变化。
- 根因：
  - 同分类拖拽时，目标索引在删除源项后再计算，导致前->后场景索引偏移。
- 处理方案：
  - 先计算目标索引，再执行删除与插入，统一同分类前后拖拽规则。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 标签浮动导致顶部裁切修复（保留浮动）
- 现象：
  - 标签 hover 上浮时顶部被裁切，图标上沿会被截掉。
- 根因：
  - 分类容器在折叠状态使用了 `overflow: hidden`，而卡片 hover 使用负向位移。
- 处理方案：
  - 默认容器改为 `overflow: visible`。
  - 仅在折叠且可展开时启用裁切，并增加 2px 顶部安全空间与对应高度补偿。
- 涉及文件：
  - `public/styles.css`

### 2026-04-06 - 新增标签透明度设置（可同步）
- 现象：
  - 用户需要可调标签透明度，满足不同背景图下的视觉偏好。
- 根因：
  - 原有配置仅有背景透明度和搜索框高度，没有标签层透明度控制。
- 处理方案：
  - 新增 `tagOpacity` 设置项（35-100）。
  - 前端设置页新增滑动条，实时预览。
  - 后端新增字段默认值与校验，保证多设备同步一致。
- 涉及文件：
  - `public/index.html`
  - `public/app.js`
  - `public/styles.css`
  - `server.js`

### 2026-04-06 - 标签名自适应缩字号
- 现象：
  - 长标签名会溢出卡片或显示效果不稳定。
- 根因：
  - 统一固定字号无法兼容不同字符宽度与多语言长度。
- 处理方案：
  - 渲染后按卡片可用宽度逐级缩小字号（每次 1px），直到不溢出。
  - 仅在发生溢出时缩小，确保“在不溢出的前提下字号尽量大”。
  - 窗口尺寸变化后自动重算。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 搜索框点击输入判定范围扩大
- 现象：
  - 搜索框可点击进入输入态的区域偏窄，用户容易点空。
- 根因：
  - 仅原生 input 命中才触发聚焦，容器空白区未接管交互。
- 处理方案：
  - 对搜索框容器增加 `pointerdown` 代理，点击容器空白即聚焦到输入框末尾。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 标签拖动动画增强
- 现象：
  - 拖动标签时视觉反馈弱，看起来“没动画”。
- 根因：
  - 拖拽态仅有静态样式，缺少拖拽阶段的过渡与目标提示动画。
- 处理方案：
  - 增加拖拽态类名与卡片过渡。
  - 为目标卡片增加脉冲动画，提升拖拽过程可感知性。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 分类上下拖拽重排
- 现象：
  - 仅支持分类内标签重排，不支持分类整体顺序调整。
- 根因：
  - 缺少分类级拖拽状态与插入规则。
- 处理方案：
  - 左侧分类块支持拖拽作为手柄。
  - 增加分类前/后插入提示线与临界索引处理，避免前后拖拽错位。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 注册页用户数量提示移除
- 现象：
  - 注册弹窗展示“已注册用户 x/50”，不符合产品预期。
- 根因：
  - 客户端默认把后台用户数量回显在注册弹窗。
- 处理方案：
  - 隐藏并清空该提示区域，仅保留必要的注册结果提示。
- 涉及文件：
  - `public/app.js`
  - `public/index.html`

### 2026-04-06 - 设置页引擎/标签编辑左右对齐优化
- 现象：
  - 设置里引擎和标签编辑区左右列存在轻微不齐。
- 根因：
  - 网格项纵向对齐策略与字段标签高度不统一。
- 处理方案：
  - 统一网格项纵向对齐方式，统一字段标签区高度与按钮最小宽度。
- 涉及文件：
  - `public/styles.css`

### 2026-04-06 - 搜索框输入命中范围体验优化（二次）
- 现象：
  - 点击搜索框时，只有较窄区域能进入输入态。
- 根因：
  - 搜索容器未统一接管空白区域点击焦点。
- 处理方案：
  - 搜索容器监听 `pointerdown`，点击非按钮区域自动聚焦并把光标移动到末尾。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 同分类标签拖拽临界判断回归修复（二次）
- 现象：
  - 同分类拖拽前后交换在部分路径再次出现“落到前一位”问题。
- 根因：
  - 删除源项后的插入索引做了多余的方向修正。
- 处理方案：
  - 同分类按目标原始索引插入，不再做重复偏移修正。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 分类上下拖拽排序功能
- 现象：
  - 需要通过左侧分类块拖拽调整整类顺序。
- 根因：
  - 缺少分类级拖拽状态机和 before/after 落点规则。
- 处理方案：
  - 左侧分类块作为拖拽手柄。
  - 根据目标行上下半区判定 before/after，插入索引统一修正并增加可视化落点线。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 拖拽动画降级为静态反馈
- 现象：
  - 拖拽时浮动、抓起、脉冲动画视觉过强。
- 根因：
  - 拖拽阶段加入了位移与脉冲 keyframes，和当前审美偏好不一致。
- 处理方案：
  - 去除拖拽浮动、抓起旋转、目标脉冲动画。
  - 保留最小化拖拽反馈（透明度与边框高亮）。
- 涉及文件：
  - `public/styles.css`

### 2026-04-06 - Search Bar Sticky-On-Scroll (Bing-like)
- Symptom:
  - Search bar kept moving out of viewport while scrolling down, making quick search inconvenient.
- Root cause:
  - Search area used normal flow layout without a sticky stop point.
- Fix:
  - Changed `.search-panel` to `position: sticky` with top offset.
  - Search bar now moves up at first and stops at the top once reached.
  - Added small vertical safe spacing for visual comfort.
- Files:
  - `public/styles.css`

### 2026-04-06 - Sticky Reliability Recheck (Crash Recovery Patch)
- Symptom:
  - After refresh/scroll, the search bar could still disappear, and first-row tags could be pushed to the top edge.
- Root cause:
  - Scroll container and sticky target were split (`.layout` scrolling with sticky stage offset), which made sticky behavior unstable in this layout.
- Fix:
  - Switched page scrolling back to `body` (`overflow-y: auto`).
  - Removed inner scrolling from `.layout` (`overflow: visible`).
  - Kept search area sticky and increased bottom safety spacing to avoid visual clipping while scrolling.
- Files:
  - `public/styles.css`

### 2026-04-06 - Sticky Safe Gap + History Scroll + Settings Quick Slider
- Symptom:
  - Search area could enter top status region while scrolling.
  - Tags visually overlapped right under the search box.
  - History list only rendered first 8 records, making saved local history hard to reuse.
  - Settings panel lacked a designed quick-scroll control on the right side.
- Root cause:
  - Sticky top offset did not reserve a fixed safe gap under the top bar.
  - No transition mask between sticky search area and tag grid.
  - History rendering hard-limited to 8 items in JS.
  - Settings relied on plain container scrolling only.
- Fix:
  - Introduced top bar sticky height and search safe-gap variables; search now stops below top bar.
  - Added a gradient mask under the sticky search area to remove hard overlap and create fade-out transition.
  - Removed JS 8-item render slice; history panel now supports internal scroll while keeping 8-row visible height.
  - Added a custom right-side draggable quick-scroll rail for settings.
- Files:
  - `public/styles.css`
  - `public/app.js`
  - `public/index.html`

### 2026-04-06 - Tag Fade Logic Switched To Position-Based Targets
- Symptom:
  - First visible row looked faded even before scrolling.
  - Fade was applied by category row, not by each visible tile position.
- Root cause:
  - Opacity calculation used `.category-row` top position and a wide early fade range.
- Fix:
  - Switched fade calculation to per-element targets (`.tag-card`, category name block, expand button).
  - Anchored fade line to actual search bar bottom.
  - Narrowed fade range and reduced hidden offset to avoid early wash-out on first row.
- Files:
  - `public/app.js`

### 2026-04-06 - Settings Layer Elevated To Top
- Symptom:
  - Settings modal could be visually overlapped by top/header layer in some scroll states.
- Root cause:
  - Global layering used relatively low z-index values for settings modal and scrim.
- Fix:
  - Raised settings drawer to highest UI layer.
  - Raised scrim above page content, and kept auth modal above settings when needed.
- Files:
  - `public/styles.css`

### 2026-04-06 - Icon Reliability + Engine Switch Flicker + Hover Float Restore
- Symptom:
  - 部分书签图标偶发加载失败，出现空白图标位。
  - 切换搜索引擎时右侧图标会出现闪一下的观感。
  - 标签 hover 上浮效果缺失。
  - 恢复上浮后需要避免折叠行顶部被裁切。
- Root cause:
  - 图标源链覆盖不足，且无最终兜底图标。
  - 引擎按钮图标未提前预热，首次切换可能触发重新加载。
  - 卡片 hover transform 被关闭。
  - 折叠态容器顶部安全间距不足，浮动时易被裁切。
- Fix:
  - 增强 favicon 源链（native ico/png + duckduckgo + google s2 + icon.horse + unavatar）。
  - 新增宽松 URL 解析（无协议时自动尝试 `https://`）。
  - 无可用源时使用内置 SVG 默认图标，避免空白。
  - 增加引擎按钮图标预热缓存，降低切换闪动。
  - 恢复标签 hover 上浮与阴影，并增加折叠态顶部安全空间避免溢出。
- Files:
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - Category Row Drop Logic Refined
- Symptom:
  - Dropping a category onto the middle of another category icon could place it after the target row when dragging downward.
  - The center drop zone was too broad because it only checked vertical position, not whether the pointer was actually over the category icon.
  - Center drop feedback used a horizontal line, which made the reorder hint look inconsistent with before/after insertion lines.
- Root cause:
  - `center` drop mapped to a direction-dependent insert index instead of consistently taking the target row slot.
  - Hit testing for `center` ignored pointer X position.
  - Center feedback reused line-based affordance instead of target-row highlighting.
- Fix:
  - Made `center` drop always insert into the hovered row position.
  - Limited `center` activation to the actual category icon center zone.
  - Switched center feedback from a full-width line to category icon highlighting, keeping before/after as single insertion lines.
- Files:
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - Category Drag Insert Slots Reworked
- Symptom:
  - Reordering categories still felt inconsistent near row boundaries.
  - The gap between two rows could visually show duplicated insertion lines.
  - Hovering the category icon itself did not clearly behave as a forbidden drop zone.
- Root cause:
  - Drop feedback still depended on per-row pseudo-elements instead of a single shared insertion slot.
  - Valid drop zones were inferred from row areas, not from explicit row-gap slots.
  - Pointer blocking on category icons was not aligned with the intended product interaction.
- Fix:
  - Reworked category drag detection around explicit inter-row insertion slots.
  - Added a single shared drop indicator centered in the gap, with thicker styling.
  - Blocked drops when the pointer is on a category icon, so the browser can show a forbidden cursor there.
  - Limited valid drop feedback to true gap zones and kept a single line per gap to avoid double-line artifacts.
- Files:
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - Category Drag Outer Slot Range Expanded
- Symptom:
  - Dropping before the first row or after the last row could still fail when the pointer moved slightly beyond the original narrow edge capture zone.
- Root cause:
  - Outer insertion zones reused a relatively tight boundary compared with normal row-gap movement, so release events near the page edge could fall outside the valid slot.
- Fix:
  - Added a larger dedicated outer capture range for the first-row top slot and last-row bottom slot.
  - Expanded the stored-target fallback area to match the wider outer slots.
- Files:
  - `public/app.js`

### 2026-04-06 - Category Side Blocks Vertically Centered
- Symptom:
  - Left category labels and right action blocks were visually aligned to the top instead of centered against the full height of the tag grid.
- Root cause:
  - `.category-row` used `align-items: start`, so side columns did not center within taller multi-row content blocks.
- Fix:
  - Changed category row grid alignment to vertical centering so side blocks track the full row height.
- Files:
  - `public/styles.css`

### 2026-04-06 - Category Side Center Offset Compensated For Hover Safe Space
- Symptom:
  - On collapsed overflow rows, left category labels and right action blocks still looked slightly too high after vertical centering.
- Root cause:
  - The tag area reserved extra top-safe space for hover lift, so centering against the full row box biased the side columns upward relative to the visible tiles.
- Fix:
  - Added a row-level hover-safe-space variable for overflow rows.
  - Shifted left and right side columns down by half of that reserved top space, so their visual center matches the tile block center.
- Files:
  - `public/styles.css`

### 2026-04-06 - Category Side Blocks Anchored To First Row
- Symptom:
  - Left category labels and right-side action buttons moved vertically when a category expanded to multiple rows.
- Root cause:
  - Side columns still participated in full-row alignment, so expanding the middle content changed their vertical position.
- Fix:
  - Anchored side columns to the top of the row instead of centering against total expanded height.
  - Kept the hover-safe-space offset compensation so collapsed rows still look visually centered.
- Files:
  - `public/styles.css`

### 2026-04-06 - Category Side Offset Uses Full Hover Safe Space
- Symptom:
  - Side blocks still looked slightly too high because they were only shifted by half of the reserved top hover-safe space.
- Root cause:
  - Side columns are anchored to the first row, so the correct visual compensation is the full reserved top space, not half.
- Fix:
  - Changed left and right side block offset to use the full `--category-hover-safe-top` value.
- Files:
  - `public/styles.css`

### 2026-04-06 - Picsum Custom Seed Row Hidden By Default
- Symptom:
  - The custom seed input row was always visible in Picsum mode, even when a built-in seed preset was selected.
- Root cause:
  - Field visibility only depended on the background provider and did not distinguish preset mode from custom mode.
- Fix:
  - Show the preset selector for Picsum by default.
  - Only reveal the custom seed input row when the current seed does not match any built-in preset, including when the user selects the custom option.
- Files:
  - `public/app.js`

### 2026-04-06 - Removed Picsum Custom Placeholder Option
- Symptom:
  - The preset selector still showed a custom placeholder option, which made the control look redundant after hiding the custom input row by default.
- Root cause:
  - Preset rendering still injected an explicit custom option at the top of the list.
- Fix:
  - Removed the custom placeholder option from the preset selector.
  - Kept the custom seed input row behavior for non-preset seed values.
- Files:
  - `public/app.js`

- 2026-04-06: favicon source priority updated so page-level icons are tried before root-level favicons; added path-level favicon support and full-page Google s2 fallback to fix sites like matrix.tencent.com/ai-detect and aliyun.com.

- 2026-04-06: new user defaults now seed from app_state for every account, and the current synced user_state was promoted into app_state so future registrations inherit the cached icons, layout, and settings template.

- 2026-04-06: added shared server-side icon seed cache with query/promote APIs, preseeded current default engines and tags into app_icon_cache as data URLs, merged server icon seeds into localStorage on login/load, and made icon rendering prefer resolved local cache to stop repeated engine-menu reload flicker.

- 2026-04-07: fixed probabilistic icon reloads by rejecting HTML/error pages masquerading as image/x-icon in both server cache and localStorage cache, then reseeded previously poisoned hosts (douyin.com, chatglm.cn, qianwen.com, coze.com).

- 2026-04-07: rounded the active search-engine icon inside the search button without changing the outer button geometry.

- 2026-04-07: optimized applyState so background refresh and rotation only rerun when the background config changes, and added remote icon-source cooldowns to stop repeated retry flicker after transient favicon failures.

- 2026-04-07: fixed refresh-time background mismatch by removing the hard-coded CSS default remote image, bootstrapping the last persisted background URL in head before CSS paint, and persisting every resolved runtime background URL to localStorage.

- 2026-04-07: changed background persistence from raw URL-only storage to a URL+background-key snapshot so manual background switches survive refresh when the background config is unchanged, while scheduled rotation still resumes normally.

- 2026-04-07: added local authenticated state snapshots plus head-time UI variable bootstrap (search height, tag opacity, overlay opacity, last background) so refreshes render from cached settings/layout first and then reconcile with the server without search-bar size flicker.

- 2026-04-07: removed automatic polling sync, turned the top-right sync pill into a manual sync button, and updated save/status copy to reflect explicit cloud pulls instead of background auto-sync.
