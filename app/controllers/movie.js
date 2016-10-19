var Movie = require('../models/movie');
var Comment = require('../models/comment');
var Category = require('../models/category');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

//admin page
exports.new = function(req, res) {
  Category.find({}, function(err, categories) {
    res.render('admin', {
      title: '后台录入',
      categories: categories,
      movie: {}
    });
  });
};
//admin save poster将海报存储到数据库中
exports.savePoster =function(req, res, next) {
  var postData = req.files.uploadPoster;//获取图片数据
  var filePath = postData.path;//获取图片的地址
  var fileName = postData.originalFilename;//获取图片的初始地址

  if (fileName) {//如果原来有初始地址了，说明图片输入框原先不是空的，而是有图片地址，此时要现在的地址覆盖初始地址
    fs.readFile(filePath, function(err, data) {
      var timeStamp = Date.now();
      var type = postData.type.split('/')[1];
      var poster = timeStamp + '.' + type;
      var newPath = path.join(__dirname, '../../','/public/upload/' + poster);

      fs.writeFile(newPath, data, function(err) {
        req.poster = poster;
        next();
      });
    });
  } else {
    next();
  }
};


//admin post new
exports.save = function(req, res) {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var categoryId = movieObj.category;
    var categoryName = movieObj.categoryName; //添加了一个自定义分类，若同时选择radio和自定义分类以radio为准

    var _movie;

    if (req.poster) {
      console.log('自行上传海报！');
      movieObj.poster = req.poster;
    }

    if (id) { //Update movie
      Movie.findById(id, function(err, movie) {
          if (err) {
            console.log(err);
          }
          //有category字段且变更了分类
          if (categoryId && movie.category && (categoryId !== movie.category.toString())) { //更新时变更了分类
            //删除category中的movieid
            Category.update({ _id: movie.category }, { $pullAll: { movies: [id] } }, function(err, cate) {
              if (err) {
                console.log(err);
              }

              //更新movie
              _movie = _.extend(movie, movieObj);
              _movie.save(function(err, movie) {
                if (err) {
                  console.log(err);
                }
                //新分类push movie id
                Category.findById(categoryId, function(err, category) {
                  if (err) {
                    console.log(err);
                  }
                  category.movies.push(movie._id);
                  category.save(function(err, category) {
                    if (err) {
                      console.log(err);
                    }
                    res.redirect("/movie/" + movie._id);
                  });
                });
              });

            });
          } else if (categoryId && !movie.category) { //无category字段，做数据兼容
              _movie = _.extend(movie, movieObj);
              _movie.save(function(err, movie) { //这里只更新movie字段
                if (err) {
                  console.log(err);
                }
                Category.findById(categoryId, function(err, category) {
                  if (err) {
                    console.log(err);
                  }
                  category.movies.push(movie._id);
                  category.save(function(err, category) {
                    if (err) {
                      console.log(err);
                    }
                    res.redirect("/movie/" + movie._id);
                  });
                });
              });
            } else if (categoryName) { //更新时添加新的分类
              var category = new Category({
                name: categoryName,
                movies: movie._id
              });

              category.save(function(err, cate) { //新增分类
                if (err) {
                  console.log(err);
                }
                movie.category = cate._id;
                movie.save(function(err, movie) {
                  if (err) {
                    console.log(err);
                  }
                  res.redirect("/movie/" + movie._id);
                });
              });
            } else { //更改了其它信息
              _movie = _.extend(movie, movieObj);
              _movie.save(function(err, movie) {
                if (err) {
                  console.log(err);
                }
                res.redirect("/movie/" + movie._id);
              });
            }
          });
      }
      else { //new add
        _movie = new Movie(movieObj);

        _movie.save(function(err, movie) {
          if (err) {
            console.log(err);
          }

          if (categoryId) {
            Category.findById(categoryId, function(err, category) {
              category.movies.push(movie._id);
              console.log(category);
              category.save(function(err, category) {
                res.redirect('/movie/' + movie._id);
              });
            });
          } else if (categoryName) {
            var category = new Category({
              name: categoryName,
              movies: [movie._id]
            });
            category.save(function(err, category) { //保存自定义分类到电影中
              movie.category = category._id;
              movie.save(function(err, movie) {
                res.redirect('/movie/' + movie._id);
              });
            });
          }


        });
      }
    };

    //admin update movie
    exports.update = function(req, res) {
      var id = req.params.id;
      if (id) {
        Movie.findById(id, function(err, movie) {
          Category.find({}, function(err, categories) {
            res.render('admin', {
              title: '更新电影',
              categories: categories,
              movie: movie
            });
          });

        });
      }
    };

    //list page
    exports.list = function(req, res) {
      Movie.find()
        .populate('category', 'name')
        .exec(function(err, movies) {
          if (err) {
            console.log(err);
          }
          res.render('list', {
            title: '电影管理',
            movies: movies
          });
        });
    };

    //admin list delete
    exports.del = function(req, res) {
      var id = req.query.id;
      if (id) {
        Movie.remove({ _id: id }, function(err, movie) {
          if (err) {
            console.log(err);
          } else {
            res.json({ success: 1 });
          }
        });
      }
    };

    //detail page
    exports.detail = function(req, res) {
      var id = req.params.id;
      if (id) {
        Movie.update({_id:id}, {$inc:{pv:1}}, function(err) {//增加查看统计功能，{$inc:{pv:1}}每次增长1
          if (err) console.log(err);
        });
        Movie.findById(id, function(err, movie) {
          Comment.find({ movie: id })//根据{movie: id}查找对应comment数据
            .populate("from", "name avatar")//映射from，根据form生成一个name
            .populate('reply.from reply.to', 'name avatar')
            .exec(function(err, comments) {
              console.log(comments);
              if (err) {
                console.log(err);
              }
              res.render('detail', {
                title: '电影' + movie.title + '详情',
                movie: movie,
                comments: comments
              });
            });
        });
      } else {
        res.redirect('/');
      }
    };
