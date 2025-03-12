import React from 'react';
import { useNostrStore } from '../store/nostrStore';
import { RelayMetadata } from '../types/nostr';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface RelayDirectoryProps {
  onBack: () => void;
}

/**
 * Component for displaying detailed information about connected relays
 */
export const RelayDirectory: React.FC<RelayDirectoryProps> = ({ onBack }) => {
  const { connectedRelays, relayMetadata } = useNostrStore();

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
      
      <h1 className="text-2xl font-bold mb-6">Connected Relays</h1>
      
      {connectedRelays.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No relays connected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {connectedRelays.map(relay => (
            <RelayCard 
              key={relay} 
              url={relay} 
              metadata={relayMetadata[relay] || {}} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface RelayCardProps {
  url: string;
  metadata: RelayMetadata;
}

/**
 * Card component for displaying detailed relay information
 */
const RelayCard: React.FC<RelayCardProps> = ({ url, metadata }) => {
  // Extract the domain from the URL
  const domain = url.replace('wss://', '').replace('ws://', '');
  
  // Format supported NIPs
  const supportedNips = metadata.supported_nips?.join(', ') || 'Unknown';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {metadata.name || domain}
          </h2>
          <span className="h-3 w-3 rounded-full bg-green-500" title="Connected" />
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-gray-500 dark:text-gray-400">URL:</span> 
            <span className="ml-2">{url}</span>
          </div>
          
          {metadata.description && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Description:</span>
              <p className="mt-1 text-sm">{metadata.description}</p>
            </div>
          )}
          
          {metadata.pubkey && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Pubkey:</span>
              <span className="ml-2 font-mono text-sm">{metadata.pubkey.slice(0, 10)}...{metadata.pubkey.slice(-4)}</span>
            </div>
          )}
          
          {metadata.software && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Software:</span>
              <span className="ml-2">{metadata.software} {metadata.version || ''}</span>
            </div>
          )}
          
          <div>
            <span className="text-gray-500 dark:text-gray-400">Supported NIPs:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {metadata.supported_nips ? (
                metadata.supported_nips.map(nip => (
                  <span 
                    key={nip} 
                    className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                  >
                    NIP-{nip}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Unknown</span>
              )}
            </div>
          </div>
          
          {metadata.contact && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Contact:</span>
              <span className="ml-2">{metadata.contact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 