import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import { type } from 'os';

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI();

/**
* Retrieves the current weather information as a JSON string.
* @returns {Promise<string>} A promise that resolves to a JSON string representing the current weather.
*/
async function getCurrentWeather() {
    const weather = {
        temperature: 28,
        unit: 'Celsius',
        sky: 'Sunny'
    };

    return new Promise(resolve => {
        resolve(JSON.stringify(weather));
    });
}


/**
* Retrieves the user's location as a JSON string.
* 
* @returns {Promise<string>} A Promise that resolves to a JSON string representing the user's location, with properties for city, state, and country.
*/
async function getLocation() {
    const location = {
        city: 'New York City',
        state: 'NY',
        country: 'United States of America'
    };

    return new Promise(resolve => {
        resolve(JSON.stringify(location));
    });
}


/**
* Queries an AI agent with the provided query and returns the agent's response.
*
* @param {string} query - The query to be sent to the AI agent.
* @returns {Promise<Object>} - The response from the AI agent.
*/
async function query_agent(query) {

    const messages = [
        { role: "system", content: "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers." },
        { role: "user", content: query }
    ]

    const response = await openai.chat.completions.create({
        model: 'gpt-4-0125-preview',
        messages: messages,
        tools: [
            {
                type: "function",
                function: {
                    name: "getLocation",
                    description: "Get user's current location.",
                    parameters: {
                        type: "object",
                        properties: {}
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "getCurrentWeather",
                    description: "Get user's current weather.",
                    parameters: {
                        type: "object",
                        properties: {}
                    }
                }
            }
        ],
        tool_choice: "auto"
    });

    console.log(JSON.stringify(response, null, 2));
    /**
        {
            "id": "chatcmpl-9GvRPFZg7Rw76UKZmwys3hheiwrrS",
            "object": "chat.completion",
            "created": 1713821079,
            "model": "gpt-4-0125-preview",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": null,
                        "tool_calls": [
                                {
                                    "id": "call_SM5hY3pr8ly5f9GUFu6clacW",
                                    "type": "function",
                                    "function": {
                                        "name": "getLocation",
                                        "arguments": "{}"
                                    }
                                }
                            ]
                        },
                    "logprobs": null,
                    "finish_reason": "tool_calls"  // Check finish_reason = "stop" | "tool_calls"
                }
            ],
            "usage": {
                "prompt_tokens": 95,
                "completion_tokens": 9,
                "total_tokens": 104
            },
            system_fingerprint: 'fp_122114e45f'
        }
    */
    /*
            // Check finish_reason
            // if "stop":
                // return the result
            // else if "tool_calls":
                // call functions
                // append results
                // continue
    */
    return response;
}

await query_agent(`What is my current location?`);