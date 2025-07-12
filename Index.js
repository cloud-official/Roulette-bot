const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('The bot is online'));
app.listen(3000, () => console.log('✅ Web server started'));

const { Client, GatewayIntentBits } = require('discord.js');
const ms = require('ms'); // for parsing durations like "10m", "1h"
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return; // ignore DMs

  const content = message.content.trim();
  const args = content.split(/ +/);
  const command = args.shift().toLowerCase();

  // Role for restricted commands — replace '???' with your actual role name
  const restrictedRole = message.guild.roles.cache.find((r) => r.name === '???');
  const hasPermission = restrictedRole && message.member.roles.cache.has(restrictedRole.id);

  // === COMMAND LIST (simple) ===
  if (command === 'commands') {
    return message.reply({
      content: `📜 **Command List**:
\`script\` - Get script link  
