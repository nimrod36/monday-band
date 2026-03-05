Feature: User will be able to manage a song library
  As a music enthusiast
  I want to manage my song library
  So that I can organize and track my music collection

  Background:
    Given the application is running
    And the song library is empty

  Scenario: Add a new song with all details
    When the user adds a song with the following details:
      | Song Name       | Album              | Band         |
      | Bohemian Rhapsody | A Night at the Opera | Queen       |
    Then the song "Bohemian Rhapsody" should be in the library
    And the song should have album "A Night at the Opera"
    And the song should have band "Queen"

  Scenario: Add a song without album information
    When the user adds a song with song name "Imagine" and band "John Lennon"
    Then the song "Imagine" should be in the library
    And the song should have band "John Lennon"
    And the song should have no album information

  Scenario: View all songs in the library
    Given the following songs exist in the library:
      | Song Name         | Album                | Band           |
      | Stairway to Heaven | Led Zeppelin IV      | Led Zeppelin   |
      | Hotel California   | Hotel California     | Eagles         |
      | Sweet Child O' Mine | Appetite for Destruction | Guns N' Roses |
    When the user views the song library
    Then the user should see 3 songs
    And each song should display its name, album, and band

  Scenario: Edit song details
    Given a song "Yesterday" by "The Beatles" exists in the library
    When the user edits the song to change the album to "Help!"
    Then the song "Yesterday" should have album "Help!"
    And the changes should be persisted

  Scenario: Delete a song from the library
    Given the following songs exist in the library:
      | Song Name    | Album        | Band        |
      | Fix You      | X&Y          | Coldplay    |
      | Yellow       | Parachutes   | Coldplay    |
    When the user deletes the song "Fix You"
    Then the song "Fix You" should not be in the library
    And the library should contain 1 song
    And the deletion should be persisted

  Scenario: Attempt to add a song without required fields
    When the user attempts to add a song without a song name
    Then the system should display an error message
    And the song should not be added to the library

  Scenario: Attempt to add a song without band information
    When the user attempts to add a song with song name "Test Song" but no band
    Then the system should display an error message
    And the song should not be added to the library

  Scenario: Data persistence across sessions
    Given the user has added a song "Wonderwall" by "Oasis"
    When the user closes and reopens the application
    Then the song "Wonderwall" should still be in the library
    And all song details should be preserved

  Scenario: Edit multiple fields of a song
    Given a song "Smells Like Teen Spirit" by "Nirvana" with album "Nevermind" exists
    When the user edits the song to change:
      | Field     | Value              |
      | Song Name | Smells Like Teen Spirit (Live) |
      | Album     | MTV Unplugged      |
    Then the song should be named "Smells Like Teen Spirit (Live)"
    And the song should have album "MTV Unplugged"
    And the band should remain "Nirvana"
