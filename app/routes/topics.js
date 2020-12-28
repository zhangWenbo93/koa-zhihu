const Router = require('koa-router');
const jwt = require('koa-jwt');
const { secret } = require('../config');
const { find, findById, create, update } = require('../controllers/topics');

const router = new Router({ 'prefix': '/topics' });
const auth = jwt({ secret });

router.get('/', find);
router.get('/:id', findById);
router.post('/', auth, create);
router.patch('/:id', auth, update);

module.exports = router;