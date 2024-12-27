
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '.env') });
const OpenAI = require( "openai");


const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: process.env.qwenApiKey,//"sk-941ff3a72d354e9e9e4ff53bf43f3138",
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

// 导出函数以供外部调用
module.exports = async function getChatCompletionAnswer(userContent) {
    try {
        // 创建聊天完成请求
        const completion = await openai.chat.completions.create({
            model: "qwen-plus",  // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
            messages: [
                { role: "system", content: `You are a helpful assistant. 
                    if the user asks for lottery clearly, you should reply "lottery";
                    if the user asks for end the lottery clearly, you should reply "lottery";
                    if the user asks for end the re-lottery clearly, you should reply "relottery";
                    if user hasn't decided or has other request, you can just reply "no action";

                    give your answer in json format containing field 'answer', for example {'answer': 'relottery'} if user gives a request of relotterying` },
                { role: "user", content: userContent }
            ],
        });

        // 提取并解析响应内容
        const content = completion.choices[0].message.content;
        const res = JSON.parse(content);

        // 返回提取的答案
        return res.answer;

    } catch (error) {
        console.error("与 OpenAI API 交互时出错:", error);
        throw error; // 或者根据需要返回默认值或其他错误处理逻辑
    }
};