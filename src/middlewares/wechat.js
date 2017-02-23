import _wechat from 'wechat';

import config from '../config';

function makeToken() {
  return {
    token: config('WECHAT_TOKEN'),
    appid: config('WECHAT_APPID'),
    encodingAESKey: config('WECHAT_AESKEY'),
  };
}

export default function wechat() {
  const middleware = _wechat(makeToken());

  return (req, res, next) => {
    middleware.setToken(makeToken());
    return middleware.middlewarify()(req, res, next);
  };
}
