# GPT-4o mini Chat Application

A modern, responsive chat interface powered by OpenAI's GPT-4o mini model. This application allows users to have interactive conversations with AI, customize system prompts, and manage chat history.

![GPT-4o mini Chat Screenshot](https://via.placeholder.com/800x450.png?text=GPT-4o+mini+Chat+App)

## Features

- **AI-Powered Chat**: Interact with OpenAI's GPT-4o mini model
- **System Prompts**: Customize how the AI responds with powerful system prompts
- **Predefined Prompt Templates**: Choose from various predefined prompt styles (concise, detailed, friendly, etc.)
- **Chat History**: Save and manage conversation history
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface inspired by ChatGPT
- **Streaming Responses**: Real-time streaming of AI responses
- **Error Handling**: Robust error handling with informative messages

## Technologies Used

- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- Vercel AI SDK
- OpenAI API

## Getting Started

### Prerequisites

- Node.js 18 or later
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Omrimati/gpt4o-mini-chat-app.git
   cd gpt4o-mini-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Using System Prompts

This application allows you to customize how the AI responds by configuring system prompts:

1. Click the Settings icon in the sidebar
2. Choose from predefined prompt templates or create your own
3. Toggle system prompts on/off
4. Save your changes and start a new conversation

Example system prompts:
- "Always respond in rhyming verse"
- "Explain concepts as if I'm a 5-year-old"
- "Take on the persona of a professional chef when answering cooking questions"

## Deployment

This project can be easily deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOmrimati%2Fgpt4o-mini-chat-app)

Remember to set your `OPENAI_API_KEY` in the environment variables.

## License

MIT License

## Acknowledgements

- OpenAI for the GPT-4o mini model
- Vercel for the AI SDK and hosting
- The Next.js team for the amazing framework