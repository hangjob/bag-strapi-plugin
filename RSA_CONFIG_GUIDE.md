# RSA 密钥配置指南

## 📋 概述

bag-strapi-plugin 支持配置固定的 RSA 密钥对，让你可以在不同请求之间使用相同的公钥和私钥。

---

## 🚀 配置方式

### 方式一：在配置文件中设置（推荐）

```javascript
// config/plugins.js
const fs = require('fs');

module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      crypto: {
        // 从文件读取 RSA 密钥
        rsaPublicKey: fs.readFileSync('./keys/public.pem', 'utf8'),
        rsaPrivateKey: fs.readFileSync('./keys/private.pem', 'utf8'),
        
        // 或者直接写在配置中（不推荐生产环境）
        // rsaPublicKey: `-----BEGIN PUBLIC KEY-----
        // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
        // -----END PUBLIC KEY-----`,
      },
    },
  },
});
```

### 方式二：使用环境变量

```env
# .env 文件
CRYPTO_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----"
CRYPTO_RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...\n-----END PRIVATE KEY-----"
```

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        rsaPublicKey: env('CRYPTO_RSA_PUBLIC_KEY'),
        rsaPrivateKey: env('CRYPTO_RSA_PRIVATE_KEY'),
      },
    },
  },
});
```

---

## 🔑 生成 RSA 密钥对

### 方法一：使用 OpenSSL（推荐）

```bash
# 生成私钥（2048位）
openssl genrsa -out private.pem 2048

# 从私钥导出公钥
openssl rsa -in private.pem -pubout -out public.pem

# 查看密钥
cat public.pem
cat private.pem
```

生成 4096 位密钥（更安全）：

```bash
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

### 方法二：使用插件提供的方法

```javascript
// scripts/generate-rsa-keys.js
const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi().load();
  
  // 生成密钥对
  const { publicKey, privateKey } = app.crypto.rsa.generateKeyPair(2048);
  
  console.log('公钥:');
  console.log(publicKey);
  console.log('\n私钥:');
  console.log(privateKey);
  
  await app.destroy();
})();
```

运行：

```bash
node scripts/generate-rsa-keys.js
```

### 方法三：调用 API 生成

```bash
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "rsa",
    "action": "generate"
  }'
```

---

## 📝 使用示例

### 示例 1：使用配置的密钥加密/解密

```javascript
// api/secure-data/controllers/secure-data.js
module.exports = {
  async encryptData(ctx) {
    const { data } = ctx.request.body;
    
    // 获取配置的公钥
    const publicKey = strapi.crypto.config.getRsaPublicKey();
    
    if (!publicKey) {
      return ctx.badRequest('RSA 公钥未配置');
    }
    
    // 加密数据
    const encrypted = strapi.crypto.rsa.encrypt(data, publicKey);
    
    ctx.body = { encrypted };
  },
  
  async decryptData(ctx) {
    const { encrypted } = ctx.request.body;
    
    // 获取配置的私钥
    const privateKey = strapi.crypto.config.getRsaPrivateKey();
    
    if (!privateKey) {
      return ctx.badRequest('RSA 私钥未配置');
    }
    
    // 解密数据
    const decrypted = strapi.crypto.rsa.decrypt(encrypted, privateKey);
    
    ctx.body = { decrypted };
  },
};
```

### 示例 2：获取配置的密钥对

```javascript
// 获取配置的密钥对（如果配置了）
const { publicKey, privateKey } = strapi.crypto.config.getRsaKeyPair();

// 如果未配置，会自动生成新的密钥对
// 如果已配置，返回配置的密钥对
```

### 示例 3：数字签名

```javascript
// api/document/controllers/document.js
module.exports = {
  async signDocument(ctx) {
    const { document } = ctx.request.body;
    const privateKey = strapi.crypto.config.getRsaPrivateKey();
    
    // 使用私钥签名
    const signature = strapi.crypto.rsa.sign(document, privateKey);
    
    ctx.body = { document, signature };
  },
  
  async verifySignature(ctx) {
    const { document, signature } = ctx.request.body;
    const publicKey = strapi.crypto.config.getRsaPublicKey();
    
    // 使用公钥验证
    const isValid = strapi.crypto.rsa.verify(document, signature, publicKey);
    
    ctx.body = { isValid };
  },
};
```

### 示例 4：混合使用（配置 + 传入）

```javascript
// 优先使用配置的密钥，如果没有则使用传入的密钥
module.exports = {
  async flexibleEncrypt(ctx) {
    const { data, customPublicKey } = ctx.request.body;
    
    // 优先使用传入的公钥，否则使用配置的
    const publicKey = customPublicKey || strapi.crypto.config.getRsaPublicKey();
    
    if (!publicKey) {
      return ctx.badRequest('需要提供公钥');
    }
    
    const encrypted = strapi.crypto.rsa.encrypt(data, publicKey);
    
    ctx.body = { encrypted };
  },
};
```

---

## 🗂️ 密钥文件管理

### 推荐的目录结构

```
my-strapi-project/
├── keys/
│   ├── public.pem       # 公钥
│   ├── private.pem      # 私钥（不要提交到 git）
│   └── .gitignore       # 忽略私钥文件
├── config/
│   └── plugins.js
├── .env
└── .gitignore
```

### keys/.gitignore

```gitignore
# 不要提交私钥到代码库
private.pem
*.key
*.pem
!public.pem  # 公钥可以提交（可选）
```

### 读取密钥文件

```javascript
// config/plugins.js
const fs = require('fs');
const path = require('path');

module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        rsaPublicKey: fs.readFileSync(
          path.join(__dirname, '../keys/public.pem'),
          'utf8'
        ),
        rsaPrivateKey: fs.readFileSync(
          path.join(__dirname, '../keys/private.pem'),
          'utf8'
        ),
      },
    },
  },
});
```

---

## 🔐 安全建议

### 1. 私钥安全

```bash
# ✅ 设置私钥文件权限（Linux/Mac）
chmod 600 keys/private.pem

# ✅ 不要提交到代码库
echo "keys/private.pem" >> .gitignore

# ✅ 使用环境变量（生产环境）
CRYPTO_RSA_PRIVATE_KEY="..."
```

### 2. 密钥长度

```javascript
// ✅ 推荐使用 2048 位或更高
rsaKeyLength: 2048,

// ✅ 生产环境使用 4096 位
rsaKeyLength: 4096,

// ❌ 不要使用低于 2048 位
rsaKeyLength: 1024,  // 太弱！
```

### 3. 密钥轮换

定期更换 RSA 密钥对，建立密钥轮换机制。

### 4. 备份密钥

```bash
# 加密备份私钥
openssl aes-256-cbc -salt -in private.pem -out private.pem.enc

# 解密恢复
openssl aes-256-cbc -d -in private.pem.enc -out private.pem
```

---

## 🧪 测试 RSA 配置

### 测试脚本

```javascript
// scripts/test-rsa-config.js
const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi().load();
  
  console.log('测试 RSA 配置...\n');
  
  // 获取配置的密钥
  const publicKey = app.crypto.config.getRsaPublicKey();
  const privateKey = app.crypto.config.getRsaPrivateKey();
  
  console.log('公钥已配置:', !!publicKey);
  console.log('私钥已配置:', !!privateKey);
  
  if (publicKey && privateKey) {
    console.log('\n测试加密/解密...');
    
    const testData = 'Hello, RSA!';
    
    // 加密
    const encrypted = app.crypto.rsa.encrypt(testData, publicKey);
    console.log('加密结果:', encrypted.substring(0, 50) + '...');
    
    // 解密
    const decrypted = app.crypto.rsa.decrypt(encrypted, privateKey);
    console.log('解密结果:', decrypted);
    
    if (decrypted === testData) {
      console.log('\n✅ RSA 加密/解密测试通过！');
    } else {
      console.log('\n❌ RSA 加密/解密测试失败！');
    }
  } else {
    console.log('\n⚠️ RSA 密钥未配置');
  }
  
  await app.destroy();
})();
```

运行测试：

```bash
node scripts/test-rsa-config.js
```

### API 测试

```bash
# 1. 获取配置的密钥对
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "rsa",
    "action": "getKeyPair"
  }'

# 2. 使用配置的公钥加密
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "rsa",
    "action": "encrypt",
    "data": "Hello RSA"
  }'

# 3. 使用配置的私钥解密
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "rsa",
    "action": "decrypt",
    "data": "加密后的数据"
  }'
```

---

## 📚 API 参考

### strapi.crypto.config.getRsaPublicKey()

获取配置的 RSA 公钥。

```javascript
const publicKey = strapi.crypto.config.getRsaPublicKey();
// 返回: PEM 格式的公钥字符串，或空字符串
```

### strapi.crypto.config.getRsaPrivateKey()

获取配置的 RSA 私钥。

```javascript
const privateKey = strapi.crypto.config.getRsaPrivateKey();
// 返回: PEM 格式的私钥字符串，或空字符串
```

### strapi.crypto.config.getRsaKeyPair()

获取 RSA 密钥对。如果已配置则返回配置的密钥对，否则生成新的。

```javascript
const { publicKey, privateKey } = strapi.crypto.config.getRsaKeyPair();
// 返回: { publicKey: string, privateKey: string }
```

---

## ❓ 常见问题

### Q1: 如何在环境变量中存储多行 PEM 密钥？

使用 `\n` 表示换行：

```env
CRYPTO_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----"
```

或在配置文件中使用多行字符串：

```javascript
rsaPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`,
```

### Q2: 必须配置 RSA 密钥吗？

不是必须的。如果不配置：
- `getRsaPublicKey()` 和 `getRsaPrivateKey()` 返回空字符串
- `getRsaKeyPair()` 会自动生成新的密钥对
- 可以在请求时传入自定义密钥

### Q3: 如何在不同环境使用不同的密钥？

```javascript
// config/env/development/plugins.js
crypto: {
  rsaPublicKey: fs.readFileSync('./keys/dev-public.pem', 'utf8'),
  rsaPrivateKey: fs.readFileSync('./keys/dev-private.pem', 'utf8'),
}

// config/env/production/plugins.js
crypto: {
  rsaPublicKey: env('PROD_RSA_PUBLIC_KEY'),
  rsaPrivateKey: env('PROD_RSA_PRIVATE_KEY'),
}
```

### Q4: 密钥格式错误怎么办？

确保密钥格式正确：

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
```

---

## 🎯 总结

- ✅ 支持配置固定的 RSA 密钥对
- ✅ 可通过配置文件或环境变量设置
- ✅ 支持从文件读取密钥
- ✅ 如果未配置，会自动生成新密钥
- ✅ 可在请求时传入自定义密钥

---

**相关文档**:
- [加密工具配置指南](./CRYPTO_CONFIG_GUIDE.md)
- [加密工具完整指南](./CRYPTO_UTILS_GUIDE.md)

**版本**: 0.0.4

