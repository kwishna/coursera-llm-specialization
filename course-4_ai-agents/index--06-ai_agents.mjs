import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

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
        forecast: 'Sunny'
    };

    return new Promise(resolve => {
        resolve(JSON.stringify(weather));
    });
}


/**
* Retrieves the user's current location details.
* @returns {Promise<string>} A JSON string representing the user's location, including city, state, and country.
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

/**
 * Goal - build an agent that can answer any questions that might require knowledge about my current location and the current weather at my location.
 */

/**
 PLAN:
    1. Design a well-written ReAct prompt
    2. Build a loop for my agent to run in.
    3. Parse any actions that the LLM determines are necessary
    4. End condition - final Answer is given
 */

const systemPrompt = `
    You cycle through Thought, Action, PAUSE, Observation. At the end of the loop you output a final Answer. Your final answer should be highly specific to the observations you have from running
    the actions.
    1. Thought: Describe your thoughts about the question you have been asked.
    2. Action: run one of the actions available to you - then return PAUSE.
    3. PAUSE
    4. Observation: will be the result of running those actions.
    
    Available actions:
    - getCurrentWeather: 
        E.g. getCurrentWeather: Salt Lake City
        Returns the current weather of the location specified.
    - getLocation:
        E.g. getLocation: null
        Returns user's location details. No arguments needed.
    
    Example session:
    Question: Please give me some ideas for activities to do this afternoon.
    Thought: I should look up the user's location so I can give location-specific activity ideas.
    Action: getLocation: null
    PAUSE
    
    You will be called again with something like this:
    Observation: "New York City, NY"
    
    Then you loop again:
    Thought: To get even more specific activity ideas, I should get the current weather at the user's location.
    Action: getCurrentWeather: New York City
    PAUSE
    
    You'll then be called again with something like this:
    Observation: { location: "New York City, NY", forecast: ["sunny"] }
    
    You then output:
    Answer: <Suggested activities based on sunny weather that are highly specific to New York City and surrounding areas.>
 `

/**
* Executes an AI agent that responds to a user query, iterating up to a maximum number of times  to gather observations and refine the response.
*
* @param {string} query - The user's query to be processed by the AI agent.
* @returns {Promise<string>} - The final response from the AI agent.
*/
async function agent(query) {
// ...
}
async function agent(query) {
const messages = [
{ role: "system", content: systemPrompt },
{ role: "user", content: query }
]

const MAX_ITERATIONS = 5
const actionRegex = /^Action: (\w+): (.*)$/

for (let i = 0; i < MAX_ITERATIONS; i++) {
console.log(`-------------------------------------------------------`)
console.log(`Iteration #${i + 1}`)
console.log(`-------------------------------------------------------`)
const response = await openai.chat.completions.create({
model: "gpt-3.5-turbo",
messages
})

const responseText = response.choices[0].message.content
console.log(responseText)
messages.push({ role: "assistant", content: responseText })
const responseLines = responseText.split("\n")

const foundActionStr = responseLines.find(str => actionRegex.test(str))

if (foundActionStr) {
const actions = actionRegex["exec"](foundActionStr)
const [_, action, actionArg] = actions

if (!availableFunctions.hasOwnProperty(action)) {
throw new Error(`Unknown action: ${action}: ${actionArg}`)
}
console.log(`*** Calling function ${action} with argument ${actionArg} ***`)
const observation = await availableFunctions[action](actionArg)
messages.push({ role: "assistant", content: `Observation: ${observation}` })
} else {
console.log("-------- Agent finished with task --------")
return responseText
}
}

}

await agent("What are some activity ideas that I can do this afternoon based on my location and weather?")

/**
Answer: Based on the current snowy weather in New York City, here are some activity ideas for this afternoon: 1. Build a snowman in Central Park. 2. Go ice skating at Rockefeller Center. 3. Have a hot chocolate tasting at a cozy café. 4. Visit a museum or art gallery. 5. Stay indoors and watch a movie marathon. Remember to dress warmly and stay safe while enjoying these activities!
/index.html
 
 
 
 */