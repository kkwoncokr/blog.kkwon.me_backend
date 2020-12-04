import Router from 'koa-router';
const posts = new Router();
import * as postsCtrl from './posts.ctrl.js';
import checkLoggendIn from '../../lib/checkLoggedIn.js'

posts.get('/', postsCtrl.list);
posts.post('/', checkLoggendIn,postsCtrl.write);

const post = new Router();

post.get('/', postsCtrl.read);
post.delete('/', checkLoggendIn,postsCtrl.checkOwnPost,postsCtrl.remove);
post.patch('/', checkLoggendIn,postsCtrl.checkOwnPost,postsCtrl.update);

posts.use('/:id', postsCtrl.getPostById, post.routes());


export default posts;