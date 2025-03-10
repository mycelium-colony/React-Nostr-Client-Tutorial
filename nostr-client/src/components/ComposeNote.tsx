import React, { useState } from 'react';
import { useNostrExtension } from '../hooks/useNostrExtension';
import { useNostrStore } from '../store/nostrStore';
import { EventTemplate } from 'nostr-tools/pure';
import { ShortTextNote } from 'nostr-tools/kinds';

interface ComposeNoteProps {
  replyTo?: string;
  rootId?: string;
}

/**
 * Component for composing and publishing a new note
 */
export const ComposeNote: React.FC<ComposeNoteProps> = ({ replyTo, rootId }) => {
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAvailable, signEvent, isLoading } = useNostrExtension();
  const { addEvent, threadView } = useNostrStore();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAvailable) {
      setError('Nostr extension not available. Please install a Nostr extension like nos2x or Alby and refresh the page.');
      return;
    }
    
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create tags array
      const tags: string[][] = [];
      
      // Add subject tag if provided (NIP-14)
      if (subject.trim()) {
        tags.push(['subject', subject.trim()]);
      }
      
      // Add reply and root tags if provided (NIP-10)
      if (replyTo) {
        tags.push(['e', replyTo, '', 'reply']);
      }
      
      if (rootId && rootId !== replyTo) {
        tags.push(['e', rootId, '', 'root']);
      }
      
      // Create event template
      const eventTemplate: EventTemplate = {
        kind: ShortTextNote,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: content.trim(),
      };
      
      console.log('Signing event with template:', eventTemplate);
      
      // Sign the event using the extension
      const signedEvent = await signEvent(eventTemplate);
      console.log('Event signed successfully:', signedEvent);
      
      // Add the event to the store
      addEvent(signedEvent);
      
      // Reset form
      setContent('');
      setSubject('');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error publishing note:', err);
      setError(`Failed to publish note: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };
  
  // Check if the extension is still loading
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <p className="text-center text-gray-500">Checking for Nostr extension...</p>
      </div>
    );
  }
  
  // If extension is not available, show a more helpful message
  if (!isAvailable && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="text-center">
          <p className="text-red-500 mb-2">Nostr extension not detected</p>
          <p className="text-sm text-gray-500 mb-4">
            To publish notes, you need to install a Nostr browser extension like nos2x-fox or Alby.
          </p>
          <div className="flex flex-col space-y-2">
            <a 
              href="https://github.com/fiatjaf/nos2x" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              Install nos2x extension
            </a>
            <a 
              href="https://getalby.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              Install Alby extension
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              Refresh page after installing
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Show subject field only for new posts, not replies */}
        {!replyTo && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Subject (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting || !isAvailable}
            />
          </div>
        )}
        
        <div className="mb-3">
          <textarea
            placeholder={replyTo ? "Write your reply..." : "What's on your mind?"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white min-h-[100px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting || !isAvailable}
          />
        </div>
        
        {error && (
          <div className="mb-3 text-red-500 text-sm">{error}</div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting || !isAvailable || !content.trim()}
          >
            {isSubmitting ? 'Publishing...' : replyTo ? 'Reply' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}; 