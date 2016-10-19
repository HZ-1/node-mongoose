//用户管理-查看、删除用户
;$(function(){
	$('#user-list').on('click','.del', function(){
		var that = $(this);
		if (that.hasClass('del')) { //删除
			if (confirm('删除用户后将不可恢复，确定删除吗？')){
				var uid = $(this).data('id');
				var tr = $('#item-id-' + uid);
				$.ajax({
					url:'/admin/user/list?id='+uid,
					type:'DELETE',
					success:function(res){
						if (res.success === 1) {
							tr.remove();
						} else {
							alert('删除时发生错误，请稍后再试！');
						}
					}
				});
			}
		} else if(that.hasClass('.edit')) { //编辑
			
		}	
	});
	

});