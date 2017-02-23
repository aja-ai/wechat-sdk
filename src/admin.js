import { Router } from 'express';
import { randomBytes, pbkdf2 } from 'acrypto';
import { assign, pick } from 'lodash';

import config, { save, visibles } from './config';

function digest(password, salt) {
  return pbkdf2(password, salt, 100000, 512, 'sha256');
}

export default function admin() {

  const router = Router();

  router.get('/', (req, res, error) => {
    if (!config('CREDENTIAL')) {
      return res.redirect('/admin/setup');
    }

    if (!req.session.authed) {
      return res.redirect('/admin/auth');
    }

    res.render('main', {
      config: visibles(),
      err: req.query.err,
    });
  });

  router.post('/', async (req, res, error) => {
    if (!config('CREDENTIAL')) {
      return res.redirect('/admin/setup');
    }

    if (!req.session.authed) {
      return res.redirect('/admin/auth');
    }

    const cfg = pick(req.body, [
      'AJA_APP_SECRET',
      'WECHAT_TOKEN',
      'WECHAT_APPID',
      'WECHAT_AESKEY',
    ]);

    const { password, confirm } = req.body;

    if (password) {
      if (password.length < 8) {
        return res.redirect('/admin/?err=密码最少8位');
      }

      if (password != confirm) {
        return res.redirect('/admin/?err=两次输入的密码不一致');
      }
    }

    try {
      if (password) {
        const salt = await randomBytes(32);
        const credential = await digest(password, salt);

        assign(cfg, {
          'SALT': salt.toString('base64'),
          'CREDENTIAL': credential.toString('base64'),
        });

        req.session.authed = false;
      }

      await save(cfg);
    } catch (e) {
      return error(e);
    }

    res.redirect('/admin/');
  });

  router.get('/setup', (req, res, error) => {
    if (config('CREDENTIAL')) {
      return res.redirect('/admin/');
    }

    res.render('setup', { err: req.query.err });
  });

  router.post('/setup', async (req, res, error) => {
    if (config('CREDENTIAL')) {
      return res.redirect('/admin/');
    }

    const { password, confirm } = req.body;

    if (!password) {
      return res.redirect('/admin/setup?err=密码不能为空');
    }

    if (password.length < 8) {
      return res.redirect('/admin/setup?err=密码最少8位');
    }

    if (password != confirm) {
      return res.redirect('/admin/setup?err=两次输入的密码不一致');
    }

    try {
      const salt = await randomBytes(32);
      const credential = await digest(password, salt);

      await save({
        'SALT': salt.toString('base64'),
        'CREDENTIAL': credential.toString('base64'),
      });
    } catch (e) {
      return error(e);
    }

    console.log('done, redirect...');

    req.session.authed = true;
    res.redirect('/admin/');
  });

  router.get('/auth', (req, res, error) => {
    if (!config('CREDENTIAL')) {
      return res.redirect('/admin/setup');
    }

    res.render('auth', { err: req.query.err });
  });

  router.post('/auth', async (req, res, error) => {
    if (!config('CREDENTIAL')) {
      return res.redirect('/admin/setup');
    }

    const { password } = req.body;
    const salt = Buffer.from(config('SALT'), 'base64');

    try {
      const credential = await digest(password, salt);

      if (credential.toString('base64') != config('CREDENTIAL')) {
        return res.redirect('/admin/auth?err=帐号或密码错误');
      }
    } catch (e) {
      return error(e);
    }

    req.session.authed = true;
    res.redirect('/admin/');
  });

  router.get('/logout', (req, res, error) => {
    req.session.authed = false;
    res.redirect('/admin/auth');
  });

  return router;

}
