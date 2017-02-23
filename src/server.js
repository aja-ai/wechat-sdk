import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser'
import { join } from 'path';

import morgan from './middlewares/morgan';
import wechat from './middlewares/wechat';

import aja from './aja';
import admin from './admin';

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'pug')
app.set('views', join(__dirname, '..', 'src', 'views'))

app.use(session({
  secret: '87898q7z88dfh199hbzbjaj',
  resave: false,
  saveUninitialized: false,
}));

app.use(morgan());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/aja', wechat(), aja());
app.use('/admin', admin());

if (ENV === 'development') {
  require('./dev')(app);
} else {
  app.use('/assets', express.static(join(__dirname, 'assets')));
}

app.listen(PORT, () => {
  console.log(`server running ${ENV} on ${PORT}`)
});
