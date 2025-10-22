/**
 * 签名存储管理器
 * 用于记录和验证一次性签名
 */

// 内存存储（Map）
const usedSignatures = new Map();

/**
 * 签名存储管理器
 */
class SignStorage {
    constructor(strapi) {
        this.strapi = strapi;
        this.cleanupInterval = null;
    }

    /**
     * 初始化存储
     */
    async initialize(config) {
        console.log('🔧 [SignStorage] 初始化签名存储');
        
        // 如果启用一次性签名，启动清理任务
        if (config.enableOnceOnly) {
            this.startCleanupTask(config.signExpiration);
        }
    }

    /**
     * 检查签名是否已使用
     * @param {string} signature - 签名
     * @returns {boolean} - true: 已使用, false: 未使用
     */
    async isUsed(signature) {
        const record = usedSignatures.get(signature);
        
        if (!record) {
            return false;
        }

        // 检查是否过期
        if (Date.now() > record.expiresAt) {
            // 已过期，删除记录
            usedSignatures.delete(signature);
            return false;
        }

        return true;
    }

    /**
     * 标记签名为已使用
     * @param {string} signature - 签名
     * @param {number} expiresIn - 过期时间（毫秒）
     */
    async markAsUsed(signature, expiresIn = 3600000) {
        const record = {
            signature,
            usedAt: Date.now(),
            expiresAt: Date.now() + expiresIn,
        };

        usedSignatures.set(signature, record);
        
        console.log(`📝 [SignStorage] 签名已标记为使用: ${signature.substring(0, 20)}...`);
        console.log(`📝 [SignStorage] 当前已使用签名数量: ${usedSignatures.size}`);
    }

    /**
     * 清理过期的签名记录
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [signature, record] of usedSignatures.entries()) {
            if (now > record.expiresAt) {
                usedSignatures.delete(signature);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 [SignStorage] 清理了 ${cleanedCount} 个过期签名`);
            console.log(`📊 [SignStorage] 剩余签名数量: ${usedSignatures.size}`);
        }
    }

    /**
     * 启动定期清理任务
     */
    startCleanupTask(interval) {
        console.log(`⏰ [SignStorage] 启动签名清理任务，间隔: ${interval}ms`);
        
        // 每隔一段时间清理一次
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, interval);
    }

    /**
     * 停止清理任务
     */
    stopCleanupTask() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('⏹️ [SignStorage] 停止签名清理任务');
        }
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalSignatures: usedSignatures.size,
            signatures: Array.from(usedSignatures.values()).map(record => ({
                signature: record.signature.substring(0, 20) + '...',
                usedAt: new Date(record.usedAt).toISOString(),
                expiresAt: new Date(record.expiresAt).toISOString(),
            })),
        };
    }

    /**
     * 清空所有签名记录
     */
    clear() {
        usedSignatures.clear();
        console.log('🗑️ [SignStorage] 已清空所有签名记录');
    }
}

export default SignStorage;

