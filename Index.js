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
\`key\` - Get key link  
\`about\` - Info about the bot  
\`spam <msg> <count>\` - Spam message (role: ???)  
\`clear <amount>\` - Delete messages (role: ???)  
\`kick @user <reason>\` - Kick user (role: ???)  
\`ban @user <reason>\` - Ban user (role: ???)  
\`mute @user <duration>\` - Mute user (role: ???)`
    });
  }

  // === FULL ORGANIZED COMMANDS ===
  if (command === 'one') {
    return message.reply({
      content: `📚 **All Commands - Organized**

**Public Commands:**
• \`script\` - Get script link
• \`key\` - Get key link
• \`about\` - Bot info
• \`ping\` - Check bot latency
• \`userinfo @user\` - Get info about a user
• \`serverinfo\` - Get info about the server

**Restricted Commands (Role: ???):**
• \`spam <message> <count>\` - Spam messages (max 10000)
• \`clear <amount>\` - Delete messages (1–10000)
• \`kick @user <reason>\` - Kick a user
• \`ban @user <reason>\` - Ban a user
• \`mute @user <duration>\` - Mute a user (e.g. 10m, 1h)
• \`unmute @user\` - Remove mute from a user`
    });
  }

  // === PUBLIC COMMANDS ===
  if (command === 'script') {
    return message.reply('📜 https://rawscripts.net/raw/Universal-Script-Best-Universal-hub-44327');
  }

  if (command === 'key') {
    return message.reply('🔑 https://discord.com/channels/1388707547061551274/1388737749015855184/1391981489335439481');
  }

  if (command === 'about') {
    return message.reply('🤖 Created by @fevber. This bot is for educational use.');
  }

  if (command === 'ping') {
    return message.reply(`🏓 Pong! Latency is ${Date.now() - message.createdTimestamp}ms.`);
  }

  if (command === 'userinfo') {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const created = user.createdAt.toDateString();
    const joined = member ? member.joinedAt.toDateString() : 'N/A';

    return message.reply({
      content: `👤 **User Info**
• Username: ${user.tag}
• ID: ${user.id}
• Created on: ${created}
• Joined server: ${joined}`
    });
  }

  if (command === 'serverinfo') {
    const { guild } = message;
    return message.reply({
      content: `🏰 **Server Info**
• Name: ${guild.name}
• ID: ${guild.id}
• Members: ${guild.memberCount}
• Created on: ${guild.createdAt.toDateString()}`
    });
  }

  // === RESTRICTED COMMANDS CHECK ===
  if (['spam', 'clear', 'kick', 'ban', 'mute', 'unmute'].includes(command) && !hasPermission) {
    return message.reply('🚫 You don’t have permission to use this command.');
  }

  // === SPAM ===
  if (command === 'spam') {
    const count = parseInt(args[args.length - 1], 10);
    const msg = args.slice(0, -1).join(' ');

    if (!msg || isNaN(count) || count < 1 || count > 10000) {
      return message.reply('⚠️ Usage: `spam <message> <count>` (Max: 10000)');
    }

    // Helper to wait for ms milliseconds
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < count; i++) {
      await message.channel.send(msg).catch(() => {});
      await wait(1000); // wait 1 second between messages
    }
  }

  // === CLEAR ===
  else if (command === 'clear') {
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 10000) {
      return message.reply('⚠️ Usage: `clear <amount>` (1–10000)');
    }

    try {
      await message.channel.bulkDelete(amount, true);
      const replyMsg = await message.channel.send(`🧹 Deleted ${amount} messages.`);
      setTimeout(() => replyMsg.delete().catch(() => {}), 3000);
    } catch {
      message.reply('❗ Failed to delete messages. Make sure messages are not older than 14 days.');
    }
  }

  // === KICK ===
  else if (command === 'kick') {
    const user = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason';

    if (!user) return message.reply('❗ Mention a user to kick.');
    if (!user.kickable) return message.reply('❗ Cannot kick this user.');

    try {
      await user.kick(reason);
      message.channel.send(`👢 Kicked ${user.user.tag} | Reason: ${reason}`);
    } catch {
      message.reply('❗ Failed to kick user. Check bot permissions and role hierarchy.');
    }
  }

  // === BAN ===
  else if (command === 'ban') {
    const user = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason';

    if (!user) return message.reply('❗ Mention a user to ban.');
    if (!user.bannable) return message.reply('❗ Cannot ban this user.');

    try {
      await user.ban({ reason });
      message.channel.send(`🔨 Banned ${user.user.tag} | Reason: ${reason}`);
    } catch {
      message.reply('❗ Failed to ban user. Check bot permissions and role hierarchy.');
    }
  }

  // === MUTE ===
  else if (command === 'mute') {
    const user = message.mentions.members.first();
    const durationStr = args[1]; // e.g. '10m', '1h'
    if (!user) return message.reply('❗ Mention a user to mute.');
    if (!durationStr) return message.reply('❗ Please specify duration, e.g. `mute @user 10m`');

    // Find or create "Muted" role
    let muteRole = message.guild.roles.cache.find((r) => r.name === 'Muted');
    if (!muteRole) {
      try {
        muteRole = await message.guild.roles.create({
          name: 'Muted',
          color: '#555555',
          permissions: [],
        });

        // Deny send messages permission in all channels for the muted role
        for (const [, channel] of message.guild.channels.cache) {
          await channel.permissionOverwrites.edit(muteRole, {
            SendMessages: false,
            Speak: false,
            AddReactions: false,
          });
        }
      } catch (e) {
        console.error('Failed to create Muted role:', e);
        return message.reply('❗ Failed to create Muted role, please check bot permissions.');
      }
    }

    if (user.roles.cache.has(muteRole.id)) {
      return message.reply('❗ User is already muted.');
    }

    const durationMs = ms(durationStr);
    if (!durationMs) return message.reply('❗ Invalid duration format. Use formats like 10m, 1h, 30s.');

    try {
      await user.roles.add(muteRole);
      message.channel.send(`🔇 Muted ${user.user.tag} for ${durationStr}`);

      // Auto unmute after duration
      setTimeout(async () => {
        if (user.roles.cache.has(muteRole.id)) {
          await user.roles.remove(muteRole).catch(() => {});
          message.channel.send(`🔈 Unmuted ${user.user.tag} (mute expired)`);
        }
      }, durationMs);
    } catch (e) {
      console.error(e);
      return message.reply('❗ Failed to mute the user, check bot permissions and role hierarchy.');
    }
  }

  // === UNMUTE ===
  else if (command === 'unmute') {
    if (!hasPermission) return message.reply('🚫 You don’t have permission to use this command.');
    const user = message.mentions.members.first();
    if (!user) return message.reply('❗ Mention a user to unmute.');

    const muteRole = message.guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole || !user.roles.cache.has(muteRole.id)) {
      return message.reply('❗ User is not muted.');
    }

    try {
      await user.roles.remove(muteRole);
      message.channel.send(`🔈 Unmuted ${user.user.tag}`);
    } catch {
      message.reply('❗ Failed to unmute user. Check bot permissions and role hierarchy.');
    }
  }
});

client.login(process.env.TOKEN);
