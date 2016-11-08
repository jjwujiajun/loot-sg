$(document).ready(function(){ 
	$("#putBomInput").focus();
	
    $("#backToTop").on("click", function() {
    	$("body").animate({ scrollTop: '0'});
    	$("#putBomInput").focus();
    });
});