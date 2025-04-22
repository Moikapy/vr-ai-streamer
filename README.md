# VR-Streamogachi

A Next.js application that integrates a virtual reality (VR) environment with AI-driven interactions, real-time Twitch chat, and text-to-speech (TTS) capabilities. The project uses Three.js for WebXR-based VR, LangChain for AI (supporting xAI, Anthropic, and Ollama), WebSocket for real-time communication, and `tmi.js` for Twitch chat integration. It’s built and run with Bun.sh, a fast JavaScript runtime, and includes a `@/lib` alias for clean imports.

## Features

- **VR Environment**: A 3D scene with a placeholder avatar (cube), floor, and text plane, supporting WebXR for immersive VR experiences.
- **AI Integration**: Dynamic AI responses using LangChain with xAI (Grok), Anthropic (Claude), or Ollama (Llama3), selected via environment variables.
- **Real-Time Communication**: WebSocket server for processing AI prompts and Twitch chat messages.
- **Twitch Chat**: Live chat integration with `tmi.js`, sending messages to the AI and displaying them in the VR scene.
- **Text-to-Speech**: Web Speech API for speaking AI responses, with controls to stop, mute/unmute, and adjust volume.
- **Text Display**: Improved text plane with wrapping to show full AI responses and chat messages.
- **Developer-Friendly**: Built with Bun.sh for fast development, with a `@/lib` alias for clean module imports.

## Prerequisites

- **Bun.sh**: Version 1.1.x or higher ([https://bun.sh](https://bun.sh/)).
- **Twitch Account**: A channel for chat integration (e.g., `your_twitch_channel`).
- **AI Provider Credentials** (at least one):
    - xAI API key ([https://x.ai/api](https://x.ai/api)).
    - Anthropic API key ([https://console.anthropic.com/](https://console.anthropic.com/)).
    - Ollama local server ([http://localhost:11434](http://localhost:11434/), see [https://ollama.com/](https://ollama.com/)).
- **Browser**: WebXR-compatible (e.g., Chrome, Edge, Oculus Browser).
- **VR Headset** (optional): For immersive mode (e.g., Oculus Quest).

## Installation

1. **Clone the Repository**:
    
    git clone
    
    cd vr-ai-stream
    
2. **Install Dependencies**:
    
    bun install
    
3. **Configure Environment Variables**:
    - Copy `.env.local.example` to `.env.local`:cp .env.local.example .env.local
    - Edit `.env.local` with your credentials:ANTHROPIC_API_KEY=your_anthropic_keyXAI_API_KEY=your_xai_keyOLLAMA_HOST=[http://localhost:11434](http://localhost:11434/)ANTHROPIC_MODEL=claude-3-opus-20240229XAI_MODEL=grok-betaOLLAMA_MODEL=llama3
    - At least one provider (xAI, Anthropic, or Ollama) must be configured.
4. **Set Up Ollama (if using)**:
    - Install Ollama: brew install ollama (macOS) or follow [https://ollama.com/](https://ollama.com/).
    - Start the server: ollama serve
    - Pull a model: ollama pull llama3
    - Verify: [http://localhost:11434](http://localhost:11434/)
5. **Update Twitch Channel**:
    - In `app/page.js`, replace `'your_twitch_channel'` with your Twitch channel name (e.g., `'moikapy'`).

## Usage

1. **Start the WebSocket Server**:
    
    bun run server.js
    
    - Verify: WebSocket server running on ws://localhost:3001
2. **Run the Next.js App**:
    
    bun run dev
    
    - Open: [http://localhost:3000](http://localhost:3000/) in a WebXR-compatible browser.
3. **Interact with the App**:
    - **VR Scene**: View the 3D environment with a red cube avatar and text plane.
    - **Manual Prompts**: Enter a prompt in the input field and submit to get AI responses.
    - **Twitch Chat**: Send messages in your Twitch channel’s chat to see them in the VR scene and trigger AI responses.
    - **Text-to-Speech**:
        - Responses are spoken using the Web Speech API.
        - Use "Stop TTS" to cancel speech.
        - Toggle "Mute/Unmute" to enable/disable speech.
        - Adjust the volume slider (0.0 to 1.0).
    - **VR Mode**: Click the VR button to enter immersive mode (requires a headset).

## Project Structure

vr-ai-stream/

├── app/

│   ├── api/

│   │   └── ai/

│   │       └── route.js        # API route for AI requests

│   └── page.js                 # Main VR and UI component

├── lib/

│   └── llm.js                  # AI model selection (LangChain)

├── .env.local.example          # Environment variable template

├── .env.local                  # Environment variables (gitignored)

├── next.config.js              # Next.js config with @/lib alias

├── tsconfig.json               # TypeScript config with @/lib paths

├── package.json                # Dependencies and scripts

├── bunfig.toml                 # Bun.sh project config

├── server.js                   # WebSocket server

└── ...

## Development

- **Add Features**:
    - **Avatar Upgrade**: Replace the cube with a .glb/.vrm model using Three.js’s `GLTFLoader`.
    - **Streaming**: Configure OBS Studio to capture the browser and stream to Twitch.
    - **Advanced TTS**: Use paid APIs (e.g., Google Cloud TTS) for production-quality voices.
- **Customization**:
    - **Voice Selection**: Add a UI dropdown for Web Speech API voices.
    - **Text Styling**: Color-code user vs. AI messages on the text plane.
    - **Twitch Moderation**: Filter chat messages (e.g., ignore commands).
- **Troubleshooting**:
    - **Text Truncation**: Adjust canvas height in `app/page.js` (e.g., `textCanvas.height = 768`).
    - **TTS Issues**: Ensure browser audio is enabled; test in Chrome/Edge.
    - **Twitch/WebSocket**: Verify `server.js` is running and Twitch channel is active.
    - Check console logs for errors and share for support.

## Known Limitations

- **TTS Quality**: Web Speech API voices are basic; consider paid APIs for production.
- **Text Display**: Long responses may require larger canvas or scrolling for full visibility.
- **Browser Compatibility**: WebXR and Web Speech API support varies (Chrome/Edge recommended).
- **AI Costs**: xAI/Anthropic APIs may incur usage fees; Ollama is free but requires local hardware.

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch: git checkout -b feature-name
3. Commit changes: git commit -m "Add feature"
4. Push to the branch: git push origin feature-name
5. Open a pull request.

## License

MIT License. See LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/), [Three.js](https://threejs.org/), and [Bun.sh](https://bun.sh/).
- AI powered by [LangChain](https://js.langchain.com/) with xAI, Anthropic, and Ollama.
- Twitch integration via [tmi.js](https://github.com/tmijs/tmi.js).
- Inspired by VR and AI streaming innovations.