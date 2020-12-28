const Router = require('koa-router');
const jwt = require('koa-jwt');
const { secret } = require('../config');
const { find, findById, create, update, checkTopicsExist, listTopicFollowers } = require('../controllers/topics');

const router = new Router({ 'prefix': '/topics' });
const auth = jwt({ secret });

router.get('/', find);
router.get('/:id', findById);
router.post('/', auth, checkTopicsExist, create);
router.patch('/:id', auth, checkTopicsExist, update);
router.get('/:id/followers', checkTopicsExist, listTopicFollowers);

module.exports = router;