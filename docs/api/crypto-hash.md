# 哈希函数 API

哈希和 HMAC 工具的使用说明。

## strapi.crypto.hash.sha256()

SHA-256 哈希

```javascript
const hash = strapi.crypto.hash.sha256('data');
```

## strapi.crypto.hash.sha512()

SHA-512 哈希

```javascript
const hash = strapi.crypto.hash.sha512('data');
```

## strapi.crypto.hash.hmac()

HMAC 签名

```javascript
const signature = strapi.crypto.hash.hmac('data', 'secret');
```

## strapi.crypto.hash.verifyHmac()

验证 HMAC

```javascript
const isValid = strapi.crypto.hash.verifyHmac('data', signature, 'secret');
```

详细说明请参考 [加密工具库](/features/crypto)。

