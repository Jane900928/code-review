# Code Review Agent - Latest Mastra Framework

基于最新Mastra框架和DeepSeek AI模型构建的智能代码审查Agent，支持Cloudflare Workers部署。

## 🚀 功能特性

- 🤖 **多专业Agent**: 代码质量、安全、性能、质量评估专家
- 🔧 **智能工具**: 代码分析和安全扫描工具
- 📊 **工作流编排**: 快速审查和综合分析工作流
- ☁️ **Cloudflare部署**: 支持一键部署到Cloudflare Workers
- 🎨 **现代化UI**: React + Next.js前端界面
- 🔍 **全面分析**: 质量、安全、性能三重检查

## 📋 技术栈

- **AI框架**: [Mastra](https://mastra.ai/) (最新版本)
- **AI模型**: DeepSeek Chat
- **部署平台**: Cloudflare Workers
- **前端**: Next.js + React + Tailwind CSS
- **后端**: Hono (通过Mastra)
- **类型安全**: TypeScript + Zod

## 🏗️ 项目结构

```
code-review/
├── src/mastra/                 # Mastra应用核心
│   ├── index.ts               # 主配置入口
│   ├── agents/                # AI Agents
│   │   ├── codeReviewAgent.ts
│   │   ├── securityAgent.ts
│   │   ├── performanceAgent.ts
│   │   └── qualityAgent.ts
│   ├── tools/                 # 工具函数
│   │   ├── codeAnalysisTool.ts
│   │   └── securityScanTool.ts
│   └── workflows/             # 工作流
│       ├── comprehensiveReviewWorkflow.ts
│       └── quickReviewWorkflow.ts
├── src/pages/                 # Next.js前端页面
├── src/components/            # React组件
├── wrangler.toml             # Cloudflare配置
└── package.json              # 项目依赖
```

## ⚡ 快速开始

### 1. 环境准备

确保您已安装：
- Node.js 18+
- npm 或 pnpm
- Git

### 2. 克隆项目

```bash
git clone https://github.com/Jane900928/code-review.git
cd code-review
```

### 3. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 4. 环境配置

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入必要配置：

```env
# DeepSeek AI配置 (必需)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Cloudflare配置 (部署时需要)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### 5. 本地开发

启动Mastra开发服务器：

```bash
npm run dev
```

这将启动：
- 🚀 Mastra Playground: http://localhost:4111
- 📊 API文档: http://localhost:4111/openapi.json
- 🧪 Swagger UI: http://localhost:4111/swagger-ui

启动前端界面：

```bash
npm run web:dev
```

访问 http://localhost:3000 查看Web界面。

## 🧪 使用Mastra Playground

Mastra提供了强大的本地开发环境：

1. **Agent测试**: 在 http://localhost:4111 测试各个Agent
2. **工作流调试**: 可视化调试工作流执行过程
3. **工具测试**: 独立测试各个工具函数
4. **API探索**: 通过Swagger UI探索所有API端点

### Agent示例

```bash
# 测试代码审查Agent
curl -X POST http://localhost:4111/api/agents/code-reviewer/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": ["请审查这段JavaScript代码: function add(a, b) { return a + b; }"]}'

# 测试安全专家Agent
curl -X POST http://localhost:4111/api/agents/security-specialist/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": ["检查这段代码的安全性: SELECT * FROM users WHERE id = " + userId"]}'
```

### 工作流示例

```bash
# 快速审查工作流
curl -X POST http://localhost:4111/api/workflows/quick-code-review/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function example() { console.log(\"Hello\"); }",
    "language": "javascript",
    "focusArea": "quality"
  }'

# 综合审查工作流
curl -X POST http://localhost:4111/api/workflows/comprehensive-code-review/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "your code here",
    "language": "javascript",
    "includeSecurityScan": true,
    "includePerformanceAnalysis": true,
    "includeQualityAssessment": true
  }'
```

## ☁️ Cloudflare部署

### 准备工作

1. 创建Cloudflare账号
2. 获取Account ID和API Token
3. 配置环境变量

### 一键部署

```bash
# 构建Mastra应用
npm run build

# 部署到Cloudflare
npm run deploy
```

### 手动部署

```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 部署Worker
wrangler deploy
```

### 环境变量设置

在Cloudflare Dashboard中设置以下secrets：

```bash
# 通过CLI设置
wrangler secret put DEEPSEEK_API_KEY
# 输入您的DeepSeek API Key
```

或通过Cloudflare Dashboard:
1. 进入Workers & Pages
2. 选择您的Worker
3. 进入Settings > Environment Variables
4. 添加DEEPSEEK_API_KEY

### 自定义域名

在 `wrangler.toml` 中配置：

```toml
[[routes]]
pattern = "code-review.yourdomain.com/*"
zone_name = "yourdomain.com"
```

## 🔧 Agent配置

### 代码审查Agent
专注于代码质量、结构和最佳实践分析。

### 安全专家Agent
检测SQL注入、XSS、认证问题等安全漏洞。

### 性能优化Agent
分析算法复杂度、内存使用和性能瓶颈。

### 质量评估Agent
提供综合质量评分和改进建议。

## 🛠️ 工具说明

### 代码分析工具
- 静态代码分析
- 质量指标计算
- 问题检测和建议

### 安全扫描工具
- 漏洞检测
- 风险评估
- CWE标准映射

## 📊 工作流详解

### 快速审查工作流
适合日常开发中的快速代码检查，支持按领域聚焦分析。

### 综合审查工作流
完整的多维度分析，包含所有专业Agent的深度检查。

## 🎨 前端界面

现代化的React前端提供：
- 实时聊天式交互
- 代码高亮显示
- 分析结果可视化
- 响应式设计

## 📈 监控和日志

Mastra内置OpenTelemetry支持：
- 请求追踪
- 性能监控
- 错误日志
- 使用分析

## 🔐 安全配置

- API密钥通过环境变量管理
- Cloudflare Workers安全沙箱
- HTTPS强制加密
- 输入验证和清理

## 🚀 性能优化

- Cloudflare全球CDN
- 边缘计算降低延迟
- 智能缓存策略
- 流式响应支持

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add some feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交Pull Request

## 📝 更新日志

### v2.0.0 (2025-08-15)
- ✨ 升级到最新Mastra框架
- 🏗️ 重构为标准Agent/Tools/Workflows架构
- ☁️ 添加Cloudflare Workers部署支持
- 🔧 新增多个专业Agent
- 📊 实现工作流编排
- 🎨 改进前端界面

### v1.0.0 (2025-08-15)
- 🎉 初始版本发布
- 🤖 基础代码审查功能
- 💬 聊天界面交互

## 📞 支持

- 📖 [Mastra文档](https://mastra.ai/en/docs)
- 🐛 [问题反馈](https://github.com/Jane900928/code-review/issues)
- 💬 [讨论区](https://github.com/Jane900928/code-review/discussions)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**⭐ 如果这个项目对您有帮助，请给个Star支持！**