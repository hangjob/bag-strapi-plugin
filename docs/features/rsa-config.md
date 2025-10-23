# RSA 配置详解

如何配置和使用固定的 RSA 密钥对。

## 为什么需要固定 RSA 密钥对？

默认情况下，每次启动 Strapi 时会生成新的 RSA 密钥对。在以下场景中，你可能需要固定的密钥对：

1. **分布式部署** - 多个实例需要使用相同的密钥对
2. **数据持久化** - 使用 RSA 加密的数据需要在重启后解密
3. **第三方集成** - 需要向第三方提供固定的公钥

## 生成 RSA 密钥对

### 方法 1: 使用 OpenSSL

```bash
# 生成私钥
openssl genrsa -out private.pem 2048

# 从私钥生成公钥
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

### 方法 2: 使用 Node.js

```javascript
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('Public Key:');
console.log(publicKey);
console.log('\nPrivate Key:');
console.log(privateKey);
```

## 配置固定密钥对

### 1. 环境变量方式（推荐）

在 `.env` 文件中：

```env
CRYPTO_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"

CRYPTO_RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA...
-----END PRIVATE KEY-----"
```

在 `config/plugins.js` 中：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        rsa: {
          publicKey: env('CRYPTO_RSA_PUBLIC_KEY'),
          privateKey: env('CRYPTO_RSA_PRIVATE_KEY'),
        },
      },
    },
  },
});
```

### 2. 文件方式

将密钥保存为文件：

```
config/
  ├── keys/
  │   ├── public.pem
  │   └── private.pem
```

在 `config/plugins.js` 中：

```javascript
const fs = require('fs');
const path = require('path');

module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        rsa: {
          publicKey: fs.readFileSync(
            path.join(__dirname, 'keys/public.pem'),
            'utf8'
          ),
          privateKey: fs.readFileSync(
            path.join(__dirname, 'keys/private.pem'),
            'utf8'
          ),
        },
      },
    },
  },
});
```

## 使用固定密钥对

```javascript
// 获取配置的密钥对
const rsaKeys = strapi.crypto.config.getRsaKeys();

// 加密
const encrypted = strapi.crypto.rsa.encrypt('data', rsaKeys.publicKey);

// 解密
const decrypted = strapi.crypto.rsa.decrypt(encrypted, rsaKeys.privateKey);
```

## 安全建议

1. ✅ 不要将私钥提交到版本控制
2. ✅ 在 `.gitignore` 中添加密钥文件
3. ✅ 使用环境变量管理密钥
4. ✅ 定期轮换密钥对
5. ✅ 妥善保管私钥

## 相关链接

- [加密工具库](/features/crypto)
- [加密配置详解](/features/crypto-config)

