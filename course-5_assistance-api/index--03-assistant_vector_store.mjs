import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Upload a file with an "assistants" purpose
const file = await openai.files.create({
    file: fs.createReadStream(path.resolve("./course-5_assistance-api/movies.txt")),
    purpose: "assistants",
});

const vectorStore = await openai.beta.vectorStores.create({
    name: "Movie Details - RAG Store",
    file_ids: [file.id]
});

// Create Movie Expert Assistant
const assistant = await openai.beta.assistants.create({
    instructions: `You are great at recommending movies. When asked a question, use the information in the provided file to form a friendly response.
                    If you cannot find the answer in the file, do your best to infer what the answer should be.`,
    name: "Movie Expert",
    tools: [{ type: "file_search" }],
    model: "gpt-3.5-turbo",
    tool_resources: {
        "file_search": {
            "vector_store_ids": [vectorStore.id]
        }
    }
});

// Create a thread
const thread = await openai.beta.threads.create();

const run = await openai.beta.threads.runs.createAndPoll(
    thread.id,
    {
        assistant_id: assistant.id,
        stream: false,
        temperature: 0.7,
        instructions: `Please do not provide annotations in your reply. Only reply about movies in the provided file.
        If questions are not related to movies, respond with "Sorry, I don't know." Keep your answers short.`
    }
);
// console.log(run);

if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(
        run.thread_id
    );

    // console.log(messages.data);

    for (const message of messages.data.reverse()) {
        console.log(`${message.role} | ${message.content[0].text.value}`);
    }
} else {
    console.log(run.status);
}
