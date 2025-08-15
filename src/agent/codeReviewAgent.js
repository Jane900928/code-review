import { Agent } from '@mastra/core';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// DeepSeek API 配置
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
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
    
    2. **安全性检查**：
       - 检测潜在的安全漏洞
       - 识别不安全的编程实践
       - 提供安全修复建议
    
    3. **性能优化**：
       - 分析性能瓶颈
       - 提供优化建议
       - 推荐最佳实践
    
    4. **代码规范**：
       - 检查编码风格一致性
       - 验证命名约定
       - 确保最佳实践遵循
    
    请提供详细的分析报告，包括：
    - 问题描述
    - 严重级别（高/中/低）
    - 具体位置
    - 修复建议
    - 改进后的代码示例
    
    使用markdown格式输出，确保结构清晰易读。
  `,
  model: {
    provider: 'openai',
    name: 'deepseek-chat',
    toolChoice: 'auto',
  },
  maxTokens: 4000,
  temperature: 0.1, // 较低的温度确保更一致的输出
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

请提供详细的代码审查报告。
    `;

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: codeReviewAgent.instructions
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.1,
    });

    return response.choices[0].message.content;
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
    const prompt = `
请专门针对以下${language}代码进行安全性检查：

\`\`\`${language}
${code}
\`\`\`

重点关注：
1. SQL注入漏洞
2. XSS攻击风险
3. 身份验证绕过
4. 敏感信息泄露
5. 不安全的依赖使用
6. 权限控制问题

请提供详细的安全性分析报告。
    `;

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个网络安全专家，专门进行代码安全审计。请提供详细的安全性分析，包括风险等级和修复建议。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.1,
    });

    return response.choices[0].message.content;
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
    const prompt = `
请对以下${language}代码进行性能分析：

\`\`\`${language}
${code}
\`\`\`

重点分析：
1. 算法复杂度
2. 内存使用效率
3. 循环优化机会
4. 数据结构选择
5. 异步操作优化
6. 缓存策略

请提供具体的性能优化建议和改进方案。
    `;

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个性能优化专家，专门分析代码性能并提供优化建议。请提供实用的优化方案和改进后的代码示例。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.1,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('性能分析失败:', error);
    throw new Error(`性能分析失败: ${error.message}`);
  }
}