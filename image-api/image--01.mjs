import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: "Northern hemisphare green beautiful sky due to solar flares",
    n: 1,
    size: "1024x1024"
  });

  console.log(response.data[0].url);

  /*
      {
        created: 1715706579,
        data: [
          {
            revised_prompt: "A breathtaking display of aurora borealis in the northern hemisphere, painting the night sky with majestic hues of green. The divine spectacle is a result of solar flares, who interact with the earth's magnetic field, to produce this fantasy-like effect. The sky is alight with green hues intensifying into a vibrant spectacle across the star-studded night and sweeping across the horizon like a heavenly curtain. The dancing lights create a sense of awe-inspiring wonderment as they illuminate the surrounding landscape and reflect off tranquil bodies of water beneath.",
            url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JBNveT4fA5Vhtf7PNQhCGwww/user-zCpyvq9ZHThVTXlnYzDu3ElS/img-0Wx9ZrdFX1v7d36MdKg6PgNN.png?st=2024-05-14T16%3A09%3A39Z&se=2024-05-14T18%3A09%3A39Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-05-14T02%3A52%3A40Z&ske=2024-05-15T02%3A52%3A40Z&sks=b&skv=2021-08-06&sig=BhHxA3qFdtbZvJZlEI63tRVvS8P9NiFrJdRP8zYBRls%3D'
          }
        ]
      }
  */