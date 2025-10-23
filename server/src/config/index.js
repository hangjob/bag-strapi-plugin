export default {
    default: {
        // 认证系统配置
        auth: {
            // 是否启用验证码（默认启用）
            enableCaptcha: true,

            // 验证码类型：'image' | 'math' | 'sms' | 'email'
            captchaType: 'image',

            // 验证码长度（字符验证码）
            captchaLength: 4,

            // 验证码过期时间（毫秒）
            captchaExpireTime: 300000, // 5分钟

            // 验证码最大尝试次数
            captchaMaxAttempts: 3,

            // JWT 配置
            jwt: {
                // JWT 密钥（强烈建议在主项目配置中使用环境变量覆盖）
                secret: '',  // 用户必须配置
                // Token 过期时间
                expiresIn: '7d',
            },
        },

        // API 限流配置
        rateLimit: {
            // 是否启用限流（默认关闭，由用户决定是否启用）
            enabled: true,

            // 限流配置
            points: 100,           // 时间窗口内允许的请求数
            duration: 60,          // 时间窗口（秒）
            blockDuration: 0,      // 阻止时长（秒），0 表示不阻止

            // 存储方式：'memory' | 'redis'
            storage: 'memory',

            // IP 白名单（这些 IP 不受限流限制）
            whitelist: [],

            // 路径豁免（这些路径不受限流限制）
            skipPaths: [
                '/admin',           // 管理后台
                '/_health',         // 健康检查
                '/uploads',         // 文件上传路径
            ],

            // 针对特定路径的限流规则（可选）
            pathRules: {
                // 登录接口：5次/15分钟
                '/api/auth/login': {
                    points: 5,
                    duration: 900,
                    blockDuration: 1800,
                    message: '登录尝试次数过多，请30分钟后再试',
                },
                // 注册接口：3次/小时
                '/api/auth/register': {
                    points: 3,
                    duration: 3600,
                    blockDuration: 7200,
                    message: '注册次数过多，请2小时后再试',
                },
                // 验证码接口：10次/分钟
                '/api/captcha/*': {
                    points: 10,
                    duration: 60,
                    message: '获取验证码过于频繁，请稍后再试',
                },
            },

            // 自定义响应消息
            message: '请求过于频繁，请稍后再试222',
        },

        // 签名验证中间件默认配置
        // 用户可以在主项目的 config/plugins.js 中覆盖这些配置
        signVerify: {
            // 是否启用签名验证（默认关闭，由用户决定是否启用）
            enabled: false,

            // 验证模式：'simple' | 'encrypted' | 'both'
            // simple: 简单签名列表验证
            // encrypted: 加密签名验证（解密后需包含 'bag'）
            // both: 两种模式都支持
            mode: 'encrypted',

            // 有效的签名列表（简单模式）
            validSigns: [],

            // 加密签名密钥（用于解密签名）
            encryptionKey: '',  // 如果为空，使用 crypto.aesKey

            // 是否启用一次性签名（签名只能使用一次）
            enableOnceOnly: true,

            // 一次性签名的存储方式：'memory' | 'database'
            onceOnlyStorage: 'memory',

            // 签名过期时间（毫秒），仅用于一次性签名清理
            signExpiration: 3600000,  // 1小时

            // 或者使用密钥（高级模式）
            // secretKey: process.env.SIGN_SECRET_KEY,
            // timeWindow: 300000, // 5分钟

            // 白名单：不需要验证签名的路径（正则表达式）
            whitelist: ["/api/bag-strapi-plugin/crypto"],
        },

        // 加密工具配置
        crypto: {
            // AES 加密默认密钥（强烈建议在主项目中使用环境变量覆盖）
            aesKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',  // 用户必须配置，至少32字符

            // RSA 密钥长度（用于生成密钥时）
            rsaKeyLength: 2048,  // 2048 或 4096

            // RSA 公钥（PEM 格式）
            rsaPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzaDA5lPp8q20g2ygQwOC
7/ADJw5sGfJQ7c3R0+cPQ125JXliK+3v1Ku5NdACcQylsnutU/Jx6xQ7pRHdZ1Nf
/nURwuWO2m+AW0ecU3mN4Wnj71UArcmybmWrKwrd8gFeuZSv8R5Me4HEJREIBpmh
TlRn83/VaBtuR5wbMuoPW4DA+bcQKYchPIiNvhqEiAQjOAX3UkZwn+aMhVjGpdd6
zedsIHnrEdFJEsf47rRFimwn69DDQfPPpbq4yXooXc8mo4AEODLIZA9N/HRcdTxp
czX1XK6WFBk8Ngo7YzEuNFse8XRIw0pV/GWzMCJkbZu1/Pn8JJDgUjMHMijsst4n
VQIDAQAB
-----END PUBLIC KEY-----`,  // 用户可选配置

            // RSA 私钥（PEM 格式）
            rsaPrivateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDNoMDmU+nyrbSD
bKBDA4Lv8AMnDmwZ8lDtzdHT5w9DXbkleWIr7e/Uq7k10AJxDKWye61T8nHrFDul
Ed1nU1/+dRHC5Y7ab4BbR5xTeY3haePvVQCtybJuZasrCt3yAV65lK/xHkx7gcQl
EQgGmaFOVGfzf9VoG25HnBsy6g9bgMD5txAphyE8iI2+GoSIBCM4BfdSRnCf5oyF
WMal13rN52wgeesR0UkSx/jutEWKbCfr0MNB88+lurjJeihdzyajgAQ4MshkD038
dFx1PGlzNfVcrpYUGTw2CjtjMS40Wx7xdEjDSlX8ZbMwImRtm7X8+fwkkOBSMwcy
KOyy3idVAgMBAAECggEAC8jmxUyR3+KsscuL88tDudSbmaVt9J66nKZrHCXl7gp1
DfzC75mXYSzmVHszaJ8879m+uUzv0nU6Zd98POu+WKsE9ZKKeWJijNix0Obqhry2
34SToWIp48HX6YOZ7MC/WQt4ee0unPV29FjhiN9NK1wTCRWOeYT48Qm1VVmsv6Wr
GYkPfh0XY9WGVyuNcpYdpQW/B0UZox/ghivAExkP5xeUC0xyJcJUMOYv3trWcElX
aMvQ5nxvAEZotijJa1pyL22XWM/2HJXk7506ZeDARgtIVFCZd7mzGUjcl+MBwXvH
Sp5x99VwaOHyIzRdEYVHVWAu+JteSi6dNC6fAR+XkQKBgQDtEOVKiPnsWGByaTpv
YmbBSO+CMdN7IMDRvpdE7ml2ZQiZZA1R5O24J9jO3k6K7LfaIG2f3EO58qaoD05/
/7JqEQZLlpIOCx9ZooL8eF8tT2PhUvFfOnQ0vWRqQ7t/5ynqpbVJemshBAa3vO6N
VahVjbXv9DVfpHgKjpbNzHTs6wKBgQDeDRF/WEPEO1YIeQGS9Nf7e856yGFy5DCo
pKiLVku74SLEXPhb9LHQfkPmYXToekb/8viyXw3ErhMuIfDMWGVskE9GPEGnOdtn
TG+9BAK2Fn3yQmIIwORcDlMU9PTjKI4eUnGHt5mrZ/0st7wjB27R8MxW1fURnMQG
iSM3LnssvwKBgQDOQBbdJBMcdz9iCv8WDSyNGSGXyjXOOA7J7OG6zRngMcKrgYq9
J0lTIQfV4z++SnkiQ3hczsv1qZEpQjfv0MyuzyUE+nkT0sVxvJvtf+R+jUW+seTi
Dv8vK1+DvG4St1GWnpj81o8B6HjXvn5lZJLR7DrQC02sanEt7iRx5GIOBQKBgHwZ
S6UjHESIcO2tSy7pfegD6oL+iE/grj0iQTwWT59CFN8vonIqEFKYrrQL1X20EQgs
r8dojlZUf02yFFTwNkb1ZAi51mtyT2es9Wnq2uUPLvZ9GTMRMs8sBkzZFh/6Y2sY
4nBaMRz1si4SxafCGLJmZJ1HWH6uYXPRowfNB3QbAoGAY0zM+qjiEx+6wQMueMpG
FKRLS4+5BK8fUonP8RJYA5VTe0d3FWgUcVVMHtQuS5hS4RraUim/8WoGWGJSEcbz
yi0lLL9EzB+MQOaeKqJ2YUnTnD0PtXsOWmjB9oP5H+k2MSbOd13c3R/52tECbWIn
om6c176m62OzROzphQ7XaRY=
-----END PRIVATE KEY-----`,  // 用户可选配置

            // HMAC 密钥
            hmacSecret: '',  // 用户必须配置

            // Token 密钥
            tokenSecret: '',  // 用于生成和验证 token
        },
    },
    validator() {
    },
};
