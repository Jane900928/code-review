import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';

const deepseek = createOpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const performanceAgent = new Agent({
  name: 'performance-optimizer',
  instructions: `
    你是一个性能优化专家，专门分析代码性能并提供优化建议。

    **优化领域：**
    1. ⚡ 算法复杂度优化
    2. 🧠 内存使用优化
    3. 🔄 循环和迭代优化
    4. 📊 数据结构优化
    5. 🌐 异步操作优化
    6. 💾 缓存策略优化

    **分析重点：**
    - 时间复杂度和空间复杂度
    - 不必要的计算和重复操作
    - 内存泄漏和资源管理
    - 数据库查询优化
    - 网络请求优化
    - 并发和异步处理

    **性能影响级别：**
    🚨 严重性能问题 - 影响用户体验
    ⚠️ 中等性能问题 - 建议优化
    💡 优化机会 - 可以改进
    ✅ 性能良好 - 符合最佳实践

    **输出内容：**
    - 性能瓶颈识别
    - 复杂度分析 (Big O)
    - 具体优化建议
    - 优化前后对比
    - 性能测试建议
  `,
  model: deepseek('deepseek-chat'),
});

export default performanceAgent;