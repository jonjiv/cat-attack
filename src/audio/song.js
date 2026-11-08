// The background tune: an original, bouncy 4-bar loop. Notes are MIDI numbers (60 = middle C);
// null is a rest. melody plays eighth notes; bass plays quarter notes.
export const SONG = {
  bpm: 132,
  melody: [
    // bar 1
    64, 67, 69, 67, 64, 62, 60, 62,
    // bar 2
    64, 64, 67, 64, 62, 60, 62, null,
    // bar 3
    69, 72, 69, 67, 64, 67, 69, 67,
    // bar 4
    64, 62, 60, 62, 64, null, 60, null,
    // bar 5 (second time round, a little higher)
    67, 69, 72, 69, 67, 64, 62, 64,
    // bar 6
    67, 67, 69, 67, 64, 62, 64, null,
    // bar 7
    72, 74, 72, 69, 67, 69, 72, 69,
    // bar 8
    67, 64, 62, 64, 60, null, null, null,
  ],
  bass: [
    48, 43, 48, 43,
    41, 48, 43, 48,
    45, 52, 41, 48,
    43, 50, 48, 43,
    48, 43, 48, 43,
    41, 48, 43, 48,
    45, 52, 41, 48,
    43, 50, 48, null,
  ],
};
