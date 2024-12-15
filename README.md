# AI Voice Planner

A Progressive Web App for managing voice notes and tasks with offline capabilities. The application provides comprehensive task management with local storage support, voice recording functionality, and markdown editing features with table support.

## Features

- 🎤 Voice note recording and playback
- 📝 Markdown editor with table formatting
- ✅ Task creation and management system
- 💾 IndexedDB integration for offline storage
- 🔄 JIRA task integration
- 📱 Progressive Web App (PWA) implementation
- 🔄 Note-to-task conversion functionality

## Tech Stack

- Frontend: React with TypeScript
- Styling: Tailwind CSS with ShadcnUI
- Database: PostgreSQL with Drizzle ORM
- Backend: Express.js
- Storage: IndexedDB for offline capabilities
- PWA: Service Worker for offline functionality

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/ajz007/ai-voice-planner.git
cd ai-voice-planner
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_postgresql_connection_string
JIRA_API_TOKEN=your_jira_api_token
JIRA_EMAIL=your_jira_email
JIRA_URL=your_jira_instance_url
```

4. Start the development server
```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
