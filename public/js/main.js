// 获取DOM元素
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loading = document.getElementById('loading');

// 存储对话历史
let messageHistory = [];

// 发送消息函数
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // 清空输入框并禁用发送按钮
    userInput.value = '';
    sendButton.disabled = true;
    loading.style.display = 'block';

    // 添加用户消息到界面
    appendMessage('user', userMessage);

    // 更新对话历史
    messageHistory.push({ role: 'user', content: userMessage });

    try {
        // 发送POST请求
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: messageHistory })
        });

        // 创建AI消息容器
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        aiMessageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(aiMessageDiv);

        let aiResponse = '';

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            // 解码新接收的数据
            const chunk = decoder.decode(value, {stream: true});
            buffer += chunk;

            // 处理完整的数据行
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    aiResponse += data;
                    contentDiv.textContent = aiResponse;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
        }

        // 处理剩余的buffer
        if (buffer && buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            aiResponse += data;
            contentDiv.textContent = aiResponse;
        }

        // 更新对话历史
        messageHistory.push({ role: 'assistant', content: aiResponse });
        // 恢复发送按钮和隐藏加载动画
        sendButton.disabled = false;
        loading.style.display = 'none';

    } catch (error) {
        console.error('发送消息失败:', error);
        appendMessage('ai', '抱歉，发生了一些错误，请稍后再试。');
        // 恢复发送按钮和隐藏加载动画
        sendButton.disabled = false;
        loading.style.display = 'none';
    }
}

// 添加消息到界面
function appendMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    // 将文本内容中的换行符转换为<br>标签
    contentDiv.innerHTML = content.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到最新消息
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 事件监听器
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 自动调整文本框高度
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
});