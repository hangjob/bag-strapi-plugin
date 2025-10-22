# 全局签名验证中间件

## 概述

本插件实现了**全局签名验证中间件**，会自动拦截所有插件的 API 请求，验证请求头中的 `sign` 签名。

## ✨ 特性

- ✅ **全局拦截**：自动拦截所有插件 API 请求
- ✅ **白名单机制**：支持配置不需要验证的路径
- ✅ **开关控制**：可以启用/禁用签名验证
- ✅ **灵活配置**：支持多种验证模式
- ✅ **零侵入**：无需在每个路由配置中间件

---

## 🚀 快速开始

### 1. 配置签名验证

编辑 `server/src/config/index.js`：

```javascript
export default {
  default: {
    signVerify: {
      // 启用签名验证
      enabled: true,
      
      // 有效的签名列表
      validSigns: [
        'test-sign-123',
        'production-sign-456',
      ],
      
      // 白名单：不需要验证的路径
      whitelist: [
        '/bag-strapi-plugin/health',      // 健康检查接口
        '/bag-strapi-plugin/public/.*',   // 公开接口（正则）
      ],
    },
  },
};
```

### 2. 测试接口

```bash
# 生成测试签名
node server/test-sign.js simple

# 测试 GET 接口
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin

# 测试 POST 接口
curl -X POST \
  -H "sign: test-sign-123" \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' \
  http://localhost:1337/bag-strapi-plugin/test
```

### 3. 测试失败场景

```bash
# 缺少签名 - 返回 401
curl http://localhost:1337/bag-strapi-plugin

# 错误的签名 - 返回 401
curl -H "sign: invalid-sign" http://localhost:1337/bag-strapi-plugin
```

---

## ⚙️ 配置说明

### 基础配置

```javascript
{
  signVerify: {
    // 是否启用签名验证
    enabled: true,
    
    // 有效签名列表（简单模式）
    validSigns: ['sign1', 'sign2'],
    
    // 白名单路径
    whitelist: ['/path1', '/path2/.*'],
  }
}
```

### 配置项详解

| 配置项          | 类型      | 必填 | 说明          | 默认值      |
|--------------|---------|----|-------------|----------|
| `enabled`    | Boolean | 否  | 是否启用签名验证    | `true`   |
| `validSigns` | Array   | 是  | 有效的签名列表     | `[]`     |
| `whitelist`  | Array   | 否  | 白名单路径（支持正则） | `[]`     |
| `secretKey`  | String  | 否  | 加密密钥（高级模式）  | -        |
| `timeWindow` | Number  | 否  | 时间窗口（毫秒）    | `300000` |

---

## 🔐 验证模式

### 模式一：简单签名验证（当前使用）

**特点**：固定签名列表，适合内部系统

**配置**：

```javascript
{
  signVerify: {
    enabled: true,
    validSigns: ['my-secret-sign-123'],
  }
}
```

**使用**：

```bash
curl -H "sign: my-secret-sign-123" http://localhost:1337/bag-strapi-plugin
```

### 模式二：高级加密验证（可选）

**特点**：动态签名，支持时间戳和防重放攻击

**配置**：

```javascript
{
  signVerify: {
    enabled: true,
    secretKey: 'your-super-secret-key',
    timeWindow: 300000, // 5分钟
  }
}
```

然后将 `server/src/register.js` 中的中间件改为：

```javascript
import signVerifyAdvanced from './middlewares/sign-verify-advanced';
// ...
const middleware = signVerifyAdvanced(config, {strapi});
```

---

## 🎯 白名单配置

白名单支持精确匹配和正则表达式匹配。

### 示例

```javascript
whitelist: [
  // 精确匹配
  '/bag-strapi-plugin/health',
  
  // 正则表达式匹配
  '/bag-strapi-plugin/public/.*',      // 所有 public 下的路径
  '/bag-strapi-plugin/api/v\\d+/.*',   // 匹配版本化 API
  
  // 多个白名单
  '/bag-strapi-plugin/status',
  '/bag-strapi-plugin/version',
]
```

### 添加健康检查接口

```javascript
// server/src/routes/content-api.js
export default [
  {
    method: 'GET',
    path: '/health',
    handler: 'controller.health',
    config: { policies: [] },
  },
  // ... 其他需要验证的路由
];

// server/src/controllers/controller.js
const controller = ({ strapi }) => ({
  health(ctx) {
    ctx.body = { status: 'ok', timestamp: Date.now() };
  },
});
```

然后在配置中添加白名单：

```javascript
whitelist: ['/bag-strapi-plugin/health']
```

---

## 🛠️ 临时禁用签名验证

### 开发环境禁用

```javascript
// server/src/config/index.js
export default {
    default: {
        signVerify: {
            enabled: process.env.NODE_ENV === 'production',
            // ...
        },
    },
};
```

### 完全禁用

```javascript
{
  signVerify: {
    enabled: false,
  }
}
```

---

## 📝 路由列表

当前插件的所有路由都会被全局中间件拦截：

| 方法   | 路径                        | 说明   | 是否需要签名 |
|------|---------------------------|------|--------|
| GET  | `/bag-strapi-plugin`      | 首页   | ✅ 是    |
| POST | `/bag-strapi-plugin/test` | 测试接口 | ✅ 是    |

---

## 🔍 调试

### 查看中间件是否生效

```javascript
// 在 server/src/register.js 中添加日志
strapi.server.use(async (ctx, next) => {
  const requestPath = ctx.request.url;
  console.log('🔍 请求路径:', requestPath);
  
  if (requestPath.startsWith('/bag-strapi-plugin')) {
    console.log('✅ 签名验证中间件拦截');
  }
  
  // ... 其他代码
});
```

### 错误响应示例

**缺少签名**：

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

**签名错误**：

```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "无权限访问：签名验证失败",
    "details": {
      "message": "提供的签名无效或已过期"
    }
  }
}
```

---

## 🌐 在其他项目中使用插件

### 1. 安装插件

```bash
npm install bag-strapi-plugin
# 或
yalc add bag-strapi-plugin
```

### 2. 配置插件

在 Strapi 主项目的 `config/plugins.js` 中配置：

```javascript
module.exports = {
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        validSigns: [
          process.env.API_SIGN_KEY || 'default-sign',
        ],
        whitelist: [
          '/bag-strapi-plugin/health',
        ],
      },
    },
  },
};
```

### 3. 环境变量

```env
# .env
API_SIGN_KEY=your-production-sign-key
NODE_ENV=production
```

---

## 📊 完整示例

### 服务端配置

```javascript
// server/src/config/index.js
export default {
    default: {
        signVerify: {
            enabled: true,
            validSigns: [
                'frontend-app-sign-2024',
                'mobile-app-sign-2024',
                'admin-panel-sign-2024',
            ],
            whitelist: [
                '/bag-strapi-plugin/health',
                '/bag-strapi-plugin/version',
                '/bag-strapi-plugin/public/.*',
            ],
        },
    },
};
```

### 客户端请求

```javascript
// 前端应用
const API_SIGN = 'frontend-app-sign-2024';

async function apiRequest(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'sign': API_SIGN,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// 使用
const response = await apiRequest('http://localhost:1337/bag-strapi-plugin', {
  method: 'GET',
});
```

---

## ⚠️ 安全建议

1. ✅ **不要硬编码签名**：使用环境变量
2. ✅ **定期更换签名**：建立签名轮换机制
3. ✅ **使用 HTTPS**：防止中间人攻击
4. ✅ **记录失败尝试**：监控异常访问
5. ✅ **限制签名数量**：不同应用使用不同签名
6. ✅ **结合其他安全措施**：IP 白名单、限流等

---

## 🆘 常见问题

### Q1: 如何添加新的 API 路由？

在 `server/src/routes/content-api.js` 中添加路由即可，全局中间件会自动拦截：

```javascript
export default [
  {
    method: 'POST',
    path: '/new-endpoint',
    handler: 'controller.newMethod',
    config: { policies: [] },
  },
];
```

### Q2: 如何让某个接口不需要签名？

在白名单中添加该路径：

```javascript
whitelist: ['/bag-strapi-plugin/new-endpoint']
```

### Q3: 如何切换到高级加密模式？

1. 修改配置使用 `secretKey`
2. 修改 `server/src/register.js` 导入 `sign-verify-advanced`
3. 更新客户端签名生成逻辑

### Q4: 能拦截其他插件的接口吗？

当前只拦截 `/bag-strapi-plugin` 路径下的请求。如需拦截其他路径，修改 `server/src/register.js` 中的路径判断逻辑。

---

## 📚 相关文档

- [基础中间件使用说明](./MIDDLEWARE_USAGE.md)
- [Strapi 中间件文档](https://docs.strapi.io/dev-docs/backend-customization/middlewares)
- [Koa 中间件文档](https://koajs.com/#middleware)

