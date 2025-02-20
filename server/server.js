const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const config = require('./config');

const app = express();
const port = config.server.port;

// 配置CORS和JSON解析
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 处理聊天请求
app.post('/chat', async (req, res) => {
    let responseStream;
    try {
        const { messages } = req.body;

        // 验证请求参数
        if (!messages || !Array.isArray(messages)) {
            throw new Error('无效的请求参数');
        }

        const response = await fetch(config.api.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.api.key}`
            },
            body: JSON.stringify({
                model: config.api.model,
                messages: [
                    config.systemMessage,
                    ...messages
                ],
                temperature: 0.6,
                stream: true
            }),
            timeout: config.api.timeout
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        // 设置SSE响应头
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // 处理流式响应
        responseStream = response.body;
        const decoder = new TextDecoder();
        let buffer = '';

        responseStream.on('data', chunk => {
            try {
                const text = decoder.decode(chunk);
                const lines = text.split('\n');

                lines.forEach(line => {
                    if (line.trim() === '') return;
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (jsonStr === '[DONE]') return;
                        const jsonData = JSON.parse(jsonStr);
                        if (jsonData.choices && jsonData.choices[0].delta) {
                            const content = jsonData.choices[0].delta.content || '';
                            const reasoningContent = jsonData.choices[0].delta.reasoning_content || '';
                            const message = content || reasoningContent;
                            if (message) {
                                res.write(`data: ${message}\n\n`);
                            }
                        }
                    }
                });
            } catch (e) {
                console.error('处理数据流时发生错误:', e);
            }
        });

        // 处理流结束
        responseStream.on('end', () => {
            res.end();
        });

        // 处理流错误
        responseStream.on('error', error => {
            console.error('数据流处理错误:', error);
            res.end();
        });

    } catch (error) {
        console.error('API请求错误:', error);
        // 如果响应头还未发送，则发送错误响应
        if (!res.headersSent) {
            res.status(500).json({ 
                error: '服务器内部错误',
                message: error.message
            });
        } else {
            // 如果响应头已发送，则结束响应
            res.end();
        }
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});