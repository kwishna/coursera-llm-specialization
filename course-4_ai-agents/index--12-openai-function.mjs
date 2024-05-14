import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

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

export const functions = [
  {
      function: getCurrentWeather,
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
  },
  {
      function: getLocation,
      parameters: {
          type: "object",
          properties: {}
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

  const runner = openai.beta.chat.completions.runFunctions({
      model: "gpt-3.5-turbo-1106",
      messages,
      functions
  }).on("message", (message) => console.log(message))
  
  const finalContent = await runner.finalContent()
  console.log(finalContent)
}

await agent("What's the current weather in my current location?")

/**
The current weather in New York is sunny with a temperature of 75°F.
*/