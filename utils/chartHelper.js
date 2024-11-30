class ChartHelper {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.padding = 40;
    
    // 图表配色方案
    this.colors = {
      primary: '#2ED573',
      secondary: '#5352ED',
      accent: '#FF6B81',
      neutral: '#A4B0BE',
      background: '#F8F9FA',
      grid: '#E9ECEF',
      text: '#2F3542'
    };
  }
  
  // 绘制折线图
  drawLineChart(data, options = {}) {
    const {
      title = '',
      xLabel = '',
      yLabel = '',
      showDots = true,
      smooth = true,
      fillArea = true,
      color = this.colors.primary
    } = options;
    
    // 清空画布
    this.clear();
    
    // 计算数据范围
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    // 计算比例
    const xScale = (this.width - this.padding * 2) / (data.length - 1);
    const yScale = (this.height - this.padding * 2) / (maxY - minY);
    
    // 绘制坐标轴和网格
    this.drawAxes(minY, maxY, xValues);
    
    // 绘制标题和标签
    if (title) this.drawTitle(title);
    if (xLabel) this.drawXLabel(xLabel);
    if (yLabel) this.drawYLabel(yLabel);
    
    // 绘制数据线
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    
    data.forEach((point, i) => {
      const x = this.padding + i * xScale;
      const y = this.height - this.padding - (point.y - minY) * yScale;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else if (smooth) {
        // 使用贝塞尔曲线平滑
        const prevX = this.padding + (i - 1) * xScale;
        const prevY = this.height - this.padding - (data[i - 1].y - minY) * yScale;
        const cp1x = prevX + (x - prevX) / 3;
        const cp2x = prevX + (x - prevX) * 2 / 3;
        this.ctx.bezierCurveTo(cp1x, prevY, cp2x, y, x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.stroke();
    
    // 填充区域
    if (fillArea) {
      this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
      this.ctx.lineTo(this.padding, this.height - this.padding);
      this.ctx.fillStyle = color + '20'; // 20%透明度
      this.ctx.fill();
    }
    
    // 绘制数据点
    if (showDots) {
      data.forEach((point, i) => {
        const x = this.padding + i * xScale;
        const y = this.height - this.padding - (point.y - minY) * yScale;
        
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }
  }
  
  // 绘制柱状图
  drawBarChart(data, options = {}) {
    const {
      title = '',
      xLabel = '',
      yLabel = '',
      barWidth = 0.8,
      color = this.colors.primary,
      showValues = true
    } = options;
    
    // 清空画布
    this.clear();
    
    // 计算数据范围
    const maxValue = Math.max(...data.map(d => d.value));
    
    // 计算柱子宽度和间距
    const totalWidth = (this.width - this.padding * 2) / data.length;
    const actualBarWidth = totalWidth * barWidth;
    const barGap = totalWidth - actualBarWidth;
    
    // 绘制坐标轴和网格
    this.drawAxes(0, maxValue, data.map(d => d.label));
    
    // 绘制标题和标签
    if (title) this.drawTitle(title);
    if (xLabel) this.drawXLabel(xLabel);
    if (yLabel) this.drawYLabel(yLabel);
    
    // 绘制柱子
    data.forEach((item, i) => {
      const x = this.padding + i * totalWidth + barGap / 2;
      const barHeight = (item.value / maxValue) * (this.height - this.padding * 2);
      const y = this.height - this.padding - barHeight;
      
      // 渐变填充
      const gradient = this.ctx.createLinearGradient(x, y, x, this.height - this.padding);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '80');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, actualBarWidth, barHeight);
      
      // 绘制数值
      if (showValues) {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(item.value, x + actualBarWidth / 2, y - 5);
      }
    });
  }
  
  // 绘制饼图
  drawPieChart(data, options = {}) {
    const {
      title = '',
      showLegend = true,
      showPercentages = true,
      colors = Object.values(this.colors)
    } = options;
    
    // 清空画布
    this.clear();
    
    // 计算总和
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // 计算圆心和半径
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // 绘制标题
    if (title) this.drawTitle(title);
    
    // 绘制扇形
    let startAngle = -Math.PI / 2;
    data.forEach((item, i) => {
      const angle = (item.value / total) * Math.PI * 2;
      const endAngle = startAngle + angle;
      
      // 绘制扇形
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.fillStyle = colors[i % colors.length];
      this.ctx.fill();
      
      // 绘制标签
      if (showPercentages) {
        const percentage = Math.round((item.value / total) * 100);
        const labelAngle = startAngle + angle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${percentage}%`, labelX, labelY);
      }
      
      startAngle = endAngle;
    });
    
    // 绘制图例
    if (showLegend) {
      const legendX = this.width - this.padding - 100;
      const legendY = this.padding;
      
      data.forEach((item, i) => {
        const y = legendY + i * 25;
        
        // 绘制色块
        this.ctx.fillStyle = colors[i % colors.length];
        this.ctx.fillRect(legendX, y, 15, 15);
        
        // 绘制文字
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(item.label, legendX + 20, y + 12);
      });
    }
  }
  
  // 辅助方法
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  drawAxes(minY, maxY, xLabels) {
    // 绘制坐标轴
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.moveTo(this.padding, this.padding);
    this.ctx.lineTo(this.padding, this.height - this.padding);
    this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
    this.ctx.stroke();
    
    // 绘制Y轴刻度
    const yStep = (maxY - minY) / 5;
    for (let i = 0; i <= 5; i++) {
      const y = this.height - this.padding - (i / 5) * (this.height - this.padding * 2);
      const value = minY + i * yStep;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding - 5, y);
      this.ctx.lineTo(this.padding, y);
      this.ctx.stroke();
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(Math.round(value), this.padding - 10, y);
    }
    
    // 绘制X轴刻度
    const xStep = Math.ceil(xLabels.length / 5);
    xLabels.forEach((label, i) => {
      if (i % xStep === 0) {
        const x = this.padding + (i / (xLabels.length - 1)) * (this.width - this.padding * 2);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.height - this.padding);
        this.ctx.lineTo(x, this.height - this.padding + 5);
        this.ctx.stroke();
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(label, x, this.height - this.padding + 10);
      }
    });
  }
  
  drawTitle(title) {
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.width / 2, this.padding / 2);
  }
  
  drawXLabel(label) {
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, this.width / 2, this.height - 10);
  }
  
  drawYLabel(label) {
    this.ctx.save();
    this.ctx.translate(15, this.height / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, 0, 0);
    this.ctx.restore();
  }
  
  // 绘制雷达图
  drawRadarChart(data, options = {}) {
    const {
      title = '',
      maxValue = Math.max(...data.map(d => d.value)),
      color = this.colors.primary,
      fillColor = color + '40',
      showLabels = true,
      showValues = true,
      sides = data.length
    } = options;

    this.clear();
    if (title) this.drawTitle(title);

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;
    
    // 绘制网格
    for (let level = 0; level <= 4; level++) {
      const scale = (level + 1) / 5;
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.colors.grid;
      
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * scale;
        const y = centerY + Math.sin(angle) * radius * scale;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.closePath();
      this.ctx.stroke();
    }
    
    // 绘制数据
    this.ctx.beginPath();
    data.forEach((item, i) => {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const scale = item.value / maxValue;
      const x = centerX + Math.cos(angle) * radius * scale;
      const y = centerY + Math.sin(angle) * radius * scale;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
      
      // 绘制标签
      if (showLabels) {
        const labelX = centerX + Math.cos(angle) * (radius + 20);
        const labelY = centerY + Math.sin(angle) * (radius + 20);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(item.label, labelX, labelY);
      }
      
      // 绘制数值
      if (showValues) {
        const valueX = centerX + Math.cos(angle) * radius * scale * 0.7;
        const valueY = centerY + Math.sin(angle) * radius * scale * 0.7;
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(item.value, valueX, valueY);
      }
    });
    
    this.ctx.closePath();
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
  }

  // 绘制散点图
  drawScatterPlot(data, options = {}) {
    const {
      title = '',
      xLabel = '',
      yLabel = '',
      color = this.colors.primary,
      dotSize = 5,
      showTrendline = true
    } = options;

    this.clear();
    
    // 计算数据范围
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    // 计算比例
    const xScale = (this.width - this.padding * 2) / (maxX - minX);
    const yScale = (this.height - this.padding * 2) / (maxY - minY);
    
    // 绘制坐标轴
    this.drawAxes(minY, maxY, xValues);
    
    // 绘制标题和标签
    if (title) this.drawTitle(title);
    if (xLabel) this.drawXLabel(xLabel);
    if (yLabel) this.drawYLabel(yLabel);
    
    // 绘制数据点
    data.forEach(point => {
      const x = this.padding + (point.x - minX) * xScale;
      const y = this.height - this.padding - (point.y - minY) * yScale;
      
      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // 绘制趋势线
    if (showTrendline) {
      const { slope, intercept } = this.calculateTrendline(data);
      
      const startX = minX;
      const endX = maxX;
      const startY = slope * startX + intercept;
      const endY = slope * endX + intercept;
      
      const x1 = this.padding;
      const y1 = this.height - this.padding - (startY - minY) * yScale;
      const x2 = this.width - this.padding;
      const y2 = this.height - this.padding - (endY - minY) * yScale;
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = color + '80';
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  // 计算趋势线
  calculateTrendline(data) {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    data.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  // 添加交互功能
  addTooltip() {
    let tooltip = null;
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const dataPoint = this.findNearestDataPoint(x, y);
      if (dataPoint) {
        this.showTooltip(dataPoint, x, y);
      } else {
        this.hideTooltip();
      }
    });
    
    this.canvas.addEventListener('mouseout', () => {
      this.hideTooltip();
    });
  }

  // 查找最近的数据点
  findNearestDataPoint(x, y) {
    const threshold = 10; // 检测范围阈值
    let nearest = null;
    let minDistance = Infinity;
    
    this.currentData.forEach(point => {
      const px = this.getXPixel(point.x);
      const py = this.getYPixel(point.y);
      
      const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });
    
    return nearest;
  }

  // 显示工具提示
  showTooltip(data, x, y) {
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'chart-tooltip';
      document.body.appendChild(this.tooltip);
    }
    
    // 设置工具提示内容
    this.tooltip.innerHTML = `
      <div class="tooltip-content">
        <div class="tooltip-title">${data.label || ''}</div>
        <div class="tooltip-value">
          ${typeof data.x !== 'undefined' ? `X: ${data.x}<br>` : ''}
          ${typeof data.y !== 'undefined' ? `Y: ${data.y}<br>` : ''}
          ${typeof data.value !== 'undefined' ? `值: ${data.value}` : ''}
        </div>
      </div>
    `;
    
    // 定位工具提示
    const rect = this.canvas.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    let tooltipX = rect.left + x;
    let tooltipY = rect.top + y - tooltipRect.height - 10;
    
    // 防止工具提示超出视口
    if (tooltipX + tooltipRect.width > window.innerWidth) {
      tooltipX = window.innerWidth - tooltipRect.width - 10;
    }
    if (tooltipY < 10) {
      tooltipY = rect.top + y + 20;
    }
    
    this.tooltip.style.left = `${tooltipX}px`;
    this.tooltip.style.top = `${tooltipY}px`;
    this.tooltip.style.opacity = '1';
  }

  // 隐藏工具提示
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
    }
  }

  // 添加动画效果
  animate(duration = 1000) {
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      
      // 根据进度重绘图表
      this.drawWithProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  // 根据进度重绘图表
  drawWithProgress(progress) {
    this.clear();
    
    switch (this.currentChartType) {
      case 'line':
        this.drawLineChartWithProgress(progress);
        break;
      case 'bar':
        this.drawBarChartWithProgress(progress);
        break;
      case 'pie':
        this.drawPieChartWithProgress(progress);
        break;
      case 'radar':
        this.drawRadarChartWithProgress(progress);
        break;
      case 'scatter':
        this.drawScatterPlotWithProgress(progress);
        break;
    }
  }

  // 折线图动画
  drawLineChartWithProgress(progress) {
    // 保存原始数据
    const originalData = [...this.currentData];
    
    // 根据进度计算数据点
    const animatedData = originalData.map((point, index) => {
      const targetIndex = Math.floor(index * progress);
      if (index <= targetIndex) {
        return point;
      } else if (index === targetIndex + 1) {
        const prevPoint = originalData[targetIndex];
        const fraction = (index * progress) % 1;
        return {
          x: point.x,
          y: prevPoint.y + (point.y - prevPoint.y) * fraction
        };
      } else {
        return {
          x: point.x,
          y: originalData[targetIndex].y
        };
      }
    });
    
    this.drawLineChart(animatedData, this.currentOptions);
  }

  // 柱状图动画
  drawBarChartWithProgress(progress) {
    const animatedData = this.currentData.map(item => ({
      ...item,
      value: item.value * progress
    }));
    
    this.drawBarChart(animatedData, this.currentOptions);
  }

  // 饼图动画
  drawPieChartWithProgress(progress) {
    const originalOptions = { ...this.currentOptions };
    this.currentOptions.endAngle = Math.PI * 2 * progress;
    this.drawPieChart(this.currentData, this.currentOptions);
    this.currentOptions = originalOptions;
  }

  // 雷达图动画
  drawRadarChartWithProgress(progress) {
    const animatedData = this.currentData.map(item => ({
      ...item,
      value: item.value * progress
    }));
    
    this.drawRadarChart(animatedData, this.currentOptions);
  }

  // 散点图动画
  drawScatterPlotWithProgress(progress) {
    const animatedData = this.currentData.slice(
      0, 
      Math.floor(this.currentData.length * progress)
    );
    
    this.drawScatterPlot(animatedData, this.currentOptions);
  }

  // 坐标转换辅助方法
  getXPixel(x) {
    const { minX, maxX } = this.getDataRange();
    return this.padding + (x - minX) * (this.width - this.padding * 2) / (maxX - minX);
  }

  getYPixel(y) {
    const { minY, maxY } = this.getDataRange();
    return this.height - this.padding - (y - minY) * (this.height - this.padding * 2) / (maxY - minY);
  }

  getDataRange() {
    const xValues = this.currentData.map(d => d.x);
    const yValues = this.currentData.map(d => d.y);
    
    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues)
    };
  }

  // 绘制图表时保存当前状态
  saveCurrentState(data, options, type) {
    this.currentData = data;
    this.currentOptions = options;
    this.currentChartType = type;
  }

  // 添加缩放功能
  enableZoom() {
    let scale = 1;
    let originX = 0;
    let originY = 0;
    
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // 计算缩放
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      scale *= delta;
      scale = Math.max(0.5, Math.min(scale, 5)); // 限制缩放范围
      
      // 更新原点
      originX = mouseX - (mouseX - originX) * delta;
      originY = mouseY - (mouseY - originY) * delta;
      
      // 重绘图表
      this.drawWithTransform(scale, originX, originY);
    });
  }

  // 添加拖动功能
  enableDrag() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    
    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      lastX = startX;
      lastY = startY;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const dx = x - lastX;
      const dy = y - lastY;
      
      this.pan(dx, dy);
      
      lastX = x;
      lastY = y;
    });
    
    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      isDragging = false;
    });
  }

  // 平移视图
  pan(dx, dy) {
    this.viewOffset.x += dx;
    this.viewOffset.y += dy;
    this.redraw();
  }

  // 添加图例交互
  enableLegendInteraction() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const legendItem = this.findLegendItem(x, y);
      if (legendItem) {
        this.toggleDataSeries(legendItem);
      }
    });
  }

  // 查找点击的图例项
  findLegendItem(x, y) {
    const legendX = this.width - this.padding - 100;
    const legendY = this.padding;
    
    for (let i = 0; i < this.currentData.length; i++) {
      const itemY = legendY + i * 25;
      if (x >= legendX && x <= legendX + 100 &&
          y >= itemY && y <= itemY + 20) {
        return i;
      }
    }
    return null;
  }

  // 切换数据系列显示/隐藏
  toggleDataSeries(index) {
    if (!this.hiddenSeries) {
      this.hiddenSeries = new Set();
    }
    
    if (this.hiddenSeries.has(index)) {
      this.hiddenSeries.delete(index);
    } else {
      this.hiddenSeries.add(index);
    }
    
    this.redraw();
  }

  // 添加数据标签
  addDataLabels(options = {}) {
    const {
      format = value => value,
      position = 'top',
      offset = 10,
      font = '12px Arial',
      color = this.colors.text
    } = options;
    
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    
    this.currentData.forEach((point, i) => {
      if (this.hiddenSeries && this.hiddenSeries.has(i)) return;
      
      const x = this.getXPixel(point.x);
      const y = this.getYPixel(point.y);
      const label = format(point.y);
      
      let labelX = x;
      let labelY = y;
      
      switch (position) {
        case 'top':
          labelY -= offset;
          break;
        case 'bottom':
          labelY += offset + 12;
          break;
        case 'left':
          labelX -= offset;
          this.ctx.textAlign = 'right';
          break;
        case 'right':
          labelX += offset;
          this.ctx.textAlign = 'left';
          break;
      }
      
      this.ctx.fillText(label, labelX, labelY);
    });
  }

  // 添加网格线
  addGrid(options = {}) {
    const {
      color = this.colors.grid,
      width = 1,
      dash = []
    } = options;
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.setLineDash(dash);
    
    // 绘制水平网格线
    const yStep = (this.height - this.padding * 2) / 10;
    for (let i = 0; i <= 10; i++) {
      const y = this.padding + i * yStep;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y);
      this.ctx.lineTo(this.width - this.padding, y);
      this.ctx.stroke();
    }
    
    // 绘制垂直网格线
    const xStep = (this.width - this.padding * 2) / 10;
    for (let i = 0; i <= 10; i++) {
      const x = this.padding + i * xStep;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.padding);
      this.ctx.lineTo(x, this.height - this.padding);
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
  }

  // 添加图表注释
  addAnnotation(text, x, y, options = {}) {
    const {
      font = '12px Arial',
      color = this.colors.text,
      background = 'white',
      padding = 5,
      borderRadius = 3,
      arrow = true
    } = options;
    
    const px = this.getXPixel(x);
    const py = this.getYPixel(y);
    
    // 绘制连接线
    if (arrow) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.moveTo(px, py);
      this.ctx.lineTo(px, py - 20);
      this.ctx.stroke();
    }
    
    // 测量文本尺寸
    this.ctx.font = font;
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(font) + padding * 2;
    
    // 绘制背景
    this.ctx.fillStyle = background;
    this.roundRect(
      px - textWidth / 2 - padding,
      py - 20 - textHeight - padding,
      textWidth + padding * 2,
      textHeight,
      borderRadius
    );
    this.ctx.fill();
    
    // 绘制文本
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, px, py - 25);
  }

  // 绘制圆角矩形
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  // 导出图表为图片
  exportAsImage(fileName = 'chart.png') {
    return new Promise((resolve, reject) => {
      try {
        // 创建临时画布以保持高清晰度
        const tempCanvas = document.createElement('canvas');
        const scale = window.devicePixelRatio || 1;
        tempCanvas.width = this.width * scale;
        tempCanvas.height = this.height * scale;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 缩放以适应设备像素比
        tempCtx.scale(scale, scale);
        
        // 复制当前画布内容
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // 转换为图片
        tempCanvas.toBlob((blob) => {
          // 创建下载链接
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          
          // 清理
          URL.revokeObjectURL(url);
          resolve(url);
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    });
  }

  // 导出数据为CSV
  exportAsCSV(fileName = 'chart-data.csv') {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // 添加表头
      const headers = Object.keys(this.currentData[0]);
      csvContent += headers.join(',') + '\n';
      
      // 添加数据行
      this.currentData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvContent += values.join(',') + '\n';
      });
      
      // 创建下载链接
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', fileName);
      link.click();
    } catch (error) {
      console.error('导出CSV失败:', error);
      throw error;
    }
  }

  // 导出数据为JSON
  exportAsJSON(fileName = 'chart-data.json') {
    try {
      const data = {
        chartType: this.currentChartType,
        options: this.currentOptions,
        data: this.currentData,
        timestamp: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出JSON失败:', error);
      throw error;
    }
  }

  // 导出图表配置
  exportConfiguration() {
    return {
      type: this.currentChartType,
      options: this.currentOptions,
      colors: this.colors,
      padding: this.padding,
      dimensions: {
        width: this.width,
        height: this.height
      }
    };
  }

  // 导入图表配置
  importConfiguration(config) {
    try {
      // 验证配置
      if (!this.validateConfiguration(config)) {
        throw new Error('无效的图表配置');
      }
      
      // 应用配置
      this.currentChartType = config.type;
      this.currentOptions = config.options;
      this.colors = config.colors;
      this.padding = config.padding;
      
      // 调整画布大小
      if (config.dimensions) {
        this.width = config.dimensions.width;
        this.height = config.dimensions.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      }
      
      // 重绘图表
      this.redraw();
    } catch (error) {
      console.error('导入配置失败:', error);
      throw error;
    }
  }

  // 验证图表配置
  validateConfiguration(config) {
    const requiredFields = ['type', 'options', 'colors'];
    return requiredFields.every(field => config.hasOwnProperty(field));
  }

  // 保存为模板
  saveAsTemplate(name) {
    const template = {
      name,
      configuration: this.exportConfiguration(),
      timestamp: Date.now()
    };
    
    // 获取现有模板
    const templates = this.loadTemplates();
    templates.push(template);
    
    // 保存模板
    wx.setStorageSync('chart_templates', templates);
    return template;
  }

  // 加载模板
  loadTemplates() {
    return wx.getStorageSync('chart_templates') || [];
  }

  // 应用模板
  applyTemplate(templateName) {
    const templates = this.loadTemplates();
    const template = templates.find(t => t.name === templateName);
    
    if (template) {
      this.importConfiguration(template.configuration);
      return true;
    }
    return false;
  }

  // 删除模板
  deleteTemplate(templateName) {
    const templates = this.loadTemplates();
    const newTemplates = templates.filter(t => t.name !== templateName);
    wx.setStorageSync('chart_templates', newTemplates);
  }

  // 生成缩略图
  generateThumbnail(width = 200, height = 150) {
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = width;
    thumbnailCanvas.height = height;
    const ctx = thumbnailCanvas.getContext('2d');
    
    // 计算缩放比例
    const scale = Math.min(
      width / this.width,
      height / this.height
    );
    
    // 居中绘制
    const x = (width - this.width * scale) / 2;
    const y = (height - this.height * scale) / 2;
    
    ctx.drawImage(
      this.canvas,
      x, y,
      this.width * scale,
      this.height * scale
    );
    
    return thumbnailCanvas.toDataURL('image/png');
  }
}

export default ChartHelper; 