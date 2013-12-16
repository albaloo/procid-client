// ==UserScript==
// @name           Procid
// @description    Interactive system supporting consensus building.
// @icon           https://github.com/albaloo/procid-client/blob/master/images/procid-icon.png
// @author         Roshanak Zilouchian
// @version        1.1
// @grant          none
// @include        http://drupal.org/node/*
// @include        https://drupal.org/node/*
// @include        http://drupal.org/comment/*
// @include        https://drupal.org/comment/*
// @match        http://drupal.org/*
// @match        https://drupal.org/*                                             
// @include        https://web.engr.illinois.edu/~rzilouc2/procid/example*
// ==/UserScript==

function load(url, onLoad, onError) {
    e = document.createElement("script");
    e.setAttribute("src", url);

    if (onLoad != null) { e.addEventListener("load", onLoad); }
    if (onError != null) { e.addEventListener("error", onError); }

    var body = document.getElementsByTagName('head')[0];
	body.appendChild(e);

    return e;
}

function execute(functionOrCode) {
    if (typeof functionOrCode === "function") {
        code = "(" + functionOrCode + ")();";
    } else {
        code = functionOrCode;
    }

    e = document.createElement("script");
    e.textContent = code;

    var body = document.getElementsByTagName('head')[0];
	body.appendChild(e);

    return e;
}

function loadAndExecute(url, functionOrCode) {
    load(url, function() { execute(functionOrCode); });
}

// the main function of this userscript
function main() {

	head.js("//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js", "//cdnjs.cloudflare.com/ajax/libs/d3/3.0.8/d3.min.js", function() {
		console.log("begin");
		var ABSOLUTEPATH = 'https://raw.github.com/albaloo/procid-client/master';
		var CSSSERVERPATH = 'https://web.engr.illinois.edu/~rzilouc2/procid';
		//var serverURL='http://0.0.0.0:3000/';
		var serverURL = 'https://procid-server.herokuapp.com/';
		var commentInfos = [];
		var criteria = [];
		var allCriteriaStatuses = [];
		var currentUser = "";
		var currentUserLink = "";
		var username = "";
		var password = "";
		var issue = {
			title : "",
			link : "",
			author : "",
			authorLink : "",
			status : "",
			created_at : ""
		};

		if (!window.d3) {
			loadScript("//cdnjs.cloudflare.com/ajax/libs/d3/3.0.8/d3.min.js");
		}

		jQuery.fn.sortElements = (function() {

			var sort = [].sort;

			return function(comparator, getSortable) {

				getSortable = getSortable ||
				function() {
					return this;
				};

				var placements = this.map(function() {

					var sortElement = getSortable.call(this), parentNode = sortElement.parentNode,

					// Since the element itself will change position, we have
					// to have some way of storing its original position in
					// the DOM. The easiest way is to have a 'flag' node:
					nextSibling = parentNode.insertBefore(document.createTextNode(''), sortElement.nextSibling);

					return function() {

						if (parentNode === this) {
							throw new Error("You can't sort elements if any one is a descendant of another.");
						}

						// Insert before flag:
						parentNode.insertBefore(this, nextSibling);
						// Remove flag:
						parentNode.removeChild(nextSibling);

					};

				});

				return sort.call(this, comparator).each(function(i) {
					placements[i].call(getSortable.call(this));
				});

			};

		})();

		var setUpProcid = function() {
			//Check if the user has logged in Drupal
			if (!$("#page").find('#comment-form').length)
				return;
			
			//Check if this is an issue page
			if (!$("#page").find("div [class='breadcrumb']").length)
				return;
			
			//find the currentUser
			var currentUserInfo = $("#userinfo a").first().text();
			currentUser = currentUserInfo.substr(13);
			currentUserLink = $($($.find('#edit-author--2')[0]).children()[1]).attr("href");

			if (currentUser == "")
				currentUser = "Anonymous";

			//Program Starts From here
			addCSSToHeader();
	
			var path = window.location.pathname;
			var issueLink;
			if (path.indexOf("node") >= 0)
				issueLink = window.location.pathname;
			else
				issueLink = $("link[rel='shortlink']").attr('href');

			var numIssueComments=0;
			$.ajaxSetup({
				'async' : false
			});
			
			$.post(serverURL + "issueExists", {
				"issueLink" : issueLink
			}, function(data) {
				numIssueComments = data.result;
				console.log("issue exists check success");
				preSetupProcid(numIssueComments);
			});

			console.log("username: " + currentUser);
		}
		var preSetupProcid = function(numIssueComments){
			if (numIssueComments == 0) {
				var startProcidButton = document.createElement('input');
				startProcidButton.setAttribute('class', 'procid-button-start');
				startProcidButton.setAttribute('type', 'submit');
				startProcidButton.setAttribute('value', 'Start Procid');
				startProcidButton.setAttribute('name', 'start');
				$("#aside").prepend(startProcidButton);
				startProcidButton.onclick = function(cb) {
					startProcid();
					$(".procid-button-start").remove();
					
					$.ajaxSetup({
				      'async' : true
			        });
			        
					$.post(serverURL + "startProcid", {
							"issueLink" : issue.link,
						    "userName" : currentUser,
						}, function(data) {
							console.log("procid started.");
						});
					
					return false;
				};

			}else 
				startProcid();
		}
		var addCSSToHeader = function() {
			var header = document.getElementsByTagName('head')[0];
			var csslink = document.createElement('link');
			csslink.setAttribute('href', CSSSERVERPATH + '/style.css');
			csslink.setAttribute('rel', 'stylesheet');
			csslink.setAttribute('type', 'text/css');
			header.appendChild(csslink);
		}
		var startProcid = function() {
			createStatusVar();

			//Add the left panel
			var leftPanel = addLeftPanel();

			var pageWrapper = document.createElement('div');
			pageWrapper.setAttribute('id', 'procid-page-wrapper');

			$("#page").wrap(pageWrapper);

			var outerPageWrapper = document.createElement('div');
			outerPageWrapper.setAttribute('id', 'procid-outer-page-wrapper');
			outerPageWrapper.appendChild(leftPanel);

			$("#procid-page-wrapper").wrap(outerPageWrapper);

			//IdeaPageWrapper
			var ideaPageWrapper = document.createElement('div');
			ideaPageWrapper.setAttribute('id', 'procid-idea-page-wrapper');

			$("#procid-page-wrapper").after(ideaPageWrapper);

			//InvitePageWrapper
			var invitePageWrapper = document.createElement('div');
			invitePageWrapper.setAttribute('id', 'procid-invite-page-wrapper');

			$("#procid-page-wrapper").after(invitePageWrapper);

			//Procid Header
			createProcidHeader();

			createHomePageBody();

			updateAddCommentBox();

		}
		//find and change the add comment box
		var updateAddCommentBox = function() {
			var commentForm = document.getElementById('comment-form');
			var commentWrapper = document.getElementById('edit-comment-body');
			var stylingOptions = document.getElementById('edit-comment-body-und-0-format');

			var commentInput = $(commentWrapper).find("textarea[id^='edit-comment-body']")[0];

			var divCommentOptionHolder = document.createElement('div');
			divCommentOptionHolder.setAttribute('class', 'procid-comment-composition-holder');

			var divIdeaCheckBox = document.createElement('div');
			divIdeaCheckBox.setAttribute('class', 'procid-comment-composition-checkbox');
			divCommentOptionHolder.appendChild(divIdeaCheckBox);

			var divIdeaCheckBoxInput = document.createElement('input');
			divIdeaCheckBoxInput.setAttribute('type', 'checkbox');
			divIdeaCheckBoxInput.setAttribute('value', 'none');
			divIdeaCheckBoxInput.setAttribute('id', 'procid-comment-composition-checkbox-input1');
			divIdeaCheckBoxInput.setAttribute('class', 'procid-comment-composition-checkbox-input');
			divIdeaCheckBoxInput.setAttribute('name', 'check');
			divIdeaCheckBox.appendChild(divIdeaCheckBoxInput);

			var divIdeaCheckBoxLabel = document.createElement('label');
			divIdeaCheckBoxLabel.setAttribute('for', 'procid-comment-composition-checkbox-input1');
			divIdeaCheckBoxLabel.innerHTML = "This comment proposes an idea.";
			divIdeaCheckBox.appendChild(divIdeaCheckBoxLabel);

			var divReferalHolder = document.createElement('div');
			divReferalHolder.setAttribute('class', 'procid-referal-holder');
			divCommentOptionHolder.appendChild(divReferalHolder);

			var divReferalCheckBox = document.createElement('div');
			divReferalCheckBox.setAttribute('class', 'procid-comment-composition-checkbox');
			divReferalHolder.appendChild(divReferalCheckBox);

			var divReferalCheckBoxInput = document.createElement('input');
			divReferalCheckBoxInput.setAttribute('type', 'checkbox');
			divReferalCheckBoxInput.setAttribute('value', 'none');
			divReferalCheckBoxInput.setAttribute('id', 'procid-comment-composition-checkbox-input2');
			divReferalCheckBoxInput.setAttribute('class', 'procid-comment-composition-checkbox-input');
			divReferalCheckBoxInput.setAttribute('name', 'check');
			divReferalCheckBox.appendChild(divReferalCheckBoxInput);
			
			divReferalCheckBoxInput.onclick = function(cb) {
				if ($('#procid-comment-composition-checkbox-input2').prop('checked')) {
					createRadioButtonsForCommentReferal(divReferalHolder);
					$(divReferalHolder).find("div[class='procid-radio-button-divider']").css("display", "inline-block");

				} else {
					removeRadioButtonsForCommentReferal();
					//$(divReferalHolder).find("div[class='procid-radio-button-divider']").css("display", "none");
				}

			};

			var divReferalCheckBoxLabel = document.createElement('label');
			divReferalCheckBoxLabel.setAttribute('for', 'procid-comment-composition-checkbox-input2');
			divReferalCheckBoxLabel.setAttribute('id', 'procid-comment-composition-checkbox-label2');
			divReferalCheckBoxLabel.innerHTML = "This comment refers to an idea proposed in comment";
			divReferalCheckBox.appendChild(divReferalCheckBoxLabel);

			var result = createListOfIdeaNumbers();
			divReferalCheckBox.appendChild(result.dropDownIdeaNumbers);

			if (result.ideaSize == 0)
				divReferalCheckBoxInput.disabled = true;

			$(commentWrapper).before(divCommentOptionHolder);

			var checkTone = document.createElement('input');
			checkTone.setAttribute('class', 'form-submit');
			checkTone.setAttribute('type', 'submit');
			checkTone.setAttribute('value', 'Check Your Comment');
			checkTone.setAttribute('name', 'submit');
			checkTone.style.marginRight = "5px";
			checkTone.onclick = function(e) {
				var message = "";
				var highlightedWords = [];
				var commentContent = "";
				if (commentInput.value != "") {
				    $.ajaxSetup({
					  'async' : false
					});
					$.post(serverURL + "findNegativeWords", {
						"comment" : commentInput.value,
						"issueLink" : issue.link,
						"userName" : currentUser,
					}, function(data) {
						message = data.userMessage;
						highlightedWords = data.highlightedWords;
						commentContent = commentInput.value;
						console.log("findNegativeWords success");
					});
					sentimentDialogPopup(message, highlightedWords, commentContent);
				} else {
					sentimentDialogPopup("Your comment was empty. Please enter a valid comment.", [], "");
				}
				return false;
			};

			var saveComment = document.getElementById('edit-submit');
			saveComment.onclick = function(e) {
			
				if ($('#procid-comment-composition-checkbox-input1').prop('checked')) {
					$.ajaxSetup({
						'async' : false
					});
					
					$.post(serverURL + "newIdeaComment", {
						"authorLink" : currentUserLink,
						"content" : $($.find('#edit-comment-body-und-0-value')[0]).val(),
						"issueLink" : issue.link
					});
				}

				if ($('#procid-comment-composition-checkbox-input2').prop('checked')) {
					var type = "";
					if ($("#procid-radio-button-1").is(':checked')) {
						type = "negative-strong";
					} else if ($("#procid-radio-button-2").is(':checked')) {
						type = "negative";
					} else if ($("#procid-radio-button-3").is(':checked')) {
						type = "neutral";
					} else if ($("#procid-radio-button-4").is(':checked')) {
						type = "positive";
					} else if ($("#procid-radio-button-5").is(':checked')) {
						type = "positive-strong";
					}
					$.ajaxSetup({
						'async' : false
					});
					$.post(serverURL + "newIdeaReference", {
						"authorLink" : currentUserLink,
						"content" : $($.find('#edit-comment-body-und-0-value')[0]).val(),
						"issueLink" : issue.link,
						"ideaNum" : parseInt($($.find("#procid-drop-down-text")[0]).text().replace(/^\D+/, '')),
						"type" : type
					});
				}
			};
			$(saveComment).before(checkTone);
		}
		var createListOfIdeaNumbers = function() {

			var divIdeaNumbers = document.createElement('div');
			divIdeaNumbers.setAttribute('class', 'procid-list-of-idea-numbers');

			var wrapperDropdown = document.createElement('div');
			wrapperDropdown.setAttribute('id', 'procid-comment-composition-inner-div');
			wrapperDropdown.setAttribute('class', 'procid-comment-composition-wrapper-dropdown');
			wrapperDropdown.setAttribute('tabindex', '1');
			wrapperDropdown.onclick = function(event) {
				$(this).toggleClass('active');
				return false;
			};
			divIdeaNumbers.appendChild(wrapperDropdown);
			var statusArray = [];

			var statusArray = findAllProposedIdeas();
			var firstIdea = "N/A";

			if (statusArray.length > 0)
				firstIdea = statusArray[0];

			var wrapperDropdownText = document.createElement('span');
			wrapperDropdownText.setAttribute('id', 'procid-drop-down-text');
			wrapperDropdownText.innerHTML = firstIdea;
			wrapperDropdownText.setAttribute('rel', "tooltip");
			wrapperDropdownText.setAttribute('title', "Set the Idea's Status");
			wrapperDropdown.appendChild(wrapperDropdownText);

			var wrapperDropdownList = document.createElement('ul');
			wrapperDropdownList.setAttribute('class', 'dropdown');
			wrapperDropdownList.setAttribute('id', 'dropdown-comment-composition');
			wrapperDropdown.appendChild(wrapperDropdownList);

			var obj = {
				placeholder : firstIdea,
				val : '',
				index : -1
			};

			$.each(statusArray, function() {
				var wrapperDropdownListOption = document.createElement('li');
				wrapperDropdownList.appendChild(wrapperDropdownListOption);
				wrapperDropdownListOption.onclick = function() {
					var opt = $(this);
					obj.val = opt.text();
					obj.index = opt.index();
					wrapperDropdownText.innerHTML = obj.val;
					return false;
				};

				var wrapperDropdownListOptionLink = document.createElement('a');
				wrapperDropdownListOptionLink.setAttribute('href', '#');
				wrapperDropdownListOptionLink.innerHTML = "" + this;
				wrapperDropdownListOption.appendChild(wrapperDropdownListOptionLink);

				var wrapperDropdownListOptionLinkIcon = document.createElement('i');
				wrapperDropdownListOptionLinkIcon.setAttribute('class', this + "icon-large");
				wrapperDropdownListOptionLink.appendChild(wrapperDropdownListOptionLinkIcon);

			});

			return {
				dropDownIdeaNumbers : divIdeaNumbers,
				ideaSize : statusArray.length
			};

		}
		var findAllProposedIdeas = function() {
			var ideas = [];
			for (var i = 0; i < commentInfos.length; i++) {
				if ($.inArray("idea", commentInfos[i].tags) != -1 && commentInfos[i].content != "") {
					ideas.push(commentInfos[i].title);

				}
			}
			return ideas;
		}
		var createRadioButtonsForCommentReferal = function(divReferalHolder) {
			var divRadioButtonDivider1 = document.createElement('div');
			divRadioButtonDivider1.setAttribute('class', 'procid-radio-button-divider');
			divReferalHolder.appendChild(divRadioButtonDivider1);

			var radio1 = document.createElement('input');
			radio1.setAttribute('class', 'procid-radio-button');
			radio1.setAttribute('id', 'procid-radio-button-1');
			radio1.setAttribute('type', 'radio');
			radio1.setAttribute('name', 'radio-1-set');
			radio1.setAttribute('value', 'Strongly Object');
			divRadioButtonDivider1.appendChild(radio1);

			var radioLabel1 = document.createElement('label');
			radioLabel1.setAttribute('class', 'procid-radio-button-label');
			radioLabel1.setAttribute('for', 'procid-radio-button-1');
			radioLabel1.innerHTML = 'Strongly Object';
			divRadioButtonDivider1.appendChild(radioLabel1);

			var divRadioButtonDivider2 = document.createElement('div');
			divRadioButtonDivider2.setAttribute('class', 'procid-radio-button-divider');
			divReferalHolder.appendChild(divRadioButtonDivider2);

			var radio2 = document.createElement('input');
			radio2.setAttribute('class', 'procid-radio-button');
			radio2.setAttribute('id', 'procid-radio-button-2');
			radio2.setAttribute('type', 'radio');
			radio2.setAttribute('name', 'radio-1-set');
			radio2.setAttribute('value', 'Object');
			divRadioButtonDivider2.appendChild(radio2);

			var radioLabel2 = document.createElement('label');
			radioLabel2.setAttribute('class', 'procid-radio-button-label');
			radioLabel2.setAttribute('for', 'procid-radio-button-2');
			radioLabel2.innerHTML = 'Object';
			divRadioButtonDivider2.appendChild(radioLabel2);

			var divRadioButtonDivider3 = document.createElement('div');
			divRadioButtonDivider3.setAttribute('class', 'procid-radio-button-divider');
			divReferalHolder.appendChild(divRadioButtonDivider3);

			var radio3 = document.createElement('input');
			radio3.setAttribute('class', 'procid-radio-button');
			radio3.setAttribute('id', 'procid-radio-button-3');
			radio3.setAttribute('type', 'radio');
			radio3.setAttribute('name', 'radio-1-set');
			radio3.setAttribute('value', 'Neutral');
			divRadioButtonDivider3.appendChild(radio3);

			var radioLabel3 = document.createElement('label');
			radioLabel3.setAttribute('class', 'procid-radio-button-label');
			radioLabel3.setAttribute('for', 'procid-radio-button-3');
			radioLabel3.innerHTML = 'Neutral';
			divRadioButtonDivider3.appendChild(radioLabel3);

			var divRadioButtonDivider4 = document.createElement('div');
			divRadioButtonDivider4.setAttribute('class', 'procid-radio-button-divider');
			divReferalHolder.appendChild(divRadioButtonDivider4);

			var radio4 = document.createElement('input');
			radio4.setAttribute('class', 'procid-radio-button');
			radio4.setAttribute('id', 'procid-radio-button-4');
			radio4.setAttribute('type', 'radio');
			radio4.setAttribute('name', 'radio-1-set');
			radio4.setAttribute('value', 'Support');
			divRadioButtonDivider4.appendChild(radio4);

			var radioLabel4 = document.createElement('label');
			radioLabel4.setAttribute('class', 'procid-radio-button-label');
			radioLabel4.setAttribute('for', 'procid-radio-button-4');
			radioLabel4.innerHTML = 'Support';
			divRadioButtonDivider4.appendChild(radioLabel4);

			var divRadioButtonDivider5 = document.createElement('div');
			divRadioButtonDivider5.setAttribute('class', 'procid-radio-button-divider');
			divReferalHolder.appendChild(divRadioButtonDivider5);

			var radio5 = document.createElement('input');
			radio5.setAttribute('class', 'procid-radio-button');
			radio5.setAttribute('id', 'procid-radio-button-5');
			radio5.setAttribute('type', 'radio');
			radio5.setAttribute('name', 'radio-1-set');
			radio5.setAttribute('value', 'Strongly Support');
			divRadioButtonDivider5.appendChild(radio5);

			var radioLabel5 = document.createElement('label');
			radioLabel5.setAttribute('class', 'procid-radio-button-label');
			radioLabel5.setAttribute('for', 'procid-radio-button-5');
			radioLabel5.innerHTML = 'Strongly Support';
			divRadioButtonDivider5.appendChild(radioLabel5);
		}
		var removeRadioButtonsForCommentReferal = function() {
			$(".procid-radio-button-divider").remove();
		}
		var sentimentDialogPopup = function(message, highlightedWords, comment) {
			addSentimentDialog(comment, highlightedWords);
			// get the screen height and width
			var maskHeight = $(document).height();
			var windowHeight = $(window).height();
			var maskWidth = $(window).width();

			// calculate the values for center alignment
			//var dialogTop = (windowHeight / 2) - ($('#procid-dialog-box').height());
			//var dialogLeft = (maskWidth / 2) - ($('#procid-dialog-box').width() / 2);

			// assign values to the overlay and dialog box
			$('#procid-dialog-overlay').css({
				height : maskHeight,
				width : maskWidth
			}).show();
			$('#procid-dialog-box').css({
				width: "620px",
				height : "auto",
				top: "180px"
			}).show();
			
			$("#procid-dialog-div-buttons").css({
				margin: "17px 50px 7px 170px"
			});

			$('.procid-dialog-content .procid-button-ok').click(function() {
				document.getElementById('edit-submit').click();

				$('#procid-dialog-overlay, #procid-dialog-box').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				document.getElementById("main").removeChild(document.getElementById("procid-dialog-box"));
				return false;
			});

			$('.procid-dialog-content .procid-button-cancel').click(function() {
				$('#procid-dialog-overlay, #procid-dialog-box').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				document.getElementById("main").removeChild(document.getElementById("procid-dialog-box"));
				return false;
			});
			
			$('#procid-dialog-overlay').click(function() {
				$('#procid-dialog-overlay, #procid-dialog-box').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				document.getElementById("main").removeChild(document.getElementById("procid-dialog-box"));
				return false;
			});

			// display the message
			$('#procid-sentiment-dialog-message').html(message);
		}
		var addSentimentDialog = function(comment, highlightedWords) {
			var dialogOverlay = document.createElement('div');
			dialogOverlay.setAttribute('id', 'procid-dialog-overlay');

			var dialogBox = document.createElement('div');
			dialogBox.setAttribute('id', 'procid-dialog-box');

			var dialogContent = document.createElement('div');
			dialogContent.setAttribute('class', 'procid-dialog-content');
			dialogBox.appendChild(dialogContent);

			var currentComment = comment + "";
			$.each(highlightedWords, function() {
				var text = "" + this;
				currentComment = currentComment.replace(text, "<span class='procid-highlighted-text'>" + text + "</span>");
			});

			var dialogHighlightedComment = document.createElement('div');
			dialogHighlightedComment.setAttribute('id', 'procid-dialog-highlighted-comment');
			dialogHighlightedComment.innerHTML = currentComment;
			dialogContent.appendChild(dialogHighlightedComment);

			var dialogImage = document.createElement('div');
			$(dialogImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-main-page.png)");
			dialogImage.setAttribute('class', 'procid-dialog-content-image');
			dialogContent.appendChild(dialogImage);

			var dialogMessage = document.createElement('div');
			dialogMessage.setAttribute('id', 'procid-sentiment-dialog-message');
			dialogContent.appendChild(dialogMessage);

			var divButtons = document.createElement('div');
			divButtons.setAttribute('id', 'procid-dialog-div-buttons');
			dialogContent.appendChild(divButtons);

			var dialogSubmit = document.createElement('input');
			dialogSubmit.setAttribute('class', 'procid-button-ok');
			dialogSubmit.setAttribute('type', 'submit');
			dialogSubmit.setAttribute('value', 'Publish as is');
			dialogSubmit.setAttribute('name', 'submit');
			divButtons.appendChild(dialogSubmit);

			var dialogCancel = document.createElement('input');
			dialogCancel.setAttribute('class', 'procid-button-cancel');
			dialogCancel.setAttribute('type', 'submit');
			dialogCancel.setAttribute('value', 'Cancel');
			dialogCancel.setAttribute('name', 'cancel');
			divButtons.appendChild(dialogCancel);

			$('body').prepend(dialogOverlay);
			$('#main').prepend(dialogBox);
		}
		var addConfirmationDialog = function() {
			var dialogOverlay = document.createElement('div');
			dialogOverlay.setAttribute('id', 'procid-dialog-overlay');

			var dialogBox = document.createElement('div');
			dialogBox.setAttribute('id', 'procid-dialog-box');

			var dialogContent = document.createElement('div');
			dialogContent.setAttribute('class', 'procid-dialog-content');
			dialogContent.style.paddingTop = "2px";
			dialogBox.appendChild(dialogContent);

			var dialogMessage = document.createElement('div');
			dialogMessage.setAttribute('id', 'procid-dialog-message');
			dialogMessage.style.paddingTop = "3px";
			dialogContent.appendChild(dialogMessage);

			var divButtons = document.createElement('div');
			divButtons.setAttribute('id', 'procid-dialog-div-buttons');
			dialogContent.appendChild(divButtons);

			var dialogSubmit = document.createElement('input');
			dialogSubmit.setAttribute('class', 'procid-button-submit');
			dialogSubmit.setAttribute('type', 'submit');
			dialogSubmit.setAttribute('value', 'Confirm');
			dialogSubmit.setAttribute('name', 'submit');
			divButtons.appendChild(dialogSubmit);

			var dialogCancel = document.createElement('input');
			dialogCancel.setAttribute('class', 'procid-button-cancel');
			dialogCancel.setAttribute('type', 'submit');
			dialogCancel.setAttribute('value', 'Cancel');
			dialogCancel.setAttribute('name', 'cancel');
			divButtons.appendChild(dialogCancel);

			$('body').prepend(dialogOverlay);
			$('body').prepend(dialogBox);
		}
		var confirmationDialogPopup = function(message, confirmText, submit) {
			addConfirmationDialog();
			// get the screen height and width
			var maskHeight = $(document).height();
			var windowHeight = $(window).height();
			var maskWidth = $(window).width();

			// calculate the values for center alignment
			var dialogTop = (windowHeight / 2) - ($('#procid-dialog-box').height());
			var dialogLeft = (maskWidth / 2) - ($('#procid-dialog-box').width() / 2);

			// assign values to the overlay and dialog box
			$('#procid-dialog-overlay').css({
				height : maskHeight,
				width : maskWidth
			}).show();
			$('#procid-dialog-box').css({
				top : dialogTop,
				left : dialogLeft
			}).show();

			//Update the submit button's text
			$('.procid-dialog-content .procid-button-submit').attr("value", confirmText);

			$(".procid-dialog-content input[class='procid-button-cancel'], #procid-dialog-overlay").click(function() {
				$('#procid-dialog-overlay, #procid-dialog-box').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				document.body.removeChild(document.getElementById("procid-dialog-box"));
				return false;
			});

			$('.procid-dialog-content .procid-button-submit').click(function() {
				$('#procid-dialog-overlay, #procid-dialog-box').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				document.body.removeChild(document.getElementById("procid-dialog-box"));
				submit();
				return false;
			});

			// display the message
			$('#procid-dialog-message').html(message);
		}
		//Add Procid Panel
		var addLeftPanel = function() {
			var leftPanel = document.createElement('div');
			leftPanel.setAttribute('id', 'procid-left-panel');
			leftPanel.innerHTML = ' ';

			var leftPanelHeader = document.createElement('div');
			leftPanelHeader.setAttribute('id', 'procid-left-panel-header');
			leftPanelHeader.innerHTML = ' ';

			var leftPanelBody = document.createElement('div');
			leftPanelBody.setAttribute('id', 'procid-left-panel-body');
			leftPanelBody.innerHTML = ' ';

			leftPanel.appendChild(leftPanelHeader);
			leftPanel.appendChild(leftPanelBody);

			return leftPanel;
		}
		//StatusVar used for changing pages
		var createStatusVar = function() {
			var statusVar = document.createElement('div');
			statusVar.setAttribute('id', 'procid-status-var');
			statusVar.innerHTML = 'home';
			$('#footer').append(statusVar);
			$('#procid-status-var').toggle(false);
		}
		var getStatusVar = function() {
			return $('#procid-status-var').text();
		}
		var setStatusVar = function(status) {
			$('#procid-status-var').text(status);
		}
		var changePage = function(destination) {
			var map = {
				home : ['procid-left-panel-body', 'procid-page-wrapper'],
				idea : ['procid-idea-page-wrapper'],
				invite : ['procid-invite-page-wrapper']
			};

			var sourceDivIds = map[getStatusVar()];
			$.each(sourceDivIds, function() {
				$("#" + this).toggle();
			});

			var destionationDivIds = map[destination];
			$.each(destionationDivIds, function() {
				if (destination == "idea" && $("#" + this).children("div.procid-ideaPage-header").length == 0)
					createIdeaPageBody();
				else if (destination == "invite" && $("#" + this).children("#procid-invite-title").length == 0)
					createInvitePageBody();
				$("#" + this).toggle();
			});
			setStatusVar(destination);
		}
		var createProcidHeader = function() {
			//Ruler
			var procidRuler = document.createElement('span');
			procidRuler.setAttribute('id', 'procid-ruler');
			$("#procid-left-panel-header").append(procidRuler);

			//Menu
			var procidMenu = document.createElement('ul');
			procidMenu.setAttribute('id', 'procid-menus');
			$("#procid-left-panel-header").append(procidMenu);
			$("#procid-menus").css("border-image", "url(" + ABSOLUTEPATH + "/images/top-line.png) 13 2 round");

			//Procid Label
			var procidLabel = document.createElement('div');
			procidLabel.setAttribute('id', 'procid-label');
			$(procidLabel).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-main-page.png)");
			$("#procid-menus").append(procidLabel);

			//Setting
			/*$('<a />').attr({
			 id : 'procid-setting-link',
			 href : '#',
			 rel : 'tooltip',
			 title : 'Settings'
			 }).click(function goSetting(evt) {

			 }).appendTo("#procid-menus");

			 var divSettingImage = document.createElement('div');
			 divSettingImage.setAttribute('id', 'procid-setting-image');
			 $(divSettingImage).css('background-image', "url("+ABSOLUTEPATH + "/images/sprites-main-page.png)");
			 $("#procid-setting-link").append(divSettingImage);*/

			$('<div />').attr({
				id : 'procid-menus-navigation-panel',
			}).appendTo("#procid-menus");

			//Home
			$('<li />').attr({
				id : 'procid-home',
			}).appendTo("#procid-menus-navigation-panel");

			$('<a />').attr({
				id : 'procid-home-link',
				href : '#',
				rel : 'tooltip',
				title : 'Home'
			}).click(function goHome(evt) {
				changePage('home');
			}).appendTo("#procid-home");

			var divHomeImage = document.createElement('div');
			divHomeImage.setAttribute('id', 'procid-home-image');
			$(divHomeImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-main-page.png)");
			$("#procid-home-link").append(divHomeImage);

			//Idea-based
			$('<li />').attr({
				id : 'procid-ideaBased',
			}).appendTo("#procid-menus-navigation-panel");

			$('<a />').attr({
				id : 'procid-ideaBased-link',
				href : '#',
				rel : 'tooltip',
				title : 'View the List of Ideas'
			}).click(function goIdeaBased(evt) {
				changePage('idea');
			}).appendTo("#procid-ideaBased");

			var divIdeaBasedImage = document.createElement('div');
			divIdeaBasedImage.setAttribute('id', 'procid-ideaBased-image');
			$(divIdeaBasedImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-main-page.png)");
			$("#procid-ideaBased-link").append(divIdeaBasedImage);

			//Invite
			$('<li />').attr({
				id : 'procid-invite',
			}).appendTo("#procid-menus-navigation-panel");

			$("#procid-invite").css("border-image", "url(" + ABSOLUTEPATH + "/images/icon-border-left.png) 2 5 round");

			$('<a />').attr({
				id : 'procid-invite-link',
				href : '#',
				rel : 'tooltip',
				title : 'Invite New Participants'
			}).click(function goInvite(evt) {
				changePage('invite');
			}).appendTo("#procid-invite");

			var divInviteImage = document.createElement('div');
			divInviteImage.setAttribute('id', 'procid-invite-image');
			$(divInviteImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-main-page.png)");
			$("#procid-invite-link").append(divInviteImage);

			//Feedback
			//$('<li />').attr({
			//	id : 'procid-feedback',
		//	}).appendTo("#procid-menus-navigation-panel");

			
			var feedbackLink = document.createElement('a');
			feedbackLink.setAttribute('id', 'procid-feedback-link');
			feedbackLink.setAttribute('href' , '#');
			//feedbackLink.setAttribute('rel', 'tooltip');
			//feedbackLink.setAttribute('title', 'Give Feedback on Procid');
			feedbackLink.onclick = function gofeedback(evt) {	
				var content = "<strong style='color:black; text-align:center;'> Ideas? Something not look right? </strong>";
				var content2 = "<span style='color:black; text-align:center;' >Or, write us at </span> <a href='mailto:rzilouc2@illinois.edu' style='color: #0678be'>rzilouc2@illinois.edu</a><br/>";
				var parent = this.parentNode;
				//currentElement, className, submitText, midElement, placeHolderString
				var divNewComment = createNewCommentBoxFrame(parent, 'procid-new-comment', "Send", "feedback", content, "200px", "50px", "30px", content2, false);	
				divNewComment.style.marginLeft = "50%";
				divNewComment.style.marginTop = "30px";
				$(divNewComment).children(".procid-new-comment-box").first().children(".procid-button-submit").first().click(function(e) {
					$.ajaxSetup({
						'async' : true
					});

					$.post(serverURL + "sendFeedback", {
						"issueLink" : issue.link,
						"userName" : currentUser,
						"content" : $(".procid-new-comment-textarea").val()
					}, function(data) {
						console.log("sendFeedback success");
					});

					//close the comment Input box
					parent.removeChild(divNewComment);
					$('#procid-dialog-overlay').hide();
					document.body.removeChild(document.getElementById("procid-dialog-overlay"));
					return false;
			});
	
	
				$("#procid-dialog-overlay").click(function() {
					parent.removeChild(divNewComment);
					$('#procid-dialog-overlay').hide();
					document.body.removeChild(document.getElementById("procid-dialog-overlay"));
					return false;
				});	
			};
			$("#procid-menus-navigation-panel").append(feedbackLink);
			$("#procid-feedback-link").css("border-image", "url(" + ABSOLUTEPATH + "/images/icon-border-left.png) 2 5 round");

			var divFeedback = document.createElement('div');
			divFeedback.innerHTML = "Give Feedback on Procid";
			feedbackLink.appendChild(divFeedback);


			$("#procid-menus li").css("border-image", "url(" + ABSOLUTEPATH + "/images/icon-border-left.png) 2 5 round");
		}
		/*************HOME PAGE BODY*********************/
		var createHomePageBody = function() {
			//Procid Home Body
			var lenses = document.createElement('ul');
			lenses.setAttribute('id', 'procid-lenses');
			$("#procid-left-panel-body").append(lenses);

			createLens('mustread', 'procid-lenses', 'View Must Read Comments');
			createLens('idea', 'procid-lenses', 'View Ideas');
			createLens('conversation', 'procid-lenses', 'View Conversation Comments');
			createLens('expert', 'procid-lenses', 'View Comments Posted by Experienced Participants');
			createLens('patch', 'procid-lenses', 'View Patches');
			createLens('search', 'procid-lenses', 'Search');
			$("#procid-search-link").css("border-image", "url(" + ABSOLUTEPATH + "/images/icon-border-left.png) 2 5 round");

			addSearchPanel('procid-search', "procid-left-panel-body");
			$("#procid-search-panel").css("display", "none");
			initializeCommentInfo();
			initializeIssueInfo();

			$.ajaxSetup({
				'async' : false
			});

			$.post(serverURL + "postcomments", {
				"issue" : JSON.stringify(issue),
				"commentInfos" : JSON.stringify(commentInfos)
			}, function(data) {
				$.each(data.issueComments, function(i, comment) {
					if (i >= commentInfos.length) {
						var newComment = {
							title : comment.title,
							link : comment.link,
							author : comment.author,
							authorLink : comment.authorLink,
							content : comment.content,
							tags : comment.tags,
							status : comment.status,
							comments : comment.comments,
							idea : "#1",
							criteriaStatuses : comment.criteriaStatuses,
							tone : comment.tone,
							image : "",
							commented_at : comment.commented_at,
							summary : comment.summary
						};
						commentInfos.push(newComment);
						applyTags(newComment)
					} else {
						commentInfos[i].tags = comment.tags;
						commentInfos[i].tone = comment.tone;
						commentInfos[i].comments = comment.comments;
						$.each(comment.criteriaStatuses, function() {
							addCriteriaStatus(commentInfos[i], this.value, this.comment, this.id, this.author, this.commentTitle);
						});
						commentInfos[i].status = comment.status;
						commentInfos[i].summary = comment.summary;
						if (commentInfos[i].content === "" && comment.content != "") {
							commentInfos[i].content = comment.content;
							commentInfos[i].image = comment.image;
						}
						applyTags(commentInfos[i]);
					}
				});
				criteria = data.criteria;
			});

			$(".procid-comment").map(function() {
				$(this).css("border-image", "url(" + ABSOLUTEPATH + "/images/sidebar_border.png) 11 2 round");
			});

			//update individual comments
			var index = 0;
			$.each($("ul[class='links inline']"), function() {
				if ($($(this.parentNode).find("h3[class='comment-title']")[0]).next().is("a") && $($(this.parentNode).find("h3[class='comment-title']")[0]).next()[0].innerHTML.indexOf(".") > 0) {
				} else {
					createLensSelectorForIndividualComments(this, 'idea', commentInfos[index], 'Tag this comment as Idea');
					createLensSelectorForIndividualComments(this, 'mustread', commentInfos[index], 'Tag this comment as Must Read');
					index++;
				}
			});
		}
		var chosenLens = "";

		var createLens = function(name, parent, tooltipText) {
			//Lenses
			$('<li />').attr({
				id : "procid-" + name,
			}).appendTo("#" + parent);

			$('<a />').attr({
				id : 'procid-' + name + '-link',
				href : '#',
				rel : 'tooltip',
				title : tooltipText,
				class : 'unselected'
			}).appendTo("#procid-" + name);

			if (name == "search")
				$("#procid-" + name + "-link").click(function addthePanel(evt) {
					if ($("#procid-" + name + "-link").hasClass('unselected')) {
						if ($(".procid-lens-selected").length > 0 && chosenLens != "") {
							$("div[id='procid-comment-" + chosenLens + "'] a").attr('class', 'procid-lens-unselected');
							$("div[id='procid-comment-" + chosenLens + "'] img").attr('class', 'procid-lens-image-unselected');
							$("div[id='procid-" + chosenLens + "-image']").attr('class', 'procid-' + chosenLens + '-image-unselected');
							chosenLens = "";
						}
						$("#procid-" + name + "-link").attr('class', 'selected');
						$("#procid-search-panel").css("display", "block");
						$("div[id='procid-" + name + "-image']").attr('class', 'procid-' + name + '-image-selected');
					} else {
						$("#procid-" + name + "-link").attr('class', 'unselected');
						$("#procid-search-panel").css("display", "none");
						$("div[id='procid-" + name + "-image']").attr('class', 'procid-' + name + '-image-unselected');

						$("div[class='procid-comment'] a").map(function() {
							$(this).parents(".procid-comment").css("display", "block");
						});
						$("#procid-search-input-form").val("");

					}
					
					return false;
				});
			else
				$("#procid-" + name + "-link").click(function highlightComments(evt) {
					if ($("div[id='procid-comment-" + name + "'] a").hasClass('procid-lens-unselected')) {
						//free the previous lens
						if ($(".procid-lens-selected").length > 0 && chosenLens != "") {
							$("div[id='procid-comment-" + chosenLens + "'] a").attr('class', 'procid-lens-unselected');
							$("div[id='procid-comment-" + chosenLens + "'] img").attr('class', 'procid-lens-image-unselected');
							$("div[id='procid-" + chosenLens + "-image']").attr('class', 'procid-' + chosenLens + '-image-unselected');
							chosenLens = "";
							$("div[class='procid-comment'] a[class='procid-lens-unselected']").map(function() {
								$(this).parents(".procid-comment").css("display", "block");
							});
						}
						$("div[id='procid-comment-" + name + "'] a").attr('class', 'procid-lens-selected');
						$("div[id='procid-comment-" + name + "'] img").attr('class', 'procid-lens-image-selected');
						$("div[id='procid-comment-" + name + "'] img").attr('src', ABSOLUTEPATH + '/images/' + name + '-tiny.png');
						$("div[id='procid-" + name + "-image']").attr('class', 'procid-' + name + '-image-selected');
						chosenLens = name;

						$("div[class='procid-comment'] a[class='procid-lens-unselected']").map(function() {
							$(this).parents(".procid-comment").css("display", "none");
						});

					} else {
						if ($("div[id='procid-comment-" + name + "'] a").length == 0) {
							var message;
							if(name=="patch")
								message = "No " + name + "es to show."
							else
								message = "No " + name + "s to show."
							var instruction = "";
							if (name == "idea" || name == "mustread")
								instruction = "You can identify " + name + "s by toggling the icon in the bottom right of each comment."
							else
								instruction = "We didn't identify any " + name + " comments in this thread.";
							var x = getOffset(this).left - getOffset($("#procid-" + name).parentNode).left + 5;
							currentBox = addWarningBox($("#procid-"+name)[0], message, instruction, x + "px", "40px", "");
							$("#procid-dialog-overlay").click(function() {
								$("#procid-"+name)[0].parentNode.removeChild(currentBox);
								$('#procid-dialog-overlay').hide();
								document.body.removeChild(document.getElementById("procid-dialog-overlay"));
								return false;
							});

						} else {
							$("div[id='procid-comment-" + name + "'] a").attr('class', 'procid-lens-unselected');
							$("div[id='procid-comment-" + name + "'] img").attr('class', 'procid-lens-image-unselected');
							$("div[id='procid-" + name + "-image']").attr('class', 'procid-' + name + '-image-unselected');
							chosenLens = "";

							$("div[class='procid-comment'] a[class='procid-lens-unselected']").map(function() {
								$(this).parents(".procid-comment").css("display", "block");
							});
						}
					}
					
					$.ajaxSetup({
						'async' : true
					});
					$.post(serverURL + "lensClicked", {
						"issueLink" : issue.link,
						"userName" : currentUser,
						"tagName" : name
					}, function() {
						console.log("tag logged success");
					});
					return false;

				});

			var divLensImage = document.createElement('div');
			divLensImage.setAttribute('id', 'procid-' + name + '-image');
			$(divLensImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-main-page.png)");
			divLensImage.setAttribute('class', 'procid-' + name + '-image-unselected');
			$("#procid-" + name + '-link').append(divLensImage);

		}
		var addWarningBox = function(icon, message, instruction, arrowPosition, topPosition, positionStyle) {
			var dialogOverlay = document.createElement('div');
			dialogOverlay.setAttribute('id', 'procid-dialog-overlay');

			$('body').prepend(dialogOverlay);

			var maskHeight = $(document).height();
			var maskWidth = $(window).width();

			// assign values to the overlay and dialog box
			$('#procid-dialog-overlay').css({
				height : maskHeight,
				width : maskWidth
			}).show();

			var parent = icon.parentNode;
			//currentElement, className, submitText, midElement, placeHolderString
			var divNewWarning = document.createElement('div');
			divNewWarning.setAttribute('class', 'procid-new-comment');
			divNewWarning.style.width = "250px";

			divNewWarning.style.marginLeft = "1px";
			divNewWarning.style.top = topPosition;
			parent.appendChild(divNewWarning);

			var divNewWarningBox = document.createElement('div');
			divNewWarningBox.setAttribute('class', 'procid-new-comment-box');
			divNewWarningBox.style.padding = "2px 2px 2px 2px";
			divNewWarning.appendChild(divNewWarningBox);

			var dialogContent = document.createElement('div');
			dialogContent.setAttribute('class', 'procid-warning-content');
			divNewWarningBox.appendChild(dialogContent);

			var dialogHighlightedComment = document.createElement('div');
			dialogHighlightedComment.setAttribute('id', 'procid-warning-highlighted-comment');
			dialogHighlightedComment.innerHTML = message;
			dialogContent.appendChild(dialogHighlightedComment);

			var dialogMessage = document.createElement('div');
			dialogMessage.setAttribute('id', 'procid-warning-message');
			dialogMessage.innerHTML = instruction;
			dialogContent.appendChild(dialogMessage);

			var divButtons = document.createElement('div');
			divButtons.setAttribute('id', 'procid-warning-div-ok-button');
			dialogContent.appendChild(divButtons);

			var dialogSubmit = document.createElement('input');
			dialogSubmit.setAttribute('class', 'procid-button-ok');
			dialogSubmit.setAttribute('type', 'submit');
			dialogSubmit.setAttribute('value', 'OK');
			dialogSubmit.setAttribute('name', 'submit');
			dialogSubmit.style.margin = "2px 10px 0px 10px";
			divButtons.appendChild(dialogSubmit);
			dialogSubmit.onclick = function(e) {
				parent.removeChild(divNewWarning);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			};

			var divArrow = document.createElement('div');
			divArrow.setAttribute('class', 'arrow');
			divArrow.style.left = arrowPosition;
			divNewWarning.appendChild(divArrow);

			var divShadow = document.createElement('div');
			divShadow.setAttribute('class', 'shadow');
			divShadow.style.left = arrowPosition;
			divNewWarning.appendChild(divShadow);

			return divNewWarning;
		}
		var addSearchPanel = function(name, parent) {
			$('<div />').attr({
				id : name + "-panel",
				class : 'searchForm',
				//method : 'get',
				//action : '',
			}).appendTo("#" + parent);

			$('<input type="text" />').attr({
				name : 'q',
				class : 'searchFormInput',
				id : name + "-input-form",
				size : '40',
				placeholder : 'Search...',
			}).appendTo("#" + name + "-panel");

			if (name == "procid-search") {
				//Search comments
				$("#" + name + "-input-form").keyup(function() {
					$("div[class='procid-comment'] a").map(function() {
						var value = $("#" + name + "-input-form").val().toLowerCase();
						var currentText = $(this).text().toLowerCase();

						if (currentText.indexOf(value) === -1)
							$(this).parents(".procid-comment").css("display", "none");
						else
							$(this).parents(".procid-comment").css("display", "block");
					});
				});
			} else {
				//Search potential Members
				$("#" + name + "-input-form").keyup(function() {
					$("div[class='procid-invite-block'] div[class^='procid-author-name'] a").map(function() {
						var value = $("#" + name + "-input-form").val().toLowerCase();
						var currentText = $(this).text().toLowerCase();

						if (currentText.indexOf(value) === -1)
							$(this).parents(".procid-invite-block").css("display", "none");
						else
							$(this).parents(".procid-invite-block").css("display", "table-row");
					});
				});
			}
		}
		var removeSearchPanel = function(name, parent) {
			$("#" + parent).remove("#" + name + "-panel");
		}
		var initializeIssueInfo = function() {
			var issueAuthor = $("#content-inner div[class='submitted'] a").first().text();
			var issueAuthorLink = $("#content-inner div[class='submitted'] a").first().attr('href');
			var issueCreationDate = $("#content-inner div[class='submitted'] time").first().text;

			var issueStatus = $("#block-project-issue-issue-metadata div[class='field-item even']").first().text();

			var issueTitle = $("#page-subtitle").first().text();

			var path = window.location.pathname;
			var issueLink;
			if (path.indexOf("node") >= 0)
				issueLink = window.location.pathname;
			else {
				issueLink = $("link[rel='shortlink']").attr('href');
			}

			issue.title = issueTitle;
			issue.link = issueLink;
			issue.author = issueAuthor;
			issue.authorLink = issueAuthorLink;
			issue.status = issueStatus;
			issue.created_at = issueCreationDate;

		}
		var initializeCommentInfo = function() {
			var array_title = $("section[class='comments comment-wrapper'] h3[class='comment-title']").next().map(function() {
				if ($(this).is("a"))
					return $(this).text();
				else
					return "NonIntTitle";
			});

			var array_links = $("section[class='comments comment-wrapper'] h3[class='comment-title']").next().map(function() {
				if ($(this).is("a")) {
					var commentLink = $(this).attr('href');
					var link = issue.link + "#" + commentLink.split("#")[1];
					return link;
				} else
					return "NonIntTitle";
			});

			var array_author = $("section[class='comments comment-wrapper'] div[class='submitted']").map(function() {
				var authors = $(this).find("a");
				if (authors.length > 0)
					return $(this).find("a").text();
				else
					return "Anonymous";
			});

			var array_author_hrefs = $("section[class='comments comment-wrapper'] div[class='submitted']").map(function() {
				var authors = $(this).find("a");
				if (authors.length > 0)
					return $(this).find("a").attr("href");
				else
					return "#";
			});

			var array_dateTimes = $("section[class='comments comment-wrapper'] div[class='submitted'] time").map(function() {
				return $(this).text();
			});

			var array_contents = $("section[class='comments comment-wrapper'] div[class='content'] div[class^='field field-name-comment-body']").map(function() {
				var contents = $(this).find("p");
				var ulContents = $(this).find("li");
				var h3Contents = $(this).find("h3");
				var returnValue = "";

				$.each(contents, function() {
					returnValue += $(this).text();
				});
				$.each(ulContents, function() {
					returnValue += $(this).text();
				});
				$.each(h3Contents, function() {
					returnValue += $(this).text();
				});
				return returnValue;
			});

			var array_patches = $("section[class='comments comment-wrapper'] div[class='content']").map(function() {
				var returnValue = 0;
				var patches = $(this).find("tr[class*='pift-pass'],tr[class*='pift-fail']");
				if (patches.length > 0)
					returnValue = 1;
				var otherAttachments = $(this).find("a");
				$.each(otherAttachments, function() {
					var link = $(this).attr("href");
					if (( typeof link !== 'undefined' && link !== false) && (link.indexOf(".patch") > 0)) {
						returnValue = 1;
					}
				});

				return returnValue;
			});

			var array_images = $("section[class='comments comment-wrapper'] div[class='content']").map(function() {
				var returnValue = " ";
				var contents = $(this).find("a");
				$.each(contents, function() {
					var link = $(this).attr("href");
					if (( typeof link !== 'undefined' && link !== false) && (link.match(/png$/) || link.match(/jpg$/))) {
						returnValue = link;
					}
				});

				if (returnValue == " ") {
					var imgs = $(this).find("img [class!='file-icon']");
					$.each(imgs, function() {
						var link = $(this).attr("src");
						if (link.match(/png$/) || link.match(/jpg$/)) {
							returnValue = link;
						}
					});
				}

				//if(returnValue.indexOf("http://drupal.org/") == 0)
				//	returnValue = returnValue.replace("http://drupal.org/", "https://drupal.org/");
		
				return returnValue;
			});

			var len = array_title.length;
			for (var i = 0; i < len; i++) {
				initTags = [];
				while (array_title[i] === "NonIntTitle") {
					array_title.splice(i, 1);
					array_links.splice(i, 1);
					array_author.splice(i, 1);
					array_author_hrefs.splice(i, 1);
					len--;
				}
				if (array_patches[i] > 0)
					initTags.push("patch");
				if (!(array_title[i].indexOf(".") > 0)) {
					var comment = {
						title : array_title[i],
						link : array_links[i],
						author : array_author[i],
						authorLink : array_author_hrefs[i],
						content : array_contents[i],
						tags : initTags,
						status : "Ongoing",
						comments : [],
						idea : "#1",
						criteriaStatuses : [],
						tone : "",
						image : array_images[i],
						commented_at : array_dateTimes[i],
						summary : ""
					};

					commentInfos.push(comment);
				}
			}
			return commentInfos;
		}
		
		var applyTags = function(commentInfo) {
			//update the left panel
			var div1 = document.createElement('div');
			div1.setAttribute('id', 'procid-comment' + commentInfo.title.substr(1));
			div1.setAttribute('class', 'procid-comment');
			var divinner = div1;
			//$(".procid-comment").map(function(){
			//	$(this).css("border-image", "url("+ ABSOLUTEPATH +"/images/sidebar_border.png) 11 2 round");
			//	});

			$.each(commentInfo.tags, function() {
				var divTag = document.createElement('div');
				divTag.setAttribute('id', 'procid-comment-' + this);
				divinner.appendChild(divTag);
				divinner = divTag;
			});

			$('<img />').attr({
				id : 'procid-selected-comment-image',
				class : 'procid-lens-image-unselected',
				src : ABSOLUTEPATH + '/images/patch-tiny.png',
			}).appendTo(divinner);

			$('<a />').attr({
				id : 'procid-comment-link',
				href : commentInfo.link,
				class : 'procid-lens-unselected',
				rel : 'tooltip',
				title : 'see comment'
			}).text(commentInfo.title + "\t" + commentInfo.author + commentInfo.summary).appendTo(divinner);

			$("#procid-left-panel-body").append(div1);
		}
		
		var createLensSelectorForIndividualComments = function(parent, name, commentInfo, tooltipText) {
			var className = 'procid-lens-tag-unselected';
			var imgClassName = 'procid-lens-tag-image-unselected';
			var imgSource = ABSOLUTEPATH + '/images/' + name + '-1.png';
			if ($.inArray(name, commentInfo.tags) != -1) {
				className = 'procid-lens-tag-selected';
				imgClassName = 'procid-lens-tag-image-selected';
				tooltipText = "Remove " + name + " tag from this comment"
				imgSource = ABSOLUTEPATH + '/images/' + name + '-3.png';
			}

			var lens = document.createElement('li');
			$(parent).prepend(lens);

			var lensLink = document.createElement('a');
			lensLink.setAttribute('class', className);
			lensLink.setAttribute('rel', 'tooltip');
			lensLink.setAttribute('title', tooltipText);
			lensLink.setAttribute('href', '#');
			$(lens).append(lensLink);

			var lensImage = document.createElement('img');
			lensImage.setAttribute('class', imgClassName);
			lensImage.setAttribute('src', imgSource);
			$(lensLink).append(lensImage);

			$(lensLink).click(function addRemoveTag(evt) {
				if ($(lensLink).hasClass('procid-lens-tag-unselected')) {
					confirmationDialogPopup("Are you sure you want to apply " + name + " tag to this comment?", "Apply", function() {
						//if(getConfirmationDialogStatusVar() === "submit"){
						$(lensLink).attr('class', 'procid-lens-tag-selected');
						$(lensImage).attr('class', 'procid-lens-tag-image-selected');
						$(lensImage).attr('src', ABSOLUTEPATH + '/images/' + name + '-3.png');
						commentInfo.tags.push(name);
						var divTag = document.createElement('div');
						divTag.setAttribute('id', 'procid-comment-' + name);
						if ($("#procid-comment" + commentInfo.title.substr(1) + " div").length === 0) {
							$("#procid-comment" + commentInfo.title.substr(1) + " a, " + "#procid-comment" + commentInfo.title.substr(1) + " img").wrapAll(divTag);
						} else {
							$("#procid-comment" + commentInfo.title.substr(1) + " div").wrap(divTag);
						}
						
						$.ajaxSetup({
							'async' : true
						});
						
						$.post(serverURL + "addTag", {
							"issueLink" : issue.link,
							"userName" : currentUser,
							"commentTitle" : commentInfo.title,
							"tag" : name
						}, function() {
							console.log("addTag success");
						});

						if (name === "idea") {
							//create and add idea
							removeIdeaBlocks();
							if ($("#procid-idea-page-wrapper").children("div.procid-ideaPage-header").length == 0)
								createIdeaPageBody();
							else
								createIdeaBlocks();
							var newSummary = "";
							
							$.ajaxSetup({
							'async' : false
							});
						
							$.post(serverURL + "addNewIdea", {
								"issueLink" : issue.link,
								"commentTitle" : commentInfo.title,
								"userName" : currentUser
							}, function(data) {
								console.log("addNewIdea success");
								newSummary = data.summary;
								commentInfo.summary = newSummary;
							});

							//update the sumamry
							$("#procid-comment" + commentInfo.title.substr(1) + " a[id='procid-comment-link']").text(commentInfo.title + "\t" + commentInfo.author + commentInfo.summary);
						}
					});

				} else {
					confirmationDialogPopup("Are you sure you want to remove " + name + " tag from this comment?", "Remove", function() {
						//if(getConfirmationDialogStatusVar() === "submit"){
						$(lensLink).attr('class', 'procid-lens-tag-unselected');
						$(lensImage).attr('class', 'procid-lens-tag-image-unselected');
						$(lensImage).attr('src', ABSOLUTEPATH + '/images/' + name + '-1.png');
						$("#procid-comment" + commentInfo.title.substr(1) + " div[id=procid-comment-" + name + "] a").attr('class', 'procid-lens-unselected');
						$("#procid-comment" + commentInfo.title.substr(1) + " div[id=procid-comment-" + name + "] img").attr('class', 'procid-lens-image-unselected');

						var index = $.inArray(name, commentInfo.tags);
						if (index >= 0)
							commentInfo.tags.splice(index, 1);
						var cnt = $("#procid-comment" + commentInfo.title.substr(1) + " div[id=procid-comment-" + name + "]").contents();
						$("#procid-comment" + commentInfo.title.substr(1) + " div[id=procid-comment-" + name + "]").replaceWith($(cnt));
						
						$.ajaxSetup({
							'async' : true
						});
						
						$.post(serverURL + "removeTag", {
							"issueLink" : issue.link,
							"userName" : currentUser,
							"commentTitle" : commentInfo.title,
							"tag" : name
						}, function() {
							console.log("removeTag success");
						});

						if (name === "idea") {
							//delete idea
							$('#procid-idea-block-' + commentInfo.title.substr(1)).remove();
							var newSummary = "";
							$.ajaxSetup({
								'async' : false
							});
						
							$.post(serverURL + "deleteIdea", {
								"issueLink" : issue.link,
								"commentTitle" : commentInfo.title,
								"userName" : currentUser
							}, function(data) {
								console.log("deleteIdea success");
								newSummary = data.summary;
								commentInfo.summary = newSummary;
							});

							//update the sumamry
							//id : 'procid-comment-link',
							$("#procid-comment" + commentInfo.title.substr(1) + " a[id='procid-comment-link']").text(commentInfo.title + "\t" + commentInfo.author + commentInfo.summary);
						}

					});
				}
				return false;
			});

		}
		/*********************IDEA PAGE BODY************************/

		var createIdeaPageBody = function() {
			//Header
			var ideaPageHeader = document.createElement('div');
			ideaPageHeader.setAttribute('class', 'procid-ideaPage-header');
			$("#procid-idea-page-wrapper").append(ideaPageHeader);

			createLabel('Ideas', "");
			createLabel('Status', "");
			createLabel('Criteria', "(edit)");
			createLabel('Comments', "");

			console.log("numComments:" + commentInfos.length);

			//Body
			createIdeaBlocks();
		}
		var createIdeaBlocks = function() {
			for (var i = 0; i < commentInfos.length; i++) {

				if ($.inArray("idea", commentInfos[i].tags) != -1 && commentInfos[i].content != "") {
					var divIdeaBlock = createEachIdeaBlock(commentInfos[i]);
					$("#procid-idea-page-wrapper").append(divIdeaBlock);
				}
			}

			createCriteriaStatusTracks();
			createCriterionSelectors();

		}
		var removeIdeaBlocks = function() {
			allCriteriaStatuses = [];
			$('.procid-idea-block').remove();
		}
		var createEachIdeaBlock = function(commentInfo) {
			var divIdeaBlock = document.createElement('div');
			divIdeaBlock.setAttribute('id', 'procid-idea-block-' + commentInfo.title.substr(1));
			divIdeaBlock.setAttribute('class', 'procid-idea-block');

			var closeButtonLink = document.createElement('a');
			closeButtonLink.setAttribute("href", "#");
			closeButtonLink.setAttribute('rel', "tooltip");
			closeButtonLink.setAttribute('id', "procid-idea-close-" + commentInfo.title.substr(1));
			closeButtonLink.setAttribute('title', "Not an idea? Delete it.");
			closeButtonLink.onclick = function(e) {
				var currentLink = this;
				confirmationDialogPopup("Are you sure this is not an idea and you want to delete it?", "Delete", function() {
					$(currentLink).parent().remove();
					var buttonId = currentLink.id;
					var commentNumber = parseInt(buttonId.match(/\d+/)[0], 10);
					var commentTitle = "#" + commentNumber;
					$.ajaxSetup({
						'async' : true
					});
						
					$.post(serverURL + "deleteIdea", {
						"issueLink" : issue.link,
						"commentTitle" : commentTitle,
						"userName" : currentUser
					}, function() {
						console.log("deleteIdea success");
					});

				});
				return false;
			}

			divIdeaBlock.appendChild(closeButtonLink);

			var closeButton = document.createElement('div');
			closeButton.setAttribute("class", "procid-idea-block-close");
			$(closeButton).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-idea-page.png)");
			//closeButton.setAttribute("src", ABSOLUTEPATH + "/images/delete.png");
			closeButtonLink.appendChild(closeButton);

			createIdeaImage(divIdeaBlock, commentInfo);
			createIdeaStatus(divIdeaBlock, commentInfo);
			createIdeaCriteria(divIdeaBlock, commentInfo, "");
			createIdeaComments(divIdeaBlock, commentInfo);

			return divIdeaBlock;
		}
		var createLabel = function(name, link) {
			var label = document.createElement('a');
			label.setAttribute('class', 'ideaPage-header-label-inactive');
			label.setAttribute('id', 'procid-' + name + '-label');
			label.setAttribute('href', "#");
			label.innerHTML = name;
			label.setAttribute('rel', "tooltip");
			label.setAttribute('title', "Sort By " + name);

			$(".procid-ideaPage-header").append(label);

			if (name === "Ideas") {
				label.setAttribute('class', 'ideaPage-header-label');
				label.onclick = function(e) {
					$("div[class=procid-idea-block]").sortElements(function(a, b) {
						var strA = $(a).find(".procid-idea-block-image a[class='ideaPage-link']")[0].innerHTML.toLowerCase();
						var strB = $(b).find(".procid-idea-block-image a[class='ideaPage-link']")[0].innerHTML.toLowerCase();
						return sortIdeasOnTime(strA, strB);
					});
					return false;
				};
			}

			if (name === "Status") {
				label.setAttribute('class', 'ideaPage-header-label');
				label.onclick = function(e) {
					$("div[class=procid-idea-block]").sortElements(function(a, b) {
						var strA = $(a).find(".wrapper-dropdown span")[0].innerHTML.toLowerCase();
						var strB = $(b).find(".wrapper-dropdown span")[0].innerHTML.toLowerCase();
						return sortIdeasOnStatus(strA, strB);
					});
					return false;
				}
			}

			if (link === "(edit)") {
				var link1 = document.createElement('a');
				link1.setAttribute('id', 'procid-edit-link');
				$(link1).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-idea-page.png)");
				link1.setAttribute('href', "#");
				link1.setAttribute('rel', "tooltip");
				link1.setAttribute('title', "Edit Criteria List");
				link1.onclick = function(e) {
					if ($(".procid-ideaPage-header .procid-edit-criteria").length == 0)
						createEditCriteriaBox($(".procid-ideaPage-header")[0]);
					else
						$(".procid-ideaPage-header")[0].removeChild($('.procid-edit-criteria')[0]);
					return false;
				};
				//label.appendChild(link1);
				$(".procid-ideaPage-header").append(link1);

				/*var img1 = document.createElement('div');
				 img1.setAttribute('id', 'procid-edit-img');
				 //img1.setAttribute('src', ABSOLUTEPATH + '/images/edit.png');
				 $(img1).css('background-image', "url("+ABSOLUTEPATH + "/images/sprites-idea-page.png)");
				 link1.appendChild(img1);*/
			}
		}
		var sortIdeasOnStatus = function(strA, strB) {
			var numA = 0;
			var numB = 0;
			if (strA === "ongoing")
				numA = 1;
			else if (strA === "implemented")
				numA = 2;

			if (strB === "ongoing")
				numB = 1;
			else if (strB === "implemented")
				numB = 2;

			return numA >= numB ? -1 : 1;
		}
		var sortIdeasOnTime = function(strA, strB) {
			var aStrings = strA.split(" ");
			var bStrings = strB.split(" ");

			var dateStringA = commentInfos[findCommentInfoIndex(aStrings[0])].commented_at;
			//.getTime();

			var dateStringB = commentInfos[findCommentInfoIndex(bStrings[0])].commented_at;
			//.getTime();

			dateStringA = dateStringA.replace(" at", "");
			dateStringA = dateStringA.replace("pm", " pm");
			dateStringA = dateStringA.replace("am", " am");
			dateStringB = dateStringB.replace(" at", "");
			dateStringB = dateStringB.replace("pm", " pm");
			dateStringB = dateStringB.replace("am", " am");

			var numA = new Date(dateStringA);
			var numB = new Date(dateStringB);
			return numA > numB ? 1 : -1;
		}
		/**********IdeaPage-Criteria Edit Box**********/
		var createEditCriteriaBox = function(currentElement) {
			var divNewCriteriaEditBox = createNewCommentBoxFrame(currentElement, 'procid-edit-criteria', "Save", "", "", "400px", "20px", "", "", false);
			var tempCriteria = [];
			//var index = 0;

			var table = createTableHeader();
			$(divNewCriteriaEditBox).children(".procid-new-comment-box").first().children(".procid-button-submit").first().before(table);

			if (criteria.length === 0) {
				var tempNewCriteria = {
					title : "",
					description : "",
					id : createNewCriteriaId(tempCriteria.length),
					action : "add",
					author : currentUser
				};
				
				tempCriteria.push(tempNewCriteria);
				var currentIndex = findTempCriteriaIndex(tempNewCriteria.id, tempCriteria);

				var tableR = document.createElement("tr");
				$("#procid-editCriteriaBox-table tbody").append(tableR);

				var tableC1 = document.createElement("td");
				tableR.appendChild(tableC1);

				var titleInput = document.createElement('input');
				titleInput.setAttribute('id', 'procid-editCriteriaBox-title-input' + tempNewCriteria.id);
				titleInput.setAttribute('class', 'titleInput');
				titleInput.setAttribute('type', 'text');
				titleInput.setAttribute('maxlength', '20');
				titleInput.setAttribute('name', 'labelInput');
				titleInput.placeholder = "Title...";
				tableC1.appendChild(titleInput);
	
				$("#procid-editCriteriaBox-title-input" + tempNewCriteria.id).keyup(function() {
					tempCriteria[currentIndex].title = this.value;
				});

				var tableC2 = document.createElement("td");
				tableR.appendChild(tableC2);

				var description = document.createElement('input');
				description.setAttribute('id', 'procid-editCriteriaBox-description-input' + tempNewCriteria.id);
				description.setAttribute('class', 'descriptionInput');
				description.setAttribute('type', 'text');
				description.setAttribute('name', 'description');
				description.placeholder = "Description...";
				$(description).keyup(function() {
					tempCriteria[currentIndex].description = this.value;
				});
				tableC2.appendChild(description);

				var tableC5 = document.createElement("td");
				tableC5.innerHTML = "";
				tableR.appendChild(tableC5);

				var tableC3 = document.createElement("td");
				tableC3.innerHTML = "";
				tableR.appendChild(tableC3);

				/*var tableC4 = document.createElement("td");
				tableC4.innerHTML = "";
				tableR.appendChild(tableC4);*/
				//index++;

			}

			var numCriteria = {
				num : criteria.length
			};

			$.each(criteria, function() {
				createCriteriaEditBoxBlock(divNewCriteriaEditBox, tempCriteria, this, numCriteria);
			});

			//They shouldn't be able to add more than 4 criteria
			if (numCriteria.num < 4) {
				var addCriteria = createAddCriteriaLink(tempCriteria, numCriteria);
				$(divNewCriteriaEditBox).children(".procid-new-comment-box").first().children(".procid-button-submit").first().before(addCriteria);
			}

			$(divNewCriteriaEditBox).children(".procid-new-comment-box").first().children(".procid-button-submit").first().click(function(e) {
				var criteriaToBeDeleted = [];
				var changed = false;
				$.each(tempCriteria, function() {
					var currentCriteria = findCriteriaById(this.id);
					$.ajaxSetup({
						'async' : false
					});
						
					/*if (this.action === "delete") {
						criteriaToBeDeleted.push(this.id);
						$.post(serverURL + "deleteCriteria", {
							"issueLink" : issue.link,
							"userName" : currentUser,
							"id" : this.id
						}, function() {
							console.log("delete criteria success");
							changed = true;
						});
					} else */if (this.action === "edit" && (currentCriteria.title != this.title || currentCriteria.description != this.description)) {
						setCriteriaTitle(this.id, this.title);
						setCriteriaDescription(this.id, this.description);
						$.post(serverURL + "editCriteria", {
							"issueLink" : issue.link,
							"userName" : currentUser,
							"title" : this.title,
							"description" : this.description,
							"id" : this.id
						}, function() {
							console.log("edit criteria success");
							changed = true;
						});

					} else if (this.action == "add" && this.title != "") {
						var newCriteria = createNewCritera(this.title, this.description, this.id, currentUser);
						var newCommentContent = "We need to consider another criterion when evaluating ideas: " + newCriteria.title + ": " + newCriteria.description + ".";
						titleAndLink = saveCommentToDrupal(newCommentContent, issue.link);

						$.post(serverURL + "addCriteria", {
							"issueLink" : issue.link,
							"userName" : currentUser,
							"title" : newCriteria.title,
							"description" : newCriteria.description,
							"id" : newCriteria.id,
							"newCommentTitle" : titleAndLink[0],
							"newCommentLink" : titleAndLink[1],
							"newCommentContent" : newCommentContent
						}, function(data) {
							console.log("add criteria success");
							changed = true;
							addNewComment(titleAndLink[0], titleAndLink[1], currentUser, newCommentContent, "neutral", data.commented_at, data.summary);
						});
					}

				});

				/*$.each(criteriaToBeDeleted, function() {
					deleteCriteria(this);
					//TODO: delete the related comments
				});*/
				
				if (changed)
					updateCriteriaStatusList();

				currentElement.removeChild(divNewCriteriaEditBox);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));

			});

			$(divNewCriteriaEditBox).children(".procid-new-comment-box").first().children(".procid-button-cancel").first().click(function(e) {
				currentElement.removeChild(divNewCriteriaEditBox);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			$("#procid-dialog-overlay").click(function() {
				currentElement.removeChild(divNewCriteriaEditBox);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			return divNewCriteriaEditBox;
		}
		var createTableHeader = function() {
			var table = document.createElement("table");
			table.setAttribute('id', 'procid-editCriteriaBox-table');

			var tableHeader = document.createElement("thead");
			tableHeader.setAttribute('id', 'procid-editCriteriaBox-table-header');
			table.appendChild(tableHeader);

			var tableR = document.createElement("tr");
			tableR.setAttribute('id', 'procid-editCriteriaBox-table-header-labels');
			tableHeader.appendChild(tableR);

			var tableC1 = document.createElement("th");
			tableC1.setAttribute('style', 'width:120px');
			tableC1.innerHTML = "Title";
			tableR.appendChild(tableC1);

			var tableC2 = document.createElement("th");
			tableC2.innerHTML = "Description";
			tableC2.setAttribute('style', 'width:120px');
			tableR.appendChild(tableC2);

			var tableC3 = document.createElement("th");
			tableC3.innerHTML = "Posted By";
			tableR.appendChild(tableC3);

			var tableC4 = document.createElement("th");
			tableC4.innerHTML = "Edit";
			tableR.appendChild(tableC4);

			/*var tableC5 = document.createElement("th");
			tableC5.innerHTML = "";
			tableR.appendChild(tableC5);*/

			var tableBody = document.createElement("tbody");
			tableBody.setAttribute('id', 'procid-editCriteriaBox-table-body');
			table.appendChild(tableBody);

			return table;
		}
		var createCriteriaEditBoxBlock = function(divNewCriteriaEditBox, tempCriteria, currentCriteria, numCriteria) {

			tempCurrentCriteria = {
				title : currentCriteria.title,
				description : currentCriteria.description,
				id : currentCriteria.id,
				action : "",
				author : currentCriteria.author
			};
			tempCriteria.push(tempCurrentCriteria);

			var currentIndex = findTempCriteriaIndex(currentCriteria.id, tempCriteria);
			var tableR = document.createElement('tr');
			$("#procid-editCriteriaBox-table-body").append(tableR);

			var tableC1 = document.createElement('td');
			tableC1.innerHTML = currentCriteria.title;
			tableC1.setAttribute('style', 'width:120px');
			tableR.appendChild(tableC1);

			var tableC2 = document.createElement('td');
			tableC2.innerHTML = currentCriteria.description;
			tableC2.setAttribute('style', 'width:180px');
			tableR.appendChild(tableC2);

			var tableC5 = document.createElement('td');
			tableC5.innerHTML = currentCriteria.author;
			tableC5.setAttribute('style', 'width:100px');
			tableR.appendChild(tableC5);

			var tableC3 = document.createElement('td');
			tableR.appendChild(tableC3);

			var editCriteria = document.createElement('a');
			editCriteria.setAttribute('href', "#");
			editCriteria.setAttribute('rel', "tooltip");
			editCriteria.setAttribute('class', "procid-addcomment-link");
			editCriteria.setAttribute('title', "Edit this criteria");
			editCriteria.onclick = function(e) {
				if ($(editImage).attr('class') === "procid-edit-criteria-icons-edit") {
					var par = $(this).parent().parent();
					//tr
					var tdTitle = par.children("td:nth-child(1)");
					var tdDescription = par.children("td:nth-child(2)");

					tdTitle.html("<input type='text' class = 'titleInput' id='procid-editCriteriaBox-title-input" + currentCriteria.id + "' value='" + tdTitle.html() + "'/>");
					$("#procid-editCriteriaBox-title-input" + currentCriteria.id).keyup(function() {
						tempCriteria[currentIndex].title = this.value;
					});

					tdDescription.html("<input type='text' class = 'descriptionInput' id='procid-editCriteriaBox-description-input" + currentCriteria.id + "' value='" + tdDescription.html() + "'/>");

					$("#procid-editCriteriaBox-description-input" + currentCriteria.id).keyup(function() {
						tempCriteria[currentIndex].description = this.value;
					});

					$(editImage).attr('class', "procid-edit-criteria-icons-undo");
					editCriteria.setAttribute('title', "Undo your edit");
					tempCriteria[currentIndex].action = "edit";
				} else {
					var par = $(this).parent().parent();
					//tr
					var tdTitle = par.children("td:nth-child(1)");
					var tdDescription = par.children("td:nth-child(2)");

					tdTitle.html(currentCriteria.title);
					tdDescription.html(currentCriteria.description);

					$(editImage).attr('class', "procid-edit-criteria-icons-edit");
					editCriteria.setAttribute('title', "Edit this criteria");
					tempCriteria[currentIndex].action = "";
				}

			};
			tableC3.appendChild(editCriteria);

			var editImage = document.createElement('div');
			editImage.setAttribute('class', "procid-edit-criteria-icons-edit");
			$(editImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-idea-page.png)");
			editCriteria.appendChild(editImage);

			/*var tableC4 = document.createElement('td');
			tableR.appendChild(tableC4);

			var deleteCriteriaLink = document.createElement('a');
			deleteCriteriaLink.setAttribute('href', "#");
			deleteCriteriaLink.setAttribute('rel', "tooltip");
			deleteCriteriaLink.setAttribute('class', "procid-addcomment-link");
			deleteCriteriaLink.setAttribute('title', "Delete this criteria");
			deleteCriteriaLink.onclick = function(e) {
				$(this).closest('tr').find('td').fadeOut(1000, function() {
					$(this).parents('tr:first').remove();
				});
				tempCriteria[currentIndex].action = "delete";
				numCriteria.num = numCriteria.num - 1;
				if (numCriteria.num < 4 && !($(divNewCriteriaEditBox).find("#procid-addcriteria-link").length > 0)) {
					var addCriteria = createAddCriteriaLink(tempCriteria, numCriteria);
					$(divNewCriteriaEditBox).children(".procid-new-comment-box").first().children(".procid-button-submit").first().before(addCriteria);
				}

				return false;
			};
			tableC4.appendChild(deleteCriteriaLink);

			var deleteImage = document.createElement('div');
			deleteImage.setAttribute('class', "procid-edit-criteria-icons-delete");
			$(deleteImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-idea-page.png)");
			deleteCriteriaLink.appendChild(deleteImage);*/
		}
		var createAddCriteriaLink = function(tempCriteria, numCriteria) {
			var addCriteria = document.createElement('a');
			addCriteria.setAttribute('href', "#");
			addCriteria.setAttribute('rel', "tooltip");
			addCriteria.setAttribute('id', "procid-addcriteria-link");
			addCriteria.setAttribute('title', "Add a new criteria");
			addCriteria.innerHTML = "Add Criteria +";
			addCriteria.onclick = function(e) {
				var tempNewCriteria = {
					title : "",
					description : "",
					id : createNewCriteriaId(tempCriteria.length),
					action : "add",
					author : currentUser
				};

				tempCriteria.push(tempNewCriteria);
				var currentIndex = findTempCriteriaIndex(tempNewCriteria.id, tempCriteria);//index;
				var tableR = document.createElement("tr");
				$("#procid-editCriteriaBox-table tbody").append(tableR);

				var tableC1 = document.createElement("td");
				tableR.appendChild(tableC1);

				var titleInput = document.createElement('input');
				titleInput.setAttribute('id', 'procid-editCriteriaBox-title-input' + tempNewCriteria.id);
				titleInput.setAttribute('class', 'titleInput');
				titleInput.setAttribute('maxlength', '20');
				titleInput.setAttribute('type', 'text');
				titleInput.setAttribute('name', 'labelInput');
				titleInput.placeholder = "Title...";
				tableC1.appendChild(titleInput);
				$("#procid-editCriteriaBox-title-input" + tempNewCriteria.id).keyup(function() {
					tempCriteria[currentIndex].title = this.value;
				});

				var tableC2 = document.createElement("td");
				tableR.appendChild(tableC2);

				var description = document.createElement('input');
				description.setAttribute('id', 'procid-editCriteriaBox-description-input' + tempNewCriteria.id);
				description.setAttribute('class', 'descriptionInput');
				description.setAttribute('type', 'text');
				description.setAttribute('name', 'description');
				description.placeholder = "Description...";
				$(description).keyup(function() {
					tempCriteria[currentIndex].description = this.value;
				});
				tableC2.appendChild(description);

				var tableC5 = document.createElement("td");
				tableC5.innerHTML = "";
				tableR.appendChild(tableC5);

				var tableC3 = document.createElement("td");
				tableC3.innerHTML = "";
				tableR.appendChild(tableC3);

				/*var tableC4 = document.createElement("td");
				tableC4.innerHTML = "";
				tableR.appendChild(tableC4);*/
				
				numCriteria.num = numCriteria.num + 1;
				if (numCriteria.num >= 4) {
					addCriteria.parentNode.removeChild(addCriteria);
				}
				return false;
			};

			return addCriteria;
		}
		/**********IdeaPage-Image**********/

		var createIdeaImage = function(divIdeaBlock, commentInfo) {
			var divIdea = document.createElement('div');
			divIdea.setAttribute('class', 'procid-idea-block-image');
			divIdeaBlock.appendChild(divIdea);

			var link1 = document.createElement('a');
			link1.setAttribute('id', 'procid-author-link');
			link1.setAttribute('href', commentInfo.link);
			link1.setAttribute('class', 'ideaPage-link');
			link1.innerHTML = commentInfo.title + " " + commentInfo.author;
			link1.onclick = function(e) {
				changePage('home');
				window.location = commentInfo.link;
				return false;
			}
			var contentString = "<a style='color: #29abe2; font-size: 1.023em; font-weight: bold; padding-left:0px;' href='" + commentInfo.link + "' onClick='window.open(\"" + commentInfo.link + "\");'>" + commentInfo.title + "</a> <small><i>Posted by " + commentInfo.author + "</i></small> <br/>" + commentInfo.content;

			var divIdeaImage = document.createElement('div');
			divIdeaImage.setAttribute('id', 'procid-idea-div-image');
			divIdeaImage.onclick = function(e) {
				var x = getOffset(this).left - getOffset(this.parentNode).left + 60;
				addCommentContentBox(this, contentString, x + "px", "-65px", "relative");
			};

			if (commentInfo.image != " ") {//image attachment
				var image1 = document.createElement('img');
				image1.setAttribute('id', 'procid-ideaPage-image');
				image1.setAttribute('src', commentInfo.image);
				divIdeaImage.appendChild(image1);
			} else {
				divIdeaImage.textContent = commentInfo.content;
			}
			divIdea.appendChild(link1);
			divIdea.appendChild(divIdeaImage);

		}
		/**********IdeaPage-Status**********/
		var createIdeaStatus = function(divIdeaBlock, commentInfo) {
			var divStatus = document.createElement('div');
			divStatus.setAttribute('class', 'procid-idea-block-status');
			divIdeaBlock.appendChild(divStatus);

			var wrapperDropdown = document.createElement('div');
			wrapperDropdown.setAttribute('id', 'procid-status-inner-div' + commentInfo.title.substr(1));
			wrapperDropdown.setAttribute('class', 'wrapper-dropdown');
			wrapperDropdown.setAttribute('tabindex', '1');
			wrapperDropdown.onclick = function(event) {
				$(this).toggleClass('active');
				return false;
			};
			divStatus.appendChild(wrapperDropdown);

			var wrapperDropdownText = document.createElement('span');
			wrapperDropdownText.setAttribute('id', 'procid-status-text' + commentInfo.title.substr(1));
			wrapperDropdownText.innerHTML = commentInfo.status;
			wrapperDropdownText.setAttribute('rel', "tooltip");
			wrapperDropdownText.setAttribute('title', "Set the Idea's Status");
			wrapperDropdown.appendChild(wrapperDropdownText);

			var wrapperDropdownList = document.createElement('ul');
			wrapperDropdownList.setAttribute('class', 'dropdown');
			wrapperDropdown.appendChild(wrapperDropdownList);

			var obj = {
				placeholder : commentInfo.status,
				val : '',
				index : -1
			};

			var statusArray = ["Ongoing", "Implemented", "Dropped"];
			$.each(statusArray, function() {
				var wrapperDropdownListOption = document.createElement('li');
				wrapperDropdownList.appendChild(wrapperDropdownListOption);
				wrapperDropdownListOption.onclick = function() {
					var opt = $(this);
					obj.val = opt.text();
					obj.index = opt.index();
					wrapperDropdownText.innerHTML = obj.val;
					
					$.ajaxSetup({
						'async' : true
					});
						
					$.post(serverURL + "setIdeaStatus", {
						"issueLink" : issue.link,
						"commentTitle" : commentInfo.title,
						"status" : opt.text(),
						"userName" : currentUser
					}, function() {
						console.log("setIdeaStatus success");
					});
					return false;
				};

				var wrapperDropdownListOptionLink = document.createElement('a');
				wrapperDropdownListOptionLink.setAttribute('href', '#');
				wrapperDropdownListOptionLink.innerHTML = "" + this;
				wrapperDropdownListOption.appendChild(wrapperDropdownListOptionLink);

				var wrapperDropdownListOptionLinkIcon = document.createElement('i');
				wrapperDropdownListOptionLinkIcon.setAttribute('class', this + " icon-large");
				wrapperDropdownListOptionLink.appendChild(wrapperDropdownListOptionLinkIcon);

			});
		}
		/**********IdeaPage-Comments**********/
		var createIdeaComments = function(divIdeaBlock, commentInfo) {
			//comments on an idea
			var divComments = document.createElement('div');
			divComments.setAttribute('class', 'procid-idea-block-comments');
			divIdeaBlock.appendChild(divComments);

			var divCommentRows = document.createElement('div');
			divCommentRows.setAttribute('class', 'procid-idea-comment-rows');
			divComments.appendChild(divCommentRows);

			/******Setting UP the pros row******/
			var divProsRow = document.createElement('div');
			divProsRow.setAttribute('class', 'procid-idea-comment-row');
			divCommentRows.appendChild(divProsRow);

			var divProsRowHeader = document.createElement('div');
			divProsRowHeader.setAttribute('class', 'procid-idea-comment-row-header');
			divProsRow.appendChild(divProsRowHeader);

			addIcon(divProsRowHeader, ABSOLUTEPATH + "/images/sprites-idea-page.png", 'procid-idea-comment-div-icon', "procid-idea-comment-icon-pros", "Supportive Comments");

			var divProsRowBody = document.createElement('div');
			divProsRowBody.setAttribute('class', 'procid-idea-comment-row-body');
			divProsRow.appendChild(divProsRowBody);

			var divProsRowContent = document.createElement('div');
			divProsRowContent.setAttribute('class', 'procid-idea-comment-row-content');
			divProsRowContent.setAttribute('id', 'pros-content');
			divProsRowBody.appendChild(divProsRowContent);

			/******Setting UP the neutral row******/
			var divNeutralRow = document.createElement('div');
			divNeutralRow.setAttribute('class', 'procid-idea-comment-row');
			divCommentRows.appendChild(divNeutralRow);

			var divNeutralRowHeader = document.createElement('div');
			divNeutralRowHeader.setAttribute('class', 'procid-idea-comment-row-header');
			divNeutralRow.appendChild(divNeutralRowHeader);

			addIcon(divNeutralRowHeader, ABSOLUTEPATH + "/images/sprites-idea-page.png", 'procid-idea-comment-div-icon', "procid-idea-comment-icon-neutral", "Neutral Comments");

			var divNeutralRowBody = document.createElement('div');
			divNeutralRowBody.setAttribute('class', 'procid-idea-comment-row-body');
			divNeutralRow.appendChild(divNeutralRowBody);

			var divNeutralRowContent = document.createElement('div');
			divNeutralRowContent.setAttribute('class', 'procid-idea-comment-row-content');
			divNeutralRowContent.setAttribute('id', 'neutral-content');
			divNeutralRowBody.appendChild(divNeutralRowContent);

			/******Setting UP the cons row******/
			var divConsRow = document.createElement('div');
			divConsRow.setAttribute('class', 'procid-idea-comment-row');
			divCommentRows.appendChild(divConsRow);

			var divConsRowHeader = document.createElement('div');
			divConsRowHeader.setAttribute('class', 'procid-idea-comment-row-header');
			divConsRow.appendChild(divConsRowHeader);

			addIcon(divConsRowHeader, ABSOLUTEPATH + "/images/sprites-idea-page.png", 'procid-idea-comment-div-icon', "procid-idea-comment-icon-cons", "Constructive Comments");
			var divConsRowBody = document.createElement('div');
			divConsRowBody.setAttribute('class', 'procid-idea-comment-row-body');
			divConsRow.appendChild(divConsRowBody);

			var divConsRowContent = document.createElement('div');
			divConsRowContent.setAttribute('class', 'procid-idea-comment-row-content');
			divConsRowContent.setAttribute('id', 'cons-content');
			divConsRowBody.appendChild(divConsRowContent);

			var numPositiveOrNeutralComments = 0;
			var srcPath = ABSOLUTEPATH + "/images/sprites-idea-page.png";
			$.each(commentInfo.comments, function() {
				var contentString = "<a style='color: #29abe2; font-size: 1.023em; font-weight: bold; padding-left:0px;' href='" + this.link + "' onClick='window.open(\"" + this.link + "\");'>" + this.title + "</a> <small><i>Posted by " + this.author + "</i></small> <br/>" + this.content;
				//var comment = findComment(string);
				var divEachComment = document.createElement('div');
				divEachComment.setAttribute('class', "procid-idea-comment-img-div");
				var authorName = this.author;
				var ind = authorName.indexOf(" ");
				if (ind > 0)
					authorName = authorName.substr(0, ind + 1);

				createCommentAuthorBox(divEachComment, authorName, "20px", "1px");
				var sentimentTuning = false;
				if (this.tone == "neutral")
					sentimentTuning = true;

				//Size of the string comments are larger
				if (this.tone.indexOf("strong") > 0)
					addImage(divEachComment, srcPath, 'procid-idea-comment-img-strong', contentString, sentimentTuning);
				else
					addImage(divEachComment, srcPath, 'procid-idea-comment-img', contentString, sentimentTuning);
				if (this.tone.indexOf("positive") >= 0) {
					divProsRowContent.appendChild(divEachComment);
					numPositiveOrNeutralComments++;
				} else if (this.tone == "neutral") {
					//addImage(divEachComment, srcPath, 'procid-idea-comment-img', this.content);
					divNeutralRowContent.appendChild(divEachComment);
					numPositiveOrNeutralComments++;
				} else if (this.tone.indexOf("negative") >= 0) {
					//addImage(divEachComment, srcPath, 'procid-idea-comment-img', this.content);
					divConsRowContent.appendChild(divEachComment);
				}
			});

			var divAddProsComment = document.createElement('div');
			divAddProsComment.setAttribute('class', 'procid-addcomment-link-div');
			divProsRowContent.appendChild(divAddProsComment);

			var addProsComment = document.createElement('a');
			addProsComment.setAttribute('href', "#");
			addProsComment.setAttribute('rel', "tooltip");
			addProsComment.setAttribute('class', "procid-addcomment-link");
			addProsComment.setAttribute('title', "Add a supportive comment");
			addProsComment.innerHTML = "+";
			addProsComment.onclick = function(e) {
				var x = getOffset(this).left - getOffset(this.parentNode).left + 6;
				createNewCommentBox(divProsRow, "positive", commentInfo, x + "px");
				return false;
			};
			divAddProsComment.appendChild(addProsComment);
			if ($(divProsRowContent).find(".procid-idea-comment-img-div").length > 0)
				divAddProsComment.style.top = "16px";

			//Adding the divider
			addIcon(divProsRowBody, ABSOLUTEPATH + "/images/sprites-idea-page.png", 'procid-idea-comment-div-divider', "procid-idea-comment-divider", "");

			var divAddNeutralComment = document.createElement('div');
			divAddNeutralComment.setAttribute('class', 'procid-addcomment-link-div');
			divNeutralRowContent.appendChild(divAddNeutralComment);

			var addNeutralComment = document.createElement('a');
			addNeutralComment.setAttribute('href', "#");
			addNeutralComment.setAttribute('rel', "tooltip");
			addNeutralComment.setAttribute('class', "procid-addcomment-link");
			addNeutralComment.setAttribute('title', "Add a neutral comment");
			addNeutralComment.innerHTML = "+";
			addNeutralComment.onclick = function(e) {
				var x = getOffset(this).left - getOffset(this.parentNode).left + 6;
				createNewCommentBox(divNeutralRow, "neutral", commentInfo, x + "px");
				return false;
			};
			divAddNeutralComment.appendChild(addNeutralComment);
			if ($(divNeutralRowContent).find(".procid-idea-comment-img-div").length > 0)
				divAddNeutralComment.style.top = "16px";

			//Adding the divider
			addIcon(divNeutralRowBody, ABSOLUTEPATH + "/images/sprites-idea-page.png", 'procid-idea-comment-div-divider', "procid-idea-comment-divider", "");

			var divAddConsComment = document.createElement('div');
			divAddConsComment.setAttribute('class', 'procid-addcomment-link-div');
			divConsRowContent.appendChild(divAddConsComment);

			var addConsComment = document.createElement('a');
			addConsComment.setAttribute('href', "#");
			addConsComment.setAttribute('rel', "tooltip");
			if (numPositiveOrNeutralComments > 0) {
				addConsComment.setAttribute('class', "procid-addcomment-link");
				addConsComment.setAttribute('title', "Add a constructive comment");
				addConsComment.onclick = function(e) {
					var x = getOffset(this).left - getOffset(this.parentNode).left + 6;
					createNewCommentBox(divConsRow, "negative", commentInfo, x + "px");
					return false;
				};
				divAddConsComment.appendChild(addConsComment);
			} else {
				divAddConsComment.appendChild(addConsComment);
				var divNewCommentBoxTooltip = document.createElement('div');
				divNewCommentBoxTooltip.setAttribute('class', 'procid-button-tooltip');
				divNewCommentBoxTooltip.innerHTML = 'Consider adding a Neutral or Supportive comment first.';
				divAddConsComment.appendChild(divNewCommentBoxTooltip);
				divNewCommentBoxTooltip.style.display = "none";
				divNewCommentBoxTooltip.style.width = "200px";
				divNewCommentBoxTooltip.style.position = "absolute";
				divNewCommentBoxTooltip.style.zIndex = "1000";

				addConsComment.onmouseover = function(e) {
					divNewCommentBoxTooltip.style.display = "inline";
				};
				addConsComment.onmouseout = function(e) {
					divNewCommentBoxTooltip.style.display = "none";
				};
				addConsComment.setAttribute('class', "procid-addcomment-link-deactive");
				addConsComment.setAttribute('title', "");
				addConsComment.style.color = "#B3B3B3";
				addConsComment.style.textDecoration = "none";
				addConsComment.onclick = function(e) {
					return false;
				};
			}
			addConsComment.innerHTML = "+";

			if ($(divConsRowContent).find(".procid-idea-comment-img-div").length > 0)
				divAddConsComment.style.top = "16px";
			addIcon(divConsRowBody, ABSOLUTEPATH + "/images/sprites-idea-page.png", 'procid-idea-comment-div-divider', "procid-idea-comment-divider-end", "");
		}
		var addIcon = function(divParent, iconPath, divClass, iconClass, tooltipText) {
			var divIcon = document.createElement('div');
			divIcon.setAttribute('class', divClass);
			divIcon.setAttribute('rel', "tooltip");
			divIcon.setAttribute('title', tooltipText);

			divParent.appendChild(divIcon);

			addImage(divIcon, iconPath, iconClass, "", false);
		}
		var getOffset = function(el) {
			var _x = 0;
			var _y = 0;
			while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
				_x += el.offsetLeft - el.scrollLeft;
				_y += el.offsetTop - el.scrollTop;
				el = el.offsetParent;
			}
			return {
				top : _y,
				left : _x
			};
		}
		var addImage = function(divParent, iconPath, iconClass, content, sentimentTuning) {
			var icon = document.createElement('div');
			icon.setAttribute('class', iconClass);
			$(icon).css("background-image", "url(" + iconPath + ")");
			divParent.appendChild(icon);

			if (content != "") {
				icon.onclick = function(e) {
					var x = getOffset(this).left - getOffset(this.parentNode.parentNode).left + 5;
					addCommentContentBox(this, content, x + "px", "50px", "", sentimentTuning);
				};
			}
		}
		var addCommentContentBox = function(image, content, arrowPosition, topPosition, positionStyle, sentimentTuning) {
			var parent = image.parentNode.parentNode;
			//currentElement, className, submitText, midElement, placeHolderString
			var divNewComment = createNewCommentBoxFrame(parent, 'procid-new-comment', "", "div", content, "250px", arrowPosition, "1px", "", sentimentTuning);
			$("#procid-dialog-overlay").click(function() {
				parent.removeChild(divNewComment);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			divNewComment.style.top = topPosition;
			if (positionStyle != "")
				divNewComment.style.position = positionStyle;
			return divNewComment;
		}
		var removeCommentContentBox = function(image, prevCommentBox) {
			var parent = image.parentNode.parentNode;
			parent.removeChild(prevCommentBox);
		}
		var createCommentAuthorBox = function(currentElement, authorName, arrowPosition, marginLeft) {
			var divAuthorName = document.createElement('div');
			divAuthorName.setAttribute('class', "procid-comment-author");
			//		if(marginLeft != "")
			//			divAuthorName.style.marginLeft = marginLeft;
			currentElement.appendChild(divAuthorName);

			var divAuthorNameBox = document.createElement('div');
			divAuthorNameBox.setAttribute('class', 'procid-comment-author-box');
			divAuthorName.appendChild(divAuthorNameBox);

			var divAuthorNameBoxInput = document.createElement('div');
			divAuthorNameBoxInput.setAttribute('class', 'procid-comment-author-text');
			divAuthorNameBoxInput.innerHTML = authorName;
			divAuthorNameBox.appendChild(divAuthorNameBoxInput);

			var divArrow = document.createElement('div');
			divArrow.setAttribute('class', 'arrow');
			//		divArrow.style.left = arrowPosition;
			divAuthorName.appendChild(divArrow);

			var divShadow = document.createElement('div');
			divShadow.setAttribute('class', 'shadow');
			//		divShadow.style.left = arrowPosition;
			divAuthorName.appendChild(divShadow);

			return divAuthorName;
		}
		var findCommentInfoIndex = function(number) {
			var result = $.grep(commentInfos, function(e) {
				return e.title == number;
			});
			if (result.length == 0)
				return -1;
			else
				return commentInfos.indexOf(result[0]);
		}
		var createNewCommentBox = function(currentElement, tone, commentInfo, arrowPosition) {

			var toneString = "I like this idea because ...";
			var registerString = "I strongly support it.";
			if (tone === "negative") {
				toneString = "I disagree with this idea because ...";
				registerString = "I strongly object it.";
			} else if (tone === "neutral") {
				toneString = "I think this idea ...";
				registerString = "";
			}

			var divNewComment = createNewCommentBoxFrame(currentElement, 'procid-new-comment', "Save", "textarea", toneString, "200px", arrowPosition, "1px", registerString, false);
			var divNewCommentBoxInput = $(divNewComment).children(".procid-new-comment-box").first().children("textarea")[0];
			$(divNewCommentBoxInput).focus(function() {
				setCaretPosition(divNewCommentBoxInput, divNewCommentBoxInput.value.length);
			});
			$(divNewCommentBoxInput).focus();

			$(divNewComment).children(".procid-new-comment-box").first().children(".procid-button-submit").first().click(function(e) {
				if ($(divNewComment).find(".procid-new-comment-box .procid-checkbox input").first().prop("checked")) {
					tone = tone + "-strong";
				}

				var newCommentContent = divNewCommentBoxInput.value;
				var titleAndLink = saveCommentToDrupal(newCommentContent, issue.link);
				$.ajaxSetup({
					'async' : false
				});
						
				$.post(serverURL + "addNewComment", {
					"issueLink" : issue.link,
					"userName" : currentUser,
					"commentTitle" : commentInfo.title,
					"newCommentTitle" : titleAndLink[0],
					"newCommentLink" : titleAndLink[1],
					"content" : newCommentContent,
					"tone" : tone
				}, function(data) {
					console.log("addNewComment success");

					//add the comment to the current commentInfo list
					addNewComment(titleAndLink[0], titleAndLink[1], currentUser, newCommentContent, tone, data.commented_at, data.summary);
					addCommentToIdea(commentInfo, titleAndLink[0], titleAndLink[1], newCommentContent, tone, currentUser);

				});

				updateCommentsList(commentInfo);

				//close the comment Input box
				currentElement.removeChild(divNewComment);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			$(divNewComment).children(".procid-new-comment-box").first().children(".procid-button-cancel").first().click(function(e) {
				currentElement.removeChild(divNewComment);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			$("#procid-dialog-overlay").click(function() {
				currentElement.removeChild(divNewComment);
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			return divNewComment;
		}
		var saveCommentToDrupal = function(commentText, issueLink) {
			var title = "";
			var link = "";
			$.ajaxSetup({
				'async' : false
			});
						
			$("#edit-comment-body-und-0-value").val(commentText + "\n\n\n <i>Powered by <a href='https:\/\/github.com\/albaloo\/procid-client\/blob\/master\/procid.user.js'>Procid</a></i>");
			$.post('https://drupal.org/' + issueLink, $("#comment-form").serialize(), function(data) {
				var result = $(data).find("div[class^='comment comment-new']").last();
				title = $(result).find(".permalink").text();
				link = $(result).find(".permalink").attr("href");
			});

			link = issue.link + "#" + link.split("#")[1];
			$("#edit-comment-body-und-0-value").val("");
			return [title, link]
		}
		var saveCurrentCommentToDrupal = function(issueLink) {
			var title = "";
			var link = "";
			$.ajaxSetup({
				'async' : false
			});
			$.post('https://drupal.org/' + issueLink, $("#comment-form").serialize(), function(data) {
				var result = $(data).find("div[class^='comment comment-new']").last();
				title = $(result).find(".permalink").text();
				link = $(result).find(".permalink").attr("href");
			});
			link = issue.link + "#" + link.split("#")[1];
			$("#edit-comment-body-und-0-value").val("");
			return [title, link]
		}
		var addNewComment = function(title_, link_, author_, content_, tone_, time_, summary_) {
			var comment = {
				title : title_,
				link : link_,
				author : author_,
				authorLink : "",
				content : content_,
				tags : [],
				status : "Ongoing",
				comments : [],
				idea : "#1",
				criteriaStatuses : [],
				tone : tone_,
				image : "",
				commented_at : time_,
				summary : summary_
			};

			commentInfos.push(comment);
		}
		var addCommentToIdea = function(commentInfo, title_, link_, content_, tone_, author_) {
			var relatedComment = {
				title : title_,
				link : link_,
				content : content_,
				tone : tone_,
				author : author_
			}
			commentInfo.comments.push(relatedComment);
		}
		var createNewCommentBoxFrame = function(currentElement, className, submitText, midElement, placeHolderString, width, arrowPosition, marginLeft, registerString, sentimentTuning) {
			var divProcidOverlay = document.createElement('div');
			divProcidOverlay.setAttribute('id', 'procid-dialog-overlay');
			$('body').prepend(divProcidOverlay);

			var maskHeight = $(document).height();
			var maskWidth = $(window).width();

			$('#procid-dialog-overlay').css({
				height : maskHeight,
				width : maskWidth
			}).show();

			var divNewComment = document.createElement('div');
			divNewComment.setAttribute('class', className);
			divNewComment.style.width = width;
			if (marginLeft != "")
				divNewComment.style.marginLeft = marginLeft;

			currentElement.appendChild(divNewComment);

			var divNewCommentBox = document.createElement('div');
			divNewCommentBox.setAttribute('class', 'procid-new-comment-box');
			divNewComment.appendChild(divNewCommentBox);

			if (midElement === "textarea") {
				var divNewCommentBoxInput = document.createElement('textarea');
				divNewCommentBoxInput.setAttribute('class', 'procid-new-comment-textarea');
				divNewCommentBoxInput.innerHTML = placeHolderString;
				divNewCommentBox.appendChild(divNewCommentBoxInput);

				if (registerString != "") {
					var divCheckBox = document.createElement('div');
					divCheckBox.setAttribute('class', 'procid-checkbox');
					divNewCommentBox.appendChild(divCheckBox);

					var divCheckBoxInput = document.createElement('input');
					divCheckBoxInput.setAttribute('type', 'checkbox');
					divCheckBoxInput.setAttribute('value', 'none');
					divCheckBoxInput.setAttribute('id', 'procid-checkbox-input');
					divCheckBoxInput.setAttribute('name', 'check');
					divCheckBox.appendChild(divCheckBoxInput);

					var divCheckBoxLabel = document.createElement('label');
					divCheckBoxLabel.setAttribute('for', 'procid-checkbox-input');
					divCheckBoxLabel.setAttribute('class', 'procid-checkbox-label');
					divCheckBoxLabel.innerHTML = registerString;
					divCheckBox.appendChild(divCheckBoxLabel);
				} else {
					var divPlaceHolder = document.createElement('div');
					divNewCommentBox.appendChild(divPlaceHolder);
				}

			}else if (midElement === "feedback") {
				var divNewCommentBoxMessage1 = document.createElement('div');
				divNewCommentBoxMessage1.setAttribute('class', 'procid-feedback-comment-text');
				divNewCommentBoxMessage1.innerHTML = placeHolderString;
				divNewCommentBox.appendChild(divNewCommentBoxMessage1); 
				
				var divNewCommentBoxInput = document.createElement('textarea');
				divNewCommentBoxInput.setAttribute('class', 'procid-new-comment-textarea');
				divNewCommentBox.appendChild(divNewCommentBoxInput);

				var divNewCommentBoxMessage2 = document.createElement('div');
				divNewCommentBoxMessage2.setAttribute('class', 'procid-feedback-comment-text');
				divNewCommentBoxMessage2.innerHTML = registerString;
				divNewCommentBox.appendChild(divNewCommentBoxMessage2); 
				
			}else if (midElement === "div") {
				var divNewCommentBoxInput = document.createElement('div');
				divNewCommentBoxInput.setAttribute('class', 'procid-prev-comment-text');
				divNewCommentBoxInput.innerHTML = placeHolderString;
				divNewCommentBox.appendChild(divNewCommentBoxInput);

				if (sentimentTuning) {
					/*var divNewSentimentTuner = document.createElement('div');
					divNewSentimentTuner.setAttribute('class', 'procid-sentiment-tuner');
					divNewCommentBox.appendChild(divNewSentimentTuner);

					var sentimentTunerImagePos = document.createElement('div');
					sentimentTunerImagePos.setAttribute('class', 'procid-sentiment-tuner-image-pos');
					$(sentimentTunerImagePos).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-idea-page.png)");
					divNewSentimentTuner.appendChild(sentimentTunerImagePos);

					sentimentTunerImagePos.onclick = function(cb) {
						$.ajaxSetup({
							'async' : false
						});
						$.post(serverURL + "changeCommentTone", {
							"commentLink" : $(sentimentTunerImagePos).parent().prev().children("a").attr("href"),
							"issueLink" : issue.link,
						    "userName" : currentUser,
							"tone" : "positive",
						}, function(data) {
							updateCommentsList();
						});
						return false;
					}
					var sentimentTunerImageNeutral = document.createElement('div');
					sentimentTunerImageNeutral.setAttribute('class', 'procid-sentiment-tuner-image-neutral');
					$(sentimentTunerImageNeutral).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-idea-page.png)");
					divNewSentimentTuner.appendChild(sentimentTunerImageNeutral);

					sentimentTunerImageNeutral.onclick = function(cb) {
						return false;
						/$.ajaxSetup({
							'async' : false
						});
		
						$.post(serverURL + "changeCommentTone", {
							"commentLink" : $(sentimentTunerImageNeutral).parent().prev().children("a").attr("href"),
							"issueLink" : issue.link,
						    "userName" : currentUser,
							"tone" : "neutral",
						}, function(data) {

						});/
					}
					var sentimentTunerImageCons = document.createElement('div');
					sentimentTunerImageCons.setAttribute('class', 'procid-sentiment-tuner-image-cons');
					$(sentimentTunerImageCons).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-idea-page.png)");
					divNewSentimentTuner.appendChild(sentimentTunerImageCons);

					sentimentTunerImageCons.onclick = function(cb) {
						$.ajaxSetup({
							'async' : false
						});

						$.post(serverURL + "changeCommentTone", {
							"commentLink" : $(sentimentTunerImageCons).parent().prev().children("a").attr("href"),
							"issueLink" : issue.link,
						    "userName" : currentUser,
							"tone" : "negative",
						}, function(data) {

						});
						return false;
					}*/
				}

			}

			var divArrow = document.createElement('div');
			divArrow.setAttribute('class', 'arrow');
			divArrow.style.left = arrowPosition;
			divNewComment.appendChild(divArrow);

			var divShadow = document.createElement('div');
			divShadow.setAttribute('class', 'shadow');
			divShadow.style.left = arrowPosition;
			divNewComment.appendChild(divShadow);
			
			if(submitText == "Send"){
				var divNewCommentBoxSubmit = document.createElement('input');
				divNewCommentBoxSubmit.setAttribute('class', 'procid-button-submit');
				divNewCommentBoxSubmit.setAttribute('type', 'submit');
				divNewCommentBoxSubmit.setAttribute('value', "Send");
				divNewCommentBoxSubmit.setAttribute('name', 'submit');
				divNewCommentBox.appendChild(divNewCommentBoxSubmit);
				divNewCommentBoxSubmit.style.fontSize="13px";
				divNewCommentBoxSubmit.style.marginLeft="90px";
				
				var divNewCommentBoxTooltip = document.createElement('div');
				divNewCommentBoxTooltip.setAttribute('class', 'procid-button-tooltip');
				divNewCommentBoxTooltip.innerHTML = 'Send your feedback to Procid team.';
				divNewCommentBox.appendChild(divNewCommentBoxTooltip);
				divNewCommentBoxTooltip.style.display = "none";

				divNewCommentBoxSubmit.onmouseover = function(e) {
					divNewCommentBoxTooltip.style.display = "inline";
				};
				divNewCommentBoxSubmit.onmouseout = function(e) {
					divNewCommentBoxTooltip.style.display = "none";
				};
			}
			else if (submitText != "") {
				var divNewCommentBoxSubmit = document.createElement('input');
				divNewCommentBoxSubmit.setAttribute('class', 'procid-button-submit');
				divNewCommentBoxSubmit.setAttribute('type', 'submit');
				divNewCommentBoxSubmit.setAttribute('value', submitText);
				divNewCommentBoxSubmit.setAttribute('name', 'submit');
				divNewCommentBox.appendChild(divNewCommentBoxSubmit);

				var divNewCommentBoxCancel = document.createElement('input');
				divNewCommentBoxCancel.setAttribute('class', 'procid-button-cancel');
				divNewCommentBoxCancel.setAttribute('type', 'submit');
				divNewCommentBoxCancel.setAttribute('value', 'Cancel');
				divNewCommentBoxCancel.setAttribute('name', 'cancel');
				divNewCommentBox.appendChild(divNewCommentBoxCancel);

				var divNewCommentBoxTooltip = document.createElement('div');
				divNewCommentBoxTooltip.setAttribute('class', 'procid-button-tooltip');
				divNewCommentBoxTooltip.innerHTML = 'This will post on Drupal.org';
				divNewCommentBox.appendChild(divNewCommentBoxTooltip);
				divNewCommentBoxTooltip.style.display = "none";

				divNewCommentBoxSubmit.onmouseover = function(e) {
					divNewCommentBoxTooltip.style.display = "inline";
				};
				divNewCommentBoxSubmit.onmouseout = function(e) {
					divNewCommentBoxTooltip.style.display = "none";
				};
			} else {
				divNewCommentBox.style.paddingBottom = "4px";
			}
			return divNewComment;
		}
		var updateCommentsList = function(commentInfo) {
			var divIdeaBlock = document.getElementById('procid-idea-block-' + commentInfo.title.substr(1));
			divIdeaBlock.removeChild($(divIdeaBlock).children('.procid-idea-block-comments')[0]);
			createIdeaComments(divIdeaBlock, commentInfo);
		}
		/*******IdeaPage-Criteria List Manipulation*********/

		var createNewCritera = function(title_, description_, id_, author_) {
			var newCriteria = {
				id : id_,
				title : title_,
				description : description_,
				author : author_
			}

			criteria.push(newCriteria);
			return newCriteria;
		}
		var findCriteriaById = function(id) {
			var result = $.grep(criteria, function(e) {
				return e.id == id;
			});
			if (result.length == 0)
				return -1;
			else
				return result[0];
		}
		var createNewCriteriaId = function(tempCriteriaSize) {
			newId = 0;
			$.each(criteria, function() {
				if (this.id > newId)
					newId = this.id;
			});
			newId = newId + (tempCriteriaSize - criteria.length) + 1;
			return newId;
		}
		var findTempCriteriaIndex = function(id, tempCriteria) {
			var result = $.grep(tempCriteria, function(e) {
				return e.id == id;
			});
			if (result.length == 0)
				return -1;
			else{
				var index = tempCriteria.indexOf(result[0])
				return index;
				}

		}
		var findCriteriaTitle = function(id) {
			var result = $.grep(criteria, function(e) {
				return e.id == id;
			});
			if (result.length == 0)
				return -1;
			else
				return result[0].title;

		}
		var findCriteriaDescription = function(id) {
			var result = $.grep(criteria, function(e) {
				return e.id == id;
			});
			if (result.length == 0)
				return -1;
			else
				return result[0].description;

		}
		var deleteCriteria = function(id) {
			var result = $.grep(criteria, function(e) {
				return e.id == id;
			});
			if (result.length == 0)
				return -1;
			else {
				var index = criteria.indexOf(result[0])
				criteria.splice(index, 1);
			}

		}
		var setCriteriaTitle = function(id, title) {
			var result = $.grep(criteria, function(e) {
				return e.id == id;
			});
			if (result.length == 0)
				return -1;
			else {
				var index = criteria.indexOf(result[0])
				criteria[index].title = title;
			}
		}
		var setCriteriaDescription = function(id, description) {
			var result = $.grep(criteria, function(e) {
				return e.id == id;
			});
			if (result.length == 0)
				return -1;
			else {
				var index = criteria.indexOf(result[0])
				criteria[index].description = description;
			}

		}
		var updateCriteriaStatusList = function() {
			//remove previous criteria statuses
			allCriteriaStatuses = [];

			//create new criteria statuses
			for (var i = 0; i < commentInfos.length; i++) {
				if ($.inArray("idea", commentInfos[i].tags) != -1 && commentInfos[i].content != "") {
					var divIdeaBlock = document.getElementById('procid-idea-block-' + commentInfos[i].title.substr(1));
					divIdeaBlock.removeChild($(divIdeaBlock).children('.procid-idea-block-criteria')[0]);
					createIdeaCriteria(divIdeaBlock, commentInfos[i], "edit");
				}
			}
			if (criteria.length > 3)
				$('.procid-idea-block-criteria').css('overflow-y', 'auto');
			else if (criteria.length <= 3)
				$('.procid-idea-block-criteria').css('overflow-y', 'visible');

			createCriteriaStatusTracks();
			createCriterionSelectors();
		}
		/**********IdeaPage-Criteria-Statuses**********/

		var createIdeaCriteria = function(divIdeaBlock, commentInfo, mode) {
			//criteris
			var divCriteria = document.createElement('div');
			divCriteria.setAttribute('class', 'procid-idea-block-criteria');
			if (mode == "edit")
				divIdeaBlock.insertBefore(divCriteria, divIdeaBlock.children[3]);
			else
				divIdeaBlock.appendChild(divCriteria);
			var counter = 0;

			if (criteria.length == 0) {
				var link1 = document.createElement('a');
				link1.setAttribute('class', 'procid-edit-criteria-link');
				link1.setAttribute('href', "#");
				link1.innerHTML = "Add a New Criteria +";
				divCriteria.appendChild(link1);
				link1.onclick = function(e) {
					createEditCriteriaBox($(".procid-ideaPage-header")[0]);
					if (criteria.length != 0)
						$(".procid-idea-block-criteria").remove(".procid-edit-criteria-link");
					//return false;
				};
			}

			if (criteria.length > 3)
				$(divCriteria).css('overflow-y', 'auto');
			else if (criteria.length <= 3)
				$(divCriteria).css('overflow-y', 'visible');

			$.each(criteria, function() {
				var divCriteriaStatus = document.createElement('div');
				divCriteriaStatus.setAttribute('class', 'procid-criteria-block-cell');
				divCriteria.appendChild(divCriteriaStatus);

				var criteriaStatus = findCriteriaStatus(commentInfo, this.id);
				if (criteriaStatus == -1) {
					criteriaStatus = addCriteriaStatus(commentInfo, 0, "", this.id, "", "");
				}
			});
		}
		var addCriteriaStatus = function(commentInfo, value_, comment_, id_, author_, statusCommentTitle_) {
			var found = false;
			var criteriaStatus = {
				value : value_,
				comment : comment_,
				id : id_,
				author : author_,
				statusCommentTitle : statusCommentTitle_
			};

			for (var i = 0; i < commentInfo.criteriaStatuses.length; i++) {
				if (commentInfo.criteriaStatuses[i].id == id_ && commentInfo.criteriaStatuses[i].author == author_) {
					found = true;
					commentInfo.criteriaStatuses[i].value = criteriaStatus.value;
					commentInfo.criteriaStatuses[i].comment = criteriaStatus.comment;
					commentInfo.criteriaStatuses[i].statusCommentTitle = criteriaStatus.statusCommentTitle;
					criteriaStatus = commentInfo.criteriaStatuses[i];
				}
			}

			if (!found)
				commentInfo.criteriaStatuses.push(criteriaStatus);
			return criteriaStatus;
		}
		var findCriteriaStatus = function(commentInfo, id_) {
			var result = $.grep(commentInfo.criteriaStatuses, function(e) {
				return e.id == id_;
			});
			if (result.length == 0)
				return -1;
			else
				return result[0];
		}
		var findAllCriteriaStatuses = function(statuses, id_) {
			var result = [];
			$.each(statuses, function() {
				if (this.id === id_)
					result.push(this);
			});
			return result;
		};

		var createCriteriaStatusTracks = function() {
			var recId = 0;
			for (var i = 0; i < commentInfos.length; i++) {
				if ($.inArray("idea", commentInfos[i].tags) != -1 && commentInfos[i].content != "") {
					if (commentInfos[i].criteriaStatuses.length > 0) {
						$.each(criteria, function() {
							var currentStatusArray = findAllCriteriaStatuses(commentInfos[i].criteriaStatuses, this.id);

							var prevStatusArray = [];
							for (var j = 0; j < currentStatusArray.length - 1; j++) {
								var currentCriteriaStatus = currentStatusArray[j];
								var criterion_track = {
									value : currentCriteriaStatus.value,
									comment : currentCriteriaStatus.comment,
									id : currentCriteriaStatus.id,
									title : commentInfos[i].title,
									author : currentCriteriaStatus.author,
									statusCommentTitle : currentCriteriaStatus.statusCommentTitle,
									commentBox : "",
									originX : -1,
									originValue : -1,
								};
								prevStatusArray.push(criterion_track);
							}

							var lastCriteriaStatus = currentStatusArray[currentStatusArray.length - 1];
							var criterion_track = {
								value : lastCriteriaStatus.value,
								comment : lastCriteriaStatus.comment,
								id : lastCriteriaStatus.id,
								title : commentInfos[i].title,
								author : lastCriteriaStatus.author,
								statusCommentTitle : lastCriteriaStatus.statusCommentTitle,
								commentBox : "",
								originX : -1,
								originValue : -1,
							};

							currentCriteriaStatusRecord = {
								currentCriteriaStatus : criterion_track,
								previousCriteriaStatuses : prevStatusArray,
								recordId : recId
							};
							allCriteriaStatuses.push(currentCriteriaStatusRecord);
							recId++;
						});
					}
				}
			}
		}
		var createCriterionSelectors = function() {
			var color = "lightgray";

			//x function
			var x = d3.scale.quantize().domain([0, 6]).range([43, 70, 97, 124, 151, 178, 205]);

			var mySvg = d3.selectAll('.procid-criteria-block-cell').append("svg:svg").attr("width", '260').attr("height", '50').attr("class", "selector").attr("viewBox", "0 0 260 50");

			d3.selectAll(".selector").append("image").attr("xlink:href", ABSOLUTEPATH + "/images/slider.png").attr("width", "240").attr("x", "5").attr('y', "17").attr("height", "30");

			d3.selectAll(".selector").data(allCriteriaStatuses).append("image").attr("xlink:href", ABSOLUTEPATH + "/images/criteria-bar-minus.png").attr("width", "30").attr("x", "3").attr('y', "15").attr("height", "30").on("click", function(d) {
				var tempTitle = d.currentCriteriaStatus.title.substr(1);
				var identifier = "#procid-criteria-circle-" + tempTitle + "-" + d.currentCriteriaStatus.id;

				var currentCircle = d3.select(identifier).node();

				if (d.currentCriteriaStatus.originX == -1) {
					d.currentCriteriaStatus.originX = x(d.currentCriteriaStatus.value);
					d.currentCriteriaStatus.originValue = d.currentCriteriaStatus.value;
				}

				var value = d.currentCriteriaStatus.value - 1;
				if (value >= 0) {
					if (d.currentCriteriaStatus.commentBox != "") {
						removeCommentBox(currentCircle.parentNode.parentNode, d.currentCriteriaStatus.commentBox)
						d.currentCriteriaStatus.commentBox = "";
					}
					var cx = x(value);
					updateCriteriaCircleLocation(d.currentCriteriaStatus, value, cx, identifier);
					if (d.currentCriteriaStatus.originX != x(d.currentCriteriaStatus.value))
						d.currentCriteriaStatus.commentBox = createNewCommentBoxForCriteria(currentCircle.parentNode.parentNode, d.currentCriteriaStatus.originX, d.currentCriteriaStatus.originValue, d.currentCriteriaStatus, currentCircle, (x(d.currentCriteriaStatus.value) - 30), d);
				}

			}).append("svg:title").text("Decrease Criteria Rating");

			d3.selectAll(".selector").data(allCriteriaStatuses).append("image").attr("xlink:href", ABSOLUTEPATH + "/images/criteria-bar-plus.png").attr("width", "30").attr("x", "217").attr('y', "15").attr("height", "30").on("click", function(d) {
				var tempTitle = d.currentCriteriaStatus.title.substr(1);
				var identifier = "#procid-criteria-circle-" + tempTitle + "-" + d.currentCriteriaStatus.id;

				var currentCircle = d3.select(identifier).node();

				if (d.currentCriteriaStatus.originX == -1) {
					d.currentCriteriaStatus.originX = x(d.currentCriteriaStatus.value);
					d.currentCriteriaStatus.originValue = d.currentCriteriaStatus.value;
				}

				var value = d.currentCriteriaStatus.value + 1;
				if (value <= 6) {
					if (d.currentCriteriaStatus.commentBox != "") {
						removeCommentBox(currentCircle.parentNode.parentNode, d.currentCriteriaStatus.commentBox)
						d.currentCriteriaStatus.commentBox = "";
					}
					var cx = x(value);
					
					updateCriteriaCircleLocation(d.currentCriteriaStatus, value, cx, identifier);
					if (d.currentCriteriaStatus.originX != x(d.currentCriteriaStatus.value))
						d.currentCriteriaStatus.commentBox = createNewCommentBoxForCriteria(currentCircle.parentNode.parentNode, d.currentCriteriaStatus.originX, d.currentCriteriaStatus.originValue, d.currentCriteriaStatus, currentCircle, (x(d.currentCriteriaStatus.value) - 30), d);
				}
			}).append("svg:title").text("Increase Criteria Rating");

			d3.selectAll(".selector").data(allCriteriaStatuses).append("svg:text").attr("id", function(d) {
				var tempTitle = d.currentCriteriaStatus.title.substr(1);
				return "procid-ctitle-text-" + tempTitle + "-" + d.currentCriteriaStatus.id;
			}).attr("class", "procid-criteria-title").attr("dx", function(d) {
				var tempTitle = findCriteriaTitle(d.currentCriteriaStatus.id);
				var length = tempTitle.length * 6;
				return (x(6) - x(0)) / 2 + x(0) - length / 2 - 10;
			}).attr("dy", "17").text(function(d) {
				return findCriteriaTitle(d.currentCriteriaStatus.id);
			}).append("svg:title").text(function(d) {
				return "" + findCriteriaDescription(d.currentCriteriaStatus.id);
			});

			d3.selectAll(".selector").data(allCriteriaStatuses).append("image").attr("xlink:href", ABSOLUTEPATH + "/images/history-1.png").attr("width", "20").attr("style", function(d) {
				if (d.previousCriteriaStatuses.length > 0)
					return "";
				else
					return "display:none;";
			}).attr("x", x(6) - 10).attr('y', "0").attr("height", "20").on("click", function(d) {
				d.recordId
				if (!d3.select(".selector .procid-selector-circle-history-" + d.recordId).empty()) {
					d3.selectAll(".selector .procid-selector-circle-history-" + d.recordId).attr("style", "cursor: pointer");
					d3.selectAll(".selector .procid-selector-circle-history-" + d.recordId).attr("class", "procid-selector-circle-shown-" + d.recordId);
					d3.select(this).attr("xlink:href", ABSOLUTEPATH + "/images/history-2.png");
					d3.selectAll(".selector .procid-criteria-line-" + d.recordId).attr("style", "display:none;");

				} else {
					d3.selectAll(".selector .procid-selector-circle-shown-" + d.recordId).attr("style", "cursor: pointer; display:none;");
					d3.selectAll(".selector .procid-selector-circle-shown-" + d.recordId).attr("class", "procid-selector-circle-history-" + d.recordId);
					d3.select(this).attr("xlink:href", ABSOLUTEPATH + "/images/history-1.png");
					d3.selectAll(".selector .procid-criteria-line-" + d.recordId).attr("style", "");
				}
			}).append("svg:title").text("View Criteria Rating History");

			d3.selectAll(".selector").data(allCriteriaStatuses).append("svg:line").attr("class", function(d) {
				return "procid-criteria-line-" + d.recordId;
			}).attr("id", function(d) {
				var tempTitle = d.currentCriteriaStatus.title.substr(1);
				return "procid-cline-" + tempTitle + "-" + d.currentCriteriaStatus.id;
			}).attr("x1", "36").attr("y1", "28").attr("x2", function(d) {
				return x(d.currentCriteriaStatus.value);
			}).attr("y2", "28").attr("stroke", function(d) {
				if (d.currentCriteriaStatus.value == 3)
					return "#999999";
				else if (d.currentCriteriaStatus.value < 3)
					return "#29abe2";
				else
					return "#8dc53c";
			}).attr("stroke-width", '3');

			d3.selectAll(".selector").data(allCriteriaStatuses).append("svg:circle").attr("id", function(d) {
				var tempTitle = d.currentCriteriaStatus.title.substr(1);
				return "procid-criteria-circle-" + tempTitle + "-" + d.currentCriteriaStatus.id;
			}).attr("class", "procid-selector-circle-default").attr("fill", function(d) {
				if (d.currentCriteriaStatus.comment === "")
					return "white";
				if (d.currentCriteriaStatus.value == 3)
					return "#F0F0F0";
				else if (d.currentCriteriaStatus.value < 3)
					return "#29abe2";
				else
					return "#8dc53c";
			}).attr("stroke", function(d) {
				if (d.currentCriteriaStatus.comment == "")
					return "#999999";
				//"white";
				else if (d.currentCriteriaStatus.value == 3)
					return "#999999";
				else
					return color;
			}).attr("stroke-width", function(d) {
				if (d.currentCriteriaStatus.value == 3)
					return "1.5";
				else
					return "0.25";
			}).attr("style", "cursor: pointer").attr("cy", "28").attr("cx", function(d) {
				return x(d.currentCriteriaStatus.value);
			}).attr("r", "7").on("mouseover", function(d) {
				d3.select(this).style("fill-opacity", .9);
				if (d.currentCriteriaStatus.comment != "")
					this.prevCommentBox = addCriteriaStatusCommentBox(d.currentCriteriaStatus.comment, d.currentCriteriaStatus.author, d.currentCriteriaStatus.statusCommentTitle, this, (x(d.currentCriteriaStatus.value) - 30) + "px");
			}).on("mouseout", function(d) {
				if (d.currentCriteriaStatus.comment != "")
					removeCriteriaStatusCommentBox(this.prevCommentBox, this);
				d3.select(this).style("fill-opacity", 1);
			}).call(d3.behavior.drag().on("dragstart", function(d) {
				this.__origin__ = [x(d.currentCriteriaStatus.value), 28];
				if (d.currentCriteriaStatus.originX == -1) {
					d.currentCriteriaStatus.originX = x(d.currentCriteriaStatus.value);
					d.currentCriteriaStatus.originValue = d.currentCriteriaStatus.value;
				}
				if (d.currentCriteriaStatus.commentBox != null && d.currentCriteriaStatus.commentBox != "") {
					removeCommentBox(this.parentNode.parentNode, d.currentCriteriaStatus.commentBox);
					d.currentCriteriaStatus.commentBox = "";
				}
			}).on("drag", function(d) {
				var firstNum = x.range()[0];
				var diff = x.range()[1] - firstNum;
				var cx = Math.min(x(6), Math.max(x(0), this.__origin__[0] += d3.event.dx));
				cx = Math.floor((cx - x(0)) / diff) * diff + x(0);

				var value = Math.floor((cx - firstNum) / diff);

				updateCriteriaCircleLocation(d.currentCriteriaStatus, value, cx, this);

			}).on("dragend", function(d) {
				if (d.currentCriteriaStatus.originX != x(d.currentCriteriaStatus.value)) {
					d.currentCriteriaStatus.commentBox = createNewCommentBoxForCriteria(this.parentNode.parentNode, d.currentCriteriaStatus.originX, d.currentCriteriaStatus.originValue, d.currentCriteriaStatus, this, (x(d.currentCriteriaStatus.value) - 30), d);
				}
			})).append("svg:title").text(function(d) {
				return "Drag to change the ranking"
			});

			var index = 0;
			var currentSelectors = d3.selectAll(".selector").each(function() {
				//for (var i = 0; i < currentSelectors.length; i++){
				if (index >= allCriteriaStatuses.length)
					return;
				if (allCriteriaStatuses[index].previousCriteriaStatuses.length > 0) {
					var recordId = allCriteriaStatuses[index].recordId;
					d3.select(this).selectAll(".procid-selector-circle-history-" + recordId).data(allCriteriaStatuses[index].previousCriteriaStatuses).enter().append("svg:circle").attr("class", "procid-selector-circle-history-" + recordId).attr("fill", function(d) {
						if (d.value == 3)
							return "#999999";
						//"#F0F0F0";
						else if (d.value < 3)
							return "#29abe2";
						else
							return "#8dc53c";
					}).attr("stroke", function(d) {
						if (d.comment != "")
							return "white";
						else if (d.value == 3)
							return "#999999";
						else
							return color;
					}).attr("stroke-width", function(d) {
						if (d.value == 3)
							return "0.25";
						//"1.5";
						else
							return "0.25";
					}).attr("style", "cursor: pointer; display: none;")
					//.attr("filter", "url(#procid-circle-filter)")
					.attr("cy", "30").attr("cx", function(d) {
						return x(d.value);
					}).attr("r", "8").on("mouseover", function(d) {
						d3.select(this).style("fill-opacity", .9);
						this.prevCommentBox = addCriteriaStatusCommentBox(d.comment, d.author, d.statusCommentTitle, this, (x(d.value) - 30) + "px");
					}).on("mouseout", function() {
						removeCriteriaStatusCommentBox(this.prevCommentBox, this);
						d3.select(this).style("fill-opacity", 1);
					}).attr("opacity", "0.5");
				}
				index++;
			});

		}
		var createNewCommentBoxForCriteria = function(currentElement, originalPosition, originalValue, criterion_track, circle, currentPosition, d) {

			var satisfaction = " satisfies";
			if (criterion_track.value >= 2 && criterion_track.value <= 4)
				satisfaction = " somewhat satisfies"
			else if (criterion_track.value < 2)
				satisfaction = " doesn't satisfy"
			var placeHolderStr = 'I think the idea proposed in ' + criterion_track.title + satisfaction + ' the ' + findCriteriaTitle(criterion_track.id) + ' criteria, because...';

			var divNewComment = createNewCommentBoxFrame(currentElement, 'procid-new-comment', "Save", "textarea", placeHolderStr, "200px", currentPosition + "px", "30px", "", false);

			var divNewCommentBoxInput = $(divNewComment).children(".procid-new-comment-box").first().children("textarea")[0];
			$(divNewCommentBoxInput).focus(function() {
				setCaretPosition(divNewCommentBoxInput, divNewCommentBoxInput.value.length);
			});
			$(divNewCommentBoxInput).focus();

			$(currentElement).css("z-index", "4000");

			$(divNewComment).children(".procid-new-comment-box").first().children(".procid-button-submit").first().click(function(e) {
				var newCommentTitle = "";
				var newCommentLink = "";
				var newCommentTime = "";
				var newCommentTone = "";
				var newCommentSummary = "";
				var newCommentContent = divNewCommentBoxInput.value;
				var titleAndLink = saveCommentToDrupal(newCommentContent, issue.link);
				$.ajaxSetup({
					'async' : false
				});

				$.post(serverURL + "updateCriteriaStatus", {
					"issueLink" : issue.link,
					"userName" : currentUser,
					"commentTitle" : criterion_track.title,
					"value" : criterion_track.value,
					"newCommentTitle" : titleAndLink[0],
					"newCommentLink" : titleAndLink[1],
					"content" : newCommentContent,
					"id" : criterion_track.id
				}, function(data) {
					newCommentTitle = titleAndLink[0];
					newCommentTime = data.newCommentTime;
					newCommentTone = data.newCommentTone;
					newCommentLink = titleAndLink[1];
					newCommentSummary = data.newCommentSummary;
					console.log("updateCriteriaStatus success");
				});
				//close the comment Input box
				currentElement.removeChild(divNewComment);
				updateCriteriaCircleStyle(criterion_track.value, circle);

				//update the commentbar
				var commentInfoIndex = findCommentInfoIndex(criterion_track.title);
				addNewComment(newCommentTitle, newCommentLink, currentUser, newCommentContent, newCommentTone, newCommentTime, newCommentSummary);
				addCommentToIdea(commentInfos[commentInfoIndex], newCommentTitle, newCommentLink, newCommentContent, newCommentTone, currentUser);
				//if exists replace it

				addCriteriaStatus(commentInfos[commentInfoIndex], criterion_track.value, newCommentContent, criterion_track.id, currentUser, newCommentTitle);

				updateCommentsList(commentInfos[commentInfoIndex]);
				//remove the ideas when deleting

				//update the status bar
				var newCriteriaStatus = {
					value : criterion_track.value,
					comment : newCommentContent,
					id : criterion_track.id,
					title : criterion_track.title,
					author : currentUser,
					statusCommentTitle : newCommentTitle,
					originX : -1,
					originValue : -1,
					commentBox : "",
				};

				if (d.currentCriteriaStatus.author != currentUser && d.currentCriteriaStatus.author != "") {
					var index = -1;
					for (var i = 0; i < d.previousCriteriaStatuses.length - 1; i++) {
						if (d.previousCriteriaStatuses[i].author === currentUser) {
							index = i;
						}
					}
					if (index > -1) {
						var removed = d.previousCriteriaStatuses.splice(index, 1);
					}

					var prevCriteriaStatus = {
						value : d.currentCriteriaStatus.value,
						comment : d.currentCriteriaStatus.comment,
						id : d.currentCriteriaStatus.id,
						title : d.currentCriteriaStatus.title,
						author : d.currentCriteriaStatus.author,
						statusCommentTitle : d.currentCriteriaStatus.statusCommentTitle,
						originX : -1,
						originValue : -1,
						commentBox : "",
					};
					d.previousCriteriaStatuses.push(prevCriteriaStatus);
				}
				d.currentCriteriaStatus = newCriteriaStatus;
				$(currentElement).css("z-index", "");
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
			});

			$(divNewComment).children(".procid-new-comment-box").first().children(".procid-button-cancel").first().click(function(e) {
				//go back to the original Location
				updateCriteriaCircleLocation(criterion_track, originalValue, originalPosition, circle);
				//close the comment Input box
				currentElement.removeChild(divNewComment);
				d.currentCriteriaStatus.originX = -1;
				d.currentCriteriaStatus.originValue = -1;
				d.currentCriteriaStatus.commentBox = "";
				$(currentElement).css("z-index", "");
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			$("#procid-dialog-overlay").click(function() {
				//go back to the original Location
				updateCriteriaCircleLocation(criterion_track, originalValue, originalPosition, circle);
				//close the comment Input box
				currentElement.removeChild(divNewComment);
				d.currentCriteriaStatus.originX = -1;
				d.currentCriteriaStatus.originValue = -1;
				d.currentCriteriaStatus.commentBox = "";
				$(currentElement).css("z-index", "");
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
				return false;
			});

			return divNewComment;
		}
		var setCaretPosition = function(elem, caretPos) {
			if ( typeof elem.selectionStart == "number") {
				elem.selectionStart = elem.selectionEnd = elem.value.length;
			} else if ( typeof elem.createTextRange != "undefined") {
				elem.focus();
				var range = elem.createTextRange();
				range.collapse(false);
				range.select();
			}
		}
		var removeCommentBox = function(parent, currentCommentBox) {
			if ($(parent).find(".procid-new-comment").length > 0){
			//if ($(parent).hasClass(".procid-new-comment")){
				parent.removeChild(currentCommentBox);
				$(parent).css("z-index", "");
				$('#procid-dialog-overlay').hide();
				document.body.removeChild(document.getElementById("procid-dialog-overlay"));
			}
		}
		var updateCriteriaCircleLocation = function(d, value, cx, circle) {
			//updating the value
			d.value = value;
			d3.select(circle).attr("cx", cx);
			d3.select(circle).attr("fill", function() {
				if (value == 0 && d.author == "")
					return "white";
				if (value == 3)
					return "#F0F0F0";
				else if (value < 3)
					return "#29abe2";
				else
					return "#8dc53c";
			}).attr("stroke", function() {
				if (value == 3 || (value == 0 && d.author == ""))
					return "#999999";
				else
					return "white";
			}).attr("stroke-width", function() {
				if (value == 3)
					return "1.5";
				else
					return "0.25";
			});

			//updating line position
			var identifier = "#procid-cline-" + d.title.substr(1) + "-" + d.id;
			d3.select(identifier).attr("x2", cx);
			d3.select(identifier).attr("stroke", function() {
				if (value == 3)
					return "#999999";
				else if (value < 3)
					return "#29abe2";
				else
					return "#8dc53c";
			});

		}
		var updateCriteriaCircleStyle = function(value, circle) {
			d3.select(circle).attr("fill", function() {
				if (value == 3)
					return "#F0F0F0";
				else if (value < 3)
					return "#29abe2";
				else
					return "#8dc53c";
			}).attr("stroke", function() {
				if (value == 3)
					return "#999999";
				else
					return "white";
			}).attr("stroke-width", function() {
				if (value == 3)
					return "1.5";
				else
					return "0.25";
			});
		}
		var addCriteriaStatusCommentBox = function(comment, author, statusCommentTitle, circle, arrowPosition) {

			var content = "<strong style='color: #29abe2;'>" + statusCommentTitle + "</strong> <small><i>Posted by " + author + "</i></small> <br/>" + comment;

			var parent = circle.parentNode.parentNode;
			//currentElement, className, submitText, midElement, placeHolderString
			var divNewComment = createNewCommentBoxFrame(parent, 'procid-new-comment', "", "div", content, "200px", arrowPosition, "30px", "", false);

			$('#procid-dialog-overlay').hide();
			document.body.removeChild(document.getElementById("procid-dialog-overlay"));
		
			return divNewComment;
		}
		var removeCriteriaStatusCommentBox = function(prevCommentBox, circle) {
			var parent = circle.parentNode.parentNode;
			parent.removeChild(prevCommentBox);
		}
		/***********************INVITE PAGE********************/
		var createInvitePageBody = function() {
			//Procid Invite Page Body
			var divInviteTitle = document.createElement('h2');
			divInviteTitle.setAttribute('id', 'procid-invite-title');
			divInviteTitle.innerHTML = "Suggested Users to Invite to the Discussion";
			$("#procid-invite-page-wrapper").append(divInviteTitle);

			//invite page filter panel
			var divInviteFilter = document.createElement('div');
			divInviteFilter.setAttribute('id', 'procid-invite-filter');
			$("#procid-invite-page-wrapper").append(divInviteFilter);

			createInviteLense("experience", "procid-invite-filter", "View experienced participants");
			createInviteLense("patches", "procid-invite-filter", "View participants who submitted patches");
			createInviteLense("recency", "procid-invite-filter", "View recent participants");
			createInviteLense("consensus", "procid-invite-filter", "View participants in closed threads");
			createInviteLense("connections", "procid-invite-filter", "View participants with most connections");

			createInviteLense("search", "procid-invite-filter", "Search Participants");

			//Search
			addSearchPanel('procid-invite-search', 'procid-invite-page-wrapper');
			$("#procid-invite-search-panel").css("display", "none");

			//List potential members to invite
			var suggestedPeople = findPeopletoInvite();
			for (var i = 0; i < suggestedPeople.length; i++) {

				var divInviteBlock = document.createElement('div');
				divInviteBlock.setAttribute('class', 'procid-invite-block');

				var divAuthorName = document.createElement('div');
				divAuthorName.setAttribute('class', 'procid-author-name-unselected');
				//divAuthorName.textContent = suggestedPeople[i].author;

				var divAuthorNameLink = document.createElement('a');
				divAuthorNameLink.setAttribute('href', suggestedPeople[i].authorLink);
				divAuthorNameLink.textContent = suggestedPeople[i].author;
				divAuthorName.appendChild(divAuthorNameLink);

				divInviteBlock.appendChild(divAuthorName);

				var divAuthorDescription = document.createElement('div');
				divAuthorDescription.setAttribute('class', 'procid-author-description-unselected');
				divAuthorDescription.textContent = suggestedPeople[i].description;
				divInviteBlock.appendChild(divAuthorDescription);

				var divInviteLink = document.createElement('a');
				divInviteLink.setAttribute('class', 'procid-invite-invitationlink');
				divInviteLink.setAttribute('href', '#' + i);
				divInviteLink.setAttribute('rel', 'tooltip')
				divInviteLink.setAttribute('title', 'Invite this person');
				divInviteLink.onclick = function invitePerson(evt) {
					var currentI = parseInt($(this).attr('href').substr(1), 10);
					var personContactUrl = suggestedPeople[currentI].authorLink + "/contact";
					var personUserName = suggestedPeople[currentI].author;
					
					$.ajaxSetup({
						'async' : true
					});
					
					$.post(serverURL + "invitedParticipant", {
						"issueLink" : issue.link,
						"userName" : currentUser,
						"invitedUserName" : personUserName
					}, function() {
						console.log("invited person logged success");
					});
					
					
					var popup = window.open(personContactUrl);
					popup.onload = function() {
						setTimeout(function() {
							if (!(popup.document.getElementById("page-title").innerHTML === "Access denied")) {
								popup.document.getElementById("edit-subject").value = "Invite to a discussion";
								popup.document.getElementById("edit-message").innerHTML = "I would like to invite you to this discussion: <a href='" + issue.link + "'>" + issue.title + "</a> .";
							}
						}, 2000);
					}
					return false;
				};

				var divInviteLinkImage = document.createElement('div');
				divInviteLinkImage.setAttribute('class', 'procid-invite-invitationlink-image');
				$(divInviteLinkImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-invite-page.png)");
				divInviteLink.appendChild(divInviteLinkImage);

				divInviteBlock.appendChild(divInviteLink);
				$("#procid-invite-page-wrapper").append(divInviteBlock);

			}
		}
		var selectedInviteLens = "";
		var selectedImagePath = "";

		var createInviteLense = function(name, parent, tooltipText) {
			$('<a />').attr({
				id : 'procid-invite-' + name + '-link',
				href : '#',
				rel : 'tooltip',
				title : tooltipText,
				class : 'procid-invite-lens-unselected'
			}).appendTo("#" + parent);

			if (name == "search")
				$("#procid-invite-" + name + "-link").click(function addthePanel(evt) {
					if ($("#procid-invite-" + name + "-link").hasClass('procid-invite-lens-unselected')) {
						$("#procid-invite-" + name + "-link").attr('class', 'procid-invite-lens-selected');
						$("#procid-invite-search-panel").css("display", "block");
						$("div[id='procid-invite-" + name + "-image']").attr('class', "procid-invite-" + name + "-image-selected");
					} else {
						$("#procid-invite-" + name + "-link").attr('class', 'procid-invite-lens-unselected');
						$("#procid-invite-search-panel").css("display", "none");
						$("div[id='procid-invite-" + name + "-image']").attr('class', "procid-invite-" + name + "-image-unselected");
					}
					return false;
				});
			else {
				$("#procid-invite-" + name + "-link").click(function highlightMembers(evt) {
					if ($("div[id='procid-invite-" + name + "-image']").attr('class') === "procid-invite-" + name + "-image-unselected") {

						if ($(".procid-author-description-selected").length > 0) {
							//empty the previous selection
							$(".procid-author-name-selected").attr('class', 'procid-author-name-unselected');
							$(".procid-author-description-selected").map(function() {
								$(this).html($(this).text());
							});
							$(".procid-author-description-selected").attr('class', 'procid-author-description-unselected');

							$("div[id='procid-invite-" + selectedInviteLens + "-image']").attr('class', "procid-invite-" + selectedInviteLens + "-image-unselected");
						}

						$("div[id=procid-invite-page-wrapper] .procid-invite-block").sortElements(function(a, b) {
							var strA = $(a).children(".procid-author-description-unselected")[0].innerHTML.toLowerCase();
							var strB = $(b).children(".procid-author-description-unselected")[0].innerHTML.toLowerCase();
							return sortInvitedMembers(name, strA, strB);
						});

						$(".procid-author-name-unselected")./*slice(0,10).*/attr('class', 'procid-author-name-selected');
						$(".procid-author-description-unselected")./*slice(0,10).*/map(function() {
							var strings = $(this).text().split(",");

							if (name === "experience") {
								$(this).html("<b>" + strings[0] + "</b>, " + strings[1] + ", " + strings[2] + ", " + strings[3] + ", " + strings[4]);
							} else if (name === "patches") {//usability patches
								$(this).html(strings[0] + ", <b>" + strings[1] + "</b>, " + strings[2] + ", " + strings[3] + ", " + strings[4]);
							} else if (name === "consensus") {//closed threads
								$(this).html(strings[0] + ", " + strings[1] + ", <b>" + strings[2] + "</b>, " + strings[3] + ", " + strings[4]);
							} else if (name == "recency") {//recency
								$(this).html(strings[0] + ", " + strings[1] + ", " + strings[2] + ", <b>" + strings[3] + "</b>" + ", " + strings[4]);
							} else if (name == "connections") {//connections
								$(this).html(strings[0] + ", " + strings[1] + ", " + strings[2] + ", " + strings[3] + ", <b>" + strings[4] + "</b>");
							}
						});
						$(".procid-author-description-unselected")./*slice(0,10).*/attr('class', 'procid-author-description-selected');
						$("div[id='procid-invite-" + name + "-image']").attr('class', "procid-invite-" + name + "-image-selected");
						selectedInviteLens = name;
					} else {
						$(".procid-author-name-selected").attr('class', 'procid-author-name-unselected');
						$(".procid-author-description-selected").map(function() {
							$(this).html($(this).text());
						});
						$(".procid-author-description-selected").attr('class', 'procid-author-description-unselected');
						$("div[id='procid-invite-" + name + "-image']").attr('class', "procid-invite-" + name + "-image-unselected");
						//selectedInviteLens = "";
					}
					$.ajaxSetup({
						'async' : true
					});

					$.post(serverURL + "inviteLensClicked", {
						"issueLink" : issue.link,
						"userName" : currentUser,
						"tagName" : name
					}, function() {
						console.log("tag logged success");
					});
					return false;

				});
			}

			var divInviteLensImage = document.createElement('div');
			divInviteLensImage.setAttribute('id', 'procid-invite-' + name + '-image');
			$(divInviteLensImage).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-invite-page.png)");
			divInviteLensImage.setAttribute('class', 'procid-invite-' + name + '-image-unselected');
			$("#procid-invite-" + name + '-link').append(divInviteLensImage);

		}
		var findPeopletoInvite = function() {
			var suggestedMembers = [];
			$.ajaxSetup({
				'async' : false
			});

			$.post(serverURL + "findPotentialParticipants", {
				"issueLink" : issue.link
			}, function(data) {
				$.each(data.invitedMembers, function(i, member) {
					suggestedMembers.push(member);
				});
			});

			return suggestedMembers;
		}
		var sortInvitedMembers = function(name, strA, strB) {
			var aStrings = strA.split(",");
			var bStrings = strB.split(",");
			//experience
			if (name === "experience") {
				var numA = findNumExperience(aStrings[0]);
				var numB = findNumExperience(bStrings[0]);
				return numA > numB ? -1 : 1;
			} else if (name === "patches") {//usability patches
				var numA = parseInt(aStrings[1].replace(/(^\d+)(.+$)/i, '$1'), 10);
				if (isNaN(numA))
					numA = 0;
				var numB = parseInt(bStrings[1].replace(/(^\d+)(.+$)/i, '$1'), 10);
				if (isNaN(numB))
					numB = 0;

				return numA > numB ? -1 : 1;
			} else if (name === "consensus") {//closed threads
				var numA = parseInt(aStrings[2].replace(/(^\d+)(.+$)/i, '$1'), 10);
				var numB = parseInt(bStrings[2].replace(/(^\d+)(.+$)/i, '$1'), 10);
				return numA > numB ? -1 : 1;
			} else if (name === "connections") {//triads
				if (aStrings[4].indexOf("no previous interactions with current participants") > 0)
					return 1;
				else if (bStrings[4].indexOf("no previous interactions with current participants") > 0)
					return -1;

				var numA = parseInt(aStrings[4].match(/\d+/)[0], 10);
				if (isNaN(numA))
					numA = 0;
				var numB = parseInt(bStrings[4].match(/\d+/)[0], 10);
				if (isNaN(numB))
					numB = 0;

				return numA > numB ? -1 : 1;
			} else {//recency

				if (aStrings[3].indexOf("not recently commented on a usability thread") > 0)
					return 1;
				else if (bStrings[3].indexOf("not recently commented on a usability thread") > 0)
					return -1;

				var numA = parseInt(aStrings[3].match(/\d+/)[0], 10);
				var aSubStrings = aStrings[3].split(" ");
				var date = aSubStrings[aSubStrings.length - 2];
				if (date.indexOf("month") != -1)
					numA = numA * 30;
				else if (date.indexOf("year") != -1)
					numA = numA * 365;
				var numB = parseInt(bStrings[3].match(/\d+/)[0], 10);
				var bSubStrings = bStrings[3].split(" ");
				var dateB = bSubStrings[bSubStrings.length - 2];

				if (dateB.indexOf("month") != -1)
					numB = numB * 30;
				else if (dateB.indexOf("year") != -1)
					numB = numB * 365;

				return numA > numB ? 1 : -1;
			}

		}
		var findNumExperience = function(str) {
			var pattern = /[0-9]+/g;
			var matches = str.match(pattern);
			var result = 0;
			if (matches != null && matches != []) {
				if (matches.length > 1) {
					result = parseInt(matches[0], 10) * 52 + parseInt(matches[1], 10);
				} else if (matches.length == 1 && str.indexOf('year') > 0) {
					result = parseInt(matches[0], 10) * 52;
				} else if (matches.length == 1 && str.indexOf('week') > 0) {
					result = parseInt(matches[0], 10);
				}
			}
			return result;
		}
		setUpProcid();
		console.log("done");
	});
};

// load jQuery and execute the main function
//addJQuery(main);
loadAndExecute("//raw.github.com/headjs/headjs/v0.99/dist/head.min.js", main);