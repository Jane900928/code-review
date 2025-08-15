import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const codeAnalysisTool = createTool({
  id: 'code-analysis-tool',
  description: 'Analyzes code for quality, structure, and best practices',
  inputSchema: z.object({
    code: z.string().describe('Source code to analyze'),
    language: z.string().describe('Programming language of the code'),
    analysisType: z.enum(['quality', 'structure', 'patterns', 'complexity']).describe('Type of analysis to perform'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(10).describe('Quality score from 0-10'),
    issues: z.array(z.object({
      type: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      message: z.string(),
      line: z.number().optional(),
      suggestion: z.string().optional(),
    })).describe('List of identified issues'),
    metrics: z.object({
      complexity: z.number().optional(),
      maintainability: z.number().optional(),
      readability: z.number().optional(),
      testability: z.number().optional(),
    }).describe('Code quality metrics'),
    recommendations: z.array(z.string()).describe('Improvement recommendations'),
  }),
  execute: async ({ context }) => {
    const { code, language, analysisType } = context;
    
    // Simulate code analysis (in a real implementation, this would use actual static analysis tools)
    const lines = code.split('\n');
    const issues = [];
    let score = 8; // Base score
    
    // Basic analysis heuristics
    if (code.length < 50) {
      issues.push({
        type: 'length',
        severity: 'low' as const,
        message: 'Code snippet is very short, limited analysis possible',
        suggestion: 'Provide more substantial code for better analysis'
      });
    }
    
    // Check for common issues based on language
    if (language === 'javascript' || language === 'typescript') {
      // Check for var usage
      if (code.includes('var ')) {
        issues.push({
          type: 'outdated-syntax',
          severity: 'medium' as const,
          message: 'Usage of var detected',
          suggestion: 'Use let or const instead of var'
        });
        score -= 0.5;
      }
      
      // Check for console.log
      if (code.includes('console.log')) {
        issues.push({
          type: 'debugging',
          severity: 'low' as const,
          message: 'Console.log statements found',
          suggestion: 'Remove debug statements before production'
        });
        score -= 0.2;
      }
    }
    
    // Check for long functions
    const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g);
    if (functionMatches) {
      functionMatches.forEach((func, index) => {
        const funcLines = func.split('\n').length;
        if (funcLines > 20) {
          issues.push({
            type: 'complexity',
            severity: 'medium' as const,
            message: `Function ${index + 1} is too long (${funcLines} lines)`,
            suggestion: 'Consider breaking down into smaller functions'
          });
          score -= 0.5;
        }
      });
    }
    
    // Calculate metrics
    const complexity = Math.min(10, Math.max(1, lines.length / 10));
    const maintainability = Math.max(1, score);
    const readability = code.includes('//') || code.includes('/*') ? 8 : 6;
    const testability = code.includes('export') || code.includes('module.exports') ? 7 : 5;
    
    const recommendations = [];
    if (score < 7) {
      recommendations.push('Consider refactoring to improve code quality');
    }
    if (!code.includes('//') && !code.includes('/*')) {
      recommendations.push('Add comments to improve code documentation');
    }
    recommendations.push('Follow consistent naming conventions');
    recommendations.push('Consider adding unit tests');
    
    return {
      score: Math.max(1, Math.min(10, score)),
      issues,
      metrics: {
        complexity,
        maintainability,
        readability,
        testability,
      },
      recommendations,
    };
  },
});

export default codeAnalysisTool;