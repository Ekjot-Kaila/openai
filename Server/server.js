import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

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

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Codex',
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Concatenate conversation history with prompt
    const fullPrompt = conversation.concat(prompt).join('\n');

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: fullPrompt,
      temperature: 0.5,
      max_tokens: 3000,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    const botResponse = response.data.choices[0].text;

    // Add user input and AI response to conversation history
    conversation.push(prompt);
    conversation.push(botResponse);

    // Check if conversation history exceeds the max length
    const maxHistoryLength = 20;
    if (conversation.length > maxHistoryLength) {
      conversation = conversation.slice(-maxHistoryLength);
    }

    res.status(200).send({
      tutor: botResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.post('/reset', async (req, res) => {
  // Reset conversation history
  conversation = [];

  res.status(200).send({
    message: 'Conversation history has been reset.',
  });
});

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));


