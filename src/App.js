import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // <-- Import auth
import { onAuthStateChanged, signOut } from 'firebase/auth'; // <-- Import auth functions
import './App.css'; 
import NoteList from './components/NoteList';
import NoteViewModal from './components/NoteViewModal';
import EditorModal from './components/EditorModal';
import LoginPage from './components/LoginPage'; // <-- Import the new page

function App() {
  const [user, setUser] = useState(null); // <-- State to hold the user object
  const [loading, setLoading] = useState(true); // <-- Loading state
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [viewingNoteId, setViewingNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // This effect runs once and listens for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  // --- All your existing handlers ---
  const handleCreateNote = () => setEditingNoteId("new");
  const handleEditNote = (id) => {
    setEditingNoteId(id);
    setViewingNoteId(null);
  };
  const handleCloseEditor = () => setEditingNoteId(null);
  const handleViewNote = (id) => setViewingNoteId(id);
  const handleCloseView = () => setViewingNoteId(null);
  const handleSwitchToEdit = (id) => {
    setViewingNoteId(null);
    setEditingNoteId(id);
  };
  
  // --- New Logout Handler ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // 1. Show a loading screen while checking auth
  if (loading) {
    return <div className="app-loading">Loading...</div>; // You can style this
  }

  // 2. If no user, show the Login Page
  if (!user) {
    return <LoginPage />;
  }

  // 3. If user is logged in, show the app
  return (
    <div className="app-container">
      
      <div className="sidebar">
      <h2>Notpad</h2>
      <p className="sidebar-welcome">Ai powered*</p>
      {/* <p className="sidebar-welcome">Welcome, {user.displayName || 'User'}!</p> */}
        <img 
          src="./Notebook-rafiki.png" 
          alt="Notebook" 
          className="sidebar-image"
        />
        
        <button className="btn-logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      
      <div className="main-content">
        <div className="home-header">
          <h3>Your Notes</h3>
          <button className="btn-create-note" onClick={handleCreateNote}>
            + Create Note
          </button>
        </div>
        
        <div className="search-container">
          <input
            type="search"
            placeholder="Search by title..."
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <NoteList 
          userId={user.uid} // <-- PASS USER ID
          onEditNote={handleEditNote} 
          onViewNote={handleViewNote}
          searchQuery={searchQuery}
        />
      </div>

      {viewingNoteId && (
        <NoteViewModal 
          userId={user.uid} // <-- PASS USER ID
          noteId={viewingNoteId}
          onClose={handleCloseView}
          onEdit={handleSwitchToEdit}
        />
      )}
      
      {editingNoteId && (
        <EditorModal
          userId={user.uid} // <-- PASS USER ID
          noteId={editingNoteId}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}

export default App;