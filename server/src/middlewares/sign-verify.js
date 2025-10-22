/**
 * 签名验证中间件
 * 用于验证请求 header 中的 sign 签名
 */

export default (config, { strapi }) => {
    return async (ctx, next) => {
        console.log('🔐 [sign-verify] 签名验证中间件被调用');
        console.log('🔐 [sign-verify] 配置:', JSON.stringify(config, null, 2));
        
        // 从请求头中获取签名
        const sign = ctx.request.headers['sign'] || ctx.request.headers['x-sign'];
        console.log('🔐 [sign-verify] 请求签名:', sign);
        
        // 如果没有提供签名，返回 401 错误
        if (!sign) {
            console.log('❌ [sign-verify] 缺少签名，返回 401');
            ctx.status = 401;
            ctx.body = {
                error: {
                    status: 401,
                    name: 'UnauthorizedError',
                    message: '无权限访问：缺少签名',
                    details: {
                        message: '请在请求头中携带 sign 参数'
                    }
                }
            };
            return;
        }

        // 验证签名（传入 strapi 对象）
        const isValid = await verifySign(sign, ctx, config, strapi);
        console.log('🔐 [sign-verify] 签名验证结果:', isValid);

        if (!isValid) {
            console.log('❌ [sign-verify] 签名验证失败，返回 401');
            ctx.status = 401;
            ctx.body = {
                error: {
                    status: 401,
                    name: 'UnauthorizedError',
                    message: '无权限访问：签名验证失败',
                    details: {
                        message: '提供的签名无效或已过期'
                    }
                }
            };
            return;
        }

        console.log('✅ [sign-verify] 签名验证通过，继续执行');
        // 签名验证通过，继续执行后续中间件
        await next();
    };
};

/**
 * 验证签名的函数
 * 支持多种验证模式：简单签名、加密签名、一次性签名
 */
async function verifySign(sign, ctx, config, strapi) {
    console.log('🔍 [verifySign] 开始验证签名');
    console.log('🔍 [verifySign] 验证模式:', config.mode || 'both');
    
    const mode = config.mode || 'both';
    
    // 1. 检查一次性签名
    if (config.enableOnceOnly) {
        console.log('🔍 [verifySign] 检查一次性签名');
        const isUsed = await strapi.signStorage.isUsed(sign);
        
        if (isUsed) {
            console.log('❌ [verifySign] 签名已使用过（一次性签名验证失败）');
            return false;
        }
    }
    
    let isValid = false;
    
    // 2. 根据模式验证签名
    if (mode === 'simple') {
        // 简单模式：签名列表验证
        isValid = await verifySimpleSign(sign, config);
    } else if (mode === 'encrypted') {
        // 加密模式：解密后验证包含 'bag'
        isValid = await verifyEncryptedSign(sign, config, strapi);
    } else if (mode === 'both') {
        // 两种模式都支持
        const simpleValid = await verifySimpleSign(sign, config);
        const encryptedValid = await verifyEncryptedSign(sign, config, strapi);
        isValid = simpleValid || encryptedValid;
    }
    
    // 3. 如果验证通过且启用一次性签名，标记为已使用
    if (isValid && config.enableOnceOnly) {
        const expiration = config.signExpiration || 3600000;
        await strapi.signStorage.markAsUsed(sign, expiration);
        console.log('✅ [verifySign] 签名已标记为使用');
    }
    
    console.log('🔍 [verifySign] 最终验证结果:', isValid);
    return isValid;
}

/**
 * 简单签名验证：检查签名是否在白名单中
 */
async function verifySimpleSign(sign, config) {
    const validSigns = config.validSigns || [];
    
    console.log('🔍 [verifySimpleSign] 有效签名列表:', validSigns);
    console.log('🔍 [verifySimpleSign] 提供的签名:', sign);
    
    const isValid = validSigns.includes(sign);
    console.log('🔍 [verifySimpleSign] 签名是否在列表中:', isValid);
    
    return isValid;
}

/**
 * 加密签名验证：解密签名，检查是否包含 'bag'
 */
async function verifyEncryptedSign(sign, config, strapi) {
    try {
        console.log('🔐 [verifyEncryptedSign] 开始解密签名');
        
        // 获取解密密钥
        let encryptionKey = config.encryptionKey;
        
        // 如果未配置加密密钥，使用 crypto.aesKey
        if (!encryptionKey) {
            encryptionKey = strapi.crypto.config.getAesKey();
        }
        
        if (!encryptionKey) {
            console.log('❌ [verifyEncryptedSign] 解密密钥未配置');
            return false;
        }
        
        console.log('🔐 [verifyEncryptedSign] 使用密钥长度:', encryptionKey.length);
        
        // 解密签名
        const decrypted = strapi.crypto.aes.decryptSimple(sign, encryptionKey);
        console.log('🔐 [verifyEncryptedSign] 解密结果:', decrypted);
        
        // 检查是否包含 'bag'
        const containsBag = decrypted.includes('bag');
        console.log('🔐 [verifyEncryptedSign] 是否包含 "bag":', containsBag);
        
        return containsBag;
    } catch (error) {
        console.log('❌ [verifyEncryptedSign] 解密失败:', error.message);
        return false;
    }
}

