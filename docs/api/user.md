# 用户 API

用户管理相关的 API 接口。

## GET /users

获取用户列表

**请求头**
```
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  ]
}
```

详细说明请参考 [JWT 认证系统](/features/auth)。

