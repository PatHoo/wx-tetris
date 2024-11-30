import { GAME_CONFIG } from '../config/gameConfig';

class AnalyticsHelper {
  // 计算基础统计数据
  static calculateBasicStats(records) {
    if (!records || records.length === 0) return null;
    
    return {
      totalGames: records.length,
      totalScore: records.reduce((sum, r) => sum + r.score, 0),
      averageScore: Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length),
      highestScore: Math.max(...records.map(r => r.score)),
      totalLines: records.reduce((sum, r) => sum + r.lines, 0),
      averageLines: Math.round(records.reduce((sum, r) => sum + r.lines, 0) / records.length),
      maxLevel: Math.max(...records.map(r => r.level)),
      totalPlayTime: records.reduce((sum, r) => sum + r.duration, 0),
      averagePlayTime: Math.round(records.reduce((sum, r) => sum + r.duration, 0) / records.length)
    };
  }
  
  // 计算趋势数据
  static calculateTrends(records, timeRange = 'week') {
    if (!records || records.length === 0) return null;
    
    // 按日期分组
    const groupedData = this.groupRecordsByDate(records, timeRange);
    
    // 计算每日平均值
    const trends = Object.entries(groupedData).map(([date, dayRecords]) => ({
      date,
      score: Math.round(dayRecords.reduce((sum, r) => sum + r.score, 0) / dayRecords.length),
      lines: Math.round(dayRecords.reduce((sum, r) => sum + r.lines, 0) / dayRecords.length),
      level: Math.round(dayRecords.reduce((sum, r) => sum + r.level, 0) / dayRecords.length),
      duration: Math.round(dayRecords.reduce((sum, r) => sum + r.duration, 0) / dayRecords.length)
    }));
    
    // 计算变化率
    const changes = {
      score: this.calculateChangeRate(trends.map(t => t.score)),
      lines: this.calculateChangeRate(trends.map(t => t.lines)),
      level: this.calculateChangeRate(trends.map(t => t.level)),
      duration: this.calculateChangeRate(trends.map(t => t.duration))
    };
    
    return { trends, changes };
  }
  
  // 按日期分组
  static groupRecordsByDate(records, timeRange) {
    const groups = {};
    const now = new Date();
    let cutoff;
    
    switch (timeRange) {
      case 'day':
        cutoff = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = new Date(0);
    }
    
    records
      .filter(r => new Date(r.date) > cutoff)
      .forEach(record => {
        const date = new Date(record.date).toISOString().split('T')[0];
        if (!groups[date]) groups[date] = [];
        groups[date].push(record);
      });
    
    return groups;
  }
  
  // 计算变化率
  static calculateChangeRate(values) {
    if (values.length < 2) return 0;
    
    const current = values[values.length - 1];
    const previous = values[values.length - 2];
    
    return previous === 0 ? 0 : Math.round((current - previous) / previous * 100);
  }
  
  // 分析方块使用情况
  static analyzePieceUsage(records) {
    if (!records || records.length === 0) return null;
    
    const totalPieces = records.reduce((sum, r) => {
      const stats = r.statistics.pieceStats;
      return sum + Object.values(stats).reduce((a, b) => a + b, 0);
    }, 0);
    
    const pieceStats = {};
    Object.keys(GAME_CONFIG.TETROMINOES).forEach(type => {
      pieceStats[type] = records.reduce((sum, r) => sum + r.statistics.pieceStats[type], 0);
    });
    
    // 计算使用比例
    Object.keys(pieceStats).forEach(type => {
      pieceStats[type] = {
        count: pieceStats[type],
        percentage: Math.round(pieceStats[type] / totalPieces * 100)
      };
    });
    
    return pieceStats;
  }
  
  // 分析消行模式
  static analyzeClearPatterns(records) {
    if (!records || records.length === 0) return null;
    
    const patterns = {
      single: 0,
      double: 0,
      triple: 0,
      tetris: 0,
      tSpin: 0,
      perfectClear: 0
    };
    
    records.forEach(record => {
      patterns.single += record.statistics.clearCounts?.single || 0;
      patterns.double += record.statistics.clearCounts?.double || 0;
      patterns.triple += record.statistics.clearCounts?.triple || 0;
      patterns.tetris += record.statistics.clearCounts?.tetris || 0;
      patterns.tSpin += record.statistics.clearCounts?.tSpin || 0;
      patterns.perfectClear += record.statistics.clearCounts?.perfectClear || 0;
    });
    
    return patterns;
  }
  
  // 分析游戏时长分布
  static analyzeDurationDistribution(records) {
    if (!records || records.length === 0) return null;
    
    const durations = records.map(r => Math.floor(r.duration / 60000)); // 转换为分钟
    const distribution = {
      '<1min': 0,
      '1-3min': 0,
      '3-5min': 0,
      '5-10min': 0,
      '10-20min': 0,
      '>20min': 0
    };
    
    durations.forEach(duration => {
      if (duration < 1) distribution['<1min']++;
      else if (duration < 3) distribution['1-3min']++;
      else if (duration < 5) distribution['3-5min']++;
      else if (duration < 10) distribution['5-10min']++;
      else if (duration < 20) distribution['10-20min']++;
      else distribution['>20min']++;
    });
    
    return distribution;
  }
  
  // 分析最佳表现
  static analyzeBestPerformances(records) {
    if (!records || records.length === 0) return null;
    
    return {
      highestScore: {
        value: Math.max(...records.map(r => r.score)),
        date: records.find(r => r.score === Math.max(...records.map(r => r.score))).date
      },
      mostLines: {
        value: Math.max(...records.map(r => r.lines)),
        date: records.find(r => r.lines === Math.max(...records.map(r => r.lines))).date
      },
      highestLevel: {
        value: Math.max(...records.map(r => r.level)),
        date: records.find(r => r.level === Math.max(...records.map(r => r.level))).date
      },
      longestGame: {
        value: Math.max(...records.map(r => r.duration)),
        date: records.find(r => r.duration === Math.max(...records.map(r => r.duration))).date
      },
      maxCombo: {
        value: Math.max(...records.map(r => r.statistics.maxCombo)),
        date: records.find(r => r.statistics.maxCombo === Math.max(...records.map(r => r.statistics.maxCombo))).date
      }
    };
  }
  
  // 分析游戏模式统计
  static analyzeGameModes(records) {
    if (!records || records.length === 0) return null;
    
    const modes = {};
    records.forEach(record => {
      if (!modes[record.gameMode]) {
        modes[record.gameMode] = {
          count: 0,
          totalScore: 0,
          totalLines: 0,
          bestScore: 0,
          averageScore: 0
        };
      }
      
      modes[record.gameMode].count++;
      modes[record.gameMode].totalScore += record.score;
      modes[record.gameMode].totalLines += record.lines;
      modes[record.gameMode].bestScore = Math.max(modes[record.gameMode].bestScore, record.score);
    });
    
    // 计算平均分
    Object.values(modes).forEach(mode => {
      mode.averageScore = Math.round(mode.totalScore / mode.count);
    });
    
    return modes;
  }
}

export default AnalyticsHelper; 