import Joi from 'joi';
import User from '../../models/user.js';

export const register = async ctx => {
  // 회원가입
  const schema = Joi.object().keys({
    username: Joi.string().required()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    nickname: Joi.string().required(),
    password: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = JSON.stringify(result.error);
    return;
  }

  const { username, nickname, password } = ctx.request.body;
  try {
    // username,nickname  이 이미 존재하는지 확인
    const exists = await User.findByUsername(username);
    const existsN = await User.findByNickname(nickname);
    if (exists || existsN) {
      ctx.status = 409; // Conflict
      ctx.json = '이미 존재하는 아이디 및 닉네임 입니다.';
      return;
    }

    const user = new User({
      username,
      nickname,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 데이터베이스에 저장

    ctx.body = user.serialize();
    const token = user.generateToken();
    ctx.cookies.set('access_token', token,{
        maxAge:100 * 60 * 60 * 24 * 7,
        httpOnly:true,
    })
  } catch (e) {
    ctx.throw(500, e);
  }
};
export const login = async (ctx) => {
  // 로그인
  const {username, password} = ctx.request.body;

  if(!username || !password) {
      ctx.status = 401;
      return;
  }
  try {
      const user = await User.findByUsername(username);
      if(!user) {
          ctx.status = 401;
          return;
      }
      const valid = await user.checkPassword(password);
      if(!valid) {
          ctx.status = 401;
          return;
      }
      ctx.body = user.serialize();
      const token = user.generateToken();
      ctx.cookies.set('access_token', token,{
          maxAge:100 * 60 * 60 * 24 * 7,
          httpOnly:true,
      })
  } catch (e) {
      ctx.throw(500,e)
  }
};
export const check = async (ctx) => {
  // 로그인 상태 확인
  const { user } = ctx.state;
  console.log(ctx)
  if(!user) {
      ctx.state = 401;
      return;
  }
  ctx.body = user;
};
export const logout = async (ctx) => {
  // 로그아웃
  ctx.cookies.set('access_token');
  ctx.status = 204;
};
