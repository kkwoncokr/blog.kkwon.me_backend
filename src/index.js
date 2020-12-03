
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import api from './api/index.js';

const {PORT,MONGO_URI} = process.env;

mongoose
  .connect(MONGO_URI, {useNewUrlParser:true, useFindAndModify:false})
  .then(()=> {
    console.log('디비 연동 성공!')
  })
  .catch(e => {
    console.error(e);
  })


const app = new Koa();
const router = new Router();


router.use('/api', api.routes());

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4000;
app.listen(port, () => {
  console.log('listening to port %d',port);
});