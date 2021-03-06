import Post from '../../models/post.js';
import mongoose from 'mongoose';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const {ObjectId} = mongoose.Types;

const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ["src"],
    li: ['class'],
  },
  allowedSchemes: ['data', 'http'],
};

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const thisPost = await Post.findById(id);
    const nextPost = await Post.find({_id: {$gt:id}}).sort({_id:1}).limit(1);
    const prevPost = await Post.find({_id: {$lt:id}}).sort({_id:-1}).limit(1);

    const post = ({
      thisPost,
      prevPost,
      nextPost,
    })
    console.debug(post)
    // 포스트가 존재하지 않을 때
    if (!thisPost) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const checkOwnPost = (ctx,next) => {
  const {user,post} =ctx.state;
  if(post.thisPost.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
}

export const write = async ctx => {
  const schema = Joi.object().keys({
    title:Joi.string().required(),
    body:Joi.string().required(),
    tags:Joi.array()
    .items(Joi.string())
    .required(),
  })
  // const result = Joi.validate(ctx.request.body, schema);
  const validation = schema.validate(ctx.request.body);
  if(validation.error) {
    ctx.status = 400;
    ctx.body = validation.error;
    return;
  }
  const {title, body,tags} = ctx.request.body;
  const post = new Post({
    title,
    body,
    // body: sanitizeHtml(body, sanitizeOption),
    tags,
      user: ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500,e);
  }
};

const removeHtmlAndShorten = body => {
  const filtered = sanitizeHtml(body,{
    allowedTags:[],
  })
  return filtered.length < 200 ? filtered : `${filtered.slice(0,200)}...`;
}

export const list = async ctx => {
  //query 값은 문자열 이기 떄문에 숫자로 변환해야함
  // 값이 주어지지 않았다면 1을 기본으로 사용
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }
  const { tag,username } = ctx.query;
  const query = {
    ...(username ? {'user.username' : username} : {}),
    ...(tag?{tags:tag}:{}),
  }
  try {
    const posts = await Post.find(query)
    .sort({_id:-1})
    .limit(10)
    .skip((page -1) *10)
    .lean()
    .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set('Last-page', Math.ceil(postCount/10))
    ctx.body = posts
    .map(post => ({
      ...post,
        body: removeHtmlAndShorten(post.body),
    }))
  } catch (e) {
    ctx.throw(500,e);
  }
};



export const read = ctx => {
ctx.body = ctx.state.post;

};



export const remove = async ctx => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204;
  } catch (e) {
    ctx.throw(500,e);
  }
};



export const update = async ctx => {
  const {id} = ctx.params;

  const schema = Joi.object().keys({
    title:Joi.string(),
    body:Joi.string(),
    tags: Joi.array().items(Joi.string()),
  })

  const validation = schema.validate(ctx.request.body);

  if(validation.error) {
    ctx.status = 400;
    ctx.body = validation.error;
    return;
  }
  const nextData ={...ctx.request.body};
  if(nextData.body) {
    nextData.body;
    // nextData.body = sanitizeHtml(nextData.body);
  }
  try {
    const post = await Post.findByIdAndUpdate(id, nextData, {
      new:true,
    }).exec();
    if(!post){
      ctx.status = 404;
    }
    ctx.body = post;
  }catch(e) {
    ctx.throw(500,e)
  }
};