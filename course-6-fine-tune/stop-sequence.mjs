import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let response = await openai.chat.completions.create({
    messages: [
        {
            role: "system",
            content: "You're an AI assistant."
        },
        {
            role: "user",
            content: `List some great books to read on the topic of coding.`,
        }
    ],
    model: 'gpt-3.5-turbo',
    max_tokens: 400,
    stop: ['2.']
});


console.log(response.choices[0].message.content)

console.log('-------------------------------------------------------');

response = await openai.chat.completions.create({
    messages: [
        {
            role: "system",
            content: "You're an AI assistant."
        },
        {
            role: "user",
            content: `List some great books to read on the topic of coding.`,
        }
    ],
    model: 'gpt-4o-2024-05-13',
    max_tokens: 400,
    stop: ['6.']
});

console.log(response.choices[0].message.content)