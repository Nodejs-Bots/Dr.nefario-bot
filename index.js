import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Function to call Google AI
async function getAIResponse(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${process.env.GOOGLE_API_KEY}`,
      {
        prompt: { text: prompt },
        temperature: 0.7,
        maxOutputTokens: 256,
      }
    );

    return response.data?.candidates?.[0]?.output || "Hmm… I couldn't think of anything!";
  } catch (err) {
    console.error('Google AI error:', err.message);
    return "Something went wrong with my AI gears!";
  }
}

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  await interaction.deferReply(); // Acknowledge immediately

  let prompt = '';
  if (interaction.commandName === 'greet') {
    prompt = "You are Dr. Nefario. Greet the user in character with eccentric, scientific language.";
  } else if (interaction.commandName === 'invention') {
    prompt = "You are Dr. Nefario. Announce a chaotic, funny invention in character.";
  }

  const reply = await getAIResponse(prompt);
  await interaction.editReply(reply);
});

client.login(process.env.DISCORD_TOKEN);
