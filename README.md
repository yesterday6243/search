# mx search

一个可自行部署的个人搜索导航首页。

这不是复杂的多用户协作系统，而是一个小体量、长期使用、以本地体验为优先的首页工具。当前版本的重点能力：

- 搜索框 + 可切换搜索引擎
- 分类标签导航
- 标签和分类拖拽排序
- 自定义背景图
- 图标本地缓存 + 服务器共享缓存
- 账号登录
- 手动云端备份 / 手动同步

## 快速开始

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

生产启动：

```bash
npm start
```

默认地址：

```text
http://localhost:3000
```

如果 PowerShell 阻止 `npm.ps1`，可以改用：

```bash
cmd /c npm.cmd install
cmd /c npm.cmd run dev
```

## Docker 部署

项目现在支持 Docker 部署，适合已经有很多现有 nginx 业务的服务器。

设计原则：

- 容器内应用监听 `3000`
- 宿主机默认只绑定到 `127.0.0.1:3210`
- 不直接暴露公网端口
- 数据库持久化到宿主机 `./data`
- 现有 nginx 如需接入，只需手动反代到 `127.0.0.1:3210`

构建并启动：

```bash
docker compose up -d --build
```

查看日志：

```bash
docker compose logs -f
```

停止：

```bash
docker compose down
```

默认文件：

- [Dockerfile](C:\Users\ShenPc-2\Desktop\AI\searchindex\Dockerfile)
- [docker-compose.yml](C:\Users\ShenPc-2\Desktop\AI\searchindex\docker-compose.yml)

如需修改绑定端口，直接改 `docker-compose.yml` 里的这一行：

```yaml
ports:
  - "127.0.0.1:3210:3000"
```

如果你要让现有 nginx 反代进来，目标上游就是：

```text
http://127.0.0.1:3210
```

## 项目结构

```text
searchindex/
├─ public/
│  ├─ index.html        前端页面结构、弹层骨架
│  ├─ styles.css        全部样式
│  └─ app.js            前端交互、状态、缓存、备份/同步逻辑
├─ data/                Docker 持久化数据库目录（运行后生成）
├─ Dockerfile           Docker 镜像构建文件
├─ docker-compose.yml   Docker 启动配置
├─ scripts/
│  └─ deploy-linux.sh   Linux 部署脚本
├─ docs/
│  └─ DEVELOPER_GUIDE.md 开发接手说明
├─ server.js            Express 服务、SQLite 读写、API
├─ searchindex.db       主数据库
├─ OPTIMIZATION_LOG.md  迭代修复记录
├─ package.json
└─ README.md
```

## 当前数据模型

项目当前分成三层数据：

1. 本地浏览器数据
- 当前页面状态快照
- 搜索历史
- UI 偏好
- 背景快照
- 图标缓存
- 备份/同步状态元信息

2. 用户后端状态
- 用户自己的标签、分类、引擎、设置
- 用于长期保存用户配置

3. 用户后端备份
- 手动触发
- 最多保留最近 3 条
- 支持重命名、删除、恢复到本地

## 现在的同步策略

当前不是自动同步模型。

规则是：

1. 本地修改先落本地
2. 用户手动点击“备份”时，才把当前本地数据写入后端备份
3. 用户手动点击“同步”时，才从选定备份恢复并覆盖本地

这样做的目的，是避免多设备同时使用时出现静默覆盖。

## 接手时先看什么

1. 先读 [OPTIMIZATION_LOG.md](C:\Users\ShenPc-2\Desktop\AI\searchindex\OPTIMIZATION_LOG.md)
2. 再读 [docs/DEVELOPER_GUIDE.md](C:\Users\ShenPc-2\Desktop\AI\searchindex\docs\DEVELOPER_GUIDE.md)
3. 如果要改接口，再读 [docs/API.md](C:\Users\ShenPc-2\Desktop\AI\searchindex\docs\API.md)
4. 如果要部署到服务器，再读 [docs/DEPLOY_CENTOS.md](C:\Users\ShenPc-2\Desktop\AI\searchindex\docs\DEPLOY_CENTOS.md)
5. 最后再改代码

## 关键说明

1. 搜索历史只保存在当前浏览器，不上传后端
2. 图标优先走本地缓存，其次服务器共享缓存，再次才走外部 favicon 源
3. 背景切换结果会缓存到本地，避免刷新闪动
4. 右上角状态按钮现在表示“备份状态”，不再是普通消息提示器
5. 普通操作反馈统一走页面内 toast，不走浏览器原生提示框

## 维护约定

1. 修改前先看 `OPTIMIZATION_LOG.md`
2. 大的修复和交互改动，继续写进 `OPTIMIZATION_LOG.md`
3. 如果调整备份、同步、图标缓存、背景逻辑，优先更新开发文档，避免后续误判
