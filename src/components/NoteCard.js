import React from 'react';
import './NoteCard.css'; // We will create this CSS file

// A predefined list of nice, "in-sync" colors
const cardColors = [
  '#fde2e4', '#dfe7fd', '#e2f0d9', '#fef8e0', '#fae2ff',
  '#fff1e6', '#d9edff', '#e0fbf6', '#ffeadb', '#fdecec',
];

function NoteCard({ note, onEdit, onDelete, onView }) {
  
  // This creates a consistent color based on the note's ID
  // It's "random" but won't change every time the component re-renders
  const getColor = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % cardColors.length;
    return cardColors[index];
  };

  const cardStyle = {
    backgroundColor: getColor(note.id)
  };
  
  return (
    <div className="note-card" style={cardStyle}>
      <div className="card-content" onClick={()=>onView(note.id)}>
        <h4>{note.title}</h4>
        <p>{note.description}</p>
      </div>
      <div className="card-footer">
        <button onClick={() => onEdit(note.id)} className="btn-edit">Edit</button>
        <button onClick={() => onDelete(note.id)} className="btn-delete">Delete</button>
      </div>
    </div>
  );
}

export default NoteCard;