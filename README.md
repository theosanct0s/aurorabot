# Aurora

Aurora is my personal Discord bot, built with **Node.js** and **discord.js v14**. It’s an actively developed project where I experiment, learn, and add features over time while using it in real servers.

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
3. Add your bot token to `.env`:
   ```bash
   DISCORD_TOKEN=bot_token_here
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the bot:
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