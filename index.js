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
dotenv.config();

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

client.once(Events.ClientReady, (c) => {
  console.log(`⚙️ Logged in as ${c.user.tag}`);
  client.user.setActivity("Inventing chaotic gadgets...");
});

// --- Message listener ---
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
  }
});

// --- Slash Commands ---
const commands = [
  new SlashCommandBuilder()
    .setName("invention")
    .setDescription("Dr. Nefario unveils a random invention."),
  new SlashCommandBuilder()
    .setName("greet")
    .setDescription("Dr. Nefario greets you."),
  new SlashCommandBuilder()
    .setName("mad")
    .setDescription("Dr. Nefario gets mad scientifically!"),
].map((command) => command.toJSON());

// --- Register Slash Commands ---
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Slash commands registered!");
  } catch (error) {
    console.error(error);
  }
})();

// --- Slash Command Handler ---
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  if (commandName === "invention") {
    await interaction.reply(
      `🧪 **${
        inventionIdeas[Math.floor(Math.random() * inventionIdeas.length)]
      }**`
    );
  } else if (commandName === "greet") {
    await interaction.reply(
      `👋 **${greetings[Math.floor(Math.random() * greetings.length)]}**`
    );
  } else if (commandName === "mad") {
    await interaction.reply(
      `💥 **${madResponses[Math.floor(Math.random() * madResponses.length)]}**`
    );
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
      await channel.send(
        `🧪 **${
          inventionIdeas[Math.floor(Math.random() * inventionIdeas.length)]
        }**`
      );
    }
  }
}, Math.floor(Math.random() * (900000 - 300000) + 300000)); // every 5–15 minutes

client.login(process.env.TOKEN);
