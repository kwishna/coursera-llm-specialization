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


const availableFunctions = {
    getCurrentWeather,
    getLocation
}

async function agent(query) {

    const tools = [
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
    ]

    const messages = [
        { role: "system", content: "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers." },
        { role: "user", content: query }
    ]

    const MAX_ITERATIONS = 5

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`------ Iteration #${i + 1} -------`)
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages,
            tools
        })

        console.log(JSON.stringify(response.choices[0], null, 2));
        const { finish_reason: finishReason, message } = response.choices[0]
        const { tool_calls: toolCalls } = message

        // Add Message
        messages.push(message)

        if (finishReason === "stop") {
            console.log(message.content)
            console.log("----- AGENT ENDING ------")
            return
        } else if (finishReason === "tool_calls") {
            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name
                const functionToCall = availableFunctions[functionName]
                const functionResponse = await functionToCall() // no-arg
                console.log(functionResponse)

                // add the message:
                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResponse
                })
            }
        }

    }
}

await agent("What's the current weather in Tokyo and New York City and Oslo?")