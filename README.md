# Code Review Agent

基于Mastra框架和DeepSeek AI模型构建的智能代码审查Agent。

## 功能特性

- 🤖 集成DeepSeek AI模型进行智能代码分析
- 🔍 全面的代码质量检查
- 🛡️ 安全漏洞检测
- 📊 性能优化建议
- 💬 友好的聊天界面交互
- 🎨 现代化的Web UI
- 🌐 支持多种编程语言
- 📋 详细的分析报告

## 技术栈

- **框架**: Mastra
- **AI模型**: DeepSeek
- **前端**: Next.js + React
- **后端**: Express.js
- **样式**: Tailwind CSS
- **代码高亮**: Highlight.js
- **Markdown渲染**: Marked

## 支持的编程语言

- JavaScript/TypeScript
- Python
- Java
- C#/C/C++
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- SQL
- HTML/CSS
- 以及更多...

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Jane900928/code-review.git
cd code-review
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境变量文件并填入你的配置：

```bash
cp .env.example .env
```

在 `.env` 文件中填入你的DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your_actual_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
AGENT_PORT=3001
NEXT_PUBLIC_AGENT_URL=http://localhost:3001
```

### 4. 启动服务

启动Agent服务器：

```bash
npm run agent:dev
```

启动Web界面（新终端）：

```bash
npm run dev
```

### 5. 访问应用

- Web界面: http://localhost:3000
- Agent API: http://localhost:3001
- 健康检查: http://localhost:3001/health

## 使用方法

### 基础代码审查

1. 在聊天界面中粘贴你的代码
2. 选择合适的编程语言
3. 点击发送获取基础代码审查报告

### 综合分析

1. 启用"安全性"或"性能"选项
2. 提交代码进行全面分析
3. 获取包含多个维度的详细报告

### API使用

#### 基础代码审查

```bash
curl -X POST http://localhost:3001/api/code-review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function example() { console.log(\"Hello\"); }",
    "language": "javascript",
    "context": "这是一个示例函数"
  }'
```

#### 安全性检查

```bash
curl -X POST http://localhost:3001/api/security-check \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SELECT * FROM users WHERE id = " + userId,
    "language": "sql"
  }'
```

#### 性能分析

```bash
curl -X POST http://localhost:3001/api/performance-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "code": "for(let i=0; i<arr.length; i++) { /* ... */ }",
    "language": "javascript"
  }'
```

#### 综合分析

```bash
curl -X POST http://localhost:3001/api/comprehensive-review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "你的代码",
    "language": "javascript",
    "includeAnalysis": ["security", "performance"]
  }'
```

## 项目结构

```
code-review/
├── src/
│   ├── agent/           # Mastra Agent配置
│   │   ├── codeReviewAgent.js
│   │   └── server.js
│   ├── pages/           # Next.js页面
│   │   ├── _app.js
│   │   └── index.js
│   ├── components/      # React组件
│   │   ├── ChatInterface.js
│   │   ├── MessageRenderer.js
│   │   └── CodeBlock.js
│   └── styles/          # 样式文件
│       └── globals.css
├── public/             # 静态资源
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 开发

### 开发模式

```bash
# 同时启动前后端开发服务器
npm run dev & npm run agent:dev
```

### 构建生产版本

```bash
npm run build
npm start
```

### 代码规范

项目使用ESLint进行代码规范检查：

```bash
npm run lint
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | 必填 |
| `DEEPSEEK_BASE_URL` | DeepSeek API基础URL | `https://api.deepseek.com` |
| `AGENT_PORT` | Agent服务端口 | `3001` |
| `NEXT_PUBLIC_AGENT_URL` | Agent服务URL | `http://localhost:3001` |

### Mastra配置

Agent配置在 `src/agent/codeReviewAgent.js` 中，你可以：

- 调整AI模型参数
- 修改指令提示词
- 添加新的分析功能

### 前端配置

- `next.config.js`: Next.js配置
- `tailwind.config.js`: Tailwind CSS配置
- `src/styles/globals.css`: 全局样式

## API文档

### 端点列表

- `GET /health` - 健康检查
- `GET /api/supported-languages` - 获取支持的编程语言
- `POST /api/code-review` - 基础代码审查
- `POST /api/security-check` - 安全性检查
- `POST /api/performance-analysis` - 性能分析
- `POST /api/comprehensive-review` - 综合分析

### 响应格式

```json
{
  "success": true,
  "data": {
    "review": "分析结果...",
    "language": "javascript",
    "timestamp": "2025-08-15T15:30:00.000Z"
  }
}
```

## 故障排除

### 常见问题

1. **Agent服务无法启动**
   - 检查端口3001是否被占用
   - 确认DeepSeek API Key配置正确

2. **前端无法连接Agent**
   - 确认Agent服务正在运行
   - 检查CORS配置

3. **代码分析失败**
   - 检查网络连接
   - 验证API Key是否有效
   - 查看控制台错误信息

### 日志查看

Agent服务会输出详细的日志信息，包括：
- API请求记录
- 错误信息
- 性能指标

## 贡献

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

### 代码规范

- 使用ESLint规范
- 添加适当的注释
- 编写测试用例

## 许可证

MIT License

## 更新日志

### v1.0.0 (2025-08-15)

- ✨ 初始版本发布
- 🤖 集成Mastra框架和DeepSeek AI
- 💬 实现聊天界面
- 🔍 支持多种代码分析功能
- 🎨 现代化UI设计

## 致谢

- [Mastra](https://mastra.ai/) - AI Agent框架
- [DeepSeek](https://www.deepseek.com/) - AI模型提供商
- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

---

如有问题，请提交Issue或联系维护者。