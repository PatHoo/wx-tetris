import { GAME_CONFIG, BLOCK_TYPES } from '../config/gameConfig';

class GameHelper {
  // 生成新方块
  static generateBlock() {
    const types = Object.keys(BLOCK_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const blockData = BLOCK_TYPES[type];
    
    return {
      type,
      shape: blockData.shape.map(row => [...row]),
      color: blockData.color,
      x: 3,
      y: 0
    };
  }

  // 检查碰撞
  static checkCollision(board, block, offsetX = 0, offsetY = 0) {
    const { shape, x, y } = block;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col + offsetX;
          const newY = y + row + offsetY;
          
          if (newX < 0 || newX >= GAME_CONFIG.GRID.COLS || newY >= GAME_CONFIG.GRID.ROWS) {
            return true;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // 旋转方块
  static rotateBlock(block) {
    const { shape } = block;
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
  }

  // 清除完整的行
  static clearLines(board) {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    while (newBoard.length < GAME_CONFIG.GRID.ROWS) {
      newBoard.unshift(Array(GAME_CONFIG.GRID.COLS).fill(0));
    }
    
    return {
      board: newBoard,
      linesCleared
    };
  }
}

export default GameHelper; 