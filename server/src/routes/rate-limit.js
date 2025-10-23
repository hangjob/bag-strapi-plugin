/**
 * 限流管理路由
 */

export default [
    // 获取限流统计
    {
        method: 'GET',
        path: '/rate-limit/stats',
        handler: 'rate-limit.getStats',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 获取限流配置
    {
        method: 'GET',
        path: '/rate-limit/config',
        handler: 'rate-limit.getConfig',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 检查 IP 限流状态
    {
        method: 'GET',
        path: '/rate-limit/check-ip',
        handler: 'rate-limit.checkIp',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 重置限流
    {
        method: 'POST',
        path: '/rate-limit/reset',
        handler: 'rate-limit.reset',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 清除所有限流记录
    {
        method: 'POST',
        path: '/rate-limit/clear-all',
        handler: 'rate-limit.clearAll',
        config: {
            auth: false,
            policies: [],
        },
    },
];

