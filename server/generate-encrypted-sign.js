/**
 * 生成加密签名工具
 * 用于生成包含 'bag' 的加密签名
 */

const crypto = require('crypto');

// AES 加密函数（与插件保持一致）
function aesEncrypt(plaintext, secretKey) {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    const combined = JSON.stringify({
        e: encrypted,
        i: iv.toString('hex'),
        a: authTag.toString('hex')
    });
    return Buffer.from(combined).toString('base64');
}

// 颜色输出
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[36m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
};

console.log('========================================');
console.log('   加密签名生成工具');
console.log('========================================\n');

// 配置
const secretKey = '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq';  // 与插件配置保持一致

// 生成包含 'bag' 的字符串
const texts = [
    'bag',
    'bag-token',
    'bag-sign-2024',
    'bag-' + Date.now(),
    'user-bag-access',
    JSON.stringify({ type: 'bag', timestamp: Date.now() }),
];

console.log(`${colors.blue}密钥:${colors.reset}`, secretKey);
console.log(`${colors.blue}密钥长度:${colors.reset}`, secretKey.length, '字符\n');

texts.forEach((text, index) => {
    console.log(`${colors.yellow}示例 ${index + 1}:${colors.reset}`);
    console.log('原文:', text);
    
    const encrypted = aesEncrypt(text, secretKey);
    console.log('加密签名:', encrypted);
    console.log('');
});

console.log('========================================');
console.log(`${colors.green}生成完成！${colors.reset}`);
console.log('========================================\n');

console.log('💡 使用方法：\n');
console.log('1. 复制上面生成的加密签名');
console.log('2. 在请求头中添加: -H "sign: 加密签名"');
console.log('3. 示例：');
console.log(`   curl -H "sign: ${aesEncrypt('bag', secretKey)}" http://localhost:1337/bag-strapi-plugin\n`);

console.log('📝 配置说明：\n');
console.log('在 config/plugins.js 中配置：');
console.log('signVerify: {');
console.log('  enabled: true,');
console.log('  mode: \'encrypted\',         // 使用加密模式');
console.log('  encryptionKey: \'' + secretKey + '\',');
console.log('  enableOnceOnly: false,      // 是否启用一次性签名');
console.log('}\n');

