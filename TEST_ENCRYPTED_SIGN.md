# 测试加密签名

## 📋 测试步骤

### 第 1 步：生成加密签名

```bash
node server/generate-encrypted-sign.js
```

你会看到类似输出：

```
========================================
   加密签名生成工具
========================================

密钥: 5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq
密钥长度: 32 字符

示例 1:
原文: bag
加密签名: eyJlIjoiNGYxMzJhZGY4ZjA5YjJjZDNlNGY1YTZiN2M4ZDllMA..."

示例 2:
原文: bag-token
加密签名: eyJlIjoiODJhMzRiY2Y2YTExMmIzYzRkNWU2ZjdhOGI5YzBkMWU..."
```

### 第 2 步：构建插件

```bash
npm run build && yalc publish
```

### 第 3 步：在 Strapi 项目中更新插件

```bash
# 在你的 Strapi 项目目录
yalc update bag-strapi-plugin
npm run develop
```

### 第 4 步：配置插件

在 `config/plugins.js` 中：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        mode: 'encrypted',  // 使用加密模式
        encryptionKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',
      },
    },
  },
});
```

或者不配置 `encryptionKey`，它会自动使用 `crypto.aesKey`：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      crypto: {
        aesKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',
      },
      signVerify: {
        enabled: true,
        mode: 'encrypted',
        // encryptionKey 为空时，自动使用 crypto.aesKey
      },
    },
  },
});
```

### 第 5 步：测试请求

```bash
# 使用生成的加密签名（复制上面生成的签名）
curl -H "sign: eyJlIjoiNGYxMzJhZGY4ZjA5..." http://localhost:1337/bag-strapi-plugin
```

---

## 🔍 预期日志输出

### 成功的情况：

```
🔍 [中间件] 请求路径: /bag-strapi-plugin
✅ [中间件] 匹配插件路径，执行签名验证
🔐 [中间件] 开始执行签名验证
🔐 [sign-verify] 签名验证中间件被调用
🔐 [sign-verify] 请求签名: eyJlIjoiNGYxMzJhZGY4...
🔍 [verifySign] 开始验证签名
🔍 [verifySign] 验证模式: encrypted
🔐 [verifyEncryptedSign] 开始解密签名
🔐 [verifyEncryptedSign] 使用密钥长度: 32
🔐 [verifyEncryptedSign] 解密结果: bag
🔐 [verifyEncryptedSign] 是否包含 "bag": true
🔐 [sign-verify] 签名验证结果: true
✅ [sign-verify] 签名验证通过，继续执行
📍 [controller.index] 被调用
```

### 失败的情况（签名不包含 'bag'）：

```
🔐 [verifyEncryptedSign] 解密结果: hello
🔐 [verifyEncryptedSign] 是否包含 "bag": false
🔐 [sign-verify] 签名验证结果: false
❌ [sign-verify] 签名验证失败，返回 401
```

### 失败的情况（解密失败）：

```
❌ [verifyEncryptedSign] 解密失败: Unsupported state or unable to authenticate data
🔐 [sign-verify] 签名验证结果: false
❌ [sign-verify] 签名验证失败，返回 401
```

---

## ✅ 测试一次性签名

### 配置

```javascript
signVerify: {
  enabled: true,
  mode: 'encrypted',
  enableOnceOnly: true,  // 启用一次性签名
  signExpiration: 3600000,
}
```

### 测试步骤

```bash
# 生成新的签名
SIGN=$(node -e "const c=require('crypto');const k='5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq';const key=c.scryptSync(k,'salt',32);const iv=c.randomBytes(16);const cipher=c.createCipheriv('aes-256-gcm',key,iv);let e=cipher.update('bag','utf8','hex');e+=cipher.final('hex');const t=cipher.getAuthTag();console.log(Buffer.from(JSON.stringify({e:e,i:iv.toString('hex'),a:t.toString('hex')})).toString('base64'))")

# 第一次请求 - 应该成功
curl -H "sign: $SIGN" http://localhost:1337/bag-strapi-plugin

# 第二次请求 - 应该失败（401）
curl -H "sign: $SIGN" http://localhost:1337/bag-strapi-plugin
```

### 预期结果

**第一次请求**：
```json
{
  "message": "Welcome to Strapi 🚀"
}
```

日志：
```
✅ [verifySign] 签名已标记为使用
📝 [SignStorage] 签名已标记为使用: eyJlIjoiNGYxMzJh...
```

**第二次请求**：
```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "无权限访问：签名验证失败"
  }
}
```

日志：
```
🔍 [verifySign] 检查一次性签名
❌ [verifySign] 签名已使用过（一次性签名验证失败）
```

---

## 🧪 不同模式测试

### 模式 1：简单签名

配置：
```javascript
signVerify: {
  mode: 'simple',
  validSigns: ['test-sign-123'],
}
```

测试：
```bash
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin
```

### 模式 2：加密签名

配置：
```javascript
signVerify: {
  mode: 'encrypted',
  encryptionKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',
}
```

测试：
```bash
# 使用生成的加密签名
curl -H "sign: eyJlIjoiNGYxMzJh..." http://localhost:1337/bag-strapi-plugin
```

### 模式 3：混合模式

配置：
```javascript
signVerify: {
  mode: 'both',
  validSigns: ['test-sign-123'],
  encryptionKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',
}
```

测试：
```bash
# 简单签名 - 成功
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin

# 加密签名 - 成功
curl -H "sign: eyJlIjoiNGYxMzJh..." http://localhost:1337/bag-strapi-plugin

# 错误签名 - 失败
curl -H "sign: invalid-sign" http://localhost:1337/bag-strapi-plugin
```

---

## 🔍 调试检查清单

- [ ] 插件已构建并发布 (`npm run build && yalc publish`)
- [ ] Strapi 项目已更新插件 (`yalc update bag-strapi-plugin`)
- [ ] 配置文件正确 (`config/plugins.js`)
- [ ] 验证模式正确设置 (`mode: 'encrypted'`)
- [ ] 加密密钥已配置（或使用默认的 `crypto.aesKey`）
- [ ] Strapi 已重启
- [ ] 查看控制台日志

---

## ❓ 常见问题

### Q1: 解密失败

```
❌ [verifyEncryptedSign] 解密失败: Unsupported state or unable to authenticate data
```

**原因**：
- 加密密钥不正确
- 签名格式错误

**解决**：
1. 确认客户端和服务端使用相同的密钥
2. 使用 `node server/generate-encrypted-sign.js` 生成正确的签名

### Q2: 解密成功但验证失败

```
🔐 [verifyEncryptedSign] 解密结果: hello
🔐 [verifyEncryptedSign] 是否包含 "bag": false
```

**原因**：解密后的内容不包含 'bag' 字符串

**解决**：确保加密的原文包含 'bag'，例如：
- `bag`
- `bag-token`
- `user-bag-123`

### Q3: 一次性签名不生效

**检查**：
1. `enableOnceOnly` 是否设为 `true`
2. 查看日志是否有 "签名已标记为使用"
3. 第二次请求是否返回 401

---

## 📝 快速测试脚本

创建 `test-encrypted.sh`：

```bash
#!/bin/bash

# 生成签名
echo "生成加密签名..."
node server/generate-encrypted-sign.js

echo ""
echo "请复制上面的加密签名，然后运行："
echo "curl -H \"sign: 你的签名\" http://localhost:1337/bag-strapi-plugin"
```

---

**完整文档**：[加密签名指南](./ENCRYPTED_SIGN_GUIDE.md)

