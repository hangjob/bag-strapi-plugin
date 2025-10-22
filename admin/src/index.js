import { PluginIcon } from './components/PluginIcon';
import { PLUGIN_ID } from './pluginId';

export default {
    register(app) {
        // 外部网站菜单
        app.addMenuLink({
            to: `/plugins/${PLUGIN_ID}/website`,
            icon: PluginIcon,
            intlLabel: {
                id: `${PLUGIN_ID}.website.name`,
                defaultMessage: '外部网站',
            },
            Component: async () => {
                const component = await import(/* webpackChunkName: "bag-plugin-website" */ './pages/App');
                return component;
            },
            permissions: [],
        });

        // 注册插件
        app.registerPlugin({
            id: PLUGIN_ID,
            name: 'bag-strapi-plugin',
        });
    },
    
    bootstrap(app) {
        console.log('🔧 [bag-strapi-plugin] 插件启动完成');
        // 注意：在 Strapi 5 中，登录页面覆盖需要在主项目中实现
        // 插件只提供登录组件，不直接覆盖
        // 详见：LOGIN_USAGE_EXAMPLE.md
    },
};
