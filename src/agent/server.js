import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  performCodeReview, 
  performSecurityCheck, 
  performPerformanceAnalysis 
} from './codeReviewAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.AGENT_PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Code Review Agent',
    timestamp: new Date().toISOString()
  });
});

// 代码审查API端点
app.post('/api/code-review', async (req, res) => {
  try {
    const { code, language = 'javascript', context = '' } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: '请提供要审查的代码' 
      });
    }

    console.log(`开始代码审查 - 语言: ${language}, 代码长度: ${code.length}`);

    const result = await performCodeReview(code, language, context);

    res.json({
      success: true,
      data: {
        review: result,
        language,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('代码审查错误:', error);
    res.status(500).json({ 
      error: '代码审查失败', 
      details: error.message 
    });
  }
});

// 安全性检查API端点
app.post('/api/security-check', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: '请提供要检查的代码' 
      });
    }

    console.log(`开始安全性检查 - 语言: ${language}`);

    const result = await performSecurityCheck(code, language);

    res.json({
      success: true,
      data: {
        securityReport: result,
        language,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('安全性检查错误:', error);
    res.status(500).json({ 
      error: '安全性检查失败', 
      details: error.message 
    });
  }
});

// 性能分析API端点
app.post('/api/performance-analysis', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: '请提供要分析的代码' 
      });
    }

    console.log(`开始性能分析 - 语言: ${language}`);

    const result = await performPerformanceAnalysis(code, language);

    res.json({
      success: true,
      data: {
        performanceReport: result,
        language,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('性能分析错误:', error);
    res.status(500).json({ 
      error: '性能分析失败', 
      details: error.message 
    });
  }
});

// 综合分析端点（包含所有分析类型）
app.post('/api/comprehensive-review', async (req, res) => {
  try {
    const { code, language = 'javascript', context = '', includeAnalysis = [] } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: '请提供要分析的代码' 
      });
    }

    console.log(`开始综合分析 - 语言: ${language}, 包含: ${includeAnalysis.join(', ')}`);

    const results = {};

    // 基础代码审查（总是包含）
    results.codeReview = await performCodeReview(code, language, context);

    // 可选的额外分析
    if (includeAnalysis.includes('security')) {
      results.securityCheck = await performSecurityCheck(code, language);
    }

    if (includeAnalysis.includes('performance')) {
      results.performanceAnalysis = await performPerformanceAnalysis(code, language);
    }

    res.json({
      success: true,
      data: {
        ...results,
        language,
        includedAnalysis: ['codeReview', ...includeAnalysis],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('综合分析错误:', error);
    res.status(500).json({ 
      error: '综合分析失败', 
      details: error.message 
    });
  }
});

// 获取支持的编程语言
app.get('/api/supported-languages', (req, res) => {
  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'csharp', label: 'C#', icon: '🔷' },
    { value: 'cpp', label: 'C++', icon: '⚙️' },
    { value: 'c', label: 'C', icon: '⚙️' },
    { value: 'go', label: 'Go', icon: '🔵' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'swift', label: 'Swift', icon: '🦉' },
    { value: 'kotlin', label: 'Kotlin', icon: '🟣' },
    { value: 'scala', label: 'Scala', icon: '🔴' },
    { value: 'sql', label: 'SQL', icon: '🗃️' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' }
  ];

  res.json({
    success: true,
    data: supportedLanguages
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ 
    error: '内部服务器错误', 
    details: error.message 
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    path: req.path 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 代码审查Agent服务器已启动`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
  console.log(`📝 API文档: http://localhost:${PORT}/api/*`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

export default app;