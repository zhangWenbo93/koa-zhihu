const Koa = require('koa');
const koaBody = require('koa-body');
const KoaStatic = require('koa-static');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const path = require('path');
const { connectionStr } = require('./config');
const routing = require('./routes');

mongoose.connect(connectionStr, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, () => console.log('mongodb 连接成功'));
mongoose.connection.on('error', console.error);

const app = new Koa();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3001;

app.use(KoaStatic(path.join(__dirname, 'public')));
app.use(error({
    postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}));
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true // 保留拓展名
    }
}));
app.use(parameter(app));
routing(app);

app.listen(port, host, () => {
    console.log({ message: `Server listening on http://${host}:${port}`, badge: true })
});