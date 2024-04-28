import os from "os"
import axios from "axios"
import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import readline from 'readline'

dotenv.config({ path: path.resolve('./.env') });

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// assistant_id - asst_GbrJSm9RKtGsw5iAC5WdN08d
// tool_call_id - call_XBPd4YEcfFHwL6o4YFmfPsQe
// const response = await openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
//     "thread_DR2Pcxyq9hQDH8HwJf0TA00R",
//     "run_O7rBkIgVdPxVDSZR8aoycq5q",
//     {
//         tool_outputs: [
//             {
//                 tool_call_id: 'call_XBPd4YEcfFHwL6o4YFmfPsQe',
//                 output: 'LLM is an AI field.'
//             }
//         ]
//     }
// )

// console.log(JSON.stringify(response, null, 2));

// "id": "msg_hwHL6CcjfCm3SdkhKzyA19DP",
// "assistant_id": "asst_GbrJSm9RKtGsw5iAC5WdN08d",
// "thread_id": "thread_DR2Pcxyq9hQDH8HwJf0TA00R",
// "run_id": "run_O7rBkIgVdPxVDSZR8aoycq5q",
// "tool_call_id": "call_XBPd4YEcfFHwL6o4YFmfPsQe",

const messages = await openaiClient.beta.threads.messages.list("thread_DR2Pcxyq9hQDH8HwJf0TA00R");
for (const msg of messages.data) {
    console.log(`${JSON.stringify(msg, null, 2)}`);
}