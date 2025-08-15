import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  performCodeReview, 
  performSecurityCheck, 
  performPerformanceAnalysis,
  performQualityAssessment
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
    version: '1.0.0',
    mastra: '@mastra/core@0.13.1',
    model: 'DeepSeek Chat',
    timestamp: new Date().toISOString()
  });
});

// 基础代码审查API端点
app.post('/api/code-review', async (req, res) => {
  try {
    const { code, language = 'javascript', context = '' } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: '请提供要审查的代码' 
      });
    }

    console.log(`🔍 开始代码审查 - 语言: ${language}, 代码长度: ${code.length}`);

    const result = await performCodeReview(code, language, context);

    res.json({
      success: true,
      data: {
        review: result,
        language,
        analysisType: 'basic',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 代码审查错误:', error);
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

    console.log(`🛡️ 开始安全性检查 - 语言: ${language}`);

    const result = await performSecurityCheck(code, language);

    res.json({
      success: true,
      data: {
        securityReport: result,
        language,
        analysisType: 'security',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 安全性检查错误:', error);
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

    console.log(`⚡ 开始性能分析 - 语言: ${language}`);

    const result = await performPerformanceAnalysis(code, language);

    res.json({
      success: true,
      data: {
        performanceReport: result,
        language,
        analysisType: 'performance',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 性能分析错误:', error);
    res.status(500).json({ 
      error: '性能分析失败', 
      details: error.message 
    });
  }
});

// 代码质量评估API端点
app.post('/api/quality-assessment', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: '请提供要评估的代码' 
      });
    }

    console.log(`📏 开始质量评估 - 语言: ${language}`);

    const result = await performQualityAssessment(code, language);

    res.json({
      success: true,
      data: {
        qualityReport: result,
        language,
        analysisType: 'quality',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 质量评估错误:', error);
    res.status(500).json({ 
      error: '质量评估失败', 
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

    console.log(`🔬 开始综合分析 - 语言: ${language}, 包含: ${includeAnalysis.join(', ')}`);

    const results = {};
    const analysisPromises = [];

    // 基础代码审查（总是包含）
    analysisPromises.push(
      performCodeReview(code, language, context).then(result => {
        results.codeReview = result;
      })
    );

    // 可选的额外分析
    if (includeAnalysis.includes('security')) {
      analysisPromises.push(
        performSecurityCheck(code, language).then(result => {
          results.securityCheck = result;
        })
      );
    }

    if (includeAnalysis.includes('performance')) {
      analysisPromises.push(
        performPerformanceAnalysis(code, language).then(result => {
          results.performanceAnalysis = result;
        })
      );
    }

    if (includeAnalysis.includes('quality')) {
      analysisPromises.push(
        performQualityAssessment(code, language).then(result => {
          results.qualityAssessment = result;
        })
      );
    }

    // 并行执行所有分析
    await Promise.all(analysisPromises);

    res.json({
      success: true,
      data: {
        ...results,
        language,
        includedAnalysis: ['codeReview', ...includeAnalysis],
        analysisType: 'comprehensive',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 综合分析错误:', error);
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
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'json', label: 'JSON', icon: '📄' },
    { value: 'yaml', label: 'YAML', icon: '📄' },
    { value: 'xml', label: 'XML', icon: '📄' },
    { value: 'shell', label: 'Shell', icon: '💻' },
    { value: 'bash', label: 'Bash', icon: '💻' },
    { value: 'powershell', label: 'PowerShell', icon: '💻' }
  ];

  res.json({
    success: true,
    data: supportedLanguages
  });
});

// 获取分析选项
app.get('/api/analysis-options', (req, res) => {
  const analysisOptions = [
    {
      id: 'security',
      label: '安全性分析',
      description: '检测安全漏洞和风险',
      icon: '🛡️',
      enabled: true
    },
    {
      id: 'performance',
      label: '性能分析',
      description: '分析性能瓶颈和优化机会',
      icon: '⚡',
      enabled: true
    },
    {
      id: 'quality',
      label: '质量评估',
      description: '评估代码质量和可维护性',
      icon: '📏',
      enabled: true
    }
  ];

  res.json({
    success: true,
    data: analysisOptions
  });
});

// API使用统计（模拟）
app.get('/api/stats', (req, res) => {
  const stats = {
    totalReviews: Math.floor(Math.random() * 1000) + 500,
    activeAgents: 4,
    supportedLanguages: 23,
    averageResponseTime: '2.3s',
    uptime: process.uptime(),
    version: '1.0.0'
  };

  res.json({
    success: true,
    data: stats
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('🚨 服务器错误:', error);
  res.status(500).json({ 
    error: '内部服务器错误', 
    details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'API接口不存在',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /api/supported-languages',
      'GET /api/analysis-options',
      'GET /api/stats',
      'POST /api/code-review',
      'POST /api/security-check',
      'POST /api/performance-analysis',
      'POST /api/quality-assessment',
      'POST /api/comprehensive-review'
    ]
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Code Review Agent 服务器已启动');
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
  console.log(`📝 API端点: http://localhost:${PORT}/api/*`);
  console.log(`🤖 Agent框架: Mastra v0.13.1`);
  console.log(`🧠 AI模型: DeepSeek Chat`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
  console.log('');
  
  // 检查必要的环境变量
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('⚠️  警告: 未设置 DEEPSEEK_API_KEY 环境变量');
    console.warn('   请在 .env 文件中配置 DeepSeek API 密钥');
  }
  
  console.log('✅ 服务器就绪，等待请求...');
});

export default app;