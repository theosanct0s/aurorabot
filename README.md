# Aurora Bot

[![Node.js 18.18+](https://img.shields.io/badge/Node.js-18.18%2B-43853d?logo=node.js&logoColor=white)](https://nodejs.org/en)
[![discord.js v14](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/#/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)](#)

> A personal Discord bot where I test ideas and ship features. Focused on clean slash commands, quick utilities, and a few fun interactions.

- Actively developed and used on real servers
- Slash commands only, auto-registered
- Mix of fun, utility, and moderation tools

---

## 🚀 Tech Stack
- **Node.js** 18.18+
- **discord.js** v14
- **dotenv** for environment variables
- **colorette** for clean colored logs

---

## 📦 Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/theosanct0s/aurorabot.git
   cd aurorabot
   ```
2. Rename the .env file:
   ```bash
   from .env.example to .env
   ```
3. Configure your environment variables in `.env`:
   ```bash
   DISCORD_TOKEN=bot_token_here
   APPLICATION_ID=bot_id_here
   OWNER_ID=owner_id_here
   EMBED_COLOR=#aa8ed6 (The hex color used for all bot embeds)
   ```
4. In the [Discord Developer Portal](https://discord.com/developers/applications), enable the **Message Content Intent** for the bot (needed to reply to mentions).
5. Install dependencies:
   ```bash
   npm install
   ```
6. Start the bot:
   ```bash
   node .
   ```

⚠️ Slash commands are registered globally; Discord may take a few minutes to propagate them.

---

## 🧩 Project Structure
```
src/
├── commands/        # Slash commands
├── events/          # Discord event handlers
├── lib/             # Command & event loaders
├── utils/           # Utility functions (logger)
├── config.js        # Bot configuration
└── index.js         # Application entry point
```

### Key files
- src/index.js – Initializes the client, loads commands/events, and logs in.
- src/lib/commandLoader.js – Loads and registers slash commands automatically.
- src/lib/eventLoader.js – Registers Discord events dynamically.
- src/utils/logger.js – Keeps logs clean and readable.

---

## 📌 Notes
- Personal project, actively maintained and improved.
- Modular and easy to extend.
- Add new commands/events without changing the core logic.