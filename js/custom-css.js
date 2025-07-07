// 添加loading样式
function addLoadingStyles() {
    const style = document.createElement('style');
    style.id = 'math-loading-style';
    style.textContent = `
        .math-loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            transition: opacity 0.4s ease;
        }
        
        .math-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(52, 152, 219, 0.2);
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .content-hidden {
            opacity: 0.3;
            pointer-events: none;
        }
        
        .content-visible {
            opacity: 1;
            pointer-events: auto;
        }
    `;
    document.head.appendChild(style);
}

// 显示loading
function showLoading() {
    // 隐藏主要内容
    const articleContent = document.querySelector('.article-entry');
    if (articleContent) {
        articleContent.classList.add('content-hidden');
    }
    
    // 创建loading遮罩
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'math-loading-overlay';
    loadingDiv.id = 'math-loading';
    loadingDiv.innerHTML = '<div class="math-loading-spinner"></div>';
    document.body.appendChild(loadingDiv);
}

// 隐藏loading
function hideLoading() {
    const loadingDiv = document.getElementById('math-loading');
    if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            loadingDiv.remove();
        }, 100);
    }
    
    // 显示主要内容
    const articleContent = document.querySelector('.article-entry');
    if (articleContent) {
        articleContent.classList.remove('content-hidden');
        articleContent.classList.add('content-visible');
    }
}

// 数学公式初始化函数
function initializeMath() {
    // TOC 初始化
    var tocElement = document.querySelector('#toc');
    if (tocElement && !tocElement.classList.contains('is-sticky')) {
        tocElement.classList.add('is-sticky');
    }
    
    let mathPromises = [];
    
    // 数学公式重新渲染 - MathJax
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        const mathPromise = MathJax.typesetPromise([document.body]).catch(function (err) {
            console.log('MathJax typeset failed: ' + err.message);
        });
        mathPromises.push(mathPromise);
    }
    
    // 数学公式重新渲染 - KaTeX
    if (typeof katex !== 'undefined' && typeof renderMathInElement !== 'undefined') {
        const katexPromise = new Promise((resolve) => {
            try {
                renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ]
                });
                resolve();
            } catch (err) {
                console.log('KaTeX render failed: ' + err.message);
                resolve();
            }
        });
        mathPromises.push(katexPromise);
    }
    
    // 等待数学公式渲染完成后隐藏loading
    Promise.all(mathPromises).then(() => {
        setTimeout(hideLoading, 100);
    });
    
    // 如果没有数学公式库，直接隐藏loading
    if (mathPromises.length === 0) {
        setTimeout(hideLoading, 100);
    }
    
    // 评论系统由Icarus主题处理
}

// 页面首次加载
document.addEventListener('DOMContentLoaded', function() {
    addLoadingStyles();
    
    // 检查是否有数学公式内容
    const hasKaTeX = document.querySelector('.katex, [data-katex]');
    const hasMathJax = document.querySelector('.MathJax, script[type*="math"], .math');
    const hasMathContent = document.body.textContent.includes('$$') || 
                          document.body.textContent.includes('\\(') || 
                          document.body.textContent.includes('\\[');
    
    if (hasKaTeX || hasMathJax || hasMathContent) {
        showLoading();
    }
    
    // 延迟执行，确保所有资源加载完成
    setTimeout(initializeMath, 100);
});

// PJAX 页面切换后重新初始化
document.addEventListener('pjax:complete', function() {
    // PJAX切换时也需要重新初始化
    const hasMathContent = document.body.textContent.includes('$$') || 
                          document.body.textContent.includes('\\(') || 
                          document.body.textContent.includes('\\[');
    
    if (hasMathContent) {
        showLoading();
    }
    
    setTimeout(initializeMath, 100);
});
