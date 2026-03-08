import React, { useState, useEffect } from 'react';
import songLibraryService from './services/SongLibraryService';
import SongForm from './components/SongForm';
import SongList from './components/SongList';
import EditSongModal from './components/EditSongModal';

function App() {
  const [songs, setSongs] = useState([]);
  const [editingSong, setEditingSong] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load songs on mount and subscribe to changes
  useEffect(() => {
    setSongs(songLibraryService.getAllSongs());
    
    const handleLibraryChange = (updatedSongs) => {
      setSongs([...updatedSongs]);
    };
    
    songLibraryService.addListener(handleLibraryChange);
    
    return () => {
      songLibraryService.removeListener(handleLibraryChange);
    };
  }, []);

  const handleAddSong = (songData) => {
    try {
      songLibraryService.addSong(songData.name, songData.band, songData.album);
      showSuccessMessage('Song added successfully!');
    } catch (error) {
      throw error;
    }
  };

  const handleEditSong = (songId, updates) => {
    try {
      songLibraryService.updateSong(songId, updates);
      setEditingSong(null);
      showSuccessMessage('Song updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteSong = (song) => {
    if (window.confirm(`Are you sure you want to delete "${song.name}"?`)) {
      try {
        songLibraryService.deleteSong(song.name);
        showSuccessMessage('Song deleted successfully!');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="app" data-testid="app">
      <header className="app-header">
        <h1>Monday Band</h1>
        <p>Welcome to Monday Band - Your music collaboration platform</p>
      </header>

      <main className="app-main">
        {successMessage && (
          <div className="success-message" data-testid="success-message">
            {successMessage}
          </div>
        )}

        <section className="add-song-section">
          <h2>Add New Song</h2>
          <SongForm onSubmit={handleAddSong} />
        </section>

        <section className="song-library-section">
          <SongList
            songs={songs}
            onEdit={setEditingSong}
            onDelete={handleDeleteSong}
          />
        </section>
      </main>

      {editingSong && (
        <EditSongModal
          song={editingSong}
          onSave={handleEditSong}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
}

export default App;
