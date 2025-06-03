// Radio Station Manager for DailyGrace.Online - ENHANCED VERSION
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
        // Added image property to vocal tracks
        { title: 'Rest in His Presence', file: 'RestinHisPresence.mp3', duration: 147, image: '/img/RestinHisPresence.jpg' },
        { title: 'Morning Mercies', file: 'MorningMercies.mp3', duration: 190, image: '/img/MorningMercies.jpg' },
        { title: 'Healing Waters', file: 'HealingWaters.mp3', duration: 236, image: '/img/HealingWaters.jpg' },
        { title: 'Abide in Me', file: 'AbideinMe.mp3', duration: 207, image: '/img/AbideinMe.jpg' },
        { title: 'Peace Be Still', file: 'PeaceBeStill.mp3', duration: 240, image: '/img/PeaceBeStill.jpg' },
        { title: 'Come Away With Me', file: 'ComeAwayWithMe.mp3', duration: 185, image: '/img/ComeAwayWithMe.jpg' },
        { title: 'Breathe on Me', file: 'BreatheonMe.mp3', duration: 190, image: '/img/BreatheonMe.jpg' },
        { title: 'In the Quiet', file: 'IntheQuiet.mp3', duration: 190, image: '/img/IntheQuiet.jpg' },
        { title: 'Everlasting Arms', file: 'EverlastingArms.mp3', duration: 197, image: '/img/EverlastingArms.jpg' },
        { title: 'Light of My Path', file: 'LightofMyPath.mp3', duration: 190, image: '/img/LightofMyPath.jpg' },
        { title: 'Still Waters', file: 'StillWaters.mp3', duration: 195, image: '/img/StillWaters.jpg' },
        { title: 'Anchor for My Soul', file: 'AnchorforMySoul.mp3', duration: 190, image: '/img/AnchorforMySoul.jpg' },
        { title: 'Upon the Mountain', file: 'UpontheMountain.mp3', duration: 193, image: '/img/UpontheMountain.jpg' },
        { title: 'Breath of Heaven', file: 'BreathofHeaven.mp3', duration: 193, image: '/img/BreathofHeaven.jpg' },
        { title: 'New Every Morning', file: 'NewEveryMorning.mp3', duration: 240, image: '/img/NewEveryMorning.jpg' },
        { title: 'Shelter in the Storm', file: 'ShelterintheStorm.mp3', duration: 199, image: '/img/ShelterintheStorm.jpg' },
        { title: 'Draw Me Near', file: 'DrawMeNear.mp3', duration: 191, image: '/img/DrawMeNear.jpg' },
        { title: 'Shining in the Darkness', file: 'ShiningintheDarkness.mp3', duration: 203, image: '/img/ShiningintheDarkness.jpg' }		
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
    
    // Set up event listeners with error handling
    this.audio.addEventListener('ended', () => this.playNext());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audio.addEventListener('error', (e) => {
      console.warn('Audio error, skipping track:', e);
      this.playNext(); // Auto-skip on error
    });
    
    // Load initial playlist
    this.setStation(this.currentStation);
  }

  setStation(station) {
   if (!this.playlists[station]) return;
   
   this.currentStation = station;
   this.currentPlaylist = this.shufflePlaylist([...this.playlists[station]]);
   this.currentIndex = 0;
   this.songsSinceCut = 0;
   
   // Get the current track FIRST before calling callbacks
   const currentTrack = this.getCurrentTrack();
   
   // Update UI
   if (this.onTrackChange) {
     this.onTrackChange(currentTrack, this.getUpNext());
   }
   
   // Update album artwork AFTER getting the track
   this.updateAlbumArt(currentTrack);
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

  setupProgressClick() {
    const progressContainer = document.querySelector('.radio-progress .progress-container');
    if (progressContainer) {
      progressContainer.onclick = (e) => {
        if (this.audio.duration) {
          const rect = progressContainer.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = clickX / rect.width;
          this.audio.currentTime = percentage * this.audio.duration;
        }
      };
    }
  }

  playTrack(index) {
    // Handle playlist wraparound
    if (index >= this.currentPlaylist.length) {
      this.currentPlaylist = this.shufflePlaylist([...this.playlists[this.currentStation]]);
      index = 0;
      this.songsSinceCut = 0; // Reset counter on playlist restart
    }
    
    this.currentIndex = index;
    
    // Only check for cuts on natural progression (not skips)
    if (this.songsSinceCut >= this.cutInterval && !this.audio.src.includes('/cuts/')) {
      this.playCut();
      return;
    }
    
    const track = this.currentPlaylist[index];
    if (!track) {
      console.error('No track at index:', index);
      return;
    }
    
    const audioPath = `/audio/${track.file}`;
    
    this.audio.src = audioPath;
    
    // Try to play with error handling
    this.audio.play().catch(error => {
      console.warn('Failed to play track, skipping:', error);
      this.playNext();
      return;
    });
    
    this.isPlaying = true;
    
    // Only increment counter for actual songs, not cuts
    if (!this.audio.src.includes('/cuts/')) {
      this.songsSinceCut++;
    }
    
    if (this.onTrackChange) {
      this.onTrackChange(track, this.getUpNext());
    }
    if (this.onPlayStateChange) {
      this.onPlayStateChange(true);
    }
    
    // Update album artwork for the current track
    this.updateAlbumArt(track);
  }

  updateAlbumArt(track) {
    // Find the entire now-playing section and REPLACE its content
    const nowPlaying = document.querySelector('.now-playing');
    if (!nowPlaying || !track) return;
    
    if (track.image) {
      // COMPLETELY REPLACE the now-playing content with just image + title
      nowPlaying.innerHTML = `
        <img src="${track.image}" alt="${track.title}" 
             style="width: 280px; height: 180px; border-radius: 12px; object-fit: cover; 
                    display: block; margin: 0 auto 0.75rem auto; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <div class="now-playing-title" style="font-weight: 600; color: var(--deep-navy); font-size: 1.1rem; margin: 0; text-align: center;">
          ${track.title}
        </div>
      `;
    } else if (track.isCut) {
      nowPlaying.innerHTML = `
        <div style="width: 120px; height: 90px; border-radius: 8px; background: var(--gold-accent); 
                    display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem auto;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          <span style="font-size: 2rem;">📢</span>
        </div>
        <div class="now-playing-title" style="font-weight: 600; color: var(--deep-navy); font-size: 1.1rem; margin: 0; text-align: center;">
          ${track.title}
        </div>
      `;
    } else {
      // For instrumentals
      nowPlaying.innerHTML = `
        <div style="width: 120px; height: 90px; border-radius: 8px; background: var(--soft-blue); 
                    display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem auto;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          <span style="font-size: 2rem;">🎵</span>
        </div>
        <div class="now-playing-title" style="font-weight: 600; color: var(--deep-navy); font-size: 1.1rem; margin: 0; text-align: center;">
          ${track.title}
        </div>
      `;
    }
  }

  playCut() {
    this.songsSinceCut = 0;
    
    const cuts = this.cuts[this.currentStation];
    const randomCut = cuts[Math.floor(Math.random() * cuts.length)];
    
    this.audio.src = `/audio/cuts/${randomCut.file}`;
    this.audio.play().catch(error => {
      console.warn('Failed to play cut, continuing with music:', error);
      this.playTrack(this.currentIndex);
      return;
    });
    
    // Update UI for cut
    if (this.onTrackChange) {
      this.onTrackChange(
        { title: '📢 ' + randomCut.title, file: randomCut.file, isCut: true },
        this.currentPlaylist[this.currentIndex]
      );
    }
    
    // Update artwork for cut
    this.updateAlbumArt({ title: randomCut.title, isCut: true });
  }

  playNext() {
    // Check if we just played a cut
    const currentTrack = this.audio.src;
    if (currentTrack.includes('/cuts/')) {
      // After a cut, play the actual song (don't increment counter)
      this.playTrack(this.currentIndex);
    } else {
      // Normal song progression
      this.playTrack(this.currentIndex + 1);
    }
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
    // Reset cut counter when manually skipping to avoid unwanted cuts
    this.songsSinceCut = 0;
    this.playTrack(this.currentIndex + 1);
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