# 随机工具 API

随机生成工具的使用说明。

## strapi.crypto.random.uuid()

生成 UUID v4

```javascript
const id = strapi.crypto.random.uuid();
// "550e8400-e29b-41d4-a716-446655440000"
```

## strapi.crypto.random.string()

生成随机字符串

```javascript
const str = strapi.crypto.random.string(32);
// "a1b2c3d4e5f6g7h8..."
```

## strapi.crypto.random.number()

生成随机数字

```javascript
const num = strapi.crypto.random.number(0, 100);
// 42
```

详细说明请参考 [加密工具库](/features/crypto)。

