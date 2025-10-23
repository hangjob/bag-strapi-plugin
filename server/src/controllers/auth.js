/**
 * 认证控制器
 */

const controller = ({ strapi }) => ({
    /**
     * 用户注册
     */
    async register(ctx) {
        try {
            const { captchaId, captchaCode, ...data } = ctx.request.body;

            // 从插件配置中获取验证码启用状态
            const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
            const captchaEnabled = pluginConfig?.auth?.enableCaptcha ?? true; // 默认启用
            
            if (captchaEnabled) {
                if (!captchaId || !captchaCode) {
                    ctx.status = 400;
                    return ctx.body = {
                        success: false,
                        message: '请提供验证码',
                    };
                }

                const captchaResult = strapi
                    .plugin('bag-strapi-plugin')
                    .service('captcha')
                    .verifyCaptcha(captchaId, captchaCode);

                if (!captchaResult.valid) {
                    ctx.status = 400;
                    return ctx.body = {
                        success: false,
                        message: captchaResult.message,
                        attemptsLeft: captchaResult.attemptsLeft,
                    };
                }
            }

            const result = await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .register(data);

            ctx.body = {
                success: true,
                message: '注册成功',
                data: result,
            };
        } catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: error.message,
            };
        }
    },

    /**
     * 用户登录
     */
    async login(ctx) {
        try {
            const { captchaId, captchaCode, identifier, password } = ctx.request.body;

            // 从插件配置中获取验证码启用状态
            const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
            const captchaEnabled = pluginConfig?.auth?.enableCaptcha ?? true; // 默认启用
            
            if (captchaEnabled) {
                if (!captchaId || !captchaCode) {
                    ctx.status = 400;
                    return ctx.body = {
                        success: false,
                        message: '请提供验证码',
                    };
                }

                const captchaResult = strapi
                    .plugin('bag-strapi-plugin')
                    .service('captcha')
                    .verifyCaptcha(captchaId, captchaCode);

                if (!captchaResult.valid) {
                    ctx.status = 400;
                    return ctx.body = {
                        success: false,
                        message: captchaResult.message,
                        attemptsLeft: captchaResult.attemptsLeft,
                    };
                }
            }

            const result = await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .login(identifier, password);

            ctx.body = {
                success: true,
                message: '登录成功',
                data: result,
            };
        } catch (error) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                message: error.message,
            };
        }
    },

    /**
     * 获取当前用户信息
     */
    async me(ctx) {
        try {
            const token = ctx.request.header.authorization?.replace('Bearer ', '');

            if (!token) {
                ctx.status = 401;
                return ctx.body = {
                    success: false,
                    message: '未提供认证信息',
                };
            }

            const user = await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .validateUser(token);

            ctx.body = {
                success: true,
                data: user,
            };
        } catch (error) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                message: error.message,
            };
        }
    },

    /**
     * 刷新 Token
     */
    async refreshToken(ctx) {
        try {
            const { token } = ctx.request.body;

            if (!token) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: '未提供 Token',
                };
            }

            const newToken = await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .refreshToken(token);

            ctx.body = {
                success: true,
                message: 'Token 刷新成功',
                data: {
                    token: newToken,
                },
            };
        } catch (error) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                message: error.message,
            };
        }
    },

    /**
     * 修改密码
     */
    async changePassword(ctx) {
        try {
            const token = ctx.request.header.authorization?.replace('Bearer ', '');

            if (!token) {
                ctx.status = 401;
                return ctx.body = {
                    success: false,
                    message: '未提供认证信息',
                };
            }

            const user = await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .validateUser(token);

            const { oldPassword, newPassword } = ctx.request.body;

            if (!oldPassword || !newPassword) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: '原密码和新密码为必填项',
                };
            }

            await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .changePassword(user.id, oldPassword, newPassword);

            ctx.body = {
                success: true,
                message: '密码修改成功',
            };
        } catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: error.message,
            };
        }
    },

    /**
     * 重置密码（忘记密码）
     */
    async resetPassword(ctx) {
        try {
            const { identifier, newPassword } = ctx.request.body;

            if (!identifier || !newPassword) {
                ctx.status = 400;
                return ctx.body = {
                    success: false,
                    message: '用户名/邮箱和新密码为必填项',
                };
            }

            // 注意：在生产环境中，这里应该添加验证码或邮箱验证等安全措施
            await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .resetPassword(identifier, newPassword);

            ctx.body = {
                success: true,
                message: '密码重置成功',
            };
        } catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: error.message,
            };
        }
    },

    /**
     * 登出（客户端处理，清除本地 Token）
     */
    async logout(ctx) {
        ctx.body = {
            success: true,
            message: '登出成功，请清除本地 Token',
        };
    },
});

export default controller;

