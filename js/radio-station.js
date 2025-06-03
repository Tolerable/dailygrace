// Radio Station Manager for DailyGrace.Online
class RadioStation {
  constructor() {
    this.playlists = {
      instrumental: [
        { title: 'Gentle Streams', file: 'GentleStreams.mp3', duration: 289 },
        { title: 'Heavenly Peace', file: 'HeavenlyPeace.mp3', duration: 239 },
        { title: 'Morning Light', file: 'MorningLight.mp3', duration: 240 },
        { title: 'Quiet Sanctuary', file: 'QuietSanctuary.mp3', duration: 202 },
        { title: 'Sacred Waters', file: 'SacredWaters.mp3', duration: 169 },
        { title: 'Peaceful Garden', file: 'PeacefulGarden.mp3', duration: 248 }
      ],
		vocals: [
		  { title: 'Rest in His Presence', file: 'RestinHisPresence.mp3', duration: 240 },
		  { title: 'Morning Mercies', file: 'MorningMercies.mp3', duration: 225 },
		  { title: 'Healing Waters', file: 'HealingWaters.mp3', duration: 255 },
		  { title: 'Abide in Me', file: 'AbideinMe.mp3', duration: 210 },
		  { title: 'Peace Be Still', file: 'PeaceBeStill.mp3', duration: 270 },
		  { title: 'Come Away With Me', file: 'ComeAwayWithMe.mp3', duration: 230 },
		  { title: 'Breathe on Me', file: 'BreatheonMe.mp3', duration: 215 },
		  { title: 'In the Quiet', file: 'IntheQuiet.mp3', duration: 250 },
		  { title: 'Everlasting Arms', file: 'EverlastingArms.mp3', duration: 235 },
		  { title: 'Light of My Path', file: 'LightOfMyPath.mp3', duration: 265 },
		  { title: 'Still Waters', file: 'StillWaters.mp3', duration: 220 },
		  { title: 'Anchor for My Soul', file: 'AnchorforMySoul.mp3', duration: 240 }
		],
      mixed: [] // Will be populated in constructor
    };

    // Combine instrumental and vocals for mixed playlist
    this.playlists.mixed = [...this.playlists.instrumental, ...this.playlists.vocals];

    // Commercial cuts
    this.cuts = {
      instrumental: [
        { title: 'Instrumental Station ID', file: 'Listening_instrumentals-0001.mp3', duration: 15 },
        { title: 'Instrumental Promo', file: 'Listening_instrumentals-0002.mp3', duration: 15 },
        { title: 'Instrumental Feature', file: 'Listening_instrumentals-0003.mp3', duration: 15 }
      ],
      vocals: [
        { title: 'Vocals Station ID', file: 'Listening_vocals-0001.mp3', duration: 15 },
        { title: 'Vocals Promo', file: 'Listening_vocals-0002.mp3', duration: 15 },
        { title: 'Vocals Feature', file: 'Listening_vocals-0003.mp3', duration: 15 }
      ],
      mixed: [
        { title: 'Mixed Station ID', file: 'Listening_mixed-0001.mp3', duration: 15 },
        { title: 'Mixed Promo', file: 'Listening_mixed-0002.mp3', duration: 15 },
        { title: 'Mixed Feature', file: 'Listening_mixed-0003.mp3', duration: 15 }
      ]
    };

    // Station state
    this.currentStation = 'mixed';
    this.currentPlaylist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.7;
    this.cutInterval = 3; // Play a cut every 3 songs
    this.songsSinceCut = 0;
    
    // Audio element
    this.audio = null;
    
    // UI update callbacks
    this.onTrackChange = null;
    this.onPlayStateChange = null;
    this.onProgressUpdate = null;
  }

  init(audioElement) {
    this.audio = audioElement;
    this.audio.volume = this.volume;
    
    // Set up event listeners
    this.audio.addEventListener('ended', () => this.playNext());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    
    // Load initial playlist
    this.setStation(this.currentStation);
  }

  setStation(station) {
    if (!this.playlists[station]) return;
    
    this.currentStation = station;
    this.currentPlaylist = this.shufflePlaylist([...this.playlists[station]]);
    this.currentIndex = 0;
    this.songsSinceCut = 0;
    
    // Update UI
    if (this.onTrackChange) {
      this.onTrackChange(this.getCurrentTrack(), this.getUpNext());
    }
  }

  shufflePlaylist(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  play() {
    if (this.currentPlaylist.length === 0) {
      this.setStation(this.currentStation);
    }
    
    this.playTrack(this.currentIndex);
  }

  playTrack(index) {
    if (index >= this.currentPlaylist.length) {
      // Reshuffle and start over
      this.currentPlaylist = this.shufflePlaylist([...this.playlists[this.currentStation]]);
      index = 0;
    }
    
    this.currentIndex = index;
    
    // Check if we should play a cut
    if (this.songsSinceCut >= this.cutInterval) {
      this.playCut();
      return;
    }
    
    const track = this.currentPlaylist[index];
    const audioPath = `/audio/${track.file}`;
    
    this.audio.src = audioPath;
    this.audio.play();
    this.isPlaying = true;
    this.songsSinceCut++;
    
    // Update UI
    if (this.onTrackChange) {
      this.onTrackChange(track, this.getUpNext());
    }
    if (this.onPlayStateChange) {
      this.onPlayStateChange(true);
    }
  }

  playCut() {
    this.songsSinceCut = 0;
    
    const cuts = this.cuts[this.currentStation];
    const randomCut = cuts[Math.floor(Math.random() * cuts.length)];
    
    this.audio.src = `/audio/cuts/${randomCut.file}`;
    this.audio.play();
    
    // Update UI for cut
    if (this.onTrackChange) {
      this.onTrackChange(
        { title: '📢 ' + randomCut.title, file: randomCut.file, isCut: true },
        this.currentPlaylist[this.currentIndex]
      );
    }
    
    // FIXED: Use a one-time event listener instead of overwriting onended
    this.audio.addEventListener('ended', () => {
      this.playTrack(this.currentIndex);
    }, { once: true });
  }

  playNext() {
    this.playTrack(this.currentIndex + 1);
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  skip() {
    this.playNext();
  }

  setVolume(value) {
    this.volume = value / 100;
    this.audio.volume = this.volume;
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
    return this.audio.muted;
  }

  getCurrentTrack() {
    return this.currentPlaylist[this.currentIndex] || { title: 'Loading...', file: '' };
  }

  getUpNext() {
    const nextIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
    return this.currentPlaylist[nextIndex] || { title: '...', file: '' };
  }

  updateProgress() {
    if (this.onProgressUpdate && this.audio.duration) {
      const progress = (this.audio.currentTime / this.audio.duration) * 100;
      this.onProgressUpdate(progress, this.audio.currentTime, this.audio.duration);
    }
  }

  updateDuration() {
    if (this.onProgressUpdate) {
      this.onProgressUpdate(0, 0, this.audio.duration);
    }
  }

  // UI Callback setters
  setOnTrackChange(callback) {
    this.onTrackChange = callback;
  }

  setOnPlayStateChange(callback) {
    this.onPlayStateChange = callback;
  }

  setOnProgressUpdate(callback) {
    this.onProgressUpdate = callback;
  }
}

// Export for use in main app
window.RadioStation = RadioStation;