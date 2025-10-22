/**
 * 高级签名验证中间件示例
 * 展示使用 crypto 进行 MD5/SHA256 签名验证
 */

import crypto from 'crypto';

export default (config, {strapi}) => {
    return async (ctx, next) => {
        // 从请求头中获取签名和时间戳
        const sign = ctx.request.headers['sign'] || ctx.request.headers['x-sign'];
        const timestamp = ctx.request.headers['timestamp'] || ctx.request.headers['x-timestamp'];
        const nonce = ctx.request.headers['nonce'] || ctx.request.headers['x-nonce'];

        // 1. 检查必要参数
        if (!sign) {
            return unauthorizedResponse(ctx, '缺少签名参数');
        }

        if (!timestamp) {
            return unauthorizedResponse(ctx, '缺少时间戳参数');
        }

        // 2. 验证时间戳（防止重放攻击）
        const now = Date.now();
        const requestTime = parseInt(timestamp);
        const timeWindow = config.timeWindow || 300000; // 默认5分钟

        if (Math.abs(now - requestTime) > timeWindow) {
            return unauthorizedResponse(ctx, '请求已过期');
        }

        // 3. 验证签名
        const secretKey = config.secretKey || process.env.SIGN_SECRET_KEY || 'default-secret-key';
        const isValid = verifySign(sign, timestamp, nonce, secretKey, ctx);

        if (!isValid) {
            return unauthorizedResponse(ctx, '签名验证失败');
        }

        // 4. 验证通过，继续执行
        await next();
    };
};

/**
 * 签名验证函数
 * 签名算法: MD5(timestamp + nonce + secretKey + body)
 */
function verifySign(sign, timestamp, nonce, secretKey, ctx) {
    try {
        // 获取请求体（如果有）
        const body = ctx.request.body ? JSON.stringify(ctx.request.body) : '';

        // 构造签名字符串
        const signString = `${timestamp}${nonce || ''}${secretKey}${body}`;

        // 计算预期签名
        const expectedSign = crypto
            .createHash('md5')
            .update(signString)
            .digest('hex');

        // 比较签名（不区分大小写）
        return sign.toLowerCase() === expectedSign.toLowerCase();
    } catch (error) {
        console.error('签名验证错误:', error);
        return false;
    }
}

/**
 * 返回未授权响应
 */
function unauthorizedResponse(ctx, message) {
    ctx.status = 401;
    ctx.body = {
        error: {
            status: 401,
            name: 'UnauthorizedError',
            message: '无权限访问',
            details: {
                message: message,
                timestamp: Date.now(),
            }
        }
    };
}

