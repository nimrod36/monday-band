import React from 'react';

/**
 * SongList Component
 * Displays list of songs with edit/delete actions
 */
function SongList({ songs, onEdit, onDelete }) {
  if (songs.length === 0) {
    return (
      <div className="empty-library" data-testid="empty-library">
        <p>Your song library is empty. Add your first song!</p>
      </div>
    );
  }

  return (
    <div className="song-list" data-testid="song-list">
      <h2>Song Library ({songs.length} {songs.length === 1 ? 'song' : 'songs'})</h2>
      <div className="songs-grid">
        {songs.map((song) => (
          <div key={song.id} className="song-card" data-testid="song-card">
            <div className="song-info">
              <h3 className="song-name" data-testid="song-name">{song.name}</h3>
              <p className="song-band" data-testid="song-band">
                <strong>Band:</strong> {song.band}
              </p>
              {song.album && (
                <p className="song-album" data-testid="song-album">
                  <strong>Album:</strong> {song.album}
                </p>
              )}
              {!song.album && (
                <p className="song-no-album" data-testid="song-no-album">
                  <em>No album information</em>
                </p>
              )}
            </div>
            <div className="song-actions">
              <button
                onClick={() => onEdit(song)}
                className="btn-edit"
                data-testid={`edit-button-${song.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(song)}
                className="btn-delete"
                data-testid={`delete-button-${song.name}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongList;
