import { useState, useEffect } from 'react';
import hljs from 'highlight.js';

const CodeBlock = ({ code, language = 'javascript', showLineNumbers = true, title = null }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      // 检查语言是否被支持
      const lang = hljs.getLanguage(language) ? language : 'plaintext';
      const result = hljs.highlight(code, { language: lang });
      setHighlightedCode(result.value);
    } catch (error) {
      console.error('代码高亮失败:', error);
      setHighlightedCode(escapeHtml(code));
    }
  }, [code, language]);

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      java: '☕',
      csharp: '🔷',
      cpp: '⚙️',
      c: '⚙️',
      go: '🔵',
      rust: '🦀',
      php: '🐘',
      ruby: '💎',
      swift: '🦉',
      kotlin: '🟣',
      scala: '🔴',
      sql: '🗃️',
      html: '🌐',
      css: '🎨',
      json: '📄',
      xml: '📄',
      yaml: '📄',
      markdown: '📝',
      shell: '💻',
      bash: '💻',
      powershell: '💻',
    };
    return icons[lang] || '📄';
  };

  const getLanguageDisplayName = (lang) => {
    const names = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      csharp: 'C#',
      cpp: 'C++',
      c: 'C',
      go: 'Go',
      rust: 'Rust',
      php: 'PHP',
      ruby: 'Ruby',
      swift: 'Swift',
      kotlin: 'Kotlin',
      scala: 'Scala',
      sql: 'SQL',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      xml: 'XML',
      yaml: 'YAML',
      markdown: 'Markdown',
      shell: 'Shell',
      bash: 'Bash',
      powershell: 'PowerShell',
      plaintext: 'Text',
    };
    return names[lang] || lang.toUpperCase();
  };

  const lines = code.split('\n');

  return (
    <div className="code-block-container my-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      {/* 代码块头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getLanguageIcon(language)}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title || getLanguageDisplayName(language)}
          </span>
          {lines.length > 1 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({lines.length} 行)
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>已复制</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 代码内容 */}
      <div className="relative">
        <pre className="overflow-x-auto p-4 bg-code-bg text-code-text font-mono text-sm leading-relaxed">
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 flex flex-col">
              {lines.map((_, index) => (
                <div
                  key={index}
                  className="h-6 flex items-center justify-end pr-2 text-xs text-gray-500 dark:text-gray-400 select-none"
                >
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          <code
            className={`block ${showLineNumbers ? 'ml-12' : ''} language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;