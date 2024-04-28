import os from "os"
import axios from "axios"
import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import readline from 'readline'

dotenv.config({ path: path.resolve('./.env') });

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const assistantPromptInstruction = `You are a finance expert. 
Your goal is to provide answers based on information from the internet. 
You must use the provided Tavily search API function to find relevant online information. 
You should never use your own knowledge to answer questions.
Please include relevant url sources in the end of your answers.
`;

// "id": "msg_hwHL6CcjfCm3SdkhKzyA19DP",
// "assistant_id": "asst_GbrJSm9RKtGsw5iAC5WdN08d",
// "thread_id": "thread_DR2Pcxyq9hQDH8HwJf0TA00R",
// "run_id": "run_O7rBkIgVdPxVDSZR8aoycq5q",
// "tool_call_id": "call_XBPd4YEcfFHwL6o4YFmfPsQe",

// Function to perform a Tavily search
/**
* Performs a search on the Tavily API and returns the first result.
*
* @param {string} query - The search query to send to the Tavily API.
* @returns {string} The content of the first search result, or 'No Result Found' if no results are returned.
*/
async function tavilySearch(query) {
    try {
        const res = await axios.post("https:/api.tavily.com/search", {
            "api_key": process.env.TAVILY_API_KEY,
            "query": query,
            "search_depth": "basic",
            "include_answer": false,
            "include_images": false,
            "include_raw_content": false,
            "max_results": 1,
        }, { 'Content-Type': 'application/json' })

        return res?.data?.results[0]?.content ?? 'No Result Found'
    } catch (error) {
        console.error('Error during Tavily search:', error);
        return 'No Result Found';
    }
};

// Function to wait for a run to complete
/**
* Waits for the completion of a run in a thread.
* 
* @param {string} threadId - The ID of the thread.
* @param {string} runId - The ID of the run.
* @returns {Promise<Object>} - The completed run object, or `null` if an error occurs.
*/
async function waitForRunCompletion(threadId, runId) {
    while (true) {
        try {
            const run = await openaiClient.beta.threads.runs.retrieve(threadId, runId);
            console.log(`Current run status: ${run.status}`);
            if (['completed', 'failed', 'requires_action'].includes(run.status)) {
                return run;
            }
        } catch (error) {
            console.error('Error during run completion:', error);
            return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
};

// Function to handle tool output submission
/**
* Submits the outputs of tool calls made during a conversation thread run.
*
* @param {string} threadId - The ID of the conversation thread.
* @param {string} runId - The ID of the conversation thread run.
* @param {Object[]} toolsToCall - An array of tool objects, each with a `function` property that contains information about the tool to be called.
* @returns {Promise<Object>} - The response from the OpenAI API after submitting the tool outputs.
*/
async function submitToolOutputs(threadId, runId, toolsToCall) {
    console.log("Inside submit tool output");
    const toolOutputArray = [];
    for (const tool of toolsToCall) {
        let output = null;
        const tool_call_id = tool.id;
        const function_name = tool.function.name;
        const function_arguments = tool.function.arguments;

        if (function_name === 'tavilySearch') {
            output = await tavilySearch(JSON.parse(function_arguments).query);
            console.log("Tavily search output: ", output);;
        }

        if (output) {
            const toolOutput = { tool_call_id, output };
            toolOutputArray.push(toolOutput);
        }
    }

    console.log("Tool output array: ", toolOutputArray);

    try {
        const response = await openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
            threadId,
            runId,
            {
                tool_outputs: toolOutputArray
            }
        )
        return response;
    } catch (error) {
        console.error('Error during tool output submission:', error);
        return null;
    }
};

// Function to print messages from a thread
/**
* Prints the messages from a given thread.
*
* @param {string} threadId - The ID of the thread to print messages from.
* @returns {Promise<void>} - A promise that resolves when the messages have been printed.
*/
async function printMessagesFromThread(threadId) {
    try {
        const messages = await openaiClient.beta.threads.messages.list(threadId);
        for (const msg of messages.data) {
            /*
            {
                id: 'msg_hwHL6CcjfCm3SdkhKzyA19DP',
                object: 'thread.message',
                created_at: 1714270142,
                assistant_id: 'asst_GbrJSm9RKtGsw5iAC5WdN08d',
                thread_id: 'thread_DR2Pcxyq9hQDH8HwJf0TA00R',
                run_id: 'run_O7rBkIgVdPxVDSZR8aoycq5q',
                role: 'assistant',
                content: [Array],
                attachments: [],
                metadata: {}
            }
            */
            console.log(`${msg.role}: ${msg.content}`); // TOOD: 
        }
    } catch (error) {
        console.error('Error printing messages from thread:', error);
    }
};

// ------------------------------------------------------------------------------------------------------------------------------------------------

// Create an assistant
/**
* Creates an OpenAI assistant with the specified instructions, model, and tools.
*
* @param {Object} assistantPromptInstruction - The instructions for the assistant.
* @returns {Promise<Object>} The created assistant.
*/
const assistant = await openaiClient.beta.assistants.create({
    instructions: assistantPromptInstruction,
    model: 'gpt-3.5-turbo',
    tools: [
        {
            type: 'function',
            function: {
                name: 'tavilySearch',
                description: 'Get information on recent events from the web.',
                parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'The search query to use. For example: \'Latest news on Nvidia stock performance\'' },
                    },
                    required: ['query'],
                },
            },
        },
    ],
});

const assistantId = assistant.id;
console.log(`Assistant ID: ${assistantId}`);

// Create a thread
const thread = await openaiClient.beta.threads.create();
console.log(`Thread: ${thread.id}`);


// Create a message
const message = await openaiClient.beta.threads.messages.create(
    thread.id,
    {
        role: 'user',
        content: "What is LLM? Search from 'tavilySearch'.",
    }
);

// Create a run
let run = await openaiClient.beta.threads.runs.create(
    thread.id,
    {
        assistant_id: assistant.id
    }
);
console.log(`Run ID: ${run.id}`);

// Wait for run to complete
run = await waitForRunCompletion(thread.id, run.id);

if (run.status === 'failed') {
    console.error(run.error);
} else if (
    run.status === 'requires_action'
    && run.required_action.submit_tool_outputs
    && run.required_action.submit_tool_outputs.tool_calls
) {
    console.log("Stage: submitting tool output");
    run = await submitToolOutputs(thread.id, run.id, run.required_action.submit_tool_outputs.tool_calls);
    run = await waitForRunCompletion(thread.id, run.id);
}

// Print messages from the thread
await printMessagesFromThread(thread.id);
