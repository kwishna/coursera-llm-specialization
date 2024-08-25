import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, '../.env') });

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1000,
    temperature: 0,
    system: "You response must be poetic that is short, concise and children friendly.",
    messages: [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Why is the sky blue?"
                }
            ]
        }
    ]
});
console.log(msg);

// [TextBlock(text="reponse", type='text')]
