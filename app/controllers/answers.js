const Answer = require('../models/answers');
const { isValidObjectId } = require('mongoose');

class answersCtl {
    async find(ctx) {
        const { q, page = 1, per_page = 10 } = ctx.query;
        const pageSize = Math.max(page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const keyword = new RegExp(q);
        // 分页功能
        ctx.body = await Answer.find({ content: keyword, questionId: ctx.params.questionId }).limit(perPage).skip(pageSize * perPage);
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer');

        if (!answer) { ctx.throw(404, '答案不存在') };
        ctx.body = answer;
    }

    async checkAnswerer(ctx, next) {
        const { answer } = ctx.state;
        if (answer.answerer.toString() !== ctx.state.user._id) {
            ctx.throw(402, '没有权限操作');
        }
        await next()
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true }
        })
        const { questionId } = ctx.params;
        const { _id: answerer } = ctx.state.user;
        const answer = await new Answer({ ...ctx.request.body, answerer, questionId }).save();
        ctx.body = answer;
    }

    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        await ctx.state.answer.updateOne(ctx.request.body)
        const answer = await Answer.findById(ctx.params.id);
        ctx.body = answer;
    }

    async checkAnswerExist(ctx, next) {
        const { id, questionId } = ctx.params;
        if (isValidObjectId(id)) {
            const answer = await Answer.findById(id).select('+answerer');
            if (!answer) { ctx.throw(404, '答案不存在') };
            // 只有在删改查答案时检查此逻辑，赞踩不检查
            if (questionId && answer.questionId !== questionId) { ctx.throw(404, '该问题下答案不存在') }
            ctx.state.answer = answer;
            await next();
        } else {
            ctx.throw(404, '答案不存在')
        }
    }

    async delete(ctx) {
        const answer = await Answer.findByIdAndRemove(ctx.params.id);
        if (!answer) {
            ctx.throw(404, '答案不存在')
        }
        ctx.status = 204;
    }
}

module.exports = new answersCtl();