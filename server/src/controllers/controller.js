const controller = ({strapi}) => ({
    index(ctx) {
        console.log('📍 [controller.index] 被调用');
        ctx.body = strapi
            .plugin('bag-strapi-plugin')
            .service('service')
            .getWelcomeMessage();
    },

    test(ctx) {
        console.log('📍 [controller.test] 被调用');
        ctx.body = {
            message: '签名验证通过！',
            data: ctx.request.body,
            timestamp: Date.now(),
        };
    },

    /**
     * 测试加密工具
     */
    testCrypto(ctx) {
        console.log('📍 [controller.testCrypto] 被调用');

        const {type, action, data} = ctx.request.body || {};

        try {
            let result = {};

            // AES 对称加密测试
            if (type === 'aes') {
                // 从配置中获取密钥
                const secretKey = strapi.crypto.config.getAesKey();

                if (!secretKey) {
                    throw new Error('AES 密钥未配置，请在 config/plugins.js 中配置 crypto.aesKey');
                }

                if (action === 'encrypt') {
                    result = strapi.crypto.aes.encryptSimple(data, secretKey);
                } else if (action === 'decrypt') {
                    result = strapi.crypto.aes.decryptSimple(data, secretKey);
                }
            }

            // RSA 非对称加密测试
            else if (type === 'rsa') {
                if (action === 'generate') {
                    // 生成新的密钥对
                    const keyLength = strapi.crypto.config.getRsaKeyLength();
                    result = strapi.crypto.rsa.generateKeyPair(keyLength);
                } else if (action === 'encrypt') {
                    // 使用配置的公钥或传入的公钥
                    let publicKey = strapi.crypto.config.getRsaPublicKey();

                    if (data.publicKey) {
                        // 如果用户传入了公钥，使用传入的
                        publicKey = data.publicKey;
                    }

                    if (!publicKey) {
                        throw new Error('RSA 公钥未配置，请在 config/plugins.js 中配置 crypto.rsaPublicKey 或在请求中传入 publicKey');
                    }

                    const text = data.text || data;
                    result = strapi.crypto.rsa.encrypt(text, publicKey);
                } else if (action === 'decrypt') {
                    // 使用配置的私钥或传入的私钥
                    let privateKey = strapi.crypto.config.getRsaPrivateKey();

                    if (data.privateKey) {
                        // 如果用户传入了私钥，使用传入的
                        privateKey = data.privateKey;
                    }

                    if (!privateKey) {
                        throw new Error('RSA 私钥未配置，请在 config/plugins.js 中配置 crypto.rsaPrivateKey 或在请求中传入 privateKey');
                    }

                    const encrypted = data.encrypted || data;
                    result = strapi.crypto.rsa.decrypt(encrypted, privateKey);
                } else if (action === 'getKeyPair') {
                    // 获取配置的密钥对
                    result = strapi.crypto.config.getRsaKeyPair();
                }
            }

            // 哈希测试
            else if (type === 'hash') {
                if (action === 'md5') {
                    result = strapi.crypto.hash.md5(data);
                } else if (action === 'sha256') {
                    result = strapi.crypto.hash.sha256(data);
                }
            }

            ctx.body = {
                success: true,
                type,
                action,
                result,
            };
        } catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: error.message,
            };
        }
    },
});

export default controller;
