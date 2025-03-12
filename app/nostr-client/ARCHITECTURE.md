# Nostr Client Architecture

This document provides a detailed explanation of the architecture and implementation of the Nostr client.

## Overview

The Nostr client is built with React, TypeScript, and Tailwind CSS. It uses the nostr-tools library to interact with the Nostr protocol and Zustand for state management.

## Directory Structure

```
nostr-client/
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand store
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
└── ...                   # Configuration files
```

## Components

### App.tsx

The main application component that sets up the layout with a sidebar and main content area. It initializes the connection to relays when the application loads and manages the different views in the application.

### Sidebar.tsx

Displays the connected relays and the status of the Nostr extension. It provides navigation to different views and a way to manually check for the Nostr extension.

### Feed.tsx

Displays a feed of notes or a thread view depending on the application state. It fetches events from relays and renders them as Note components. It also handles navigation to user profiles when a username is clicked.

### Note.tsx

Renders an individual note with user metadata, content, and action buttons. It handles parsing of content with mentions and references. It also provides clickable usernames to navigate to user profiles.

### ComposeNote.tsx

Provides a form for composing and publishing new notes or replies. It uses the Nostr extension to sign events before publishing.

### RelayInfo.tsx

Displays basic information about a relay in the sidebar, including its name and connection status. It provides a way to navigate to the relay directory.

### RelayDirectory.tsx

Displays detailed information about all connected relays, including their metadata, supported NIPs, and other information provided by NIP-11.

### UserProfile.tsx

Displays a user's profile information, including their name, picture, banner, bio, and other metadata. It also shows the user's recent notes.

## Views

The application supports multiple views, managed by the `currentView` state in the store:

### Feed View

The main view showing a feed of recent notes from all connected relays. This is the default view when the application loads.

### Thread View

Shows a thread of notes, including a root note and its replies. This view is activated when a user clicks on a note's reply button.

### Profile View

Shows a user's profile information and their recent notes. This view is activated when a user clicks on a username or profile picture.

### Relays View

Shows detailed information about all connected relays. This view is activated when a user clicks on the relay information button in the sidebar.

## State Management

The application uses Zustand for state management. The main store is defined in `src/store/nostrStore.ts`.

### Store Structure

```typescript
interface AppState {
  // Data
  events: NostrEvent[];
  userMetadata: Record<string, UserMetadata>;
  relayMetadata: Record<string, RelayMetadata>;
  connectedRelays: string[];
  
  // View state
  currentView: AppView;
  threadView: boolean; // Legacy, to be replaced by currentView
  currentThread: ThreadInfo | null;
  currentProfile: string | null;
}
```

### Actions

- `connectToRelays`: Connects to a set of relays and fetches their metadata
- `fetchEvents`: Fetches events from connected relays based on the current view
- `fetchUserMetadata`: Fetches metadata for a list of pubkeys, with an option to force refresh
- `fetchUserEvents`: Fetches events for a specific user
- `fetchRelayMetadata`: Fetches metadata for a relay using NIP-11
- `setView`: Sets the current view and related state
- `setThreadView`: Legacy method for backward compatibility
- `addEvent`: Adds a new event to the store

## Hooks

### useNostrExtension

A custom hook that provides an interface to interact with the Nostr extension (NIP-07). It checks if the extension is available and provides methods to get the public key and sign events.

```typescript
interface NostrExtension {
  isAvailable: boolean;
  getPublicKey: () => Promise<string>;
  signEvent: (event: EventTemplate) => Promise<NostrEvent>;
  isLoading: boolean;
  error: string | null;
}
```

## Utils

### contentParser.ts

Provides utilities for parsing Nostr content, including:

- `parseContent`: Parses mentions and references in content
- `extractHashtags`: Extracts hashtags from content
- `getSubject`: Gets the subject from a note (NIP-14)
- `isRepost`: Checks if an event is a repost (NIP-18)
- `getRootId`: Gets the root event ID for a thread
- `getReplyId`: Gets the reply event ID

## Data Flow

1. The application connects to relays when it loads
2. Events are fetched from relays and stored in the application state
3. User metadata is fetched for the authors of displayed events
4. The Feed component renders the events as Note components
5. When a user clicks on a note's reply button, the application switches to thread view
6. When a user clicks on a username or profile picture, the application switches to profile view
7. When a user clicks on the relay information button, the application switches to relays view
8. When a user composes a new note, it's signed using the Nostr extension and published to relays

## NIPs Implementation

### NIP-01: Basic Protocol Flow

The application follows the basic protocol flow by connecting to relays, subscribing to events, and publishing events.

### NIP-03: Timestamps

Events are displayed with their timestamps formatted using the date-fns library.

### NIP-07: Browser Extension

The application uses the Nostr extension to get the user's public key and sign events. It includes a manual check feature to help diagnose extension issues.

### NIP-08: Mentions

Mentions in content are parsed and displayed as user names. Clicking on a mention navigates to the user's profile.

### NIP-10: Text Notes and Threads

The application supports text notes and threads by parsing the event tags to determine the thread structure. It displays threads with proper indentation and visual cues.

### NIP-11: Relay Metadata

The application fetches and displays relay metadata in the relay directory. It shows information such as the relay's name, description, supported NIPs, and contact information.

### NIP-14: Subject Tag

The application supports the subject tag in notes, displaying it prominently above the note content.

### NIP-18: Reposts

The application identifies and handles repost events.

### NIP-19: Nostr URI Scheme

The application encodes and decodes Nostr identifiers using the nip19 module. It displays user pubkeys as npub format in profiles.

### NIP-21: URI Scheme

The application handles nostr: URIs.

### NIP-22: Event Replies

The application supports event replies by parsing the event tags and displaying them in threads.

### NIP-45: Event Counts

The application displays reply counts for notes.

## Performance Considerations

- Events are cached in the application state to reduce the number of requests to relays
- User metadata is fetched only for the authors of displayed events
- The application uses a SimplePool from nostr-tools to manage relay connections efficiently
- The application refreshes data periodically to ensure up-to-date information

## Security Considerations

- The application never handles private keys directly, relying on the Nostr extension for signing
- All user input is sanitized before being displayed
- External links open in a new tab with appropriate security attributes

## Future Improvements

- Add support for more event kinds (e.g., reactions, reposts)
- Implement pagination for the feed
- Add support for multiple user profiles
- Implement a more sophisticated caching strategy
- Add support for more NIPs
- Add the ability to add and remove relays
- Implement a search feature 