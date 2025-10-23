import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import axios from 'axios';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Function to call Google AI
async function getAIResponse(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generate?key=${process.env.GOOGLE_API_KEY}`,
      {
        prompt: { text: prompt },
        temperature: 0.7,
        maxOutputTokens: 256,
      }
    );

    const content = response.data?.candidates?.[0]?.content;
    return content || "Hmm… my inventions exploded!";
  } catch (err) {
    console.error("Google AI error:", err.message);
    return "⚠️ Oops! My inventions exploded in the code again!";
  }
}

// Bot ready
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Listen to messages
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Example command: /greet
  if (content === '/greet') {
    const prompt = "You are Dr. Nefario. Greet the user in character with eccentric, scientific language.";
    const reply = await getAIResponse(prompt);
    message.reply(reply);
  }

  // Example command: /invention
  if (content === '/invention') {
    const prompt = "You are Dr. Nefario. Announce a chaotic, funny invention in character.";
    const reply = await getAIResponse(prompt);
    message.reply(reply);
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
