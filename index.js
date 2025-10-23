import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

// --- Logging Setup ---
const logFile = path.resolve("./bot.log");
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  console.log(line.trim());
  fs.appendFileSync(logFile, line);
}

// --- Check ENV ---
if (!process.env.TOKEN) {
  log("❌ ERROR: Discord bot token not found in .env");
  process.exit(1);
}
if (!process.env.CLIENT_ID) {
  log("❌ ERROR: CLIENT_ID not found in .env");
  process.exit(1);
}

// --- Bot Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const inventionIdeas = [
  "Behold! My newest creation: the *Shrinking Banana Cannon!*",
  "Aha! The Anti-Gravity Jelly Dispenser 3000 is complete!",
  "Observe! The Freeze-Ray, but now... portable!",
  "My latest experiment may or may not explode in 5 seconds... heh heh!",
  "Oh dear! I’ve accidentally turned the minions into bubblegum again!",
];

const greetings = [
  "Ah, greetings, my yellow minion associates!",
  "Yes, yes, Dr. Nefario at your service!",
  "Ah! You require my scientific brilliance?",
  "What’s that smell? Oh yes… SCIENCE!",
];

const madResponses = [
  "Bah! Nonsense! Science cannot be rushed!",
  "Quiet! I’m calibrating my laser-fart-gun!",
  "Hmm... the chemical reaction seems unstable. Delightful!",
];

const triggerWords = [
  "invention",
  "experiment",
  "science",
  "banana",
  "lab",
  "nefaio",
  "dr.",
  "professor",
];

// --- On Ready ---
client.once(Events.ClientReady, (c) => {
  log(`⚙️ Logged in as ${c.user.tag}`);
  client.user.setActivity("Inventing chaotic gadgets...");
});

// --- On Message ---
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();
  if (
    message.mentions.has(client.user) ||
    triggerWords.some((word) => msg.includes(word))
  ) {
    const allResponses = [...inventionIdeas, ...greetings, ...madResponses];
    const response = allResponses[Math.floor(Math.random() * allResponses.length)];
    await message.reply(`**${response}**`);
    log(`💬 Responded to ${message.author.tag} in #${message.channel.name}: "${response}"`);
  }
});

// --- Slash Commands ---
const commands = [
  new SlashCommandBuilder().setName("invention").setDescription("Dr. Nefario unveils a random invention."),
  new SlashCommandBuilder().setName("greet").setDescription("Dr. Nefario greets you."),
  new SlashCommandBuilder().setName("mad").setDescription("Dr. Nefario gets mad scientifically!"),
].map((command) => command.toJSON());

// --- Register Commands ---
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    log("✅ Slash commands registered!");
  } catch (error) {
    log(`❌ Error registering commands: ${error}`);
  }
})();

// --- Slash Command Handler ---
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    if (commandName === "invention") {
      const reply = inventionIdeas[Math.floor(Math.random() * inventionIdeas.length)];
      await interaction.reply(`🧪 **${reply}**`);
      log(`🔧 /invention used by ${interaction.user.tag}`);
    } else if (commandName === "greet") {
      const reply = greetings[Math.floor(Math.random() * greetings.length)];
      await interaction.reply(`👋 **${reply}**`);
      log(`👋 /greet used by ${interaction.user.tag}`);
    } else if (commandName === "mad") {
      const reply = madResponses[Math.floor(Math.random() * madResponses.length)];
      await interaction.reply(`💥 **${reply}**`);
      log(`💥 /mad used by ${interaction.user.tag}`);
    }
  } catch (err) {
    log(`❌ Error handling command ${commandName}: ${err}`);
  }
});

// --- Random automatic messages ---
setInterval(async () => {
  const guilds = client.guilds.cache;
  for (const [id, guild] of guilds) {
    const channels = guild.channels.cache.filter(
      (ch) => ch.isTextBased() && ch.viewable
    );
    if (channels.size > 0) {
      const channel = channels.random();
      const msg = inventionIdeas[Math.floor(Math.random() * inventionIdeas.length)];
      await channel.send(`🧪 **${msg}**`);
      log(`🤖 Sent random invention to ${guild.name} in #${channel.name}`);
    }
  }
}, Math.floor(Math.random() * (900000 - 300000) + 300000)); // every 5–15 minutes

client.login(process.env.TOKEN);
