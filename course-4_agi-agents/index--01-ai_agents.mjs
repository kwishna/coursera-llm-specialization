import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI();


/**
 * AI Agents :-
 *      LLM is just one of the tools required to build an AI agent. For example: Computer Vision, Web-Crawler etc.
 * 
 *      AI agents are sophisticated software programs designed to mimic human intelligence in specific domains.
 *      They can operate in both reactive and proactive modes, depending on the task at hand.
 *      AI agents are used in a wide range of applications but face challenges related to complexity, uncertainty, ethics, and security.
 *      It must have :-
 *                   - Perception (ability to sense the environment),
 *                   - Learning (capacity to acquire knowledge & improve on experience),
 *                   - Decision Making (ability to select action based on the state),
 *                   - Goal Oritentation (must be designed to complete the given goal or task)
 */

/**
 * Goal - build an agent that can get the current weather at my current location
 * and give me some localized ideas of activities I can do.
 */

const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "user",
            content: "Give me a list of activity ideas based on my current location and weather"
        }
    ]
})

console.log(response.choices[0].message.content)
/**
As an AI, I'm unable to access your current location or weather details.
However, I can provide you with activities for various scenarios: 1. If it's sunny and warm: - Visit the beach - Go on a picnic - Try water sports - Hiking or trail running - Visit a farmers market or outdoor festival 2. If it's sunny but cold: - Go skiing or snowboarding - Ice skating - Take scenic photos - Visit a museum or indoor gallery - Try out a local coffee shop or bakery 3. If it's raining: - Visit a local museum or art gallery - Go to a movie theater - Have a cozy day in with your favorite books and movies - Try a new indoor hobby, like painting or baking 4. If it's cloudy or overcast: - Visit a botanical garden or aquarium - Go on a city exploration walk - Try out a cooking class - Visit a historic site or museum.
Remember to check local guidelines and restrictions due to Covid-19 before finalizing any plans.
 */
