import { useState, useEffect } from 'react';
import { marked } from 'marked';
import CodeBlock from './CodeBlock';

const MessageRenderer = ({ content, language, isUser = false, isError = false }) => {
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    const renderContent = async () => {
      if (isUser) {
        // 用户消息简单处理，保持代码格式
        const formattedContent = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
          return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-2 overflow-x-auto"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
        });
        setRenderedContent(formattedContent);
        return;
      }

      // AI助手消息使用markdown渲染
      try {
        // 配置marked选项
        marked.setOptions({
          highlight: function(code, lang) {
            // 这里可以集成代码高亮库
            return code;
          },
          breaks: true,
          gfm: true,
        });

        // 自定义渲染器
        const renderer = new marked.Renderer();
        
        // 自定义代码块渲染
        renderer.code = function(code, language, escaped) {
          const lang = language || 'text';
          return `<div class="code-block-wrapper my-4">
            <div class="code-block-header bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${lang}</span>
              <button onclick="copyToClipboard(this)" class="copy-btn text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                复制
              </button>
            </div>
            <pre class="bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg overflow-x-auto"><code class="language-${lang}">${escapeHtml(code)}</code></pre>
          </div>`;
        };

        // 自定义内联代码渲染
        renderer.codespan = function(code) {
          return `<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400">${escapeHtml(code)}</code>`;
        };

        // 自定义表格渲染
        renderer.table = function(header, body) {
          return `<div class="overflow-x-auto my-4">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead class="bg-gray-50 dark:bg-gray-800">${header}</thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">${body}</tbody>
            </table>
          </div>`;
        };

        // 自定义表格头渲染
        renderer.tablerow = function(content) {
          return `<tr>${content}</tr>`;
        };

        renderer.tablecell = function(content, flags) {
          const type = flags.header ? 'th' : 'td';
          const className = flags.header 
            ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
            : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100';
          return `<${type} class="${className}">${content}</${type}>`;
        };

        // 自定义链接渲染
        renderer.link = function(href, title, text) {
          return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${text}</a>`;
        };

        // 自定义列表渲染
        renderer.list = function(body, ordered) {
          const type = ordered ? 'ol' : 'ul';
          const className = ordered 
            ? 'list-decimal list-inside space-y-1 my-3 pl-4'
            : 'list-disc list-inside space-y-1 my-3 pl-4';
          return `<${type} class="${className}">${body}</${type}>`;
        };

        renderer.listitem = function(text) {
          return `<li class="text-gray-700 dark:text-gray-300">${text}</li>`;
        };

        // 自定义标题渲染
        renderer.heading = function(text, level) {
          const sizes = {
            1: 'text-2xl font-bold',
            2: 'text-xl font-semibold',
            3: 'text-lg font-semibold',
            4: 'text-base font-semibold',
            5: 'text-sm font-semibold',
            6: 'text-xs font-semibold'
          };
          return `<h${level} class="${sizes[level]} text-gray-900 dark:text-white my-4">${text}</h${level}>`;
        };

        // 自定义段落渲染
        renderer.paragraph = function(text) {
          return `<p class="text-gray-700 dark:text-gray-300 my-3 leading-relaxed">${text}</p>`;
        };

        // 自定义强调渲染
        renderer.strong = function(text) {
          return `<strong class="font-semibold text-gray-900 dark:text-white">${text}</strong>`;
        };

        // 自定义斜体渲染
        renderer.em = function(text) {
          return `<em class="italic text-gray-700 dark:text-gray-300">${text}</em>`;
        };

        // 自定义分隔线渲染
        renderer.hr = function() {
          return `<hr class="my-6 border-gray-200 dark:border-gray-700">`;
        };

        // 自定义引用渲染
        renderer.blockquote = function(quote) {
          return `<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">${quote}</blockquote>`;
        };

        const html = marked(content, { renderer });
        setRenderedContent(html);
      } catch (error) {
        console.error('Markdown渲染错误:', error);
        setRenderedContent(escapeHtml(content));
      }
    };

    renderContent();
  }, [content, isUser]);

  // HTML转义函数
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // 复制到剪贴板功能
  useEffect(() => {
    // 为复制按钮添加全局事件处理
    window.copyToClipboard = function(button) {
      const codeBlock = button.closest('.code-block-wrapper').querySelector('code');
      const text = codeBlock.textContent;
      
      navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.className = button.className.replace('text-gray-500', 'text-green-500');
        
        setTimeout(() => {
          button.textContent = originalText;
          button.className = button.className.replace('text-green-500', 'text-gray-500');
        }, 2000);
      }).catch(err => {
        console.error('复制失败:', err);
        button.textContent = '复制失败';
        setTimeout(() => {
          button.textContent = '复制';
        }, 2000);
      });
    };
  }, []);

  if (isError) {
    return (
      <div className="text-red-700 dark:text-red-300">
        <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="text-white">
        <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
      </div>
    );
  }

  return (
    <div className="text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </div>
  );
};

export default MessageRenderer;