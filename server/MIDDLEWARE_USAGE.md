# 签名验证中间件使用说明

## 概述

本插件提供了两种签名验证中间件：

1. **sign-verify** - 简单的签名验证（固定签名列表）
2. **sign-verify-advanced** - 高级签名验证（基于时间戳和密钥的动态签名）

## 方案一：简单签名验证

### 配置

在 `server/src/config/index.js` 中配置有效签名列表：

```javascript
export default {
  default: {
    signVerify: {
      validSigns: [
        'test-sign-123',
        'production-sign-456',
      ],
    },
  },
};
```

### 使用

在路由中应用中间件：

```javascript
export default [
    {
        method: 'GET',
        path: '/',
        handler: 'controller.index',
        config: {
            middlewares: ['plugin::bag-strapi-plugin.sign-verify'],
        },
    },
];
```

### 请求示例

```bash
# 成功请求
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin

# 失败请求（缺少签名）
curl http://localhost:1337/bag-strapi-plugin

# 失败请求（签名错误）
curl -H "sign: invalid-sign" http://localhost:1337/bag-strapi-plugin
```

---

## 方案二：高级签名验证（推荐用于生产环境）

### 配置

1. 更新 `server/src/middlewares/index.js`：

```javascript
import signVerify from './sign-verify';
import signVerifyAdvanced from './sign-verify-advanced';

export default {
    'sign-verify': signVerify,
    'sign-verify-advanced': signVerifyAdvanced,
};
```

2. 配置密钥（`server/src/config/index.js`）：

```javascript
export default {
  default: {
    signVerify: {
      secretKey: 'your-super-secret-key',
      timeWindow: 300000, // 5分钟有效期
    },
  },
};
```

或使用环境变量（更安全）：

```env
SIGN_SECRET_KEY=your-super-secret-key
```

### 使用

在路由中应用高级中间件：

```javascript
export default [
    {
        method: 'POST',
        path: '/secure-endpoint',
        handler: 'controller.secureMethod',
        config: {
            middlewares: ['plugin::bag-strapi-plugin.sign-verify-advanced'],
        },
    },
];
```

### 签名生成算法

```javascript
const crypto = require('crypto');

function generateSign(timestamp, nonce, secretKey, body = '') {
  const signString = `${timestamp}${nonce}${secretKey}${body}`;
  return crypto.createHash('md5').update(signString).digest('hex');
}

// 示例
const timestamp = Date.now();
const nonce = 'random-string-12345';
const secretKey = 'your-super-secret-key';
const body = JSON.stringify({ name: 'test' });

const sign = generateSign(timestamp, nonce, secretKey, body);
```

### 请求示例

```bash
# Node.js 客户端示例
const crypto = require('crypto');
const axios = require('axios');

async function secureRequest() {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(7);
  const secretKey = 'your-super-secret-key';
  const body = { name: 'test', value: 123 };
  const bodyStr = JSON.stringify(body);
  
  // 生成签名
  const signString = `${timestamp}${nonce}${secretKey}${bodyStr}`;
  const sign = crypto.createHash('md5').update(signString).digest('hex');
  
  // 发送请求
  const response = await axios.post(
    'http://localhost:1337/bag-strapi-plugin/secure-endpoint',
    body,
    {
      headers: {
        'sign': sign,
        'timestamp': timestamp,
        'nonce': nonce,
        'Content-Type': 'application/json',
      }
    }
  );
  
  return response.data;
}
```

```bash
# curl 示例（GET 请求）
TIMESTAMP=$(date +%s)000
NONCE="test-nonce-123"
SECRET_KEY="your-super-secret-key"
SIGN=$(echo -n "${TIMESTAMP}${NONCE}${SECRET_KEY}" | md5sum | cut -d' ' -f1)

curl -X GET \
  -H "sign: $SIGN" \
  -H "timestamp: $TIMESTAMP" \
  -H "nonce: $NONCE" \
  http://localhost:1337/bag-strapi-plugin
```

---

## 全局应用中间件

如果想对插件的所有路由应用签名验证，可以在 `server/src/routes/index.js` 中配置：

```javascript
import contentAPIRoutes from './content-api';

const routes = {
    'content-api': {
        type: 'content-api',
        routes: contentAPIRoutes.map(route => ({
            ...route,
            config: {
                ...route.config,
                middlewares: [
                    ...(route.config.middlewares || []),
                    'plugin::bag-strapi-plugin.sign-verify-advanced',
                ],
            },
        })),
    },
};

export default routes;
```

---

## 错误响应格式

当签名验证失败时，返回 401 状态码和以下格式的 JSON：

```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "无权限访问",
    "details": {
      "message": "签名验证失败",
      "timestamp": 1234567890123
    }
  }
}
```

---

## 安全建议

1. **使用 HTTPS**：在生产环境中始终使用 HTTPS
2. **密钥管理**：使用环境变量存储密钥，不要硬编码
3. **时间窗口**：设置合理的时间窗口（5-15分钟）
4. **Nonce**：使用随机数防止重放攻击
5. **日志记录**：记录失败的验证尝试
6. **限流**：结合限流中间件防止暴力破解

---

## 自定义签名算法

如需使用其他签名算法（如 SHA256、HMAC 等），可以修改 `sign-verify-advanced.js`：

```javascript
// SHA256
const expectedSign = crypto
  .createHash('sha256')
  .update(signString)
  .digest('hex');

// HMAC-SHA256
const expectedSign = crypto
  .createHmac('sha256', secretKey)
  .update(signString)
  .digest('hex');
```

---

## 测试

创建测试脚本 `test-sign.js`：

```javascript
const crypto = require('crypto');

function testSign() {
  const timestamp = Date.now().toString();
  const nonce = 'test-nonce';
  const secretKey = 'your-super-secret-key';
  const body = '';
  
  const signString = `${timestamp}${nonce}${secretKey}${body}`;
  const sign = crypto.createHash('md5').update(signString).digest('hex');
  
  console.log('请求头参数：');
  console.log(`sign: ${sign}`);
  console.log(`timestamp: ${timestamp}`);
  console.log(`nonce: ${nonce}`);
  console.log('\ncurl 命令：');
  console.log(`curl -H "sign: ${sign}" -H "timestamp: ${timestamp}" -H "nonce: ${nonce}" http://localhost:1337/bag-strapi-plugin`);
}

testSign();
```

运行测试：

```bash
node test-sign.js
```

