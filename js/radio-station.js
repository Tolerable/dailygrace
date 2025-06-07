// Radio Station Manager for DailyGrace.Online - ENHANCED VERSION
class RadioStation {
  constructor() {
    this.playlists = {
		instrumental: [
		  { title: 'Gentle Streams', file: 'GentleStreams.mp3', duration: 289, image: '/img/GentleStreams.jpg' },
		  { title: 'Heavenly Peace', file: 'HeavenlyPeace.mp3', duration: 239, image: '/img/HeavenlyPeace.jpg' },
		  { title: 'Morning Light', file: 'MorningLight.mp3', duration: 240, image: '/img/MorningLight.jpg' },
		  { title: 'Quiet Sanctuary', file: 'QuietSanctuary.mp3', duration: 202, image: '/img/QuietSanctuary.jpg' },
		  { title: 'Sacred Waters', file: 'SacredWaters.mp3', duration: 169, image: '/img/SacredWaters.jpg' },
		  { title: 'Peaceful Garden', file: 'PeacefulGarden.mp3', duration: 248, image: '/img/PeacefulGarden.jpg' }
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
    
    // Stop current playback if playing
    const wasPlaying = this.isPlaying;
    if (this.isPlaying && this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
    
    this.currentStation = station;
    this.currentPlaylist = this.shufflePlaylist([...this.playlists[station]]);
    this.currentIndex = 0;
    this.songsSinceCut = 0;
    
    // Ensure we have a valid playlist before getting tracks
    if (this.currentPlaylist.length === 0) return;
    
    // Get the current track AFTER playlist is set
    const currentTrack = this.getCurrentTrack();
    const upNext = this.getUpNext();
    
    // Update UI
    if (this.onTrackChange && currentTrack) {
      this.onTrackChange(currentTrack, upNext);
    }
    
    // Update album artwork
    this.updateAlbumArt(currentTrack);
    
    // If it was playing, start playing the new station
    if (wasPlaying) {
      this.play();
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
	  const nowPlaying = document.querySelector('.now-playing');
	  if (!nowPlaying || !track) return;
	  
	  // Remove any existing image/icon
	  const existingImg = nowPlaying.querySelector('img');
	  const existingIcon = nowPlaying.querySelector('div[style*="width:"]');
	  if (existingImg) existingImg.remove();
	  if (existingIcon) existingIcon.remove();
	  
	  // Find where to insert (after the label, before the title)
	  const label = nowPlaying.querySelector('.now-playing-label');
	  const title = nowPlaying.querySelector('.now-playing-title');
	  
	  let element;
	  // Check for valid image path first
	  if (track.image && !track.isCut) {
		element = document.createElement('img');
		element.src = track.image;
		element.alt = track.title;
		element.style = 'width: 200px; height: 200px; border-radius: 12px; object-fit: cover; display: block; margin: 0.75rem auto; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
		
		// Add error handler for broken images
		element.onerror = function() {
		  this.style.display = 'none';
		  const fallback = document.createElement('div');
		  fallback.style = 'width: 120px; height: 90px; border-radius: 8px; background: var(--soft-blue); display: flex; align-items: center; justify-content: center; margin: 0.75rem auto; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
		  fallback.innerHTML = '<span style="font-size: 2rem;">🎵</span>';
		  this.parentNode.insertBefore(fallback, this.nextSibling);
		};
	  } else if (track.isCut) {
		element = document.createElement('div');
		element.style = 'width: 120px; height: 90px; border-radius: 8px; background: var(--gold-accent); display: flex; align-items: center; justify-content: center; margin: 0.75rem auto; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
		element.innerHTML = '<span style="font-size: 2rem;">📢</span>';
	  } else {
		element = document.createElement('div');
		element.style = 'width: 120px; height: 90px; border-radius: 8px; background: var(--soft-blue); display: flex; align-items: center; justify-content: center; margin: 0.75rem auto; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
		element.innerHTML = '<span style="font-size: 2rem;">🎵</span>';
	  }
	  
	  // Insert between label and title
	  if (title) {
		nowPlaying.insertBefore(element, title);
		// Update the title text
		title.textContent = track.title;
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
    if (!this.currentPlaylist || this.currentPlaylist.length === 0 || this.currentIndex < 0) {
      return { title: 'Loading...', file: '', image: null };
    }
    return this.currentPlaylist[this.currentIndex] || { title: 'Loading...', file: '', image: null };
  }

  getUpNext() {
    if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
      return { title: '...', file: '' };
    }
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
  
  // Radio Station Methods
  initRadio() {
    const radioElement = document.getElementById('radio-audio');
    if (!radioElement) {
      console.error('Radio audio element not found!');
      return;
    }
  
    if (!document.getElementById('radio-now-playing')) {
      setTimeout(() => this.initRadio(), 100);
      return;
    }
  
    this.radioStation.init(radioElement);
    
    // Set up UI callbacks
	this.radioStation.setOnTrackChange((current, next) => {
	  // Don't just update text - let the radio station handle the full update
	  // The updateAlbumArt method is already being called in playTrack()
	  document.getElementById('radio-up-next').textContent = next.title;
	});
	
    this.radioStation.setOnPlayStateChange((isPlaying) => {
      document.getElementById('radio-play-btn').textContent = isPlaying ? '⏸️' : '▶️';
    });
    
    this.radioStation.setOnProgressUpdate((progress, currentTime, duration) => {
      document.getElementById('radio-progress-bar').style.width = `${progress}%`;
      document.getElementById('radio-current-time').textContent = this.formatTime(currentTime);
      document.getElementById('radio-total-time').textContent = this.formatTime(duration);
    });
    this.radioStation.setupProgressClick();
  }
  
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  toggleRadio() {
    const radioStation = document.getElementById('radio-station');
    radioStation.classList.toggle('open');
  }
	
  playNextRadioTrack() {
	this.playRadioTrack(this.radioCurrentIndex + 1);
  }
  
  toggleRadioPlayPause() {
	this.radioStation.togglePlayPause();
  }
  
  skipRadioTrack() {
	this.radioStation.skip();
  }
  
  toggleRadioMute() {
	const isMuted = this.radioStation.toggleMute();
	document.getElementById('radio-mute-btn').textContent = isMuted ? '🔇' : '🔊';
  }
  
  setRadioVolume(value) {
	this.radioStation.setVolume(value);
  }
  
  setRadioStation(station) {
	if (!this.radioStation) return;
	
	this.radioStation.setStation(station);
	this.updateStationButtons(station);
	
	// Always start playing the new station
	this.radioStation.play();
  }
  
  updateStationButtons(station) {
    const dropdown = document.querySelector('.station-dropdown');
    if (dropdown) {
      dropdown.value = station;
    }
    
    // Update any station buttons if they exist
    const buttons = document.querySelectorAll('.station-btn');
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.station === station) {
        btn.classList.add('active');
      }
    });
  } 
}

// Export for use in main app
window.RadioStation = RadioStation;