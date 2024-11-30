const { AudioContext } = require('web-audio-api');
const fs = require('fs');
const path = require('path');

const ctx = new AudioContext();
const sampleRate = 44100;

// 生成移动音效
function generateMoveSound() {
  const duration = 0.1;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + duration);
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  
  return ctx.exportAsBuffer();
}

// 生成旋转音效
function generateRotateSound() {
  const duration = 0.2;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(300, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration);
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  
  return ctx.exportAsBuffer();
}

// 生成下落音效
function generateDropSound() {
  const duration = 0.15;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(200, ctx.currentTime + duration);
  
  gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  
  return ctx.exportAsBuffer();
}

// 生成消除音效
function generateClearSound() {
  const duration = 0.5;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + duration);
  
  gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  
  return ctx.exportAsBuffer();
}

// 生成游戏结束音效
function generateGameOverSound() {
  const duration = 1.0;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(800, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(200, ctx.currentTime + duration);
  
  gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  
  return ctx.exportAsBuffer();
}

// 生成背景音乐
function generateBGM() {
  const duration = 30.0; // 30秒循环
  const oscillator1 = ctx.createOscillator();
  const oscillator2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // 主旋律
  const melody = [
    440, 494, 523, 587, 659, 587, 523, 494,
    440, 494, 523, 587, 659, 587, 523, 494
  ];
  
  const noteLength = duration / melody.length;
  
  melody.forEach((freq, i) => {
    oscillator1.frequency.setValueAtTime(freq, ctx.currentTime + i * noteLength);
    oscillator2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime + i * noteLength);
  });
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  
  oscillator1.start(ctx.currentTime);
  oscillator2.start(ctx.currentTime);
  oscillator1.stop(ctx.currentTime + duration);
  oscillator2.stop(ctx.currentTime + duration);
  
  return ctx.exportAsBuffer();
}

// 保存音效文件
const sounds = {
  'move.mp3': generateMoveSound(),
  'rotate.mp3': generateRotateSound(),
  'drop.mp3': generateDropSound(),
  'clear.mp3': generateClearSound(),
  'gameover.mp3': generateGameOverSound(),
  'bgm.mp3': generateBGM()
};

Object.entries(sounds).forEach(([filename, buffer]) => {
  fs.writeFileSync(
    path.join(__dirname, `../assets/audio/${filename}`),
    buffer
  );
}); 