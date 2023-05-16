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

// Maximum token limit
const MAX_TOKENS = 3000;

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Codex',
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Check if conversation history exceeds maximum token limit
    const conversationTokens = conversation.join(' ').split(' ').length;
    if (conversationTokens >= MAX_TOKENS) {
      conversation = [];
    }

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${conversation.join('\n')} ${prompt}`,
      temperature: 0.5,
      max_tokens: MAX_TOKENS,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    const botResponse = response.data.choices[0].text;

    // Add user input and AI response to conversation history
    conversation.push({ role: 'user', content: prompt });
    conversation.push({ role: 'bot', content: botResponse });

    res.status(200).send({
      bot: botResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));
