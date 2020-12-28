// const jwt = require('jsonwebtoken');
const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({ 'prefix': '/users' });
const { secret } = require('../config')
const { find, findById, create, update, delete: del, login, checkOwner, listFollowing, listFollowers, checkUserExist, follow, unfollow, listFollowingTopics, followTopic, unfollowTopic } = require('../controllers/users')

const { checkTopicsExist } = require('../controllers/topics');
const auth = jwt({ secret });
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

router.get('/', find);
router.get('/:id', findById);
router.post('/', create);
router.patch('/:id', auth, checkOwner, update);
router.delete('/:id', auth, checkOwner, del);
router.post('/login', login);
router.get('/:id/following', listFollowing);
router.get('/:id/followers', listFollowers);
router.put('/following/:id', auth, checkUserExist, follow);
router.delete('/following/:id', auth, checkUserExist, unfollow);
router.get('/:id/followingTopics', listFollowingTopics);
router.put('/followingTopics/:id', auth, checkTopicsExist, followTopic);
router.delete('/followingTopics/:id', auth, checkTopicsExist, unfollowTopic);

module.exports = router;