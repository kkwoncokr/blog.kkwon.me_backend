import Router from 'koa-router';
const posts = new Router();
import * as postsCtrl from './posts.ctrl.js'

posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.read);
posts.delete('/:id', postsCtrl.remove);
posts.put('/:id', postsCtrl.replace);
posts.patch('/:id', postsCtrl.update);


export default posts;