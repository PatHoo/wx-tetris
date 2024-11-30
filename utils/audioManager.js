// 音效管理器
class AudioManager {
  constructor() {
    this.sounds = {
      move: null,
      rotate: null,
      drop: null,
      clear: null,
      combo: null,
      levelUp: null,
      gameOver: null,
      bgm: null
    };
    
    this.isMuted = false;
    this.bgmVolume = 0.5;
    this.sfxVolume = 0.8;
    
    this.init();
  }
  
  async init() {
    try {
      await this.loadSounds();
      console.log('音效加载完成');
    } catch (error) {
      console.error('音效加载失败:', error);
    }
  }
  
  async loadSounds() {
    const soundFiles = {
      move: 'move.mp3',
      rotate: 'rotate.mp3',
      drop: 'drop.mp3',
      clear: 'clear.mp3',
      combo: 'combo.mp3',
      levelUp: 'level_up.mp3',
      gameOver: 'game_over.mp3',
      bgm: 'bgm.mp3'
    };
    
    for (const [key, file] of Object.entries(soundFiles)) {
      this.sounds[key] = wx.createInnerAudioContext();
      this.sounds[key].src = `/assets/sounds/${file}`;
      
      if (key === 'bgm') {
        this.sounds[key].loop = true;
        this.sounds[key].volume = this.bgmVolume;
      } else {
        this.sounds[key].volume = this.sfxVolume;
      }
    }
  }
  
  play(sound) {
    if (this.isMuted || !this.sounds[sound]) return;
    
    // 重置音频位置并播放
    this.sounds[sound].stop();
    this.sounds[sound].seek(0);
    this.sounds[sound].play();
  }
  
  playBgm() {
    if (this.isMuted || !this.sounds.bgm) return;
    this.sounds.bgm.play();
  }
  
  stopBgm() {
    if (!this.sounds.bgm) return;
    this.sounds.bgm.stop();
  }
  
  pauseBgm() {
    if (!this.sounds.bgm) return;
    this.sounds.bgm.pause();
  }
  
  resumeBgm() {
    if (this.isMuted || !this.sounds.bgm) return;
    this.sounds.bgm.play();
  }
  
  setMute(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stopBgm();
    } else {
      this.playBgm();
    }
  }
  
  setBgmVolume(volume) {
    this.bgmVolume = volume;
    if (this.sounds.bgm) {
      this.sounds.bgm.volume = volume;
    }
  }
  
  setSfxVolume(volume) {
    this.sfxVolume = volume;
    Object.entries(this.sounds).forEach(([key, sound]) => {
      if (key !== 'bgm') {
        sound.volume = volume;
      }
    });
  }
  
  // 释放资源
  destroy() {
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.destroy();
      }
    });
  }
}

export default new AudioManager(); 