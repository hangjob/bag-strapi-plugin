# 认证 API

用户认证相关的 API 接口。

## POST /auth/register

用户注册

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

**响应**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## POST /auth/login

用户登录

**请求体**
```json
{
  "identifier": "testuser",
  "password": "password123",
  "captchaId": "a1b2c3d4...",
  "captchaCode": "abcd"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "user": {},
    "token": "..."
  }
}
```

## GET /auth/me

获取当前用户信息

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
    "email": "test@example.com"
  }
}
```

## 其他端点

- POST /auth/refresh - 刷新 Token
- POST /auth/change-password - 修改密码
- POST /auth/reset-password - 重置密码
- POST /auth/logout - 登出

详细说明请参考 [JWT 认证系统](/features/auth)。

