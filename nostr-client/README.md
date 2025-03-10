# Nostr Client

A modern Nostr client built with React, TypeScript, and Tailwind CSS. This client implements various NIPs (Nostr Implementation Possibilities) to provide a feature-rich experience.

## Features

- Connect to multiple Nostr relays
- Display a feed of kind-1 notes (text posts)
- View threads and replies
- View user profiles with their metadata and posts
- View detailed relay information
- Compose and publish new notes
- Support for NIP-07 browser extensions (signing events)
- Display relay metadata (NIP-11)
- Parse mentions and references (NIP-08, NIP-10, NIP-27)
- Support for subjects in notes (NIP-14)
- Support for reposts (NIP-18)
- Proper encoding/decoding of Nostr identifiers (NIP-19)
- Support for reply counts (NIP-45)

## Architecture

The application is built with the following architecture:

### Components

- **App**: The main application component that sets up the layout and manages views
- **Sidebar**: Displays connected relays and Nostr extension status
- **Feed**: Displays a feed of notes or a thread view
- **Note**: Renders an individual note with user metadata
- **ComposeNote**: Form for composing and publishing new notes
- **RelayInfo**: Displays basic relay information in the sidebar
- **RelayDirectory**: Displays detailed information about connected relays
- **UserProfile**: Displays a user's profile and their notes

### Views

The application supports multiple views:

- **Feed**: The main feed showing recent notes
- **Thread**: A thread view showing a root note and its replies
- **Profile**: A user profile view showing their metadata and notes
- **Relays**: A view showing detailed information about connected relays

### State Management

The application uses Zustand for state management. The main store is in `src/store/nostrStore.ts` and manages:

- Connected relays
- Events (notes)
- User metadata
- Relay metadata
- Current view state

### Hooks

- **useNostrExtension**: Hook for interacting with NIP-07 browser extensions

### Utils

- **contentParser**: Utilities for parsing Nostr content, including mentions, references, and hashtags

## Implementation Details

### Relay Connections

The client connects to a set of default relays and fetches metadata for each relay using NIP-11. The relay connections are managed by the SimplePool from nostr-tools.

### Event Fetching

Events are fetched from the connected relays and stored in the application state. The client supports different views including a regular feed view, a thread view, and a user profile view.

### User Metadata

User metadata is fetched for the authors of displayed events and cached in the application state. The client ensures that the latest metadata is fetched when viewing a user's profile.

### Thread View

The thread view displays a root event and its replies. The client uses NIP-10 to determine the thread structure.

### User Profile View

The user profile view displays a user's metadata (name, picture, banner, bio, etc.) and their recent notes. The client fetches the latest metadata from all connected relays to ensure up-to-date information.

### Relay Directory

The relay directory displays detailed information about connected relays, including their metadata, supported NIPs, and other information provided by NIP-11.

### Composing Notes

The client supports composing new notes and replies. It uses the NIP-07 browser extension to sign events before publishing them to relays.

## NIPs Implemented

- **NIP-01**: Basic protocol flow description
- **NIP-03**: Timestamps for events
- **NIP-07**: Browser extension integration
- **NIP-08**: Mentions
- **NIP-10**: Text notes and threads
- **NIP-11**: Relay metadata
- **NIP-14**: Subject tag
- **NIP-18**: Reposts
- **NIP-19**: Nostr URI scheme encoding/decoding
- **NIP-21**: URI scheme
- **NIP-22**: Event replies
- **NIP-45**: Event counts

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or Bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nostr-client.git
cd nostr-client

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun run dev
```

### Building for Production

```bash
npm run build
# or
bun run build
```

## License

MIT
