import OpenAI from "openai";
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const inputs = [
    {
        "img_url": "https://scrimba.com/links/egg-image",
        "prompt": "I found this small egg on the ground in South Florida during spring. What type of bird could it be from?"
    },
    {
        "img_url": "https://scrimba.com/links/building-image",
        "prompt": "Tell me the architectural style of this building and where it's located."
    },
    {
        "img_url": "https://scrimba.com/links/menu-image",
        "prompt": "Based on this menu, please recommend meal options considering the following: I have a big appetite, am allergic to shellfish, and crave a dessert that's both sweet and tart. I'd like to keep my total spend under $30."
    }
]

for (const obj of inputs) {

        const imgURL = obj.img_url;
        const prompt = obj.prompt;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: imgURL
                            }
                        }
                    ]
                }
            ]
        });
        console.log("---------------------------------------------------------------------------------------------------------------------------");
        console.log(imgURL);
        console.log(response.choices[0].message.content);
}