/**
 * 全局签名验证中间件测试脚本
 * 用于快速测试插件的所有接口
 */

const http = require('http');

// 配置
const CONFIG = {
    host: 'localhost',
    port: 1337,
    basePath: '/bag-strapi-plugin',
    validSign: 'test-sign-123',
};

// 颜色输出
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m',
};

/**
 * 发送 HTTP 请求
 */
function request(method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: CONFIG.basePath + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(data),
                    });
                } catch (err) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data,
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

/**
 * 测试用例
 */
const tests = [
    {
        name: '❌ 测试1: 缺少签名 - 应该返回 401',
        method: 'GET',
        path: '/',
        headers: {},
        expectedStatus: 401,
    },
    {
        name: '❌ 测试2: 错误的签名 - 应该返回 401',
        method: 'GET',
        path: '/',
        headers: {sign: 'invalid-sign-xxx'},
        expectedStatus: 401,
    },
    {
        name: '✅ 测试3: 正确的签名 - 应该返回 200',
        method: 'GET',
        path: '/',
        headers: {sign: CONFIG.validSign},
        expectedStatus: 200,
    },
    {
        name: '✅ 测试4: POST 请求带正确签名 - 应该返回 200',
        method: 'POST',
        path: '/test',
        headers: {sign: CONFIG.validSign},
        body: {name: 'test', value: 123},
        expectedStatus: 200,
    },
    {
        name: '❌ 测试5: POST 请求不带签名 - 应该返回 401',
        method: 'POST',
        path: '/test',
        headers: {},
        body: {name: 'test'},
        expectedStatus: 401,
    },
];

/**
 * 运行单个测试
 */
async function runTest(test) {
    try {
        console.log(`\n${colors.blue}${test.name}${colors.reset}`);
        console.log(`请求: ${test.method} ${CONFIG.basePath}${test.path}`);

        if (Object.keys(test.headers).length > 0) {
            console.log(`请求头: ${JSON.stringify(test.headers)}`);
        }

        if (test.body) {
            console.log(`请求体: ${JSON.stringify(test.body)}`);
        }

        const response = await request(
            test.method,
            test.path,
            test.headers,
            test.body
        );

        console.log(`响应状态: ${response.statusCode}`);
        console.log(`响应体: ${JSON.stringify(response.body, null, 2)}`);

        if (response.statusCode === test.expectedStatus) {
            console.log(`${colors.green}✓ 测试通过${colors.reset}`);
            return true;
        } else {
            console.log(
                `${colors.red}✗ 测试失败: 期望状态码 ${test.expectedStatus}，实际 ${response.statusCode}${colors.reset}`
            );
            return false;
        }
    } catch (err) {
        console.log(`${colors.red}✗ 测试失败: ${err.message}${colors.reset}`);
        return false;
    }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
    console.log('========================================');
    console.log('   全局签名验证中间件测试');
    console.log('========================================');
    console.log(`服务器: http://${CONFIG.host}:${CONFIG.port}`);
    console.log(`插件路径: ${CONFIG.basePath}`);
    console.log(`有效签名: ${CONFIG.validSign}`);
    console.log('========================================');

    let passedCount = 0;
    let failedCount = 0;

    for (const test of tests) {
        const passed = await runTest(test);
        if (passed) {
            passedCount++;
        } else {
            failedCount++;
        }

        // 延迟一下，避免请求太快
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('\n========================================');
    console.log('   测试结果汇总');
    console.log('========================================');
    console.log(`${colors.green}通过: ${passedCount}${colors.reset}`);
    console.log(`${colors.red}失败: ${failedCount}${colors.reset}`);
    console.log(`总计: ${passedCount + failedCount}`);
    console.log('========================================\n');

    if (failedCount === 0) {
        console.log(`${colors.green}🎉 所有测试通过！${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.red}❌ 有 ${failedCount} 个测试失败${colors.reset}\n`);
        process.exit(1);
    }
}

/**
 * 快速测试单个接口
 */
async function quickTest() {
    console.log('========================================');
    console.log('   快速测试');
    console.log('========================================\n');

    console.log('1. 测试不带签名的请求...');
    try {
        const res1 = await request('GET', '/', {});
        console.log(`状态: ${res1.statusCode}`);
        console.log(`响应: ${JSON.stringify(res1.body, null, 2)}\n`);
    } catch (err) {
        console.log(`错误: ${err.message}\n`);
    }

    console.log('2. 测试带正确签名的请求...');
    try {
        const res2 = await request('GET', '/', {sign: CONFIG.validSign});
        console.log(`状态: ${res2.statusCode}`);
        console.log(`响应: ${JSON.stringify(res2.body, null, 2)}\n`);
    } catch (err) {
        console.log(`错误: ${err.message}\n`);
    }

    console.log('========================================\n');
}

/**
 * 生成 curl 命令
 */
function generateCurlCommands() {
    console.log('========================================');
    console.log('   cURL 命令示例');
    console.log('========================================\n');

    const baseUrl = `http://${CONFIG.host}:${CONFIG.port}${CONFIG.basePath}`;

    console.log('1. 不带签名（应该失败）:');
    console.log(`curl ${baseUrl}\n`);

    console.log('2. 带正确签名（应该成功）:');
    console.log(`curl -H "sign: ${CONFIG.validSign}" ${baseUrl}\n`);

    console.log('3. POST 请求带签名:');
    console.log(`curl -X POST \\
  -H "sign: ${CONFIG.validSign}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"test","value":123}' \\
  ${baseUrl}/test\n`);

    console.log('4. 错误的签名（应该失败）:');
    console.log(`curl -H "sign: wrong-sign" ${baseUrl}\n`);

    console.log('========================================\n');
}

// 主函数
const command = process.argv[2] || 'all';

switch (command) {
    case 'all':
        runAllTests().catch(console.error);
        break;
    case 'quick':
        quickTest().catch(console.error);
        break;
    case 'curl':
        generateCurlCommands();
        break;
    default:
        console.log('用法:');
        console.log('  node test-global-middleware.js all   - 运行所有测试');
        console.log('  node test-global-middleware.js quick - 快速测试');
        console.log('  node test-global-middleware.js curl  - 生成 curl 命令');
        break;
}

