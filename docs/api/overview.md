# API 概览

bag-strapi-plugin 提供的所有 API 端点概览。

## 基础路径

所有 API 的基础路径为：

```
http://localhost:1337/bag-strapi-plugin
```

## API 分类

### 认证 API

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/auth/register` | 用户注册 | ❌ |
| POST | `/auth/login` | 用户登录 | ❌ |
| GET | `/auth/me` | 获取当前用户 | ✅ |
| POST | `/auth/refresh` | 刷新 Token | ❌ |
| POST | `/auth/change-password` | 修改密码 | ✅ |
| POST | `/auth/reset-password` | 重置密码 | ❌ |
| POST | `/auth/logout` | 登出 | ❌ |

详细文档：[认证 API](/api/auth)

### 验证码 API

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/captcha/image` | 获取图形验证码 | ❌ |
| POST | `/captcha/refresh` | 刷新验证码 | ❌ |
| POST | `/captcha/verify` | 验证验证码 | ❌ |
| POST | `/captcha/email` | 发送邮件验证码 | ❌ |
| POST | `/captcha/sms` | 发送短信验证码 | ❌ |
| GET | `/captcha/stats` | 验证码统计 | ❌ |

详细文档：[验证码 API](/api/captcha)

### 限流 API

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/rate-limit/config` | 获取限流配置 | ❌ |
| GET | `/rate-limit/check-ip` | 检查 IP 限流状态 | ❌ |
| POST | `/rate-limit/reset` | 重置限流 | ❌ |
| POST | `/rate-limit/clear-all` | 清除所有限流记录 | ❌ |

详细文档：[限流 API](/api/rate-limit)

### 菜单 API

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/menu` | 获取菜单列表 | ❌ |
| GET | `/menu/:id` | 获取单个菜单 | ❌ |
| POST | `/menu` | 创建菜单 | ✅ |
| PUT | `/menu/:id` | 更新菜单 | ✅ |
| DELETE | `/menu/:id` | 删除菜单 | ✅ |

详细文档：[菜单 API](/api/menu)

### 用户 API

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/users` | 获取用户列表 | ✅ |
| GET | `/users/:id` | 获取单个用户 | ✅ |
| PUT | `/users/:id` | 更新用户信息 | ✅ |
| DELETE | `/users/:id` | 删除用户 | ✅ |

详细文档：[用户 API](/api/user)

## 响应格式

所有 API 使用统一的响应格式：

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误"
}
```

## 认证

需要认证的接口需要在请求头中携带 Token：

```
Authorization: Bearer <token>
```

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

## 相关链接

- [认证 API](/api/auth)
- [验证码 API](/api/captcha)
- [限流 API](/api/rate-limit)
- [菜单 API](/api/menu)
- [用户 API](/api/user)

