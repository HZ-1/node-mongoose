var Index = require('../app/controllers/index');
var Movie = require('../app/controllers/movie');
var Comment = require('../app/controllers/comment');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();//用于处理表单多文件上传
var Category = require('../app/controllers/category');
var User = require('../app/controllers/user');

module.exports = function(app) {

  app.use(function(req, res, next) {//这个是为了给app预赋值user，让你登录每个页面的时候都会取到session中的user值
  	var _user = req.session.user;
    app.locals.user = _user;
	  next();

  });

  //index page
  app.get('/', Index.index);

  //Movie Controller
  // 后台录入页
  app.get('/admin/movie/new', User.signinRequired, User.movieAdminRequired, Movie.new);
  app.post('/admin/movie',multipartMiddleware, User.signinRequired, User.movieAdminRequired, Movie.savePoster, Movie.save);
  app.get('/admin/update/:id', User.signinRequired, User.movieAdminRequired, Movie.update);
  // 列表页
  app.get('/admin/movie/list', User.signinRequired, User.movieAdminRequired, Movie.list);
  app.delete('/admin/movie/list', User.signinRequired, User.movieAdminRequired,  Movie.del);
  app.get('/movie/:id', Movie.detail);

  //User Controller
  app.post('/user/signup', multipartMiddleware,User.saveAvatar, User.signup); //注册
  app.post('/user/login', User.login);
  app.get('/signin', User.showSignin);
  app.get('/signup', User.showSignup);
  app.get('/logout', User.logout);//会跳转到登录页面

//这种get()中有多个参数，这些用到的是中间件的用法，在每个中间件方法中用到了next方法，用于走到下一个中间件方法；
// 如果没有这个next方法，程序将在该中间件中终止执行
  app.get('/admin/user/list', User.signinRequired, User.userAdminRequired, User.list);
  app.delete('/admin/user/list', User.signinRequired, User.userAdminRequired,  User.del);

  //Comment Controller
  app.post('/user/comment', User.signinRequired, Comment.save);

  //Category controller
  app.get('/admin/category/new', User.signinRequired, User.movieAdminRequired, Category.new);
  app.post('/admin/category', User.signinRequired, User.movieAdminRequired, Category.save);
  app.get('/admin/categorylist', User.signinRequired, User.movieAdminRequired,  Category.list);

  //Serch
  app.get('/results', Index.search);
};
