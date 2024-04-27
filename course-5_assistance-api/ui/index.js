import { openai } from './config.js';

const form = document.querySelector('form');
const input = document.querySelector('input');
const reply = document.querySelector('.reply');



const file = await openai.files.create({
    file: fs.createReadStream(path.resolve("./course-5_assistance-api/movies.txt")),
    purpose: "assistants",
});

const assisatnt = await openai.beta.assistants.create({
    instructions: "You are great at recommending movies. When asked a question, use the information in the provided file to form a friendly response. If you cannot find the answer in the file, do your best to infer what the answer should be.",
    name: "Movie Expert",
    tools: [{ type: "retrieval" }],
    model: "gpt-4-1106-preview",
    file_ids: [file.id]
});

const thread = await openai.beta.threads.create();

// Assistant variables
const asstID = assisatnt.id;
const threadID = thread.id;

form.addEventListener('submit', function(e) {
  e.preventDefault();
  main();
  input.value = '';
});

// Bring it all together
async function main() {
  reply.innerHTML = 'Thinking...';

}

/* -- Assistants API Functions -- */

// Create a message
async function createMessage(question) {
  const threadMessages = await openai.beta.threads.messages.create(
    threadID,
    { role: "user", content: question }
  );
}

// Run the thread / assistant
async function runThread() {
  const run = await openai.beta.threads.runs.create(
    threadID, { assistant_id: asstID }
  );
  return run;
}

// List thread Messages
async function listMessages() {
  return await openai.beta.threads.messages.list(threadID)
}

// Get the current run
async function retrieveRun(thread, run) {
  return await openai.beta.threads.runs.retrieve(thread, run);
}