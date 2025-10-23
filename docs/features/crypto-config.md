# 加密配置详解

加密工具库的详细配置说明。

## 完整配置

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        // AES 密钥（至少 32 字符）
        aesKey: env('CRYPTO_AES_KEY'),
        
        // HMAC 密钥
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        
        // Token 密钥
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
        
        // RSA 密钥长度
        rsaKeyLength: env.int('CRYPTO_RSA_KEY_LENGTH', 2048),
        
        // 固定 RSA 密钥对（可选）
        rsa: {
          publicKey: env('CRYPTO_RSA_PUBLIC_KEY'),
          privateKey: env('CRYPTO_RSA_PRIVATE_KEY'),
        },
      },
    },
  },
});
```

## 配置项说明

### aesKey

- **类型**: `String`
- **最小长度**: 32 字符
- **说明**: AES-256 加密密钥

生成方法：

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### hmacSecret

- **类型**: `String`
- **说明**: HMAC 签名密钥

### tokenSecret

- **类型**: `String`
- **说明**: Token 生成密钥

### rsaKeyLength

- **类型**: `Number`
- **默认值**: `2048`
- **说明**: RSA 密钥长度

### rsa.publicKey

- **类型**: `String`
- **说明**: 固定的 RSA 公钥（可选）

### rsa.privateKey

- **类型**: `String`
- **说明**: 固定的 RSA 私钥（可选）

## 环境变量

```env
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key
CRYPTO_RSA_KEY_LENGTH=2048

# 固定 RSA 密钥对（可选）
CRYPTO_RSA_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
CRYPTO_RSA_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
```

## 相关链接

- [加密工具库](/features/crypto)
- [RSA 配置详解](/features/rsa-config)
- [配置指南](/guide/configuration)

