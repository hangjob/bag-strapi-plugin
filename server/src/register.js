import signVerify from './middlewares/sign-verify';
import cryptoUtils from './utils/crypto-utils';
import SignStorage from './utils/sign-storage';

const register = ({ strapi }) => {
    // 初始化签名存储
    const signStorage = new SignStorage(strapi);
    strapi.signStorage = signStorage;
    
    // 注册加密工具到全局
    console.log('🔧 [bag-strapi-plugin] 注册加密工具到全局');
    strapi.crypto = cryptoUtils;
    
    // 添加获取配置的辅助方法
    strapi.crypto.config = {
        getAesKey: () => {
            const config = strapi.config.get('plugin::bag-strapi-plugin.crypto') ||
                          strapi.config.get('plugin.bag-strapi-plugin.crypto', {});
            return config.aesKey || process.env.CRYPTO_AES_KEY || '';
        },
        getHmacSecret: () => {
            const config = strapi.config.get('plugin::bag-strapi-plugin.crypto') ||
                          strapi.config.get('plugin.bag-strapi-plugin.crypto', {});
            return config.hmacSecret || process.env.CRYPTO_HMAC_SECRET || '';
        },
        getTokenSecret: () => {
            const config = strapi.config.get('plugin::bag-strapi-plugin.crypto') ||
                          strapi.config.get('plugin.bag-strapi-plugin.crypto', {});
            return config.tokenSecret || process.env.CRYPTO_TOKEN_SECRET || '';
        },
        getRsaKeyLength: () => {
            const config = strapi.config.get('plugin::bag-strapi-plugin.crypto') ||
                          strapi.config.get('plugin.bag-strapi-plugin.crypto', {});
            return config.rsaKeyLength || 2048;
        },
        getRsaPublicKey: () => {
            const config = strapi.config.get('plugin::bag-strapi-plugin.crypto') ||
                          strapi.config.get('plugin.bag-strapi-plugin.crypto', {});
            return config.rsaPublicKey || process.env.CRYPTO_RSA_PUBLIC_KEY || '';
        },
        getRsaPrivateKey: () => {
            const config = strapi.config.get('plugin::bag-strapi-plugin.crypto') ||
                          strapi.config.get('plugin.bag-strapi-plugin.crypto', {});
            return config.rsaPrivateKey || process.env.CRYPTO_RSA_PRIVATE_KEY || '';
        },
        // 获取 RSA 密钥对（如果配置了则返回配置的，否则生成新的）
        getRsaKeyPair: () => {
            const publicKey = strapi.crypto.config.getRsaPublicKey();
            const privateKey = strapi.crypto.config.getRsaPrivateKey();
            
            if (publicKey && privateKey) {
                return { publicKey, privateKey };
            }
            
            // 如果未配置，生成新的密钥对
            const keyLength = strapi.crypto.config.getRsaKeyLength();
            return strapi.crypto.rsa.generateKeyPair(keyLength);
        },
    };
    
    console.log('✅ [bag-strapi-plugin] 加密工具注册完成');
    
    // 注册全局签名验证中间件
    console.log('🔧 [bag-strapi-plugin] 注册全局签名验证中间件');

    strapi.server.use(async (ctx, next) => {
        // 获取插件配置
        const config = strapi.config.get('plugin::bag-strapi-plugin.signVerify') ||
                       strapi.config.get('plugin.bag-strapi-plugin.signVerify', {});
        
        // 初始化签名存储（只初始化一次）
        if (!strapi.signStorage.initialized) {
            await strapi.signStorage.initialize(config);
            strapi.signStorage.initialized = true;
        }

        console.log('🔍 [中间件] 请求路径:', ctx.request.url);
        console.log('⚙️ [中间件] 配置:', JSON.stringify(config, null, 2));

        // 检查是否启用签名验证
        if (config.enabled !== true) {
            console.log('⏭️ [中间件] 签名验证未启用，跳过');
            return await next();
        }

        // 检查是否是插件的 API 路径
        const requestPath = ctx.request.url;

        // 只拦截插件的 API 请求
        if (!requestPath.startsWith(strapi.config.api.rest.prefix)) {
            console.log('⏭️ [中间件] 非插件路径，跳过');
            return await next();
        }

        console.log('✅ [中间件] 匹配插件路径，执行签名验证');

        // 检查白名单
        const whitelist = config.whitelist || [];
        const isWhitelisted = whitelist.some(pattern => {
            try {
                const regex = new RegExp(pattern);
                return regex.test(requestPath);
            } catch (err) {
                // 如果正则表达式无效，尝试精确匹配
                return requestPath === pattern;
            }
        });

        if (isWhitelisted) {
            console.log('⏭️ [中间件] 在白名单中，跳过验证');
            return await next();
        }

        // 执行签名验证
        console.log('🔐 [中间件] 开始执行签名验证');
        const middleware = signVerify(config, { strapi });
        await middleware(ctx, next);
    });

    console.log('✅ [bag-strapi-plugin] 全局中间件注册完成');
};

export default register;
