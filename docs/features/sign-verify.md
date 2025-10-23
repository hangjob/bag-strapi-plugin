# 签名验证

全局签名验证中间件，支持简单签名和加密签名验证，防止 API 被非法调用。

## 功能特性

- ✅ **简单签名** - 固定字符串验证
- ✅ **加密签名** - 解密后验证
- ✅ **一次性签名** - 防止重放攻击
- ✅ 白名单机制
- ✅ 自动过期清理
- ✅ 三种验证模式

## 配置

### 1. 简单签名模式

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      signVerify: {
        enabled: true,
        mode: 'simple',
        validSigns: [
          'your-sign-key-here',
          'another-sign-key',
        ],
        whitelist: [
          '/health',
          '/public/.*',
        ],
      },
    },
  },
});
```

### 2. 加密签名模式

```javascript
signVerify: {
  enabled: true,
  mode: 'encrypted',
  encryptedSign: {
    enabled: true,
    aesKey: env('ENCRYPTED_SIGN_AES_KEY'),
    verifyContent: 'bag',
  },
}
```

### 3. 一次性签名

```javascript
signVerify: {
  enabled: true,
  onceSign: {
    enabled: true,
    expireTime: 300000,  // 5分钟
  },
}
```

## 使用方法

### 简单签名

客户端发送请求时添加 `sign` 请求头：

```javascript
fetch('http://localhost:1337/api/endpoint', {
  headers: {
    'sign': 'your-sign-key-here',
  },
});
```

### 加密签名

1. 生成加密签名：

```javascript
// 使用插件提供的工具生成
const aesKey = 'your-aes-key-32-chars!!';
const content = 'bag';
const encrypted = strapi.crypto.aes.encryptSimple(content, aesKey);
```

2. 使用加密签名：

```javascript
fetch('http://localhost:1337/api/endpoint', {
  headers: {
    'sign': encrypted,
  },
});
```

### 一次性签名

每次请求使用不同的签名，签名使用后立即失效。

## 白名单配置

不需要签名验证的路径：

```javascript
whitelist: [
  '/health',
  '/version',
  '/public/.*',  // 正则表达式
]
```

## 环境变量

```env
SIGN_VERIFY_ENABLED=true
SIGN_VERIFY_MODE=simple
API_SIGN_KEYS=key1,key2,key3

ENCRYPTED_SIGN_ENABLED=false
ENCRYPTED_SIGN_AES_KEY=your-encrypted-sign-aes-key-32ch

ONCE_SIGN_ENABLED=false
ONCE_SIGN_EXPIRE_TIME=300000
```

## 相关链接

- [配置指南](/guide/configuration)
- [加密工具](/features/crypto)

