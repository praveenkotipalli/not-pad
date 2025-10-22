import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import NoteCard from './NoteCard';
import './NoteList.css';

// 1. Accept 'searchQuery' as a prop
function NoteList({ userId, onEditNote, onViewNote, searchQuery }) {
  const [allNotes, setAllNotes] = useState([]); // Holds all notes from DB
  const [filteredNotes, setFilteredNotes] = useState([]); // Holds notes to display
  const [loading, setLoading] = useState(true);

  // Effect 1: Fetch all notes from Firestore (runs once)
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "users", userId,  "notes"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ ...doc.data(), id: doc.id });
      });
      setAllNotes(notesData); // Store the full, unfiltered list
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes: ", error);
      alert("Could not fetch notes.");
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []); // Empty dependency array, runs once

  // Effect 2: Filter notes whenever searchQuery or the main list changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredNotes(allNotes); // No search, show all
    } else {
      const results = allNotes.filter(note =>
        // Check if note.title exists before calling .toLowerCase()
        note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(results);
    }
  }, [searchQuery, allNotes]); // Re-runs when search or notes list changes

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteDoc(doc(db, "users", userId, "notes", id));
      } catch (e) {
        console.error("Error deleting note: ", e);
        alert("Failed to delete note.");
      }
    }
  };

  if (loading) {
    return <div className="note-list-loading">Loading notes...</div>
  }

  return (
    <div className="note-list-container">
      <div className="note-list-grid">
        {/* 3. Render the 'filteredNotes' list */}
        {filteredNotes.length === 0 ? (
          // Show a different message if searching vs. no notes
          <div className="empty-notes-placeholder">
            <p className="name">
              {searchQuery ? 'No notes match your search.' : "You haven't saved any notes yet."}
            </p>
            
            <div>
              <img className="image" src='./File searching-cuate.png' alt="File searching illustration" />
            </div>
            
          </div>
        ) : (
          filteredNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onEdit={onEditNote}
              onDelete={handleDelete}
              onView={onViewNote}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NoteList;