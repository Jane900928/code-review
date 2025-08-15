import { Agent } from '@mastra/core/agent';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import dotenv from 'dotenv';

dotenv.config();

// DeepSeek AI配置 - 使用OpenAI兼容模式
const deepseek = createOpenAICompatible({
  name: 'deepseek',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
  headers: {
    'User-Agent': 'Mastra-CodeReview/1.0.0'
  }
});

/**
 * 代码审查Agent - 使用DeepSeek AI模型进行智能代码分析
 */
export const codeReviewAgent = new Agent({
  name: 'code-reviewer',
  instructions: `
    你是一个专业的代码审查专家，具备以下能力：
    
    1. **代码质量分析**：
       - 检查代码结构和组织
       - 评估可读性和可维护性
       - 识别代码异味和反模式
       - 检查命名约定和编码规范
    
    2. **安全性检查**：
       - 检测潜在的安全漏洞
       - 识别不安全的编程实践
       - 提供安全修复建议
       - 检查输入验证和数据处理
    
    3. **性能优化**：
       - 分析性能瓶颈
       - 提供优化建议
       - 推荐最佳实践
       - 评估算法复杂度
    
    4. **代码规范**：
       - 检查编码风格一致性
       - 验证文档和注释质量
       - 确保最佳实践遵循
    
    请提供详细的分析报告，包括：
    - 问题描述和具体位置
    - 严重级别（高/中/低）
    - 修复建议和改进方案
    - 改进后的代码示例（如果适用）
    
    使用markdown格式输出，确保结构清晰易读。对于每个发现的问题，使用适当的emoji标识严重程度：
    - 🔴 高风险问题
    - 🟡 中等问题  
    - 🟢 建议改进
    - ✅ 良好实践
  `,
  model: deepseek('deepseek-chat'),
});

/**
 * 执行代码审查
 * @param {string} code - 要审查的代码
 * @param {string} language - 编程语言
 * @param {string} context - 额外上下文信息
 * @returns {Promise<string>} - 审查结果
 */
export async function performCodeReview(code, language = 'javascript', context = '') {
  try {
    const prompt = `
请对以下${language}代码进行全面审查：

${context ? `**上下文信息**：${context}\n` : ''}

**代码内容**：
\`\`\`${language}
${code}
\`\`\`

请提供详细的代码审查报告，包括代码质量、安全性、性能等方面的分析。
    `;

    const result = await codeReviewAgent.generate(prompt);
    return result.text;
  } catch (error) {
    console.error('代码审查失败:', error);
    throw new Error(`代码审查失败: ${error.message}`);
  }
}

/**
 * 代码安全性专项检查
 * @param {string} code - 要检查的代码
 * @param {string} language - 编程语言
 * @returns {Promise<string>} - 安全性检查结果
 */
export async function performSecurityCheck(code, language = 'javascript') {
  try {
    const securityAgent = new Agent({
      name: 'security-checker',
      instructions: `
        你是一个网络安全专家，专门进行代码安全审计。请提供详细的安全性分析，包括风险等级和修复建议。
        
        重点关注：
        1. SQL注入漏洞
        2. XSS攻击风险
        3. 身份验证绕过
        4. 敏感信息泄露
        5. 不安全的依赖使用
        6. 权限控制问题
        7. 输入验证缺陷
        8. 加密实现问题
        
        对每个发现的安全问题，请提供：
        - 🔴 严重程度评级
        - 📝 详细描述
        - 🛠️ 修复建议
        - 💡 安全最佳实践
      `,
      model: deepseek('deepseek-chat'),
    });

    const prompt = `
请专门针对以下${language}代码进行安全性检查：

\`\`\`${language}
${code}
\`\`\`

请提供详细的安全性分析报告。
    `;

    const result = await securityAgent.generate(prompt);
    return result.text;
  } catch (error) {
    console.error('安全性检查失败:', error);
    throw new Error(`安全性检查失败: ${error.message}`);
  }
}

/**
 * 性能优化建议
 * @param {string} code - 要分析的代码
 * @param {string} language - 编程语言
 * @returns {Promise<string>} - 性能优化建议
 */
export async function performPerformanceAnalysis(code, language = 'javascript') {
  try {
    const performanceAgent = new Agent({
      name: 'performance-analyzer',
      instructions: `
        你是一个性能优化专家，专门分析代码性能并提供优化建议。请提供实用的优化方案和改进后的代码示例。
        
        重点分析：
        1. 算法复杂度（时间和空间）
        2. 内存使用效率
        3. 循环优化机会
        4. 数据结构选择
        5. 异步操作优化
        6. 缓存策略
        7. 数据库查询优化
        8. 网络请求优化
        
        对每个性能问题，请提供：
        - ⚡ 性能影响程度
        - 📊 具体分析
        - 🚀 优化建议
        - 💻 改进代码示例
      `,
      model: deepseek('deepseek-chat'),
    });

    const prompt = `
请对以下${language}代码进行性能分析：

\`\`\`${language}
${code}
\`\`\`

请提供具体的性能优化建议和改进方案。
    `;

    const result = await performanceAgent.generate(prompt);
    return result.text;
  } catch (error) {
    console.error('性能分析失败:', error);
    throw new Error(`性能分析失败: ${error.message}`);
  }
}

/**
 * 代码质量评估
 * @param {string} code - 要评估的代码
 * @param {string} language - 编程语言
 * @returns {Promise<string>} - 质量评估结果
 */
export async function performQualityAssessment(code, language = 'javascript') {
  try {
    const qualityAgent = new Agent({
      name: 'quality-assessor',
      instructions: `
        你是一个代码质量专家，专门评估代码质量并提供改进建议。
        
        评估维度：
        1. 可读性和清晰度
        2. 可维护性
        3. 模块化程度
        4. 错误处理
        5. 文档和注释
        6. 测试覆盖度建议
        7. 设计模式应用
        8. SOLID原则遵循
        
        提供：
        - 📏 质量评分（0-10分）
        - 🎯 主要问题总结
        - 📋 详细改进建议
        - ✨ 重构建议
      `,
      model: deepseek('deepseek-chat'),
    });

    const prompt = `
请对以下${language}代码进行质量评估：

\`\`\`${language}
${code}
\`\`\`

请提供全面的代码质量分析报告。
    `;

    const result = await qualityAgent.generate(prompt);
    return result.text;
  } catch (error) {
    console.error('质量评估失败:', error);
    throw new Error(`质量评估失败: ${error.message}`);
  }
}