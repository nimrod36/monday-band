/**
 * Song model class
 * Represents a song with name, album (optional), and band
 */
class Song {
  constructor(name, band, album = null) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Song name is required');
    }
    if (!band || typeof band !== 'string' || band.trim() === '') {
      throw new Error('Band is required');
    }

    this.id = this.generateId();
    this.name = name.trim();
    this.band = band.trim();
    this.album = album ? album.trim() : null;
    this.createdAt = new Date().toISOString();
  }

  generateId() {
    return `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      band: this.band,
      album: this.album,
      createdAt: this.createdAt
    };
  }

  static fromJSON(json) {
    const song = new Song(json.name, json.band, json.album);
    song.id = json.id;
    song.createdAt = json.createdAt;
    return song;
  }
}

// Support both ES6 and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Song;
  module.exports.default = Song;
}

export default Song;
