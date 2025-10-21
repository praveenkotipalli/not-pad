import React, { useState } from 'react';
import './App.css'; 
import NoteList from './components/NoteList';
import NoteViewModal from './components/NoteViewModal';
import EditorModal from './components/EditorModal'; // We will create this

function App() {
  // This state tracks the note for the EDITOR modal
  // It can be null (closed), "new" (for create), or an id (for edit)
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  // This state tracks the note for the VIEW modal
  const [viewingNoteId, setViewingNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Handlers for Editor Modal ---
  const handleCreateNote = () => {
    setEditingNoteId("new"); // Open editor in "create" mode
  };
  
  const handleEditNote = (id) => {
    setEditingNoteId(id); // Open editor in "edit" mode
    setViewingNoteId(null); // Close view modal if open
  };

  const handleCloseEditor = () => {
    setEditingNoteId(null); // Close editor modal
  };

  // --- Handlers for View Modal ---
  const handleViewNote = (id) => {
    setViewingNoteId(id);
  };

  const handleCloseView = () => {
    setViewingNoteId(null);
  };

  // This is called from the view modal's pencil icon
  const handleSwitchToEdit = (id) => {
    setViewingNoteId(null); // Close view
    setEditingNoteId(id); // Open edit
  };

  return (
    <div className="app-container">
      
      <div className="sidebar">

      <h2>Not.pad</h2>
      <p>AI-powered*</p>

        <img 
          src="./Notebook-rafiki.png" 
          alt="Notebook Illustration" 
          className="sidebar-image"
        />
        
      </div>
      
      <div className="main-content">
        {/* The new minimal home page header */}
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
          onEditNote={handleEditNote} // Pass the edit handler
          onViewNote={handleViewNote} 
          searchQuery={searchQuery}
        />
      </div>

      {/* Render the View Modal */}
      {viewingNoteId && (
        <NoteViewModal 
          noteId={viewingNoteId}
          onClose={handleCloseView}
          onEdit={handleSwitchToEdit}
        />
      )}
      
      {/* Render the Editor Modal */}
      {editingNoteId && (
        <EditorModal
          noteId={editingNoteId}
          onClose={handleCloseEditor}
        />
      )}

    </div>
  );
}

export default App;