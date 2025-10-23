import controller from './controller';
import menu from './menu';
import user from './user';
import auth from './auth';
import captcha from './captcha';
import rateLimit from './rate-limit';

export default {
    controller,
    menu,
    user,
    auth,
    captcha,
    'rate-limit': rateLimit,
};
