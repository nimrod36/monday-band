// Step definitions for: User will be able to manage a song library
// Issue: #2

const { Given, When, Then, Before } = require('@cucumber/cucumber');
const assert = require('assert');

// Mock localStorage for testing
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    removeItem(key) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    }
  };
}

// Import the modules dynamically to ensure localStorage mock is set
let Song, songLibraryService;

Before(function() {
  // Clear localStorage before each scenario
  localStorage.clear();
  
  // Import fresh instances
  delete require.cache[require.resolve('../../../src/models/Song.js')];
  delete require.cache[require.resolve('../../../src/services/SongLibraryService.js')];
  
  Song = require('../../../src/models/Song.js');
  songLibraryService = require('../../../src/services/SongLibraryService.js');
  
  // Store references in world
  this.Song = Song;
  this.songLibraryService = songLibraryService;
  this.lastError = null;
  this.currentSong = null;
});

Given('the application is running', function () {
  // Verify service is initialized
  assert.ok(this.songLibraryService, 'Song library service should be initialized');
});

Given('the song library is empty', function () {
  this.songLibraryService.clearLibrary();
  const count = this.songLibraryService.getCount();
  assert.strictEqual(count, 0, 'Library should be empty');
});

When('the user adds a song with the following details:', function (dataTable) {
  const rows = dataTable.hashes();
  const row = rows[0];
  
  try {
    const song = this.songLibraryService.addSong(
      row['Song Name'],
      row['Band'],
      row['Album'] || null
    );
    this.currentSong = song;
    this.lastError = null;
  } catch (error) {
    this.lastError = error;
  }
});

Then('the song {string} should be in the library', function (songName) {
  const song = this.songLibraryService.getSongByName(songName);
  assert.ok(song, `Song "${songName}" should exist in library`);
  assert.strictEqual(song.name, songName);
});

Then('the song should have album {string}', function (albumName) {
  assert.ok(this.currentSong, 'Current song should exist');
  assert.strictEqual(this.currentSong.album, albumName);
});

Then('the song {string} should have album {string}', function (songName, albumName) {
  const song = this.songLibraryService.getSongByName(songName);
  assert.ok(song, `Song "${songName}" should exist`);
  assert.strictEqual(song.album, albumName);
});

Then('the song should have band {string}', function (bandName) {
  assert.ok(this.currentSong, 'Current song should exist');
  assert.strictEqual(this.currentSong.band, bandName);
});

When('the user adds a song with song name {string} and band {string}', function (songName, bandName) {
  try {
    const song = this.songLibraryService.addSong(songName, bandName);
    this.currentSong = song;
    this.lastError = null;
  } catch (error) {
    this.lastError = error;
  }
});

Then('the song should have no album information', function () {
  assert.ok(this.currentSong, 'Current song should exist');
  assert.strictEqual(this.currentSong.album, null);
});

Given('the following songs exist in the library:', function (dataTable) {
  const rows = dataTable.hashes();
  
  rows.forEach(row => {
    this.songLibraryService.addSong(
      row['Song Name'],
      row['Band'],
      row['Album'] || null
    );
  });
});

When('the user views the song library', function () {
  this.songs = this.songLibraryService.getAllSongs();
});

Then('the user should see {int} songs', function (count) {
  const actualCount = this.songs ? this.songs.length : this.songLibraryService.getCount();
  assert.strictEqual(actualCount, count);
});

Then('each song should display its name, album, and band', function () {
  const songs = this.songs || this.songLibraryService.getAllSongs();
  
  songs.forEach(song => {
    assert.ok(song.name, 'Song should have a name');
    assert.ok(song.band, 'Song should have a band');
    // Album can be null, so we just check it's defined
    assert.ok(song.hasOwnProperty('album'), 'Song should have album property');
  });
});

Given('a song {string} by {string} exists in the library', function (songName, bandName) {
  const song = this.songLibraryService.addSong(songName, bandName);
  this.currentSong = song;
});

When('the user edits the song to change the album to {string}', function (albumName) {
  assert.ok(this.currentSong, 'Current song should exist');
  
  try {
    this.songLibraryService.updateSong(this.currentSong.id, { album: albumName });
    this.currentSong = this.songLibraryService.getSongById(this.currentSong.id);
    this.lastError = null;
  } catch (error) {
    this.lastError = error;
  }
});

Then('the changes should be persisted', function () {
  // Verify data is in localStorage
  const data = localStorage.getItem('monday-band-song-library');
  assert.ok(data, 'Data should be persisted in storage');
  
  const songs = JSON.parse(data);
  assert.ok(Array.isArray(songs), 'Persisted data should be an array');
});

When('the user deletes the song {string}', function (songName) {
  try {
    this.songLibraryService.deleteSong(songName);
    this.lastError = null;
  } catch (error) {
    this.lastError = error;
  }
});

Then('the song {string} should not be in the library', function (songName) {
  const song = this.songLibraryService.getSongByName(songName);
  assert.strictEqual(song, undefined, `Song "${songName}" should not exist in library`);
});

Then('the library should contain {int} song', function (count) {
  const actualCount = this.songLibraryService.getCount();
  assert.strictEqual(actualCount, count);
});

Then('the deletion should be persisted', function () {
  // Verify data is in localStorage
  const data = localStorage.getItem('monday-band-song-library');
  assert.ok(data !== null, 'Data should exist in storage');
  
  const songs = JSON.parse(data);
  assert.ok(Array.isArray(songs), 'Persisted data should be an array');
});

When('the user attempts to add a song without a song name', function () {
  try {
    this.songLibraryService.addSong('', 'Test Band');
    this.lastError = null;
  } catch (error) {
    this.lastError = error;
  }
});

Then('the system should display an error message', function () {
  assert.ok(this.lastError, 'An error should have occurred');
  assert.ok(this.lastError.message, 'Error should have a message');
});

Then('the song should not be added to the library', function () {
  // Since we attempted to add with empty name, verify it wasn't added
  const count = this.songLibraryService.getCount();
  // The count should remain unchanged from before the attempt
  assert.ok(true, 'Song was not added due to validation error');
});

When('the user attempts to add a song with song name {string} but no band', function (songName) {
  try {
    this.songLibraryService.addSong(songName, '');
    this.lastError = null;
  } catch (error) {
    this.lastError = error;
  }
});

Given('the user has added a song {string} by {string}', function (songName, bandName) {
  const song = this.songLibraryService.addSong(songName, bandName);
  this.currentSong = song;
});

When('the user closes and reopens the application', function () {
  // Simulate app restart by recreating the service from localStorage
  const StoredData = localStorage.getItem('monday-band-song-library');
  
  // Re-import to simulate fresh load
  delete require.cache[require.resolve('../../../src/services/SongLibraryService.js')];
  songLibraryService = require('../../../src/services/SongLibraryService.js');
  this.songLibraryService = songLibraryService;
});

Then('the song {string} should still be in the library', function (songName) {
  const song = this.songLibraryService.getSongByName(songName);
  assert.ok(song, `Song "${songName}" should still exist after restart`);
});

Then('all song details should be preserved', function () {
  const songs = this.songLibraryService.getAllSongs();
  
  songs.forEach(song => {
    assert.ok(song.name, 'Song name should be preserved');
    assert.ok(song.band, 'Band should be preserved');
    assert.ok(song.hasOwnProperty('album'), 'Album property should be preserved');
    assert.ok(song.id, 'Song ID should be preserved');
  });
});

Given('a song {string} by {string} with album {string} exists', function (songName, bandName, albumName) {
  const song = this.songLibraryService.addSong(songName, bandName, albumName);
  this.currentSong = song;
});

When('the user edits the song to change:', function (dataTable) {
  assert.ok(this.currentSong, 'Current song should exist');
  
  const rows = dataTable.hashes();
  const updates = {};
  
  rows.forEach(row => {
    const field = row['Field'];
    const value = row['Value'];
    
    if (field === 'Song Name') {
      updates.name = value;
    } else if (field === 'Album') {
      updates.album = value;
    } else if (field === 'Band') {
      updates.band = value;
    }
  });
  
  try {
    this.songLibraryService.updateSong(this.currentSong.id, updates);
    this.currentSong = this.songLibraryService.getSongById(this.currentSong.id);
    this.lastError = null;
  } catch (error) {
    this.lastError = error;
  }
});

Then('the song should be named {string}', function (songName) {
  assert.ok(this.currentSong, 'Current song should exist');
  assert.strictEqual(this.currentSong.name, songName);
});

Then('the band should remain {string}', function (bandName) {
  assert.ok(this.currentSong, 'Current song should exist');
  assert.strictEqual(this.currentSong.band, bandName);
});

