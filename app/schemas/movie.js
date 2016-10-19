var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MovieSchema = new Schema({
	title:String,
	director:String,
	country:String,
	language:String,
	flash:String,
	poster:String,
	summary:String,
	year:Number,
	pv:{
		type:Number,
		default:0
	},
	category:{
		type:Schema.Types.ObjectId,
		ref:'Category'
	},
	meta: {
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updateAt: {
        type: Date,
        default: Date.now()
    }
	}
});

MovieSchema.pre('save', function(next){
	if (this.isNew) {
		this.meta.createdAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
});

//静态方法
MovieSchema.statics = {
	fetch : function(cb) {
		return this
		.find({})
		.sort('meta.updateAt')
		.exec(cb);
	},
	findById: function(id, cb){	
		return this.findOne({_id:id}).exec(cb);
	}
};

module.exports = MovieSchema;