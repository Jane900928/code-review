# Cloudflare Workers 部署指南

本指南详细说明如何将Code Review Agent部署到Cloudflare Workers。

## 🎯 部署优势

- **全球边缘计算**: 在全球200+数据中心运行
- **零冷启动**: 毫秒级响应时间
- **自动扩缩容**: 无需管理服务器
- **高可用性**: 99.99%可用性保证
- **成本效益**: 免费层包含100,000请求/天

## 📋 前提条件

1. **Cloudflare账号**: [注册免费账号](https://dash.cloudflare.com/sign-up)
2. **DeepSeek API Key**: [获取API密钥](https://platform.deepseek.com/)
3. **Node.js 18+**: 确保本地环境支持
4. **Git**: 用于代码管理

## 🚀 快速部署

### 方法1: 使用Mastra CLI (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/Jane900928/code-review.git
cd code-review

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑.env文件，填入必要配置

# 4. 构建应用
npm run build

# 5. 部署到Cloudflare
npm run deploy
```

### 方法2: 使用Wrangler CLI

```bash
# 1. 安装Wrangler
npm install -g wrangler

# 2. 登录Cloudflare
wrangler login

# 3. 构建Mastra应用
npm run build

# 4. 部署Worker
wrangler deploy
```

## ⚙️ 详细配置

### 1. Cloudflare账号设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 获取Account ID:
   - 右侧边栏 → Account ID
   - 复制并保存此ID

3. 创建API Token:
   - 顶部菜单 → My Profile → API Tokens
   - 创建Token → 自定义Token
   - 权限设置：
     ```
     Zone:Zone:Read
     Zone:Zone Settings:Edit  
     Account:Cloudflare Workers:Edit
     ```

### 2. 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# DeepSeek AI配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Cloudflare配置
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here

# 可选: 自定义域名
CLOUDFLARE_ZONE_NAME=yourdomain.com
CLOUDFLARE_CUSTOM_DOMAIN=true
```

### 3. Wrangler配置

编辑 `wrangler.toml` 文件：

```toml
name = "code-review-agent"
main = ".mastra/output/index.mjs"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NODE_ENV = "production"
DEEPSEEK_BASE_URL = "https://api.deepseek.com"

# 自定义域名配置 (可选)
[[routes]]
pattern = "code-review.yourdomain.com/*"
zone_name = "yourdomain.com"

# Worker限制配置
[limits]
cpu_ms = 30000  # 30秒，适合复杂代码分析
```

## 🔐 Secrets管理

### 设置API密钥

通过CLI设置密钥：

```bash
# 设置DeepSeek API Key
wrangler secret put DEEPSEEK_API_KEY
# 提示时输入您的API密钥

# 验证密钥设置
wrangler secret list
```

### 通过Dashboard设置

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → 选择您的Worker
3. Settings → Environment Variables
4. 添加新的Secret:
   - Name: `DEEPSEEK_API_KEY`
   - Value: 您的DeepSeek API密钥

## 🌐 自定义域名

### 1. 域名解析

如果您的域名使用Cloudflare DNS：

1. DNS → Records → Add record
2. 类型: `CNAME`
3. 名称: `code-review` (或您想要的子域名)
4. 目标: `your-worker.your-subdomain.workers.dev`
5. Proxy status: 🟠 Proxied

### 2. 路由配置

在 `wrangler.toml` 中添加：

```toml
[[routes]]
pattern = "code-review.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 3. SSL证书

Cloudflare自动提供免费SSL证书，无需额外配置。

## 📊 监控和调试

### 实时日志

```bash
# 查看实时日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --since 2h
```

### 性能监控

1. Cloudflare Dashboard → Analytics → Workers
2. 查看请求量、错误率、延迟等指标
3. 设置告警通知

### 调试技巧

```javascript
// 在Worker中添加调试日志
console.log('Debug info:', { 
  request: request.url, 
  timestamp: new Date().toISOString() 
});

// 错误处理
try {
  // 您的代码
} catch (error) {
  console.error('Worker error:', error);
  return new Response('Internal Error', { status: 500 });
}
```

## 🔧 高级配置

### KV存储 (可选)

用于缓存分析结果：

```bash
# 创建KV命名空间
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --preview

# 在wrangler.toml中配置
[[kv_namespaces]]
binding = "CACHE"
id = "your-namespace-id"
preview_id = "your-preview-namespace-id"
```

### D1数据库 (可选)

用于存储用户数据：

```bash
# 创建D1数据库
wrangler d1 create code-review-db

# 在wrangler.toml中配置
[[d1_databases]]
binding = "DB"
database_name = "code-review-db"
database_id = "your-database-id"
```

### Durable Objects (可选)

用于会话管理：

```bash
# 在wrangler.toml中配置
[[durable_objects.bindings]]
name = "SESSIONS"
class_name = "SessionManager"
```

## 🚨 故障排除

### 常见问题

1. **部署失败**
   ```bash
   # 检查wrangler版本
   wrangler --version
   
   # 更新到最新版本
   npm install -g wrangler@latest
   ```

2. **API密钥错误**
   ```bash
   # 重新设置密钥
   wrangler secret delete DEEPSEEK_API_KEY
   wrangler secret put DEEPSEEK_API_KEY
   ```

3. **域名配置问题**
   - 确保域名使用Cloudflare DNS
   - 检查路由配置是否正确
   - 验证SSL/TLS设置

4. **性能问题**
   - 检查CPU时间限制
   - 优化代码逻辑
   - 使用KV缓存减少API调用

### 调试步骤

1. **本地测试**
   ```bash
   # 本地运行Worker
   wrangler dev
   ```

2. **检查日志**
   ```bash
   # 实时日志
   wrangler tail
   ```

3. **性能分析**
   - 使用Cloudflare Analytics
   - 监控错误率和延迟
   - 检查内存使用情况

## 💰 成本优化

### 免费层限制

- **请求数**: 100,000次/天
- **CPU时间**: 10ms/请求 (免费)
- **内存**: 128MB

### 付费层优势

- **请求数**: 无限制
- **CPU时间**: 最高50ms/请求
- **内存**: 最高128MB
- **KV操作**: 包含一定免费额度

### 优化建议

1. **缓存策略**: 使用KV存储缓存常见分析结果
2. **代码优化**: 减少不必要的计算
3. **批量处理**: 合并多个小请求
4. **智能路由**: 只在必要时调用AI API

## 🔄 CI/CD集成

### GitHub Actions

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 设置Secrets

在GitHub仓库设置中添加：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `DEEPSEEK_API_KEY`

## 📈 扩展部署

### 多环境部署

```toml
# wrangler.toml
[env.staging]
name = "code-review-staging"
vars = { NODE_ENV = "staging" }

[env.production]
name = "code-review-production"
vars = { NODE_ENV = "production" }
```

```bash
# 部署到不同环境
wrangler deploy --env staging
wrangler deploy --env production
```

### 全球部署策略

Cloudflare Workers自动在全球边缘部署，无需额外配置。主要优势：

- **亚洲**: 首尔、东京、新加坡等
- **欧洲**: 伦敦、法兰克福、阿姆斯特丹等  
- **美洲**: 纽约、旧金山、圣保罗等
- **大洋洲**: 悉尼、奥克兰等

## 🎉 部署完成

部署成功后，您的Code Review Agent将在以下地址可用：

- **Worker URL**: `https://code-review-agent.your-subdomain.workers.dev`
- **自定义域名**: `https://code-review.yourdomain.com` (如已配置)
- **API文档**: `https://your-domain/openapi.json`
- **Playground**: `https://your-domain/` (Mastra内置界面)

恭喜！您的AI代码审查服务现在已在Cloudflare的全球网络上运行！ 🚀