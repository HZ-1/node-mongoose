$(function(){
	$('.del').click(function(e){
		var self = $(this);
		var id = self.data('id');
		var tr = $('#item-id-' + id);

		if (confirm('删除后将不可恢复，确定删除吗？')) {
			$.ajax({
				url :'/admin/movie/list?id='+id,
				type:'DELETE'
			})
			.done(function(results){
				if (results.success === 1) {
					if (tr.length) {
						tr.remove();
					}
				}
			});
		}
	});

	$('#douban').blur(function(){
		var movieId  = $(this).val();
		if (movieId) {
			$.ajax({
				url:'https://api.douban.com/v2/movie/subject/'+ movieId,
				type:'get',
				dataType:'jsonp',
				crossDomain:true,
				success:function(data) {
					$('#inputTitle').val(data.title);
					$('#inputDirector').val(data.directors[0].name);
					$('#inputCountry').val(data.countries.join('/'));
					$('#inputPoster').val(data.images.large);
					$('#inputSummary').val(data.summary);
					$('#inputYear').val(data.year);
				}
			});
		}
	});
});