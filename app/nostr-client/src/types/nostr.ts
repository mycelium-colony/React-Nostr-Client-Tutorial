import { Event } from 'nostr-tools/pure';

// Define the types for our application
export type NostrEvent = Event;

export interface UserMetadata {
  name?: string;
  displayName?: string;
  picture?: string;
  banner?: string;
  about?: string;
  website?: string;
  nip05?: string;
  lud16?: string;
}

export interface RelayMetadata {
  name?: string;
  description?: string;
  pubkey?: string;
  contact?: string;
  supported_nips?: number[];
  software?: string;
  version?: string;
}

export interface ThreadInfo {
  rootId: string;
  replyCount: number;
}

// Define the different views in the application
export type AppView = 'feed' | 'thread' | 'profile' | 'relays';

export interface AppState {
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