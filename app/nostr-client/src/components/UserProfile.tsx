import React, { useEffect, useState } from 'react';
import { useNostrStore } from '../store/nostrStore';
import { UserMetadata, NostrEvent } from '../types/nostr';
import { format } from 'date-fns';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Note } from './Note';
import { nip19 } from 'nostr-tools';

interface UserProfileProps {
  pubkey: string;
  onBack: () => void;
}

/**
 * Component for displaying a user's profile and their notes
 */
export const UserProfile: React.FC<UserProfileProps> = ({ pubkey, onBack }) => {
  const { 
    userMetadata, 
    fetchUserMetadata, 
    fetchUserEvents, 
    connectedRelays 
  } = useNostrStore();
  
  const [userEvents, setUserEvents] = useState<NostrEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user metadata and events when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      
      // Fetch the latest user metadata from all connected relays
      await fetchUserMetadata([pubkey], true); // Force refresh
      
      // Fetch user's events
      const events = await fetchUserEvents(pubkey);
      setUserEvents(events);
      
      setIsLoading(false);
    };
    
    loadUserData();
  }, [pubkey, fetchUserMetadata, fetchUserEvents]);
  
  // Get user metadata
  const metadata: UserMetadata = userMetadata[pubkey] || {};
  
  // Format the npub for display
  const npub = nip19.npubEncode(pubkey);
  const shortNpub = `${npub.slice(0, 8)}...${npub.slice(-4)}`;
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        Back to Feed
      </button>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
            {/* Banner */}
            {metadata.banner && (
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img 
                  src={metadata.banner} 
                  alt="Profile banner" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="p-6">
              {/* Avatar and name */}
              <div className="flex items-start">
                <div className="mr-4">
                  <img 
                    src={metadata.picture || `https://robohash.org/${pubkey}`} 
                    alt={metadata.name || 'User'} 
                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://robohash.org/${pubkey}`;
                    }}
                  />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-xl font-bold">
                    {metadata.displayName || metadata.name || shortNpub}
                  </h1>
                  
                  {metadata.name && metadata.name !== metadata.displayName && (
                    <p className="text-gray-500 dark:text-gray-400">@{metadata.name}</p>
                  )}
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {shortNpub}
                  </p>
                </div>
              </div>
              
              {/* Bio */}
              {metadata.about && (
                <div className="mt-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {metadata.about}
                  </p>
                </div>
              )}
              
              {/* Additional metadata */}
              <div className="mt-4 flex flex-wrap gap-4">
                {metadata.website && (
                  <a 
                    href={metadata.website.startsWith('http') ? metadata.website : `https://${metadata.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {metadata.website}
                  </a>
                )}
                
                {metadata.nip05 && (
                  <div className="text-green-500 flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {metadata.nip05}
                  </div>
                )}
                
                {metadata.lud16 && (
                  <div className="text-yellow-500 flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {metadata.lud16}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* User's notes */}
          <h2 className="text-lg font-semibold mb-4">Posts</h2>
          
          {userEvents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No posts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userEvents.map(event => (
                <Note 
                  key={event.id} 
                  event={event} 
                  userMetadata={userMetadata}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}; 