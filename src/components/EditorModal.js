import React from 'react';
import NoteEditor from './NoteEditor';
import './EditorModal.css'; // We will create this

function EditorModal({ userId, noteId, onClose }) {
  
  // The 'noteId' prop will either be "new" or an actual id.
  // The NoteEditor expects 'null' for a new note, or the id.
  const currentNoteId = noteId === 'new' ? null : noteId;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="editor-modal-content" onClick={e => e.stopPropagation()}>
        
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <NoteEditor
        userId={userId}
          currentNoteId={currentNoteId}
          onNoteSaved={onClose}
          onCancelEdit={onClose}
        />
      </div>
    </div>
  );
}

export default EditorModal;