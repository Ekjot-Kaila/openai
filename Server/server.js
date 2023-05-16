import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const app = express();
app.use(cors());
app.use(express.json());

// Conversation history storage
let conversation = [];

// Maximum number of conversation history to keep
const MAX_HISTORY_LENGTH = 5;

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from OpenAI Codex!',
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Add user input to conversation history
    conversation.push({ role: 'user', content: prompt });

    // Limit conversation history to maximum length
    if (conversation.length > MAX_HISTORY_LENGTH) {
      conversation = conversation.slice(conversation.length - MAX_HISTORY_LENGTH);
    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${conversation.map(entry => entry.role === 'user' ? `You: ${entry.content}` : `Tutor: ${entry.content}`).join('\n')}`,
      temperature: 0.5,
      max_tokens: 3000,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    const tutorResponse = response.data.choices[0].text;

    // Add tutor response to conversation history
    conversation.push({ role: 'tutor', content: tutorResponse });

    res.status(200).send({
      tutor: tutorResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));

