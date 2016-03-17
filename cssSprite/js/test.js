(function(){
var $thisScript = $('script:last');
console.log($thisScript.attr('src'));
})()

var arr = [1,2,3,4,5];
/*
for (var i = 0; i < arr.length; i++) {
	!function(){

		var file = arr[i];

		setTimeout(function(){
			console.log(file);
		},i);

	}();
};
*/

for (var i = 0; i < arr.length; i++) {

	var file = arr[i];

	setTimeout((function(){

		var file = arr[i];

		return function(){
			console.log(file);
		}
	})(),i);

};