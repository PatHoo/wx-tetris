import { GAME_CONFIG } from '../config/gameConfig';

class ReplayManager {
  constructor() {
    this.recording = false;
    this.replaying = false;
    this.replaySpeed = 1;
    this.currentFrame = 0;
    
    this.recordData = {
      version: '1.0.0',
      timestamp: null,
      gameMode: null,
      seed: null,
      frames: [],
      statistics: null,
      finalScore: null,
      duration: null
    };
  }
  
  // 开始录制
  startRecording(gameMode) {
    this.recording = true;
    this.recordData = {
      version: '1.0.0',
      timestamp: Date.now(),
      gameMode,
      seed: Math.random(),
      frames: [],
      statistics: null,
      finalScore: null,
      duration: null
    };
  }
  
  // 记录帧
  recordFrame(gameState) {
    if (!this.recording) return;
    
    // 只记录必要的状态变化
    const frame = {
      timestamp: Date.now() - this.recordData.timestamp,
      currentBlock: {
        type: gameState.currentBlock.type,
        x: gameState.currentBlock.x,
        y: gameState.currentBlock.y,
        shape: gameState.currentBlock.shape
      },
      nextBlock: gameState.nextBlock.type,
      holdBlock: gameState.holdBlock?.type,
      score: gameState.score,
      level: gameState.level,
      lines: gameState.lines,
      combo: gameState.combo,
      board: gameState.gameBoard
    };
    
    this.recordData.frames.push(frame);
  }
  
  // 停止录制
  stopRecording(finalState) {
    if (!this.recording) return;
    
    this.recordData.statistics = finalState.statistics;
    this.recordData.finalScore = finalState.score;
    this.recordData.duration = Date.now() - this.recordData.timestamp;
    
    this.recording = false;
    return this.recordData;
  }
  
  // 开始回放
  startReplay(replayData) {
    this.replaying = true;
    this.currentFrame = 0;
    this.recordData = replayData;
    this.replaySpeed = 1;
    
    return {
      gameMode: replayData.gameMode,
      seed: replayData.seed
    };
  }
  
  // 获取下一帧
  getNextFrame() {
    if (!this.replaying || this.currentFrame >= this.recordData.frames.length) {
      return null;
    }
    
    const frame = this.recordData.frames[this.currentFrame];
    this.currentFrame++;
    return frame;
  }
  
  // 设置回放速度
  setReplaySpeed(speed) {
    this.replaySpeed = speed;
  }
  
  // 暂停回放
  pauseReplay() {
    this.replaying = false;
  }
  
  // 继续回放
  resumeReplay() {
    this.replaying = true;
  }
  
  // 停止回放
  stopReplay() {
    this.replaying = false;
    this.currentFrame = 0;
  }
  
  // 保存录像
  saveReplay() {
    const replayList = wx.getStorageSync('tetris_replays') || [];
    replayList.unshift(this.recordData);
    
    // 限制保存数量
    if (replayList.length > 10) {
      replayList.pop();
    }
    
    wx.setStorageSync('tetris_replays', replayList);
  }
  
  // 加载录像
  static loadReplay(index) {
    const replayList = wx.getStorageSync('tetris_replays') || [];
    return replayList[index];
  }
  
  // 获取录像列表
  static getReplayList() {
    return wx.getStorageSync('tetris_replays') || [];
  }
  
  // 删除录像
  static deleteReplay(index) {
    const replayList = wx.getStorageSync('tetris_replays') || [];
    replayList.splice(index, 1);
    wx.setStorageSync('tetris_replays', replayList);
  }
  
  // 导出录像
  exportReplay() {
    return JSON.stringify(this.recordData);
  }
  
  // 导入录像
  static importReplay(replayString) {
    try {
      const replayData = JSON.parse(replayString);
      
      // 验证录像数据
      if (!this.validateReplay(replayData)) {
        throw new Error('无效的录像数据');
      }
      
      return replayData;
    } catch (error) {
      console.error('导入录像失败:', error);
      return null;
    }
  }
  
  // 验证录像数据
  static validateReplay(data) {
    // 检查必要字段
    const requiredFields = [
      'version',
      'timestamp',
      'gameMode',
      'seed',
      'frames',
      'statistics',
      'finalScore',
      'duration'
    ];
    
    if (!requiredFields.every(field => data.hasOwnProperty(field))) {
      return false;
    }
    
    // 检查帧数据
    if (!Array.isArray(data.frames) || data.frames.length === 0) {
      return false;
    }
    
    // 检查每一帧的数据结构
    return data.frames.every(frame => {
      return frame.hasOwnProperty('timestamp') &&
             frame.hasOwnProperty('currentBlock') &&
             frame.hasOwnProperty('nextBlock') &&
             frame.hasOwnProperty('board');
    });
  }
  
  // 获取录像信息
  static getReplayInfo(replay) {
    return {
      date: new Date(replay.timestamp).toLocaleString(),
      mode: replay.gameMode,
      score: replay.finalScore,
      duration: Math.floor(replay.duration / 1000),
      lines: replay.statistics.totalLines,
      level: Math.floor(replay.statistics.totalLines / GAME_CONFIG.LEVEL.LINES_PER_LEVEL) + 1
    };
  }
}

export default ReplayManager; 