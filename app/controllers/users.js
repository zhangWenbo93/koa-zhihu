const jwt = require('jsonwebtoken');
const User = require('../models/users');
const { secret } = require('../config');
const { isValidObjectId } = require('mongoose');

class UsersCtl {
    async find(ctx) {
        const { q, page = 1, per_page = 10 } = ctx.query;
        const pageSize = Math.max(page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        ctx.body = await User.find({ name: new RegExp(q) }).limit(perPage).skip(pageSize * perPage);
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if (f === 'employments') {
                return 'employments.company employments.job'
            }
            if (f === 'educations') {
                return 'educations.school educations.major'
            }
            return f
        }).join(' ');
        const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr);

        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = {
            user
        }
    }

    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({ name });
        if (repeatedUser) { ctx.throw(409, '该用户已存在') };
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }

    // 校验是否为当前登录用户
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) { ctx.throw(403, '没有权限') };
        await next();
    }

    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            business: { type: 'string', required: false },
            employments: { type: 'array', itemType: 'object', required: false },
            educations: { type: 'array', itemType: 'object', required: false }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = await User.findById(ctx.params.id);
    }

    async delete(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.status = 204;
    }

    async login(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const user = await User.findOne(ctx.request.body);
        if (!user) { ctx.throw(401, '用户名或密码不正确') };
        const { _id, name } = user;
        const token = jwt.sign({ _id, name }, secret, { expiresIn: '1d' });
        ctx.body = { token };
    }

    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        if (!user) { ctx.throw(404, '用户不存在') };
        ctx.body = user.following;
    }

    async listFollowers(ctx) {
        const user = await User.find({ following: ctx.params.id });
        ctx.body = user;
    }

    async checkUserExist(ctx, next) {
        if (isValidObjectId(ctx.params.id)) {
            const user = await User.findById(ctx.params.id);
            if (!user) { ctx.throw(404, '用户不存在') };
            await next();
        } else {
            ctx.throw(404, '用户不存在')
        }
    }

    async follow(ctx) {
        const id = ctx.params.id;
        const me = await User.findById(ctx.state.user._id).select('+following');
        if (!me.following.map(id => id.toString()).includes(id)) {
            me.following.push(id);
            me.save();
        }
        ctx.status = 204
    }

    async unfollow(ctx) {
        const paramsId = ctx.params.id;
        const me = await User.findById(ctx.state.user._id).select('+following');

        me.following.map((id, index) => {
            if (id.toString() === paramsId) {
                me.following.splice(index, 1);
                me.save();
            }
        })

        ctx.status = 204
    }

    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
        if (!user) { ctx.throw(404, '用户不存在') };
        ctx.body = user.followingTopics;
    }

    async followTopic(ctx) {
        const id = ctx.params.id;
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        if (!me.followingTopics.map(id => id.toString()).includes(id)) {
            me.followingTopics.push(id);
            me.save();
        }
        ctx.status = 204
    }

    async unfollowTopic(ctx) {
        const paramsId = ctx.params.id;
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');

        me.followingTopics.map((id, index) => {
            console.log();
            if (id.toString() === paramsId) {
                me.followingTopics.splice(index, 1);
                me.save();
            }
        })

        ctx.status = 204
    }
}

module.exports = new UsersCtl();