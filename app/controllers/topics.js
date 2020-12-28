const Topic = require('../models/topics');
const User = require('../models/users');
const { isValidObjectId } = require('mongoose');

class TopicsCtl {
    async find(ctx) {
        const { q, page = 1, per_page = 10 } = ctx.query;
        const pageSize = Math.max(page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        // 分页功能
        ctx.body = await Topic.find({ name: new RegExp(q) }).limit(perPage).skip(pageSize * perPage);
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const topic = await Topic.findById(ctx.params.id).select(selectFields);

        if (!topic) { ctx.throw(404, '话题不存在') };
        ctx.body = topic;
    }

    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        })

        const topic = await new Topic(ctx.request.body).save();
        ctx.body = topic;
    }

    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        })

        await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        const topic = await Topic.findById(ctx.params.id);
        ctx.body = topic;
    }

    async checkTopicsExist(ctx, next) {
        if (isValidObjectId(ctx.params.id)) {
            const topic = await Topic.findById(ctx.params.id);
            if (!topic) { ctx.throw(404, '话题不存在') };
            await next();
        } else {
            ctx.throw(404, '话题不存在')
        }
    }

    async listTopicFollowers(ctx) {
        const user = await User.find({ followingTopics: ctx.params.id });
        ctx.body = user;
    }
}

module.exports = new TopicsCtl();