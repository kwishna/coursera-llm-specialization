import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates a response from the OpenAI chat completion API with a list of great books to read on the topic of coding.
 *
 * @param {number} [n_epochs=4] - The number of epochs to use for the chat completion. Defaults to 4 if not provided.
 * @returns {Promise<Object>} - The response from the OpenAI chat completion API.
 */
let response = await openai.chat.completions.create({
  messages: [
    {
      role: "system",
      content: "You're an AI assistant.",
    },
    {
      role: "user",
      content: `List some great books to read on the topic of coding.`,
    },
  ],
  model: "gpt-3.5-turbo",
  max_tokens: 400,
  n_epochs: 2, // default: 4
});

/*
n_epochs refers to the number of times the entire training dataset is passed through the learning algorithm during the training process.
- The number of epochs is a hyperparameter that determines how many times the model will see the entire training dataset.
- Passing through the dataset in a single epoch is usually not enough for the model to converge to an optimal solution.
- As the number of epochs increases, the model has more opportunities to update its internal parameters and improve its performance on the training data.

*/

console.log(response.choices[0].message.content)

console.log('-------------------------------------------------------');