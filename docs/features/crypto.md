# 加密工具库

全局可用的加密工具库，通过 `strapi.crypto` 访问，提供 AES、RSA、哈希、HMAC 等完整的加密解决方案。

## 功能特性

- ✅ **AES 加密** - 对称加密，适合数据加密
- ✅ **RSA 加密** - 非对称加密，适合密钥交换
- ✅ **哈希函数** - SHA-256、SHA-512、MD5
- ✅ **HMAC 签名** - 消息认证码
- ✅ **随机工具** - UUID、随机字符串、随机数字
- ✅ **全局可用** - 在任何地方通过 `strapi.crypto` 调用

## 快速开始

### 1. 配置加密密钥

在 `.env` 文件中：

```env
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key
```

在 `config/plugins.js` 中：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        aesKey: env('CRYPTO_AES_KEY'),
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
        rsaKeyLength: 2048,
      },
    },
  },
});
```

### 2. 使用加密工具

在控制器、服务或中间件中：

```javascript
module.exports = {
  async example(ctx) {
    // 获取配置的密钥
    const aesKey = strapi.crypto.config.getAesKey();
    
    // AES 加密
    const encrypted = strapi.crypto.aes.encryptSimple('敏感数据', aesKey);
    const decrypted = strapi.crypto.aes.decryptSimple(encrypted, aesKey);
    
    // 哈希
    const hash = strapi.crypto.hash.sha256('password123');
    
    // HMAC 签名
    const hmacSecret = strapi.crypto.config.getHmacSecret();
    const signature = strapi.crypto.hash.hmac('数据', hmacSecret);
    
    // UUID
    const id = strapi.crypto.random.uuid();
    
    ctx.body = {
      encrypted,
      decrypted,
      hash,
      signature,
      id,
    };
  }
};
```

## AES 加密（对称加密）

### 简单加密/解密

```javascript
const aesKey = strapi.crypto.config.getAesKey();

// 加密
const encrypted = strapi.crypto.aes.encryptSimple('Hello World', aesKey);
console.log(encrypted); // "a1b2c3d4..."

// 解密
const decrypted = strapi.crypto.aes.decryptSimple(encrypted, aesKey);
console.log(decrypted); // "Hello World"
```

### 高级加密（带 IV）

```javascript
// 加密（返回 { encrypted, iv }）
const result = strapi.crypto.aes.encrypt('敏感信息', aesKey);
console.log(result); // { encrypted: "...", iv: "..." }

// 解密
const decrypted = strapi.crypto.aes.decrypt(result.encrypted, aesKey, result.iv);
console.log(decrypted); // "敏感信息"
```

### 加密对象

```javascript
const data = {
  userId: 123,
  email: 'test@example.com',
  secretKey: 'abc123',
};

// 加密
const encrypted = strapi.crypto.aes.encryptObject(data, aesKey);

// 解密
const decrypted = strapi.crypto.aes.decryptObject(encrypted, aesKey);
console.log(decrypted); // { userId: 123, email: "...", secretKey: "..." }
```

## RSA 加密（非对称加密）

### 生成密钥对

```javascript
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();
console.log(publicKey);   // "-----BEGIN PUBLIC KEY-----..."
console.log(privateKey);  // "-----BEGIN PRIVATE KEY-----..."
```

### 加密/解密

```javascript
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();

// 使用公钥加密
const encrypted = strapi.crypto.rsa.encrypt('机密信息', publicKey);

// 使用私钥解密
const decrypted = strapi.crypto.rsa.decrypt(encrypted, privateKey);
console.log(decrypted); // "机密信息"
```

### 签名/验证

```javascript
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();
const data = 'Important message';

// 使用私钥签名
const signature = strapi.crypto.rsa.sign(data, privateKey);

// 使用公钥验证
const isValid = strapi.crypto.rsa.verify(data, signature, publicKey);
console.log(isValid); // true
```

## 哈希函数

### SHA-256

```javascript
const hash = strapi.crypto.hash.sha256('password123');
console.log(hash); // "ef92b778b..."
```

### SHA-512

```javascript
const hash = strapi.crypto.hash.sha512('sensitive data');
console.log(hash); // "a1b2c3d4..."
```

### MD5

```javascript
const hash = strapi.crypto.hash.md5('test');
console.log(hash); // "098f6bcd..."
```

### HMAC 签名

```javascript
const secret = strapi.crypto.config.getHmacSecret();
const signature = strapi.crypto.hash.hmac('data to sign', secret);
console.log(signature); // "a1b2c3..."
```

### 验证 HMAC

```javascript
const isValid = strapi.crypto.hash.verifyHmac(
  'data to sign',
  signature,
  secret
);
console.log(isValid); // true
```

## 随机工具

### UUID v4

```javascript
const id = strapi.crypto.random.uuid();
console.log(id); // "550e8400-e29b-41d4-a716-446655440000"
```

### 随机字符串

```javascript
// 默认长度 32
const str1 = strapi.crypto.random.string();
console.log(str1); // "a1b2c3d4e5f6..."

// 自定义长度
const str2 = strapi.crypto.random.string(16);
console.log(str2); // "a1b2c3d4e5f6g7h8"
```

### 随机数字

```javascript
// 0 到 100 之间的随机数
const num = strapi.crypto.random.number(0, 100);
console.log(num); // 42
```

### 随机字节

```javascript
const bytes = strapi.crypto.random.bytes(16);
console.log(bytes); // "a1b2c3d4e5f6g7h8i9j0..."
```

## 配置辅助方法

### 获取配置的密钥

```javascript
// AES 密钥
const aesKey = strapi.crypto.config.getAesKey();

// HMAC 密钥
const hmacSecret = strapi.crypto.config.getHmacSecret();

// Token 密钥
const tokenSecret = strapi.crypto.config.getTokenSecret();

// RSA 密钥对
const rsaKeys = strapi.crypto.config.getRsaKeys();
```

### 验证密钥

```javascript
// 验证 AES 密钥是否配置
const hasAesKey = strapi.crypto.config.hasAesKey();

// 验证 HMAC 密钥是否配置
const hasHmacSecret = strapi.crypto.config.hasHmacSecret();
```

## 实用示例

### 加密用户敏感数据

```javascript
async create(ctx) {
  const { idCard, bankCard } = ctx.request.body;
  const aesKey = strapi.crypto.config.getAesKey();
  
  const user = await strapi.entityService.create('api::user.user', {
    data: {
      ...ctx.request.body,
      idCard: strapi.crypto.aes.encryptSimple(idCard, aesKey),
      bankCard: strapi.crypto.aes.encryptSimple(bankCard, aesKey),
    },
  });
  
  ctx.body = { success: true, data: user };
}
```

### 生成安全 Token

```javascript
async generateToken(ctx) {
  const tokenSecret = strapi.crypto.config.getTokenSecret();
  
  const payload = {
    userId: ctx.state.user.id,
    timestamp: Date.now(),
    random: strapi.crypto.random.string(16),
  };
  
  const token = strapi.crypto.aes.encryptObject(payload, tokenSecret);
  
  ctx.body = { success: true, token };
}
```

### API 签名验证

```javascript
async verifyApiSignature(ctx) {
  const { data, signature } = ctx.request.body;
  const hmacSecret = strapi.crypto.config.getHmacSecret();
  
  const isValid = strapi.crypto.hash.verifyHmac(
    JSON.stringify(data),
    signature,
    hmacSecret
  );
  
  if (!isValid) {
    return ctx.badRequest('签名验证失败');
  }
  
  // 处理业务逻辑...
}
```

## 最佳实践

### 1. 选择合适的加密方式

| 场景 | 推荐方式 |
|------|---------|
| 数据加密存储 | AES-256 |
| 密钥交换 | RSA |
| 密码存储 | bcrypt（认证系统已内置） |
| 数据签名 | HMAC-SHA256 |
| 唯一标识 | UUID v4 |
| API 签名 | HMAC-SHA256 |

### 2. 密钥管理

```javascript
// ✅ 推荐：使用环境变量
const aesKey = env('CRYPTO_AES_KEY');

// ❌ 不推荐：硬编码
const aesKey = 'my-secret-key';
```

### 3. 不要加密所有数据

- ✅ 需要加密：身份证、银行卡、私密信息
- ❌ 不需要加密：用户名、邮箱（可能需要查询）

### 4. 使用不同的密钥

```javascript
crypto: {
  aesKey: env('DATA_AES_KEY'),      // 数据加密
  signKey: env('SIGN_AES_KEY'),      // 签名加密
  tokenSecret: env('TOKEN_SECRET'),  // Token 生成
}
```

## 配置详解

更多配置选项请参考 [加密配置指南](/features/crypto-config)。

## 相关链接

- [加密配置详解](/features/crypto-config)
- [RSA 配置详解](/features/rsa-config)
- [加密工具 API 参考](/api/crypto-aes)

