var mongoose = require('mongoose');
//bcrypt密码加密
var bcrypt = require('bcrypt-nodejs');
var SALT_STRNGTH = 10;
var UserSchema = new mongoose.Schema({
	name:{
		unique:true,
		type: String
	},
	//这个是用户头像
	avatar: {
		type:String,
		default:'/avatar/default.png',
	},
	//0-5 normal user
	//6-10 user admin
	//11-15 movie admin & user admin
	//20以上 super admin
	role: {
		type:Number,
		default:0
	},
	password: String,
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

UserSchema.pre('save', function(next){
	var user = this;
	if (this.isNew) {
		this.meta.createdAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}

	//随机salt及密码加密
	//先生成一个随机的盐，然后将密码和盐进行混合加密，就拿到最终要存储的密码
	//SALT_STRNGTH是密码计算强度，越大，破解密码越难，默认是10
	//salt盐
	bcrypt.genSalt(SALT_STRNGTH, function(err, salt){
		if (err) return next(err);

		//salt上一个生成的盐
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) return next(err);
			user.password = hash;
			next();
		});
	});
	
});

//实例方法
UserSchema.methods = {
	comparePass: function(pass, cb) {
		bcrypt.compare(pass, this.password, function(err, isMatch) {
			if (err) {
				return cb(err);
			}
			cb(null, isMatch);
		});
	}
};

//静态方法
UserSchema.statics = {
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

module.exports = UserSchema;