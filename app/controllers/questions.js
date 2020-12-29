const Questions = require('../models/questions');
const { isValidObjectId } = require('mongoose');

class questionsCtl {
    async find(ctx) {
        const { q, page = 1, per_page = 10 } = ctx.query;
        const pageSize = Math.max(page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const keyword = new RegExp(q);
        // 分页功能
        ctx.body = await Questions.find({ $or: [{ title: keyword }, { description: keyword }] }).limit(perPage).skip(pageSize * perPage);
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const question = await Questions.findById(ctx.params.id).select(selectFields).populate('questioner topics');

        if (!question) { ctx.throw(404, '问题不存在') };
        ctx.body = question;
    }

    async checkQuestioner(ctx, next) {
        const { question } = ctx.state;
        if (question.questioner.toString() !== ctx.state.user._id) {
            ctx.throw(402, '没有权限操作');
        }
        await next()
    }

    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false }
        })

        const question = await new Questions({ ...ctx.request.body, questioner: ctx.state.user._id }).save();
        ctx.body = question;
    }

    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: false },
            description: { type: 'string', required: false }
        })
        await ctx.state.question.updateOne(ctx.request.body)
        const question = await Questions.findById(ctx.params.id);
        ctx.body = question;
    }

    async checkQuestionExist(ctx, next) {
        if (isValidObjectId(ctx.params.id)) {
            const question = await Questions.findById(ctx.params.id).select('+questioner');
            if (!question) { ctx.throw(404, '问题不存在') };
            ctx.state.question = question;
            await next();
        } else {
            ctx.throw(404, '问题不存在')
        }
    }

    async delete(ctx) {
        const question = await Questions.findByIdAndRemove(ctx.params.id);
        if (!user) {
            ctx.throw(404, '问题不存在')
        }
        ctx.status = 204;
    }
}

module.exports = new questionsCtl();