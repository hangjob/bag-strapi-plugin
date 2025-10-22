# 中间件调试指南

## 🔍 调试步骤

我已经在代码中添加了详细的调试日志，请按以下步骤调试：

### 1️⃣ 重新构建插件

```bash
npm run build && yalc publish
```

### 2️⃣ 在 Strapi 项目中更新插件

```bash
# 在你的 Strapi 项目目录中
yalc update bag-strapi-plugin
npm run develop
```

### 3️⃣ 发送测试请求

```bash
# 测试 1: 不带签名
curl http://localhost:1337/bag-strapi-plugin

# 测试 2: 带签名
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin
```

### 4️⃣ 查看控制台日志

启动 Strapi 后，你应该看到以下日志：

#### 启动时的日志：

```
🔧 [bag-strapi-plugin] 注册全局签名验证中间件
✅ [bag-strapi-plugin] 全局中间件注册完成
```

#### 请求时的日志：

```
🔍 [中间件] 请求路径: /bag-strapi-plugin
⚙️ [中间件] 配置: {
  "enabled": true,
  "validSigns": [],
  "whitelist": []
}
✅ [中间件] 匹配插件路径，执行签名验证
🔐 [中间件] 开始执行签名验证
🔐 [sign-verify] 签名验证中间件被调用
🔐 [sign-verify] 配置: { ... }
🔐 [sign-verify] 请求签名: undefined
❌ [sign-verify] 缺少签名，返回 401
```

---

## 🐛 问题诊断

### 问题 1: 没有看到中间件日志

**症状**：
- 启动时没有 `🔧 [bag-strapi-plugin] 注册全局签名验证中间件` 日志
- 请求时直接到了 `📍 [controller.index] 被调用`

**可能原因**：
1. ✅ register.js 没有被执行
2. ✅ 插件没有正确加载

**解决方法**：

检查插件是否正确注册：

```javascript
// 在你的 Strapi 项目的 config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,  // 确保插件已启用
  },
});
```

---

### 问题 2: 看到中间件日志，但没有执行签名验证

**症状**：
```
🔍 [中间件] 请求路径: /bag-strapi-plugin
⚙️ [中间件] 配置: { "enabled": false }
⏭️ [中间件] 签名验证未启用，跳过
📍 [controller.index] 被调用
```

**原因**：配置中 `enabled` 为 `false`

**解决方法**：

在 Strapi 项目的 `config/plugins.js` 中启用：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,  // 启用签名验证
        validSigns: ['test-sign-123'],
      },
    },
  },
});
```

---

### 问题 3: 配置为空对象

**症状**：
```
⚙️ [中间件] 配置: {}
⏭️ [中间件] 签名验证未启用，跳过
```

**原因**：配置没有正确读取

**解决方法**：

1. 检查配置文件路径是否正确：`config/plugins.js`

2. 确保配置格式正确：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      signVerify: {
        enabled: true,
        validSigns: ['your-sign-key'],
      },
    },
  },
});
```

3. 重启 Strapi

---

### 问题 4: 签名验证执行了但直接通过

**症状**：
```
🔐 [sign-verify] 签名验证中间件被调用
🔐 [sign-verify] 请求签名: test-sign
🔍 [verifySign] 有效签名列表: []
🔍 [verifySign] 签名是否在列表中: false
❌ [sign-verify] 签名验证失败，返回 401
```

但实际返回了 200。

**原因**：中间件可能被多次注册或配置有问题

**解决方法**：

检查是否在多个地方注册了中间件。

---

## 📋 完整日志示例

### 正常工作的日志（无签名，返回 401）

```
启动：
🔧 [bag-strapi-plugin] 注册全局签名验证中间件
✅ [bag-strapi-plugin] 全局中间件注册完成

请求：
🔍 [中间件] 请求路径: /bag-strapi-plugin
⚙️ [中间件] 配置: {
  "enabled": true,
  "validSigns": ["test-sign-123"],
  "whitelist": []
}
✅ [中间件] 匹配插件路径，执行签名验证
🔐 [中间件] 开始执行签名验证
🔐 [sign-verify] 签名验证中间件被调用
🔐 [sign-verify] 配置: { "enabled": true, "validSigns": ["test-sign-123"] }
🔐 [sign-verify] 请求签名: undefined
❌ [sign-verify] 缺少签名，返回 401
```

### 正常工作的日志（有签名，返回 200）

```
🔍 [中间件] 请求路径: /bag-strapi-plugin
⚙️ [中间件] 配置: {
  "enabled": true,
  "validSigns": ["test-sign-123"],
  "whitelist": []
}
✅ [中间件] 匹配插件路径，执行签名验证
🔐 [中间件] 开始执行签名验证
🔐 [sign-verify] 签名验证中间件被调用
🔐 [sign-verify] 配置: { "enabled": true, "validSigns": ["test-sign-123"] }
🔐 [sign-verify] 请求签名: test-sign-123
🔍 [verifySign] 开始验证签名
🔍 [verifySign] 有效签名列表: ["test-sign-123"]
🔍 [verifySign] 提供的签名: test-sign-123
🔍 [verifySign] 签名是否在列表中: true
🔐 [sign-verify] 签名验证结果: true
✅ [sign-verify] 签名验证通过，继续执行
📍 [controller.index] 被调用
```

---

## 🔧 配置检查清单

- [ ] 插件已安装并更新到最新版本
- [ ] `config/plugins.js` 文件存在
- [ ] 插件配置中 `enabled: true`
- [ ] `signVerify.enabled: true`
- [ ] `validSigns` 数组不为空
- [ ] 重启了 Strapi 服务
- [ ] 查看了控制台日志

---

## 📝 获取完整日志

如果问题仍未解决，请提供：

1. **启动日志**：Strapi 启动时的完整日志
2. **请求日志**：发送请求时的完整日志
3. **配置文件**：你的 `config/plugins.js` 内容

---

## 🆘 常见错误

### 错误 1: Cannot read property 'use' of undefined

```
TypeError: Cannot read property 'use' of undefined
    at register
```

**原因**：`strapi.server` 不可用

**解决**：确保在 `register` 阶段调用，不要在 `bootstrap` 中注册中间件。

### 错误 2: Middleware already registered

**原因**：中间件被多次注册

**解决**：检查是否在多个地方调用了 `strapi.server.use`。

---

## 💡 调试技巧

### 1. 添加更多日志

在你的 Strapi 项目中，可以添加日志来查看配置：

```javascript
// config/plugins.js
module.exports = ({ env }) => {
  const config = {
    'bag-strapi-plugin': {
      enabled: true,
      config: {
        signVerify: {
          enabled: true,
          validSigns: ['test-sign-123'],
        },
      },
    },
  };
  
  console.log('插件配置:', JSON.stringify(config, null, 2));
  return config;
};
```

### 2. 检查配置是否生效

在 Strapi 项目中创建测试脚本：

```javascript
// scripts/check-config.js
const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi().load();
  
  // 方式 1
  const config1 = app.config.get('plugin::bag-strapi-plugin.signVerify');
  console.log('方式1:', config1);
  
  // 方式 2
  const config2 = app.config.get('plugin.bag-strapi-plugin.signVerify');
  console.log('方式2:', config2);
  
  await app.destroy();
})();
```

运行：
```bash
node scripts/check-config.js
```

---

## 🎯 下一步

执行上述步骤后，将控制台日志发给我，我可以帮你定位具体问题！

