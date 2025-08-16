# 部署指南

本文档提供了在不同环境中部署Code Review Agent的详细指南。

## 本地开发环境

### 系统要求

- Node.js 18.0+ 
- npm 8.0+
- Git

### 快速启动

```bash
# 1. 克隆仓库
git clone https://github.com/Jane900928/code-review.git
cd code-review

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 DeepSeek API Key

# 4. 启动开发服务器
npm run agent:dev &  # 启动Agent服务
npm run dev          # 启动Web界面
```

访问 http://localhost:3000 开始使用。

## 生产环境部署

### 方式1: 传统服务器部署

#### 准备工作

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2 (进程管理器)
sudo npm install -g pm2

# 安装 Nginx (可选，用于反向代理)
sudo apt install nginx
```

#### 部署应用

```bash
# 1. 克隆代码
git clone https://github.com/Jane900928/code-review.git
cd code-review

# 2. 安装依赖
npm ci --only=production

# 3. 构建前端
npm run build

# 4. 配置环境变量
nano .env
```

在 `.env` 文件中配置：

```env
NODE_ENV=production
OPENAI_API_KEY=your_production_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
AGENT_PORT=3001
NEXT_PUBLIC_AGENT_URL=https://yourdomain.com/api
```

#### 使用PM2启动服务

创建 `ecosystem.config.js`:

```javascript
export default {
  apps: [
    {
      name: 'code-review-agent',
      script: 'src/agent/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'code-review-web',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
}
```

启动服务：

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Nginx配置 (可选)

创建 `/etc/nginx/sites-available/code-review`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 方式2: Docker部署

#### 创建Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/src/agent ./src/agent
USER nextjs
EXPOSE 3000 3001
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["sh", "-c", "node src/agent/server.js & node server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  code-review:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - AGENT_PORT=3001
    restart: unless-stopped
```

## 环境变量配置

### 必需变量

- `OPENAI_API_KEY`: DeepSeek API密钥
- `DEEPSEEK_BASE_URL`: API基础URL (默认: https://api.deepseek.com)
- `AGENT_PORT`: Agent服务端口 (默认: 3001)
- `NEXT_PUBLIC_AGENT_URL`: Agent服务URL

### 可选变量

- `NODE_ENV`: 运行环境 (development/production)
- `PORT`: Web服务端口 (默认: 3000)

## 监控和维护

### 健康检查

```bash
# 检查Agent服务状态
curl http://localhost:3001/health

# 检查Web服务状态
curl http://localhost:3000
```

### 日志管理

```bash
# PM2日志
pm2 logs code-review-agent
pm2 logs code-review-web

# Docker日志
docker-compose logs -f
```

### 性能优化

1. **内存优化**
   - 设置合适的Node.js内存限制
   - 使用PM2集群模式

2. **缓存优化**
   - 配置Nginx缓存
   - 使用CDN加速静态资源

3. **数据库优化**
   - 如需持久化，考虑添加Redis缓存

## 安全配置

### 防火墙设置

```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### API安全

1. **限流配置**
   - 添加请求频率限制
   - 实现IP白名单

2. **HTTPS强制**
   - 配置SSL重定向
   - 使用HSTS头

### 环境隔离

- 生产环境禁用开发工具
- 分离开发和生产API密钥
- 定期轮换API密钥

## 故障排除

### 常见问题

1. **Agent服务无法启动**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3001
   
   # 检查环境变量
   env | grep DEEPSEEK
   ```

2. **前端连接Agent失败**
   ```bash
   # 检查CORS配置
   curl -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS http://localhost:3001/api/code-review
   ```

3. **API调用失败**
   - 验证API密钥有效性
   - 检查网络连接
   - 查看API使用限制

### 备份和恢复

```bash
# 备份配置
tar -czf backup-$(date +%Y%m%d).tar.gz .env src/ package.json

# 快速部署脚本
#!/bin/bash
git pull origin main
npm ci
npm run build
pm2 restart all
```

## 扩展部署

### 负载均衡

使用Nginx实现多实例负载均衡：

```nginx
upstream code_review_backend {
    server localhost:3001;
    server localhost:3002;  # 第二个实例
}

server {
    location /api {
        proxy_pass http://code_review_backend;
    }
}
```

### 容器编排

使用Kubernetes部署：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-review-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: code-review-agent
  template:
    metadata:
      labels:
        app: code-review-agent
    spec:
      containers:
      - name: code-review
        image: code-review:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: deepseek-secret
              key: api-key
```

## 联系支持

如遇到部署问题，请：

1. 查看项目Issues: https://github.com/Jane900928/code-review/issues
2. 提交新Issue并包含详细的错误信息
3. 参考项目文档和示例配置

---

完成部署后，访问你的域名即可开始使用Code Review Agent！