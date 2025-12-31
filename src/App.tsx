import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Note } from './types/Note';
import { loadNotes, shuffleNotes } from './services/noteService';
import { NoteCard } from './components/NoteCard';
import './App.css';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load and shuffle notes on mount
    const allNotes = loadNotes();
    setNotes(shuffleNotes(allNotes));
    setIsLoading(false);
  }, []);

  const handleSwipeUp = () => {
    // Skip - advance to next note
    if (currentIndex < notes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reshuffle and start over
      setNotes(shuffleNotes(notes));
      setCurrentIndex(0);
    }
  };

  const handleSwipeDown = () => {
    // For MVP, same as swipe up (no favorite/write functionality)
    handleSwipeUp();
  };

  const currentNote = notes[currentIndex];

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="spinner" />
        <p>Loading your insights...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="app empty">
        <h2>No Notes Found</h2>
        <p>The repository appears to be empty or notes haven't been fetched yet.</p>
        <p className="hint">Deploy via GitHub Actions to fetch notes from your repository.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>IdeaSpark</h1>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          {currentNote && (
            <NoteCard
              key={currentNote.id}
              note={currentNote}
              currentIndex={currentIndex}
              totalCount={notes.length}
              onSwipeUp={handleSwipeUp}
              onSwipeDown={handleSwipeDown}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <p>Swipe up to skip</p>
        <button onClick={handleSwipeUp} className="skip-button">
          Skip
        </button>
      </footer>
    </div>
  );
}

export default App;
