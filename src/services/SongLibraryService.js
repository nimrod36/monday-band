import Song from '../models/Song';

/**
 * SongLibraryService
 * Manages the song library with localStorage persistence
 */
class SongLibraryService {
  constructor() {
    this.STORAGE_KEY = 'monday-band-song-library';
    this.songs = this.loadFromStorage();
    this.listeners = [];
  }

  /**
   * Load songs from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map(songData => Song.fromJSON(songData));
      }
    } catch (error) {
      console.error('Error loading songs from storage:', error);
    }
    return [];
  }

  /**
   * Save songs to localStorage
   */
  saveToStorage() {
    try {
      const data = JSON.stringify(this.songs.map(song => song.toJSON()));
      localStorage.setItem(this.STORAGE_KEY, data);
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving songs to storage:', error);
      throw new Error('Failed to persist songs');
    }
  }

  /**
   * Add a listener for library changes
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.songs));
  }

  /**
   * Add a new song to the library
   */
  addSong(name, band, album = null) {
    try {
      const song = new Song(name, band, album);
      this.songs.push(song);
      this.saveToStorage();
      return song;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all songs in the library
   */
  getAllSongs() {
    return [...this.songs];
  }

  /**
   * Get a song by name
   */
  getSongByName(name) {
    return this.songs.find(song => song.name === name);
  }

  /**
   * Get a song by ID
   */
  getSongById(id) {
    return this.songs.find(song => song.id === id);
  }

  /**
   * Update a song
   */
  updateSong(songId, updates) {
    const songIndex = this.songs.findIndex(song => song.id === songId);
    if (songIndex === -1) {
      throw new Error('Song not found');
    }

    const song = this.songs[songIndex];
    
    // Validate updates
    if (updates.name !== undefined) {
      if (!updates.name || typeof updates.name !== 'string' || updates.name.trim() === '') {
        throw new Error('Song name cannot be empty');
      }
      song.name = updates.name.trim();
    }
    
    if (updates.band !== undefined) {
      if (!updates.band || typeof updates.band !== 'string' || updates.band.trim() === '') {
        throw new Error('Band cannot be empty');
      }
      song.band = updates.band.trim();
    }
    
    if (updates.album !== undefined) {
      song.album = updates.album ? updates.album.trim() : null;
    }

    this.saveToStorage();
    return song;
  }

  /**
   * Delete a song by name
   */
  deleteSong(songName) {
    const initialLength = this.songs.length;
    this.songs = this.songs.filter(song => song.name !== songName);
    
    if (this.songs.length === initialLength) {
      throw new Error('Song not found');
    }
    
    this.saveToStorage();
  }

  /**
   * Delete a song by ID
   */
  deleteSongById(id) {
    const initialLength = this.songs.length;
    this.songs = this.songs.filter(song => song.id !== id);
    
    if (this.songs.length === initialLength) {
      throw new Error('Song not found');
    }
    
    this.saveToStorage();
  }

  /**
   * Clear all songs from the library
   */
  clearLibrary() {
    this.songs = [];
    this.saveToStorage();
  }

  /**
   * Get the count of songs in the library
   */
  getCount() {
    return this.songs.length;
  }
}

// Singleton instance
const songLibraryService = new SongLibraryService();

// Support both ES6 and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = songLibraryService;
  module.exports.default = songLibraryService;
}

export default songLibraryService;
