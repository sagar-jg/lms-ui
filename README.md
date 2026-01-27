# Tang Chat Widget

A student-friendly AI chat widget built with Next.js, designed to be embedded in Learning Management Systems (LMS). Powered by [Open Notebook](https://github.com/lfnovo/open-notebook) API.

## Features

- **Smart Search (Vector Search)**: Intelligent Q&A that searches through your study materials using semantic vector search and provides sourced answers
- **AI Chat**: Interactive chat interface with session history and context from all sources
- **Dual Mode**: Switch between "Smart Search" (single Q&A) and "Chat" (conversational) modes
- **Keynotes**: AI-generated study keynotes from your learning materials (coming soon)
- **Flash Cards**: Interactive flash cards for testing knowledge (coming soon)
- **Embeddable**: Can be embedded as an iframe in any LMS or website
- **Responsive**: Works on desktop and mobile devices

## How It Works

### Smart Search Mode
1. Uses **vector embeddings** to semantically search your uploaded study materials
2. Generates multiple search queries to find relevant content
3. Synthesizes a comprehensive answer from the found sources
4. Provides sourced, accurate answers grounded in your materials

### Chat Mode
1. Maintains conversation history within a session
2. Uses all your sources as context for the conversation
3. Great for follow-up questions and deeper exploration

## Quick Start

### 1. Install Dependencies

```bash
cd sagar
npm install
```

### 2. Configure Environment

Copy the example environment file and update the values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Open Notebook API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5055
NEXT_PUBLIC_API_PASSWORD=your-api-password

# Default Notebook ID (get this from Open Notebook)
NEXT_PUBLIC_DEFAULT_NOTEBOOK_ID=your-notebook-id

# Widget Configuration
NEXT_PUBLIC_AVATAR_NAME=Tang
NEXT_PUBLIC_WELCOME_MESSAGE=Hi! I'm Tang, your learning assistant. How can I help you today?
```

### 3. Start Development Server

```bash
npm run dev
```

The widget will be available at:
- Main page: http://localhost:3001
- Embed (chat): http://localhost:3001/embed
- Chat widget: http://localhost:3001/chat
- Flash Cards: http://localhost:3001/flashcards
- Podcasts: http://localhost:3001/podcast

## Usage

### Standalone Page

Visit `http://localhost:3001` to use the full-featured page with:
- Chat interface
- Keynotes panel
- Flash cards panel
- Tab navigation

### Embed in LMS

Each feature can be embedded separately as a widget in your LMS:

#### Available Routes

| Route | Description | Use Case |
|-------|-------------|----------|
| `/embed` | Full chat widget | General Q&A assistant |
| `/chat` | Chat-only widget | Chat assistant embedded in pages |
| `/flashcards` | Flash cards widget | Study/review pages |
| `/podcast` | Podcast player widget | Audio learning sections |

#### Chat Widget

```html
<iframe
  src="http://localhost:3001/chat?notebook_id=YOUR_NOTEBOOK_ID"
  width="400"
  height="600"
  frameborder="0"
  allow="clipboard-write"
  style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

**Chat Parameters:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `notebook_id` | The Open Notebook ID to use | From `.env.local` |
| `avatar` | Custom avatar name | "Tang" |
| `welcome` | Custom welcome message | Default welcome |

#### Flash Cards Widget

```html
<iframe
  src="http://localhost:3001/flashcards"
  width="450"
  height="650"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

#### Podcast Widget

```html
<iframe
  src="http://localhost:3001/podcast"
  width="400"
  height="500"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

#### Example with Custom Parameters

```html
<iframe
  src="http://localhost:3001/chat?notebook_id=abc123&avatar=Alex&welcome=Hello%20student!"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

### Floating Widget Button

Add a floating chat button to your LMS:

```html
<!-- Add this to your LMS page -->
<style>
  .sagar-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
  .sagar-widget-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9, #0369a1);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }
  .sagar-widget-button:hover {
    transform: scale(1.1);
  }
  .sagar-widget-popup {
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 380px;
    height: 550px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    display: none;
  }
  .sagar-widget-popup.open {
    display: block;
  }
  .sagar-widget-popup iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>

<div class="sagar-widget-container">
  <div class="sagar-widget-popup" id="sagarPopup">
    <iframe src="http://localhost:3001/embed?notebook_id=YOUR_NOTEBOOK_ID"></iframe>
  </div>
  <button class="sagar-widget-button" onclick="toggleSagarWidget()">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>
</div>

<script>
  function toggleSagarWidget() {
    const popup = document.getElementById('sagarPopup');
    popup.classList.toggle('open');
  }
</script>
```

## Project Structure

```
sagar/
├── src/
│   ├── app/
│   │   ├── chat/           # Chat widget route (/chat)
│   │   ├── embed/          # Embeddable widget page (/embed)
│   │   ├── flashcards/     # Flash cards widget route (/flashcards)
│   │   ├── podcast/        # Podcast widget route (/podcast)
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main page
│   ├── components/
│   │   ├── Avatar.tsx      # Avatar component
│   │   ├── ChatWidget.tsx  # Main chat widget
│   │   ├── ChatHeader.tsx  # Chat header with sessions
│   │   ├── ChatInput.tsx   # Message input
│   │   ├── MessageBubble.tsx # Message display
│   │   ├── KeynotesPanel.tsx # Keynotes feature
│   │   ├── FlashCardsPanel.tsx # Flash cards feature
│   │   └── FeatureTabs.tsx # Tab navigation
│   ├── hooks/
│   │   ├── useChat.ts      # Chat mode state management
│   │   └── useAsk.ts       # Smart Search mode with streaming
│   └── lib/
│       ├── api.ts          # API client
│       ├── types.ts        # TypeScript types
│       └── utils.ts        # Utility functions
├── .env.local.example      # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Integration

This widget consumes the Open Notebook API. Main endpoints used:

### Search Endpoints (Smart Search Mode)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | POST | Vector or text search on knowledge base |
| `/api/search/ask` | POST | Streaming multi-stage AI search (SSE) |
| `/api/search/ask/simple` | POST | Non-streaming single answer |

### Chat Endpoints (Chat Mode)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/sessions` | GET | List chat sessions |
| `/api/chat/sessions` | POST | Create new session |
| `/api/chat/sessions/{id}` | GET | Get session with messages |
| `/api/chat/execute` | POST | Send message and get response |
| `/api/chat/context` | POST | Build context from sources |

### Content Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sources` | GET | Get notebook sources |
| `/api/notes` | GET | Get notebook notes |

## Customization

### Styling

The widget uses Tailwind CSS. Customize colors in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      sagar: {
        light: '#e0f2fe',
        DEFAULT: '#0ea5e9',
        dark: '#0369a1',
      },
    },
  },
},
```

### Avatar

Change the avatar name via environment variable or URL parameter:

```env
NEXT_PUBLIC_AVATAR_NAME=YourAvatarName
```

Or via URL:
```
/embed?avatar=YourAvatarName
```

## Production Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

For production, set these in your deployment platform:

- `NEXT_PUBLIC_API_BASE_URL`: Your Open Notebook API URL
- `NEXT_PUBLIC_API_PASSWORD`: API authentication password
- `NEXT_PUBLIC_DEFAULT_NOTEBOOK_ID`: Default notebook ID
- `NEXT_PUBLIC_AVATAR_NAME`: Avatar display name
- `NEXT_PUBLIC_WELCOME_MESSAGE`: Welcome message

## Future Enhancements

- [ ] Real keynote generation from sources
- [ ] Real flash card generation from sources
- [ ] Study progress tracking
- [ ] Spaced repetition for flash cards
- [ ] Voice input/output
- [ ] Dark mode support

## License

MIT - Same as Open Notebook

## Credits

Built on top of [Open Notebook](https://github.com/lfnovo/open-notebook) - an open-source, privacy-focused alternative to Google's Notebook LM.
