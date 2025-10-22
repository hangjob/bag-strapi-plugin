import React, {useState} from 'react';
// import { useAuth } from '@strapi/helper-plugin';

const BagLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 使用Strapi的auth helper进行登录，或者直接使用axios
            //   const data = await useAuth.login(identifier, password);
            // 登录成功，Strapi通常会处理后续的令牌存储和跳转
            console.log('Login successful', "data");
        } catch (err) {
            setError('Login failed. Please check your credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div padding={8} background="neutral100">
            2222
        </div>
    );
};

export {
    BagLogin
};
