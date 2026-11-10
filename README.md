# Retail AI UI

React frontend for the Retail AI Helper backend. Rebuilt around the
component / provider / store split used in CVS Health's Lumina
(`cvs-health-source-code/lumina`) web app.

## What's here

```text
retail-ai-ui/
├── src/
│   ├── main.jsx                 # root: ErrorBoundary + ThemeProvider + App
│   ├── App.jsx                  # layout: header, sidebar, chat, input
│   ├── App.css                  # layout + themed styles (CSS variables)
│   ├── index.css                # theme tokens, light / dark / system
│   ├── components/
│   │   ├── Header.jsx           # brand + mode toggle + status pill
│   │   ├── Sidebar.jsx          # persistent thread history
│   │   ├── Welcome.jsx          # empty-state suggestions
│   │   ├── Message.jsx          # one chat row + sources + typing indicator
│   │   ├── ChatInput.jsx        # auto-growing textarea + send / stop
│   │   └── ModeToggle.jsx       # light / dark / system switcher
│   ├── providers/
│   │   ├── ThemeProvider.jsx    # applies theme class to <html>
│   │   └── ErrorBoundary.jsx    # catches render errors
│   ├── hooks/
│   │   └── useChat.js           # send/stream pipeline, consumed by App
│   └── lib/
│       ├── api.js               # REST + SSE client
│       ├── constants.js         # endpoints, suggestions, storage keys
│       ├── utils.js             # cn(), formatTime()
│       └── stores/
│           ├── chatStore.js     # current conversation (zustand)
│           ├── threadsStore.js  # thread history, persisted in localStorage
│           └── themeStore.js    # theme preference, persisted
└── .env.example
```

## Patterns borrowed from Lumina

- **Zustand stores** for chat / threads / theme — same split Lumina uses.
- **CSS-variable theme tokens** with light + dark + system — matches the
  Lumina `index.css` approach without a build-time Tailwind step.
- **Theme-provider effect** that mirrors the current theme onto `<html>`'s
  classList so the whole tree re-styles atomically.
- **SSE streaming consumer** modelled on Lumina's `sse.js` wiring: parse
  per-frame JSON, surface a `[DONE]` sentinel, keep the controller behind
  an `AbortController` so the user can hit stop.
- **Component split**: `Header`, `Sidebar`, `Welcome`, `Message`,
  `ChatInput`, `ModeToggle` all live in their own files; `App.jsx` is just
  composition.
- **Thread persistence** in `localStorage` so returning users keep a
  side-bar of past conversations, as Lumina's "most recent threads" does.
- **Error boundary** at the root to catch render failures gracefully.
- **Markdown rendering** of assistant messages (headings, lists, tables,
  code) via `react-markdown` + `remark-gfm`.

## Setup

```bash
cd retail-ai-ui
pnpm install        # or: npm install / yarn
cp .env.example .env
pnpm dev            # http://localhost:5173
```

Point `VITE_API_BASE_URL` at the FastAPI backend (default `http://127.0.0.1:8000`).

## Backend contract

- `POST /chat` (fallback, non-streaming) → `{answer, route, sources, session_id, response_time_ms}`
- `POST /chat/stream` (default) → `text/event-stream` with frames:
  - `{"type": "start", "session_id": "..."}`
  - `{"type": "token", "content": "..."}`
  - `{"type": "sources", "route": "...", "sources": [...]}`
  - `{"type": "end", "response_time_ms": 123.4}`
  - `[DONE]`

Toggle streaming off by changing `useChat({ streaming: false })` in `App.jsx`.

## Dark mode

Click the sun / moon / monitor icons in the header. Preference persists in
`localStorage`. `system` follows `prefers-color-scheme`.
