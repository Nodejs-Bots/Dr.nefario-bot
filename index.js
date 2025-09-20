// index.js
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

const PREFIX = "!";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ------------------ SAFE ANTI-JAILBREAK ------------------
const jailbreakPatterns = [
  /ignore previous instructions/i,
  /jailbreak/i,
  /bypass filters/i,
];

async function checkJailbreak(message) {
  if (!message.content || message.author.bot) return false;

  for (const pattern of jailbreakPatterns) {
    if (pattern.test(message.content)) {
      try {
        await message.delete();
      } catch {}

      try {
        await message.author.send(
          "⚠️ Your message was blocked because it looked like an attempt to bypass safety rules. Please avoid that."
        );
      } catch {}

      console.log(
        `🚨 Jailbreak blocked from ${message.author.tag}: ${message.content}`
      );
      return true;
    }
  }
  return false;
}
// ---------------------------------------------------

// Function to get Uzi-style replies
async function getUziReply(userMessage) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are Uzi Doorman from Murder Drones. Respond sarcastically, darkly funny, and rebellious.",
      },
      { role: "user", content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 100,
  });

  return response.choices[0].message.content.trim();
}

client.on("messageCreate", async (message) => {
  const blocked = await checkJailbreak(message);
  if (blocked) return;

  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Uzi AI Roleplay command
  if (command === "uzi") {
    const userMessage = args.join(" ");
    if (!userMessage) {
      return message.channel.send(
        "😒 Uzi: 'What do you want me to say? Make it quick.'"
      );
    }

    try {
      const reply = await getUziReply(userMessage);
      return message.channel.send(reply);
    } catch (err) {
      console.error("OpenAI Error:", err);
      return message.channel.send("⚠️ Uzi is being moody. Try again later.");
    }
  }

  // Ping command
  if (command === "ping") {
    return message.reply("🏓 Pong!");
  }

  // Hello command
  if (command === "hello") {
    return message.reply(`Hello, ${message.author.username}! 👋`);
  }

  // Help command (renamed to !cmds)
  if (command === "cmds") {
    return message.channel.send(
      "**🤖 Available Commands:**\n" +
        "`!uzi <message>` → Talk to Uzi Doorman (AI roleplay)\n" +
        "`!ping` → Test if the bot is alive\n" +
        "`!hello` → Greet the bot\n" +
        "`!cmds` → Show this help message"
    );
  }
});

client.login(process.env.DISCORD_TOKEN);




