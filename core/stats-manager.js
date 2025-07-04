// 统计管理模块
class StatsManager {
  constructor(platform) {
    this.platform = platform;
    this.dailyBlockCount = 0; // 当日屏蔽计数
    this.totalBlockCount = 0; // 总屏蔽计数
    this.lastUpdateDate = null; // 上次更新日期
  }

  // 加载统计数据
  async loadStats() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['todayBlocked', 'totalBlocked', 'lastUpdateDate'], (result) => {
        const today = new Date().toDateString();

        // 如果是新的一天，重置今日统计
        if (result.lastUpdateDate !== today) {
          this.dailyBlockCount = 0;
          this.totalBlockCount = result.totalBlocked || 0;
          this.lastUpdateDate = today;
          this.saveStats();
        } else {
          this.dailyBlockCount = result.todayBlocked || 0;
          this.totalBlockCount = result.totalBlocked || 0;
          this.lastUpdateDate = result.lastUpdateDate;
        }

        DebugLogger.log(`[HoyoBlock-${this.platform}] Stats loaded - Today: ${this.dailyBlockCount}, Total: ${this.totalBlockCount}`);
        resolve();
      });
    });
  }

  // 保存统计数据
  saveStats() {
    chrome.storage.local.set({
      todayBlocked: this.dailyBlockCount,
      totalBlocked: this.totalBlockCount,
      lastUpdateDate: this.lastUpdateDate
    }, () => {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Stats saved - Today: ${this.dailyBlockCount}, Total: ${this.totalBlockCount}`);
    });
  }

  // 更新统计数据
  updateStats(blockedCount) {
    if (blockedCount > 0) {
      this.dailyBlockCount += blockedCount;
      this.totalBlockCount += blockedCount;
      this.saveStats();
    }
  }

  // 获取统计数据
  getStats() {
    return {
      dailyBlockCount: this.dailyBlockCount,
      totalBlockCount: this.totalBlockCount,
      lastUpdateDate: this.lastUpdateDate
    };
  }

  // 重置统计数据
  resetStats() {
    this.dailyBlockCount = 0;
    this.totalBlockCount = 0;
    this.lastUpdateDate = new Date().toDateString();
    this.saveStats();
  }
}

// 导出供其他模块使用
window.StatsManager = StatsManager;
