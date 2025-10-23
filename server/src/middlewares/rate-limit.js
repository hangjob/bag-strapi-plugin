/**
 * API 限流中间件 - 全局版本
 * 
 * 基于 rate-limiter-flexible 实现（支持多种存储）
 * 支持针对不同路径使用不同的限流规则
 */

import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

// 限流器实例缓存
const limiterCache = new Map();

/**
 * 创建限流中间件
 */
export default (options = {}, { strapi }) => {
    // 从插件配置中获取默认配置
    const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
    const rateLimitConfig = pluginConfig?.rateLimit || {};

    strapi.log.info('🔧 [Rate Limit] 初始化全局限流中间件');

    // 返回 Koa 中间件
    return async (ctx, next) => {
        try {
            const requestPath = ctx.request.path;
            
            // 获取当前请求的限流配置
            const config = getConfigForPath(requestPath, rateLimitConfig, options, strapi);
            
            // 生成限流 key
            const key = generateKey(ctx, config, strapi);
            
            strapi.log.debug(`🚀 [Rate Limit] 请求: ${ctx.method} ${requestPath}`, {
                key,
                config: {
                    points: config.points,
                    duration: config.duration,
                    type: config.type,
                },
            });

            // 检查白名单
            if (isWhitelisted(key, config)) {
                strapi.log.info(`⚪ [Rate Limit] IP 在白名单中: ${key}`);
                return await next();
            }

            // 获取限流器
            const limiter = getLimiter(config, strapi);

            // 尝试消费一个点
            try {
                const result = await limiter.consume(key);

                strapi.log.info(`✅ [Rate Limit] 请求通过`, {
                    key,
                    remainingPoints: result.remainingPoints,
                    limit: config.points,
                });

                // 添加响应头
                ctx.set('X-RateLimit-Limit', config.points.toString());
                ctx.set('X-RateLimit-Remaining', result.remainingPoints.toString());
                ctx.set('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString());

                // 继续执行
                await next();

            } catch (rejRes) {
                // 限流触发
                strapi.log.warn(`🚫 [Rate Limit] 限流触发!!!`, {
                    key,
                    consumedPoints: rejRes.consumedPoints,
                    limit: config.points,
                    retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
                });

                // 添加响应头
                ctx.set('X-RateLimit-Limit', config.points.toString());
                ctx.set('X-RateLimit-Remaining', '0');
                ctx.set('X-RateLimit-Reset', new Date(Date.now() + rejRes.msBeforeNext).toISOString());
                ctx.set('Retry-After', Math.ceil(rejRes.msBeforeNext / 1000).toString());

                ctx.status = 429;
                ctx.body = {
                    success: false,
                    message: config.message,
                    retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
                };
            }
        } catch (error) {
            // 限流器错误，记录日志但允许请求继续
            strapi.log.error('❌ [Rate Limit] 错误:', error.message);
            await next();
        }
    };
};

/**
 * 获取指定路径的限流配置
 */
function getConfigForPath(requestPath, rateLimitConfig, options, strapi) {
    // 基础配置
    let config = {
        points: rateLimitConfig.points || 100,
        duration: rateLimitConfig.duration || 60,
        blockDuration: rateLimitConfig.blockDuration || 0,
        storage: rateLimitConfig.storage || 'memory',
        whitelist: rateLimitConfig.whitelist || [],
        message: rateLimitConfig.message || '请求过于频繁，请稍后再试',
        type: 'ip',
    };

    // 查找匹配的路径规则
    const pathRules = rateLimitConfig.pathRules || {};
    let matchedRule = null;
    let matchedPattern = null;

    for (const [pattern, rule] of Object.entries(pathRules)) {
        if (isPathMatch(requestPath, pattern)) {
            matchedRule = rule;
            matchedPattern = pattern;
            break;
        }
    }

    // 如果找到匹配的规则，覆盖默认配置
    if (matchedRule) {
        config = {
            ...config,
            ...matchedRule,
        };
        strapi.log.info(`🎯 [Rate Limit] 匹配到路径规则: ${matchedPattern}`, {
            points: config.points,
            duration: config.duration,
        });
    }

    // 选项参数优先级最高
    if (Object.keys(options).length > 0) {
        config = {
            ...config,
            ...options,
        };
    }

    return config;
}

/**
 * 检查路径是否匹配规则
 */
function isPathMatch(requestPath, pattern) {
    if (pattern.includes('*')) {
        // 支持通配符匹配
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(requestPath);
    }
    // 精确匹配或前缀匹配
    return requestPath === pattern || requestPath.startsWith(pattern);
}

/**
 * 获取或创建限流器实例
 */
function getLimiter(config, strapi) {
    // 根据配置生成缓存 key
    const cacheKey = `${config.storage}_${config.points}_${config.duration}_${config.blockDuration}`;

    // 检查缓存
    if (limiterCache.has(cacheKey)) {
        return limiterCache.get(cacheKey);
    }

    // 创建新的限流器
    let limiter;

    if (config.storage === 'redis') {
        // 使用 Redis 存储
        try {
            const redis = strapi.redis;
            if (!redis) {
                strapi.log.warn('⚠️ [Rate Limit] Redis 未配置，降级使用内存存储');
                limiter = createMemoryLimiter(config);
            } else {
                limiter = new RateLimiterRedis({
                    storeClient: redis,
                    keyPrefix: 'rate-limit',
                    points: config.points,
                    duration: config.duration,
                    blockDuration: config.blockDuration,
                });
                strapi.log.info('✅ [Rate Limit] 创建 Redis 限流器', { cacheKey });
            }
        } catch (error) {
            strapi.log.error('❌ [Rate Limit] Redis 限流器创建失败:', error);
            limiter = createMemoryLimiter(config);
        }
    } else {
        // 使用内存存储
        limiter = createMemoryLimiter(config);
        strapi.log.info('✅ [Rate Limit] 创建内存限流器', { cacheKey });
    }

    // 缓存限流器
    limiterCache.set(cacheKey, limiter);

    return limiter;
}

/**
 * 创建内存限流器
 */
function createMemoryLimiter(config) {
    return new RateLimiterMemory({
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration,
    });
}

/**
 * 生成限流 key
 */
function generateKey(ctx, config, strapi) {
    const ip = getClientIp(ctx);
    
    switch (config.type) {
        case 'user':
            // 基于用户ID限流
            return `user:${ctx.state.user?.id || ip}`;
        
        case 'endpoint':
            // 基于端点限流
            return `endpoint:${ctx.method}:${ctx.path}:${ip}`;
        
        case 'custom':
            // 自定义 key 生成器
            if (config.keyGenerator) {
                return config.keyGenerator(ctx);
            }
            return `custom:${ip}`;
        
        case 'ip':
        default:
            // 基于 IP 限流（默认）
            return `ip:${ip}`;
    }
}

/**
 * 获取客户端 IP
 */
function getClientIp(ctx) {
    // 优先从代理头获取真实 IP
    const forwarded = ctx.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    const realIp = ctx.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
    
    // 回退到直接连接的 IP
    return ctx.ip || ctx.request.ip || 'unknown';
}

/**
 * 检查是否在白名单中
 */
function isWhitelisted(key, config) {
    const whitelist = config.whitelist || [];
    if (whitelist.length === 0) {
        return false;
    }

    // 提取 IP 地址
    const ip = key.includes(':') ? key.split(':').pop() : key;

    return whitelist.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(ip);
        }
        if (typeof pattern === 'string') {
            // 支持通配符匹配
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                return regex.test(ip);
            }
            // 精确匹配
            return ip === pattern;
        }
        return false;
    });
}

/**
 * 预设限流配置
 */
export const rateLimitPresets = {
    // 严格限流（登录、注册等）
    strict: {
        points: 5,
        duration: 900,      // 15分钟
        blockDuration: 1800, // 阻止30分钟
        message: '操作过于频繁，请稍后再试',
    },
    
    // 中等限流（一般 API）
    moderate: {
        points: 50,
        duration: 60,       // 1分钟
        message: '请求过于频繁，请稍后再试',
    },
    
    // 宽松限流（公开 API）
    relaxed: {
        points: 200,
        duration: 60,       // 1分钟
        message: '请求过于频繁，请稍后再试',
    },
    
    // 验证码限流
    captcha: {
        points: 10,
        duration: 60,       // 1分钟
        message: '获取验证码过于频繁，请稍后再试',
    },
};
