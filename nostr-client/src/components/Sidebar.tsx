import React, { useState } from 'react';
import { useNostrStore } from '../store/nostrStore';
import { RelayInfo } from './RelayInfo';
import { useNostrExtension } from '../hooks/useNostrExtension';
import { ArrowLeftIcon, PlusIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Sidebar component displaying connected relays and user info
 */
export const Sidebar: React.FC = () => {
  const { 
    connectedRelays, 
    relayMetadata, 
    currentView,
    setView
  } = useNostrStore();
  
  const { isAvailable, getPublicKey, isLoading, error } = useNostrExtension();
  const [manualCheckInProgress, setManualCheckInProgress] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);
  
  // Handle back button click
  const handleBackClick = () => {
    setView('feed');
  };
  
  // Handle relay directory click
  const handleRelayDirectoryClick = () => {
    setView('relays');
  };
  
  // Handle manual check for Nostr extension
  const handleManualCheck = async () => {
    setManualCheckInProgress(true);
    try {
      // Check if window.nostr exists
      if (window.nostr) {
        console.log('Nostr extension found manually:', window.nostr);
        
        // Try to get the public key
        try {
          const pk = await window.nostr.getPublicKey();
          console.log('Public key retrieved:', pk);
          setPubkey(pk);
          alert(`Nostr extension found! Public key: ${pk.slice(0, 8)}...`);
        } catch (err) {
          console.error('Error getting public key:', err);
          alert('Nostr extension found but failed to get public key');
        }
      } else {
        console.log('Nostr extension not found manually');
        alert('Nostr extension not found. Please make sure it is installed and enabled.');
      }
    } catch (err) {
      console.error('Error during manual check:', err);
      alert('Error checking for Nostr extension');
    } finally {
      setManualCheckInProgress(false);
    }
  };
  
  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-4">Nostr Client</h1>
        
        {/* Back button (only show in non-feed views) */}
        {currentView !== 'feed' && (
          <button
            className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
            onClick={handleBackClick}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Feed
          </button>
        )}
        
        {/* Nostr Extension Status */}
        <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold">Nostr Extension</h2>
            <button 
              className="text-blue-500 hover:text-blue-700 flex items-center text-xs"
              onClick={handleManualCheck}
              disabled={manualCheckInProgress}
            >
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              {manualCheckInProgress ? 'Checking...' : 'Check'}
            </button>
          </div>
          
          {isLoading ? (
            <p className="text-sm text-gray-500">Checking extension...</p>
          ) : isAvailable ? (
            <div className="flex items-center text-sm text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              Connected
              {pubkey && (
                <span className="ml-2 text-xs text-gray-500">
                  ({pubkey.slice(0, 8)}...)
                </span>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-500">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                Not available
              </div>
              {error && <p className="text-xs mt-1">{error}</p>}
              <p className="text-xs mt-1 text-gray-400">
                Try clicking the "Check" button or refreshing the page
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Connected Relays */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold">Connected Relays</h2>
          <div className="flex">
            <button 
              className="text-blue-500 hover:text-blue-700 mr-2"
              onClick={handleRelayDirectoryClick}
              title="View Relay Information"
            >
              <InformationCircleIcon className="w-4 h-4" />
            </button>
            <button 
              className="text-blue-500 hover:text-blue-700"
              title="Add Relay"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          {connectedRelays.map(relay => (
            <RelayInfo 
              key={relay} 
              url={relay} 
              metadata={relayMetadata[relay] || {}}
              onClick={handleRelayDirectoryClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 