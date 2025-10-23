# AES 加密 API

AES 加密工具的使用说明。

## strapi.crypto.aes.encryptSimple()

简单加密

```javascript
const encrypted = strapi.crypto.aes.encryptSimple('data', 'key');
```

## strapi.crypto.aes.decryptSimple()

简单解密

```javascript
const decrypted = strapi.crypto.aes.decryptSimple(encrypted, 'key');
```

## strapi.crypto.aes.encrypt()

高级加密（带 IV）

```javascript
const result = strapi.crypto.aes.encrypt('data', 'key');
// { encrypted: "...", iv: "..." }
```

## strapi.crypto.aes.decrypt()

高级解密

```javascript
const decrypted = strapi.crypto.aes.decrypt(encrypted, 'key', iv);
```

详细说明请参考 [加密工具库](/features/crypto)。

