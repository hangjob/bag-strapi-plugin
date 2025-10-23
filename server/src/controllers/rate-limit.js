/**
 * 限流管理控制器
 */

const controller = ({ strapi }) => ({
    /**
     * 获取限流统计
     */
    async getStats(ctx) {
        try {
            // 这里可以从 Redis 或内存中获取统计信息
            ctx.body = {
                success: true,
                message: '限流统计功能需要配置 Redis 支持',
                data: {
                    info: '请使用 Redis 存储以获取完整统计信息',
                },
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `获取限流统计失败: ${error.message}`,
            };
        }
    },

    /**
     * 重置指定 key 的限流
     */
    async reset(ctx) {
        try {
            const { key } = ctx.request.body;

            if (!key) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: 'key 参数不能为空',
                };
            }

            // 尝试从 Redis 删除
            const redis = strapi.redis;
            if (redis) {
                const deleted = await redis.del(`rate-limit:${key}`);
                ctx.body = {
                    success: true,
                    message: deleted > 0 ? '限流已重置' : 'Key 不存在',
                };
            } else {
                ctx.body = {
                    success: false,
                    message: '需要配置 Redis 才能重置限流',
                };
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `重置限流失败: ${error.message}`,
            };
        }
    },

    /**
     * 清除所有限流记录
     */
    async clearAll(ctx) {
        try {
            const redis = strapi.redis;
            if (redis) {
                const keys = await redis.keys('rate-limit:*');
                if (keys.length > 0) {
                    await redis.del(...keys);
                }
                ctx.body = {
                    success: true,
                    message: `已清除 ${keys.length} 条限流记录`,
                };
            } else {
                ctx.body = {
                    success: false,
                    message: '需要配置 Redis 才能清除限流记录',
                };
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `清除限流记录失败: ${error.message}`,
            };
        }
    },

    /**
     * 获取限流配置
     */
    async getConfig(ctx) {
        try {
            const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
            const rateLimitConfig = pluginConfig?.rateLimit || {};

            ctx.body = {
                success: true,
                data: {
                    enabled: rateLimitConfig.enabled !== false,
                    points: rateLimitConfig.points || 100,
                    duration: rateLimitConfig.duration || 60,
                    storage: rateLimitConfig.storage || 'memory',
                    whitelist: rateLimitConfig.whitelist || [],
                    message: rateLimitConfig.message || '请求过于频繁，请稍后再试',
                },
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `获取配置失败: ${error.message}`,
            };
        }
    },

    /**
     * 检查 IP 限流状态
     */
    async checkIp(ctx) {
        try {
            const { ip } = ctx.query;
            const targetIp = ip || getClientIp(ctx);

            const redis = strapi.redis;
            if (redis) {
                const key = `rate-limit:ip:${targetIp}`;
                const count = await redis.get(key);
                const ttl = await redis.ttl(key);

                ctx.body = {
                    success: true,
                    data: {
                        ip: targetIp,
                        count: count ? parseInt(count) : 0,
                        ttl: ttl > 0 ? ttl : 0,
                        blocked: false, // 可以根据实际情况判断
                    },
                };
            } else {
                ctx.body = {
                    success: false,
                    message: '需要配置 Redis 才能查看限流状态',
                };
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `检查失败: ${error.message}`,
            };
        }
    },
});

/**
 * 获取客户端 IP
 */
function getClientIp(ctx) {
    return ctx.request.header['x-forwarded-for']?.split(',')[0]?.trim() ||
           ctx.request.header['x-real-ip'] ||
           ctx.request.header['cf-connecting-ip'] ||
           ctx.request.ip ||
           ctx.ip ||
           'unknown';
}

export default controller;

