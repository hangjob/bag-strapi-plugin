# RSA 加密 API

RSA 加密工具的使用说明。

## strapi.crypto.rsa.generateKeyPair()

生成密钥对

```javascript
const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();
```

## strapi.crypto.rsa.encrypt()

加密

```javascript
const encrypted = strapi.crypto.rsa.encrypt('data', publicKey);
```

## strapi.crypto.rsa.decrypt()

解密

```javascript
const decrypted = strapi.crypto.rsa.decrypt(encrypted, privateKey);
```

详细说明请参考 [加密工具库](/features/crypto)。

