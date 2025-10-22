# 快速开始 - bag-strapi-plugin

## 🚀 5 分钟快速配置

### 1️⃣ 安装插件

```bash
npm install bag-strapi-plugin
# 或
yarn add bag-strapi-plugin
```

### 2️⃣ 配置插件

创建或编辑 `config/plugins.js`：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        validSigns: ['your-sign-key-here'],
      },
    },
  },
});
```

### 3️⃣ 添加环境变量（推荐）

在 `.env` 文件中添加：

```env
API_SIGN_KEY=your-production-sign-key
```

然后修改配置：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        validSigns: [env('API_SIGN_KEY')],
      },
    },
  },
});
```

### 4️⃣ 启动 Strapi

```bash
npm run develop
```

### 5️⃣ 测试接口

```bash
# ❌ 不带签名（会返回 401）
curl http://localhost:1337/bag-strapi-plugin

# ✅ 带签名（返回 200）
curl -H "sign: your-sign-key-here" http://localhost:1337/bag-strapi-plugin
```

---

## 📱 客户端使用

### JavaScript

```javascript
const API_SIGN = 'your-sign-key-here';

fetch('http://localhost:1337/bag-strapi-plugin', {
  headers: {
    'sign': API_SIGN,
  },
})
.then(res => res.json())
.then(data => console.log(data));
```

### axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1337',
  headers: {
    'sign': 'your-sign-key-here',
  },
});

const response = await api.get('/bag-strapi-plugin');
```

---

## ⚙️ 常用配置

### 开发环境禁用验证

```javascript
// config/env/development/plugins.js
module.exports = () => ({
  'bag-strapi-plugin': {
    config: {
      signVerify: {
        enabled: false,  // 开发时禁用
      },
    },
  },
});
```

### 添加白名单

```javascript
{
  signVerify: {
    enabled: true,
    validSigns: ['your-sign-key'],
    whitelist: [
      '/bag-strapi-plugin/health',
      '/bag-strapi-plugin/public/.*',
    ],
  }
}
```

### 多个签名

```javascript
{
  signVerify: {
    enabled: true,
    validSigns: [
      'frontend-sign',
      'mobile-sign',
      'admin-sign',
    ],
  }
}
```

---

## 📚 更多文档

- [完整配置指南](./USER_CONFIG_GUIDE.md)
- [全局中间件文档](./server/GLOBAL_MIDDLEWARE.md)
- [中间件使用说明](./server/MIDDLEWARE_USAGE.md)

---

## 🆘 遇到问题？

### 所有请求返回 401

✅ **检查**：
1. 配置中的 `enabled` 是否为 `true`
2. `validSigns` 是否包含你使用的签名
3. 请求头是否包含 `sign` 字段

### 配置不生效

✅ **解决**：
1. 重启 Strapi 服务
2. 检查 `config/plugins.js` 语法是否正确
3. 查看控制台是否有错误信息

### 临时禁用验证

✅ **方法**：
```javascript
signVerify: { enabled: false }
```

---

## 💡 小贴士

1. ✅ 使用环境变量存储签名
2. ✅ 不同环境使用不同签名
3. ✅ 生产环境使用强密钥
4. ✅ 生产环境启用 HTTPS
5. ✅ 定期更换签名密钥

---

**完整文档**：[用户配置指南](./USER_CONFIG_GUIDE.md)

