# API 文档

本文档整理当前 `server.js` 中暴露的后端接口，方便接手者直接定位调用方式。

## 1. 基础信息

- 基础地址：`http://localhost:3000`
- 返回格式：默认 `application/json`
- 鉴权方式：基于 Cookie Session
- 会话 Cookie：`mx_search_session`

说明：

- 除登录、注册、健康检查、Bing 背景接口外，大多数用户数据接口都需要登录
- 当前前端已经改成“本地优先 + 手动备份 / 手动同步”
- 后端仍然保留 `/api/state` 和 `/api/history`，但前端不会在启动时自动拉取状态覆盖本地

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

## 4. 用户状态接口

### `GET /api/state`

用途：

- 读取当前用户完整状态

需要登录。

返回结构是一个状态记录，包含：

- `data`
- `updatedAt`

其中 `data` 的主体字段通常包括：

- `settings`
- `engines`
- `selectedEngineId`
- `categories`
- `history`

### `PUT /api/state`

用途：

- 合并更新当前用户状态

需要登录。

请求体：

```json
{
  "settings": {
    "siteTitle": "mx search"
  }
}
```

说明：

- 服务端不是整份替换，而是做状态 merge
- 当前前端的高频操作大多已经本地优先，不再依赖这个接口实时回灌页面

## 5. 手动备份接口

这是当前项目里最重要的一组接口。

设计目标：

- 不做自动多设备同步
- 由用户手动决定何时备份本地数据到云端
- 由用户手动决定何时从某条备份覆盖回本地

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

### `PUT /api/backups/auto`

用途：

- 写入一个新的自动备份版本（带时间戳）。前端在最后一次改动 30 秒后调用，离开页面时用 `keepalive` 立即调用
- 内容与最新版本完全相同时不新增，只刷新最新版本的时间

需要登录。

请求体：与 `POST /api/backups` 相同（`{ "state": { ... } }`）

成功返回：

```json
{
  "ok": true,
  "autoBackup": {
    "id": "15",
    "name": "自动备份",
    "kind": "auto",
    "createdAt": "2026-10-26T15:42:10.000Z",
    "summary": { "categories": 4, "links": 60, "engines": 8, "bytes": 5413 }
  }
}
```

说明：

- 数据表 `user_backups` 新增 `kind` 列（`manual` / `auto`，老数据迁移为 `manual`）
- 每个用户保留最近 `autoBackupLimit`（当前为 20）个 `auto` 版本，超出时删除最早的；不计入手动备份上限，也不会被手动备份的清理删掉
- 自动备份不能重命名或删除（`PATCH` / `DELETE` 返回 404），但可以用 `GET /api/backups/:backupId` 恢复
- `GET /api/backups` 以及创建 / 重命名 / 删除手动备份的返回里都带 `autoBackup`（最新版本，没有时为 `null`）、`autoBackups`（全部版本，新到旧）和 `autoBackupLimit`；`backups` 只包含手动备份

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

1. `/api/state` 还在，但前端已经不是自动同步模型
2. `/api/history` 还在，但前端主路径现在以本地历史为主
