# bag-strapi-plugin

一个为 Strapi 提供通用功能的插件，包含全局签名验证中间件等功能。

## ✨ 功能特性

- ✅ **全局签名验证中间件** - 拦截所有 API 请求，支持加密签名和一次性签名
- ✅ **加密工具库** - AES 对称加密、RSA 非对称加密、哈希函数等
- ✅ **菜单数据库表** - 安装插件自动创建菜单数据库表，包含完整的菜单字段
- ✅ **全局可用** - 在 Strapi 任何地方通过 `strapi.crypto` 调用
- ✅ **加密签名验证** - 解密签名验证是否包含 'bag'，防止伪造
- ✅ **一次性签名** - 签名只能使用一次，自动清理过期签名
- ✅ **自定义登录页面** - 提供现代化的登录组件
- ✅ **灵活配置** - 支持多种验证模式和配置方式
- ✅ **白名单机制** - 可配置不需要验证的接口
- ✅ **管理面板扩展** - 添加自定义菜单和页面

---

## 📦 安装使用

### 对于使用者

如果你想在自己的 Strapi 项目中使用本插件，请查看：

👉 **[用户配置指南](./USER_CONFIG_GUIDE.md)**

### 快速开始

```bash
# 安装插件
npm install bag-strapi-plugin

# 或使用 yalc（开发测试）
yalc add bag-strapi-plugin
```

在你的 Strapi 项目中配置插件 `config/plugins.js`：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        validSigns: [
          env('API_SIGN_KEY', 'your-sign-key-here'),
        ],
      },
    },
  },
});
```

详细配置说明请参考 [用户配置指南](./USER_CONFIG_GUIDE.md)。

### 配置加密工具

在你的 Strapi 项目中创建或编辑 `.env` 文件：

```env
# 加密工具配置
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key
```

然后在 `config/plugins.js` 中配置：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      crypto: {
        aesKey: env('CRYPTO_AES_KEY'),
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
      },
      // ... 其他配置
    },
  },
});
```

### 使用加密工具

```javascript
// 在控制器、服务或中间件中使用
module.exports = {
  async encryptData(ctx) {
    // 获取配置的密钥
    const aesKey = strapi.crypto.config.getAesKey();
    
    // AES 加密（使用配置的密钥）
    const encrypted = strapi.crypto.aes.encryptSimple('敏感数据', aesKey);
    
    // RSA 加密
    const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();
    const rsaEncrypted = strapi.crypto.rsa.encrypt('机密信息', publicKey);
    
    // 哈希
    const hash = strapi.crypto.hash.sha256('password123');
    
    // HMAC 签名（使用配置的密钥）
    const hmacSecret = strapi.crypto.config.getHmacSecret();
    const signature = strapi.crypto.hash.hmac('数据', hmacSecret);
    
    // 生成随机 Token
    const token = strapi.crypto.random.uuid();
    
    ctx.body = { encrypted, hash, signature, token };
  }
};
```

详细使用说明请参考：
- [加密工具配置指南](./CRYPTO_CONFIG_GUIDE.md) - **必读**
- [加密工具完整指南](./CRYPTO_UTILS_GUIDE.md)

---

## 🔧 插件开发

### 环境信息
- Node v22.10.0+

### 软连接发布插件
在修改完成后，需要执行以下命令
```bash
npm run build
yalc publish 
```

选择性的验证插件
```bash
npm run verify
```

安装包，进入项目执行命令，会看到类似 my-strapi-plugin@x.x.x published in store 的提示
```bash
 npx yalc add --link bag-strapi-plugin
```

删除包
```bash
yalc remove bag-strapi-plugin
```


### 安装必要包
```bash
pnpm i svg-captcha bcrypt rate-limiter-flexible @strapi/icons
```

---

## 📚 文档

### 加密工具
- **[加密工具配置指南](./CRYPTO_CONFIG_GUIDE.md)** - ⭐ 如何配置和使用加密密钥（必读）
- **[RSA 密钥配置指南](./RSA_CONFIG_GUIDE.md)** - 如何配置固定的 RSA 密钥对
- **[加密工具完整指南](./CRYPTO_UTILS_GUIDE.md)** - 完整使用文档和150+示例
- **[使用示例](./CRYPTO_EXAMPLES.md)** - 实用代码示例
- **[快速参考](./CRYPTO_QUICK_REFERENCE.md)** - 常用 API 速查

### 签名验证
- **[加密签名指南](./ENCRYPTED_SIGN_GUIDE.md)** - ⭐ 加密签名与一次性签名使用指南（推荐）
- **[测试加密签名](./TEST_ENCRYPTED_SIGN.md)** - 加密签名测试步骤
- **[用户配置指南](./USER_CONFIG_GUIDE.md)** - 如何在 Strapi 项目中配置和使用本插件
- **[全局中间件文档](./server/GLOBAL_MIDDLEWARE.md)** - 全局签名验证中间件详细说明
- **[中间件使用说明](./server/MIDDLEWARE_USAGE.md)** - 基础中间件使用文档
- **[快速开始指南](./GLOBAL_MIDDLEWARE_README.md)** - 全局中间件快速开始
- **[调试指南](./DEBUG_GUIDE.md)** - 中间件调试步骤

### 菜单数据库
- **[菜单快速开始](./MENU_QUICK_START.md)** - ⭐ 3分钟快速上手（推荐）
- **[菜单数据库文档](./MENU_DATABASE.md)** - 完整的使用方法和示例

### 自定义登录页面
- **[如何覆盖登录页面](./HOW_TO_OVERRIDE_LOGIN.md)** - ⭐ 3步完成（必读）
- **[登录页面使用示例](./LOGIN_USAGE_EXAMPLE.md)** - 完整步骤和代码示例
- **[登录页面覆盖指南](./OVERRIDE_LOGIN_GUIDE.md)** - 详细说明和注意事项
- **[自定义登录指南](./CUSTOM_LOGIN_GUIDE.md)** - 高级自定义技巧

---

## 🧪 测试

### 插件开发测试

```bash
# 测试加密工具
node server/test-crypto.js

# 生成加密签名
node server/generate-encrypted-sign.js

# 生成简单签名
node server/test-sign.js simple

# 测试全局中间件
node server/test-global-middleware.js all
```

### 在 Strapi 项目中测试

```bash
# 启动 Strapi
npm run develop

# 测试不带签名（应该返回 401）
curl http://localhost:1337/bag-strapi-plugin

# 测试带签名（应该返回 200）
curl -H "sign: your-sign-key" http://localhost:1337/bag-strapi-plugin
```

---

## 🔐 安全说明

1. **默认配置**：插件默认 `enabled: false`，不会启用签名验证
2. **用户配置**：用户需要在自己的项目中显式配置并启用
3. **环境变量**：建议使用环境变量存储签名密钥
4. **HTTPS**：生产环境务必使用 HTTPS

---

## 📝 更新日志

### v0.0.4
- ✅ 新增加密工具库（AES、RSA、哈希等）
- ✅ 全局可用 `strapi.crypto` 对象
- ✅ 加密签名验证（解密后检查是否包含 'bag'）
- ✅ 一次性签名功能（签名只能使用一次）
- ✅ 三种验证模式：simple、encrypted、both
- ✅ 签名存储管理器，自动清理过期签名
- ✅ 菜单数据库表自动创建（16个字段）
- ✅ 自定义登录页面组件
- ✅ RSA 密钥对配置化
- ✅ 完善的配置系统和辅助方法
- ✅ 添加加密签名生成工具
- ✅ 完善文档和使用指南（17+ 文档文件）

### v0.0.3
- ✅ 修复中间件配置读取问题
- ✅ 添加调试日志
- ✅ 优化路径匹配逻辑

### v0.0.1
- ✅ 实现全局签名验证中间件
- ✅ 支持简单签名和高级加密签名
- ✅ 支持白名单机制
- ✅ 添加管理面板菜单扩展

---

## 👥 作者

**yanghang** <470193837@qq.com>

## 📄 许可证

MIT License
