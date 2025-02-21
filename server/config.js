require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

module.exports = {
    // API配置
    api: {
        key: process.env.API_KEY,
        url: process.env.API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        model: 'deepseek-r1-250120',
        timeout: 60000
    },

    // 服务器配置
    server: {
        port: process.env.PORT || 3000
    },

    // 系统消息配置
    systemMessage: {
        role: 'system',
        content: '你是一个专业的Life Coach，擅长通过对话帮助用户发现自己的潜力，解决生活中的问题，并制定个人成长计划。你的回答应该富有洞察力，同时保持温暖和支持性。'
    }
}