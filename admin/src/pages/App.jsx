import {Page} from '@strapi/strapi/admin';
import {Routes, Route} from 'react-router-dom';

import {HomePage} from './HomePage';
import {WebsitePage} from './WebsitePage';

const App = () => {
    return (
        <Routes>
            <Route index element={<HomePage/>}/>
            <Route path="website" element={<WebsitePage/>}/>
            <Route path="*" element={<Page.Error/>}/>
        </Routes>
    );
};

export {App};
