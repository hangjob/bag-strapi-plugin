# 全局签名验证中间件

## 🎯 功能说明

已成功实现**全局签名验证中间件**，自动拦截插件的所有 API 请求！

## ✨ 特点

- ✅ **全局拦截**：无需在每个路由单独配置，自动拦截所有 `/bag-strapi-plugin` 的请求
- ✅ **开关控制**：可通过配置启用/禁用
- ✅ **白名单机制**：支持配置不需要验证的路径
- ✅ **灵活配置**：支持固定签名和动态加密签名两种模式

## 📁 实现文件

```
server/
├── src/
│   ├── register.js                          # ⭐ 全局中间件注册
│   ├── config/index.js                      # ⚙️ 配置文件
│   ├── middlewares/
│   │   ├── index.js                         # 中间件导出
│   │   ├── sign-verify.js                   # 简单签名验证
│   │   └── sign-verify-advanced.js          # 高级加密验证
│   ├── routes/content-api.js                # API 路由
│   └── controllers/controller.js            # 控制器
├── test-sign.js                             # 签名生成工具
├── test-global-middleware.js                # 🧪 全局中间件测试工具
├── GLOBAL_MIDDLEWARE.md                     # 📚 详细文档
└── MIDDLEWARE_USAGE.md                      # 基础使用说明
```

## 🚀 快速开始

### 1️⃣ 配置签名

编辑 `server/src/config/index.js`：

```javascript
export default {
  default: {
    signVerify: {
      enabled: true,  // 启用签名验证
      
      // 有效的签名列表
      validSigns: [
        'test-sign-123',
        'production-sign-456',
      ],
      
      // 白名单（可选）
      whitelist: [
        '/bag-strapi-plugin/health',
      ],
    },
  },
};
```

### 2️⃣ 构建插件

```bash
npm run build
```

### 3️⃣ 启动并测试

```bash
# 启动 Strapi
npm run develop

# 在另一个终端运行测试
node server/test-global-middleware.js all
```

## 🧪 测试工具

### 运行完整测试套件

```bash
node server/test-global-middleware.js all
```

输出示例：
```
========================================
   全局签名验证中间件测试
========================================
服务器: http://localhost:1337
插件路径: /bag-strapi-plugin
有效签名: test-sign-123
========================================

❌ 测试1: 缺少签名 - 应该返回 401
请求: GET /bag-strapi-plugin/
响应状态: 401
✓ 测试通过

✅ 测试3: 正确的签名 - 应该返回 200
请求: GET /bag-strapi-plugin/
请求头: {"sign":"test-sign-123"}
响应状态: 200
✓ 测试通过

========================================
   测试结果汇总
========================================
通过: 5
失败: 0
总计: 5
========================================

🎉 所有测试通过！
```

### 快速测试

```bash
node server/test-global-middleware.js quick
```

### 生成 curl 命令

```bash
node server/test-global-middleware.js curl
```

## 📝 使用示例

### 示例 1：带签名的 GET 请求

```bash
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin
```

✅ **成功响应**：
```json
{
  "message": "Welcome to Strapi 🚀"
}
```

### 示例 2：不带签名（失败）

```bash
curl http://localhost:1337/bag-strapi-plugin
```

❌ **失败响应**：
```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "无权限访问：缺少签名",
    "details": {
      "message": "请在请求头中携带 sign 参数"
    }
  }
}
```

### 示例 3：POST 请求带签名

```bash
curl -X POST \
  -H "sign: test-sign-123" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","value":123}' \
  http://localhost:1337/bag-strapi-plugin/test
```

✅ **成功响应**：
```json
{
  "message": "签名验证通过！",
  "data": {
    "name": "test",
    "value": 123
  },
  "timestamp": 1234567890123
}
```

## ⚙️ 配置选项

### 基础配置

| 配置项 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `enabled` | Boolean | 是否启用签名验证 | `true` |
| `validSigns` | Array | 有效的签名列表 | `[]` |
| `whitelist` | Array | 白名单路径（支持正则） | `[]` |

### 临时禁用签名验证

```javascript
// server/src/config/index.js
export default {
  default: {
    signVerify: {
      enabled: false,  // 禁用
    },
  },
};
```

### 添加白名单路径

```javascript
{
  signVerify: {
    enabled: true,
    validSigns: ['test-sign-123'],
    whitelist: [
      '/bag-strapi-plugin/health',      // 精确匹配
      '/bag-strapi-plugin/public/.*',   // 正则匹配
    ],
  }
}
```

## 🌐 客户端集成

### JavaScript / Node.js

```javascript
const API_SIGN = 'test-sign-123';
const BASE_URL = 'http://localhost:1337/bag-strapi-plugin';

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'sign': API_SIGN,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response.json();
}

// 使用
const data = await apiRequest('/');
console.log(data);
```

### axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1337/bag-strapi-plugin',
  headers: {
    'sign': 'test-sign-123',
  },
});

// 使用
const response = await api.get('/');
console.log(response.data);
```

### Python

```python
import requests

API_SIGN = 'test-sign-123'
BASE_URL = 'http://localhost:1337/bag-strapi-plugin'

headers = {
    'sign': API_SIGN,
    'Content-Type': 'application/json'
}

response = requests.get(BASE_URL, headers=headers)
print(response.json())
```

## 🔐 安全建议

1. ✅ **使用环境变量**：不要在代码中硬编码签名
   ```javascript
   validSigns: [process.env.API_SIGN_KEY]
   ```

2. ✅ **不同环境不同签名**：开发、测试、生产使用不同的签名

3. ✅ **定期更换签名**：建立签名轮换机制

4. ✅ **使用 HTTPS**：生产环境必须使用 HTTPS

5. ✅ **记录失败尝试**：监控异常访问模式

## 📊 当前 API 列表

所有以下接口都会被全局中间件拦截：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/bag-strapi-plugin` | 首页 |
| POST | `/bag-strapi-plugin/test` | 测试接口 |

### 添加新接口

在 `server/src/routes/content-api.js` 中添加路由即可，会自动应用签名验证：

```javascript
export default [
  {
    method: 'GET',
    path: '/new-api',
    handler: 'controller.newMethod',
    config: { policies: [] },
  },
];
```

## 🔄 切换到高级加密模式

如果需要更高的安全性，可以切换到高级加密模式（支持时间戳和防重放攻击）：

### 1. 修改 register.js

```javascript
// server/src/register.js
import signVerifyAdvanced from './middlewares/sign-verify-advanced';

// 将这一行：
const middleware = signVerify(config, { strapi });

// 改为：
const middleware = signVerifyAdvanced(config, { strapi });
```

### 2. 更新配置

```javascript
{
  signVerify: {
    enabled: true,
    secretKey: 'your-super-secret-key',
    timeWindow: 300000,  // 5分钟
  }
}
```

### 3. 使用高级签名

```bash
node server/test-sign.js advanced
```

## 📚 详细文档

- [完整使用文档](./server/GLOBAL_MIDDLEWARE.md)
- [中间件详细说明](./server/MIDDLEWARE_USAGE.md)

## 🆘 常见问题

### Q: 所有接口都返回 401？

A: 检查配置文件中的 `validSigns` 是否包含你使用的签名。

### Q: 如何让某个接口不需要签名？

A: 在配置的 `whitelist` 中添加该路径。

### Q: 如何临时禁用签名验证？

A: 设置 `enabled: false`。

### Q: 如何查看中间件是否生效？

A: 运行 `node server/test-global-middleware.js all`。

## 🎉 完成！

现在你的插件已经具备全局签名验证功能，所有 API 请求都会被自动拦截和验证！

---

**作者**: bag-strapi-plugin  
**版本**: 0.0.1

