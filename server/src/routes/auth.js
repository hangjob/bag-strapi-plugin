/**
 * 认证路由
 */

export default [
    // 用户注册
    {
        method: 'POST',
        path: '/auth/register',
        handler: 'auth.register',
        config: {
            auth: false, // 不需要认证
            policies: [],
            // 全局限流中间件会自动应用，配置在 config/index.js 的 pathRules 中
        },
    },

    // 用户登录
    {
        method: 'POST',
        path: '/auth/login',
        handler: 'auth.login',
        config: {
            auth: false, // 不需要认证
            policies: [],
            // 全局限流中间件会自动应用，配置在 config/index.js 的 pathRules 中
        },
    },

    // 获取当前用户信息
    {
        method: 'GET',
        path: '/auth/me',
        handler: 'auth.me',
        config: {
            auth: false, // 在控制器中手动验证
            policies: [],
        },
    },

    // 刷新 Token
    {
        method: 'POST',
        path: '/auth/refresh',
        handler: 'auth.refreshToken',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 修改密码
    {
        method: 'POST',
        path: '/auth/change-password',
        handler: 'auth.changePassword',
        config: {
            auth: false, // 在控制器中手动验证
            policies: [],
        },
    },

    // 重置密码
    {
        method: 'POST',
        path: '/auth/reset-password',
        handler: 'auth.resetPassword',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 登出
    {
        method: 'POST',
        path: '/auth/logout',
        handler: 'auth.logout',
        config: {
            auth: false,
            policies: [],
        },
    },
];

