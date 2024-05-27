import dotenv from "dotenv"
import { OpenAI } from "openai"

dotenv.config();

const userQuestion = "Given an quadratic equation - 'X^2 + 4x + 4 = 0', Solve it to find the value of 'X'."

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });

async function main() {
    try {
        const assistant = await openai.beta.assistants.create({
            name: "AI Assistant",
            instructions: "You are a personal math tutor. Write and run code to answer math questions.",
            tools: [{ type: "code_interpreter" }],
            model: "gpt-4o",
        });

        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: userQuestion,
        });

        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id,
        });

        let runStatus = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id
        );

        while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        const messages = await openai.beta.threads.messages.list(thread.id);

        const lastMessageForRun = messages.data
            .filter(
                (message) => message.run_id === run.id && message.role === "assistant"
            )
            .pop();

        if (lastMessageForRun) {
            console.log(`${lastMessageForRun.content[0].text.value}`);
        }
    } catch (error) {
        console.error(error);
    }
}

main();