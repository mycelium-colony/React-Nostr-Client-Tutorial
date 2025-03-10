import React, { useState } from 'react';
import { NostrEvent, UserMetadata } from '../types/nostr';
import { parseContent, getSubject, getRootId } from '../utils/contentParser';
import { format } from 'date-fns';
import { useNostrStore } from '../store/nostrStore';
import { ArrowPathIcon, ArrowUturnLeftIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface NoteProps {
  event: NostrEvent;
  userMetadata: Record<string, UserMetadata>;
  showReplyCount?: boolean;
  isThreadView?: boolean;
  onProfileClick?: (pubkey: string) => void;
}

/**
 * Component to display a Nostr note (kind 1 event)
 */
export const Note: React.FC<NoteProps> = ({ 
  event, 
  userMetadata, 
  showReplyCount = true,
  isThreadView = false,
  onProfileClick
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const { setThreadView } = useNostrStore();
  
  // Get user metadata
  const metadata = userMetadata[event.pubkey] || {};
  const displayName = metadata.name || metadata.displayName || event.pubkey.slice(0, 8);
  const profilePicture = metadata.picture || `https://robohash.org/${event.pubkey}`;
  
  // Get subject (NIP-14)
  const subject = getSubject(event);
  
  // Parse content with mentions and references
  const parsedContent = parseContent(event, userMetadata);
  
  // Format date
  const formattedDate = format(new Date(event.created_at * 1000), 'MMM d, yyyy h:mm a');
  
  // Handle click on reply button
  const handleReplyClick = () => {
    if (!isThreadView) {
      // Get the root ID for the thread
      const rootId = getRootId(event) || event.id;
      
      // Set thread view in the store
      setThreadView(true, { rootId, replyCount: 0 });
    }
  };
  
  // Handle click on profile
  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick(event.pubkey);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      {/* Author info */}
      <div className="flex items-center mb-2">
        <img 
          src={profilePicture} 
          alt={displayName} 
          className="w-10 h-10 rounded-full mr-3 cursor-pointer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://robohash.org/${event.pubkey}`;
          }}
          onClick={handleProfileClick}
        />
        <div>
          <div 
            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
            onClick={handleProfileClick}
          >
            {displayName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</div>
        </div>
      </div>
      
      {/* Subject (if available) */}
      {subject && (
        <div className="font-bold text-lg mb-2">{subject}</div>
      )}
      
      {/* Content */}
      <div 
        className="text-gray-700 dark:text-gray-300 mb-3"
        dangerouslySetInnerHTML={{ __html: parsedContent }}
      />
      
      {/* Actions */}
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
        {/* Reply button */}
        <button 
          className="flex items-center mr-4 hover:text-blue-500"
          onClick={handleReplyClick}
        >
          <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
          {showReplyCount ? 'Reply' : 'Reply'}
        </button>
        
        {/* Repost button */}
        <button className="flex items-center mr-4 hover:text-green-500">
          <ArrowPathIcon className="w-4 h-4 mr-1" />
          Repost
        </button>
        
        {/* Quote button */}
        <button className="flex items-center hover:text-purple-500">
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
          Quote
        </button>
      </div>
    </div>
  );
}; 