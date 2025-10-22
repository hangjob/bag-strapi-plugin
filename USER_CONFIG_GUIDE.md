# 插件配置指南

本文档适用于**使用 bag-strapi-plugin 插件的用户**。

## 📦 安装插件

```bash
# 使用 npm
npm install bag-strapi-plugin

# 使用 yarn
yarn add bag-strapi-plugin

# 使用 yalc（开发测试）
yalc add bag-strapi-plugin
```

---

## ⚙️ 配置插件

在你的 Strapi 项目中创建或修改 `config/plugins.js` 文件：

### 最小配置（启用签名验证）

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  // ... 其他插件配置
  
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,  // 启用签名验证
        validSigns: [
          'your-api-sign-key-here',
        ],
      },
    },
  },
});
```

### 完整配置示例

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        // 是否启用签名验证
        enabled: env.bool('PLUGIN_SIGN_VERIFY_ENABLED', true),
        
        // 有效的签名列表（简单模式）
        validSigns: [
          env('API_SIGN_FRONTEND', 'frontend-sign-2024'),
          env('API_SIGN_MOBILE', 'mobile-sign-2024'),
          env('API_SIGN_ADMIN', 'admin-sign-2024'),
        ],
        
        // 白名单：不需要验证的接口
        whitelist: [
          '/bag-strapi-plugin/health',
          '/bag-strapi-plugin/version',
          '/bag-strapi-plugin/public/.*',  // 正则：所有 public 下的接口
        ],
      },
    },
  },
});
```

### 使用环境变量（推荐）

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: env.bool('SIGN_VERIFY_ENABLED', false),
        validSigns: [
          env('API_SIGN_KEY'),  // 从环境变量读取
        ],
        whitelist: env.array('SIGN_WHITELIST', []),
      },
    },
  },
});
```

在 `.env` 文件中配置：

```env
# .env
SIGN_VERIFY_ENABLED=true
API_SIGN_KEY=your-production-sign-key-here

# 多个白名单用逗号分隔
SIGN_WHITELIST=/bag-strapi-plugin/health,/bag-strapi-plugin/version
```

---

## 🔐 高级加密模式（可选）

如果需要更高的安全性，可以使用高级加密模式：

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        
        // 不使用 validSigns，改用密钥
        secretKey: env('SIGN_SECRET_KEY', 'your-secret-key'),
        timeWindow: 300000,  // 5分钟有效期
        
        whitelist: [],
      },
    },
  },
});
```

**注意**：使用高级模式时，客户端需要使用动态签名算法（见下文）。

---

## 📝 不同环境的配置

### 开发环境（禁用验证）

```javascript
// config/env/development/plugins.js
module.exports = () => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: false,  // 开发环境禁用签名验证
      },
    },
  },
});
```

### 生产环境（启用验证）

```javascript
// config/env/production/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        validSigns: [
          env('API_SIGN_KEY'),  // 生产密钥从环境变量读取
        ],
        whitelist: [
          '/bag-strapi-plugin/health',
        ],
      },
    },
  },
});
```

---

## 🚀 客户端使用

### 方式一：简单签名（固定 sign）

配置了 `validSigns` 后，客户端只需在请求头中携带签名：

```javascript
// JavaScript/Node.js
const API_SIGN = 'your-api-sign-key-here';

fetch('http://localhost:1337/bag-strapi-plugin', {
  headers: {
    'sign': API_SIGN,
  },
});
```

```bash
# curl
curl -H "sign: your-api-sign-key-here" http://localhost:1337/bag-strapi-plugin
```

### 方式二：高级加密签名

如果使用了 `secretKey` 配置，客户端需要动态生成签名：

```javascript
// Node.js 客户端
const crypto = require('crypto');

function generateSign(secretKey, body = '') {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 15);
  const bodyStr = body ? JSON.stringify(body) : '';
  
  const signString = `${timestamp}${nonce}${secretKey}${bodyStr}`;
  const sign = crypto.createHash('md5').update(signString).digest('hex');
  
  return { sign, timestamp, nonce };
}

// 使用
const { sign, timestamp, nonce } = generateSign('your-secret-key');

fetch('http://localhost:1337/bag-strapi-plugin', {
  headers: {
    'sign': sign,
    'timestamp': timestamp,
    'nonce': nonce,
  },
});
```

---

## 🔍 测试配置

### 检查插件是否启用

启动 Strapi 后，查看日志：

```bash
npm run develop
```

### 测试签名验证

```bash
# 不带签名（应该返回 401）
curl http://localhost:1337/bag-strapi-plugin

# 带正确签名（应该返回 200）
curl -H "sign: your-api-sign-key-here" http://localhost:1337/bag-strapi-plugin
```

### 查看当前配置

在 Strapi 项目中创建测试脚本：

```javascript
// scripts/check-plugin-config.js
const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi().load();
  const config = app.config.get('plugin.bag-strapi-plugin');
  
  console.log('插件配置:');
  console.log(JSON.stringify(config, null, 2));
  
  await app.destroy();
})();
```

运行：

```bash
node scripts/check-plugin-config.js
```

---

## 📋 配置选项参考

| 配置项          | 类型      | 必填 | 默认值      | 说明             |
|--------------|---------|----|----------|----------------|
| `enabled`    | Boolean | 否  | `false`  | 是否启用签名验证       |
| `validSigns` | Array   | 否* | `[]`     | 有效的签名列表（简单模式）  |
| `secretKey`  | String  | 否* | -        | 加密密钥（高级模式）     |
| `timeWindow` | Number  | 否  | `300000` | 时间窗口（毫秒），仅高级模式 |
| `whitelist`  | Array   | 否  | `[]`     | 白名单路径（支持正则）    |

\* `validSigns` 和 `secretKey` 至少需要配置一个

---

## ⚠️ 常见问题

### Q1: 所有接口都返回 401？

**原因**：签名验证已启用，但请求未携带签名或签名错误。

**解决**：

1. 检查 `config/plugins.js` 中的 `validSigns` 配置
2. 确保客户端请求头包含 `sign` 字段
3. 确保签名值在 `validSigns` 列表中

### Q2: 如何临时禁用签名验证？

```javascript
// config/plugins.js
'bag-strapi-plugin': {
  config: {
    signVerify: {
      enabled: false,  // 禁用
    },
  },
}
```

### Q3: 如何让某个接口不需要签名？

在 `whitelist` 中添加该接口路径：

```javascript
whitelist: [
  '/bag-strapi-plugin/your-public-endpoint',
]
```

### Q4: 配置修改后不生效？

1. 重启 Strapi 服务
2. 清除缓存：`npm run build`
3. 检查配置文件是否有语法错误

### Q5: 如何使用多个签名？

```javascript
validSigns: [
  'frontend-sign',
  'mobile-sign',
  'admin-sign',
  'third-party-sign',
]
```

不同的客户端可以使用不同的签名。

---

## 🔐 安全最佳实践

1. ✅ **使用环境变量**
   ```javascript
   validSigns: [env('API_SIGN_KEY')]
   ```

2. ✅ **不同环境不同签名**
   ```env
   # .env.development
   API_SIGN_KEY=dev-sign-123
   
   # .env.production
   API_SIGN_KEY=prod-sign-xyz
   ```

3. ✅ **定期更换签名**
    - 建立签名轮换机制
    - 支持多个有效签名，便于平滑切换

4. ✅ **使用 HTTPS**
    - 生产环境必须使用 HTTPS
    - 防止签名被窃取

5. ✅ **记录失败尝试**
    - 监控 401 错误
    - 设置告警

---

## 📚 示例项目

### 目录结构

```
my-strapi-project/
├── config/
│   ├── plugins.js           # 插件配置
│   └── env/
│       ├── development/
│       │   └── plugins.js   # 开发环境配置
│       └── production/
│           └── plugins.js   # 生产环境配置
├── .env                      # 环境变量
└── package.json
```

### config/plugins.js

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    resolve: './node_modules/bag-strapi-plugin',
    config: {
      signVerify: {
        enabled: env.bool('SIGN_VERIFY_ENABLED', true),
        validSigns: env.array('VALID_SIGNS', []),
        whitelist: env.array('SIGN_WHITELIST', []),
      },
    },
  },
});
```

### .env

```env
SIGN_VERIFY_ENABLED=true
VALID_SIGNS=frontend-sign-2024,mobile-sign-2024
SIGN_WHITELIST=/bag-strapi-plugin/health,/bag-strapi-plugin/version
```

---

## 📞 获取帮助

如果遇到问题，请：

1. 查看插件文档：`node_modules/bag-strapi-plugin/GLOBAL_MIDDLEWARE_README.md`
2. 检查配置是否正确
3. 查看 Strapi 日志输出
4. 联系插件作者

---

**插件名称**: bag-strapi-plugin  
**版本**: 0.0.1  
**作者**: yanghang <470193837@qq.com>

