import Router from 'koa-router';
const posts = new Router();
import * as postsCtrl from './posts.ctrl.js'

posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.checkObjectId,postsCtrl.read);
posts.delete('/:id', postsCtrl.checkObjectId,postsCtrl.remove);
posts.patch('/:id', postsCtrl.checkObjectId,postsCtrl.update);


export default posts;