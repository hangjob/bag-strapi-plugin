/**
 * 限流测试路由
 * 
 * 用于测试限流功能是否正常工作
 */

export default [
    // 测试接口1：使用默认配置（从 config/index.js 读取）
    {
        method: 'GET',
        path: '/test/rate-limit/default',
        handler: (ctx) => {
            ctx.body = {
                success: true,
                message: '使用默认限流配置',
                config: '从 config/index.js 读取',
                currentTime: new Date().toISOString(),
                ip: ctx.request.ip,
            };
        },
        config: {
            auth: false,
            policies: [],
            // 使用默认配置（2次/分钟）
            middlewares: ['plugin::bag-strapi-plugin.rate-limit'],
        },
    },

    // 测试接口2：自定义配置（5次/分钟）
    {
        method: 'GET',
        path: '/test/rate-limit/custom',
        handler: (ctx) => {
            ctx.body = {
                success: true,
                message: '使用自定义限流配置',
                config: '5次/分钟',
                currentTime: new Date().toISOString(),
                ip: ctx.request.ip,
            };
        },
        config: {
            auth: false,
            policies: [],
            middlewares: [
                {
                    name: 'plugin::bag-strapi-plugin.rate-limit',
                    config: {
                        points: 5,
                        duration: 60,
                        message: '自定义限流：每分钟最多5次请求',
                    },
                },
            ],
        },
    },

    // 测试接口3：严格限流（2次/分钟，阻止30秒）
    {
        method: 'GET',
        path: '/test/rate-limit/strict',
        handler: (ctx) => {
            ctx.body = {
                success: true,
                message: '使用严格限流配置',
                config: '2次/分钟，超过后阻止30秒',
                currentTime: new Date().toISOString(),
                ip: ctx.request.ip,
            };
        },
        config: {
            auth: false,
            policies: [],
            middlewares: [
                {
                    name: 'plugin::bag-strapi-plugin.rate-limit',
                    config: {
                        points: 2,
                        duration: 60,
                        blockDuration: 30,
                        message: '严格限流：请求过于频繁，已阻止30秒',
                    },
                },
            ],
        },
    },

    // 测试接口4：无限流（用于对比）
    {
        method: 'GET',
        path: '/test/rate-limit/none',
        handler: (ctx) => {
            ctx.body = {
                success: true,
                message: '无限流限制',
                config: '此接口没有限流',
                currentTime: new Date().toISOString(),
                ip: ctx.request.ip,
            };
        },
        config: {
            auth: false,
            policies: [],
            // 不添加限流中间件
        },
    },
];

