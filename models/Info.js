/**
 * Created by tomino on 18/05/07.
 */

var mongoose = require('mongoose');
require('mongoose-type-email');
var mongoosePaginate = require('mongoose-paginate');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var InfoSchema = new Schema({
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'ユーザーIDがありません']
        },
        location: {
            type: Schema.Types.ObjectId,
            ref: "Site"
        },
        description:{
            type: String,
            required: [true, '旅の情報がありません']
        }
    },
    {
        timestamps:
            {
                createdAt: 'created_at' ,
                updatedAt: 'updated_at'
            }
    }
);

InfoSchema.index({location: 1});
InfoSchema.index({user:1});
InfoSchema.index({created_at: -1});

InfoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Info', InfoSchema);
