import GameHelper from './gameHelper';
import { GAME_CONFIG } from '../config/gameConfig';
import AudioManager from './audioManager';

class GameStateManager {
  constructor() {
    this.state = {
      gameBoard: null,
      currentBlock: null,
      nextBlock: null,
      holdBlock: null,
      hasHeld: false,
      score: 0,
      level: 1,
      lines: 0,
      combo: 0,
      isGameOver: false,
      isPaused: false,
      gameMode: 'classic',
      lastMove: null,
      dropInterval: GAME_CONFIG.SPEED.INITIAL,
      statistics: {
        totalPieces: 0,
        totalLines: 0,
        maxCombo: 0,
        pieceStats: {
          I: 0, O: 0, T: 0,
          L: 0, J: 0, S: 0, Z: 0
        }
      }
    };
    
    this.gameLoop = null;
    this.lastDropTime = 0;
  }
  
  // 初始化游戏
  initGame(mode = 'classic') {
    this.state = {
      ...this.state,
      gameBoard: GameHelper.createEmptyBoard(),
      currentBlock: GameHelper.generateRandomBlock(),
      nextBlock: GameHelper.generateRandomBlock(),
      holdBlock: null,
      hasHeld: false,
      score: 0,
      level: 1,
      lines: 0,
      combo: 0,
      isGameOver: false,
      isPaused: false,
      gameMode: mode,
      lastMove: null,
      dropInterval: GAME_CONFIG.SPEED.INITIAL
    };
    
    this.startGameLoop();
  }
  
  // 游戏循环
  startGameLoop() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    
    const loop = (timestamp) => {
      if (!this.state.isPaused && !this.state.isGameOver) {
        if (timestamp - this.lastDropTime > this.state.dropInterval) {
          this.moveDown();
          this.lastDropTime = timestamp;
        }
      }
      this.gameLoop = requestAnimationFrame(loop);
    };
    
    this.gameLoop = requestAnimationFrame(loop);
  }
  
  // 暂停游戏
  togglePause() {
    this.state.isPaused = !this.state.isPaused;
    if (this.state.isPaused) {
      AudioManager.pauseBgm();
    } else {
      AudioManager.resumeBgm();
    }
  }
  
  // 移动方块
  moveBlock(direction) {
    if (this.state.isPaused || this.state.isGameOver) return false;
    
    const { currentBlock, gameBoard } = this.state;
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
    
    if (!GameHelper.checkCollision(gameBoard, currentBlock, offsetX, offsetY)) {
      this.state.currentBlock.x += offsetX;
      this.state.currentBlock.y += offsetY;
      this.state.lastMove = direction;
      
      if (direction !== 'down') {
        AudioManager.play('move');
      }
      return true;
    }
    
    return false;
  }
  
  // 旋转方块
  rotateBlock(direction = 1) {
    if (this.state.isPaused || this.state.isGameOver) return false;
    
    const { currentBlock, gameBoard } = this.state;
    const rotatedBlock = GameHelper.rotateBlock(currentBlock, direction);
    
    if (!GameHelper.checkCollision(gameBoard, rotatedBlock)) {
      this.state.currentBlock = rotatedBlock;
      this.state.lastMove = 'rotate';
      AudioManager.play('rotate');
      return true;
    }
    
    return false;
  }
  
  // 硬降
  hardDrop() {
    if (this.state.isPaused || this.state.isGameOver) return;
    
    const dropDistance = GameHelper.getHardDropPosition(
      this.state.gameBoard, 
      this.state.currentBlock
    );
    
    this.state.score += dropDistance * GAME_CONFIG.SCORE.HARD_DROP;
    this.state.currentBlock.y += dropDistance;
    this.lockBlock();
    AudioManager.play('drop');
  }
  
  // 锁定方块
  lockBlock() {
    const { currentBlock, gameBoard } = this.state;
    
    // 更新游戏板
    this.state.gameBoard = GameHelper.lockBlock(gameBoard, currentBlock);
    
    // 更新统计
    this.state.statistics.totalPieces++;
    this.state.statistics.pieceStats[currentBlock.type]++;
    
    // 检查T-Spin
    if (GameHelper.checkTSpin(gameBoard, currentBlock, this.state.lastMove)) {
      this.state.score += GAME_CONFIG.SCORE.T_SPIN;
    }
    
    // 清除行
    const { board: newBoard, linesCleared } = GameHelper.clearLines(this.state.gameBoard);
    this.state.gameBoard = newBoard;
    
    if (linesCleared > 0) {
      // 更新统计
      this.state.lines += linesCleared;
      this.state.statistics.totalLines += linesCleared;
      this.state.combo++;
      
      if (this.state.combo > this.state.statistics.maxCombo) {
        this.state.statistics.maxCombo = this.state.combo;
      }
      
      // 计算分数
      const score = GameHelper.calculateScore(
        linesCleared, 
        this.state.level, 
        this.state.combo
      );
      this.state.score += score;
      
      // 检查完美清除
      if (GameHelper.isPerfectClear(newBoard)) {
        this.state.score += GAME_CONFIG.SCORE.PERFECT_CLEAR;
      }
      
      // 更新等级
      const newLevel = GameHelper.calculateLevel(this.state.lines);
      if (newLevel > this.state.level) {
        this.levelUp(newLevel);
      }
      
      AudioManager.play('clear');
      if (this.state.combo > 1) {
        AudioManager.play('combo');
      }
    } else {
      this.state.combo = 0;
    }
    
    // 生成新方块
    this.state.currentBlock = this.state.nextBlock;
    this.state.nextBlock = GameHelper.generateRandomBlock();
    this.state.hasHeld = false;
    
    // 检查游戏结束
    if (GameHelper.checkGameOver(this.state.gameBoard)) {
      this.gameOver();
    }
  }
  
  // 等级提升
  levelUp(newLevel) {
    this.state.level = newLevel;
    this.state.dropInterval = GameHelper.calculateDropInterval(newLevel);
    AudioManager.play('levelUp');
  }
  
  // 游戏结束
  gameOver() {
    this.state.isGameOver = true;
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    AudioManager.play('gameOver');
    AudioManager.stopBgm();
  }
  
  // Hold功能
  holdBlock() {
    if (this.state.hasHeld || this.state.isPaused || this.state.isGameOver) return;
    
    if (!this.state.holdBlock) {
      this.state.holdBlock = this.state.currentBlock;
      this.state.currentBlock = this.state.nextBlock;
      this.state.nextBlock = GameHelper.generateRandomBlock();
    } else {
      const temp = this.state.currentBlock;
      this.state.currentBlock = this.state.holdBlock;
      this.state.holdBlock = temp;
      
      // 重置位置
      this.state.currentBlock.x = Math.floor(
        (GAME_CONFIG.GRID.COLS - this.state.currentBlock.shape[0].length) / 2
      );
      this.state.currentBlock.y = 0;
    }
    
    this.state.hasHeld = true;
    AudioManager.play('move');
  }
  
  // 获取游戏状态
  getState() {
    return { ...this.state };
  }
  
  // 清理资源
  destroy() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
  }
}

export default GameStateManager; 