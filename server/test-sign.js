/**
 * 签名测试脚本
 * 用于生成测试签名和 curl 命令
 */

const crypto = require('crypto');

// 配置
const CONFIG = {
    secretKey: 'your-super-secret-key', // 修改为你的密钥
    baseUrl: 'http://localhost:1337/bag-strapi-plugin',
    endpoint: '/', // 修改为你要测试的端点
};

/**
 * 生成简单签名（用于 sign-verify 中间件）
 */
function generateSimpleSign() {
    console.log('=== 简单签名验证测试 ===\n');

    const sign = 'test-sign-123'; // 从配置中的 validSigns 列表中选择

    console.log('请求头参数：');
    console.log(`sign: ${sign}\n`);

    console.log('curl 命令：');
    console.log(`curl -H "sign: ${sign}" ${CONFIG.baseUrl}${CONFIG.endpoint}\n`);
}

/**
 * 生成高级签名（用于 sign-verify-advanced 中间件）
 */
function generateAdvancedSign(body = null) {
    console.log('=== 高级签名验证测试 ===\n');

    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(2, 15);
    const bodyStr = body ? JSON.stringify(body) : '';

    // 生成签名：MD5(timestamp + nonce + secretKey + body)
    const signString = `${timestamp}${nonce}${CONFIG.secretKey}${bodyStr}`;
    const sign = crypto.createHash('md5').update(signString).digest('hex');

    console.log('请求参数：');
    console.log(`timestamp: ${timestamp}`);
    console.log(`nonce: ${nonce}`);
    console.log(`secretKey: ${CONFIG.secretKey}`);
    console.log(`body: ${bodyStr || '(空)'}`);
    console.log(`signString: ${signString}`);
    console.log(`sign: ${sign}\n`);

    console.log('请求头：');
    console.log(`sign: ${sign}`);
    console.log(`timestamp: ${timestamp}`);
    console.log(`nonce: ${nonce}\n`);

    if (body) {
        // POST 请求
        console.log('curl 命令（POST）：');
        console.log(`curl -X POST \\
  -H "sign: ${sign}" \\
  -H "timestamp: ${timestamp}" \\
  -H "nonce: ${nonce}" \\
  -H "Content-Type: application/json" \\
  -d '${bodyStr}' \\
  ${CONFIG.baseUrl}${CONFIG.endpoint}\n`);
    } else {
        // GET 请求
        console.log('curl 命令（GET）：');
        console.log(`curl -X GET \\
  -H "sign: ${sign}" \\
  -H "timestamp: ${timestamp}" \\
  -H "nonce: ${nonce}" \\
  ${CONFIG.baseUrl}${CONFIG.endpoint}\n`);
    }
}

/**
 * Node.js 客户端示例代码
 */
function generateNodeJsExample() {
    console.log('=== Node.js 客户端示例 ===\n');

    const code = `
const crypto = require('crypto');
const axios = require('axios');

async function requestWithSign(url, method = 'GET', data = null) {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 15);
  const secretKey = '${CONFIG.secretKey}';
  const bodyStr = data ? JSON.stringify(data) : '';

  // 生成签名
  const signString = \`\${timestamp}\${nonce}\${secretKey}\${bodyStr}\`;
  const sign = crypto.createHash('md5').update(signString).digest('hex');

  // 发送请求
  const config = {
    method,
    url,
    headers: {
      'sign': sign,
      'timestamp': timestamp,
      'nonce': nonce,
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    console.log('响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
    throw error;
  }
}

// 使用示例
(async () => {
  // GET 请求
  await requestWithSign('${CONFIG.baseUrl}${CONFIG.endpoint}', 'GET');

  // POST 请求
  await requestWithSign('${CONFIG.baseUrl}${CONFIG.endpoint}', 'POST', {
    name: 'test',
    value: 123
  });
})();
`;

    console.log(code);
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    const type = args[0] || 'advanced';

    console.log('========================================');
    console.log('   Strapi 插件签名测试工具');
    console.log('========================================\n');

    if (type === 'simple') {
        generateSimpleSign();
    } else if (type === 'advanced') {
        generateAdvancedSign();
    } else if (type === 'post') {
        generateAdvancedSign({name: 'test', value: 123});
    } else if (type === 'example') {
        generateNodeJsExample();
    } else {
        console.log('用法:');
        console.log('  node test-sign.js simple    - 生成简单签名测试');
        console.log('  node test-sign.js advanced  - 生成高级签名测试（GET）');
        console.log('  node test-sign.js post      - 生成高级签名测试（POST）');
        console.log('  node test-sign.js example   - 生成 Node.js 客户端示例\n');
    }

    console.log('========================================\n');
}

main();

