/**
 * 验证码服务
 * 
 * 支持图形验证码和数字验证码
 */

import svgCaptcha from 'svg-captcha';
import crypto from 'crypto';

// 验证码存储（内存存储，生产环境建议使用 Redis）
const captchaStore = new Map();

// 清理过期验证码的定时器
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of captchaStore.entries()) {
        if (value.expiresAt < now) {
            captchaStore.delete(key);
        }
    }
}, 60000); // 每分钟清理一次

const service = ({ strapi }) => ({
    /**
     * 生成图形验证码
     */
    generateImageCaptcha(options = {}) {
        // 从插件配置中获取验证码配置
        const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
        const authConfig = pluginConfig?.auth || {};
        
        const defaultOptions = {
            size: authConfig.captchaLength || 4,  // 验证码长度
            ignoreChars: '0o1il', // 排除容易混淆的字符
            noise: 2,          // 干扰线数量
            color: true,       // 使用彩色
            background: '#f0f0f0', // 背景色
            width: 120,
            height: 40,
            fontSize: 50,
        };

        const captcha = svgCaptcha.create({
            ...defaultOptions,
            ...options,
        });

        // 生成唯一 ID
        const captchaId = crypto.randomBytes(16).toString('hex');
        
        // 设置过期时间（从插件配置中获取）
        const expireTime = authConfig.captchaExpireTime || 300000; // 默认5分钟
        const expiresAt = Date.now() + expireTime;

        // 存储验证码（转为小写便于验证）
        captchaStore.set(captchaId, {
            code: captcha.text.toLowerCase(),
            expiresAt,
            attempts: 0, // 尝试次数
        });

        return {
            captchaId,
            captchaImage: captcha.data, // SVG 图片
            expiresAt,
        };
    },

    /**
     * 生成数学运算验证码
     */
    generateMathCaptcha(options = {}) {
        const defaultOptions = {
            mathMin: 1,
            mathMax: 10,
            mathOperator: '+',
            color: true,
            background: '#f0f0f0',
            width: 120,
            height: 40,
        };

        const pluginConfig2 = strapi.config.get('plugin::bag-strapi-plugin');
        const authConfig2 = pluginConfig2?.auth || {};
        
        const captcha = svgCaptcha.createMathExpr({
            ...defaultOptions,
            ...options,
        });

        const captchaId = crypto.randomBytes(16).toString('hex');
        
        // 设置过期时间
        const expireTime = authConfig2.captchaExpireTime || 300000;
        const expiresAt = Date.now() + expireTime;

        captchaStore.set(captchaId, {
            code: captcha.text.toLowerCase(),
            expiresAt,
            attempts: 0,
        });

        return {
            captchaId,
            captchaImage: captcha.data,
            expiresAt,
        };
    },

    /**
     * 生成数字验证码（用于短信/邮件）
     */
    generateNumericCaptcha(length = 6) {
        // 生成随机数字验证码
        let code = '';
        for (let i = 0; i < length; i++) {
            code += Math.floor(Math.random() * 10);
        }

        const pluginConfig3 = strapi.config.get('plugin::bag-strapi-plugin');
        const authConfig3 = pluginConfig3?.auth || {};
        
        const captchaId = crypto.randomBytes(16).toString('hex');
        
        // 设置过期时间
        const expireTime = authConfig3.captchaExpireTime || 300000;
        const expiresAt = Date.now() + expireTime;

        captchaStore.set(captchaId, {
            code: code,
            expiresAt,
            attempts: 0,
        });

        return {
            captchaId,
            code, // 注意：实际使用时不应该返回 code，应该通过短信/邮件发送
            expiresAt,
        };
    },

    /**
     * 验证验证码
     */
    verifyCaptcha(captchaId, userInput) {
        if (!captchaId || !userInput) {
            return {
                valid: false,
                message: '验证码ID和验证码不能为空',
            };
        }

        const stored = captchaStore.get(captchaId);

        if (!stored) {
            return {
                valid: false,
                message: '验证码不存在或已过期',
            };
        }

        // 检查是否过期
        if (stored.expiresAt < Date.now()) {
            captchaStore.delete(captchaId);
            return {
                valid: false,
                message: '验证码已过期',
            };
        }

        // 从插件配置中获取最大尝试次数
        const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
        const authConfig = pluginConfig?.auth || {};
        const maxAttempts = authConfig.captchaMaxAttempts || 3;

        // 检查尝试次数（防止暴力破解）
        if (stored.attempts >= maxAttempts) {
            captchaStore.delete(captchaId);
            return {
                valid: false,
                message: '验证码尝试次数过多，请重新获取',
            };
        }

        // 增加尝试次数
        stored.attempts += 1;

        // 验证（不区分大小写）
        const isValid = stored.code === userInput.toLowerCase().trim();

        if (isValid) {
            // 验证成功后删除验证码（一次性使用）
            captchaStore.delete(captchaId);
            return {
                valid: true,
                message: '验证成功',
            };
        } else {
            // 从插件配置中获取最大尝试次数
            const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
            const authConfig = pluginConfig?.auth || {};
            const maxAttempts = authConfig.captchaMaxAttempts || 3;
            
            return {
                valid: false,
                message: '验证码错误',
                attemptsLeft: maxAttempts - stored.attempts,
            };
        }
    },

    /**
     * 刷新验证码（删除旧的）
     */
    refreshCaptcha(captchaId) {
        if (captchaId) {
            captchaStore.delete(captchaId);
        }
        return this.generateImageCaptcha();
    },

    /**
     * 获取验证码存储状态（调试用）
     */
    getCaptchaStats() {
        const now = Date.now();
        const stats = {
            total: captchaStore.size,
            valid: 0,
            expired: 0,
        };

        for (const [key, value] of captchaStore.entries()) {
            if (value.expiresAt >= now) {
                stats.valid += 1;
            } else {
                stats.expired += 1;
            }
        }

        return stats;
    },

    /**
     * 清除所有验证码（慎用）
     */
    clearAllCaptchas() {
        captchaStore.clear();
        return { message: '已清除所有验证码' };
    },

    /**
     * 发送邮件验证码（示例，需要配置邮件服务）
     */
    async sendEmailCaptcha(email) {
        const { captchaId, code } = this.generateNumericCaptcha(6);

        try {
            // 使用 Strapi 的邮件插件发送
            // 注意：需要先安装和配置 @strapi/provider-email-*
            
            // 示例代码（需要配置邮件服务）
            /*
            await strapi.plugins.email.services.email.send({
                to: email,
                from: 'noreply@yourdomain.com',
                subject: '验证码',
                text: `您的验证码是：${code}，有效期5分钟。`,
                html: `<p>您的验证码是：<strong>${code}</strong>，有效期5分钟。</p>`,
            });
            */

            // 开发环境：直接返回验证码（生产环境应删除）
            console.log(`邮件验证码 [${email}]: ${code}`);

            return {
                success: true,
                captchaId,
                message: '验证码已发送到邮箱',
                // 生产环境中删除下面这行
                code: process.env.NODE_ENV === 'development' ? code : undefined,
            };
        } catch (error) {
            console.error('发送邮件验证码失败:', error);
            return {
                success: false,
                message: '发送验证码失败',
            };
        }
    },

    /**
     * 发送短信验证码（示例，需要配置短信服务）
     */
    async sendSmsCaptcha(phone) {
        const { captchaId, code } = this.generateNumericCaptcha(6);

        try {
            // 这里需要集成短信服务商 API（如阿里云、腾讯云等）
            // 示例代码
            /*
            await smsService.send({
                phone: phone,
                template: 'SMS_TEMPLATE_ID',
                params: { code: code }
            });
            */

            // 开发环境：直接返回验证码（生产环境应删除）
            console.log(`短信验证码 [${phone}]: ${code}`);

            return {
                success: true,
                captchaId,
                message: '验证码已发送到手机',
                // 生产环境中删除下面这行
                code: process.env.NODE_ENV === 'development' ? code : undefined,
            };
        } catch (error) {
            console.error('发送短信验证码失败:', error);
            return {
                success: false,
                message: '发送验证码失败',
            };
        }
    },
});

export default service;

