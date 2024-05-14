import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.images.generate(
    {
        model: "dall-e-3",
        prompt: "Northern hemisphare green beautiful sky due to solar flares",
        n: 1,
        size: "1024x1024",
        quality: 'hd',
        response_format: 'b64_json',
        style: 'natural'
    },
    {
        maxRetries: 1,
        timeout: 60000,
        stream: false
    }
);

console.log(response);
// console.log(response.data[0].b64_json);

const base64image = response.data[0].b64_json;

fs.writeFileSync(`./${Date.now()}_image.png`, base64image, 'base64');

console.log('Image saved successfully!');

console.log('-------------------------------------------------------');

// Create a writable stream to write data to a file named `./${Date.now()}_image.png`
const writeStream = fs.createWriteStream(`./${Date.now()}_image.png`, { flags: 'a', encoding: 'base64' });

// Write the data to the writable stream
writeStream.write(base64image);
writeStream.close();

console.log('-------------------------------------------------------');