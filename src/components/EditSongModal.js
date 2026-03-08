import React, { useState } from 'react';
import SongForm from './SongForm';

/**
 * EditSongModal Component
 * Modal for editing song details
 */
function EditSongModal({ song, onSave, onClose }) {
  const handleSubmit = (updates) => {
    onSave(song.id, updates);
  };

  return (
    <div className="modal-overlay" data-testid="edit-modal">
      <div className="modal-content">
        <h2>Edit Song</h2>
        <SongForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialSong={song}
          isEditing={true}
        />
      </div>
    </div>
  );
}

export default EditSongModal;
