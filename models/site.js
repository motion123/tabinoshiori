/**
 * Created by tomino on 18/05/06.
 */
var mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-type-url');
var mongoosePaginate = require('mongoose-paginate');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var SiteInfoSchema = new Schema({
        site_name: {
            type: String,
            required: [true, '場所の名前を入力して下さい。'],
            maxlength:[100, '名前がながすぎです。']
        },
        thumbnail: {
            type: mongoose.SchemaTypes.Url
        },
        location:{
              type:[Number,Number],
              required:[true, '場所が指定されていません']
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

SiteInfoSchema.statics.increment = function(id, done) {
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

SiteInfoSchema.index({created_at: -1});
SiteInfoSchema.index({site_name: 1});

SiteInfoSchema.plugin(uniqueValidator);

SiteInfoSchema.plugin(mongoosePaginate,{message: '登録済みの場所です。'});

module.exports = mongoose.model('Site', SiteInfoSchema);