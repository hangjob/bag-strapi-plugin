/**
 * 认证系统测试脚本
 * 
 * 使用方法：
 * node server/test-auth.js
 */

const BASE_URL = 'http://localhost:1337/bag-strapi-plugin';

// 测试数据
const testUser = {
    username: 'testuser_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    password: 'Test123456',
    nickname: '测试用户',
    phone: '13800138000'
};

let authToken = null;

// 辅助函数
async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    console.log(`\n📤 ${method} ${endpoint}`);
    if (body) {
        console.log('请求体:', JSON.stringify(body, null, 2));
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        console.log(`📥 状态码: ${response.status}`);
        console.log('响应:', JSON.stringify(data, null, 2));
        
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error('❌ 请求失败:', error.message);
        return { ok: false, error: error.message };
    }
}

// 测试用例
async function testRegister() {
    console.log('\n\n========================================');
    console.log('测试 1: 用户注册');
    console.log('========================================');
    
    const result = await makeRequest('/auth/register', 'POST', testUser);
    
    if (result.ok && result.data.success) {
        authToken = result.data.data.token;
        console.log('✅ 注册成功！');
        console.log('Token:', authToken.substring(0, 50) + '...');
        return true;
    } else {
        console.log('❌ 注册失败！');
        return false;
    }
}

async function testLogin() {
    console.log('\n\n========================================');
    console.log('测试 2: 用户登录');
    console.log('========================================');
    
    const result = await makeRequest('/auth/login', 'POST', {
        identifier: testUser.username,
        password: testUser.password
    });
    
    if (result.ok && result.data.success) {
        authToken = result.data.data.token;
        console.log('✅ 登录成功！');
        console.log('Token:', authToken.substring(0, 50) + '...');
        return true;
    } else {
        console.log('❌ 登录失败！');
        return false;
    }
}

async function testLoginWithEmail() {
    console.log('\n\n========================================');
    console.log('测试 3: 使用邮箱登录');
    console.log('========================================');
    
    const result = await makeRequest('/auth/login', 'POST', {
        identifier: testUser.email,
        password: testUser.password
    });
    
    if (result.ok && result.data.success) {
        console.log('✅ 使用邮箱登录成功！');
        return true;
    } else {
        console.log('❌ 使用邮箱登录失败！');
        return false;
    }
}

async function testGetMe() {
    console.log('\n\n========================================');
    console.log('测试 4: 获取当前用户信息');
    console.log('========================================');
    
    const result = await makeRequest('/auth/me', 'GET', null, authToken);
    
    if (result.ok && result.data.success) {
        console.log('✅ 获取用户信息成功！');
        return true;
    } else {
        console.log('❌ 获取用户信息失败！');
        return false;
    }
}

async function testRefreshToken() {
    console.log('\n\n========================================');
    console.log('测试 5: 刷新 Token');
    console.log('========================================');
    
    const result = await makeRequest('/auth/refresh', 'POST', {
        token: authToken
    });
    
    if (result.ok && result.data.success) {
        const newToken = result.data.data.token;
        console.log('✅ Token 刷新成功！');
        console.log('新 Token:', newToken.substring(0, 50) + '...');
        authToken = newToken;
        return true;
    } else {
        console.log('❌ Token 刷新失败！');
        return false;
    }
}

async function testChangePassword() {
    console.log('\n\n========================================');
    console.log('测试 6: 修改密码');
    console.log('========================================');
    
    const newPassword = 'NewTest123456';
    
    const result = await makeRequest('/auth/change-password', 'POST', {
        oldPassword: testUser.password,
        newPassword: newPassword
    }, authToken);
    
    if (result.ok && result.data.success) {
        console.log('✅ 密码修改成功！');
        // 更新测试用户密码
        testUser.password = newPassword;
        return true;
    } else {
        console.log('❌ 密码修改失败！');
        return false;
    }
}

async function testLoginWithNewPassword() {
    console.log('\n\n========================================');
    console.log('测试 7: 使用新密码登录');
    console.log('========================================');
    
    const result = await makeRequest('/auth/login', 'POST', {
        identifier: testUser.username,
        password: testUser.password
    });
    
    if (result.ok && result.data.success) {
        authToken = result.data.data.token;
        console.log('✅ 使用新密码登录成功！');
        return true;
    } else {
        console.log('❌ 使用新密码登录失败！');
        return false;
    }
}

async function testInvalidToken() {
    console.log('\n\n========================================');
    console.log('测试 8: 使用无效 Token');
    console.log('========================================');
    
    const result = await makeRequest('/auth/me', 'GET', null, 'invalid_token');
    
    if (!result.ok && !result.data.success) {
        console.log('✅ 正确拒绝了无效 Token！');
        return true;
    } else {
        console.log('❌ 未能正确处理无效 Token！');
        return false;
    }
}

async function testDuplicateUsername() {
    console.log('\n\n========================================');
    console.log('测试 9: 重复用户名注册');
    console.log('========================================');
    
    const result = await makeRequest('/auth/register', 'POST', {
        ...testUser,
        email: `another_${Date.now()}@example.com`
    });
    
    if (!result.ok && !result.data.success) {
        console.log('✅ 正确拒绝了重复用户名！');
        return true;
    } else {
        console.log('❌ 未能正确处理重复用户名！');
        return false;
    }
}

async function testWrongPassword() {
    console.log('\n\n========================================');
    console.log('测试 10: 错误密码登录');
    console.log('========================================');
    
    const result = await makeRequest('/auth/login', 'POST', {
        identifier: testUser.username,
        password: 'WrongPassword123'
    });
    
    if (!result.ok && !result.data.success) {
        console.log('✅ 正确拒绝了错误密码！');
        return true;
    } else {
        console.log('❌ 未能正确处理错误密码！');
        return false;
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('🚀 开始测试认证系统...');
    console.log('服务器地址:', BASE_URL);
    
    const results = [];
    
    // 基本功能测试
    results.push({ name: '用户注册', passed: await testRegister() });
    results.push({ name: '用户登录', passed: await testLogin() });
    results.push({ name: '邮箱登录', passed: await testLoginWithEmail() });
    results.push({ name: '获取用户信息', passed: await testGetMe() });
    results.push({ name: '刷新Token', passed: await testRefreshToken() });
    results.push({ name: '修改密码', passed: await testChangePassword() });
    results.push({ name: '新密码登录', passed: await testLoginWithNewPassword() });
    
    // 错误处理测试
    results.push({ name: '无效Token', passed: await testInvalidToken() });
    results.push({ name: '重复用户名', passed: await testDuplicateUsername() });
    results.push({ name: '错误密码', passed: await testWrongPassword() });
    
    // 输出测试结果
    console.log('\n\n========================================');
    console.log('📊 测试结果汇总');
    console.log('========================================\n');
    
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    results.forEach((result, index) => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} 测试 ${index + 1}: ${result.name}`);
    });
    
    console.log('\n========================================');
    console.log(`总计: ${passedCount}/${totalCount} 通过`);
    console.log('========================================\n');
    
    if (passedCount === totalCount) {
        console.log('🎉 所有测试通过！认证系统工作正常。');
    } else {
        console.log('⚠️  部分测试未通过，请检查服务器日志。');
    }
}

// 检查服务器是否可用
async function checkServer() {
    try {
        const response = await fetch(`${BASE_URL}/users`);
        return response.ok || response.status === 401; // 401 也表示服务器在运行
    } catch (error) {
        return false;
    }
}

// 主函数
async function main() {
    console.log('检查服务器连接...');
    const serverAvailable = await checkServer();
    
    if (!serverAvailable) {
        console.error('\n❌ 无法连接到服务器！');
        console.error('请确保：');
        console.error('1. Strapi 服务器正在运行');
        console.error('2. 服务器地址正确:', BASE_URL);
        console.error('3. bag-strapi-plugin 插件已正确安装');
        process.exit(1);
    }
    
    console.log('✅ 服务器连接正常\n');
    
    await runAllTests();
}

// 运行测试
main().catch(error => {
    console.error('\n❌ 测试过程中发生错误:', error);
    process.exit(1);
});

