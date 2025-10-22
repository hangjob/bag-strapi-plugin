import contentAPIRoutes from './content-api';
import menuRoutes from './menu';
const routes = {
  'content-api': {
    type: 'content-api',
    routes: [...contentAPIRoutes, ...menuRoutes],
  },
};

export default routes;
