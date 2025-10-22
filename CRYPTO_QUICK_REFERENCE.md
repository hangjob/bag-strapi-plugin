# 加密工具快速参考

## 🚀 一分钟上手

```javascript
// 在 Strapi 的任何地方使用 strapi.crypto

// 1. AES 对称加密
const encrypted = strapi.crypto.aes.encryptSimple('数据', '密钥');
const decrypted = strapi.crypto.aes.decryptSimple(encrypted, '密钥');

// 2. RSA 非对称加密
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();
const encrypted = strapi.crypto.rsa.encrypt('数据', publicKey);
const decrypted = strapi.crypto.rsa.decrypt(encrypted, privateKey);

// 3. 哈希
const hash = strapi.crypto.hash.sha256('password');

// 4. 随机数
const token = strapi.crypto.random.uuid();
```

## 📖 常用 API

### AES 加密

```javascript
// 简单方式（推荐）
strapi.crypto.aes.encryptSimple(text, key)    // 加密
strapi.crypto.aes.decryptSimple(encrypted, key) // 解密

// 高级方式
const { encrypted, iv, authTag } = strapi.crypto.aes.encrypt(text, key)
strapi.crypto.aes.decrypt(encrypted, key, iv, authTag)
```

### RSA 加密

```javascript
// 生成密钥对
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair(2048)

// 加密/解密
strapi.crypto.rsa.encrypt(text, publicKey)
strapi.crypto.rsa.decrypt(encrypted, privateKey)

// 签名/验证
strapi.crypto.rsa.sign(data, privateKey)
strapi.crypto.rsa.verify(data, signature, publicKey)
```

### 哈希

```javascript
strapi.crypto.hash.md5(data)
strapi.crypto.hash.sha256(data)
strapi.crypto.hash.sha512(data)
strapi.crypto.hash.hmac(data, secret)
```

### 随机数

```javascript
strapi.crypto.random.string(32)    // 随机字符串
strapi.crypto.random.int(1, 100)   // 随机整数
strapi.crypto.random.uuid()        // UUID
```

### Base64

```javascript
strapi.crypto.base64.encode(data)
strapi.crypto.base64.decode(data)
strapi.crypto.base64.urlEncode(data)  // URL 安全
strapi.crypto.base64.urlDecode(data)
```

## 💡 实用示例

### 加密用户敏感信息

```javascript
// 保存时加密
async create(ctx) {
  const { phone, idCard } = ctx.request.body;
  const key = process.env.DATA_KEY;
  
  await strapi.entityService.create('api::user.user', {
    data: {
      phone: strapi.crypto.aes.encryptSimple(phone, key),
      idCard: strapi.crypto.aes.encryptSimple(idCard, key),
    },
  });
}

// 读取时解密
async findOne(ctx) {
  const user = await strapi.entityService.findOne('api::user.user', ctx.params.id);
  const key = process.env.DATA_KEY;
  
  user.phone = strapi.crypto.aes.decryptSimple(user.phone, key);
  user.idCard = strapi.crypto.aes.decryptSimple(user.idCard, key);
  
  return user;
}
```

### 生成安全 Token

```javascript
// 生成重置密码 Token
const tokenData = {
  email: user.email,
  expires: Date.now() + 3600000,
  nonce: strapi.crypto.random.uuid(),
};

const token = strapi.crypto.base64.urlEncode(JSON.stringify(tokenData));
const signature = strapi.crypto.hash.hmac(token, process.env.TOKEN_SECRET);

const resetLink = `https://example.com/reset?token=${token}&sig=${signature}`;
```

### API 签名

```javascript
// 生成签名
const timestamp = Date.now();
const nonce = strapi.crypto.random.string(16);
const data = { userId: 123 };

const signString = `${timestamp}${nonce}${JSON.stringify(data)}`;
const signature = strapi.crypto.hash.hmac(signString, process.env.API_SECRET);

// 发送请求
fetch('https://api.example.com', {
  headers: {
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature,
  },
  body: JSON.stringify(data),
});
```

### 密码哈希

```javascript
// 注册时
const passwordHash = strapi.crypto.hash.sha256(password);
await strapi.entityService.create('api::user.user', {
  data: { email, password: passwordHash },
});

// 登录验证
const inputHash = strapi.crypto.hash.sha256(inputPassword);
if (inputHash === user.password) {
  // 登录成功
}
```

## 🔐 安全建议

```javascript
// ✅ 使用环境变量
const key = process.env.ENCRYPTION_KEY;

// ✅ 不同用途使用不同密钥
const userDataKey = process.env.USER_DATA_KEY;
const fileKey = process.env.FILE_ENCRYPTION_KEY;

// ✅ 密钥长度要足够
const aesKey = '至少32个字符的强密钥！！！！！！';  // 32+ 字符
const rsaKeyPair = strapi.crypto.rsa.generateKeyPair(2048); // 2048+ 位

// ❌ 不要硬编码密钥
const key = 'hardcoded-key';  // 不要这样做
```

## 📚 完整文档

详细使用说明请查看：[加密工具完整指南](./CRYPTO_UTILS_GUIDE.md)

## 🧪 测试

```bash
# 运行测试脚本
node server/test-crypto.js

# 输出示例：
# ✅ AES 加密/解密测试通过
# ✅ RSA 加密/解密测试通过
# ✅ RSA 签名/验证测试通过
# ✅ 哈希函数测试通过
# ✅ 随机数生成测试通过
# ✅ Base64 编解码测试通过
```

---

**版本**: 0.0.4  
**文档**: [CRYPTO_UTILS_GUIDE.md](./CRYPTO_UTILS_GUIDE.md)

