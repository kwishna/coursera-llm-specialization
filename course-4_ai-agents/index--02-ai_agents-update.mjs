import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI();


/*
    ReAct: Making LLMs More Human-like Conversational Agents. (Reasoning, Action & Observation)

    ReAct is a set of techniques aimed at making LLMs better conversational agents by giving them more human-like behaviors.
    ReAct stands for:
        Remember context - LLMs need to track the conversation history and remember relevant details, rather than treating each prompt independently.
                           Techniques like conversational embeddings help maintain information over multiple prompts.
        Explain thought process - Humans explain their reasoning, rather than just stating answers. Methods like in-context learning can generate step-by-step explanations from an LLM.
        Ask clarifying questions - When a query is unclear, humans ask follow-up questions. LLMs can also be prompted to identify and ask about ambiguous or missing information.
 */


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
 * Goal - build an agent that can get the current weather at my current location
 * and give me some localized ideas of activities I can do.
 */

const weather = await getCurrentWeather()
const location = await getLocation()

const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "user",
            content: `Give me a list of activity ideas based on my current location of ${location} and weather of ${weather}`
        }
    ]
})

console.log(response.choices[0].message.content)
/*
    1. Take a walk in Central Park and enjoy the sunny weather.
    2. Visit the Statue of Liberty and take a ferry ride to the island.
    3. Explore the High Line park and enjoy the views of the city.
    4. Visit the Top of the Rock observation deck for panoramic views of NYC.
    5. Take a bike ride along the Hudson River Greenway.
    6. Explore the museums on Museum Mile, such as the Metropolitan Museum of Art or the Museum of the City of New York.
    7. Have a picnic in Prospect Park in Brooklyn.
    8. Visit the Bronx Zoo and enjoy the outdoor exhibits.
    9. Take a leisurely stroll through the Brooklyn Botanic Garden.
    10. Go ice skating at Rockefeller Center or Bryant Park.
*/