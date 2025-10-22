/**
 * bag-strapi-plugin 配置模板
 * 
 * 将此文件的内容复制到你的 Strapi 项目的 config/plugins.js 中
 */

module.exports = ({ env }) => ({
  // ... 其他插件配置
  
  /**
   * bag-strapi-plugin 配置
   */
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      /**
       * 加密工具配置
       */
      crypto: {
        // AES 对称加密密钥（至少32字符）
        aesKey: env('CRYPTO_AES_KEY', 'your-aes-key-at-least-32-chars!!'),
        
        // RSA 密钥长度（用于生成密钥时，2048 或 4096）
        rsaKeyLength: 2048,
        
        // RSA 公钥（PEM 格式，可选）
        // 如果不配置，每次调用 getRsaKeyPair() 会生成新的密钥对
        rsaPublicKey: env('CRYPTO_RSA_PUBLIC_KEY', ''),
        
        // RSA 私钥（PEM 格式，可选）
        rsaPrivateKey: env('CRYPTO_RSA_PRIVATE_KEY', ''),
        
        // HMAC 密钥
        hmacSecret: env('CRYPTO_HMAC_SECRET', 'your-hmac-secret-key'),
        
        // Token 密钥
        tokenSecret: env('CRYPTO_TOKEN_SECRET', 'your-token-secret-key'),
      },
      
      /**
       * 签名验证中间件配置
       */
      signVerify: {
        // 是否启用签名验证
        // 建议：开发环境设为 false，生产环境设为 true
        enabled: env.bool('SIGN_VERIFY_ENABLED', true),
        
        // 验证模式：'simple' | 'encrypted' | 'both'
        // simple: 简单签名列表验证
        // encrypted: 加密签名验证（解密后需包含 'bag'）
        // both: 两种模式都支持
        mode: env('SIGN_VERIFY_MODE', 'both'),
        
        // ============================================
        // 方式一：简单签名模式（推荐快速开始）
        // ============================================
        
        // 有效的签名列表
        validSigns: [
          env('API_SIGN_KEY', 'your-sign-key-here'),
          // 可以配置多个签名，用于不同的客户端
          // env('API_SIGN_FRONTEND'),
          // env('API_SIGN_MOBILE'),
          // env('API_SIGN_ADMIN'),
        ],
        
        // ============================================
        // 加密签名配置
        // ============================================
        
        // 加密签名密钥（用于解密签名，如果为空则使用 crypto.aesKey）
        encryptionKey: env('SIGN_ENCRYPTION_KEY', ''),
        
        // ============================================
        // 一次性签名配置
        // ============================================
        
        // 是否启用一次性签名（签名只能使用一次）
        enableOnceOnly: env.bool('SIGN_ONCE_ONLY', false),
        
        // 一次性签名的存储方式：'memory' | 'database'
        onceOnlyStorage: 'memory',
        
        // 签名过期时间（毫秒）
        signExpiration: env.int('SIGN_EXPIRATION', 3600000),  // 默认1小时
        
        // ============================================
        // 方式二：高级加密模式（更安全，需要动态生成签名）
        // ============================================
        
        // 如果使用高级模式，注释掉上面的 validSigns，启用下面的配置
        // secretKey: env('SIGN_SECRET_KEY', 'your-secret-key'),
        // timeWindow: 300000,  // 签名有效期（毫秒），默认5分钟
        
        // ============================================
        // 白名单配置（可选）
        // ============================================
        
        // 不需要验证签名的接口路径（支持正则表达式）
        whitelist: env.array('SIGN_WHITELIST', [
          // '/bag-strapi-plugin/health',      // 健康检查
          // '/bag-strapi-plugin/version',     // 版本信息
          // '/bag-strapi-plugin/public/.*',   // 所有 public 接口
        ]),
      },
    },
  },
});

