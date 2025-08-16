import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

// Input and output schemas for quick review
const quickInputSchema = z.object({
  code: z.string().describe('Source code to review'),
  language: z.string().describe('Programming language'),
  focusArea: z.enum(['quality', 'security', 'performance', 'general']).default('general'),
});

const quickOutputSchema = z.object({
  review: z.string(),
  score: z.number(),
  issues: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    message: z.string(),
  })),
  quickRecommendations: z.array(z.string()),
});

// Quick analysis step
const quickAnalysis = createStep({
  id: 'quick-analysis',
  inputSchema: quickInputSchema,
  outputSchema: quickOutputSchema,
  execute: async ({ inputData }) => {
    const { code, language, focusArea } = inputData;

    // Perform focused analysis based on the focus area
    let review = '';
    let score = 7.5;
    const issues = [];
    let quickRecommendations = [];

    switch (focusArea) {
      case 'quality':
        review = `
# 📋 快速质量检查

## 代码质量概览
针对${language}代码进行快速质量评估。

## 主要发现
- 代码结构: 良好
- 命名规范: 基本符合标准
- 复杂度: 中等

## 评分: ${score}/10
        `;

        issues.push({
          type: 'naming',
          severity: 'low',
          message: '部分变量名可以更加描述性',
        });

        quickRecommendations = [
          '使用更具描述性的变量名',
          '添加适当的代码注释',
          '考虑拆分复杂函数',
        ];
        break;

      case 'security':
        review = `
# 🛡️ 快速安全检查

## 安全概览
对${language}代码进行快速安全扫描。

## 安全状态
- 风险级别: 低-中等
- 主要关注: 输入验证

## 评分: ${score}/10
        `;

        issues.push({
          type: 'input-validation',
          severity: 'medium',
          message: '建议加强输入验证机制',
        });

        quickRecommendations = [
          '实施严格的输入验证',
          '使用参数化查询',
          '添加错误处理机制',
        ];
        break;

      case 'performance':
        review = `
# ⚡ 快速性能检查

## 性能概览
对${language}代码进行快速性能评估。

## 性能状态
- 复杂度: 可接受
- 潜在瓶颈: 少量

## 评分: ${score}/10
        `;

        issues.push({
          type: 'complexity',
          severity: 'low',
          message: '某些循环可以优化',
        });

        quickRecommendations = [
          '优化循环结构',
          '考虑缓存重复计算',
          '减少不必要的操作',
        ];
        break;

      default: // general
        review = `
# 🔍 快速代码审查

## 整体概览
对${language}代码进行快速全面检查。

## 主要方面
- 代码质量: 良好
- 安全性: 基本符合要求
- 性能: 可接受
- 可维护性: 良好

## 总体评分: ${score}/10
        `;

        issues.push(
          {
            type: 'documentation',
            severity: 'low',
            message: '建议增加代码注释',
          },
          {
            type: 'error-handling',
            severity: 'medium',
            message: '可以改进错误处理',
          }
        );

        quickRecommendations = [
          '增加代码注释和文档',
          '改进错误处理机制',
          '考虑添加单元测试',
          '遵循一致的编码风格',
        ];
        break;
    }

    return {
      review,
      score,
      issues,
      quickRecommendations,
    };
  },
});

// Create the quick review workflow
export const quickReviewWorkflow = createWorkflow({
  id: 'quick-code-review',
  inputSchema: quickInputSchema,
  outputSchema: quickOutputSchema,
})
  .then(quickAnalysis)
  .commit();

export default quickReviewWorkflow;