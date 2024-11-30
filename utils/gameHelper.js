import { GAME_CONFIG, TETROMINOES } from '../config/gameConfig';

// 游戏辅助工具类
class GameHelper {
  // 检查碰撞
  static checkCollision(board, block, offsetX = 0, offsetY = 0) {
    const { shape } = block;
    const blockX = block.x + offsetX;
    const blockY = block.y + offsetY;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = blockX + x;
          const boardY = blockY + y;
          
          // 检查边界
          if (boardX < 0 || 
              boardX >= GAME_CONFIG.GRID.COLS || 
              boardY >= GAME_CONFIG.GRID.ROWS) {
            return true;
          }
          
          // 检查其他方块
          if (boardY >= 0 && board[boardY][boardX]) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  // 旋转方块
  static rotateBlock(block, direction = 1) {
    const { shape, center } = block;
    const newShape = [];
    
    // 创建新的形状矩阵
    for (let i = 0; i < shape[0].length; i++) {
      newShape[i] = [];
      for (let j = 0; j < shape.length; j++) {
        newShape[i][direction > 0 ? shape.length - 1 - j : j] = shape[j][i];
      }
    }
    
    return {
      ...block,
      shape: newShape
    };
  }
  
  // 获取硬降位置
  static getHardDropPosition(board, block) {
    let dropDistance = 0;
    while (!this.checkCollision(board, block, 0, dropDistance + 1)) {
      dropDistance++;
    }
    return dropDistance;
  }
  
  // 获取幽灵方块位置
  static getGhostPosition(board, block) {
    const dropDistance = this.getHardDropPosition(board, block);
    return {
      ...block,
      y: block.y + dropDistance,
      isGhost: true
    };
  }
  
  // 清除已完成的行
  static clearLines(board) {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    // 在顶部添加新行
    while (newBoard.length < GAME_CONFIG.GRID.ROWS) {
      newBoard.unshift(new Array(GAME_CONFIG.GRID.COLS).fill(0));
    }
    
    return {
      board: newBoard,
      linesCleared
    };
  }
  
  // 计算分数
  static calculateScore(linesCleared, level, combo = 0) {
    let score = 0;
    
    switch (linesCleared) {
      case 1:
        score = GAME_CONFIG.SCORE.SINGLE;
        break;
      case 2:
        score = GAME_CONFIG.SCORE.DOUBLE;
        break;
      case 3:
        score = GAME_CONFIG.SCORE.TRIPLE;
        break;
      case 4:
        score = GAME_CONFIG.SCORE.TETRIS;
        break;
    }
    
    // 应用等级倍数
    score *= level;
    
    // 应用连击奖励
    if (combo > 1) {
      score += GAME_CONFIG.SCORE.COMBO_BONUS * (combo - 1);
    }
    
    return score;
  }
  
  // 计算等级
  static calculateLevel(lines) {
    return Math.floor(lines / GAME_CONFIG.LEVEL.LINES_PER_LEVEL) + 1;
  }
  
  // 计算下落速度
  static calculateDropInterval(level) {
    const interval = GAME_CONFIG.SPEED.INITIAL - 
                    (level - 1) * GAME_CONFIG.SPEED.DECREASE;
    return Math.max(interval, GAME_CONFIG.SPEED.MIN);
  }
  
  // 生成随机方块
  static generateRandomBlock() {
    const types = Object.keys(TETROMINOES);
    const type = types[Math.floor(Math.random() * types.length)];
    const tetromino = TETROMINOES[type];
    
    return {
      type,
      shape: tetromino.shape,
      color: tetromino.color,
      center: tetromino.center,
      x: Math.floor((GAME_CONFIG.GRID.COLS - tetromino.shape[0].length) / 2),
      y: 0
    };
  }
  
  // 生成垃圾行
  static generateGarbageLines(count, holes = 1) {
    const lines = [];
    for (let i = 0; i < count; i++) {
      const line = new Array(GAME_CONFIG.GRID.COLS).fill(8); // 8表示垃圾块
      // 随机生成空洞
      for (let j = 0; j < holes; j++) {
        const hole = Math.floor(Math.random() * GAME_CONFIG.GRID.COLS);
        line[hole] = 0;
      }
      lines.push(line);
    }
    return lines;
  }
  
  // 检查游戏结束
  static checkGameOver(board) {
    // 检查顶部两行是否有方块
    return board[0].some(cell => cell !== 0) || 
           board[1].some(cell => cell !== 0);
  }
  
  // 创建新游戏板
  static createEmptyBoard() {
    return Array(GAME_CONFIG.GRID.ROWS)
      .fill()
      .map(() => Array(GAME_CONFIG.GRID.COLS).fill(0));
  }
  
  // 锁定方块到游戏板
  static lockBlock(board, block) {
    const newBoard = board.map(row => [...row]);
    const { shape, x, y, type } = block;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] && y + row >= 0) {
          newBoard[y + row][x + col] = type;
        }
      }
    }
    
    return newBoard;
  }
  
  // 检查是否完美清除
  static isPerfectClear(board) {
    return board.every(row => row.every(cell => cell === 0));
  }
  
  // 检查T-Spin
  static checkTSpin(board, block, lastMove) {
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
      
      if (x < 0 || x >= GAME_CONFIG.GRID.COLS || 
          y < 0 || y >= GAME_CONFIG.GRID.ROWS ||
          board[y][x]) {
        cornerCount++;
      }
    });
    
    return cornerCount >= 3 && lastMove === 'rotate';
  }
}

export default GameHelper; 