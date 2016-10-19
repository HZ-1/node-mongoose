var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name: String,
	movies: [{type:Schema.Types.ObjectId, ref:"Movie"}],
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});

CategorySchema.statics = {
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

CategorySchema.pre('save', function(next){
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
});
module.exports = CategorySchema;