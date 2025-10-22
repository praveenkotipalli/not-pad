import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import './NoteEditor.css'; // We will create this CSS file

// --- CONFIGURE GEMINI ---
const GEMINI_API_KEY = "AIzaSyDOcoaX3sHPC6odYdw03n19S_ktLqceDDE"; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

// --- SPEECH RECOGNITION ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true; 
  recognition.interimResults = false; 
  recognition.lang = 'en-US'; 
}

// This component now receives props to handle editing
function NoteEditor({userId, currentNoteId, onNoteSaved, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalDesc, setOriginalDesc] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Refs for speech recognition stability
  const descRef = useRef(description);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    descRef.current = description;
  }, [description]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // This new effect loads a note's data when an "edit" is triggered
  useEffect(() => {
    const loadNote = async () => {
      if (!currentNoteId) {
        // No note selected, just reset the form
        // resetForm();
        clearFormFields();
        return;
      }
      
      const noteDoc = await getDoc(doc(db,"users", userId, "notes", currentNoteId));
      if (noteDoc.exists()) {
        const data = noteDoc.data();
        setTitle(data.title || ''); 
        setDescription(data.description || '');
        setOriginalDesc(data.originalDescription || '');
        setHasChecked(false); // Reset check status on load
      }
    };
    loadNote();
  }, [currentNoteId, userId]); // This runs every time currentNoteId changes

  // Speech recognition logic (targeting the description field)
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;
      if (lastResult.isFinal) {
        setDescription(descRef.current + transcript + ' ');
      }
    };
    recognition.onend = () => {
      if (isListeningRef.current) recognition.start();
    };
    recognition.onerror = (event) => console.error("Speech error:", event.error);
    
    return () => { if (recognition) recognition.stop(); };
  }, []); // Runs once

  const handleStartListening = () => {
    if (!recognition || isListeningRef.current) return;
    setHasChecked(false);
    setIsListening(true);
    recognition.start();
  };

  const handleStopListening = () => {
    if (!isListeningRef.current) return;
    setIsListening(false);
    recognition.stop();
  };

  const handleCheckGrammar = async () => {
    if (!description.trim()) return;
    
    setIsChecking(true);
    setOriginalDesc(description); 
    
    try {
      const prompt = `Correct any grammar and spelling mistakes in the following text. Only return the corrected text, nothing else. Do not add any preamble. Raw text: "${description}" Corrected text:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setDescription(response.text().trim());
      setHasChecked(true); 
    } catch (e) {
      console.error("Error calling Gemini AI: ", e);
      alert("Could not correct grammar.");
    }
    
    setIsChecking(false);
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please enter a title and description.");
      return;
    }
    
    setIsSaving(true);
    
    const noteData = {
      title: title,
      description: description,
      originalDescription: (hasChecked && originalDesc) ? originalDesc : description,
      createdAt: serverTimestamp() // Will set time on create, ignored on update
    };

    try {
      if (currentNoteId) {
        // This is an UPDATE (Edit)
        const noteRef = doc(db,"users", userId, "notes", currentNoteId);
        await updateDoc(noteRef, {
          title: noteData.title,
          description: noteData.description,
          originalDescription: noteData.originalDescription,
          updatedAt: serverTimestamp() // Add an 'updatedAt' field
        });
      } else {
        // This is a CREATE (New)
        await addDoc(collection(db,"users", userId, "notes"), noteData);
      }
      
      alert(`Note ${currentNoteId ? 'updated' : 'saved'} successfully!`);
      resetForm();
      if (onNoteSaved) onNoteSaved(); // Notify parent
      
    } catch (e) {
      console.error("Error saving document: ", e);
      alert("Failed to save note.");
    }
    
    setIsSaving(false);
  };

  const resetForm = () => {
    onCancelEdit(); // Tell parent to clear selection
  };

  const clearFormFields = () => {
    setTitle('');
    setDescription('');
    setOriginalDesc('');
    setHasChecked(false);
    setIsListening(false);
    if (isListeningRef.current) recognition.stop();
  };
  
  // This is the new "Cancel" button logic
  const handleCancel = (e) => {
    e.preventDefault(); // Stop form submission
    resetForm();
  }

  return (
    <div className="note-editor-container">
      <h3>{currentNoteId ? 'Edit Your Note' : 'Create a New Note'}</h3>
      <form onSubmit={(e) => e.preventDefault()}>
        <input 
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        {hasChecked && (
          <div className="original-preview-editor">
            <strong>Original:</strong>
            <p>{originalDesc}</p>
          </div>
        )}

        <textarea
          rows="8"
          placeholder="Start speaking or type your note..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (hasChecked) setHasChecked(false);
          }}
          className={hasChecked ? 'corrected-text' : ''}
        />

        <div className="editor-buttons">
          <button 
            onClick={handleStartListening} 
            disabled={isListening} 
            className="btn-start-listen"
          >
            {isListening ? "Listening..." : "Speak"}
          </button>
          <button 
            onClick={handleStopListening} 
            disabled={!isListening} 
            className="btn-stop-listen"
          >
            Stop
          </button>
          <button 
            onClick={handleCheckGrammar} 
            disabled={isChecking || !description.trim()} 
            className="btn-check-grammar"
          >
            {isChecking ? "Checking..." : "Check Grammar(AI)"}
          </button>
        </div>
        
        <div className="main-actions">
          <button 
            onClick={handleSaveNote} 
            disabled={isSaving || !title.trim() || !description.trim()}
            className="btn-save-note"
          >
            {isSaving ? "Saving..." : (currentNoteId ? "Update Note" : "Save Note")}
          </button>
          {/* Show cancel button only if editing */}
          {currentNoteId && (
            <button 
              onClick={handleCancel} 
              className="btn-cancel-edit"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default NoteEditor;