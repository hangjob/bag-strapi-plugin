import contentAPIRoutes from './content-api';
import menuRoutes from './menu';
import userRoutes from './user';
import authRoutes from './auth';
import captchaRoutes from './captcha';
import rateLimitRoutes from './rate-limit';
import testRateLimitRoutes from './test-rate-limit';

const routes = {
  'content-api': {
    type: 'content-api',
    routes: [
      ...contentAPIRoutes,
      ...menuRoutes,
      ...userRoutes,
      ...authRoutes,
      ...captchaRoutes,
      ...rateLimitRoutes,
      ...testRateLimitRoutes,
    ],
  },
};

export default routes;
