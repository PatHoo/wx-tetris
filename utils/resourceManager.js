class ResourceManager {
  constructor() {
    // 资源缓存
    this.images = new Map();
    
    // 资源配置
    this.resources = {
      images: {
        background: '/assets/images/background.png',
        blocks: '/assets/images/blocks.png',
        effects: '/assets/images/effects.png'
      }
    };
  }

  // 加载所有资源
  async loadAll() {
    try {
      await this.loadImages();
      console.info('[INFO][Resource] 所有资源加载完成');
      return true;
    } catch (error) {
      console.error('[ERROR][Resource] 资源加载失败:', error);
      return false;
    }
  }

  // 加载图片资源
  async loadImages() {
    const promises = Object.entries(this.resources.images).map(([key, path]) => {
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: path,
          success: (res) => {
            this.images.set(key, res.path);
            resolve(res);
          },
          fail: (error) => {
            console.error(`[ERROR][Resource] 图片加载失败: ${path}`, error);
            reject(error);
          }
        });
      });
    });

    await Promise.all(promises);
  }

  // 获取图片路径
  getImage(key) {
    return this.images.get(key);
  }

  // 释放资源
  dispose() {
    // 清除图片缓存
    this.images.clear();
  }
}

export default new ResourceManager(); 