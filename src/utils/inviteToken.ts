import Cookies from 'js-cookie';

export const saveInviteToken = (id: string, token: string, verified = false) => {
    Cookies.set('invitation', `borderId=${id}&token=${token}&verified=${verified}`, { expires: 1 });
};

export const getInviteToken = () => {
    const tokenStr = Cookies.get('invitation');
    if (!tokenStr) return null;

    const params = new URLSearchParams(tokenStr);
    return {
        id: params.get('borderId'),
        token: params.get('token'),
        verified: params.get('verified') === 'true',
    };
};

export const clearInviteToken = () => {
    Cookies.remove('invitation');
};
