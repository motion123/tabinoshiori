/**
 * Created by tomino on 18/05/06.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var mongoosePaginate = require('mongoose-paginate');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var BookmarkSchema = new Schema({
        title: {
            type: String,
            required: [true, 'タイトルを入力してください'],
            maxlength:[100, 'タイトルが長すぎです']
        },
        description:{
            type:String,
            maxlength:[5000, '説明文が長すぎです']
        },
        user: {
            type: Schema.Types.ObjectId,
            required: [true, 'ユーザーIDが必要です'],
            ref: 'User'
        },
        otherUser:[{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        trip_info:[{
            type: Schema.Types.ObjectId,
            ref: 'Info'
        }],
        thumbnail: {
            type: mongoose.SchemaTypes.Url,
        },
        favorite: {
            type: Number,
            default: 0
        },
        comment: {
            type:Schema.Types.ObjectId, ref: 'Comment'
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

BookmarkSchema.statics.increment = function(id, done) {
    return this.collection.findOneAndUpdate({
        _id: id
    }, {
        $inc: { favorite: 1 }
    }, {
        new: true,
        upsert: false
    }, function(err, data) {
        done(null, data);
    });
};

BookmarkSchema.statics.addThumbnail = function(id,url, done) {
    return this.collection.update({
        _id: mongoose.Types.ObjectId(id),
    }, {
        $set: { thumbnail: url }
    },{
        new:true,
    },function(err, data) {
        done(err, data);
        console.log(data);
        console.log(err);
    });
};


BookmarkSchema.index({created_at: -1});
BookmarkSchema.index({favorite: -1});
BookmarkSchema.index({user: 1});

BookmarkSchema.plugin(uniqueValidator);

BookmarkSchema.plugin(mongoosePaginate,{message: '登録済みの動画です。'});

module.exports = mongoose.model('Bookmark', BookmarkSchema);