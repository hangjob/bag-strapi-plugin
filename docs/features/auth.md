# JWT 认证系统

bag-strapi-plugin 提供完整的 JWT 认证解决方案，包括用户注册、登录、Token 管理等功能。

## 功能特性

- ✅ 用户注册与登录
- ✅ JWT Token 生成与验证
- ✅ 密码 bcrypt 加密存储
- ✅ Token 刷新机制
- ✅ 用户信息管理
- ✅ 密码修改和重置
- ✅ 集成验证码保护
- ✅ 自动创建用户表

## 快速开始

### 1. 配置认证系统

在 `config/plugins.js` 中配置：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      auth: {
        enableCaptcha: env.bool('ENABLE_CAPTCHA', true),
        jwt: {
          secret: env('JWT_SECRET'),
          expiresIn: '7d',
        },
      },
    },
  },
});
```

### 2. 设置环境变量

在 `.env` 文件中：

```env
JWT_SECRET=your-very-secure-secret-key
ENABLE_CAPTCHA=true
```

### 3. 安装依赖

```bash
npm install bcrypt jsonwebtoken
```

## API 端点

### 用户注册

**接口**
```
POST /bag-strapi-plugin/auth/register
```

**请求体**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "nickname": "测试用户",
  "phone": "13800138000",
  "captchaId": "a1b2c3d4...",
  "captchaCode": "abcd"
}
```

**响应（成功）**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "nickname": "测试用户"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功"
}
```

**字段说明**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名（唯一） |
| email | string | ✅ | 邮箱（唯一） |
| password | string | ✅ | 密码（最少 6 位） |
| nickname | string | ❌ | 昵称 |
| phone | string | ❌ | 手机号 |
| captchaId | string | ⭕ | 验证码 ID（启用验证码时必需） |
| captchaCode | string | ⭕ | 验证码（启用验证码时必需） |

### 用户登录

**接口**
```
POST /bag-strapi-plugin/auth/login
```

**请求体**
```json
{
  "identifier": "testuser",
  "password": "password123",
  "captchaId": "a1b2c3d4...",
  "captchaCode": "abcd"
}
```

**响应（成功）**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "nickname": "测试用户"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "登录成功"
}
```

**字段说明**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| identifier | string | ✅ | 用户名或邮箱 |
| password | string | ✅ | 密码 |
| captchaId | string | ⭕ | 验证码 ID（启用验证码时必需） |
| captchaCode | string | ⭕ | 验证码（启用验证码时必需） |

### 获取当前用户

**接口**
```
GET /bag-strapi-plugin/auth/me
```

**请求头**
```
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户",
    "phone": "13800138000",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 刷新 Token

**接口**
```
POST /bag-strapi-plugin/auth/refresh
```

**请求体**
```json
{
  "token": "old-token"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "token": "new-token"
  }
}
```

### 修改密码

**接口**
```
POST /bag-strapi-plugin/auth/change-password
```

**请求头**
```
Authorization: Bearer <token>
```

**请求体**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

**响应**
```json
{
  "success": true,
  "message": "密码修改成功"
}
```

### 重置密码

**接口**
```
POST /bag-strapi-plugin/auth/reset-password
```

**请求体**
```json
{
  "email": "test@example.com",
  "code": "123456",
  "newPassword": "new-password"
}
```

**响应**
```json
{
  "success": true,
  "message": "密码重置成功"
}
```

### 登出

**接口**
```
POST /bag-strapi-plugin/auth/logout
```

**请求头**
```
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "message": "登出成功"
}
```

## 前端集成

### React 示例

```jsx
import React, { useState } from 'react';

const API_BASE = 'http://localhost:1337/bag-strapi-plugin';

function AuthExample() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 注册
  const handleRegister = async (formData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setToken(result.data.token);
        setUser(result.data.user);
        localStorage.setItem('token', result.data.token);
      }
    } catch (error) {
      console.error('注册失败:', error);
    }
  };

  // 登录
  const handleLogin = async (identifier, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (result.success) {
        setToken(result.data.token);
        setUser(result.data.user);
        localStorage.setItem('token', result.data.token);
      }
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  // 获取当前用户
  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 登出
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div>
      {user ? (
        <div>
          <p>欢迎, {user.nickname || user.username}!</p>
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : (
        <div>
          <button onClick={() => handleLogin('testuser', 'password123')}>
            登录
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthExample;
```

### Vue 3 示例

```vue
<template>
  <div>
    <div v-if="user">
      <p>欢迎, {{ user.nickname || user.username }}!</p>
      <button @click="logout">登出</button>
    </div>
    <div v-else>
      <button @click="login">登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_BASE = 'http://localhost:1337/bag-strapi-plugin';
const user = ref(null);
const token = ref(localStorage.getItem('token'));

// 登录
const login = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'testuser',
        password: 'password123',
      }),
    });

    const result = await response.json();

    if (result.success) {
      token.value = result.data.token;
      user.value = result.data.user;
      localStorage.setItem('token', result.data.token);
    }
  } catch (error) {
    console.error('登录失败:', error);
  }
};

// 获取当前用户
const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    const result = await response.json();

    if (result.success) {
      user.value = result.data;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 登出
const logout = () => {
  token.value = null;
  user.value = null;
  localStorage.removeItem('token');
};

onMounted(() => {
  if (token.value) {
    getCurrentUser();
  }
});
</script>
```

### Axios 拦截器

```javascript
import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:1337/bag-strapi-plugin',
});

// 请求拦截器：添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理 Token 过期
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:1337/bag-strapi-plugin/auth/refresh',
          { token }
        );

        const newToken = response.data.data.token;
        localStorage.setItem('token', newToken);

        // 重试原请求
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## 保护路由

### 后端路由保护

```javascript
// routes/custom.js
export default [
  {
    method: 'GET',
    path: '/protected',
    handler: 'custom.protected',
    config: {
      middlewares: ['plugin::bag-strapi-plugin.jwt-auth'],
    },
  },
];
```

### 前端路由保护（React Router）

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// 使用
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 数据库表结构

插件自动创建 `bag_users` 表，包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| username | string | 用户名（唯一） |
| email | string | 邮箱（唯一） |
| password | string | 加密后的密码 |
| nickname | string | 昵称 |
| phone | string | 手机号 |
| avatar | string | 头像 URL |
| status | enum | 状态：active/inactive/banned |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

## 安全说明

### 密码加密

使用 bcrypt 加密密码，加密轮次为 10：

```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

### Token 验证

所有需要认证的接口都会验证 Token：

```javascript
const decoded = jwt.verify(token, secret);
const user = await strapi.db.query('plugin::bag-strapi-plugin.user').findOne({
  where: { id: decoded.id },
});
```

### 最佳实践

1. ✅ 使用强 JWT Secret
2. ✅ 设置合理的 Token 过期时间
3. ✅ 启用 HTTPS
4. ✅ 启用验证码
5. ✅ 实施密码策略
6. ✅ 定期轮换密钥

## 配置选项

详细配置请参考 [认证配置指南](/features/auth-config)。

## 相关链接

- [验证码系统](/features/captcha)
- [API 限流](/features/rate-limit)
- [认证配置详解](/features/auth-config)
- [API 参考](/api/auth)

