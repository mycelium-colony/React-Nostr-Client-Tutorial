import { NostrEvent } from '../types/nostr';
import { parseReferences } from 'nostr-tools/references';
import { nip19 } from 'nostr-tools';

/**
 * Parse mentions and references in Nostr content
 * Implements NIP-08 (mentions) and NIP-27 (text references)
 */
export function parseContent(event: NostrEvent, userMetadata: Record<string, any> = {}): string {
  try {
    let content = event.content;
    
    // Parse references using NIP-10 and NIP-27
    const references = parseReferences(event);
    
    // Handle profile mentions - using type assertion since the actual structure
    // might differ from the type definition
    const referencesObj = references as any;
    if (referencesObj.profiles && Array.isArray(referencesObj.profiles)) {
      for (const profile of referencesObj.profiles) {
        const metadata = userMetadata[profile.pubkey];
        const displayName = metadata?.name || metadata?.displayName || profile.pubkey.slice(0, 8);
        
        // Create a npub for the profile
        const npub = nip19.npubEncode(profile.pubkey);
        
        // Replace all instances of the pubkey with the display name
        content = content.replace(
          new RegExp(`nostr:${profile.pubkey}|nostr:${npub}|#\\[\\d+\\]`, 'g'),
          `@${displayName}`
        );
      }
    }
    
    // Handle event mentions
    if (referencesObj.mentions && Array.isArray(referencesObj.mentions)) {
      for (const eventRef of referencesObj.mentions) {
        // Create a note for the event
        const note = nip19.noteEncode(eventRef.id);
        
        // Replace all instances of the event ID with a note reference
        content = content.replace(
          new RegExp(`nostr:${eventRef.id}|nostr:${note}|#\\[\\d+\\]`, 'g'),
          `note:${note.slice(0, 10)}...`
        );
      }
    }
    
    // Handle URLs
    content = content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
    );
    
    return content;
  } catch (error) {
    console.error('Error parsing content:', error);
    return event.content;
  }
}

/**
 * Extract hashtags from content
 */
export function extractHashtags(content: string): string[] {
  const hashtags: string[] = [];
  const regex = /#(\w+)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    hashtags.push(match[1]);
  }
  
  return hashtags;
}

/**
 * Format the subject from a NIP-14 tag
 */
export function getSubject(event: NostrEvent): string | null {
  const subjectTag = event.tags.find(tag => tag[0] === 'subject');
  return subjectTag ? subjectTag[1] : null;
}

/**
 * Check if an event is a repost (NIP-18)
 */
export function isRepost(event: NostrEvent): boolean {
  return event.kind === 6;
}

/**
 * Get the root event ID for a thread
 */
export function getRootId(event: NostrEvent): string | null {
  // Look for an e tag with 'root' marker
  const rootTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
  if (rootTag) return rootTag[1];
  
  // If no root marker, look for the first e tag
  const firstETag = event.tags.find(tag => tag[0] === 'e');
  return firstETag ? firstETag[1] : null;
}

/**
 * Get the reply event ID
 */
export function getReplyId(event: NostrEvent): string | null {
  // Look for an e tag with 'reply' marker
  const replyTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
  
  // If no reply marker, get the last e tag that's not the root
  if (!replyTag) {
    const eTags = event.tags.filter(tag => tag[0] === 'e');
    if (eTags.length > 1) {
      return eTags[eTags.length - 1][1];
    }
    return null;
  }
  
  return replyTag[1];
} 