var mongoose = require('mongoose');
var Comment = require('../models/comment');

//save comment
exports.save = function (req, res) {
  	var _comment = req.body.comment;
  	var movieId = _comment.movie;
//因为cid是js文件动态增加的，在不是回复的情况下，不存在这个cid属性
  	if (_comment.cid) {//如果存在cid，说明是回复
  		Comment.findById(_comment.cid, function(err, comment) {
  			var reply = {
  				from:_comment.from,
  				to:_comment.tid,
  				content:_comment.content
  			};

  			comment.reply.push(reply);
  			comment.save(function(err, comment){
  				if (err) {
	          console.log(err);
	        }

	        res.redirect('/movie/' + movieId);
  			});
  		});
  	} else {//如果不存在cid，说明是简单的评论
  		var comment = new Comment(_comment);
	  	comment.save(function(err, comment) {
	  		if (err) {
	  			console.log(err);
	  		}
	  		res.redirect('/movie/'+movieId);
	  	});
  	}
  	
};