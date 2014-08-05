$(document).ready(function(){
	
	$("#start").on("click", function(){
		var x = $("#x").val();
		var y = $("#y").val();
		makeTable(x,y);
	});
	
	$("#table").on("click", ".gameTd", function(){
		if( $(this).hasClass("current")){
			alert("여긴아니야"); 
			return;
		}
		var xData = $(this).attr("xData");
		var yData = $(this).attr("yData");
		
		check(xData,yData,$(this));
	
	})
	
});

function makeTable(x,y){

	var x = parseInt(x);
	var y = parseInt(y);
	var table = $("#table").children("*").remove().end();
	
	//시작 두더지;
	var startX =Math.floor(Math.random() * x) + 1;
	var startY =Math.floor(Math.random() * y) + 1;

	console.log(startX +"-="+ startY);
	
	//테이블그리기;
	for(var j=1 ; j<y+1 ; j++){
		var tr = $("<tr>");
		for(var i=1 ; i< x+1 ; i++){
			if(i ==startX && j== startY){
			var td = tr.append($("<td class='gameTd current'>").attr("xData", i).attr("yData", j));
			console.log(i+"=" + j);
			}else{
			var td = tr.append($("<td class='gameTd'>").attr("xData", i).attr("yData", j));
			}
		}
		table.append(tr);
	}
};

function check(xData,yData,thisCell){
	console.log("check().......");
	var xData = parseInt(xData);
	var yData = parseInt(yData);
	var curX = parseInt($(".current").attr("xData"));
	var curY = parseInt($(".current").attr("yData"));
	console.log( "클릭" + xData +",,,,,,"+ yData);
	console.log( "두더지" + curX +",,,,,,"+ curY);
	
	if(xData+1 == curX && yData == curY ){
		change(thisCell);
	}else if(xData-1 == curX && yData == curY ){
		change(thisCell);
	}else if(xData == curX && yData+1 == curY ){
		change(thisCell);
	}else if(xData == curX && yData-1 == curY ){
		change(thisCell);
	}else{
		alert("잘못된클릭");
	}
};

function change(thisCell){
	$(".current").removeClass("current");
	thisCell.addClass("current");
}