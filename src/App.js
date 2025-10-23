import React, { useState, useEffect } from 'react';
// Import auth, db, and new firestore functions
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { GoogleGenerativeAI } from "@google/generative-ai";

// Import CSS and Components
import './App.css'; 
import NoteList from './components/NoteList';
import NoteViewModal from './components/NoteViewModal';
import EditorModal from './components/EditorModal';
import LoginPage from './components/LoginPage';

// --- 1. CONFIGURE YOUR API KEYS ---
// Get Gemini key from: https://aistudio.google.com/app/apikey
// Get Transcript key from: https://supadata.ai/youtube-transcript-api
const GEMINI_API_KEY = "AIzaSyDOcoaX3sHPC6odYdw03n19S_ktLqceDDE";
const TRANSCRIPT_API_KEY = "sd_4771a964b94d7e5f8dbe50b7a9c2235a";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });


function App() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false); // <-- NEW STATE
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [viewingNoteId, setViewingNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Effect for auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Modal Handlers ---
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
  
  // --- Logout Handler ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // --- 2. NEW YOUTUBE IMPORT HANDLER ---
  const handleYouTubeImport = async () => {
    const videoUrl = prompt(
      "Please paste the full YouTube video URL:",
      "https://www.youtube.com/watch?v=..."
    );

    if (!videoUrl || !user) return; // User cancelled or is not logged in

    // Extract Video ID from URL
    let videoId;
    try {
      const url = new URL(videoUrl);
      if (url.hostname === "youtu.be") {
        videoId = url.pathname.substring(1);
      } else {
        videoId = url.searchParams.get("v");
      }
      if (!videoId) throw new Error("Invalid URL");
    } catch (e) {
      alert("Invalid YouTube URL. Please use a full 'youtube.com' or 'youtu.be' link.");
      return;
    }

    setIsImporting(true);

    try {
      // STAGE 1: Get Transcript
      const transcriptResponse = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
        {
          headers: {
            'x-api-key': TRANSCRIPT_API_KEY,
          },
        }
      );

      if (!transcriptResponse.ok) {
        throw new Error("Failed to fetch transcript. The video might be private or have transcripts disabled.");
      }

      const transcriptData = await transcriptResponse.json();
      const transcript = transcriptData.content.map(t => t.text).join(' ');

      if (!transcript) {
        throw new Error("Transcript is empty.");
      }

      // STAGE 2: Get Notes from Gemini
      // --- STAGE 2: Get Notes from Gemini ---
      const prompt = `
        You are a note-taking assistant, like a student taking notes in a lecture. I will provide a video transcript.
        Your job is to:
        1. Create a new, concise, and catchy title for the notes.
        2. Convert the transcript into clear, detailed, and well-structured **running notes**.
        
        IMPORTANT:
        - **Do NOT write a summary.** Write notes that capture the key points, definitions, and examples **in the order they appear**.
        - Use **bullet points, sub-bullet points, and short paragraphs** to organize the information logically.
        - The goal is to create notes someone would write while actively watching the video.
        
        Return ONLY a valid JSON object in this format: {"title": "Your New Title", "notes": "Your detailed running notes here..."}
        
        Transcript: "${transcript.substring(0, 8000)}" 
      `;

      const result = await geminiModel.generateContent(prompt);
      const responseText = result.response.text().trim();

      // --- NEW ROBUST JSON PARSING ---
      let jsonString;
      try {
        // Find the first '{' and the last '}'
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("AI response did not contain a valid JSON object.");
        }

        // Extract the JSON string
        jsonString = responseText.substring(jsonStart, jsonEnd + 1);
        
      } catch (e) {
        console.error("Failed to find JSON in AI response:", responseText);
        throw new Error("Could not parse AI response.");
      }
      
      // Now, parse the extracted string
      const aiResponse = JSON.parse(jsonString);
      // --- END NEW PARSING ---

      if (!aiResponse.title || !aiResponse.notes) {
        throw new Error("AI response was missing title or notes.");
      }

      // STAGE 3: Save to Firestore
      const noteData = {
        title: aiResponse.title,
        description: aiResponse.notes,
        originalDescription: `Imported from YouTube: ${videoUrl}`,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "users", user.uid, "notes"), 
        noteData
      );

      // STAGE 4: Open the new note
      setIsImporting(false);
      setEditingNoteId(docRef.id); // Open the editor with the new note!

    } catch (error) {
      setIsImporting(false);
      console.error("Error importing:", error);
      alert(`Failed to import: ${error.message}`);
    }
  };


  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      {/* --- 3. NEW LOADING OVERLAY --- */}
      {isImporting && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Importing notes... This may take a minute.</p>
        </div>
      )}

      <div className="app-container">
        
        <div className="sidebar">
        <h2>Notpad</h2>
        <p>Ai powered*</p>
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
            {/* --- 4. NEW BUTTONS WRAPPER --- */}
            <div className="home-header-buttons">
              <button className="btn-youtube-import" onClick={handleYouTubeImport}>
                Import from YouTube
              </button>
              <button className="btn-create-note" onClick={handleCreateNote}>
                + Create Note
              </button>
            </div>
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
            userId={user.uid}
            onEditNote={handleEditNote} 
            onViewNote={handleViewNote}
            searchQuery={searchQuery}
          />
        </div>

        {/* --- Modals --- */}
        {viewingNoteId && (
          <NoteViewModal 
            userId={user.uid}
            noteId={viewingNoteId}
            onClose={handleCloseView}
            onEdit={handleSwitchToEdit}
          />
        )}
        
        {editingNoteId && (
          <EditorModal
            userId={user.uid}
            noteId={editingNoteId}
            onClose={handleCloseEditor}
          />
        )}
      </div>
    </>
  );
}

export default App;