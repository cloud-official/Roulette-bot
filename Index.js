require("dotenv").config();

const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const PingMonitor = require("./ping_monitor.js");
const UptimeMonitor = require("./uptime_monitor.js");

// Keep alive server
require("./keep_alive.js");

// Main API server
const app = express();
app.get("/", (req, res) => res.send("âœ¨ Roulette Hub API is up âœ¨"));
app.listen(3000, () => console.log("Â·:*Â¨à¼º â™± ROULETTE HUB ONLINE â™± à¼»Â¨*:Â·"));

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Initialize monitors
const pingMonitor = new PingMonitor();
const uptimeMonitor = new UptimeMonitor(client);

// Emoji URLs (orange version)
const EMOJIS = {
  script: "https://img.icons8.com/?size=100&id=37927&format=png&color=FFA500",
  key: "https://img.icons8.com/?size=100&id=2896&format=png&color=FFA500",
  about:
    "https://img.icons8.com/?size=100&id=dbEL2NLmlcac&format=png&color=FFA500",
  help: "https://img.icons8.com/?size=100&id=E4FAF4hA9ugF&format=png&color=FFA500",
  clear: "https://img.icons8.com/?size=100&id=109408&format=png&color=FFA500",
  ban: "https://img.icons8.com/?size=100&id=BzwPdJnDmzEx&format=png&color=FFA500",
  kick: "https://img.icons8.com/?size=100&id=71285&format=png&color=FFA500",
  mute: "https://img.icons8.com/?size=100&id=644&format=png&color=FFA500",
};

// Adlink bypasser function (no API key needed)
async function bypassAdlink(url) {
  try {
    // Use pure JS solution - works for most common adlink services
    const proxyUrl = `https://api.bypass.vip/?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (data && data.destination) {
      return data.destination;
    }

    // Fallback method if first one fails
    const fallbackResponse = await fetch(
      `https://bypass.pm/bypass2?url=${encodeURIComponent(url)}`,
    );
    const fallbackData = await fallbackResponse.json();

    return fallbackData.destination || url; // Return original if all fails
  } catch (error) {
    console.error("Bypass error:", error);
    return url; // Return original URL if error occurs
  }
}

client.on("ready", () => {
  console.log(`ðŸ›°ï¸ Bot Ready â€” Logged in as ${client.user.tag}`);
  client.user.setActivity(">help | ðŸ’» Executing scripts", { type: "PLAYING" });

  // Setup default uptime monitoring for your services
  uptimeMonitor.setupDefaultServices();
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(">")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // PUBLIC COMMANDS
  if (command === "script") {
    const rawUrl =
      "https://rawscripts.net/raw/Universal-Script-Best-Universal-hub-44327";
    const cleanUrl = await bypassAdlink(rawUrl);

    const embed = new EmbedBuilder()
      .setTitle("Roulette Hub")
      .setDescription("this month we added air....")
      .setURL(cleanUrl)
      .setThumbnail(EMOJIS.script)
      .setColor(0x2ecc71);
    return message.reply({ embeds: [embed] });
  }

  if (command === "key") {
    const keyUrl =
      "https://discord.com/channels/1388707547061551274/1388737749015855184/1391981489335439481";
    const cleanKeyUrl = await bypassAdlink(keyUrl);

    const embed = new EmbedBuilder()
      .setTitle("Key System")
      .setDescription("ðŸ”‘ Grab your key For Roulette Hub.")
      .setURL(cleanKeyUrl)
      .setThumbnail(EMOJIS.key)
      .setColor(0xf1c40f);
    return message.reply({ embeds: [embed] });
  }

  if (command === "about") {
    const embed = new EmbedBuilder()
      .setTitle("About This Bot")
      .setDescription(
        "Bot by `@fevber`.\nðŸŽ¯ script server also rope ur self and cut ur head off until it bleeds.",
      )
      .setThumbnail(EMOJIS.about)
      .setColor(0x3498db);
    return message.reply({ embeds: [embed] });
  }

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("Help Menu")
      .setDescription(
        `ðŸ§  Here are the available commands:

\`>script\` â€” Latest universal script  
\`>key\` â€” Key system link  
\`>about\` â€” About the bot  
\`>status\` â€” Bot and server status  
\`>support\` â€” Get help  
\`>repeat <message>\` â€” Echoes your message

ðŸ“¡ **Ping Monitoring:**
\`>ping-add <host> [name]\` â€” Add ping monitor
\`>ping-remove <name>\` â€” Remove ping monitor  
\`>ping-status [name]\` â€” Check monitor status

ðŸŽ¯ **Uptime Monitoring:**
\`>uptime-add <url> [name]\` â€” Add uptime monitor
\`>uptime-remove <name>\` â€” Remove uptime monitor  
\`>uptime-status [name]\` â€” Check uptime status
\`>uptime-alerts <#channel>\` â€” Set alert channel

ðŸ”’ Locked Commands (Role: \`???\`):  
\`>delete-server\`  \`>clear\`  \`>ban\`  \`>kick\`  \`>mute\`  \`>spam\``,
      )
      .setThumbnail(EMOJIS.help)
      .setColor(0x9b59b6);
    return message.reply({ embeds: [embed] });
  }

  if (command === "status") {
    const uptimeSeconds = Math.floor(process.uptime());
    const embed = new EmbedBuilder()
      .setTitle("Roulette Hub Status")
      .setDescription(
        `ðŸ“¡ Bot is online as **${client.user.tag}**  
ðŸ§  Uptime: **${uptimeSeconds}s**  
ðŸŒ Host: Replit / Node.js  
ðŸ“¶ Ping: **${client.ws.ping}ms**`,
      )
      .setColor(0x1abc9c);
    return message.reply({ embeds: [embed] });
  }

  if (command === "support") {
    const embed = new EmbedBuilder()
      .setTitle("Support")
      .setDescription(
        "ðŸ› ï¸ Need help? Ping `@staff` or visit our support channel: https://discord.com/channels/1388707547061551274/1392209093598515252/1395955183770406944 ",
      )
      .setColor(0xe67e22);
    return message.reply({ embeds: [embed] });
  }

  if (command === "repeat") {
    const msg = args.join(" ");
    if (!msg)
      return message.reply("ðŸ—£ï¸ You need to provide a message to repeat.");
    return message.channel.send(msg);
  }

  if (command === "ping-add") {
    const host = args[0];
    const name = args[1] || host;

    if (!host) {
      return message.reply("âŒ Usage: `>ping-add <host/ip> [friendly_name]`");
    }

    const result = pingMonitor.addMonitor(name, host);
    const embed = new EmbedBuilder()
      .setTitle(result.success ? "âœ… Monitor Added" : "âŒ Error")
      .setDescription(result.message)
      .setColor(result.success ? 0x2ecc71 : 0xe74c3c);

    return message.reply({ embeds: [embed] });
  }

  if (command === "ping-remove") {
    const name = args[0];
    if (!name) {
      return message.reply("âŒ Usage: `>ping-remove <monitor_name>`");
    }

    const result = pingMonitor.removeMonitor(name);
    const embed = new EmbedBuilder()
      .setTitle(result.success ? "âœ… Monitor Removed" : "âŒ Error")
      .setDescription(result.message)
      .setColor(result.success ? 0x2ecc71 : 0xe74c3c);

    return message.reply({ embeds: [embed] });
  }

  if (command === "ping-status") {
    const name = args[0];

    if (name) {
      const result = pingMonitor.getMonitorStatus(name);
      if (!result.success) {
        return message.reply("âŒ Monitor not found");
      }

      const data = result.data;
      const statusIcon = data.status === "up" ? "ðŸŸ¢" : "ðŸ”´";

      const embed = new EmbedBuilder()
        .setTitle(`${statusIcon} ${data.name} Status`)
        .setDescription(
          `**Host:** ${data.host}
**Status:** ${data.status.toUpperCase()}
**Uptime:** ${data.uptime}
**Response Time:** ${data.responseTime}
**Last Check:** ${data.lastCheck ? data.lastCheck.toLocaleString() : "Never"}
**Total Checks:** ${data.totalChecks}
**Success Rate:** ${data.successfulChecks}/${data.totalChecks}`,
        )
        .setColor(data.status === "up" ? 0x2ecc71 : 0xe74c3c);

      return message.reply({ embeds: [embed] });
    }

    const monitors = pingMonitor.getAllMonitors();
    if (monitors.length === 0) {
      return message.reply(
        "ðŸ“¡ No monitors configured. Use `>ping-add <host>` to add one.",
      );
    }

    let description = "";
    monitors.forEach((monitor) => {
      const statusIcon = monitor.status === "up" ? "ðŸŸ¢" : "ðŸ”´";
      description += `${statusIcon} **${monitor.name}** (${monitor.host}) - ${monitor.uptime} uptime\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("ðŸ“¡ Ping Monitor Status")
      .setDescription(description)
      .setColor(0x3498db);

    return message.reply({ embeds: [embed] });
  }

  if (command === "uptime-add") {
    const url = args[0];
    const name = args[1] || url;

    if (!url) {
      return message.reply("âŒ Usage: `>uptime-add <url> [friendly_name]`");
    }

    const result = uptimeMonitor.addService(name, url);
    const embed = new EmbedBuilder()
      .setTitle(result.success ? "âœ… Uptime Monitor Added" : "âŒ Error")
      .setDescription(result.message)
      .setColor(result.success ? 0x2ecc71 : 0xe74c3c);

    return message.reply({ embeds: [embed] });
  }

  if (command === "uptime-remove") {
    const name = args[0];
    if (!name) {
      return message.reply("âŒ Usage: `>uptime-remove <service_name>`");
    }

    const result = uptimeMonitor.removeService(name);
    const embed = new EmbedBuilder()
      .setTitle(result.success ? "âœ… Uptime Monitor Removed" : "âŒ Error")
      .setDescription(result.message)
      .setColor(result.success ? 0x2ecc71 : 0xe74c3c);

    return message.reply({ embeds: [embed] });
  }

  if (command === "uptime-alerts") {
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply("âŒ Usage: `>uptime-alerts <#channel>`");
    }

    uptimeMonitor.setNotificationChannel(channel.id);
    const embed = new EmbedBuilder()
      .setTitle("âœ… Alert Channel Set")
      .setDescription(`Uptime alerts will be sent to ${channel}`)
      .setColor(0x2ecc71);

    return message.reply({ embeds: [embed] });
  }

  if (command === "uptime-status") {
    const name = args[0];

    if (name) {
      const result = uptimeMonitor.getServiceStatus(name);
      if (!result.success) {
        return message.reply("âŒ Service not found");
      }

      const data = result.data;
      const statusIcon = data.status === "up" ? "ðŸŸ¢" : "ðŸ”´";

      const embed = new EmbedBuilder()
        .setTitle(`${statusIcon} ${data.name} Uptime Status`)
        .setDescription(
          `**URL:** ${data.url}
**Status:** ${data.status.toUpperCase()}
**Uptime:** ${data.uptime}
**Response Time:** ${data.responseTime}
**Last Check:** ${data.lastCheck ? data.lastCheck.toLocaleString() : "Never"}
**Total Checks:** ${data.totalChecks}
**Successful:** ${data.successfulChecks}/${data.totalChecks}
**Last Downtime:** ${data.lastDowntime ? data.lastDowntime.toLocaleString() : "Never"}`,
        )
        .setColor(data.status === "up" ? 0x2ecc71 : 0xe74c3c);

      return message.reply({ embeds: [embed] });
    }

    const services = uptimeMonitor.getAllServices();
    if (services.length === 0) {
      return message.reply(
        "ðŸŽ¯ No uptime monitors configured. Use `>uptime-add <url>` to add one.",
      );
    }

    let description = "";
    services.forEach((service) => {
      const statusIcon = service.status === "up" ? "ðŸŸ¢" : "ðŸ”´";
      description += `${statusIcon} **${service.name}** - ${service.uptime} uptime (${service.responseTime})\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("ðŸŽ¯ Uptime Monitor Status")
      .setDescription(description)
      .setColor(0x3498db);

    return message.reply({ embeds: [embed] });
  }

  // RESTRICTED COMMANDS
  const restrictedRole = message.guild.roles.cache.find(
    (r) => r.name === "???",
  );
  if (!restrictedRole) return;

  if (!message.member.roles.cache.has(restrictedRole.id)) return;

  if (command === "delete-server") {
    const embed = new EmbedBuilder()
      .setTitle("Shutdown")
      .setDescription(
        "âš ï¸ Shutdown sequence initiated... (nah you ain't deleting ðŸ’€)",
      )
      .setColor(0xe74c3c);
    return message.reply({ embeds: [embed] });
  }

  if (command === "clear") {
    try {
      await message.channel.bulkDelete(1000, true);
      const embed = new EmbedBuilder()
        .setTitle("Messages Cleared")
        .setDescription("ðŸ§½ Last 1000 messages deleted.")
        .setThumbnail(EMOJIS.clear)
        .setColor(0x95a5a6);
      return message.channel.send({ embeds: [embed] });
    } catch {
      return message.channel.send("âŒ Failed to clear messages.");
    }
  }

  if (command === "ban") {
    const target = message.mentions.members.first();
    if (!target) return message.reply("Mention someone to ban.");
    try {
      await target.ban({ reason: `Banned by ${message.author.tag}` });
      const embed = new EmbedBuilder()
        .setTitle("User Banned")
        .setDescription(`ðŸ”¨ Banned **${target.user.tag}**`)
        .setThumbnail(EMOJIS.ban)
        .setColor(0xe74c3c);
      return message.channel.send({ embeds: [embed] });
    } catch {
      return message.reply("âŒ Could not ban that user.");
    }
  }

  if (command === "kick") {
    const target = message.mentions.members.first();
    if (!target) return message.reply("ðŸ” Mention someone to kick.");
    try {
      await target.kick("Kicked by command");
      const embed = new EmbedBuilder()
        .setTitle("User Kicked")
        .setDescription(`ðŸ¥¾ Kicked **${target.user.tag}**`)
        .setThumbnail(EMOJIS.kick)
        .setColor(0xe67e22);
      return message.channel.send({ embeds: [embed] });
    } catch {
      return message.reply("âŒ Could not kick that user.");
    }
  }

  if (command === "mute") {
    const target = message.mentions.members.first();
    if (!target) return message.reply("Mention someone to mute.");
    try {
      await target.timeout(100 * 600 * 1000, "Muted by command");
      const embed = new EmbedBuilder()
        .setTitle("User Muted")
        .setDescription(`Muted **${target.user.tag}** for 100 minutes`)
        .setThumbnail(EMOJIS.mute)
        .setColor(0xf39c12);
      return message.channel.send({ embeds: [embed] });
    } catch {
      return message.reply("âŒ Could not mute that user.");
    }
  }

  if (command === "spam") {
    const target = message.mentions.members.first();
    if (!target) return message.reply("ðŸš¨ Mention a user to spam.");
    for (let i = 0; i < 5; i++) {
      await message.channel.send(`ðŸ’¥ Spam #${i + 1} â†’ ${target}`);
    }
    return;
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("ðŸ”„ Shutting down gracefully...");
  pingMonitor.stopAllMonitors();
  uptimeMonitor.stopAllMonitoring();
  client.destroy();
  process.exit(0);
});

client.login(process.env.TOKEN);
