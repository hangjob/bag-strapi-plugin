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
       * 认证系统配置
       */
      auth: {
        // 是否启用验证码
        // 建议：开发环境设为 false，生产环境设为 true
        enableCaptcha: env.bool('ENABLE_CAPTCHA', true),
        
        // 验证码类型：'image' | 'math'
        captchaType: env('CAPTCHA_TYPE', 'image'),
        
        // 验证码长度（仅对字符验证码有效）
        captchaLength: env.int('CAPTCHA_LENGTH', 4),
        
        // 验证码过期时间（毫秒）
        captchaExpireTime: env.int('CAPTCHA_EXPIRE_TIME', 300000), // 5分钟
        
        // 验证码最大尝试次数
        captchaMaxAttempts: env.int('CAPTCHA_MAX_ATTEMPTS', 3),
        
        // JWT 配置
        jwt: {
          // JWT 密钥（强烈建议使用环境变量）
          secret: env('JWT_SECRET', 'your-secret-key-change-in-production'),
          // Token 过期时间
          expiresIn: env('JWT_EXPIRES_IN', '7d'),
        },
      },
      
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
       * API 限流配置（全局中间件）
       */
      rateLimit: {
        // 是否启用限流
        enabled: env.bool('RATE_LIMIT_ENABLED', true),
        
        // 默认限流配置（应用于所有 API）
        points: env.int('RATE_LIMIT_POINTS', 100),        // 时间窗口内允许的请求数
        duration: env.int('RATE_LIMIT_DURATION', 60),     // 时间窗口（秒）
        blockDuration: env.int('RATE_LIMIT_BLOCK', 0),    // 阻止时长（秒）
        
        // 存储方式：'memory' | 'redis'
        // memory: 单实例适用，重启后清空
        // redis: 多实例、分布式部署，需要配置 Redis
        storage: env('RATE_LIMIT_STORAGE', 'memory'),
        
        // IP 白名单（这些 IP 不受限流限制）
        whitelist: env.array('RATE_LIMIT_WHITELIST', [
          // '127.0.0.1',
          // '::1',
          // '192.168.*',
        ]),
        
        // 路径豁免（这些路径不应用限流）
        skipPaths: [
          '/admin',           // 管理后台
          '/_health',         // 健康检查
          '/uploads',         // 文件上传
        ],
        
        // 针对特定路径的限流规则（覆盖默认配置）
        pathRules: {
          // 登录接口：严格限流
          '/api/auth/login': {
            points: 5,
            duration: 900,      // 15分钟
            blockDuration: 1800, // 阻止30分钟
            message: '登录尝试次数过多，请30分钟后再试',
          },
          // 注册接口：更严格限流
          '/api/auth/register': {
            points: 3,
            duration: 3600,      // 1小时
            blockDuration: 7200, // 阻止2小时
            message: '注册次数过多，请2小时后再试',
          },
          // 验证码接口：适度限流
          '/api/captcha/*': {
            points: 10,
            duration: 60,
            message: '获取验证码过于频繁，请稍后再试',
          },
        },
        
        // 自定义响应消息
        message: env('RATE_LIMIT_MESSAGE', '请求过于频繁，请稍后再试'),
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

