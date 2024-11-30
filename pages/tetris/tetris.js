import GameHelper from '../../utils/gameHelper';
import { GAME_CONFIG } from '../../config/gameConfig';

Page({
  data: {
    board: null,
    currentBlock: null,
    nextBlock: null,
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    isGameOver: false,
    isPaused: false,
    playTimeText: '00:00'
  },

  // 游戏状态
  gameState: {
    lastDropTime: 0,
    gameStartTime: 0,
    dropInterval: GAME_CONFIG.SPEED.INITIAL,
    animationTimer: null
  },

  onLoad() {
    this.initGame();
  },

  // 初始化游戏
  initGame() {
    // 初始化游戏状态
    const board = Array(GAME_CONFIG.GRID.ROWS).fill().map(() => Array(GAME_CONFIG.GRID.COLS).fill(0));
    const currentBlock = GameHelper.generateBlock();
    const nextBlock = GameHelper.generateBlock();

    this.setData({
      board,
      currentBlock,
      nextBlock,
      score: 0,
      level: 1,
      lines: 0,
      combo: 0,
      isGameOver: false,
      isPaused: false
    });

    this.gameState.gameStartTime = Date.now();
    this.gameState.lastDropTime = Date.now();
    this.gameState.dropInterval = GAME_CONFIG.SPEED.INITIAL;

    // 开始游戏循环
    this.startGameLoop();
  },

  // 游戏循环
  startGameLoop() {
    const loop = () => {
      if (!this.data.isPaused && !this.data.isGameOver) {
        const now = Date.now();
        
        // 自动下落
        if (now - this.gameState.lastDropTime > this.gameState.dropInterval) {
          if (!this.moveBlock('down')) {
            this.lockBlock();
          }
          this.gameState.lastDropTime = now;
        }
        
        // 更新游戏时间
        const playTime = Math.floor((now - this.gameState.gameStartTime) / 1000);
        this.setData({
          playTimeText: this.formatTime(playTime)
        });
      }
      
      this.gameState.animationTimer = setTimeout(loop, 16);
    };
    
    loop();
  },

  // 格式化时间
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // 移动方块
  moveBlock(direction) {
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

    const { board, currentBlock } = this.data;
    if (!GameHelper.checkCollision(board, currentBlock, offsetX, offsetY)) {
      currentBlock.x += offsetX;
      currentBlock.y += offsetY;
      this.setData({ currentBlock });
      return true;
    }
    return false;
  },

  // 锁定方块
  lockBlock() {
    const { board, currentBlock, nextBlock, score, lines, combo } = this.data;
    const { shape, x, y, type } = currentBlock;

    // 将当前方块添加到游戏板
    const newBoard = board.map(row => [...row]);
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] && y + row >= 0) {
          newBoard[y + row][x + col] = type;
        }
      }
    }

    // 检查并清除完整的行
    const { board: clearedBoard, linesCleared } = GameHelper.clearLines(newBoard);
    const newCombo = linesCleared > 0 ? combo + 1 : 0;
    const newScore = score + linesCleared * 100 * (newCombo > 1 ? newCombo : 1);
    const newLines = lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;

    // 生成新方块
    const newCurrentBlock = nextBlock;
    const newNextBlock = GameHelper.generateBlock();

    // 检查游戏结束
    if (GameHelper.checkCollision(clearedBoard, newCurrentBlock)) {
      this.setData({ isGameOver: true });
      return;
    }

    // 更新界面
    this.setData({
      board: clearedBoard,
      currentBlock: newCurrentBlock,
      nextBlock: newNextBlock,
      score: newScore,
      lines: newLines,
      level: newLevel,
      combo: newCombo
    });

    // 更新游戏速度
    this.gameState.dropInterval = Math.max(
      GAME_CONFIG.SPEED.MIN,
      GAME_CONFIG.SPEED.INITIAL - (newLevel - 1) * GAME_CONFIG.SPEED.DECREASE
    );
  },

  // 旋转方块
  onRotate() {
    const { board, currentBlock } = this.data;
    const rotatedBlock = GameHelper.rotateBlock(currentBlock);
    if (!GameHelper.checkCollision(board, rotatedBlock)) {
      this.setData({ currentBlock: rotatedBlock });
    }
  },

  // 暂停游戏
  onPause() {
    this.setData({ isPaused: true });
  },

  // 继续游戏
  onResume() {
    this.setData({ isPaused: false });
  },

  // 重新开始
  onRestart() {
    this.initGame();
  },

  // 移动相关事件处理
  onMoveLeft() {
    this.moveBlock('left');
  },

  onMoveRight() {
    this.moveBlock('right');
  },

  onMoveDown() {
    this.moveBlock('down');
  }
}); 