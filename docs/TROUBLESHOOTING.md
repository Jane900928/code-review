# Code Review Agent 故障排除指南

## 🚨 "mastra is not defined" 错误解决方案

如果您遇到 `npm run dev` 时的 "mastra is not defined" 错误，请按以下步骤解决：

### 解决方案1: 使用基础配置

1. **确保使用基础配置文件**
   - 项目已包含 `mastra.config.ts` 基础配置
   - 这个配置不包含复杂的依赖，确保能正常启动

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

### 解决方案2: 手动安装CLI

如果上述方法仍有问题，可以手动安装Mastra CLI：

```bash
# 全局安装Mastra CLI
npm install -g mastra@latest

# 或者使用npx运行
npx mastra@latest dev
```

### 解决方案3: 使用Express服务器（回退方案）

如果Mastra CLI仍有问题，您可以直接使用Express服务器：

```bash
# 启动Express API服务器
node src/agent/server.js

# 启动前端界面
npm run web:dev
```

这将启动：
- API服务器: http://localhost:3001
- 前端界面: http://localhost:3000

### 环境要求

确保您的环境满足：
- Node.js 18+
- npm 8+
- 已设置 `OPENAI_API_KEY` 环境变量

### 常见问题

1. **TypeScript编译错误**
   ```bash
   # 清理并重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **端口被占用**
   ```bash
   # 检查端口使用情况
   lsof -i :4111
   
   # 或使用不同端口
   PORT=4112 npm run dev
   ```

3. **依赖版本冲突**
   ```bash
   # 强制重新解析依赖
   npm install --force
   ```

### 验证安装

运行以下命令验证Mastra是否正确安装：

```bash
npx mastra --version
```

如果仍有问题，请查看项目的GitHub Issues或创建新的Issue。