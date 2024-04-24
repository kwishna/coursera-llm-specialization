import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import { type } from 'os';

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI();

export async function getCurrentWeather({ location, unit = "fahrenheit" }) {
    console.log("location:", location)
    console.log("unit:", unit)
    const weather = {
        location,
        temperature: "75",
        unit,
        forecast: "sunny"
    }
    return JSON.stringify(weather)
}

export async function getLocation() {
    return "San Diego, CA"
}


const availableFunctions = {
    getCurrentWeather,
    getLocation
}

export const tools = [
    {
        type: "function",
        function: {
            name: "getCurrentWeather",
            description: "Get the current weather",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The location from where to get the weather"
                    },
                    unit: {
                        type: "string",
                        enum: ["celsius", "fahrenheit"]
                    }
                },
                required: ["location"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getLocation",
            description: "Get the user's current location",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
]


async function agent(query) {
    const messages = [
        { role: "system", content: "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers." },
        { role: "user", content: query }
    ]

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages,
        tools
    })

    const { finish_reason: finishReason, message } = response.choices[0]
    const { tool_calls: toolCalls } = message
    console.log(toolCalls)

    messages.push(message)

    if (finishReason === "stop") {
        console.log(message.content)
        console.log("AGENT ENDING")
        return
    } else if (finishReason === "tool_calls") {
        for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name
            const functionToCall = availableFunctions[functionName]
            const functionArgs = JSON.parse(toolCall.function.arguments)
            const functionResponse = await functionToCall(functionArgs)
            console.log(functionResponse)
            messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: functionName,
                content: functionResponse
            })
        }
    }
}

await agent("What's the current weather in Tokyo and New York City and Oslo?")
