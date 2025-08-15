import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CodeBlock from './CodeBlock';
import MessageRenderer from './MessageRenderer';

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3001';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '您好！我是AI代码审查助手 🤖\n\n我可以帮您：\n- 📋 分析代码质量和结构\n- 🛡️ 检测安全漏洞\n- ⚡ 提供性能优化建议\n- 📏 评估代码可维护性\n- 🎯 推荐最佳实践\n\n请粘贴您的代码，我将为您提供详细的审查报告！',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [analysisOptions, setAnalysisOptions] = useState({
    security: false,
    performance: false,
    quality: false
  });
  const [agentStats, setAgentStats] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 获取支持的编程语言和Agent统计
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [languagesRes, statsRes] = await Promise.all([
          axios.get(`${AGENT_URL}/api/supported-languages`),
          axios.get(`${AGENT_URL}/api/stats`)
        ]);
        
        setSupportedLanguages(languagesRes.data.data);
        setAgentStats(statsRes.data.data);
      } catch (error) {
        console.error('获取初始数据失败:', error);
        // 设置默认语言列表
        setSupportedLanguages([
          { value: 'javascript', label: 'JavaScript', icon: '🟨' },
          { value: 'typescript', label: 'TypeScript', icon: '🔷' },
          { value: 'python', label: 'Python', icon: '🐍' },
          { value: 'java', label: 'Java', icon: '☕' },
          { value: 'csharp', label: 'C#', icon: '🔷' },
          { value: 'go', label: 'Go', icon: '🔵' },
        ]);
      }
    };
    fetchData();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: Date.now() + Math.random(),
      timestamp: new Date()
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // 添加用户消息
    const userMessage = {
      type: 'user',
      content: inputText,
      language: selectedLanguage,
      analysisOptions
    };
    addMessage(userMessage);

    // 清空输入
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // 检测是否包含代码
      const codePattern = /```[\s\S]*```|`[^`]+`|\b(function|class|def|public|private|import|from|include|const|let|var)\b/;
      const hasCode = codePattern.test(currentInput);

      let endpoint = '/api/code-review';
      let payload = {
        code: currentInput,
        language: selectedLanguage,
        context: hasCode ? `用户提交了${selectedLanguage}代码进行审查` : '用户咨询'
      };

      // 如果启用了额外分析选项，使用综合分析端点
      const enabledAnalysis = Object.keys(analysisOptions).filter(key => analysisOptions[key]);
      if (enabledAnalysis.length > 0 && hasCode) {
        endpoint = '/api/comprehensive-review';
        payload.includeAnalysis = enabledAnalysis;
      }

      const response = await axios.post(`${AGENT_URL}${endpoint}`, payload, {
        timeout: 60000, // 60秒超时
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        let content = '';

        if (data.codeReview) {
          content += data.codeReview;
        } else if (data.review) {
          content += data.review;
        }

        if (data.securityCheck) {
          content += '\n\n---\n\n## 🛡️ 安全性分析报告\n\n' + data.securityCheck;
        }

        if (data.performanceAnalysis) {
          content += '\n\n---\n\n## ⚡ 性能分析报告\n\n' + data.performanceAnalysis;
        }

        if (data.qualityAssessment) {
          content += '\n\n---\n\n## 📏 质量评估报告\n\n' + data.qualityAssessment;
        }

        addMessage({
          type: 'assistant',
          content: content || '抱歉，未能生成有效的分析结果。',
          language: data.language,
          analysisType: data.analysisType || (enabledAnalysis.length > 0 ? 'comprehensive' : 'basic'),
          includedAnalysis: data.includedAnalysis
        });
      } else {
        throw new Error(response.data.error || '分析失败');
      }
    } catch (error) {
      console.error('分析错误:', error);
      
      let errorMessage = '抱歉，分析过程中出现错误。';
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请稍后重试。';
      } else if (error.response?.status === 429) {
        errorMessage = 'API调用频率限制，请稍后重试。';
      } else if (error.response?.status === 500) {
        errorMessage = '服务器内部错误，请检查Agent服务状态。';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      addMessage({
        type: 'assistant',
        content: `❌ ${errorMessage}\n\n**故障排查建议：**\n- 检查Agent服务是否正在运行 (http://localhost:3001/health)\n- 验证DeepSeek API配置是否正确\n- 确认网络连接正常\n- 查看控制台日志获取详细错误信息`,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: '对话已清空。请粘贴新的代码开始审查！🚀',
        timestamp: new Date()
      }
    ]);
  };

  const insertSampleCode = () => {
    const sampleCode = `function calculateTax(income, rate) {
  if (income <= 0) {
    return 0;
  }
  return income * rate;
}

// 使用示例
const salary = 50000;
const taxRate = 0.25;
const tax = calculateTax(salary, taxRate);
console.log("Tax amount: " + tax);`;

    setInputText(sampleCode);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[800px]">
      {/* 聊天头部 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-xl">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🤖</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI代码审查对话
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  基于Mastra框架和DeepSeek AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {agentStats && (
                <div className="hidden md:flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>📊 {agentStats.totalReviews}+ 次审查</span>
                  <span>🌐 {agentStats.supportedLanguages} 种语言</span>
                </div>
              )}
              
              <button
                onClick={clearChat}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🗑️ 清空
              </button>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {isLoading ? '分析中...' : '就绪'}
                </span>
              </div>
            </div>
          </div>
          
          {/* 设置面板 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 语言选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🌐 编程语言
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 分析选项 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔬 额外分析选项
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analysisOptions.security}
                    onChange={(e) => setAnalysisOptions(prev => ({
                      ...prev,
                      security: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🛡️ 安全性</span>
                </label>
                
                <label className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analysisOptions.performance}
                    onChange={(e) => setAnalysisOptions(prev => ({
                      ...prev,
                      performance: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">⚡ 性能</span>
                </label>
                
                <label className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analysisOptions.quality}
                    onChange={(e) => setAnalysisOptions(prev => ({
                      ...prev,
                      quality: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">📏 质量</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 shadow-sm ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : message.isError
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <MessageRenderer 
                content={message.content} 
                language={message.language}
                isUser={message.type === 'user'}
                isError={message.isError}
              />
              <div className={`text-xs mt-2 flex items-center justify-between ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <span>{message.timestamp.toLocaleTimeString()}</span>
                <div className="flex items-center space-x-2">
                  {message.language && message.type === 'user' && (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                      {supportedLanguages.find(l => l.value === message.language)?.icon} {message.language}
                    </span>
                  )}
                  {message.analysisType && (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                      {message.analysisType === 'comprehensive' ? '🔬 综合' : '📋 基础'}
                    </span>
                  )}
                  {message.includedAnalysis && message.includedAnalysis.length > 1 && (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                      +{message.includedAnalysis.length - 1} 项分析
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* 加载指示器 */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  AI正在分析您的代码...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="粘贴您的代码或输入问题..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[100px] max-h-[300px] font-mono text-sm transition-colors"
                disabled={isLoading}
              />
              <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>按 Enter 发送，Shift+Enter 换行</span>
                  <button
                    type="button"
                    onClick={insertSampleCode}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    📝 插入示例代码
                  </button>
                </div>
                <span className={`${inputText.length > 10000 ? 'text-red-500' : ''}`}>
                  {inputText.length} / 10000 字符
                </span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || inputText.length > 10000}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>分析中</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>发送</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;