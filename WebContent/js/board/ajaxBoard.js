/**
 * 게시판 호출
 */
(function($) {
	var $element = new Array();	// 게시판 대상 저장
	
	$.fn.ajaxBoard = function(userOption) {
		var targetSavePoint = $element.length;
		userOption.targetSavePoint = targetSavePoint;
		$element[targetSavePoint] = $(this);	// 저장 대상을 배열에 저장한다.

		var options = $.extend($.fn.ajaxBoard.defaults, $.fn.ajaxBoard.userOprion, userOption);	// 사용자 옵션과 기본 옵션을 하나로 합친다.

		drowBoard(options);
	};
	
	$.fn.ajaxBoard.userOprion = {	// 게시판의 사용자 옵션
			boardName		: ''			// 게시판명
			, currentPage	: 1				// 현재 페이지
			, blockCount	: 10			// 한 페이지의  게시물의 수
			, blockPage		: 10			// 한 화면에 보여줄 페이지 수
			, paging		: 'number'		// number, scroll, no 옵션
	};
	
	$.fn.ajaxBoard.defaults = {	// 게시판의 기본 옵션
			totalCount	: 0		// 전체 로우수
			, startRow : 0		// 시작 rownumber
			, drowMode : 'L'	// 변경 이벤트 화면(C:create, R:retrieve, U:update, D:delete, L:List)
			, boardNo : 0		// 게시물 번호(pk)
	};
	
	// 필요한 부분만 데이터를 새로 만든다.
	drowBoard = function(options){
		var board = "";

		if(options.drowMode == 'L'){
			board += drowBoardList(options, callAjaxBoard(options));
		}else if(options.drowMode == 'C'){
			board += drowBoardCUDetail(options, '');
		}else if(options.drowMode == 'U'){
			board += drowBoardCUDetail(options, callBoardDetail(options));
		}else if(options.drowMode == 'R'){
			board += drowBoardRDDetail(options, callBoardDetail(options));
			board += drowBoardList(options, callAjaxBoard(options));
		}

		$element[options.targetSavePoint].html(board);
	};
	
	// 게시판 리스트 호출
	callAjaxBoard = function(options) {
		var url = options.boardName;
		options.startRow = (options.currentPage - 1) * options.blockCount;
		var returnResult = "";
		$.ajax({
			url: url,
			type: 'GET',
			data : options,
			async : false,
			datatype: 'json',
			success : function(result){
				returnResult = result;
			},
			error : function(){
				alert("에러가 발생하였습니다.");
			}
		});
		
		return returnResult;
	};
	
	// 게시판 사용자 옵션별 화면 그리기
	drowBoardList = function(options, result){
		var board = "<div style='text-align:center;'>";

		// 기본 게시판
		board += drowBoad(options, result);

		// 페이징 옵션(S)
		if(options.paging == "number"){
			board += numberPaging(options, result);
		}else if(options.paging == "scroll"){
			
		}
		// 페이징 옵션(E)
		
		board += "</div>";
		
		return board;
	};
	
	// 게시판 리스트
	drowBoad = function(options, result){
		var rownum = options.currentPage == 1 ? result.listBoardCount + 1 : result.listBoardCount - options.blockCount * (options.currentPage - 1) + 1;
		var listBoard = result.listBoard;

		var board = "<div id='writeBtnDiv" + options.targetSavePoint + "' class='col-xs-pull-12 text-right'>" +
				"<input type='button' name='write' class='btn btn-default' value='Write' " +
				"onclick='boardWrite(" + $.toJSON(options) + ")' /></div>";
		board += "<div>";
		board +=	"	<table class='table table-bordered'>";
		board +=	"	<colgroup>";
		board +=	"		<col width='5%'>";
		board +=	"		<col width='75%' >";
		board +=	"		<col width='10%' >";
		board +=	"		<col width='10%' >";
		board +=	"	</colgroup>";
		board +=	"	<tr>";
		board +=	"		<th class='text-center'>번호</th>";
		board +=	"		<th class='text-center'>제목</th>";
		board +=	"		<th class='text-center'>등록일</th>";
		board +=	"		<th class='text-center'>등록자</th>";
		board +=	"	</tr>";
		if(listBoard.length == 0){
			board += "<tr>";
			board += "	<td colspan='4' align='center'>등록된 게시물이 없습니다</td>";
			board += "</tr>";
		}else{
			for(var i = 0; i < listBoard.length; i++){
				board += "<tr>";
				board += "	<td class='text-center'>" + (rownum =rownum - 1) + "</td>";
				board += "	<td class='text-left'><a onclick='boardRead(" + $.toJSON(options) + "," + listBoard[i].boardNo + ")' style='cursor:pointer;'>" + listBoard[i].title + "</a></td>";
				board += "	<td class='text-center'>" + listBoard[i].regDate + "</td>";
				board += "	<td class='text-center'>" + listBoard[i].regUser + "</td>";
				board += "</tr>";
			}
		}
		board +=	"	</table>";
		board +=	"</div>";

		return board;
	};
	
	// 숫자 페이징
	numberPaging = function(options, result){
		var totalPage = Math.ceil(result.listBoardCount / options.blockCount);	// 전체페이지 수
		if (totalPage == 0) {
			totalPage = 1;
		}
		// 현재 페이지가 전체 페이지 수보다 크면 전체 페이지 수로 설정
		if (options.currentPage > options.totalPage) {
			options.currentPage = options.totalPage;
		}
		
		var startPage =  Math.floor((options.currentPage - 1) / options.blockPage) * options.blockPage + 1;
		var endPage = startPage + options.blockPage - 1;
		
		// 마지막 페이지가 전체 페이지 수보다 크면 전체 페이지 수로 설정
		if (endPage > totalPage) {
			endPage = totalPage;
		}
		
		var toJsonOption;
		var currentPage = options.currentPage;
		var paging =	"<div>";
		if (options.currentPage > options.blockPage) {
			options.currentPage = 1;
			toJsonOption = $.toJSON(options);
			paging +=	"<a onclick='drowBoard(" + toJsonOption + ");' style='cursor:pointer;'>처음</a>&nbsp;";
			
			options.currentPage = startPage - 1;
			toJsonOption = $.toJSON(options);
			paging +=	"<a onclick='drowBoard(" + toJsonOption + ");' style='cursor:pointer;'>이전</a>&nbsp;";
		}
		for (var i = startPage; i <= endPage; i++) {
			if (i > totalPage) {
				break;
			}
			if (i == currentPage) {
				paging +=	"<b>" + i + "</b>&nbsp";
			} else {
				options.currentPage = i;
				toJsonOption = $.toJSON(options);
				paging +=	"<a onclick='drowBoard(" + toJsonOption + ");' style='cursor:pointer;'>" + i + "</a>&nbsp;";
			}
		}
		if (totalPage - startPage >= options.blockPage) {
			options.currentPage = endPage + 1;
			toJsonOption = $.toJSON(options);
			paging +=	"<a onclick='drowBoard(" + toJsonOption + ");' style='cursor:pointer;'>다음</a>&nbsp;";
			
			options.currentPage = totalPage;
			toJsonOption = $.toJSON(options);
			paging +=	"<a onclick='drowBoard(" + toJsonOption + ");' style='cursor:pointer;'>끝</a>";
		}
		paging +=		"</div>";
		return paging;
	};
	
	/***********************************/
	
	// 게시판 세부화면(CRUD - C, U) 화면
	drowBoardCUDetail = function(options, result){
		var paramOptions =  $.toJSON(options);
		var detailInfo = {	// create, update 를 같이 사용하기 위해 초기화 해준다.
			title : ''
			, contents : ''
		};
		if(result != ''){
			detailInfo = result.retrieveMap;
		}
		
		var detail = "<div id='boardCUDiv" + options.targetSavePoint + "' style='padding: 0px 0 0 0;'>";
		detail 	  += "	<form id='boardForm" + options.targetSavePoint + "' name='board-form' class='form-horizontal'>";
		detail 	  += "		<div class='form-group'>";
		detail 	  += "			<label for='title' class='col-sm-1 control-label'>Title</label>";
		detail 	  += "			<div class='col-sm-11'>";
		detail 	  += "				<input type='text' class='form-control' name='title' value='" + detailInfo.title + "' />";
		detail 	  += "			</div>";
		detail 	  += "		</div>";
		detail 	  += "		<div class='form-group'>";
		detail 	  += "			<label for='Contents' class='col-sm-1 control-label'>Contents</label>";
		detail 	  += "			<div class='col-sm-11'>";
		detail 	  += "				<textarea class='form-control' name='contents' rows='5'>" +  detailInfo.contents + "</textarea>";
		detail 	  += "			</div>";
		detail 	  += "		</div>";
		detail 	  += "		<div class='form-group'>";
		detail 	  += "			<div class='col-sm-offset-1 col-sm-11 text-right'>";
		if(options.drowMode == "C"){
			detail 	  += "				<input type='button' name='save' class='btn btn-default' value='Save' onclick='boardSave(\"boardForm" + options.targetSavePoint + "\", " + paramOptions + ")' />";
			detail 	  += "				<input type='button' name='cancel' class='btn btn-default' value='Cancel' onclick='boardCancel(" + paramOptions + ")' />";
		}
		if(options.drowMode == "U"){
			detail 	  += "				<input type='button' name='save' class='btn btn-default' value='Save' onclick='boardModifySave(\"boardForm" + options.targetSavePoint + "\", " + paramOptions + ")' />";
			detail 	  += "				<input type='button' name='cancel' class='btn btn-default' value='Cancel' onclick='boardModifyCancel(" + paramOptions + ")' />";
		}
		detail 	  += "			</div>";
		detail 	  += "		</div>";
		detail 	  += "	</form>";
		detail 	  += "</div>";
		
		return detail;
	};
	
	// 게시판 세부화면(CRUD - R, D) 화면
	drowBoardRDDetail = function(options, result){
		var detailInfo = result.retrieveMap;

		var detail = "<div id='boardRDDiv" + options.targetSavePoint + "' style='padding: 0px 0 0 0;'>";
		detail 	  += "	<form id='boardForm" + options.targetSavePoint + "' name='board-form' class='form-horizontal'>";
		detail 	  += "		<div class='form-group'>";
		detail 	  += "			<label for='title' class='col-sm-1 control-label'>Title</label>";
		detail 	  += "			<div class='col-sm-11'><pre>";
		detail 	  += 				detailInfo.title;
		detail 	  += "			</pre></div>";
		detail 	  += "		</div>";
		detail 	  += "		<div class='form-group'>";
		detail 	  += "			<label for='Contents' class='col-sm-1 control-label'>Contents</label>";
		detail 	  += "			<div class='col-sm-11'><pre>";
		detail 	  += 				detailInfo.contents;
		detail 	  += "			</pre></div>";
		detail 	  += "		</div>";
		detail 	  += "		<div class='form-group'>";
		detail 	  += "			<div class='col-sm-offset-1 col-sm-11 text-right'>";
		detail 	  += "				<input type='button' name='modify' class='btn btn-default' value='Modify' onclick='boardModify(" + $.toJSON(options) + ")' />";
		detail 	  += "				<input type='button' name='delete' class='btn btn-default' value='Delete' onclick='boardDelete(" + $.toJSON(options) + ")' />";
		detail 	  += "			</div>";
		detail 	  += "		</div>";
		detail 	  += "	</form>";
		detail 	  += "</div>";
		
		return detail;
	};
	
	// 새글 작성
	boardWrite = function(options){
		options.drowMode = 'C';
		drowBoard(options);
	};
	
	// 게시판 저장
	boardSave = function(boardId, options){
		var url = options.boardName;
		
		$("#" + boardId).ajaxSubmit({
			url : url + "/create",
			data : options,
			type: "POST",
			dataType: "html",
			success: function(data) {
				alert("저장되었습니다.");
				options.currentPage = 1;
				options.drowMode = "L";
				drowBoard(options);
			},
			error : function(){
				alert("정보를 저장 하지 못했습니다.");
			}
		});
	};
	
	// 새글 취소
	boardCancel = function(options){
		options.currentPage = 1;
		options.drowMode = "L";
		drowBoard(options);
	};
	
	// 게시판 읽기
	boardRead = function(options, boardNo){
		options.boardNo = boardNo;
		options.drowMode = "R";
		
		drowBoard(options);
	};
	
	// 세부정보 call
	callBoardDetail = function(options){
		var url = options.boardName;
		var returnResult = "";
		
		$.ajax({
			url: url + "/retrieve",
			type: 'GET',
			data : options,
			async : false,
			datatype: 'json',
			success : function(result){
				returnResult = result;
			},
			error : function(){
				alert("에러가 발생하였습니다.");
			}
			
		});
		
		return returnResult;
	};
	
	// 게시판 수정
	boardModify = function(options){
		var url = options.boardName;
		$.ajax({
			url: url + "/retrieve",
			type: 'GET',
			data : options,
			async : false,
			datatype: 'json',
			success : function(result){
				options.drowMode = 'U';
				drowBoard(options);
			},
			error : function(){
				alert("에러가 발생하였습니다.");
			}
			
		});
	};
	
	// 수정글 취소
	boardModifyCancel = function(options){
		boardRead(options, options.boardNo);
	};
	
	// 수정글 저장
	boardModifySave = function(boardId, options){
		var url = options.boardName;
		$("#" + boardId).ajaxSubmit({
			url : url + "/modify",
			data : options,
			type: "POST",
			dataType: "html",
			success: function(data) {
				alert("수정되었습니다.");
				boardRead(options, options.boardNo);
			},
			error : function(){
				alert("정보를 수정 하지 못했습니다.");
			}
		});
	};
	
	// 게시글 삭제
	boardDelete = function(options){
		var url = options.boardName;

		$.ajax({
			url: url + "/" + options.boardNo + "/delete",
			type: 'DELETE',
			data : options,
			async : false,
			datatype: 'json',
			success : function(result){
				alert("삭제되었습니다.");
				options.drowMode = "L";
				drowBoard(options);
			},
			error : function(){
				alert("에러가 발생하였습니다.");
			}
			
		});
	};
	
})(jQuery);