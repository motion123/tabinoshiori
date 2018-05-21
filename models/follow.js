/**
 * Created by tomihei on 17/04/04.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
var mongoosePaginate = require('mongoose-paginate');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var FollowSchema = new Schema({
		followee: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'フォローユーザーIDがありません']
		},
		follower: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'フォロワーユーザーIDがありません']
		},
	},
	{
		timestamps:
		{
			createdAt: 'created_at' ,
			updatedAt: 'updated_at'
		}
	}
);

FollowSchema.index({followee:1,follower: 1});
FollowSchema.index({followee:1});
FollowSchema.index({follower:1});
FollowSchema.index({created_at: -1});

FollowSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Follow', FollowSchema);
