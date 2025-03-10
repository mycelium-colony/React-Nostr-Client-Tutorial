import React from 'react';
import { RelayMetadata } from '../types/nostr';

interface RelayInfoProps {
  url: string;
  metadata: RelayMetadata;
  onClick?: () => void;
}

/**
 * Component to display basic relay information in the sidebar
 */
export const RelayInfo: React.FC<RelayInfoProps> = ({ url, metadata, onClick }) => {
  // Extract the domain from the URL
  const domain = url.replace('wss://', '').replace('ws://', '');
  
  return (
    <div className="mb-2">
      <button
        className="w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-between"
        onClick={onClick}
      >
        <span className="truncate">{metadata.name || domain}</span>
        <span className="h-2 w-2 rounded-full bg-green-500" title="Connected" />
      </button>
    </div>
  );
}; 