/**
 * 加密工具测试脚本
 * 用于测试各种加密功能
 */

const crypto = require('crypto');

// 模拟 strapi.crypto 对象
const cryptoUtils = {
    aes: {
        encryptSimple: (text, key) => {
            const keyBuffer = crypto.scryptSync(key, 'salt', 32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();
            const combined = JSON.stringify({
                e: encrypted,
                i: iv.toString('hex'),
                a: authTag.toString('hex')
            });
            return Buffer.from(combined).toString('base64');
        },
        decryptSimple: (encryptedData, key) => {
            const combined = Buffer.from(encryptedData, 'base64').toString('utf8');
            const { e, i, a } = JSON.parse(combined);
            const keyBuffer = crypto.scryptSync(key, 'salt', 32);
            const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(i, 'hex'));
            decipher.setAuthTag(Buffer.from(a, 'hex'));
            let decrypted = decipher.update(e, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
    },
    rsa: {
        generateKeyPair: (bits = 2048) => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: bits,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });
            return { publicKey, privateKey };
        },
        encrypt: (text, publicKey) => {
            const encrypted = crypto.publicEncrypt(
                { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
                Buffer.from(text, 'utf8')
            );
            return encrypted.toString('base64');
        },
        decrypt: (encrypted, privateKey) => {
            const decrypted = crypto.privateDecrypt(
                { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
                Buffer.from(encrypted, 'base64')
            );
            return decrypted.toString('utf8');
        },
        sign: (data, privateKey) => {
            const sign = crypto.createSign('SHA256');
            sign.update(data);
            sign.end();
            return sign.sign(privateKey).toString('base64');
        },
        verify: (data, signature, publicKey) => {
            const verify = crypto.createVerify('SHA256');
            verify.update(data);
            verify.end();
            return verify.verify(publicKey, Buffer.from(signature, 'base64'));
        }
    },
    hash: {
        md5: (data) => crypto.createHash('md5').update(data).digest('hex'),
        sha256: (data) => crypto.createHash('sha256').update(data).digest('hex'),
        sha512: (data) => crypto.createHash('sha512').update(data).digest('hex'),
        hmac: (data, secret) => crypto.createHmac('sha256', secret).update(data).digest('hex')
    },
    random: {
        string: (length = 32) => crypto.randomBytes(length).toString('hex').substring(0, length),
        int: (min = 0, max = 100) => crypto.randomInt(min, max + 1),
        uuid: () => crypto.randomUUID()
    },
    base64: {
        encode: (data) => Buffer.from(data, 'utf8').toString('base64'),
        decode: (data) => Buffer.from(data, 'base64').toString('utf8'),
        urlEncode: (data) => Buffer.from(data, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
        urlDecode: (data) => {
            let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            return Buffer.from(base64, 'base64').toString('utf8');
        }
    }
};

// 颜色输出
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m',
};

function log(color, ...args) {
    console.log(color, ...args, colors.reset);
}

console.log('========================================');
console.log('   加密工具测试');
console.log('========================================\n');

// 测试 AES 加密
log(colors.blue, '\n📦 测试 AES 对称加密');
log(colors.yellow, '---');

try {
    const secretKey = 'my-super-secret-key-32-chars!!';
    const plaintext = '这是需要加密的敏感数据 🔒';
    
    console.log('原文:', plaintext);
    
    const encrypted = cryptoUtils.aes.encryptSimple(plaintext, secretKey);
    console.log('密文:', encrypted);
    
    const decrypted = cryptoUtils.aes.decryptSimple(encrypted, secretKey);
    console.log('解密:', decrypted);
    
    if (decrypted === plaintext) {
        log(colors.green, '✅ AES 加密/解密测试通过');
    } else {
        log(colors.red, '❌ AES 加密/解密测试失败');
    }
} catch (error) {
    log(colors.red, '❌ AES 测试错误:', error.message);
}

// 测试 RSA 加密
log(colors.blue, '\n🔑 测试 RSA 非对称加密');
log(colors.yellow, '---');

try {
    console.log('生成 RSA 密钥对...');
    const { publicKey, privateKey } = cryptoUtils.rsa.generateKeyPair(2048);
    
    console.log('公钥长度:', publicKey.length, '字符');
    console.log('私钥长度:', privateKey.length, '字符');
    
    const plaintext = 'RSA 加密测试数据';
    console.log('\n原文:', plaintext);
    
    const encrypted = cryptoUtils.rsa.encrypt(plaintext, publicKey);
    console.log('密文:', encrypted.substring(0, 50) + '...');
    
    const decrypted = cryptoUtils.rsa.decrypt(encrypted, privateKey);
    console.log('解密:', decrypted);
    
    if (decrypted === plaintext) {
        log(colors.green, '✅ RSA 加密/解密测试通过');
    } else {
        log(colors.red, '❌ RSA 加密/解密测试失败');
    }
} catch (error) {
    log(colors.red, '❌ RSA 测试错误:', error.message);
}

// 测试 RSA 签名
log(colors.blue, '\n✍️  测试 RSA 签名/验证');
log(colors.yellow, '---');

try {
    const { publicKey, privateKey } = cryptoUtils.rsa.generateKeyPair(2048);
    const data = '需要签名的重要文档';
    
    console.log('原文:', data);
    
    const signature = cryptoUtils.rsa.sign(data, privateKey);
    console.log('签名:', signature.substring(0, 50) + '...');
    
    const isValid = cryptoUtils.rsa.verify(data, signature, publicKey);
    console.log('验证结果:', isValid);
    
    const tamperedValid = cryptoUtils.rsa.verify('篡改的数据', signature, publicKey);
    console.log('篡改数据验证:', tamperedValid);
    
    if (isValid && !tamperedValid) {
        log(colors.green, '✅ RSA 签名/验证测试通过');
    } else {
        log(colors.red, '❌ RSA 签名/验证测试失败');
    }
} catch (error) {
    log(colors.red, '❌ RSA 签名测试错误:', error.message);
}

// 测试哈希
log(colors.blue, '\n#️⃣  测试哈希函数');
log(colors.yellow, '---');

try {
    const data = 'test data for hashing';
    
    const md5Hash = cryptoUtils.hash.md5(data);
    console.log('MD5:    ', md5Hash);
    
    const sha256Hash = cryptoUtils.hash.sha256(data);
    console.log('SHA256: ', sha256Hash);
    
    const sha512Hash = cryptoUtils.hash.sha512(data);
    console.log('SHA512: ', sha512Hash);
    
    const hmac = cryptoUtils.hash.hmac(data, 'secret-key');
    console.log('HMAC:   ', hmac);
    
    log(colors.green, '✅ 哈希函数测试通过');
} catch (error) {
    log(colors.red, '❌ 哈希测试错误:', error.message);
}

// 测试随机数
log(colors.blue, '\n🎲 测试随机数生成');
log(colors.yellow, '---');

try {
    const str16 = cryptoUtils.random.string(16);
    console.log('随机字符串(16):', str16);
    
    const str32 = cryptoUtils.random.string(32);
    console.log('随机字符串(32):', str32);
    
    const randomNum = cryptoUtils.random.int(1, 100);
    console.log('随机数(1-100):', randomNum);
    
    const uuid = cryptoUtils.random.uuid();
    console.log('UUID:', uuid);
    
    log(colors.green, '✅ 随机数生成测试通过');
} catch (error) {
    log(colors.red, '❌ 随机数测试错误:', error.message);
}

// 测试 Base64
log(colors.blue, '\n📄 测试 Base64 编解码');
log(colors.yellow, '---');

try {
    const text = 'Hello, 世界! 🌏';
    console.log('原文:', text);
    
    const encoded = cryptoUtils.base64.encode(text);
    console.log('Base64:', encoded);
    
    const decoded = cryptoUtils.base64.decode(encoded);
    console.log('解码:', decoded);
    
    const urlEncoded = cryptoUtils.base64.urlEncode(text);
    console.log('URL 安全:', urlEncoded);
    
    const urlDecoded = cryptoUtils.base64.urlDecode(urlEncoded);
    console.log('URL 解码:', urlDecoded);
    
    if (decoded === text && urlDecoded === text) {
        log(colors.green, '✅ Base64 编解码测试通过');
    } else {
        log(colors.red, '❌ Base64 编解码测试失败');
    }
} catch (error) {
    log(colors.red, '❌ Base64 测试错误:', error.message);
}

// 性能测试
log(colors.blue, '\n⚡ 性能测试');
log(colors.yellow, '---');

try {
    const iterations = 1000;
    
    // AES 性能
    const aesStart = Date.now();
    const key = 'test-key-32-chars-long-string!';
    for (let i = 0; i < iterations; i++) {
        const enc = cryptoUtils.aes.encryptSimple('test data', key);
        cryptoUtils.aes.decryptSimple(enc, key);
    }
    const aesTime = Date.now() - aesStart;
    console.log(`AES 加密/解密 ${iterations} 次: ${aesTime}ms (${(aesTime/iterations).toFixed(2)}ms/次)`);
    
    // SHA256 性能
    const hashStart = Date.now();
    for (let i = 0; i < iterations; i++) {
        cryptoUtils.hash.sha256('test data' + i);
    }
    const hashTime = Date.now() - hashStart;
    console.log(`SHA256 哈希 ${iterations} 次: ${hashTime}ms (${(hashTime/iterations).toFixed(2)}ms/次)`);
    
    log(colors.green, '✅ 性能测试完成');
} catch (error) {
    log(colors.red, '❌ 性能测试错误:', error.message);
}

console.log('\n========================================');
log(colors.green, '✅ 所有测试完成！');
console.log('========================================\n');

// 使用示例
console.log('💡 在 Strapi 项目中使用：\n');
console.log('// 在控制器、服务或中间件中');
console.log('const encrypted = strapi.crypto.aes.encryptSimple(data, key);');
console.log('const { publicKey, privateKey } = strapi.crypto.rsa.generateKeyPair();');
console.log('const hash = strapi.crypto.hash.sha256(password);');
console.log('const token = strapi.crypto.random.uuid();\n');

