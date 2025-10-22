# 加密工具配置总结

## ✅ 已完成的功能

### 1. 配置化密钥管理

- ✅ 在 `server/src/config/index.js` 添加了加密配置项
- ✅ 支持通过配置文件设置密钥
- ✅ 支持通过环境变量设置密钥
- ✅ 添加了辅助方法方便获取配置

### 2. 配置项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `crypto.aesKey` | AES 加密密钥 | 空字符串 |
| `crypto.hmacSecret` | HMAC 签名密钥 | 空字符串 |
| `crypto.tokenSecret` | Token 密钥 | 空字符串 |
| `crypto.rsaKeyLength` | RSA 密钥长度 | 2048 |

### 3. 辅助方法

```javascript
strapi.crypto.config.getAesKey()       // 获取 AES 密钥
strapi.crypto.config.getHmacSecret()   // 获取 HMAC 密钥
strapi.crypto.config.getTokenSecret()  // 获取 Token 密钥
strapi.crypto.config.getRsaKeyLength() // 获取 RSA 密钥长度
```

---

## 🚀 用户使用方式

### 步骤 1：配置环境变量

在 `.env` 文件中添加：

```env
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key
```

### 步骤 2：配置插件

在 `config/plugins.js` 中配置：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
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

### 步骤 3：在代码中使用

```javascript
// 在控制器、服务或中间件中
module.exports = {
  async myMethod(ctx) {
    // 获取配置的密钥
    const aesKey = strapi.crypto.config.getAesKey();
    const hmacSecret = strapi.crypto.config.getHmacSecret();
    
    // 使用配置的密钥进行加密
    const encrypted = strapi.crypto.aes.encryptSimple('数据', aesKey);
    const signature = strapi.crypto.hash.hmac('数据', hmacSecret);
    
    ctx.body = { encrypted, signature };
  }
};
```

---

## 📋 配置优先级

辅助方法会按以下优先级读取配置：

1. **config/plugins.js** - 插件配置文件
2. **环境变量** - .env 文件或系统环境变量
3. **空字符串** - 如果都未配置

示例：

```javascript
// 优先级顺序
const aesKey = strapi.crypto.config.getAesKey();

// 等价于：
const config = strapi.config.get('plugin::bag-strapi-plugin.crypto') || 
               strapi.config.get('plugin.bag-strapi-plugin.crypto', {});
const aesKey = config.aesKey || process.env.CRYPTO_AES_KEY || '';
```

---

## 📚 相关文档

### 必读
- **[加密工具配置指南](./CRYPTO_CONFIG_GUIDE.md)** - 详细配置说明和示例

### 参考
- **[加密工具完整指南](./CRYPTO_UTILS_GUIDE.md)** - 所有 API 文档
- **[快速参考](./CRYPTO_QUICK_REFERENCE.md)** - API 速查表
- **[使用示例](./CRYPTO_EXAMPLES.md)** - 实用代码示例

### 配置文件
- **[配置模板](./config.template.js)** - 可复制的配置模板
- **[环境变量模板](./env.example)** - .env 文件模板

---

## 🔐 安全建议

### 1. 生产环境使用环境变量

```javascript
// ✅ 推荐
crypto: {
  aesKey: env('CRYPTO_AES_KEY'),
}

// ❌ 不推荐
crypto: {
  aesKey: 'hardcoded-key',
}
```

### 2. 使用强密钥

```bash
# 生成强密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

或使用插件提供的方法：

```javascript
const strongKey = strapi.crypto.random.string(32);
console.log('AES Key:', strongKey);
```

### 3. 密钥长度要求

- **AES 密钥**：至少 32 字符
- **HMAC 密钥**：建议 32+ 字符
- **Token 密钥**：建议 32+ 字符
- **RSA 密钥**：生产环境建议 4096 位

### 4. 不同环境使用不同密钥

```javascript
// config/env/development/plugins.js
crypto: {
  aesKey: 'dev-key-for-testing-only!!',
}

// config/env/production/plugins.js
crypto: {
  aesKey: env('CRYPTO_AES_KEY'), // 生产密钥从环境变量
}
```

---

## 🔄 与旧版本的对比

### 旧方式（硬编码）

```javascript
// ❌ 旧方式：密钥硬编码在代码中
const secretKey = 'my-super-secret-key-32-chars!!';
const encrypted = strapi.crypto.aes.encryptSimple(data, secretKey);
```

### 新方式（配置化）

```javascript
// ✅ 新方式：密钥从配置读取
const secretKey = strapi.crypto.config.getAesKey();
const encrypted = strapi.crypto.aes.encryptSimple(data, secretKey);
```

### 优势

1. ✅ **灵活性**：可通过配置文件或环境变量修改
2. ✅ **安全性**：密钥不会提交到代码库
3. ✅ **可维护性**：统一管理所有密钥
4. ✅ **环境隔离**：开发/测试/生产使用不同密钥

---

## ✨ 示例代码

### 完整示例：加密用户数据

```javascript
// api/user/controllers/user.js
module.exports = {
  async create(ctx) {
    const { email, phone, idCard } = ctx.request.body;
    
    // 1. 获取配置的密钥
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 2. 验证密钥是否配置
    if (!aesKey) {
      throw new Error('AES 密钥未配置，请在 config/plugins.js 中配置');
    }
    
    // 3. 加密敏感信息
    const encryptedPhone = strapi.crypto.aes.encryptSimple(phone, aesKey);
    const encryptedIdCard = strapi.crypto.aes.encryptSimple(idCard, aesKey);
    
    // 4. 保存到数据库
    const user = await strapi.entityService.create('api::user.user', {
      data: {
        email,
        phone: encryptedPhone,
        idCard: encryptedIdCard,
      },
    });
    
    ctx.body = user;
  },
  
  async findOne(ctx) {
    const { id } = ctx.params;
    const aesKey = strapi.crypto.config.getAesKey();
    
    const user = await strapi.entityService.findOne('api::user.user', id);
    
    // 解密敏感信息
    user.phone = strapi.crypto.aes.decryptSimple(user.phone, aesKey);
    user.idCard = strapi.crypto.aes.decryptSimple(user.idCard, aesKey);
    
    ctx.body = user;
  },
};
```

---

## 🎯 总结

现在用户可以：

1. ✅ 通过环境变量配置密钥
2. ✅ 通过配置文件配置密钥
3. ✅ 使用辅助方法获取配置的密钥
4. ✅ 灵活地在不同环境使用不同密钥
5. ✅ 安全地管理加密密钥，不将其硬编码在代码中

**重要提示**：
- 使用加密功能前，必须先配置相应的密钥
- 建议使用环境变量而不是硬编码
- 不同用途使用不同的密钥（AES、HMAC、Token 分开）
- 定期更换密钥以提高安全性

---

**版本**: 0.0.4  
**作者**: yanghang <470193837@qq.com>

