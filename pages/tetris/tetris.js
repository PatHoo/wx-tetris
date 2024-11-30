import { GAME_CONFIG, TETROMINOES } from '../../config/gameConfig';
import GameHelper from '../../utils/gameHelper';
import AudioManager from '../../utils/audioManager';
import ChartHelper from '../../utils/chartHelper';
import ReplayManager from '../../utils/replayManager';
import AnalyticsHelper from '../../utils/analyticsHelper';

const BLOCK_TYPES = {
  I: { color: '#00A8FF', shape: [[1,1,1,1]] },
  O: { color: '#FFC048', shape: [[1,1],[1,1]] },
  T: { color: '#9C88FF', shape: [[0,1,0],[1,1,1]] },
  L: { color: '#FF9F43', shape: [[1,0],[1,0],[1,1]] },
  J: { color: '#5352ED', shape: [[0,1],[0,1],[1,1]] },
  S: { color: '#2ED573', shape: [[0,1,1],[1,1,0]] },
  Z: { color: '#FF6B81', shape: [[1,1,0],[0,1,1]] }
};

const GRID_SIZE = 20;
const COLS = 10;
const ROWS = 20;

// 添加主题配置
const THEMES = {
  classic: {
    name: '经典',
    background: '#F8F9FA',
    gridColor: '#E9ECEF',
    blockColors: {
      I: '#00A8FF',
      O: '#FFC048',
      T: '#9C88FF',
      L: '#FF9F43',
      J: '#5352ED',
      S: '#2ED573',
      Z: '#FF6B81'
    }
  },
  dark: {
    name: '暗黑',
    background: '#2F3542',
    gridColor: '#57606F',
    blockColors: {
      I: '#0097E6',
      O: '#FFA502',
      T: '#8C7AE6',
      L: '#E58E26',
      J: '#4834D4',
      S: '#26AE60',
      Z: '#EE5253'
    }
  },
  neon: {
    name: '霓虹',
    background: '#000000',
    gridColor: '#2C3A47',
    blockColors: {
      I: '#18FFFF',
      O: '#FFFF00',
      T: '#FF00FF',
      L: '#FFA000',
      J: '#00FF00',
      S: '#00FFFF',
      Z: '#FF0000'
    }
  }
};

// 添加游戏模式配置
const GAME_MODES = {
  classic: {
    name: '经典模式',
    desc: '无尽模式，速度逐渐加快',
    icon: '🎮'
  },
  challenge: {
    name: '挑战模式',
    desc: '40行挑战，看谁用时最短',
    icon: '🏆',
    targetLines: 40
  },
  timeAttack: {
    name: '限时模式',
    desc: '2分钟内获得最高分',
    icon: '⏱️',
    duration: 120  // 秒
  },
  zen: {
    name: '禅模式',
    desc: '固定速度，无压力享受',
    icon: '🧘‍♂️'
  },
  marathon: {
    name: '马拉松模式',
    desc: '坚持到150行',
    icon: '🏃',
    targetLines: 150
  },
  sprint: {
    name: '冲刺模式',
    desc: '20行最快时间',
    icon: '⚡',
    targetLines: 20
  },
  puzzle: {
    name: '解谜模式',
    desc: '特定形状挑战',
    icon: '🧩',
    levels: [
      {
        target: [[1,1,1],[0,1,0]], // T形
        pieces: ['I', 'O', 'T']
      },
      // ... 更多关卡
    ]
  },
  garbage: {
    name: '垃圾回收',
    desc: '清理随机垃圾行',
    icon: '🗑️',
    garbageRate: 0.3 // 每次下落有30%概率生成垃圾行
  },
  blind: {
    name: '盲打模式',
    desc: '隐藏下一个方块',
    icon: '👁️',
    features: {
      hideNext: true,
      flashPreview: true // 短暂显示预览
    }
  },
  mirror: {
    name: '镜像模式',
    desc: '操作反转',
    icon: '🪞',
    features: {
      reverseControls: true
    }
  }
};

// 添加联机对战配置
const BATTLE_MODES = {
  NORMAL: {
    name: '普通对战',
    desc: '1v1 实时对战',
    maxPlayers: 2
  },
  BATTLE_ROYALE: {
    name: '大乱斗',
    desc: '多人混战',
    maxPlayers: 4
  }
};

// 添加手势配置
const DEFAULT_GESTURES = {
  rotate: {
    type: 'tap',
    name: '旋转',
    desc: '点击屏幕'
  },
  moveLeft: {
    type: 'swipe',
    direction: 'left',
    name: '左移',
    desc: '向左滑动'
  },
  moveRight: {
    type: 'swipe',
    direction: 'right',
    name: '右移',
    desc: '向右滑动'
  },
  softDrop: {
    type: 'swipe',
    direction: 'down',
    name: '加速下落',
    desc: '向下滑动'
  },
  hardDrop: {
    type: 'swipe',
    direction: 'down',
    speed: 'fast',
    name: '硬降',
    desc: '快速向下滑动'
  }
};

// 添加更多成就类型
const ACHIEVEMENTS = {
  // 基础成就
  first_clear: { 
    title: '初次消行', 
    desc: '第一次消除一行',
    points: 10
  },
  combo_master: { 
    title: '连击大师', 
    desc: '达成5连击',
    points: 20
  },
  speed_demon: { 
    title: '速降王者', 
    desc: '使用硬降落50次',
    points: 30
  },
  level_10: { 
    title: '高手', 
    desc: '达到10级',
    points: 50
  },
  score_10000: { 
    title: '分数王', 
    desc: '获得10000分',
    points: 100
  },
  
  // 模式成就
  marathon_master: {
    title: '马拉松大师',
    desc: '完成马拉松模式',
    points: 200
  },
  sprint_king: {
    title: '冲刺之王',
    desc: '20行用时少于1分钟',
    points: 150
  },
  puzzle_solver: {
    title: '解谜专家',
    desc: '完成所有解谜关卡',
    points: 300
  },
  garbage_collector: {
    title: '清道夫',
    desc: '清理100行垃圾',
    points: 250
  },
  blind_master: {
    title: '盲打大师',
    desc: '盲打模式达到10级',
    points: 400
  },
  mirror_expert: {
    title: '镜像专家',
    desc: '镜像模���获得5000分',
    points: 200
  },
  
  // 特殊成就
  perfect_clear: {
    title: '完美清除',
    desc: '一次性清除4行',
    points: 100
  },
  long_survivor: {
    title: '持久战',
    desc: '单局游戏超过30分钟',
    points: 150
  },
  speed_runner: {
    title: '极速玩家',
    desc: '达到20级',
    points: 300
  },
  block_master: {
    title: '方块大师',
    desc: '使用每种方块各100次',
    points: 200
  },
  combo_king: {
    title: '连击之王',
    desc: '达成10连击',
    points: 250
  }
};

// 添加排行榜分类
const LEADERBOARD_CATEGORIES = {
  overall: {
    name: '总榜',
    desc: '综合得分排名',
    sortBy: 'score'
  },
  daily: {
    name: '每日榜',
    desc: '今日最高分',
    sortBy: 'score',
    timeLimit: 24 * 60 * 60 * 1000
  },
  weekly: {
    name: '周榜',
    desc: '本周最高分',
    sortBy: 'score',
    timeLimit: 7 * 24 * 60 * 60 * 1000
  },
  modes: {
    marathon: {
      name: '马拉松榜',
      desc: '马拉松模式最快完成时间',
      sortBy: 'time',
      ascending: true
    },
    sprint: {
      name: '冲刺榜',
      desc: '20行最快时间',
      sortBy: 'time',
      ascending: true
    },
    timeAttack: {
      name: '限时榜',
      desc: '2分钟最高���',
      sortBy: 'score'
    }
  },
  achievements: {
    name: '成就榜',
    desc: '成就点数排名',
    sortBy: 'points'
  }
};

// 添加数据分析配置
const ANALYTICS_CONFIG = {
  charts: {
    score: {
      title: '分数趋势',
      type: 'line',
      timeRanges: ['all', 'month', 'week', 'day']
    },
    pieces: {
      title: '方块使用分布',
      type: 'pie'
    },
    lines: {
      title: '消行统计',
      type: 'bar',
      timeRanges: ['all', 'month', 'week', 'day']
    },
    playTime: {
      title: '游戏时长分布',
      type: 'histogram'
    },
    level: {
      title: '等级分布',
      type: 'bar'
    },
    modes: {
      title: '游戏模式统计',
      type: 'pie'
    }
  },
  metrics: {
    averageScore: {
      title: '平均分数',
      calc: (records) => records.reduce((sum, r) => sum + r.score, 0) / records.length
    },
    averageLines: {
      title: '平均消行',
      calc: (records) => records.reduce((sum, r) => sum + r.lines, 0) / records.length
    },
    maxCombo: {
      title: '最高连击',
      calc: (records) => Math.max(...records.map(r => r.maxCombo))
    },
    totalPlayTime: {
      title: '总游戏时长',
      calc: (records) => records.reduce((sum, r) => sum + r.duration, 0)
    },
    averageSpeed: {
      title: '平均速度',
      calc: (records) => records.reduce((sum, r) => sum + r.lines / (r.duration / 60), 0) / records.length
    }
  }
};

// 添加房间相关配置
const ROOM_CONFIG = {
  maxPlayers: 4,
  readyTimeout: 30000, // 30秒准备超时
  gameStartDelay: 3000, // 3秒倒计时
  rematchTimeout: 15000, // 15秒重新匹配超时
  chatHistory: 50, // 保留最近50条聊天记录
  quickMessages: [
    '加油！',
    '好厉害！',
    '再来一局！',
    '等等我~',
    '玩得不错！'
  ]
};

Page({
  data: {
    // 游戏状态
    score: 0,
    highScore: 0,
    level: 1,
    lines: 0,
    combo: 0,
    isGameOver: false,
    isPaused: false,
    isMuted: false,
    
    // 游戏设置
    theme: 'classic',
    gameMode: 'classic',
    settings: {
      showGrid: true,
      showGhost: true,
      sensitivity: 50
    },
    
    // 音频设置
    bgmVolume: 0.5,
    sfxVolume: 0.8,
    
    // 界面状态
    showModeSelector: false,
    showSettings: false,
    showThemeSelector: false,
    showTutorial: true,
    showHelp: false,
    showAnalytics: false,
    showRankPanel: false,
    showBattleUI: false,
    
    // 特效状态
    showParticles: false,
    showLevelBeam: false,
    showPerfectClear: false,
    showTSpin: false,
    showRainbowClear: false,
    
    // 动画数据
    scorePopup: {
      visible: false,
      x: 0,
      y: 0,
      score: 0
    },
    levelUpEffect: {
      visible: false,
      level: 1
    },
    comboEffect: {
      visible: false,
      combo: 0
    },
    
    // 统计数据
    statistics: {
      totalGames: 0,
      totalPieces: 0,
      totalLines: 0,
      maxCombo: 0,
      playTime: 0,
      pieceStats: {
        I: 0, O: 0, T: 0,
        L: 0, J: 0, S: 0, Z: 0
      }
    },
    
    // 对战数据
    room: {
      id: null,
      players: [],
      chat: [],
      status: 'waiting'
    },
    currentPlayer: null,
    isReady: false,
    chatInput: '',
    quickMessages: GAME_CONFIG.BATTLE.QUICK_MESSAGES,
    
    // 图表数据
    chartType: 'score',
    timeRange: 'week',
    pieceStats: []
  },

  onLoad() {
    // 初始化游戏
    this.initGame();
    
    // 加载存储的数据
    this.loadStoredData();
    
    // 初始化画布
    this.initCanvas();
    
    // 设置触摸事件
    this.setupTouchEvents();
    
    // 显示教程（如果需要）
    if (wx.getStorageSync('showTutorial') !== false) {
      this.showTutorial();
    }
  },

  // 游戏初始化
  initGame() {
    this.gameState = {
      board: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
      currentBlock: null,
      nextBlock: null,
      holdBlock: null,
      hasHeld: false,
      dropInterval: GAME_CONFIG.SPEED.INITIAL,
      lastDropTime: Date.now(),
      gameStartTime: Date.now(),
      lastMoveTime: Date.now()
    };

    // 生成初始方块
    this.gameState.currentBlock = this.generateBlock();
    this.gameState.nextBlock = this.generateBlock();

    // 初始化游戏循环
    this.startGameLoop();

    // 初始化音频
    AudioManager.init();
    if (!this.data.isMuted) {
      AudioManager.playBgm();
    }

    // 初始化录像系统
    this.replayManager = new ReplayManager();
    this.replayManager.startRecording(this.data.gameMode);
  },

  // 游戏循环
  startGameLoop() {
    const gameLoop = () => {
      if (!this.data.isPaused && !this.data.isGameOver) {
        const now = Date.now();
        
        // 自动下落
        if (now - this.gameState.lastDropTime > this.gameState.dropInterval) {
          this.moveDown();
          this.gameState.lastDropTime = now;
        }
        
        // 更新游戏时间
        this.updatePlayTime();
        
        // 记录游戏状态
        this.replayManager.recordFrame(this.getGameState());
      }
      
      this.gameState.animationFrame = requestAnimationFrame(gameLoop);
    };
    
    this.gameState.animationFrame = requestAnimationFrame(gameLoop);
  },

  // 生成新方块
  generateBlock() {
    const types = Object.keys(BLOCK_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const block = BLOCK_TYPES[type];
    
    return {
      type,
      shape: [...block.shape],
      color: block.color,
      x: Math.floor((COLS - block.shape[0].length) / 2),
      y: 0
    };
  },

  // 移动方块
  moveBlock(direction) {
    if (this.data.isPaused || this.data.isGameOver) return false;
    
    const { currentBlock } = this.gameState;
    let offsetX = 0;
    let offsetY = 0;
    
    switch (direction) {
      case 'left':
        offsetX = -1;
        break;
      case 'right':
        offsetX = 1;
        break;
      case 'down':
        offsetY = 1;
        break;
    }
    
    if (!this.checkCollision(currentBlock, offsetX, offsetY)) {
      currentBlock.x += offsetX;
      currentBlock.y += offsetY;
      
      if (direction !== 'down') {
        AudioManager.play('move');
      }
      
      this.updateCanvas();
      return true;
    }
    
    // 如果是向下移动且发生碰撞，则锁定方块
    if (direction === 'down' && offsetY === 1) {
      this.lockBlock();
    }
    
    return false;
  },

  // 旋转方块
  rotateBlock() {
    if (this.data.isPaused || this.data.isGameOver) return false;
    
    const { currentBlock } = this.gameState;
    const rotated = this.getRotatedShape(currentBlock);
    
    // 尝试基本旋转
    if (!this.checkCollision(rotated, 0, 0)) {
      this.gameState.currentBlock = rotated;
      AudioManager.play('rotate');
      this.updateCanvas();
      return true;
    }
    
    // 尝试墙踢
    const kicks = this.getWallKicks(currentBlock, rotated);
    for (const [dx, dy] of kicks) {
      if (!this.checkCollision(rotated, dx, dy)) {
        rotated.x += dx;
        rotated.y += dy;
        this.gameState.currentBlock = rotated;
        AudioManager.play('rotate');
        this.updateCanvas();
        return true;
      }
    }
    
    return false;
  },

  // 获取旋转后的形状
  getRotatedShape(block) {
    const shape = block.shape;
    const newShape = [];
    
    for (let i = 0; i < shape[0].length; i++) {
      newShape[i] = [];
      for (let j = 0; j < shape.length; j++) {
        newShape[i][j] = shape[shape.length - 1 - j][i];
      }
    }
    
    return {
      ...block,
      shape: newShape
    };
  },

  // 获取墙踢数据
  getWallKicks(oldBlock, newBlock) {
    // 基本墙踢测试点
    const kicks = [
      [0, 0],   // 无偏移
      [-1, 0],  // 左移
      [1, 0],   // 右移
      [0, -1],  // 上移
      [-1, -1], // 左上
      [1, -1]   // 右上
    ];
    
    // T型方块特殊处理（T-Spin）
    if (oldBlock.type === 'T') {
      kicks.push([-1, 1], [1, 1]); // 添加更多测试点
    }
    
    return kicks;
  },

  // 检查碰撞
  checkCollision(block, offsetX = 0, offsetY = 0) {
    const { shape } = block;
    const posX = block.x + offsetX;
    const posY = block.y + offsetY;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = posX + x;
          const boardY = posY + y;
          
          // 检查边界
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
            return true;
          }
          
          // 检查其他方块
          if (boardY >= 0 && this.gameState.board[boardY][boardX]) {
            return true;
          }
        }
      }
    }
    
    return false;
  },

  // 锁定方块
  lockBlock() {
    const { currentBlock, board } = this.gameState;
    
    // 将方块固定到游戏板上
    for (let y = 0; y < currentBlock.shape.length; y++) {
      for (let x = 0; x < currentBlock.shape[y].length; x++) {
        if (currentBlock.shape[y][x]) {
          const boardY = currentBlock.y + y;
          const boardX = currentBlock.x + x;
          if (boardY >= 0) {
            board[boardY][boardX] = currentBlock.type;
          }
        }
      }
    }
    
    // 更新统计
    this.data.statistics.totalPieces++;
    this.data.statistics.pieceStats[currentBlock.type]++;
    
    // 检查T-Spin
    const isTSpin = this.checkTSpin(currentBlock);
    
    // 清除已完成的行
    const clearedLines = this.clearLines();
    
    // 更新分数
    if (clearedLines > 0 || isTSpin) {
      this.updateScore(clearedLines, isTSpin);
    }
    
    // 生成新方块
    this.gameState.currentBlock = this.gameState.nextBlock;
    this.gameState.nextBlock = this.generateBlock();
    this.gameState.hasHeld = false;
    
    // 检查游戏结束
    if (this.checkGameOver()) {
      this.gameOver();
      return;
    }
    
    // 播放音效
    AudioManager.play('drop');
    
    // 更新画布
    this.updateCanvas();
  },

  // 硬降
  hardDrop() {
    if (this.data.isPaused || this.data.isGameOver) return;
    
    let dropDistance = 0;
    while (!this.checkCollision(this.gameState.currentBlock, 0, dropDistance + 1)) {
      dropDistance++;
    }
    
    // 分
    this.setData({
      score: this.data.score + dropDistance * GAME_CONFIG.SCORE.HARD_DROP
    });
    
    // 移动方块
    this.gameState.currentBlock.y += dropDistance;
    
    // 锁定方块
    this.lockBlock();
    
    // 播放音效和特效
    AudioManager.play('drop');
    this.showDropEffect(dropDistance);
  },

  // 暂存方块
  holdBlock() {
    if (this.data.isPaused || this.data.isGameOver || this.gameState.hasHeld) return;
    
    if (!this.gameState.holdBlock) {
      // 第一次暂存
      this.gameState.holdBlock = this.gameState.currentBlock;
      this.gameState.currentBlock = this.gameState.nextBlock;
      this.gameState.nextBlock = this.generateBlock();
    } else {
      // 交换当前方块和暂存方块
      const temp = this.gameState.currentBlock;
      this.gameState.currentBlock = this.gameState.holdBlock;
      this.gameState.holdBlock = temp;
      
      // 重置位置
      this.gameState.currentBlock.x = Math.floor((COLS - this.gameState.currentBlock.shape[0].length) / 2);
      this.gameState.currentBlock.y = 0;
    }
    
    this.gameState.hasHeld = true;
    AudioManager.play('move');
    this.updateCanvas();
  },

  // 清除已完成的行
  clearLines() {
    let linesCleared = 0;
    let y = ROWS - 1;
    
    while (y >= 0) {
      if (this.gameState.board[y].every(cell => cell !== 0)) {
        // 删除该行
        this.gameState.board.splice(y, 1);
        // 在顶部添加新行
        this.gameState.board.unshift(new Array(COLS).fill(0));
        linesCleared++;
      } else {
        y--;
      }
    }
    
    if (linesCleared > 0) {
      // 更新统计
      this.data.statistics.totalLines += linesCleared;
      
      // 检查完美清除
      if (this.gameState.board.every(row => row.every(cell => cell === 0))) {
        this.showPerfectClearEffect();
        this.setData({
          score: this.data.score + GAME_CONFIG.SCORE.PERFECT_CLEAR
        });
      }
      
      // 更新等级
      const newLevel = Math.floor(this.data.statistics.totalLines / 10) + 1;
      if (newLevel > this.data.level) {
        this.levelUp(newLevel);
      }
    }
    
    return linesCleared;
  },

  // 更新分数
  updateScore(linesCleared, isTSpin = false) {
    let score = 0;
    
    // 基础分数
    switch (linesCleared) {
      case 1:
        score = isTSpin ? GAME_CONFIG.SCORE.T_SPIN_SINGLE : GAME_CONFIG.SCORE.SINGLE;
        break;
      case 2:
        score = isTSpin ? GAME_CONFIG.SCORE.T_SPIN_DOUBLE : GAME_CONFIG.SCORE.DOUBLE;
        break;
      case 3:
        score = isTSpin ? GAME_CONFIG.SCORE.T_SPIN_TRIPLE : GAME_CONFIG.SCORE.TRIPLE;
        break;
      case 4:
        score = GAME_CONFIG.SCORE.TETRIS;
        break;
    }
    
    // 等级加成
    score *= this.data.level;
    
    // 连击加成
    if (linesCleared > 0) {
      this.data.combo++;
      if (this.data.combo > 1) {
        score += GAME_CONFIG.SCORE.COMBO_BONUS * (this.data.combo - 1);
      }
    } else {
      this.data.combo = 0;
    }
    
    // 更新最大连击
    if (this.data.combo > this.data.statistics.maxCombo) {
      this.data.statistics.maxCombo = this.data.combo;
    }
    
    // 更新分数
    this.setData({
      score: this.data.score + score
    });
    
    // 显示分数弹出
    this.showScorePopup(score);
    
    // 更新最高分
    if (this.data.score > this.data.highScore) {
      this.setData({
        highScore: this.data.score
      });
      wx.setStorageSync('tetris_high_score', this.data.score);
    }
  },

  // 检查游戏结束
  checkGameOver() {
    const { currentBlock } = this.gameState;
    return this.checkCollision(currentBlock, 0, 0);
  },

  // 游戏结束处理
  gameOver() {
    this.setData({
      isGameOver: true
    });
    
    // 停止游戏循环
    if (this.gameState.animationFrame) {
      cancelAnimationFrame(this.gameState.animationFrame);
    }
    
    // 停止音乐
    AudioManager.stopBgm();
    AudioManager.play('gameOver');
    
    // 保存游戏记录
    this.saveGameRecord();
    
    // 显示游戏结束特效
    this.showGameOverEffect();
    
    // 检查成就
    this.checkAchievements();
    
    // 更新排行榜
    this.updateLeaderboard();
  },

  // 更新画布
  updateCanvas() {
    // 获取画布上下文
    const ctx = this.ctx;
    const previewCtx = this.previewCtx;
    
    // 清空画布
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 绘制网格
    if (this.data.settings.showGrid) {
      this.drawGrid();
    }
    
    // 绘制固定的方块
    this.drawBoard();
    
    // 绘制幽灵方块
    if (this.data.settings.showGhost) {
      this.drawGhostPiece();
    }
    
    // 绘制当前方块
    this.drawBlock(this.gameState.currentBlock);
    
    // 更新预览
    this.updatePreview();
  },

  // 初始化画布
  initCanvas() {
    const query = wx.createSelectorQuery();
    
    // 主游戏画布
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        this.ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        const scale = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * scale;
        canvas.height = res[0].height * scale;
        this.ctx.scale(scale, scale);
        
        this.canvasWidth = res[0].width;
        this.canvasHeight = res[0].height;
      });
    
    // 预览画布
    query.select('#previewCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        this.previewCtx = canvas.getContext('2d');
        
        // 设置画布尺寸
        const scale = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * scale;
        canvas.height = res[0].height * scale;
        this.previewCtx.scale(scale, scale);
        
        this.previewWidth = res[0].width;
        this.previewHeight = res[0].height;
      });
  },

  // 绘制网格
  drawGrid() {
    const { ctx, canvasWidth, canvasHeight } = this;
    const theme = THEMES[this.data.theme];
    
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, canvasHeight);
      ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(canvasWidth, y * GRID_SIZE);
      ctx.stroke();
    }
  },

  // 绘制游戏板
  drawBoard() {
    const { board } = this.gameState;
    const theme = THEMES[this.data.theme];
    
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x]) {
          this.drawCell(x, y, theme.blockColors[board[y][x]]);
        }
      }
    }
  },

  // 绘制方块
  drawBlock(block) {
    if (!block) return;
    
    const theme = THEMES[this.data.theme];
    const color = theme.blockColors[block.type];
    
    for (let y = 0; y < block.shape.length; y++) {
      for (let x = 0; x < block.shape[y].length; x++) {
        if (block.shape[y][x]) {
          this.drawCell(block.x + x, block.y + y, color);
        }
      }
    }
  },

  // 绘制单个格子
  drawCell(x, y, color) {
    const { ctx } = this;
    const size = GRID_SIZE;
    const padding = 1; // 边距，使方块之间有间隙
    
    // 主体颜色
    ctx.fillStyle = color;
    ctx.fillRect(
      x * size + padding,
      y * size + padding,
      size - padding * 2,
      size - padding * 2
    );
    
    // 高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(
      x * size + padding,
      y * size + padding,
      size - padding * 2,
      (size - padding * 2) / 4
    );
    
    // 阴影��果
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(
      x * size + padding,
      y * size + padding + (size - padding * 2) * 3/4,
      size - padding * 2,
      (size - padding * 2) / 4
    );
  },

  // 绘制幽灵方块
  drawGhostPiece() {
    const { currentBlock } = this.gameState;
    if (!currentBlock) return;
    
    // 计算幽灵方块位置
    let dropDistance = 0;
    while (!this.checkCollision(currentBlock, 0, dropDistance + 1)) {
      dropDistance++;
    }
    
    // 创建幽灵方块
    const ghostBlock = {
      ...currentBlock,
      y: currentBlock.y + dropDistance
    };
    
    // 绘制半透明的幽灵方块
    const theme = THEMES[this.data.theme];
    const originalColor = theme.blockColors[ghostBlock.type];
    const ghostColor = this.adjustColorAlpha(originalColor, 0.3);
    
    for (let y = 0; y < ghostBlock.shape.length; y++) {
      for (let x = 0; x < ghostBlock.shape[y].length; x++) {
        if (ghostBlock.shape[y][x]) {
          this.drawCell(ghostBlock.x + x, ghostBlock.y + y, ghostColor);
        }
      }
    }
  },

  // 更新预览区域
  updatePreview() {
    const { nextBlock } = this.gameState;
    if (!nextBlock) return;
    
    const { previewCtx, previewWidth, previewHeight } = this;
    const theme = THEMES[this.data.theme];
    
    // 清空预览画布
    previewCtx.clearRect(0, 0, previewWidth, previewHeight);
    
    // 计算方块大小和位置
    const blockWidth = nextBlock.shape[0].length * GRID_SIZE;
    const blockHeight = nextBlock.shape.length * GRID_SIZE;
    const x = (previewWidth - blockWidth) / 2;
    const y = (previewHeight - blockHeight) / 2;
    
    // 绘制预览方块
    const color = theme.blockColors[nextBlock.type];
    for (let i = 0; i < nextBlock.shape.length; i++) {
      for (let j = 0; j < nextBlock.shape[i].length; j++) {
        if (nextBlock.shape[i][j]) {
          this.drawPreviewCell(
            x + j * GRID_SIZE,
            y + i * GRID_SIZE,
            color,
            previewCtx
          );
        }
      }
    }
  },

  // 绘制预览区域的单个格子
  drawPreviewCell(x, y, color, ctx) {
    const size = GRID_SIZE;
    const padding = 1;
    
    // 主体颜色
    ctx.fillStyle = color;
    ctx.fillRect(
      x + padding,
      y + padding,
      size - padding * 2,
      size - padding * 2
    );
    
    // 高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(
      x + padding,
      y + padding,
      size - padding * 2,
      (size - padding * 2) / 4
    );
    
    // 阴影效果
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(
      x + padding,
      y + padding + (size - padding * 2) * 3/4,
      size - padding * 2,
      (size - padding * 2) / 4
    );
  },

  // 调整颜色透明度
  adjustColorAlpha(color, alpha) {
    // 将十六进制颜色转换为 RGBA
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  },

  // 设置触摸事件
  setupTouchEvents() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.lastMoveTime = 0;
    this.isSwiping = false;
    this.swipeThreshold = this.data.settings.sensitivity;
    this.lastTapTime = 0;
    this.doubleTapDelay = 300; // 双击间隔时间
  },

  // 处理触摸开始
  handleTouchStart(e) {
    if (this.data.isPaused || this.data.isGameOver) return;
    
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.isSwiping = false;
    
    // 检查双击
    const now = Date.now();
    if (now - this.lastTapTime < this.doubleTapDelay) {
      this.hardDrop();
      this.lastTapTime = 0;
    } else {
      this.lastTapTime = now;
    }
  },

  // 处理触摸移动
  handleTouchMove(e) {
    if (this.data.isPaused || this.data.isGameOver) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const now = Date.now();
    
    // 防止过快移动
    if (now - this.lastMoveTime < 50) return;
    
    // 判断滑动方向
    if (!this.isSwiping && (Math.abs(deltaX) > this.swipeThreshold || Math.abs(deltaY) > this.swipeThreshold)) {
      this.isSwiping = true;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0) {
          this.moveBlock('right');
        } else {
          this.moveBlock('left');
        }
      } else {
        // 垂直滑动
        if (deltaY > 0) {
          this.moveBlock('down');
        }
      }
      
      // 更新起始位置和时间
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.lastMoveTime = now;
    }
  },

  // 处理触摸结束
  handleTouchEnd(e) {
    if (this.data.isPaused || this.data.isGameOver) return;
    
    if (!this.isSwiping) {
      // 单击旋转
      this.rotateBlock();
    }
  },

  // 显示模式选择器
  showModeSelector() {
    this.setData({
      showModeSelector: true
    });
  },

  // 选择游戏模式
  selectMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      gameMode: mode,
      showModeSelector: false
    });
    
    // 重置游戏
    this.resetGame();
  },

  // 显示设置面板
  showSettings() {
    this.setData({
      showSettings: true
    });
  },

  // 更新设置
  updateSettings(e) {
    const { type, value } = e.detail;
    
    switch (type) {
      case 'grid':
        this.setData({
          'settings.showGrid': value
        });
        break;
      case 'ghost':
        this.setData({
          'settings.showGhost': value
        });
        break;
      case 'sensitivity':
        this.setData({
          'settings.sensitivity': value
        });
        this.swipeThreshold = value;
        break;
      case 'bgmVolume':
        this.setData({
          bgmVolume: value
        });
        AudioManager.setBgmVolume(value);
        break;
      case 'sfxVolume':
        this.setData({
          sfxVolume: value
        });
        AudioManager.setSfxVolume(value);
        break;
    }
    
    // 保存设置
    wx.setStorageSync('tetris_settings', this.data.settings);
    
    // 更新画布
    this.updateCanvas();
  },

  // 显示主题选择器
  showThemeSelector() {
    this.setData({
      showThemeSelector: true
    });
  },

  // 选择主题
  selectTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    this.setData({
      theme,
      showThemeSelector: false
    });
    
    // 保存主题设置
    wx.setStorageSync('tetris_theme', theme);
    
    // 更新画布
    this.updateCanvas();
  },

  // 自定义主题
  customizeTheme() {
    // 打开主题编辑器
    this.setData({
      showThemeEditor: true
    });
  },

  // 保存自定义主题
  saveCustomTheme(e) {
    const { name, colors } = e.detail;
    
    // 验证主题数据
    if (!this.validateTheme(colors)) {
      wx.showToast({
        title: '主题数据无效',
        icon: 'none'
      });
      return;
    }
    
    // 保存自定义主题
    const customThemes = wx.getStorageSync('tetris_custom_themes') || [];
    customThemes.push({
      name,
      colors,
      createTime: Date.now()
    });
    
    wx.setStorageSync('tetris_custom_themes', customThemes);
    
    this.setData({
      showThemeEditor: false
    });
    
    wx.showToast({
      title: '主题保存成功',
      icon: 'success'
    });
  },

  // 验证主题数据
  validateTheme(colors) {
    const requiredColors = [
      'background',
      'gridColor',
      'blockColors'
    ];
    
    if (!requiredColors.every(key => colors.hasOwnProperty(key))) {
      return false;
    }
    
    const blockTypes = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
    return blockTypes.every(type => colors.blockColors.hasOwnProperty(type));
  },

  // 保存游戏数据
  saveGameData() {
    const gameData = {
      statistics: this.data.statistics,
      highScore: this.data.highScore,
      settings: this.data.settings,
      theme: this.data.theme,
      achievements: this.data.achievements
    };
    
    Object.entries(gameData).forEach(([key, value]) => {
      wx.setStorageSync(`tetris_${key}`, value);
    });
  },

  // 加载存储数据
  loadStoredData() {
    // 加载设置
    const settings = wx.getStorageSync('tetris_settings');
    if (settings) {
      this.setData({ settings });
    }
    
    // 加载主题
    const theme = wx.getStorageSync('tetris_theme');
    if (theme) {
      this.setData({ theme });
    }
    
    // 加载统计数据
    const statistics = wx.getStorageSync('tetris_statistics');
    if (statistics) {
      this.setData({ statistics });
    }
    
    // 加载最高分
    const highScore = wx.getStorageSync('tetris_high_score');
    if (highScore) {
      this.setData({ highScore });
    }
    
    // 加载成就
    const achievements = wx.getStorageSync('tetris_achievements');
    if (achievements) {
      this.setData({ achievements });
    }
  },

  // 保存游戏记录
  saveGameRecord() {
    const record = {
      date: Date.now(),
      mode: this.data.gameMode,
      score: this.data.score,
      lines: this.data.statistics.totalLines,
      level: this.data.level,
      duration: Date.now() - this.gameState.gameStartTime,
      statistics: { ...this.data.statistics }
    };
    
    const records = wx.getStorageSync('tetris_records') || [];
    records.unshift(record);
    
    // 限制记录数量
    if (records.length > 100) {
      records.pop();
    }
    
    wx.setStorageSync('tetris_records', records);
  },

  // 显示分数弹出
  showScorePopup(score) {
    // 计算弹出位置
    const x = this.canvasWidth / 2;
    const y = this.canvasHeight / 2;
    
    this.setData({
      scorePopup: {
        visible: true,
        x,
        y,
        score
      }
    });
    
    // 自动隐藏
    setTimeout(() => {
      this.setData({
        'scorePopup.visible': false
      });
    }, 1000);
  },

  // 显示等级提升特效
  showLevelUpEffect(level) {
    this.setData({
      levelUpEffect: {
        visible: true,
        level
      }
    });
    
    // 播放音效
    AudioManager.play('levelUp');
    
    // 显示光束效果
    this.setData({ showLevelBeam: true });
    
    // 自动隐藏
    setTimeout(() => {
      this.setData({
        'levelUpEffect.visible': false,
        showLevelBeam: false
      });
    }, 2000);
  },

  // 显示连击特效
  showComboEffect(combo) {
    if (combo < 2) return;
    
    this.setData({
      comboEffect: {
        visible: true,
        combo
      }
    });
    
    // 播放音效
    AudioManager.play('combo');
    
    // 自动隐藏
    setTimeout(() => {
      this.setData({
        'comboEffect.visible': false
      });
    }, 1000);
  },

  // 显示完美清除特效
  showPerfectClearEffect() {
    this.setData({ showPerfectClear: true });
    
    // 创建彩虹特效
    this.setData({ showRainbowClear: true });
    
    // 播放音效
    AudioManager.play('perfectClear');
    
    // 自动隐藏
    setTimeout(() => {
      this.setData({
        showPerfectClear: false,
        showRainbowClear: false
      });
    }, 1500);
  },

  // 显示游戏结束特效
  showGameOverEffect() {
    // 创建爆炸粒子
    this.createExplosionParticles();
    
    // 显示炫光效果
    this.setData({ showGameOverGlow: true });
    
    // 渐隐效果
    let opacity = 1;
    const fadeInterval = setInterval(() => {
      opacity -= 0.05;
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        this.setData({ showGameOverGlow: false });
      }
    }, 50);
  },

  // 创建爆炸粒子
  createExplosionParticles() {
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      
      particles.push({
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: this.getRandomColor()
      });
    }
    
    this.particles = particles;
    this.animateParticles();
  },

  // 动画粒子
  animateParticles() {
    if (!this.particles || this.particles.length === 0) return;
    
    const ctx = this.ctx;
    
    const animate = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      
      this.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life <= 0) {
          this.particles.splice(index, 1);
          return;
        }
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.life})`;
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
      
      if (this.particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  },

  // 获取随机颜色
  getRandomColor() {
    return {
      r: Math.floor(Math.random() * 255),
      g: Math.floor(Math.random() * 255),
      b: Math.floor(Math.random() * 255)
    };
  },

  // 显示下落特效
  showDropEffect(distance) {
    const { currentBlock } = this.gameState;
    const startY = currentBlock.y - distance;
    
    // 创建轨迹
    for (let y = startY; y < currentBlock.y; y++) {
      this.createTrailEffect(currentBlock, y);
    }
  },

  // 创建轨迹特效
  createTrailEffect(block, y) {
    const theme = THEMES[this.data.theme];
    const color = theme.blockColors[block.type];
    
    const trail = {
      shape: block.shape,
      x: block.x,
      y,
      color,
      opacity: 0.5
    };
    
    this.trails = this.trails || [];
    this.trails.push(trail);
    
    // 动画轨迹
    this.animateTrails();
  },

  // 动画轨迹
  animateTrails() {
    if (!this.trails || this.trails.length === 0) return;
    
    const animate = () => {
      this.trails.forEach((trail, index) => {
        trail.opacity -= 0.05;
        
        if (trail.opacity <= 0) {
          this.trails.splice(index, 1);
          return;
        }
        
        // 绘制轨迹
        const ghostColor = this.adjustColorAlpha(trail.color, trail.opacity);
        for (let y = 0; y < trail.shape.length; y++) {
          for (let x = 0; x < trail.shape[y].length; x++) {
            if (trail.shape[y][x]) {
              this.drawCell(trail.x + x, trail.y + y, ghostColor);
            }
          }
        }
      });
      
      if (this.trails.length > 0) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  },

  // 初始化联机对战
  initBattleMode() {
    // 连接服务器
    this.connectServer();
    
    // 初始化对手画布
    this.initOpponentCanvas();
    
    // 设置对战模式
    this.setData({
      showBattleUI: true,
      gameMode: 'battle'
    });
  },

  // 连接服务器
  connectServer() {
    const socket = wx.connectSocket({
      url: GAME_CONFIG.SERVER_URL,
      success: () => {
        console.log('连接服务器成功');
      }
    });
    
    socket.onOpen(() => {
      this.socket = socket;
      this.setupSocketEvents();
    });
    
    socket.onError((error) => {
      console.error('连接错误:', error);
      wx.showToast({
        title: '连接失败',
        icon: 'none'
      });
    });
  },

  // 设置Socket事件
  setupSocketEvents() {
    this.socket.onMessage((res) => {
      const data = JSON.parse(res.data);
      this.handleServerMessage(data);
    });
    
    this.socket.onClose(() => {
      console.log('连接已关闭');
      this.handleDisconnect();
    });
  },

  // 处理服务器消息
  handleServerMessage(data) {
    switch (data.type) {
      case 'room_info':
        this.updateRoomInfo(data.room);
        break;
      case 'player_join':
        this.handlePlayerJoin(data.player);
        break;
      case 'player_leave':
        this.handlePlayerLeave(data.playerId);
        break;
      case 'player_ready':
        this.handlePlayerReady(data.playerId);
        break;
      case 'game_start':
        this.handleGameStart(data);
        break;
      case 'game_state':
        this.updateOpponentState(data);
        break;
      case 'garbage_lines':
        this.handleGarbageLines(data.lines);
        break;
      case 'chat_message':
        this.handleChatMessage(data.message);
        break;
      case 'game_over':
        this.handleBattleEnd(data.results);
        break;
    }
  },

  // 更新房间信息
  updateRoomInfo(room) {
    this.setData({
      room,
      currentPlayer: room.players.find(p => p.id === this.playerId)
    });
  },

  // 处理玩家加入
  handlePlayerJoin(player) {
    const { room } = this.data;
    room.players.push(player);
    
    this.setData({ room });
    
    // 显示提示
    wx.showToast({
      title: `${player.nickname} 加入了房间`,
      icon: 'none'
    });
  },

  // 处理玩家离开
  handlePlayerLeave(playerId) {
    const { room } = this.data;
    const index = room.players.findIndex(p => p.id === playerId);
    const player = room.players[index];
    
    room.players.splice(index, 1);
    this.setData({ room });
    
    // 显示提示
    wx.showToast({
      title: `${player.nickname} 离开了房间`,
      icon: 'none'
    });
  },

  // 处理玩家准备
  handlePlayerReady(playerId) {
    const { room } = this.data;
    const player = room.players.find(p => p.id === playerId);
    player.ready = true;
    
    this.setData({ room });
    
    // 检查是否所有玩家都准备好了
    if (room.players.every(p => p.ready)) {
      this.startCountdown();
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({
      showCountdown: true,
      countdownNumber: 3
    });
    
    const countdown = setInterval(() => {
      let number = this.data.countdownNumber - 1;
      
      if (number > 0) {
        this.setData({ countdownNumber: number });
      } else {
        clearInterval(countdown);
        this.setData({
          showCountdown: false,
          countdownNumber: 3
        });
        this.startBattle();
      }
    }, 1000);
  },

  // 开始对战
  startBattle() {
    // 重置游戏状态
    this.resetGame();
    
    // 开始游戏循环
    this.startGameLoop();
    
    // 开始发送游戏状态
    this.startStateSync();
  },

  // 开始状态同步
  startStateSync() {
    this.stateSyncInterval = setInterval(() => {
      if (!this.data.isPaused && !this.data.isGameOver) {
        this.sendGameState();
      }
    }, 50); // 每50ms同步一次
  },

  // 发送游戏状态
  sendGameState() {
    if (!this.socket) return;
    
    const state = {
      type: 'game_state',
      board: this.gameState.board,
      score: this.data.score,
      lines: this.data.statistics.totalLines,
      combo: this.data.combo
    };
    
    this.socket.send({
      data: JSON.stringify(state)
    });
  },

  // 更新对手状态
  updateOpponentState(data) {
    const { playerId, board, score } = data;
    const opponentCanvas = this.opponentCanvases[playerId];
    
    if (opponentCanvas) {
      this.drawOpponentBoard(opponentCanvas, board);
      
      // 更新对手分数
      const player = this.data.room.players.find(p => p.id === playerId);
      if (player) {
        player.score = score;
        this.setData({
          room: { ...this.data.room }
        });
      }
    }
  },

  // 绘制对手游戏板
  drawOpponentBoard(canvas, board) {
    const ctx = canvas.getContext('2d');
    const theme = THEMES[this.data.theme];
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制方块
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x]) {
          const color = theme.blockColors[board[y][x]];
          this.drawOpponentCell(ctx, x, y, color);
        }
      }
    }
  },

  // 绘制对手方块
  drawOpponentCell(ctx, x, y, color) {
    const size = GRID_SIZE * 0.5; // 对手画布的方块大小是主画布的一半
    const padding = 1;
    
    ctx.fillStyle = color;
    ctx.fillRect(
      x * size + padding,
      y * size + padding,
      size - padding * 2,
      size - padding * 2
    );
  },

  // 处理垃圾行
  handleGarbageLines(lines) {
    // 添加垃圾行到底部
    for (let i = 0; i < lines; i++) {
      // 移��顶部一行
      this.gameState.board.shift();
      
      // 添加垃圾行
      const garbageLine = new Array(COLS).fill('garbage');
      const holePosition = Math.floor(Math.random() * COLS);
      garbageLine[holePosition] = 0;
      
      this.gameState.board.push(garbageLine);
    }
    
    // 更新画布
    this.updateCanvas();
    
    // 显示警告
    this.showGarbageWarning(lines);
  },

  // 显示垃圾行警告
  showGarbageWarning(lines) {
    this.setData({
      garbageWarning: {
        visible: true,
        lines
      }
    });
    
    setTimeout(() => {
      this.setData({
        'garbageWarning.visible': false
      });
    }, 1500);
  },

  // 处理聊天消息
  handleChatMessage(message) {
    const { room } = this.data;
    room.chat.push(message);
    
    // 限制聊天记录数量
    if (room.chat.length > ROOM_CONFIG.chatHistory) {
      room.chat.shift();
    }
    
    this.setData({ room });
    
    // ��动到最新消息
    this.scrollToLatestMessage();
  },

  // 发送聊天消息
  sendChatMessage() {
    const { chatInput, currentPlayer } = this.data;
    if (!chatInput.trim()) return;
    
    const message = {
      type: 'chat_message',
      content: chatInput,
      sender: currentPlayer.nickname,
      timestamp: Date.now()
    };
    
    this.socket.send({
      data: JSON.stringify(message)
    });
    
    // 清空输入
    this.setData({ chatInput: '' });
  },

  // 发送快捷消息
  sendQuickMessage(e) {
    const message = e.currentTarget.dataset.message;
    
    this.setData({
      chatInput: message,
      showQuickMessages: false
    });
    
    this.sendChatMessage();
  },

  // 处理对战结束
  handleBattleEnd(results) {
    this.setData({
      showBattleResult: true,
      battleResults: results
    });
    
    // 停止状态同步
    if (this.stateSyncInterval) {
      clearInterval(this.stateSyncInterval);
    }
    
    // 更新统计数据
    this.updateBattleStatistics(results);
  },

  // 更新对战统计
  updateBattleStatistics(results) {
    const myResult = results.find(r => r.id === this.playerId);
    const stats = this.data.statistics;
    
    stats.totalBattles = (stats.totalBattles || 0) + 1;
    if (myResult.rank === 1) {
      stats.battleWins = (stats.battleWins || 0) + 1;
    }
    
    this.setData({ statistics: stats });
    this.saveGameData();
  },

  // 请求重新匹配
  requestRematch() {
    this.socket.send({
      data: JSON.stringify({ type: 'rematch_request' })
    });
    
    this.setData({
      showRematchTimer: true,
      rematchTimeout: 15
    });
    
    // 开始倒计时
    this.startRematchTimer();
  },

  // 开始重新匹配倒计时
  startRematchTimer() {
    const timer = setInterval(() => {
      const timeout = this.data.rematchTimeout - 1;
      
      if (timeout > 0) {
        this.setData({ rematchTimeout: timeout });
      } else {
        clearInterval(timer);
        this.cancelRematch();
      }
    }, 1000);
  },

  // 取消重新匹配
  cancelRematch() {
    this.setData({
      showRematchTimer: false,
      rematchTimeout: 15
    });
    
    this.leaveBattle();
  },

  // 离开对战
  leaveBattle() {
    if (this.socket) {
      this.socket.close();
    }
    
    this.setData({
      showBattleUI: false,
      showBattleResult: false,
      gameMode: 'classic'
    });
    
    // 重置游戏
    this.resetGame();
  },

  // 处理断开连接
  handleDisconnect() {
    wx.showToast({
      title: '连接已断开',
      icon: 'none'
    });
    
    this.leaveBattle();
  },

  // 检查成就
  checkAchievements() {
    const { statistics, score, level } = this.data;
    const achievements = wx.getStorageSync('tetris_achievements') || {};
    let updated = false;
    
    // 检查各项成就
    Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
      if (achievements[key]?.unlocked) return;
      
      let progress = 0;
      let unlocked = false;
      
      // 根据不同成就类型检查条件
      switch (key) {
        case 'first_clear':
          unlocked = statistics.totalLines > 0;
          progress = Math.min(statistics.totalLines, 1) * 100;
          break;
          
        case 'combo_master':
          progress = Math.min(statistics.maxCombo / 5, 1) * 100;
          unlocked = statistics.maxCombo >= 5;
          break;
          
        case 'speed_demon':
          progress = Math.min(statistics.hardDrops / 50, 1) * 100;
          unlocked = statistics.hardDrops >= 50;
          break;
          
        case 'level_10':
          progress = Math.min(level / 10, 1) * 100;
          unlocked = level >= 10;
          break;
          
        case 'score_10000':
          progress = Math.min(score / 10000, 1) * 100;
          unlocked = score >= 10000;
          break;
          
        // ... 检查其他成就
      }
      
      // 更新成就状态
      if (unlocked || progress > (achievements[key]?.progress || 0)) {
        achievements[key] = {
          unlocked,
          progress,
          unlockTime: unlocked ? Date.now() : null
        };
        updated = true;
        
        // 显示成就解锁提示
        if (unlocked && !achievements[key]?.shown) {
          this.showAchievementUnlock(achievement);
          achievements[key].shown = true;
        }
      }
    });
    
    // 保存成就数据
    if (updated) {
      wx.setStorageSync('tetris_achievements', achievements);
      this.updateAchievementStats(achievements);
    }
  },

  // 显示成就解锁提示
  showAchievementUnlock(achievement) {
    this.setData({
      achievementPopup: {
        visible: true,
        title: achievement.title,
        desc: achievement.desc,
        points: achievement.points
      }
    });
    
    // 播放音效
    AudioManager.play('achievement');
    
    // 自动隐藏
    setTimeout(() => {
      this.setData({
        'achievementPopup.visible': false
      });
    }, 3000);
  },

  // 更新成就统计
  updateAchievementStats(achievements) {
    const stats = {
      total: Object.keys(ACHIEVEMENTS).length,
      unlocked: 0,
      points: 0
    };
    
    Object.entries(achievements).forEach(([key, data]) => {
      if (data.unlocked) {
        stats.unlocked++;
        stats.points += ACHIEVEMENTS[key].points;
      }
    });
    
    this.setData({
      'statistics.achievements': stats
    });
  },

  // 更新排行榜
  updateLeaderboard() {
    const { score, statistics, gameMode } = this.data;
    const record = {
      id: `${Date.now()}-${Math.random()}`,
      nickname: wx.getStorageSync('userInfo').nickName || '玩家',
      avatarUrl: wx.getStorageSync('userInfo').avatarUrl,
      score,
      lines: statistics.totalLines,
      time: Date.now() - this.gameState.gameStartTime,
      mode: gameMode,
      date: Date.now()
    };
    
    // 更新各类排行榜
    Object.entries(LEADERBOARD_CATEGORIES).forEach(([category, config]) => {
      this.updateLeaderboardCategory(category, config, record);
    });
  },

  // 更新排行榜分类
  updateLeaderboardCategory(category, config, record) {
    const key = `tetris_leaderboard_${category}`;
    let leaderboard = wx.getStorageSync(key) || [];
    
    // 过滤过期记录
    if (config.timeLimit) {
      const cutoff = Date.now() - config.timeLimit;
      leaderboard = leaderboard.filter(r => r.date > cutoff);
    }
    
    // 添加新记录
    if (this.shouldAddToLeaderboard(record, leaderboard, config)) {
      leaderboard.push(record);
      
      // 排序
      leaderboard.sort((a, b) => {
        const valueA = this.getLeaderboardValue(a, config);
        const valueB = this.getLeaderboardValue(b, config);
        return config.ascending ? valueA - valueB : valueB - valueA;
      });
      
      // 限制记录数量
      if (leaderboard.length > 100) {
        leaderboard.pop();
      }
      
      // 保存排行榜
      wx.setStorageSync(key, leaderboard);
      
      // 检查是否创造新纪录
      const rank = leaderboard.findIndex(r => r.id === record.id) + 1;
      if (rank <= 3) {
        this.showNewRecord(rank);
      }
    }
  },

  // 判断是否应该添加到排行榜
  shouldAddToLeaderboard(record, leaderboard, config) {
    // 模式特定排行榜
    if (config.modes && !config.modes.includes(record.mode)) {
      return false;
    }
    
    // 排行榜未满
    if (leaderboard.length < 100) {
      return true;
    }
    
    // 比较分数
    const value = this.getLeaderboardValue(record, config);
    const worstValue = this.getLeaderboardValue(leaderboard[leaderboard.length - 1], config);
    return config.ascending ? value < worstValue : value > worstValue;
  },

  // 获取排行榜值
  getLeaderboardValue(record, config) {
    switch (config.sortBy) {
      case 'score':
        return record.score;
      case 'lines':
        return record.lines;
      case 'time':
        return record.time;
      case 'points':
        return record.points;
      default:
        return record.score;
    }
  },

  // 显示新纪录提示
  showNewRecord(rank) {
    this.setData({
      newRecord: {
        visible: true,
        rank
      }
    });
    
    // 播放音效
    AudioManager.play('newRecord');
    
    // 自动隐藏
    setTimeout(() => {
      this.setData({
        'newRecord.visible': false
      });
    }, 3000);
  },

  // 获取排行榜数据
  getLeaderboardData(category = 'overall', page = 1, pageSize = 20) {
    const key = `tetris_leaderboard_${category}`;
    const leaderboard = wx.getStorageSync(key) || [];
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      total: leaderboard.length,
      records: leaderboard.slice(start, end),
      myRank: leaderboard.findIndex(r => 
        r.nickname === (wx.getStorageSync('userInfo').nickName || '玩家')
      ) + 1
    };
  },

  // 格式化排行榜值
  formatLeaderboardValue(value, type) {
    switch (type) {
      case 'time':
        return this.formatTime(value);
      case 'score':
        return value.toLocaleString();
      case 'lines':
        return `${value} 行`;
      case 'points':
        return `${value} 分`;
      default:
        return value;
    }
  },

  // 格式化时间
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }
  },

  // 分享排行榜
  shareLeaderboard() {
    return {
      title: '来挑战我的俄罗斯方块记录！',
      imageUrl: this.generateLeaderboardShare(),
      path: '/pages/tetris/tetris?share=leaderboard'
    };
  },

  // 生成排行榜分享图
  generateLeaderboardShare() {
    const canvas = wx.createOffscreenCanvas({
      type: '2d',
      width: 500,
      height: 800
    });
    const ctx = canvas.getContext('2d');
    
    // 绘制背景
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, 500, 800);
    
    // 绘制标题
    ctx.fillStyle = '#2F3542';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('俄罗斯方块排行榜', 250, 60);
    
    // 绘制排行榜数据
    const records = this.getLeaderboardData('overall', 1, 10).records;
    records.forEach((record, index) => {
      const y = 120 + index * 60;
      
      // 绘制排名
      ctx.fillStyle = index < 3 ? '#FFD700' : '#666';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(index + 1, 40, y);
      
      // 绘制玩家信息
      ctx.fillStyle = '#2F3542';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(record.nickname, 80, y);
      
      // 绘制分数
      ctx.textAlign = 'right';
      ctx.fillText(record.score.toLocaleString(), 460, y);
    });
    
    // 绘制二维码
    // ... 这里需要添加小程序码绘制逻辑
    
    return canvas.toDataURL();
  },

  // ... 继续实现其他方法

  // 页面显示
  onShow() {
    // 恢复背景音乐
    if (!this.data.isMuted && !this.data.isGameOver) {
      AudioManager.playBgm();
    }
    
    // 恢复游戏循环
    if (!this.data.isPaused && !this.data.isGameOver) {
      this.startGameLoop();
    }
  },

  // 页面隐藏
  onHide() {
    // 暂停背景音乐
    AudioManager.pauseBgm();
    
    // 暂停游戏循环
    if (this.gameState.animationFrame) {
      cancelAnimationFrame(this.gameState.animationFrame);
    }
    
    // 保存游戏数据
    this.saveGameData();
  },

  // 页面卸载
  onUnload() {
    // 停止所有音频
    AudioManager.stopAll();
    
    // 停止游戏循环
    if (this.gameState.animationFrame) {
      cancelAnimationFrame(this.gameState.animationFrame);
    }
    
    // 关闭Socket连接
    if (this.socket) {
      this.socket.close();
    }
    
    // 保存游戏数据
    this.saveGameData();
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `我在俄罗斯方块中获得了${this.data.score}分，来挑战我吧！`,
      imageUrl: this.generateShareImage(),
      path: '/pages/tetris/tetris'
    };
  },

  // 生成分享图片
  generateShareImage() {
    const canvas = wx.createOffscreenCanvas({
      type: '2d',
      width: 500,
      height: 400
    });
    const ctx = canvas.getContext('2d');
    
    // 绘制背景
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, 500, 400);
    
    // 绘制标题
    ctx.fillStyle = '#2F3542';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('俄罗斯方块', 250, 60);
    
    // 绘制分数
    ctx.font = 'bold 48px Arial';
    ctx.fillText(this.data.score.toLocaleString(), 250, 150);
    
    // 绘制统计信息
    ctx.font = '24px Arial';
    ctx.fillText(`消除行数: ${this.data.statistics.totalLines}`, 250, 220);
    ctx.fillText(`最大连击: ${this.data.statistics.maxCombo}`, 250, 260);
    ctx.fillText(`游戏时长: ${this.formatTime(Date.now() - this.gameState.gameStartTime)}`, 250, 300);
    
    return canvas.toDataURL();
  },

  // 重置游戏
  resetGame() {
    // 重置游戏状态
    this.gameState = {
      board: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
      currentBlock: this.generateBlock(),
      nextBlock: this.generateBlock(),
      holdBlock: null,
      hasHeld: false,
      dropInterval: GAME_CONFIG.SPEED.INITIAL,
      lastDropTime: Date.now(),
      gameStartTime: Date.now(),
      lastMoveTime: Date.now()
    };
    
    // 重置数据
    this.setData({
      score: 0,
      level: 1,
      lines: 0,
      combo: 0,
      isGameOver: false,
      isPaused: false
    });
    
    // 重新开始游戏循环
    this.startGameLoop();
    
    // 重新开始录像
    this.replayManager.startRecording(this.data.gameMode);
    
    // 播放音乐
    if (!this.data.isMuted) {
      AudioManager.playBgm();
    }
  },

  // 暂停游戏
  pauseGame() {
    if (this.data.isGameOver) return;
    
    this.setData({ isPaused: true });
    AudioManager.pauseBgm();
    
    if (this.gameState.animationFrame) {
      cancelAnimationFrame(this.gameState.animationFrame);
    }
  },

  // 继续游戏
  resumeGame() {
    if (this.data.isGameOver) return;
    
    this.setData({ isPaused: false });
    
    if (!this.data.isMuted) {
      AudioManager.resumeBgm();
    }
    
    this.gameState.lastDropTime = Date.now();
    this.startGameLoop();
  },

  // 切换音效
  toggleSound() {
    const isMuted = !this.data.isMuted;
    this.setData({ isMuted });
    
    if (isMuted) {
      AudioManager.stopAll();
    } else if (!this.data.isPaused && !this.data.isGameOver) {
      AudioManager.playBgm();
    }
    
    wx.setStorageSync('tetris_muted', isMuted);
  },

  // 更新游戏时间
  updatePlayTime() {
    const playTime = Date.now() - this.gameState.gameStartTime;
    this.setData({
      'statistics.playTime': playTime
    });
    
    // 检查限时模式
    if (this.data.gameMode === 'timeAttack' && 
        playTime >= GAME_MODES.timeAttack.duration * 1000) {
      this.gameOver();
    }
  },

  // 升级处理
  levelUp(newLevel) {
    this.setData({ level: newLevel });
    
    // 更新下落速度
    this.gameState.dropInterval = Math.max(
      GAME_CONFIG.SPEED.INITIAL - (newLevel - 1) * GAME_CONFIG.SPEED.DECREASE,
      GAME_CONFIG.SPEED.MIN
    );
    
    // 显示升级特效
    this.showLevelUpEffect(newLevel);
    
    // 播放音效
    AudioManager.play('levelUp');
    
    // 检查成就
    this.checkAchievements();
  },

  // 检查T-Spin
  checkTSpin(block) {
    if (block.type !== 'T') return false;
    
    // 检查T块四个角是否被占用
    const corners = [
      [-1, -1], [1, -1],
      [-1, 1], [1, 1]
    ];
    
    let cornerCount = 0;
    corners.forEach(([dx, dy]) => {
      const x = block.x + dx;
      const y = block.y + dy;
      
      if (x < 0 || x >= COLS || 
          y < 0 || y >= ROWS ||
          this.gameState.board[y][x]) {
        cornerCount++;
      }
    });
    
    return cornerCount >= 3 && this.gameState.lastMove === 'rotate';
  },

  // 获取游戏状态
  getGameState() {
    return {
      board: this.gameState.board,
      currentBlock: this.gameState.currentBlock,
      nextBlock: this.gameState.nextBlock,
      holdBlock: this.gameState.holdBlock,
      score: this.data.score,
      level: this.data.level,
      lines: this.data.lines,
      combo: this.data.combo
    };
  },

  // 处理键盘事件（用于PC端调试）
  handleKeyboard(e) {
    if (this.data.isPaused || this.data.isGameOver) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        this.moveBlock('left');
        break;
      case 'ArrowRight':
        this.moveBlock('right');
        break;
      case 'ArrowDown':
        this.moveBlock('down');
        break;
      case 'ArrowUp':
        this.rotateBlock();
        break;
      case ' ':
        this.hardDrop();
        break;
      case 'c':
      case 'C':
        this.holdBlock();
        break;
      case 'p':
      case 'P':
        if (this.data.isPaused) {
          this.resumeGame();
        } else {
          this.pauseGame();
        }
        break;
    }
  }
}); 