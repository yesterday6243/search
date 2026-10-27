# API 文档

本文档整理当前 `server.js` 中暴露的后端接口，方便接手者直接定位调用方式。

## 1. 基础信息

- 基础地址：`http://localhost:3000`
- 返回格式：默认 `application/json`
- 鉴权方式：基于 Cookie Session
- 会话 Cookie：`mx_search_session`

说明：

- 除登录、注册、健康检查、Bing 背景接口外，大多数用户数据接口都需要登录
- 登录用户的数据通过字段级同步（`/api/sync`）在所有窗口和设备间自动合并；备份 / 快照只用于找回
- `/api/state` 只读（同步数据的普通数组视图）；`/api/history` 仍保留，但前端以本地历史为主

## 2. 认证接口

### `GET /api/auth/status`

用途：

- 获取当前登录状态
- 获取当前用户数和是否还能注册

返回示例：

```json
{
  "loggedIn": true,
  "username": "demo",
  "userCount": 3,
  "userLimit": 50,
  "canRegister": true
}
```

### `POST /api/auth/register`

用途：

- 注册用户并立即登录

请求体：

```json
{
  "username": "demo",
  "password": "password123"
}
```

成功返回：

```json
{
  "ok": true,
  "username": "demo",
  "userCount": 3,
  "userLimit": 50,
  "canRegister": true
}
```

说明：

- 用户名会做规范化检查
- 密码最少 8 位
- 达到用户上限时返回 `409`

### `POST /api/auth/login`

用途：

- 登录并写入 Session Cookie

请求体：

```json
{
  "username": "demo",
  "password": "password123"
}
```

成功返回：

```json
{
  "ok": true,
  "username": "demo",
  "userCount": 3,
  "userLimit": 50,
  "canRegister": true
}
```

失败返回：

- `401`：`{ "message": "账号或密码错误" }`
- `429`：尝试次数过多，带 `Retry-After` 响应头（秒）

```json
{
  "message": "尝试次数过多，请 2 秒后再试",
  "retryAfter": 2
}
```

防暴力破解规则（按「客户端 IP」和「账号」分别计数，任一被限制即拒绝）：

- 15 分钟窗口内，前 4 次失败不限制
- 第 5 次失败起需要等待，等待时间逐次翻倍：1s、2s、4s、8s、16s
- 第 10 次失败后锁定到该 15 分钟窗口结束
- 被限制期间的请求直接返回 429，不计入失败次数；该账号登录成功后清零账号计数
- 不存在的账号也会执行一次密码哈希校验，响应时间与真实账号一致，避免通过耗时探测账号是否存在
- 计数存在进程内存中，服务重启后清零
- 客户端 IP 取自可信代理的 `X-Forwarded-For`，见 README 的 `TRUST_PROXY`

### `POST /api/auth/logout`

用途：

- 注销登录并清除 Session Cookie

成功返回：

```json
{
  "ok": true
}
```

## 3. 健康检查

### `GET /api/health`

用途：

- 进程可用性检查

返回：

```json
{
  "ok": true
}
```

## 4. 同步接口

数据模型与合并规则见 `public/js/sync-core.js`（前后端共用同一份代码）和 `docs/DEVELOPER_GUIDE.md` 第 4 节。

### 数据模型（doc）

```json
{
  "v": 1,
  "settings": { "siteTitle": "mx search", "background.provider": "bing_hourly" },
  "root": { "selectedEngineId": "google" },
  "categories": { "cat_ai": { "name": "AI", "isPinned": false, "$k": "e" } },
  "links": { "gemini": { "label": "Gemini", "url": "https://gemini.google.com/", "$p": "cat_ai", "$k": "1s" } },
  "engines": { "google": { "name": "Google", "urlTemplate": "https://www.google.com/search?q=%s", "$k": "i" } },
  "tomb": { "links:old_id": 1 }
}
```

- `$k`：分数排序键（字符串比较），移动只改被移动项自己的键
- `$p`：标签所属分类
- `tomb`：已删除的 id，之后对它的修改会被忽略（删除优先）
- `settings.historyLimit` 是本机偏好，不参与同步

### 操作（op）

| 形式 | 含义 |
| --- | --- |
| `{ "c": "links", "id": "x", "set": { "label": "新名字" } }` | 新建或修改字段（新建需带齐必填字段和 `$k`，标签还要 `$p`） |
| `{ "c": "links", "id": "x", "set": { "$k": "1", "$p": "cat_dev" } }` | 移动 / 跨分类移动 |
| `{ "c": "categories", "id": "x", "del": 1 }` | 删除 |
| `{ "c": "settings", "set": { "background.provider": "custom_url" } }` | 改设置（按路径） |
| `{ "c": "root", "set": { "selectedEngineId": "bing" } }` | 改默认引擎 |
| `{ "c": "reset", "doc": { … } }` | 整份替换，只由服务端生成（恢复备份） |

服务端逐条校验：未知字段丢弃，`label` / `url` / `name` / `urlTemplate` 及设置值按原有规则清洗（例如透明度会被夹到合法范围），引擎不能删到 0 个。存进日志、回放给客户端的是清洗后的 op，所以所有客户端结果一致。

### `GET /api/sync?since=<rev>`

需要登录。拉取 `since` 之后的改动：

- 没有新改动：`{ "rev": 12, "updatedAt": "…" }`（约 50 字节）
- 有新改动：`{ "rev": 14, "updatedAt": "…", "batches": [{ "rev": 13, "id": "<batchId>", "ops": [ … ] }, …] }`
- 不带 `since`、落后太多（> 200 批）或日志已清理：`{ "rev": 14, "updatedAt": "…", "doc": { … } }`

第一次使用时，服务端用该用户「旧状态 / 最新自动备份 / 最新手动备份」里最新的一份初始化 doc（`rev` = 0）。

### `POST /api/sync`

需要登录。请求体：

```json
{ "since": 12, "batchId": "8-64 位字母数字/-/_", "ops": [ { "c": "links", "id": "gemini", "set": { "label": "Gemini Pro" } } ] }
```

返回：`{ "ack": "<batchId>", "rev": …, "batches" | "doc": … }`，和 `GET` 一样包含 `since` 之后的全部批次（含这一批），客户端据此更新本地基线。

- `batchId` 幂等：同一个 id 重发不会重复应用（网络失败重试、页面关闭时的 keepalive 请求都会重发同一个 id）
- 所有 op 都被丢弃时不增加 `rev`，但仍返回 `ack`
- 单批最多 5000 个 op；服务端保留最近 500 批日志

### `GET /api/state`

只读，返回 `{ "state": { settings, engines, selectedEngineId, categories, history }, "updatedAt" }`，内容来自同步 doc。原来的 `PUT /api/state` 已移除（写入一律走 `/api/sync`）。

## 5. 手动备份接口

备份只用于找回旧版本，多端一致靠上面的同步接口。

- **手动备份**（`kind = manual`）：用户点「立即备份」创建，最多 10 条
- **自动快照**（`kind = auto`）：服务端在一批改动写入前，如果最近一份快照已超过 1 小时，就先把改动前的状态存一份；内容和最新快照相同则跳过；最多 10 份。恢复备份前一定会存一份（不受 1 小时限制）
- 两类各自计数、各自清理，自动快照不会挤掉手动备份

### `GET /api/backups`

用途：

- 获取当前用户最近备份列表

需要登录。

返回示例：

```json
{
  "backups": [
    {
      "id": "12",
      "name": "备份 2026/04/07 13:20",
      "createdAt": "2026-04-07T05:20:00.000Z",
      "summary": {
        "categories": 4,
        "links": 60,
        "engines": 8,
        "bytes": 5413
      }
    }
  ],
  "backupLimit": 10
}
```

说明：

- 后端每个用户最多保留 `backupLimit`（当前为 10）条，超出时自动删除最早的一条
- `summary` 是备份内容摘要（分类数、标签数、引擎数、JSON 字节数），供备份页列表展示
- `POST` / `PATCH` / `DELETE` 备份接口返回的 `backups` 列表结构相同，也带 `backupLimit`
- 同时返回 `autoBackup`（最新自动快照）、`autoBackups`（全部自动快照，新到旧）、`autoBackupLimit`（10）、`autoBackupIntervalMinutes`（60）

### `POST /api/backups/:backupId/restore`

用途：

- 用某条手动备份或自动快照替换当前同步数据

需要登录。成功返回 `{ "ok": true, "rev": 15, "updatedAt": "…" }`。

说明：

- 服务端生成一个 `reset` 批次写入同步日志，所有窗口和设备下次拉取时都会切到恢复后的内容
- 恢复前先强制存一份自动快照，恢复本身也可以撤回
- 自动快照不能重命名或删除（`PATCH` / `DELETE` 返回 404）
- 原来的 `PUT /api/backups/auto`（客户端整份上传自动备份）已移除

### `GET /api/backups/:backupId`

用途：

- 获取某条备份的完整内容

需要登录。

返回示例：

```json
{
  "id": "backup_xxx",
  "name": "备份 2026/04/07 13:20",
  "createdAt": "2026-04-07T05:20:00.000Z",
  "state": {
    "settings": {},
    "engines": [],
    "selectedEngineId": "google",
    "categories": [],
    "history": []
  }
}
```

### `POST /api/backups`

用途：

- 把当前本地状态写成一条云端备份

需要登录。

请求体：

```json
{
  "state": {
    "settings": {},
    "engines": [],
    "selectedEngineId": "google",
    "categories": [],
    "history": []
  }
}
```

成功返回：

```json
{
  "id": "backup_xxx",
  "name": "备份 2026/04/07 13:20",
  "createdAt": "2026-04-07T05:20:00.000Z"
}
```

说明：

- 如果超过 3 条，服务端会裁掉更旧的记录
- 默认名称由后端按时间生成

### `PATCH /api/backups/:backupId`

用途：

- 重命名备份

需要登录。

请求体：

```json
{
  "name": "办公室电脑稳定版本"
}
```

成功返回：

```json
{
  "ok": true,
  "backup": {
    "id": "backup_xxx",
    "name": "办公室电脑稳定版本",
    "createdAt": "2026-04-07T05:20:00.000Z"
  },
  "backups": []
}
```

### `DELETE /api/backups/:backupId`

用途：

- 删除指定备份

需要登录。

成功返回：

```json
{
  "ok": true,
  "backups": []
}
```

## 6. 图标缓存接口

这组接口用于“服务器共享图标缓存”。

设计目标：

- 新用户优先命中服务端缓存，不依赖外网 favicon
- 某个用户成功解析到图标后，可以提升给全体用户复用

### `POST /api/icon-cache/default/query`

用途：

- 查询一批 host 在服务器共享缓存里的图标

需要登录。

请求体：

```json
{
  "hosts": ["google.com", "github.com", "openai.com"]
}
```

成功返回：

```json
{
  "iconCache": {
    "google.com": "data:image/png;base64,...",
    "github.com": "data:image/png;base64,..."
  }
}
```

### `POST /api/icon-cache/default/promote`

用途：

- 把客户端本地已成功解析的图标提升到服务端共享缓存

需要登录。

请求体示例：

```json
{
  "entries": [
    {
      "host": "google.com",
      "sourceUrl": "https://www.google.com/favicon.ico"
    }
  ]
}
```

成功返回：

```json
{
  "ok": true,
  "iconCache": {
    "google.com": "data:image/png;base64,..."
  }
}
```

说明：

- 服务端会校验内容，避免把 HTML 错误页缓存成图标

### `POST /api/icon-cache/discover`

用途：

- 读取网页自身 `<link rel="icon">` / `apple-touch-icon` 声明的图标（包括内联 `data:` SVG）
- 解决 `/favicon.ico` 不存在、第三方 favicon 服务只返回通用地球占位图的网站

需要登录。

请求体：

```json
{
  "url": "https://szaq.top/focus/"
}
```

成功返回：

```json
{
  "ok": true,
  "host": "szaq.top",
  "dataUrl": "data:image/svg+xml;base64,..."
}
```

说明：

- 服务端缓存里已有该 host 时直接返回缓存，不再抓取页面
- 找不到图标时返回 `"dataUrl": ""`（仍为 200）
- 只允许 http/https；会解析 DNS 并拒绝内网 / 本机地址，防止 SSRF
- 页面最多读取 1MB（读到 `</head>` 即停止），超时 10 秒
- 多个候选时优先 SVG，其次按 `sizes` 取最大尺寸
- 成功结果写入服务端共享图标缓存（覆盖旧值）

### `POST /api/site-meta`

用途：

- 首页「＋」快速添加标签：粘贴网址后识别网站名称和图标（一次抓取页面同时完成）

需要登录。

请求体：

```json
{
  "url": "https://vercel.com/"
}
```

成功返回：

```json
{
  "ok": true,
  "host": "vercel.com",
  "name": "Vercel",
  "iconDataUrl": "data:image/png;base64,..."
}
```

说明：

- 名称优先取 `og:site_name` / `application-name` / `apple-mobile-web-app-title`（不超过 18 字符），否则取 `<title>` 按「 - 」「 | 」「 · 」「: 」等分隔后最短的一段
- 页面无法访问时仍返回 200，`name` 为域名推导的名称（如 `www.example.co.uk` → `Example`），便于照常添加
- 图标逻辑与 `/api/icon-cache/discover` 相同（共享抓取与解析代码），成功时写入服务端图标缓存
- 与 `discover` 相同的 SSRF 防护（只允许公网 http/https）

## 6.1 搜索联想接口

### `GET /api/suggest?q=<关键词>&engine=<搜索引擎域名>`

用途：

- 输入时返回搜索引擎联想词。页面 CSP 只允许同源请求，所以由后端代理

不需要登录。

参数：

- `q`：关键词，最多 100 字符（超出截断）
- `engine`：当前搜索引擎的域名（如 `google.com`），用于选择联想来源

成功返回：

```json
{
  "query": "claude",
  "provider": "google",
  "suggestions": ["claude ai", "claude code", "claude desktop"]
}
```

说明：

- 来源固定为 Google / Bing / 百度 / DuckDuckGo（都返回 OpenSearch JSON），不是通用代理
- 优先用与当前引擎同名的来源，失败时依次回退 Bing、百度；全部失败返回空数组（仍为 200）
- 每个来源超时 3 秒，最多返回 8 条，结果在服务端缓存 10 分钟
- 按 IP 限流：每分钟 120 次，超出返回 429
- 用户可在设置「04 搜索历史 → 搜索联想」关闭，关闭后前端不再请求

## 7. Bing 背景接口

### `GET /api/background/bing`

用途：

- 获取 Bing 背景图数据

查询参数：

- `n`
  - 最近图片数量
  - 最小 1，最大 8

示例：

```text
GET /api/background/bing?n=3
```

成功返回示例：

```json
{
  "provider": "bing_hourly",
  "recentCount": 3,
  "images": [],
  "fetchedAt": "2026-04-07T05:20:00.000Z"
}
```

失败时返回 `502`：

```json
{
  "message": "failed to fetch bing backgrounds",
  "images": [],
  "fetchedAt": "2026-04-07T05:20:00.000Z"
}
```

## 8. 历史接口

说明：

- 这组接口还在，但当前前端主流程已经以本地历史为主
- 可以视为保留能力，不是当前核心依赖

### `POST /api/history`

用途：

- 向用户状态里追加一条搜索历史

需要登录。

请求体：

```json
{
  "query": "openai gpt",
  "engineId": "google"
}
```

成功返回：

- 返回更新后的完整状态记录

### `DELETE /api/history`

用途：

- 删除单条历史，或清空全部历史

需要登录。

查询参数：

- `id`
  - 可选
  - 传入则删除单条
  - 不传则清空全部

示例：

```text
DELETE /api/history?id=history_xxx
```

成功返回：

- 返回更新后的完整状态记录

## 9. 非 API 路由

### `GET /^(?!\/api\/).*/`

用途：

- 所有非 API 路径都回退到 `public/index.html`
- 用于单页应用入口

## 10. 调试建议

如果接手者要排查接口问题，建议按这个顺序：

1. 先看 [server.js](C:\Users\ShenPc-2\Desktop\AI\searchindex\server.js) 里的 route
2. 再看对应 helper 函数和数据表
3. 最后看 [public/app.js](C:\Users\ShenPc-2\Desktop\AI\searchindex\public\app.js) 里是谁在调这个接口

当前最容易误判的点有两个：

1. `/api/state` 只读；所有写入走 `/api/sync`，要看某个用户的改动历史可以查 `user_sync_log` 表
2. `/api/history` 还在，但前端主路径现在以本地历史为主
