# CentOS 部署教程

本文档面向这类场景：

- 服务器是 CentOS
- 机器上已经有很多现有 nginx 业务
- 新项目不能影响现有 nginx
- 希望把 `mx search` 作为一个独立 Node 服务挂到现有 nginx 后面

先说结论：

1. 这个项目本身不配置域名
2. 域名配置在 nginx
3. 项目只负责监听一个本地端口
4. nginx 再把域名流量反代到这个本地端口

## 1. 域名到底配在哪里

不在项目代码里，也不在数据库里。

域名配置在 nginx 的 `server_name`。

例如：

```nginx
server {
    listen 80;
    server_name search.example.com;

    location / {
        proxy_pass http://127.0.0.1:3210;
    }
}
```

这里：

- `search.example.com` 就是域名
- `127.0.0.1:3210` 是这个项目在本机监听的地址

所以你以后要换域名，改 nginx 即可，不需要改项目代码。

## 2. 推荐部署方式

当前项目支持两种适合 CentOS 的方式：

1. 原生部署
   - `systemd` 或 `pm2`
   - 应用跑在独立目录，独立端口
2. Docker 部署
   - 容器监听 `3000`
   - 宿主机映射到 `127.0.0.1:3210`

两种方式都不会自动修改 nginx。

## 3. 原生部署

### 3.1 运行脚本

在项目根目录执行：

```bash
sudo bash scripts/deploy-linux.sh
```

### 3.2 脚本会问你什么

脚本会交互式询问：

- 部署目录
- 运行用户
- 绑定地址
- 监听端口
- 服务模式
- 是否生成 nginx 配置样例

建议这样填：

- Bind host：`127.0.0.1`
- Listen port：选一个当前机器没被占用的端口，例如 `3210`
- Service mode：`systemd`

这样最安全，因为：

- 应用只监听本机
- 不直接暴露公网
- 现有 nginx 可按需接入

### 3.3 脚本做了什么

脚本只做这些事：

1. 拷贝项目到独立目录
2. 安装生产依赖
3. 写 `.deploy.env`
4. 注册 `systemd` 或 `pm2`
5. 可选生成 nginx 样例文件

不会做这些事：

1. 不会修改现有 nginx 配置
2. 不会 reload nginx
3. 不会抢已有站点的 80/443

### 3.4 配置文件在哪里

部署后会生成：

- 应用环境文件：`<部署目录>/.deploy.env`
- nginx 样例目录：`<部署目录>/deploy/`

`.deploy.env` 示例：

```env
HOST=127.0.0.1
PORT=3210
NODE_ENV=production
```

### 3.5 nginx 样例文件

如果部署时选择生成 nginx 样例，会得到：

- `<部署目录>/deploy/nginx-location-snippet.conf`
- `<部署目录>/deploy/nginx-server-example.conf`

用途：

- `nginx-location-snippet.conf`
  - 适合你已经有某个站点，想把这个项目挂到一个路径下
- `nginx-server-example.conf`
  - 适合你想给它一个独立域名

注意：

- 这些文件只是样例
- 你需要手动合并进现有 nginx 配置
- 脚本不会自动安装这些配置

## 4. Docker 部署

### 4.1 默认设计

当前 Docker 方案默认是：

- 容器内监听：`3000`
- 宿主机映射：`127.0.0.1:3210:3000`
- 数据目录挂载：`./data:/app/data`

也就是说：

- 外部不能直接访问容器端口
- 现有 nginx 可以反代到 `127.0.0.1:3210`

### 4.2 启动方式

```bash
docker compose up -d --build
```

### 4.3 停止

```bash
docker compose down
```

### 4.4 查看日志

```bash
docker compose logs -f
```

### 4.5 改宿主机端口

如果你要改成别的端口，改 [docker-compose.yml](C:\Users\ShenPc-2\Desktop\AI\searchindex\docker-compose.yml) 里的：

```yaml
ports:
  - "127.0.0.1:3210:3000"
```

例如改成 `3220`：

```yaml
ports:
  - "127.0.0.1:3220:3000"
```

改完重新启动：

```bash
docker compose up -d --build
```

## 5. 现有 nginx 怎么接这个项目

这是最关键的部分。

### 方式 A：独立域名

例如你想用：

- `search.example.com`

那么在 nginx 新增一个独立 `server`：

```nginx
server {
    listen 80;
    server_name search.example.com;

    location / {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

域名配置位置就是：

```nginx
server_name search.example.com;
```

### 方式 B：挂到已有域名的路径下

例如现有域名是：

- `www.example.com`

你想挂到：

- `www.example.com/mx-search/`

那就不要新建站点，而是在现有 `server {}` 里增加：

```nginx
location /mx-search/ {
    proxy_pass http://127.0.0.1:3210/;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

注意：

- 这种路径挂载方式依赖前端路径兼容性
- 当前项目更推荐独立域名，结构更干净

## 6. 修改 nginx 的安全做法

因为你机器上已经有很多业务，不建议直接改完就 reload。

建议流程：

1. 先备份现有 nginx 配置
2. 新增或修改配置
3. 先执行语法检查

```bash
nginx -t
```

4. 确认没问题后再 reload

```bash
nginx -s reload
```

如果 `nginx -t` 失败，不要 reload。

## 7. 首次上线建议

建议你按这个顺序做：

1. 先原生部署或 Docker 部署，让项目在本机端口跑起来
2. 先在服务器本机测通

例如：

```bash
curl http://127.0.0.1:3210/api/health
```

如果返回：

```json
{"ok":true}
```

说明应用本体没问题。

3. 再接入 nginx
4. 最后再接域名 DNS

## 8. 常见问题

### Q1：我必须用域名吗？

不用。

你也可以直接通过：

```text
http://服务器IP:端口
```

访问。

但如果机器上已有 nginx，通常更建议走域名 + 反代。

### Q2：为什么默认绑定 `127.0.0.1`？

因为这最适合共享服务器：

- 不直接暴露应用端口
- 不影响现有站点
- 只允许本机 nginx 转发

### Q3：脚本会不会自动动我现在的 nginx？

不会。

当前脚本明确是：

- 不修改 nginx
- 不安装 nginx 配置
- 不 reload nginx

### Q4：域名证书在哪里配？

也在 nginx。

项目本身不处理 TLS 证书。

## 9. 相关文件

- 原生部署脚本：
  - [scripts/deploy-linux.sh](C:\Users\ShenPc-2\Desktop\AI\searchindex\scripts\deploy-linux.sh)
- Docker 配置：
  - [Dockerfile](C:\Users\ShenPc-2\Desktop\AI\searchindex\Dockerfile)
  - [docker-compose.yml](C:\Users\ShenPc-2\Desktop\AI\searchindex\docker-compose.yml)
- 项目入口说明：
  - [README.md](C:\Users\ShenPc-2\Desktop\AI\searchindex\README.md)
