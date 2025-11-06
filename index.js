import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`⚙️ Logged in as ${client.user.tag}`);
});

// === Function to call Gemini API ===
async function getAIResponse(prompt) {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }
    );

    const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "Hmm… I seem to have misplaced my glasses again!";
  } catch (err) {
    console.error("🧪 Google AI error:", err.response?.data || err.message);
    return "Blast! My AI circuits just exploded!";
  }
}

// === Command handling ===
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  await interaction.deferReply();

  let prompt = "";
  if (interaction.commandName === "greet") {
    prompt = "You are Dr. Nefario from Despicable Me. Greet the user with eccentric energy and lots of scientific flair.";
  } else if (interaction.commandName === "invention") {
    prompt = "You are Dr. Nefario. Announce your latest chaotic invention in a dramatic and funny way.";
  } else if (interaction.commandName === "experiment") {
    prompt = "You are Dr. Nefario. Describe a risky experiment you are conducting with wild enthusiasm.";
  }

  const reply = await getAIResponse(prompt);
  await interaction.editReply(reply);
});

client.login(process.env.DISCORD_TOKEN);
