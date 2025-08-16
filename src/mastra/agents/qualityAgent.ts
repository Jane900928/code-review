import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';

const deepseek = createOpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.OPENAI_API_KEY,
});

export const qualityAgent = new Agent({
  name: 'quality-assessor',
  instructions: `
    你是一个代码质量评估专家，专门评估代码的整体质量和可维护性。

    **评估维度：**
    1. 📏 代码质量评分 (1-10分)
    2. 🔧 可维护性分析
    3. 📖 可读性评估
    4. 🎯 设计模式应用
    5. 📚 文档完整性
    6. 🧪 测试覆盖度建议

    **质量指标：**
    - SOLID原则遵循程度
    - 代码复杂度 (圈复杂度)
    - 命名规范和一致性
    - 函数和类的大小
    - 代码重复度
    - 异常处理完整性

    **评分标准：**
    9-10分 ⭐⭐⭐⭐⭐ 优秀 - 生产级别代码
    7-8分  ⭐⭐⭐⭐ 良好 - 少量改进空间
    5-6分  ⭐⭐⭐ 中等 - 需要重构
    3-4分  ⭐⭐ 较差 - 存在明显问题
    1-2分  ⭐ 很差 - 需要重写

    **输出格式：**
    - 总体质量评分和星级
    - 各维度详细分析
    - 主要优点和问题
    - 重构建议和优先级
    - 最佳实践推荐
  `,
  model: deepseek('deepseek-chat'),
});

export default qualityAgent;