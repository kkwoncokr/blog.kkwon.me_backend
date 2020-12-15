
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from '@koa/cors';

dotenv.config();

import api from './api/index.js';
import jwtMiddleware from './lib/jwtMiddleware.js'

const {PORT,MONGO_URI} = process.env;

mongoose
  .connect(MONGO_URI, {useNewUrlParser:true, useFindAndModify:false})
  .then(()=> {
    console.log('디비 연동 성공!');
  })
  .catch(e => {
    console.error(e);
  })


const app = new Koa();
const router = new Router();

app.use(cors({
  origin: 'http://kkwon.me',
  credentials: true,
  allowHeaders:'Last-page',
}))
router.use('/api', api.routes());

app.use(bodyParser());
app.use(jwtMiddleware);
app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 80;
app.listen(port, () => {
  console.log('listening to port %d',port);
});
