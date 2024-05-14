import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.images.edit(
    {
        model: "dall-e-2",
        image: fs.createReadStream("sachin-tendulkar.png"),
        mask: fs.createReadStream("outdoor.png"),
        prompt: "Sachin Tendulkar standing outdoor with Cricket World Cup.",
        n: 1,
        size: "1024x1024",
        response_format: 'b64_json'
    },

    {
        maxRetries: 1,
        timeout: 60000,
        stream: false
    });

image_url = response.data[0].url;

console.log(response);

const base64image = response.data[0].b64_json;

fs.writeFileSync(`${Date.now()}_image.png`, base64image, 'base64');

console.log('Image saved successfully!');

console.log('-------------------------------------------------------');