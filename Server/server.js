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
const conversation = [];

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Codex',
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Include the conversation history up to 20 entries in the prompt
    const conversationPrompt = conversation
      .slice(-20) // Get the last 20 entries
      .map(entry => `${entry.role}: ${entry.content}`)
      .join('\n');

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${conversationPrompt}\nUser: ${prompt}`,
      temperature: 0.5,
      max_tokens: 10000,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    const botResponse = response.data.choices[0].text;

    // Add user input and AI response to conversation history
    conversation.push({ role: 'user', content: prompt });
    conversation.push({ role: 'bot', content: botResponse });

    // Reset the conversation history if it exceeds 20 entries
    if (conversation.length >20) {
      conversation.splice(0, conversation.length - 40);
    }

    res.status(200).send({
      tutor: botResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));



