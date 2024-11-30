export const GAME_CONFIG = {
  // 游戏区域大小
  GRID: {
    COLS: 10,
    ROWS: 20,
    SIZE: 20 // 每个格子的大小(px)
  },
  
  // 游戏速度配置
  SPEED: {
    INITIAL: 1000, // 初始下落间隔(ms)
    MIN: 100,      // 最小下落间隔
    DECREASE: 50,  // 每级减少的间隔
    SOFT_DROP: 50, // 加速下落时的间隔
    LOCK_DELAY: 500 // 方块着地后的锁定延迟
  },
  
  // 分数配置
  SCORE: {
    SOFT_DROP: 1,      // 加速下落每格得分
    HARD_DROP: 2,      // 硬降每格得分
    SINGLE: 100,       // 消除一行
    DOUBLE: 300,       // 消除两行
    TRIPLE: 500,       // 消除三行
    TETRIS: 800,       // 消除四行
    PERFECT_CLEAR: 1000, // 完美清除
    COMBO_BONUS: 50,   // 连击奖励
    T_SPIN: 400        // T旋转奖励
  },
  
  // 等级配置
  LEVEL: {
    LINES_PER_LEVEL: 10, // 每级需要消除的行数
    MAX_LEVEL: 20,       // 最高等级
    INITIAL: 1           // 初始等级
  },
  
  // 预览配置
  PREVIEW: {
    COUNT: 3,  // 预览数量
    SIZE: 80   // 预览区域大小(px)
  },
  
  // 操作配置
  CONTROLS: {
    DAS: 133,      // 自动重复延迟(ms)
    ARR: 33,       // 自动重复速率(ms)
    SENSITIVITY: 30 // 滑动灵敏度(px)
  },
  
  // 音效配置
  SOUND: {
    BGM_VOLUME: 0.5,
    SFX_VOLUME: 0.8,
    EFFECTS: {
      MOVE: 'move.mp3',
      ROTATE: 'rotate.mp3',
      DROP: 'drop.mp3',
      CLEAR: 'clear.mp3',
      COMBO: 'combo.mp3',
      LEVEL_UP: 'level_up.mp3',
      GAME_OVER: 'game_over.mp3'
    }
  },
  
  // 主题配置
  THEMES: {
    DEFAULT: 'classic',
    AVAILABLE: ['classic', 'dark', 'neon'],
    COLORS: {
      classic: {
        background: '#F8F9FA',
        grid: '#E9ECEF',
        blocks: {
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
        background: '#2F3542',
        grid: '#57606F',
        blocks: {
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
        background: '#000000',
        grid: '#2C3A47',
        blocks: {
          I: '#18FFFF',
          O: '#FFFF00',
          T: '#FF00FF',
          L: '#FFA000',
          J: '#00FF00',
          S: '#00FFFF',
          Z: '#FF0000'
        }
      }
    }
  },
  
  // 游戏模式配置
  MODES: {
    classic: {
      name: '经典模式',
      desc: '无尽模式，速度逐渐加快',
      icon: '🎮'
    },
    sprint: {
      name: '冲刺模式',
      desc: '20行最快时间',
      icon: '⚡',
      targetLines: 20
    },
    marathon: {
      name: '马拉松模式',
      desc: '坚持到150行',
      icon: '🏃',
      targetLines: 150
    },
    ultra: {
      name: '限时模式',
      desc: '2分钟内获得最高分',
      icon: '⏱️',
      duration: 120
    },
    master: {
      name: '大师模式',
      desc: '20G模式，极速下落',
      icon: '👑',
      gravity: 20
    }
  },
  
  // 成就配置
  ACHIEVEMENTS: {
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
    // ... 更多成就
  },
  
  // 联机对战配置
  BATTLE: {
    MAX_PLAYERS: 4,
    READY_TIMEOUT: 30000,
    START_DELAY: 3000,
    REMATCH_TIMEOUT: 15000,
    GARBAGE_MULTIPLIER: 1,
    CHAT_HISTORY: 50,
    QUICK_MESSAGES: [
      '加油！',
      '好厉害！',
      '再来一局！',
      '等等我~',
      '玩得不错！'
    ]
  },
  
  // 数据存储键名
  STORAGE_KEYS: {
    HIGH_SCORE: 'tetris_high_score',
    SETTINGS: 'tetris_settings',
    ACHIEVEMENTS: 'tetris_achievements',
    REPLAYS: 'tetris_replays',
    CUSTOM_THEMES: 'tetris_custom_themes',
    GAME_RECORDS: 'tetris_game_records',
    PLAYER_STATS: 'tetris_player_stats'
  }
};

// 方块形状定义
export const TETROMINOES = {
  I: {
    shape: [[1,1,1,1]],
    center: [0,1],
    color: GAME_CONFIG.THEMES.COLORS.classic.blocks.I
  },
  O: {
    shape: [[1,1],[1,1]],
    center: [0.5,0.5],
    color: GAME_CONFIG.THEMES.COLORS.classic.blocks.O
  },
  T: {
    shape: [[0,1,0],[1,1,1]],
    center: [1,1],
    color: GAME_CONFIG.THEMES.COLORS.classic.blocks.T
  },
  L: {
    shape: [[1,0],[1,0],[1,1]],
    center: [1,0],
    color: GAME_CONFIG.THEMES.COLORS.classic.blocks.L
  },
  J: {
    shape: [[0,1],[0,1],[1,1]],
    center: [1,0],
    color: GAME_CONFIG.THEMES.COLORS.classic.blocks.J
  },
  S: {
    shape: [[0,1,1],[1,1,0]],
    center: [1,1],
    color: GAME_CONFIG.THEMES.COLORS.classic.blocks.S
  },
  Z: {
    shape: [[1,1,0],[0,1,1]],
    center: [1,1],
    color: GAME_CONFIG.THEMES.COLORS.classic.blocks.Z
  }
};

// 默认游戏设置
export const DEFAULT_SETTINGS = {
  theme: GAME_CONFIG.THEMES.DEFAULT,
  isMuted: false,
  bgmVolume: GAME_CONFIG.SOUND.BGM_VOLUME,
  sfxVolume: GAME_CONFIG.SOUND.SFX_VOLUME,
  ghostPiece: true,
  gridLines: true,
  holdEnabled: true,
  nextCount: GAME_CONFIG.PREVIEW.COUNT,
  das: GAME_CONFIG.CONTROLS.DAS,
  arr: GAME_CONFIG.CONTROLS.ARR,
  sensitivity: GAME_CONFIG.CONTROLS.SENSITIVITY
};

export default {
  GAME_CONFIG,
  TETROMINOES,
  DEFAULT_SETTINGS
}; 