import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Step 1: Create an Assistant

const assistant = await openai.beta.assistants.create({
    instructions:
        "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    name: "Math Tutor",
    tools: [{ type: "code_interpreter" }],
    // tool_resources: {
    //     "code_interpreter": {
    //         "file_ids": [file.id] // May Be .CSV File For Analysis.
    //     }
    // },
    model: "gpt-4-turbo"
});


// Step 2: Create a Thread
const thread = await openai.beta.threads.create();

// Or,
// const messageThread = await openai.beta.threads.create({
//     messages: [
//       {
//         role: "user",
//         content: "Hello, what is AI?"
//       },
//       {
//         role: "user",
//         content: "How does AI work? Explain it in simple terms.",
//       },
//     ],
//   });

// const thread = await openai.beta.threads.create({
//     messages: [
//       {
//         "role": "user",
//         "content": "Create 3 data visualizations based on the trends in this file.",
//         "attachments": [
//           {
//             file_id: file.id,
//             tools: [{type: "code_interpreter"}]
//           }
//         ]
//       }
//     ]
//   });

// Step 3: Add a Message to the Thread
const message = await openai.beta.threads.messages.create(
    thread.id,
    {
        role: "user",
        content: "I need to solve the equation `3x + 11 = 14`. Can you help me?"
    }
);

// Step 4: Create a Run
let run = await openai.beta.threads.runs.createAndPoll(
    thread.id,
    {
        assistant_id: assistant.id,
        instructions: "Please address the user as Jane Doe. The user has a premium account."
    }
);

if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(
        run.thread_id
    );
    for (const message of messages.data.reverse()) {
        console.log(`${message.role} > ${message.content[0].text.value}`);
    }
} else {
    console.log(run.status);
}


