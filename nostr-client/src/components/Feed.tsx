import React, { useEffect } from 'react';
import { useNostrStore } from '../store/nostrStore';
import { Note } from './Note';
import { NostrEvent } from '../types/nostr';
import { sortEvents } from 'nostr-tools/pure';

/**
 * Component to display a feed of Nostr events
 */
export const Feed: React.FC = () => {
  const { 
    events, 
    userMetadata, 
    fetchEvents, 
    currentView, 
    currentThread,
    setView
  } = useNostrStore();
  
  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
    
    // Set up a refresh interval
    const intervalId = setInterval(() => {
      fetchEvents();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchEvents, currentView, currentThread]);
  
  // Handle profile click
  const handleProfileClick = (pubkey: string) => {
    setView('profile', { profilePubkey: pubkey });
  };
  
  // Sort events by created_at timestamp
  const sortedEvents = sortEvents([...events]);
  
  // If there are no events, show a loading message
  if (sortedEvents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          {currentView === 'thread' ? 'Loading thread...' : 'Loading feed...'}
        </div>
      </div>
    );
  }
  
  // If in thread view, find the root event
  let rootEvent: NostrEvent | undefined;
  let replyEvents: NostrEvent[] = [];
  
  if (currentView === 'thread' && currentThread) {
    rootEvent = sortedEvents.find(event => event.id === currentThread.rootId);
    replyEvents = sortedEvents.filter(event => event.id !== currentThread.rootId);
  }
  
  return (
    <div className="space-y-4">
      {currentView === 'thread' && rootEvent ? (
        <>
          {/* Root event */}
          <div className="border-l-4 border-blue-500 pl-4">
            <Note 
              event={rootEvent} 
              userMetadata={userMetadata} 
              showReplyCount={false}
              isThreadView={true}
              onProfileClick={handleProfileClick}
            />
          </div>
          
          {/* Replies */}
          <div className="ml-8 space-y-4">
            {replyEvents.map(event => (
              <Note 
                key={event.id} 
                event={event} 
                userMetadata={userMetadata}
                showReplyCount={false}
                isThreadView={true}
                onProfileClick={handleProfileClick}
              />
            ))}
          </div>
        </>
      ) : (
        // Regular feed
        sortedEvents.map(event => (
          <Note 
            key={event.id} 
            event={event} 
            userMetadata={userMetadata}
            onProfileClick={handleProfileClick}
          />
        ))
      )}
    </div>
  );
}; 