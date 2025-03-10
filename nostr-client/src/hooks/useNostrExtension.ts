import { useState, useEffect } from 'react';
import type { WindowNostr } from 'nostr-tools/nip07';
import { EventTemplate, NostrEvent } from 'nostr-tools/pure';

interface NostrExtension {
  isAvailable: boolean;
  getPublicKey: () => Promise<string>;
  signEvent: (event: EventTemplate) => Promise<NostrEvent>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to interact with the Nostr extension (NIP-07)
 * This allows users to sign events using their browser extension
 */
export function useNostrExtension(): NostrExtension {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the Nostr extension is available
    const checkExtension = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (typeof window === 'undefined') {
          setIsAvailable(false);
          setError('Window is not defined');
          return;
        }

        // Some extensions might take time to inject the nostr object
        // Try multiple times with a delay
        let retries = 0;
        const maxRetries = 5;
        const checkForNostr = async () => {
          console.log(`Checking for Nostr extension (attempt ${retries + 1}/${maxRetries})...`);
          
          if (window.nostr) {
            console.log('Nostr extension found!', window.nostr);
            setIsAvailable(true);
            setIsLoading(false);
            return true;
          }
          
          // Check for specific extensions that might use different injection methods
          // nos2x-fox might use a different property or take longer to inject
          if (retries >= maxRetries) {
            console.log('Max retries reached, Nostr extension not found');
            setIsAvailable(false);
            setError('Nostr extension not found. Please install a Nostr extension like nos2x or Alby.');
            setIsLoading(false);
            return false;
          }
          
          retries++;
          // Wait and try again
          await new Promise(resolve => setTimeout(resolve, 500));
          return checkForNostr();
        };
        
        await checkForNostr();
      } catch (err) {
        setIsAvailable(false);
        setError('Error checking Nostr extension');
        console.error('Error checking Nostr extension:', err);
        setIsLoading(false);
      }
    };

    checkExtension();
    
    // Add event listener for when extension might be injected later
    const handleNostrInjection = () => {
      if (window.nostr && !isAvailable) {
        console.log('Nostr extension detected after page load');
        setIsAvailable(true);
        setError(null);
      }
    };
    
    window.addEventListener('load', handleNostrInjection);
    
    return () => {
      window.removeEventListener('load', handleNostrInjection);
    };
  }, [isAvailable]);

  /**
   * Get the public key from the Nostr extension
   */
  const getPublicKey = async (): Promise<string> => {
    if (!isAvailable) {
      throw new Error('Nostr extension not available');
    }

    try {
      // Double-check that nostr is available
      if (!window.nostr) {
        throw new Error('Nostr object not found on window');
      }
      
      console.log('Calling getPublicKey on Nostr extension');
      return await window.nostr.getPublicKey();
    } catch (err) {
      console.error('Error getting public key:', err);
      throw new Error('Failed to get public key from Nostr extension');
    }
  };

  /**
   * Sign an event using the Nostr extension
   */
  const signEvent = async (event: EventTemplate): Promise<NostrEvent> => {
    if (!isAvailable) {
      throw new Error('Nostr extension not available');
    }

    try {
      // Double-check that nostr is available
      if (!window.nostr) {
        throw new Error('Nostr object not found on window');
      }
      
      console.log('Calling signEvent on Nostr extension with event:', event);
      return await window.nostr.signEvent(event);
    } catch (err) {
      console.error('Error signing event:', err);
      throw new Error('Failed to sign event with Nostr extension');
    }
  };

  return {
    isAvailable,
    getPublicKey,
    signEvent,
    isLoading,
    error
  };
}

// Add the Nostr window type
declare global {
  interface Window {
    nostr?: WindowNostr;
  }
} 