import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './NoteViewModal.css';

// This is the SVG for the pencil icon
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

function NoteViewModal({userId, noteId, onClose, onEdit }) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the full note details when the modal opens
  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      const noteDoc = await getDoc(doc(db,"users", userId, "notes", noteId));
      if (noteDoc.exists()) {
        setNote(noteDoc.data());
      } else {
        console.error("No such note!");
        onClose(); // Close if note not found
      }
      setLoading(false);
    };
    fetchNote();
  }, [noteId, onClose, userId]);

  const handleEditClick = () => {
    onEdit(noteId); // Call App.js to switch to editor
  };

  return (
    // The backdrop darkens the background. Clicking it calls onClose.
    <div className="modal-backdrop" onClick={onClose}>
      {/* This stops clicks inside the modal from closing it */}
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Your requested pencil icon button */}
        <button className="modal-edit-btn" onClick={handleEditClick} title="Edit Note">
          <PencilIcon />
        </button>
        
        {/* The 'X' close button */}
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        {loading && <p className="modal-loading">Loading...</p>}
        
        {note && (
          <>
            <h2>{note.title}</h2>
            {/* 'whiteSpace: "pre-wrap"' is important. 
              It makes your note respect newlines and paragraphs.
            */}
            <p className="modal-description" style={{ whiteSpace: 'pre-wrap' }}>
              {note.description}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default NoteViewModal;