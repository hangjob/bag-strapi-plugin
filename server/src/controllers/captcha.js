/**
 * 验证码控制器
 */

const controller = ({ strapi }) => ({
    /**
     * 获取图形验证码
     */
    async getImageCaptcha(ctx) {
        try {
            const { type = 'image' } = ctx.query;

            let result;
            if (type === 'math') {
                result = strapi
                    .plugin('bag-strapi-plugin')
                    .service('captcha')
                    .generateMathCaptcha();
            } else {
                result = strapi
                    .plugin('bag-strapi-plugin')
                    .service('captcha')
                    .generateImageCaptcha();
            }

            ctx.body = {
                success: true,
                data: result,
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `生成验证码失败: ${error.message}`,
            };
        }
    },

    /**
     * 刷新验证码
     */
    async refreshCaptcha(ctx) {
        try {
            const { captchaId } = ctx.request.body;

            const result = strapi
                .plugin('bag-strapi-plugin')
                .service('captcha')
                .refreshCaptcha(captchaId);

            ctx.body = {
                success: true,
                data: result,
                message: '验证码已刷新',
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `刷新验证码失败: ${error.message}`,
            };
        }
    },

    /**
     * 验证验证码（可选的独立验证接口）
     */
    async verifyCaptcha(ctx) {
        try {
            const { captchaId, captchaCode } = ctx.request.body;

            const result = strapi
                .plugin('bag-strapi-plugin')
                .service('captcha')
                .verifyCaptcha(captchaId, captchaCode);

            if (result.valid) {
                ctx.body = {
                    success: true,
                    message: result.message,
                };
            } else {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: result.message,
                    attemptsLeft: result.attemptsLeft,
                };
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `验证失败: ${error.message}`,
            };
        }
    },

    /**
     * 发送邮件验证码
     */
    async sendEmailCaptcha(ctx) {
        try {
            const { email } = ctx.request.body;

            if (!email) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: '邮箱地址不能为空',
                };
            }

            // 简单的邮箱格式验证
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: '邮箱格式不正确',
                };
            }

            const result = await strapi
                .plugin('bag-strapi-plugin')
                .service('captcha')
                .sendEmailCaptcha(email);

            ctx.body = result;
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `发送验证码失败: ${error.message}`,
            };
        }
    },

    /**
     * 发送短信验证码
     */
    async sendSmsCaptcha(ctx) {
        try {
            const { phone } = ctx.request.body;

            if (!phone) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: '手机号码不能为空',
                };
            }

            // 简单的手机号格式验证（中国大陆）
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(phone)) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: '手机号格式不正确',
                };
            }

            const result = await strapi
                .plugin('bag-strapi-plugin')
                .service('captcha')
                .sendSmsCaptcha(phone);

            ctx.body = result;
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `发送验证码失败: ${error.message}`,
            };
        }
    },

    /**
     * 获取验证码统计（调试用）
     */
    async getCaptchaStats(ctx) {
        try {
            const stats = strapi
                .plugin('bag-strapi-plugin')
                .service('captcha')
                .getCaptchaStats();

            ctx.body = {
                success: true,
                data: stats,
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `获取统计失败: ${error.message}`,
            };
        }
    },
});

export default controller;

