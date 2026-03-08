import React, { useState } from 'react';

/**
 * SongForm Component
 * Form for adding or editing songs
 */
function SongForm({ onSubmit, onCancel, initialSong = null, isEditing = false }) {
  const [songName, setSongName] = useState(initialSong?.name || '');
  const [band, setBand] = useState(initialSong?.band || '');
  const [album, setAlbum] = useState(initialSong?.album || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!songName.trim()) {
      setError('Song name is required');
      return;
    }

    if (!band.trim()) {
      setError('Band is required');
      return;
    }

    try {
      onSubmit({
        name: songName.trim(),
        band: band.trim(),
        album: album.trim() || null
      });
      
      // Clear form if adding new song
      if (!isEditing) {
        setSongName('');
        setBand('');
        setAlbum('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="song-form" data-testid="song-form">
      {error && (
        <div className="error-message" data-testid="error-message">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="songName">Song Name *</label>
        <input
          type="text"
          id="songName"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          placeholder="Enter song name"
          data-testid="song-name-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="band">Band *</label>
        <input
          type="text"
          id="band"
          value={band}
          onChange={(e) => setBand(e.target.value)}
          placeholder="Enter band name"
          data-testid="band-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="album">Album (Optional)</label>
        <input
          type="text"
          id="album"
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
          placeholder="Enter album name"
          data-testid="album-input"
        />
      </div>

      <div className="form-actions">
        <button type="submit" data-testid="submit-button">
          {isEditing ? 'Update Song' : 'Add Song'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} data-testid="cancel-button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SongForm;
