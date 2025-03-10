import { create } from 'zustand';
import { SimplePool } from 'nostr-tools/pool';
import { AppState, AppView, NostrEvent, RelayMetadata, UserMetadata } from '../types/nostr';
import { nip11 } from 'nostr-tools';
import { Metadata, ShortTextNote } from 'nostr-tools/kinds';
import { sortEvents } from 'nostr-tools/pure';

// Default relays to connect to
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://nostr.wine'
];

// Create a pool for relay connections
const pool = new SimplePool();

// Create the store
export const useNostrStore = create<AppState & {
  // Actions
  connectToRelays: (relays?: string[]) => Promise<void>;
  fetchEvents: () => Promise<NostrEvent[]>;
  fetchUserMetadata: (pubkeys: string[], forceRefresh?: boolean) => Promise<void>;
  fetchUserEvents: (pubkey: string) => Promise<NostrEvent[]>;
  fetchRelayMetadata: (relayUrl: string) => Promise<void>;
  setView: (view: AppView, params?: { threadInfo?: { rootId: string, replyCount: number }, profilePubkey?: string }) => void;
  setThreadView: (isThreadView: boolean, threadInfo?: { rootId: string, replyCount: number }) => void;
  addEvent: (event: NostrEvent) => void;
}>((set, get) => ({
  // Initial state
  events: [],
  userMetadata: {},
  relayMetadata: {},
  connectedRelays: [],
  currentView: 'feed',
  threadView: false,
  currentThread: null,
  currentProfile: null,

  // Connect to relays
  connectToRelays: async (relays = DEFAULT_RELAYS) => {
    try {
      // Store the connected relays
      set({ connectedRelays: relays });
      
      // Fetch metadata for each relay
      for (const relay of relays) {
        get().fetchRelayMetadata(relay);
      }
    } catch (error) {
      console.error('Error connecting to relays:', error);
    }
  },

  // Fetch events from relays
  fetchEvents: async () => {
    try {
      const { connectedRelays, threadView, currentThread, currentView } = get();
      
      if (connectedRelays.length === 0) {
        await get().connectToRelays();
      }
      
      // If in thread view, fetch the thread
      if ((threadView || currentView === 'thread') && currentThread) {
        // Use separate calls for each filter
        const threadRepliesFilter = {
          kinds: [ShortTextNote],
          '#e': [currentThread.rootId]
        };
        
        const rootEventFilter = {
          kinds: [ShortTextNote],
          ids: [currentThread.rootId]
        };
        
        // Use querySync for both filters
        const threadReplies = await pool.querySync(connectedRelays, threadRepliesFilter);
        const rootEvent = await pool.querySync(connectedRelays, rootEventFilter);
        
        // Combine the results
        const events = [...threadReplies, ...rootEvent] as NostrEvent[];
        
        // Sort events
        const sortedEvents = sortEvents(events);
        
        set({ events: sortedEvents });
        
        // Fetch metadata for authors
        const pubkeys = [...new Set(events.map((event: NostrEvent) => event.pubkey))];
        await get().fetchUserMetadata(pubkeys);
        
        return sortedEvents;
      } else {
        // Fetch regular feed
        const feedFilter = {
          kinds: [ShortTextNote],
          limit: 50
        };
        
        // Use querySync
        const events = await pool.querySync(connectedRelays, feedFilter) as NostrEvent[];
        
        // Sort events
        const sortedEvents = sortEvents(events);
        
        set({ events: sortedEvents });
        
        // Fetch metadata for authors
        const pubkeys = [...new Set(events.map((event: NostrEvent) => event.pubkey))];
        await get().fetchUserMetadata(pubkeys);
        
        return sortedEvents;
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Fetch user metadata
  fetchUserMetadata: async (pubkeys: string[], forceRefresh = false) => {
    try {
      const { connectedRelays, userMetadata } = get();
      
      // Filter out pubkeys we already have metadata for, unless forceRefresh is true
      const pubkeysToFetch = forceRefresh 
        ? pubkeys 
        : pubkeys.filter(pk => !userMetadata[pk]);
      
      if (pubkeysToFetch.length === 0) return;
      
      const metadataFilter = {
        kinds: [Metadata],
        authors: pubkeysToFetch
      };
      
      // Use querySync
      const metadataEvents = await pool.querySync(connectedRelays, metadataFilter) as NostrEvent[];
      
      const newMetadata: Record<string, UserMetadata> = { ...userMetadata };
      
      for (const event of metadataEvents) {
        try {
          const metadata: UserMetadata = JSON.parse(event.content);
          newMetadata[event.pubkey] = metadata;
        } catch (e) {
          console.error('Error parsing user metadata:', e);
        }
      }
      
      set({ userMetadata: newMetadata });
    } catch (error) {
      console.error('Error fetching user metadata:', error);
    }
  },
  
  // Fetch user events
  fetchUserEvents: async (pubkey: string) => {
    try {
      const { connectedRelays } = get();
      
      if (connectedRelays.length === 0) {
        await get().connectToRelays();
      }
      
      // Create filter for user's events
      const userEventsFilter = {
        kinds: [ShortTextNote],
        authors: [pubkey],
        limit: 50
      };
      
      // Fetch events
      const events = await pool.querySync(connectedRelays, userEventsFilter) as NostrEvent[];
      
      // Sort events
      return sortEvents(events);
    } catch (error) {
      console.error(`Error fetching events for user ${pubkey}:`, error);
      return [];
    }
  },

  // Fetch relay metadata using NIP-11
  fetchRelayMetadata: async (relayUrl: string) => {
    try {
      const metadata = await nip11.fetchRelayInformation(relayUrl);
      
      set(state => ({
        relayMetadata: {
          ...state.relayMetadata,
          [relayUrl]: metadata
        }
      }));
    } catch (error) {
      console.error(`Error fetching metadata for relay ${relayUrl}:`, error);
    }
  },
  
  // Set the current view
  setView: (view, params = {}) => {
    const updates: Partial<AppState> = {
      currentView: view,
      threadView: view === 'thread' // For backward compatibility
    };
    
    // Reset all view-specific state
    updates.currentThread = null;
    updates.currentProfile = null;
    
    // Set view-specific state based on the view
    if (view === 'thread' && params.threadInfo) {
      updates.currentThread = {
        rootId: params.threadInfo.rootId,
        replyCount: params.threadInfo.replyCount
      };
    } else if (view === 'profile' && params.profilePubkey) {
      updates.currentProfile = params.profilePubkey;
    }
    
    set(updates);
    
    // Fetch data for the new view
    if (view === 'feed' || view === 'thread') {
      get().fetchEvents();
    }
  },

  // Legacy method for backward compatibility
  setThreadView: (isThreadView, threadInfo) => {
    if (isThreadView && threadInfo) {
      get().setView('thread', { threadInfo });
    } else {
      get().setView('feed');
    }
  },

  // Add a new event
  addEvent: (event: NostrEvent) => {
    set(state => ({
      events: [event, ...state.events]
    }));
    
    // Fetch metadata for the author if needed
    if (!get().userMetadata[event.pubkey]) {
      get().fetchUserMetadata([event.pubkey]);
    }
  }
})); 