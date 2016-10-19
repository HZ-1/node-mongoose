var express = require('express');
//cookie-parser与express-session是结合起来用的
var cookieParser = require('cookie-parser');
//express-session依赖于cookie-parser；用于处理会话过程保存登录的状态
var session = require('express-session');
//connect-mongo是一个中间件，用于持久化session，保存登录状态
var mongoStore = require('connect-mongo')(session);

var morgan = require('morgan'); // HTTP request logger middleware for node.js
var path = require('path');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var port = process.env.PORT || 3000;
var app = express();
var fs = require('fs');
var dbUrl = 'mongodb://localhost:27017/movies';
var compression = require('compression');

mongoose.connect(dbUrl); //连接数据库

// models loading
var models_path = __dirname + '/app/models';
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file;
      var stat = fs.statSync(newPath);

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath);
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath);
      }
    });
};
walk(models_path);

app.set('views', './app/views/pages');
app.set('view engine', 'jade');
app.use(cookieParser());

//用于持久化session，保存登录状态
app.use(session({
  secret: 'ethan',
  /*cookie:{
  	maxAge: 1000 * 60 * 60 * 24 * 1, //默认1天
  	domain:'/'
  },*/
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  }),
  resave: false,
  saveUninitialized: true
}));
app.use(compression()); //启用gzip压缩
app.use(express.static(path.join(__dirname, 'public')));//有这个后，在html中写静态文件，如img(src="/avatar/1476094750693.png")就会加载，
//注意的是这里的的/avatar/1476094750693.png不是绝对路径，而是与public拼接的路径
app.use(require('body-parser').urlencoded({ extended: true }));
app.locals.moment = require('moment');
app.listen(port);

//app.get('env')拿到环境变量
if ('development' === app.get('env')) {//如果当前环境是development（开发环境的话）
  app.set('showStackError', true);//设置在控制台或者屏幕中将错误打印出来
  app.use(morgan(':method :url :status'));//设置在控制台中以 GET /admin/user/list 304这种方式打印错误
  app.locals.pretty = true;//设为true，页面控制台，Sources中该页面的代码将不会是压缩过的
 // mongoose.set('debug', true);// mongoose的debug开关，在此也可关闭，true的话会打印这样：Mongoose: users.find({}, { sort: { 'meta.updateAt': 1 }, fields: undefined })

}
//引入路由模块
require('./config/routes')(app);
console.log('server is listening port' + port + '!');
