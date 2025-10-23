/**
 * 验证码路由
 */

export default [
    // 获取图形验证码
    {
        method: 'GET',
        path: '/captcha/image',
        handler: 'captcha.getImageCaptcha',
        config: {
            auth: false,
            policies: [],
            // 全局限流中间件会自动应用，无需单独配置
        },
    },

    // 刷新验证码
    {
        method: 'POST',
        path: '/captcha/refresh',
        handler: 'captcha.refreshCaptcha',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 验证验证码（可选）
    {
        method: 'POST',
        path: '/captcha/verify',
        handler: 'captcha.verifyCaptcha',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 发送邮件验证码
    {
        method: 'POST',
        path: '/captcha/email',
        handler: 'captcha.sendEmailCaptcha',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 发送短信验证码
    {
        method: 'POST',
        path: '/captcha/sms',
        handler: 'captcha.sendSmsCaptcha',
        config: {
            auth: false,
            policies: [],
        },
    },

    // 获取验证码统计（调试用）
    {
        method: 'GET',
        path: '/captcha/stats',
        handler: 'captcha.getCaptchaStats',
        config: {
            auth: false,
            policies: [],
        },
    },
];

