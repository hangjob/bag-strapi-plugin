# 加密工具使用指南

bag-strapi-plugin 提供了完整的加密工具库，包括对称加密、非对称加密、哈希函数等。

## 🔐 功能概览

- ✅ **AES 对称加密**（AES-256-GCM）
- ✅ **RSA 非对称加密**（RSA-2048/4096）
- ✅ **哈希函数**（MD5、SHA256、SHA512、HMAC）
- ✅ **随机数生成**（字符串、数字、UUID）
- ✅ **Base64 编解码**（标准和 URL 安全）
- ✅ **全局可用**（在 Strapi 任何地方调用）

---

## 🚀 快速开始

### 在 Strapi 项目中使用

安装插件后，加密工具会自动注册到全局 `strapi.crypto` 对象。

```javascript
// 在任何控制器、服务或中间件中使用
const encrypted = strapi.crypto.aes.encryptSimple('Hello World', 'my-secret-key');
console.log(encrypted);

const decrypted = strapi.crypto.aes.decryptSimple(encrypted, 'my-secret-key');
console.log(decrypted); // 'Hello World'
```

---

## 📚 API 文档

### 1. 对称加密（AES）

#### 1.1 简单加密/解密

```javascript
// 加密
const encrypted = strapi.crypto.aes.encryptSimple(plaintext, secretKey);

// 解密
const decrypted = strapi.crypto.aes.decryptSimple(encrypted, secretKey);
```

**示例**：

```javascript
const secretKey = 'my-super-secret-key-32-chars!!';
const text = '敏感信息';

// 加密
const encrypted = strapi.crypto.aes.encryptSimple(text, secretKey);
console.log('加密结果:', encrypted);

// 解密
const decrypted = strapi.crypto.aes.decryptSimple(encrypted, secretKey);
console.log('解密结果:', decrypted); // '敏感信息'
```

#### 1.2 高级加密/解密

```javascript
// 加密（返回详细信息）
const result = strapi.crypto.aes.encrypt(plaintext, secretKey);
// result = { encrypted, iv, authTag }

// 解密
const decrypted = strapi.crypto.aes.decrypt(
  result.encrypted,
  secretKey,
  result.iv,
  result.authTag
);
```

**示例**：

```javascript
const secretKey = 'my-secret-key';
const text = '需要加密的数据';

// 加密
const { encrypted, iv, authTag } = strapi.crypto.aes.encrypt(text, secretKey);
console.log('密文:', encrypted);
console.log('初始化向量:', iv);
console.log('认证标签:', authTag);

// 解密
const decrypted = strapi.crypto.aes.decrypt(encrypted, secretKey, iv, authTag);
console.log('解密结果:', decrypted);
```

---

### 2. 非对称加密（RSA）

#### 2.1 生成密钥对

```javascript
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair(2048);
```

**示例**：

```javascript
// 生成 2048 位密钥对
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();

console.log('公钥:\n', publicKey);
console.log('私钥:\n', privateKey);

// 生成 4096 位密钥对（更安全）
const keyPair = strapi.crypto.rsa.generateKeyPair(4096);
```

#### 2.2 加密/解密

```javascript
// 使用公钥加密
const encrypted = strapi.crypto.rsa.encrypt(plaintext, publicKey);

// 使用私钥解密
const decrypted = strapi.crypto.rsa.decrypt(encrypted, privateKey);
```

**示例**：

```javascript
// 生成密钥对
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();

const text = '机密信息';

// 公钥加密
const encrypted = strapi.crypto.rsa.encrypt(text, publicKey);
console.log('加密结果:', encrypted);

// 私钥解密
const decrypted = strapi.crypto.rsa.decrypt(encrypted, privateKey);
console.log('解密结果:', decrypted); // '机密信息'
```

#### 2.3 签名/验证

```javascript
// 使用私钥签名
const signature = strapi.crypto.rsa.sign(data, privateKey);

// 使用公钥验证
const isValid = strapi.crypto.rsa.verify(data, signature, publicKey);
```

**示例**：

```javascript
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();

const data = '需要签名的数据';

// 私钥签名
const signature = strapi.crypto.rsa.sign(data, privateKey);
console.log('签名:', signature);

// 公钥验证
const isValid = strapi.crypto.rsa.verify(data, signature, publicKey);
console.log('签名是否有效:', isValid); // true

// 篡改数据后验证
const tampered = strapi.crypto.rsa.verify('篡改的数据', signature, publicKey);
console.log('篡改数据验证:', tampered); // false
```

---

### 3. 哈希函数

#### 3.1 MD5

```javascript
const hash = strapi.crypto.hash.md5(data);
```

**示例**：

```javascript
const password = 'user123456';
const hash = strapi.crypto.hash.md5(password);
console.log('MD5:', hash);
```

#### 3.2 SHA256

```javascript
const hash = strapi.crypto.hash.sha256(data);
```

**示例**：

```javascript
const data = 'important data';
const hash = strapi.crypto.hash.sha256(data);
console.log('SHA256:', hash);
```

#### 3.3 SHA512

```javascript
const hash = strapi.crypto.hash.sha512(data);
```

#### 3.4 HMAC-SHA256

```javascript
const hmac = strapi.crypto.hash.hmac(data, secret);
```

**示例**：

```javascript
const message = 'API Request';
const secret = 'api-secret-key';
const hmac = strapi.crypto.hash.hmac(message, secret);
console.log('HMAC:', hmac);
```

---

### 4. 随机数生成

#### 4.1 随机字符串

```javascript
const str = strapi.crypto.random.string(32); // 32 个字符
```

**示例**：

```javascript
// 生成 API Key
const apiKey = strapi.crypto.random.string(32);
console.log('API Key:', apiKey);

// 生成验证码
const code = strapi.crypto.random.string(6);
console.log('验证码:', code);
```

#### 4.2 随机整数

```javascript
const num = strapi.crypto.random.int(1, 100); // 1 到 100 之间
```

**示例**：

```javascript
// 生成随机 ID
const id = strapi.crypto.random.int(100000, 999999);
console.log('随机 ID:', id);

// 随机端口
const port = strapi.crypto.random.int(3000, 9000);
console.log('随机端口:', port);
```

#### 4.3 UUID

```javascript
const uuid = strapi.crypto.random.uuid();
```

**示例**：

```javascript
const orderId = strapi.crypto.random.uuid();
console.log('订单 ID:', orderId);
// 输出: '550e8400-e29b-41d4-a716-446655440000'
```

---

### 5. Base64 编解码

#### 5.1 标准 Base64

```javascript
// 编码
const encoded = strapi.crypto.base64.encode(data);

// 解码
const decoded = strapi.crypto.base64.decode(encoded);
```

**示例**：

```javascript
const text = 'Hello, 世界!';

// 编码
const encoded = strapi.crypto.base64.encode(text);
console.log('Base64:', encoded);

// 解码
const decoded = strapi.crypto.base64.decode(encoded);
console.log('解码:', decoded); // 'Hello, 世界!'
```

#### 5.2 URL 安全的 Base64

```javascript
// URL 安全编码
const encoded = strapi.crypto.base64.urlEncode(data);

// URL 安全解码
const decoded = strapi.crypto.base64.urlDecode(encoded);
```

**示例**：

```javascript
const data = 'user@example.com';

// URL 安全编码（可用于 URL 参数）
const token = strapi.crypto.base64.urlEncode(data);
console.log('Token:', token);

// 解码
const email = strapi.crypto.base64.urlDecode(token);
console.log('Email:', email);
```

---

## 💡 实际应用场景

### 场景 1：加密用户敏感信息

```javascript
// 在 Strapi 控制器中
module.exports = {
  async createUser(ctx) {
    const { email, phone, idCard } = ctx.request.body;
    
    const secretKey = process.env.ENCRYPTION_KEY;
    
    // 加密敏感信息
    const encryptedPhone = strapi.crypto.aes.encryptSimple(phone, secretKey);
    const encryptedIdCard = strapi.crypto.aes.encryptSimple(idCard, secretKey);
    
    // 保存到数据库
    const user = await strapi.entityService.create('api::user.user', {
      data: {
        email,
        phone: encryptedPhone,
        idCard: encryptedIdCard,
      },
    });
    
    ctx.body = user;
  },
  
  async getUser(ctx) {
    const { id } = ctx.params;
    const secretKey = process.env.ENCRYPTION_KEY;
    
    const user = await strapi.entityService.findOne('api::user.user', id);
    
    // 解密敏感信息
    user.phone = strapi.crypto.aes.decryptSimple(user.phone, secretKey);
    user.idCard = strapi.crypto.aes.decryptSimple(user.idCard, secretKey);
    
    ctx.body = user;
  },
};
```

### 场景 2：API 签名验证

```javascript
// 生成 API 签名
module.exports = {
  async callThirdPartyAPI() {
    const timestamp = Date.now();
    const nonce = strapi.crypto.random.string(16);
    const data = { userId: 123, action: 'transfer' };
    
    // 生成签名
    const signString = `${timestamp}${nonce}${JSON.stringify(data)}`;
    const signature = strapi.crypto.hash.hmac(signString, process.env.API_SECRET);
    
    // 发送请求
    const response = await fetch('https://api.example.com/transfer', {
      method: 'POST',
      headers: {
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },
};
```

### 场景 3：生成安全 Token

```javascript
// 生成重置密码 Token
module.exports = {
  async sendResetPasswordEmail(ctx) {
    const { email } = ctx.request.body;
    
    // 生成 Token
    const tokenData = {
      email,
      expires: Date.now() + 3600000, // 1 小时过期
      nonce: strapi.crypto.random.uuid(),
    };
    
    const token = strapi.crypto.base64.urlEncode(JSON.stringify(tokenData));
    const signature = strapi.crypto.hash.hmac(token, process.env.TOKEN_SECRET);
    
    const resetLink = `https://example.com/reset?token=${token}&sig=${signature}`;
    
    // 发送邮件
    await strapi.plugins['email'].services.email.send({
      to: email,
      subject: '重置密码',
      html: `点击链接重置密码: <a href="${resetLink}">重置</a>`,
    });
    
    ctx.body = { message: '重置邮件已发送' };
  },
  
  async resetPassword(ctx) {
    const { token, sig } = ctx.query;
    
    // 验证签名
    const expectedSig = strapi.crypto.hash.hmac(token, process.env.TOKEN_SECRET);
    if (sig !== expectedSig) {
      return ctx.badRequest('无效的 token');
    }
    
    // 解析 token
    const tokenData = JSON.parse(strapi.crypto.base64.urlDecode(token));
    
    // 检查过期
    if (Date.now() > tokenData.expires) {
      return ctx.badRequest('token 已过期');
    }
    
    // 继续重置密码流程...
    ctx.body = { message: 'Token 验证成功' };
  },
};
```

### 场景 4：文件加密存储

```javascript
// 加密上传的文件
module.exports = {
  async uploadEncryptedFile(ctx) {
    const { files } = ctx.request;
    const file = files.file;
    
    // 读取文件内容
    const fileContent = await fs.promises.readFile(file.path, 'utf8');
    
    // 加密文件内容
    const secretKey = process.env.FILE_ENCRYPTION_KEY;
    const encrypted = strapi.crypto.aes.encryptSimple(fileContent, secretKey);
    
    // 保存加密文件
    const filename = strapi.crypto.random.uuid() + '.enc';
    await fs.promises.writeFile(`./encrypted/${filename}`, encrypted);
    
    ctx.body = {
      filename,
      message: '文件已加密上传',
    };
  },
};
```

---

## 🧪 测试接口

插件提供了测试接口来验证加密功能：

### 测试 AES 加密

```bash
# 加密
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "aes",
    "action": "encrypt",
    "data": "Hello World"
  }'

# 解密
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "aes",
    "action": "decrypt",
    "data": "加密后的字符串"
  }'
```

### 测试 RSA 加密

```bash
# 生成密钥对
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "rsa",
    "action": "generate"
  }'
```

### 测试哈希

```bash
curl -X POST http://localhost:1337/bag-strapi-plugin/crypto \
  -H "Content-Type: application/json" \
  -H "sign: test-sign-123" \
  -d '{
    "type": "hash",
    "action": "sha256",
    "data": "test data"
  }'
```

---

## ⚠️ 安全建议

### 1. 密钥管理

✅ **推荐做法**：

```javascript
// 使用环境变量
const secretKey = process.env.ENCRYPTION_KEY;

// 不同环境使用不同密钥
const key = process.env.NODE_ENV === 'production'
  ? process.env.PROD_ENCRYPTION_KEY
  : process.env.DEV_ENCRYPTION_KEY;
```

❌ **不要这样做**：

```javascript
// 不要硬编码密钥
const secretKey = 'my-secret-key-123';

// 不要提交到代码库
const key = 'super-secret-password';
```

### 2. 密钥强度

```javascript
// AES 密钥：至少 32 字符
const aesKey = process.env.AES_KEY; // 'a-very-strong-32-character-key!'

// RSA 密钥：至少 2048 位
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair(2048);

// 生产环境建议 4096 位
const keyPair = strapi.crypto.rsa.generateKeyPair(4096);
```

### 3. 加密最佳实践

```javascript
// ✅ 加密敏感数据
const encrypted = strapi.crypto.aes.encryptSimple(
  JSON.stringify({ ssn, creditCard }),
  process.env.DATA_KEY
);

// ✅ 使用 HMAC 而不是直接哈希用于验证
const signature = strapi.crypto.hash.hmac(data, secret);

// ✅ 为每个用途使用不同的密钥
const userDataKey = process.env.USER_DATA_KEY;
const fileKey = process.env.FILE_ENCRYPTION_KEY;
const tokenKey = process.env.TOKEN_SECRET;
```

### 4. 定期更换密钥

建立密钥轮换机制，定期更换加密密钥。

---

## 📋 API 快速参考

| 分类 | 方法 | 说明 |
|------|------|------|
| **AES** | `aes.encryptSimple(text, key)` | 简单加密 |
| | `aes.decryptSimple(encrypted, key)` | 简单解密 |
| | `aes.encrypt(text, key)` | 高级加密 |
| | `aes.decrypt(encrypted, key, iv, tag)` | 高级解密 |
| **RSA** | `rsa.generateKeyPair(bits)` | 生成密钥对 |
| | `rsa.encrypt(text, publicKey)` | 公钥加密 |
| | `rsa.decrypt(encrypted, privateKey)` | 私钥解密 |
| | `rsa.sign(data, privateKey)` | 私钥签名 |
| | `rsa.verify(data, sig, publicKey)` | 公钥验证 |
| **哈希** | `hash.md5(data)` | MD5 哈希 |
| | `hash.sha256(data)` | SHA256 哈希 |
| | `hash.sha512(data)` | SHA512 哈希 |
| | `hash.hmac(data, secret)` | HMAC-SHA256 |
| **随机** | `random.string(length)` | 随机字符串 |
| | `random.int(min, max)` | 随机整数 |
| | `random.uuid()` | UUID |
| **Base64** | `base64.encode(data)` | Base64 编码 |
| | `base64.decode(data)` | Base64 解码 |
| | `base64.urlEncode(data)` | URL 安全编码 |
| | `base64.urlDecode(data)` | URL 安全解码 |

---

## 🔗 相关文档

- [用户配置指南](./USER_CONFIG_GUIDE.md)
- [签名验证中间件](./server/MIDDLEWARE_USAGE.md)
- [Node.js Crypto 文档](https://nodejs.org/api/crypto.html)

---

**插件名称**: bag-strapi-plugin  
**版本**: 0.0.4  
**作者**: yanghang <470193837@qq.com>

