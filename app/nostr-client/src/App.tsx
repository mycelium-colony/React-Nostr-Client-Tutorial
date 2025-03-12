import { useEffect } from 'react';
import { useNostrStore } from './store/nostrStore';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { ComposeNote } from './components/ComposeNote';
import { UserProfile } from './components/UserProfile';
import { RelayDirectory } from './components/RelayDirectory';

function App() {
  const { 
    connectToRelays, 
    currentView, 
    currentThread, 
    currentProfile,
    setView
  } = useNostrStore();

  // Connect to relays on component mount
  useEffect(() => {
    connectToRelays();
  }, [connectToRelays]);
  
  // Render the appropriate view based on currentView
  const renderMainContent = () => {
    switch (currentView) {
      case 'profile':
        if (!currentProfile) return <Feed />;
        return (
          <UserProfile 
            pubkey={currentProfile} 
            onBack={() => setView('feed')} 
          />
        );
        
      case 'relays':
        return (
          <RelayDirectory 
            onBack={() => setView('feed')} 
          />
        );
        
      case 'thread':
        return (
          <>
            {currentThread && (
              <ComposeNote 
                replyTo={currentThread.rootId} 
                rootId={currentThread.rootId} 
              />
            )}
            <Feed />
          </>
        );
        
      case 'feed':
      default:
        return (
          <>
            <ComposeNote />
            <Feed />
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
