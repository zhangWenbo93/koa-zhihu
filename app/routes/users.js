// const jwt = require('jsonwebtoken');
const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({ 'prefix': '/users' });
const { secret } = require('../config')
const { find, findById, create, update, delete: del, login, checkOwner } = require('../controllers/users')

// const auth = async (ctx, next) => {
//     const { authorization = '' } = ctx.request.header;
//     const token = authorization.replace('Bearer ', '');
//     try {
//         const user = jwt.verify(token, secret);
//         ctx.state.user = user;
//     } catch (error) {
//         ctx.throw(401, error.message);
//     }
//     await next();
// }

const auth = jwt({ secret });

router.get('/', find);

router.get('/:id', findById);

router.post('/', create);

router.patch('/:id', auth, checkOwner, update);

router.delete('/:id', auth, checkOwner, del);

router.post('/login', login);

module.exports = router;