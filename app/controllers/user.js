var mongoose = require('mongoose');
var User = require('../models/user');
var fs = require('fs');
var path = require('path');
//signup

exports.showSignup = function (req, res) {
  res.render('signup', {
    'title' : '用户注册'
  });
};

//如果用户有上传头像
exports.saveAvatar = function(req, res, next){

  console.log("req.files.avatar大师傅蓝",req.files.avatar)
  console.log("req.files.avatar.path大师傅蓝",req.files.avatar.path)

  var postData = req.files.avatar;
  var filePath = postData.path;
  var fileName = postData.originalFilename;

  if (fileName) {
    fs.readFile(filePath, function(err, data) {
      console.log("如果用户有上传头像",data)
      var timeStamp = Date.now();
      var type = postData.type.split('/')[1];//png
      var avatar = timeStamp + '.' + type;//1475687242337.png
      var newPath = path.join(__dirname, '../../','/public/avatar/' + avatar);//存放图片地址

      fs.writeFile(newPath, data, function(err) {
        req.avatar = avatar;
        next();
      });
    });
  } else {
    next();
  }
};
//用户注册
exports.signup = function(req, res) {
  var _user = req.body.user;
  if (req.avatar) {
    _user.avatar = req.avatar;
  }
  console.log('用户注册');
  console.log(_user);
  User.findOne({ name: _user.name }, function(err, user) {

    if (err) {
      console.log(err);
    } else {
      if (user) {//如果该用户已经注册，直接返回到登录页面
        res.redirect('/signin');
      } else {//如果该用户没有注册，那么生成新用户数据，存储数据后，返回到登录页面

        var userObj = new User(_user)
        userObj.save(function(err, user) {
          if (user) {
            res.redirect('/signin');
          }
        });
      }
    }
  });
};

//login page
exports.showSignin = function (req, res) {
  res.render('signin', {
    'title' : '用户登录'
  });
};

//login
exports.login = function(req, res) {
  var _user = req.body.user;
  var name = _user.name;
  var pass = _user.password;

  User.findOne({ name: name }, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (!user) {
      res.redirect('/signup');
    } else {
      //comparePass这个方法是app/schemas/user.js中的UserSchema.methods的方法，也就是实例方法
      user.comparePass(pass, function(err, isMatch) {
        if (err) {
          console.log(err);
        }
        if (isMatch) {
          req.session.user = user;
          console.log('登录成功！');
          return res.redirect('/');
        } else {
          console.log("密码不正确");
          res.redirect('/signin');
          // res.send('密码不正确！');
        }
      });
    }
  });
};

//logout
exports.logout = function(req, res) {
  delete req.session.user;
  res.redirect('/signin');
};

//user eidt
exports.save = function(req, res) {
  /*var user = req.body.user;
  var uid = req.body.user._id;
  User.findById({_id:},)*/
  //var _user = $.extend()

};
//userlist
exports.list = function(req, res) {
  User.fetch(function(err, users) {
    //console.log(users);
    if (err) {
      console.log(err);
    }
    res.render('userlist', {
      title: '用户列表',
      users: users
    });
  });
};

//user delete
exports.del = function(req, res) {
  var id = req.query.id;
  if (id) {
    User.remove({ _id: id }, function(err, user) {
      if (err) {
        console.log(err);
        res.json({success: 0});
      } else {
        res.json({ success: 1 });
      }
    });
  }
};

//middleware
exports.signinRequired = function(req, res, next) {
  var _user = req.session.user;
  console.log('当前用户');
  console.log(_user);
  if(!_user) {
    return res.redirect('/signin');
  }
  next();
};

//user admin verify
exports.userAdminRequired = function(req, res, next) {
  var _user = req.session.user;
  if ((_user.role >= 20) || (_user.role > 5 && _user.role <= 10)) {
    next();
  } else {
    return res.send('权限不足！');
  }
};

//movie admin verify
exports.movieAdminRequired = function(req, res, next) {
  var _user = req.session.user;
  if ( (_user.role >= 20) || (_user.role > 10 && _user.role <=15)) {
    next();  
  } else {
    return res.send('哇哦，权限不足哦！');
  }
};
//middleware
/*exports.adminRequired = function(req, res, next) {
  var _user = req.session.user;
  if (_user.role < 20) {
    return res.send('权限不足！');
  }
  next();
};*/
