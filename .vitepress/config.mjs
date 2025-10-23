import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    srcDir: "docs",
    outDir:"./docs_web",
    base: "/docs_web",
    title: "bag-strapi-plugin",
    description: "一个为 Strapi 提供通用功能的插件，包含认证、加密、限流、菜单管理等功能",

    themeConfig: {
        logo: 'https://vite.itnavs.com/doc/logo-min.png',

        nav: [
            {text: '首页', link: '/'},
            {text: '快速开始', link: '/guide/quick-start'},
            {text: '配置', link: '/guide/configuration'},
            {
                text: '功能',
                items: [
                    {text: 'JWT 认证', link: '/features/auth'},
                    {text: '验证码', link: '/features/captcha'},
                    {text: 'API 限流', link: '/features/rate-limit'},
                    {text: '加密工具', link: '/features/crypto'},
                    {text: '菜单管理', link: '/features/menu'},
                    {text: '签名验证', link: '/features/sign-verify'},
                ]
            },
            {text: 'API 参考', link: '/api/overview'},
        ],

        sidebar: {
            '/guide/': [
                {
                    text: '开始',
                    items: [
                        {text: '简介', link: '/guide/introduction'},
                        {text: '快速开始', link: '/guide/quick-start'},
                        {text: '安装', link: '/guide/installation'},
                        {text: '配置', link: '/guide/configuration'},
                    ]
                },
                {
                    text: '进阶',
                    items: [
                        {text: '环境变量', link: '/guide/environment'},
                        {text: '调试指南', link: '/guide/debugging'},
                        {text: '最佳实践', link: '/guide/best-practices'},
                    ]
                }
            ],
            '/features/': [
                {
                    text: '核心功能',
                    items: [
                        {text: 'JWT 认证系统', link: '/features/auth'},
                        {text: '验证码系统', link: '/features/captcha'},
                        {text: 'API 限流', link: '/features/rate-limit'},
                        {text: '加密工具库', link: '/features/crypto'},
                        {text: '菜单管理', link: '/features/menu'},
                        {text: '签名验证', link: '/features/sign-verify'},
                    ]
                },
                {
                    text: '功能详解',
                    items: [
                        {text: '加密配置', link: '/features/crypto-config'},
                        {text: 'RSA 配置', link: '/features/rsa-config'},
                        {text: '认证配置', link: '/features/auth-config'},
                        {text: '限流配置', link: '/features/rate-limit-config'},
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'API 文档',
                    items: [
                        {text: 'API 概览', link: '/api/overview'},
                        {text: '认证 API', link: '/api/auth'},
                        {text: '验证码 API', link: '/api/captcha'},
                        {text: '限流 API', link: '/api/rate-limit'},
                        {text: '菜单 API', link: '/api/menu'},
                        {text: '用户 API', link: '/api/user'},
                    ]
                },
                {
                    text: '加密工具 API',
                    items: [
                        {text: 'AES 加密', link: '/api/crypto-aes'},
                        {text: 'RSA 加密', link: '/api/crypto-rsa'},
                        {text: '哈希函数', link: '/api/crypto-hash'},
                        {text: '随机工具', link: '/api/crypto-random'},
                    ]
                }
            ]
        },

        socialLinks: [
            {icon: 'github', link: 'https://github.com/yourusername/bag-strapi-plugin'}
        ],

        search: {
            provider: 'local'
        },

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024 yanghang'
        },

        outline: {
            level: [2, 3],
            label: '目录'
        },

        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium'
            }
        }
    }
})
