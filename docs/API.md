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
      "id": "backup_xxx",
      "name": "备份 2026/04/07 13:20",
      "createdAt": "2026-04-07T05:20:00.000Z"
    }
  ]
}
```

说明：

- 当前后端只保留最近 3 条

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
