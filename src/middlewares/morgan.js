import _morgan from 'morgan';

const ENV = process.env.NODE_ENV || 'development';

_morgan.token('remote-user', (req) => {
  return req.weixin
    ? req.weixin.FromUserName
    : undefined;
});

export default function morgan() {
  return _morgan(ENV == 'production' ? 'combined' : 'dev');
}
