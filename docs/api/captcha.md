# 验证码 API

验证码相关的 API 接口。

## GET /captcha/image

获取图形验证码

**查询参数**
- `type`: 验证码类型（'image' | 'math'）

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

## POST /captcha/refresh

刷新验证码

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

## 其他端点

- POST /captcha/verify - 验证验证码
- POST /captcha/email - 发送邮件验证码
- POST /captcha/sms - 发送短信验证码
- GET /captcha/stats - 验证码统计

详细说明请参考 [验证码系统](/features/captcha)。

