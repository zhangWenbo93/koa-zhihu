const Comment = require('../models/comments');
const { isValidObjectId } = require('mongoose');

class commentsCtl {
    async find(ctx) {
        const { q, page = 1, per_page = 10 } = ctx.query;
        const pageSize = Math.max(page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const keyword = new RegExp(q);
        const { rootCommentId } = ctx.query;
        const { questionId, answerId } = ctx.params;
        // 分页功能
        ctx.body = await Comment.find({ content: keyword, questionId, answerId, rootCommentId }).limit(perPage).skip(pageSize * perPage).populate('commentator replyTo');
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator');

        if (!comment) { ctx.throw(404, '评论不存在') };
        ctx.body = comment;
    }

    async checkCommentator(ctx, next) {
        const { comment } = ctx.state;
        if (comment.commentator.toString() !== ctx.state.user._id) {
            ctx.throw(402, '没有权限操作');
        }
        await next()
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            rootCommentId: { type: 'string', required: false },
            replyTo: { type: 'string', required: false }
        })
        const { questionId, answerId } = ctx.params;
        const { _id: commentator } = ctx.state.user;
        if (commentator === ctx.request.body.replyTo) { ctx.throw(402, '自己不能评论自己的评论') };
        const comment = await new Comment({ ...ctx.request.body, commentator, questionId, answerId }).save();
        ctx.body = comment;
    }

    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        const { content } = ctx.request.body;
        await ctx.state.comment.updateOne({ content })
        const comment = await Comment.findById(ctx.params.id);
        ctx.body = comment;
    }

    async checkCommentExist(ctx, next) {
        const { id, questionId, answerId } = ctx.params;
        if (isValidObjectId(id)) {
            const comment = await Comment.findById(id).select('+commentator');
            if (!comment) { ctx.throw(404, '评论不存在') };
            // 只有在删改查答案时检查此逻辑，赞踩不检查
            if (questionId && comment.questionId !== questionId) { ctx.throw(404, '该问题下评论不存在') }
            if (answerId && comment.answerId !== answerId) { ctx.throw(404, '该答案下评论不存在') }
            ctx.state.comment = comment;
            await next();
        } else {
            ctx.throw(404, '评论不存在')
        }
    }

    async delete(ctx) {
        const comment = await Comment.findByIdAndRemove(ctx.params.id);
        if (!comment) {
            ctx.throw(404, '评论不存在')
        }
        ctx.status = 204;
    }
}

module.exports = new commentsCtl();