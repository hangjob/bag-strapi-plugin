# 验证码系统

完整的验证码解决方案，支持图形验证码、数学运算验证码、邮件验证码和短信验证码。

## 功能特性

- ✅ SVG 图形验证码
- ✅ 数学运算验证码
- ✅ 邮件验证码
- ✅ 短信验证码
- ✅ 自动过期清理
- ✅ 防暴力破解
- ✅ 集成到登录注册

## 快速开始

### 1. 安装依赖

```bash
npm install svg-captcha
```

### 2. 配置验证码

在 `config/plugins.js` 中：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        enableCaptcha: env.bool('ENABLE_CAPTCHA', true),
        captchaType: 'image',  // 'image' | 'math'
        captchaLength: 4,
        captchaExpireTime: 300000,  // 5分钟
        captchaMaxAttempts: 3,
      },
    },
  },
});
```

### 3. 环境变量

```env
ENABLE_CAPTCHA=true
CAPTCHA_TYPE=image
CAPTCHA_LENGTH=4
CAPTCHA_EXPIRE_TIME=300000
CAPTCHA_MAX_ATTEMPTS=3
```

## API 端点

### 获取图形验证码

**接口**
```
GET /bag-strapi-plugin/captcha/image?type=image
```

**查询参数**
- `type`: 验证码类型
  - `image`: 字符验证码（默认）
  - `math`: 数学运算验证码

**响应**
```json
{
  "success": true,
  "data": {
    "captchaId": "a1b2c3d4e5f6...",
    "captchaImage": "<svg>...</svg>",
    "expiresAt": 1704067200000
  }
}
```

### 刷新验证码

**接口**
```
POST /bag-strapi-plugin/captcha/refresh
```

**请求体**
```json
{
  "captchaId": "旧的验证码ID"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "captchaId": "新的验证码ID",
    "captchaImage": "<svg>...</svg>",
    "expiresAt": 1704067200000
  }
}
```

### 发送邮件验证码

**接口**
```
POST /bag-strapi-plugin/captcha/email
```

**请求体**
```json
{
  "email": "user@example.com"
}
```

**响应**
```json
{
  "success": true,
  "captchaId": "a1b2c3d4e5f6...",
  "message": "验证码已发送到邮箱"
}
```

### 发送短信验证码

**接口**
```
POST /bag-strapi-plugin/captcha/sms
```

**请求体**
```json
{
  "phone": "13800138000"
}
```

**响应**
```json
{
  "success": true,
  "captchaId": "a1b2c3d4e5f6...",
  "message": "验证码已发送到手机"
}
```

## 前端集成

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>验证码示例</title>
    <style>
        .captcha-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .captcha-image {
            cursor: pointer;
            border: 1px solid #ddd;
            padding: 5px;
        }
    </style>
</head>
<body>
    <div class="captcha-container">
        <input type="text" id="captchaCode" placeholder="验证码" maxlength="4">
        <div id="captchaImage" class="captcha-image" onclick="refreshCaptcha()"></div>
    </div>

    <script>
        const API_BASE = 'http://localhost:1337/bag-strapi-plugin';
        let captchaId = null;

        // 获取验证码
        async function getCaptcha() {
            const response = await fetch(`${API_BASE}/captcha/image`);
            const result = await response.json();
            
            if (result.success) {
                captchaId = result.data.captchaId;
                document.getElementById('captchaImage').innerHTML = result.data.captchaImage;
            }
        }

        // 刷新验证码
        async function refreshCaptcha() {
            const response = await fetch(`${API_BASE}/captcha/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captchaId }),
            });
            const result = await response.json();
            
            if (result.success) {
                captchaId = result.data.captchaId;
                document.getElementById('captchaImage').innerHTML = result.data.captchaImage;
            }
        }

        // 页面加载时获取验证码
        getCaptcha();
    </script>
</body>
</html>
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:1337/bag-strapi-plugin';

function CaptchaInput() {
    const [captchaId, setCaptchaId] = useState(null);
    const [captchaImage, setCaptchaImage] = useState('');
    const [captchaCode, setCaptchaCode] = useState('');

    const getCaptcha = async () => {
        const response = await fetch(`${API_BASE}/captcha/image`);
        const result = await response.json();
        
        if (result.success) {
            setCaptchaId(result.data.captchaId);
            setCaptchaImage(result.data.captchaImage);
        }
    };

    const refreshCaptcha = async () => {
        const response = await fetch(`${API_BASE}/captcha/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ captchaId }),
        });
        const result = await response.json();
        
        if (result.success) {
            setCaptchaId(result.data.captchaId);
            setCaptchaImage(result.data.captchaImage);
            setCaptchaCode('');
        }
    };

    useEffect(() => {
        getCaptcha();
    }, []);

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
                type="text"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                placeholder="验证码"
                maxLength={4}
            />
            <div
                dangerouslySetInnerHTML={{ __html: captchaImage }}
                onClick={refreshCaptcha}
                style={{ cursor: 'pointer', border: '1px solid #ddd', padding: '5px' }}
                title="点击刷新"
            />
        </div>
    );
}

export default CaptchaInput;
```

### Vue 3 示例

```vue
<template>
  <div class="captcha-container">
    <input
      v-model="captchaCode"
      type="text"
      placeholder="验证码"
      maxlength="4"
    />
    <div
      v-html="captchaImage"
      @click="refreshCaptcha"
      class="captcha-image"
      title="点击刷新"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_BASE = 'http://localhost:1337/bag-strapi-plugin';

const captchaId = ref(null);
const captchaImage = ref('');
const captchaCode = ref('');

const getCaptcha = async () => {
  const response = await fetch(`${API_BASE}/captcha/image`);
  const result = await response.json();
  
  if (result.success) {
    captchaId.value = result.data.captchaId;
    captchaImage.value = result.data.captchaImage;
  }
};

const refreshCaptcha = async () => {
  const response = await fetch(`${API_BASE}/captcha/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ captchaId: captchaId.value }),
  });
  const result = await response.json();
  
  if (result.success) {
    captchaId.value = result.data.captchaId;
    captchaImage.value = result.data.captchaImage;
    captchaCode.value = '';
  }
};

onMounted(() => {
  getCaptcha();
});
</script>

<style scoped>
.captcha-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-image {
  cursor: pointer;
  border: 1px solid #ddd;
  padding: 5px;
}
</style>
```

## 与登录注册集成

### 登录时使用验证码

```javascript
const response = await fetch('http://localhost:1337/bag-strapi-plugin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'testuser',
    password: 'password123',
    captchaId: captchaId,      // 验证码 ID
    captchaCode: captchaCode,  // 用户输入的验证码
  }),
});
```

### 注册时使用验证码

```javascript
const response = await fetch('http://localhost:1337/bag-strapi-plugin/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    captchaId: captchaId,
    captchaCode: captchaCode,
  }),
});
```

## 配置选项

### 验证码类型

```javascript
captchaType: 'image'  // 字符验证码
captchaType: 'math'   // 数学运算验证码
```

### 自定义验证码样式

在服务端修改 `server/src/services/captcha.js`：

```javascript
generateImageCaptcha({
    size: 6,           // 验证码长度改为6
    noise: 3,          // 干扰线数量
    color: false,      // 不使用彩色
    background: '#fff', // 白色背景
    fontSize: 60,      // 字体大小
    width: 150,        // 宽度
    height: 50,        // 高度
});
```

## 禁用验证码

### 开发环境禁用

```javascript
// config/env/development/plugins.js
module.exports = () => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        enableCaptcha: false,
      },
    },
  },
});
```

### 环境变量禁用

```env
ENABLE_CAPTCHA=false
```

## 安全建议

### 1. 防止暴力破解

- ✅ 每个验证码最多尝试3次
- ✅ 验证码5分钟后自动过期
- ✅ 验证成功后立即删除（一次性使用）

### 2. 生产环境配置

```env
ENABLE_CAPTCHA=true
CAPTCHA_LENGTH=4
CAPTCHA_EXPIRE_TIME=300000
CAPTCHA_MAX_ATTEMPTS=3
```

### 3. 使用 Redis 存储（推荐）

内存存储在多实例部署时会有问题，生产环境建议使用 Redis。

## 故障排查

### 问题 1: 验证码图片不显示

**解决方案**:
- 检查是否安装了 `svg-captcha`
- 确认接口返回的 SVG 数据格式正确
- 使用 `dangerouslySetInnerHTML` 或 `v-html` 渲染 SVG

### 问题 2: 验证码总是错误

**解决方案**:
- 验证码不区分大小写
- 检查是否有空格（会自动trim）
- 查看控制台确认 `captchaId` 是否正确传递

### 问题 3: 邮件/短信验证码收不到

**解决方案**:
- 开发环境验证码会在控制台输出
- 生产环境需要配置邮件服务或短信服务商

## 相关链接

- [JWT 认证系统](/features/auth)
- [API 限流](/features/rate-limit)
- [验证码 API 参考](/api/captcha)

