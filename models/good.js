/**
 * Created by tomino on 18/05/17.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
var mongoosePaginate = require('mongoose-paginate');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var GoodSchema = new Schema({
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'ユーザーIDがありません']
        },
        bookmark: {
            type: Schema.Types.ObjectId,
            ref: 'Bookmark',
            required: [true, 'しおりIDがありません']
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

GoodSchema.index({user:1,bookmark: 1});
GoodSchema.index({user:1});
GoodSchema.index({bookmark:1});
GoodSchema.index({created_at: -1});

GoodSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Good', GoodSchema);
