const Router = require('koa-router');
const jwt = require('koa-jwt');
const { secret } = require('../config');
const { find, findById, create, update, checkTopicsExist, listTopicFollowers, listQuestions } = require('../controllers/topics');

const router = new Router({ 'prefix': '/topics' });
const auth = jwt({ secret });

router.get('/', find);
router.get('/:id', checkTopicsExist, findById);
router.post('/', auth, create);
router.patch('/:id', auth, checkTopicsExist, update);
router.get('/:id/followers', checkTopicsExist, listTopicFollowers);
router.get('/:id/question', checkTopicsExist, listQuestions);

module.exports = router;