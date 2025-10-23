# 调试指南

本指南帮助你解决使用 bag-strapi-plugin 时遇到的常见问题。

## 启用调试日志

### 方法 1: 环境变量

在 `.env` 文件中添加：

```env
DEBUG=strapi:*,bag-strapi-plugin:*
LOG_LEVEL=debug
```

### 方法 2: Strapi 配置

编辑 `config/server.js`：

```javascript
module.exports = ({ env }) => ({
  app: {
    keys: env.array('APP_KEYS'),
  },
  logger: {
    level: 'debug',
  },
});
```

## 常见问题排查

### 1. 插件未正确加载

**症状**：
- 路由返回 404
- 数据库表未创建
- `strapi.crypto` 未定义

**检查步骤**：

1. 确认插件已安装：
```bash
npm list bag-strapi-plugin
```

2. 检查插件配置：
```javascript
// config/plugins.js
'bag-strapi-plugin': {
  enabled: true,  // 确保为 true
}
```

3. 查看启动日志：
```bash
npm run develop
```

应该看到：
```
✅ bag-strapi-plugin initialized
```

4. 重启 Strapi：
```bash
# 停止服务，然后
npm run develop
```

### 2. JWT 认证失败

**症状**：
- 登录返回 401
- Token 验证失败

**检查步骤**：

1. 确认 JWT_SECRET 已配置：
```bash
# .env
JWT_SECRET=your-secret-key
```

2. 检查 Token 格式：
```javascript
// 正确格式
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. 验证 Token：
```bash
curl -X GET http://localhost:1337/bag-strapi-plugin/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. 查看详细错误：
```javascript
// 在控制器中添加日志
try {
  const decoded = jwt.verify(token, secret);
  console.log('Token 验证成功:', decoded);
} catch (error) {
  console.error('Token 验证失败:', error.message);
}
```

### 3. 验证码不显示

**症状**：
- 验证码接口返回空
- SVG 图片无法渲染

**检查步骤**：

1. 确认依赖已安装：
```bash
npm list svg-captcha
```

2. 测试验证码接口：
```bash
curl http://localhost:1337/bag-strapi-plugin/captcha/image
```

3. 检查响应格式：
```json
{
  "success": true,
  "data": {
    "captchaId": "...",
    "captchaImage": "<svg>...</svg>",
    "expiresAt": 1234567890
  }
}
```

4. 前端渲染 SVG：
```javascript
// React
<div dangerouslySetInnerHTML={{ __html: captchaImage }} />

// Vue
<div v-html="captchaImage"></div>
```

### 4. API 限流问题

**症状**：
- 所有请求都被限流
- 限流不生效

**检查步骤**：

1. 确认限流已启用：
```javascript
rateLimit: {
  enabled: true,
}
```

2. 检查 IP 是否在白名单：
```javascript
rateLimit: {
  whitelist: ['127.0.0.1', '::1'],
}
```

3. 查看限流响应头：
```bash
curl -I http://localhost:1337/your-api
```

应该看到：
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
```

4. 检查 Redis 连接（如果使用）：
```bash
redis-cli ping
```

5. 重置限流数据：
```bash
curl -X POST http://localhost:1337/bag-strapi-plugin/rate-limit/clear-all
```

### 5. 加密工具问题

**症状**：
- `strapi.crypto` 未定义
- 加密/解密失败

**检查步骤**：

1. 确认密钥已配置：
```env
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
```

2. 检查密钥长度：
```javascript
// AES-256 需要 32 字节密钥
const key = process.env.CRYPTO_AES_KEY;
console.log('密钥长度:', key.length);  // 应该 >= 32
```

3. 测试加密工具：
```javascript
const aesKey = strapi.crypto.config.getAesKey();
console.log('AES Key:', aesKey);

const encrypted = strapi.crypto.aes.encryptSimple('test', aesKey);
console.log('Encrypted:', encrypted);

const decrypted = strapi.crypto.aes.decryptSimple(encrypted, aesKey);
console.log('Decrypted:', decrypted);
```

### 6. 签名验证问题

**症状**：
- 所有请求返回 401
- 签名验证失败

**检查步骤**：

1. 确认签名验证已启用：
```javascript
signVerify: {
  enabled: true,
}
```

2. 检查请求头：
```bash
curl -H "sign: your-sign-key" http://localhost:1337/api/endpoint
```

3. 检查签名是否在有效列表中：
```javascript
validSigns: [
  'your-sign-key',  // 确保包含你使用的签名
]
```

4. 检查白名单：
```javascript
whitelist: [
  '/health',
  '/public/.*',  // 正则表达式
]
```

5. 临时禁用验证：
```javascript
signVerify: {
  enabled: false,  // 测试用
}
```

### 7. 数据库表未创建

**症状**：
- `bag_users` 表不存在
- `bag_plugin_menus` 表不存在

**解决方案**：

1. 检查数据库连接：
```javascript
// config/database.js
console.log('Database config:', strapi.config.get('database'));
```

2. 手动触发表创建：
```bash
npm run strapi build
npm run develop
```

3. 检查数据库权限：
```sql
-- MySQL
SHOW GRANTS;

-- PostgreSQL
\du
```

4. 查看 Strapi 日志：
```
Creating table: bag_users
Creating table: bag_plugin_menus
```

## 调试工具

### 1. Strapi 内置调试

```javascript
// 在任何地方使用
strapi.log.debug('调试信息', { data: someData });
strapi.log.info('提示信息');
strapi.log.warn('警告信息');
strapi.log.error('错误信息', error);
```

### 2. 使用 node-inspect

```bash
node --inspect-brk node_modules/@strapi/strapi/bin/strapi.js develop
```

然后在 Chrome 中打开：`chrome://inspect`

### 3. VS Code 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Strapi",
      "program": "${workspaceFolder}/node_modules/@strapi/strapi/bin/strapi.js",
      "args": ["develop"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### 4. 测试脚本

创建 `scripts/test-plugin.js`：

```javascript
const http = require('http');

async function testAPI(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 1337,
      path,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✓ ${path}:`, res.statusCode);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing bag-strapi-plugin APIs...\n');
  
  await testAPI('/bag-strapi-plugin/captcha/image');
  await testAPI('/bag-strapi-plugin/auth/login', { method: 'POST' });
  
  console.log('\n✅ Tests completed');
}

runTests();
```

运行：
```bash
node scripts/test-plugin.js
```

## 性能调试

### 1. 查看响应时间

```bash
curl -w "\nTime: %{time_total}s\n" http://localhost:1337/api/endpoint
```

### 2. 监控内存使用

```javascript
// 在 bootstrap.js 中
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory:', {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
  });
}, 30000); // 每 30 秒
```

### 3. 数据库查询日志

```javascript
// config/database.js
module.exports = ({ env }) => ({
  connection: {
    // ...
  },
  debug: true,  // 启用查询日志
});
```

## 错误处理

### 自定义错误处理

```javascript
// middlewares/error-handler.js
module.exports = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      // 记录详细错误
      strapi.log.error('Request error:', {
        url: ctx.url,
        method: ctx.method,
        error: error.message,
        stack: error.stack,
      });
      
      // 返回友好错误信息
      ctx.status = error.status || 500;
      ctx.body = {
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      };
    }
  };
};
```

## 日志文件

### 配置日志文件

```javascript
// config/logger.js
const winston = require('winston');

module.exports = {
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
};
```

### 查看日志

```bash
# 实时查看日志
tail -f logs/combined.log

# 搜索错误
grep "ERROR" logs/combined.log

# 按时间过滤
grep "2024-01-01" logs/combined.log
```

## 获取帮助

如果问题仍未解决：

1. 📖 查看[完整文档](/guide/introduction)
2. 🔍 搜索 [已知问题](https://github.com/hangjob/bag-strapi-plugin/issues)
3. 🐛 提交 [新 Issue](https://github.com/hangjob/bag-strapi-plugin/issues/new)
4. 💬 参与 [讨论](https://github.com/hangjob/bag-strapi-plugin/discussions)

提交 Issue 时，请包含：
- Strapi 版本
- Node.js 版本
- 插件版本
- 完整的错误日志
- 重现步骤
- 相关配置（隐藏敏感信息）

## 相关链接

- [配置指南](/guide/configuration)
- [环境变量](/guide/environment)
- [最佳实践](/guide/best-practices)

