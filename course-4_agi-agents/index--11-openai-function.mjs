import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import { type } from 'os';

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI();

export async function getCurrentWeather({ location }) {
    const weather = {
        location,
        temperature: "75",
        forecast: "sunny"
    }
    return JSON.stringify(weather)
}

export async function getLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const text = await response.json()
    return JSON.stringify(text)
  } catch (err) {
    console.log(err)
  }
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


const availableFunctions = {
    getCurrentWeather,
    getLocation
}

async function agent(query) {
    const messages = [
        { role: "system", content: "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers." },
        { role: "user", content: query }
    ]

    const MAX_ITERATIONS = 5

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`Iteration #${i + 1}`)
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
            console.log(JSON.stringify(messages, null, 2));
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
}

await agent("What's the current weather in my current location?")

/**
[
  {
    "role": "system",
    "content": "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers."
  },
  {
    "role": "user",
    "content": "What's the current weather in my current location?"
  },
  {
    "role": "assistant",
    "content": null,
    "tool_calls": [
      {
        "id": "call_lgkml7mgr2Ga8T8JaHTMrMdF",
        "type": "function",
        "function": {
          "name": "getLocation",
          "arguments": "{}"
        }
      }
    ]
  },
  {
    "tool_call_id": "call_lgkml7mgr2Ga8T8JaHTMrMdF",
    "role": "tool",
    "name": "getLocation",
    "content": "{\"ip\":\"49.207.228.240\",\"network\":\"49.207.224.0/21\",\"version\":\"IPv4\",\"city\":\"Bengaluru\",\"region\":\"Karnataka\",\"region_code\":\"KA\",\"country\":\"IN\",\"country_name\":\"India\",\"country_code\":\"IN\",\"country_code_iso3\":\"IND\",\"country_capital\":\"New Delhi\",\"country_tld\":\".in\",\"continent_code\":\"AS\",\"in_eu\":false,\"postal\":\"560067\",\"latitude\":12.9634,\"longitude\":77.5855,\"timezone\":\"Asia/Kolkata\",\"utc_offset\":\"+0530\",\"country_calling_code\":\"+91\",\"currency\":\"INR\",\"currency_name\":\"Rupee\",\"languages\":\"en-IN,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,bh,sat,ks,ne,sd,kok,doi,mni,sit,sa,fr,lus,inc\",\"country_area\":3287590,\"country_population\":1352617328,\"asn\":\"AS24309\",\"org\":\"Atria Convergence Technologies Pvt. Ltd. Broadband Internet Service Provider INDIA\"}"
  },
  {
    "role": "assistant",
    "content": null,
    "tool_calls": [
      {
        "id": "call_cWjiY0zojVLVum3J7utygIrD",
        "type": "function",
        "function": {
          "name": "getCurrentWeather",
          "arguments": "{\"location\":\"Bengaluru\"}"
        }
      }
    ]
  },
  {
    "tool_call_id": "call_cWjiY0zojVLVum3J7utygIrD",
    "role": "tool",
    "name": "getCurrentWeather",
    "content": "{\"location\":\"Bengaluru\",\"temperature\":\"75\",\"forecast\":\"sunny\"}"
  },
  {
    "role": "assistant",
    "content": "The current weather in Bengaluru is 75°F and sunny."
  }
]
*/
