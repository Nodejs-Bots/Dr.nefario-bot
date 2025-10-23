import { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";

dotenv.config();

// --- Logging ---
const logFile = path.resolve("./bot.log");
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  console.log(line.trim());
  fs.appendFileSync(logFile, line);
}

// --- Validate ENV ---
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GOOGLE_API_KEY) {
  log("❌ ERROR: Missing DISCORD_TOKEN, CLIENT_ID, or GOOGLE_API_KEY in .env");
  process.exit(1);
}

// --- Discord Client ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// --- Google Generative AI Function ---
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

    const content = response.data.candidates?.[0]?.content;
    return content || "Hmm… my inventions exploded!";
  } catch (err) {
    console.error("Google AI error:", err);
    return "⚠️ Oops! My inventions exploded in the code again!";
  }
}

// --- Slash Commands ---
const commands = [
  new SlashCommandBuilder().setName("invention").setDescription("Dr. Nefario unveils a random invention."),
  new SlashCommandBuilder().setName("greet").setDescription("Dr. Nefario greets you."),
  new SlashCommandBuilder().setName("mad").setDescription("Dr. Nefario gets mad scientifically!"),
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    log("✅ Slash commands registered!");
  } catch (err) {
    log(`❌ Error registering commands: ${err}`);
  }
})();

// --- Ready Event ---
client.once(Events.ClientReady, () => {
  log(`⚙️ Logged in as ${client.user.tag}`);
  client.user.setActivity("Inventing chaotic gadgets...");
});

// --- Message Handler ---
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const prompt = `
      You are Dr. Nefario from Despicable Me, a quirky, eccentric scientist.
      Respond in character to this message: "${message.content}"
      Use funny, dramatic, scientific language. Keep it short and chaotic.
    `;
    const reply = await getAIResponse(prompt);
    await message.reply(reply);
    log(`💬 Replied to ${message.author.tag} in #${message.channel.name}: "${reply}"`);
  }
});

// --- Slash Command Handler ---
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  let prompt;

  if (command === "invention") {
    prompt = "You are Dr. Nefario. Announce a chaotic, funny invention in character.";
  } else if (command === "greet") {
    prompt = "You are Dr. Nefario. Greet the user in character with eccentric, scientific language.";
  } else if (command === "mad") {
    prompt = "You are Dr. Nefario. Respond as if mad, in character, with dramatic scientific language.";
  }

  if (prompt) {
    const reply = await getAIResponse(prompt);
    await interaction.reply(reply);
    log(`🔧 /${command} used by ${interaction.user.tag}`);
  }
});

// --- Login ---
client.login(process.env.DISCORD_TOKEN);
