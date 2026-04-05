# 个人搜索首页（mx search）

一个可自部署的个人搜索导航首页，支持账号登录、云端配置同步和标签拖拽布局。

## 功能概览

- 首页搜索框 + 独立搜索引擎切换按钮
- 标签分类导航（每行 10 个，支持展开）
- 标签拖拽排序（分类内/跨分类）
- 分类顺序拖拽调整
- 设置大弹窗（居中）与动态面包屑提示
- 背景图支持 Bing/Picsum/自定义地址，支持定时轮换
- 点击左上角 `mx search` 可手动切换背景
- 搜索历史仅保存在本地浏览器（`localStorage`），不上传后端
- 账号系统（用户名 + 密码注册登录，无验证码）
- 登录后每个用户的数据与布局独立保存并同步
- 注册用户上限：50

## 本地开发

```bash
npm install
npm run dev
```

如果 PowerShell 阻止 `npm.ps1`，可以改用：

```bash
cmd /c npm.cmd install
cmd /c npm.cmd run dev
```

生产启动：

```bash
npm start
```

默认地址：`http://localhost:3000`

## Linux 一键部署

项目内置交互式部署脚本：

`scripts/deploy-linux.sh`

脚本特性：

- 部署到独立目录，不覆盖你的原始项目目录
- 可自定义端口（含端口占用检查）
- 可选服务模式：`systemd` / `pm2` / `none`
- 可自定义运行用户与服务名
- 二次部署升级时保留已有数据库文件

### 使用方法

```bash
chmod +x scripts/deploy-linux.sh
./scripts/deploy-linux.sh
```

脚本会提示你输入：

- 部署目录（默认：`/opt/mx-search`）
- 运行用户（默认：当前用户）
- 监听端口（默认：`3000`）
- 服务模式（`systemd` / `pm2` / `none`）
- 服务名称（默认：`mx-search-<port>`）

## 服务管理

### systemd 模式

```bash
sudo systemctl status mx-search-3000
sudo systemctl restart mx-search-3000
sudo systemctl stop mx-search-3000
sudo journalctl -u mx-search-3000 -f
```

把 `mx-search-3000` 替换成你的实际服务名。

### pm2 模式

```bash
pm2 status
pm2 logs <service-name>
pm2 restart <service-name>
pm2 delete <service-name>
```

## 升级部署

代码更新后，再执行一次部署脚本即可：

```bash
./scripts/deploy-linux.sh
```

脚本会把新代码同步到部署目录，并重新安装依赖。

## 数据与同步说明

- 后端数据库文件：`searchindex.db`
- 同步到同一服务器下的多设备：分类、标签、搜索引擎、背景设置、布局等
- 搜索历史仅本地保存（浏览器 `localStorage`）

## 维护约定

- 每次修复/优化前，先查看 `OPTIMIZATION_LOG.md`
- 每次修复/优化后，追加记录：现象、根因、处理方案、涉及文件

## 公网访问建议

如果要暴露到公网，建议额外加一层访问控制：

- Nginx Basic Auth
- Cloudflare Access
- 或仅限内网访问
