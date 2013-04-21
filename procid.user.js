// ==UserScript==
// @name           Procid
// @description    Interactive system supporting consensus building.
// @icon           https://raw.github.com/albaloo/procid/master/icon.jpg
// @author         Roshanak Zilouchian
// @version        1.0
// @grant          none
// @include        http://drupal.org/*
// @include        https://drupal.org/*
// @include        http://*.drupal.org/*
// @include        https://*.drupal.org/*
// @include        https://web.engr.illinois.edu/~rzilouc2/procid/example*
// ==/UserScript==

// a function that loads head.js which then loads jQuery and d3
function addJQuery(callback) {
	//Jquery Script
	var script = document.createElement("script");
	script.setAttribute("src", "//headjs.com/media/libs/headjs/0.99/head.min.js");
	script.addEventListener('load', function() {
		var script = document.createElement("script");
		script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
		var body = document.getElementsByTagName('head')[0];
		body.appendChild(script);
	}, false);

	var body1 = document.getElementsByTagName('head')[0];
	body1.appendChild(script);
};
	

// the main function of this userscript
function main() {

head.js("//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js", "//cdnjs.cloudflare.com/ajax/libs/d3/3.0.8/d3.min.js", function() {
	console.log("begin");
	var ABSOLUTEPATH = 'https://raw.github.com/albaloo/procid-client/master';
	var CSSSERVERPATH = 'http://web.engr.illinois.edu/~rzilouc2/procid';
	var serverURL='http://0.0.0.0:3000/';
	//var serverURL='http://procid-server.herokuapp.com/';//'http://protected-dawn-3784.herokuapp.com/';	
	var commentInfos = [];
	var criteria = [];
	var allCriteria = [];
	var issue = {
				title : "",
				link : "",
				author : "",
				authorLink : "",
				status : "",
				created_at: ""
			};

	if (!window.d3) { 
		loadScript("//cdnjs.cloudflare.com/ajax/libs/d3/3.0.8/d3.min.js"); 
		}

jQuery.fn.sortElements = (function(){
 
    var sort = [].sort;
 
    return function(comparator, getSortable) {
 
        getSortable = getSortable || function(){return this;};
 
        var placements = this.map(function(){
 
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
 
                // Since the element itself will change position, we have
                // to have some way of storing its original position in
                // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
 
            return function() {
 
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
 
                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
 
            };
 
        });
 
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
 
    };
 
})();


	var addCSSToHeader = function() {
		var header = document.getElementsByTagName('head')[0];
		var csslink = document.createElement('link');
		csslink.setAttribute('href', CSSSERVERPATH + '/style.css');
		csslink.setAttribute('rel', 'stylesheet');
		csslink.setAttribute('type', 'text/css');
		header.appendChild(csslink);
	};

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
			$("#" + this).toggle();
		});
		setStatusVar(destination);
	}

	var createProcidHeader = function() {
		//Ruler
		$('<span />').attr({
			id : 'procid-ruler',
		}).appendTo("#procid-left-panel-header");

		//Menu
		$('<ul />').attr({
			id : 'procid-menus',
		}).appendTo("#procid-left-panel-header");

		$("#procid-menus").css("border-image", "url(" + ABSOLUTEPATH + "/images/top-line.png) 13 2 round");
		//Procid Label
		$('<img />').attr({
			id : 'procid-label',
			src: ABSOLUTEPATH + '/images/procid-label.png',
		}).appendTo("#procid-menus");

		//Setting
		$('<a />').attr({
			id : 'procid-setting-link',
			href : '#',
			rel : 'tooltip',
			title : 'Settings'
		}).click(function goSetting(evt) {

		}).appendTo("#procid-menus");

		$('<img />').attr({
			id : 'procid-setting-image',
			src : ABSOLUTEPATH + '/images/settings-1.jpg',
		}).appendTo("#procid-setting-link");

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

		$('<img />').attr({
			id : 'procid-home-image',
			src : ABSOLUTEPATH + '/images/home-1.jpg',
		}).appendTo("#procid-home-link");

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

		$('<img />').attr({
			id : 'procid-ideaBased-image',
			src : ABSOLUTEPATH + '/images/dashboard-1.jpg',
		}).appendTo("#procid-ideaBased-link");

		//Invite
		$('<li />').attr({
			id : 'procid-invite',
		}).appendTo("#procid-menus-navigation-panel");

		$("#procid-invite").css("border-image", "url("+ ABSOLUTEPATH +"/images/icon-border-left.png) 2 5 round");

		$('<a />').attr({
			id : 'procid-invite-link',
			href : '#',
			rel : 'tooltip',
			title : 'Invite New Participants'
		}).click(function goInvite(evt) {
			changePage('invite');
		}).appendTo("#procid-invite");

		$('<img />').attr({
			id : 'procid-invite-image',
			src : ABSOLUTEPATH + '/images/invite-1.jpg',
		}).appendTo("#procid-invite-link");

		$("#procid-menus li").css("border-image", "url("+ ABSOLUTEPATH +"/images/icon-border-left.png) 2 5 round");
	}

	var addSearchPanel = function(name, parent) {
		$('<div />').attr({
			id : name+"-panel",
			class : 'searchForm',
			//method : 'get',
			//action : '',
		}).appendTo("#" + parent);

		$('<input type="text" />').attr({
			name : 'q',
			class : 'searchFormInput',
			id : name+"-input-form",
			size : '40',
			placeholder : 'Search...',
		}).appendTo("#" + name+"-panel");

		if(name == "procid-search"){
			//Search comments
			$("#" + name + "-input-form").keyup(function() {
				$("div[class='procid-comment'] a").map(function() {
					var value = $("#" + name + "-input-form").val().toLowerCase();
					var currentText = $(this).text().toLowerCase();
					
					if(currentText.indexOf(value) === -1)
						$(this).parents(".procid-comment").css("display","none");
					else
						$(this).parents(".procid-comment").css("display","block");
				});
			});
		}else{
			//Search potential Members
			$("#" + name + "-input-form").keyup(function() {
				$("div[id='procid-invite-block'] div[id='procid-author-name']").map(function() {
					var value = $("#" + name + "-input-form").val().toLowerCase();
					var currentText = $(this).text().toLowerCase();
					
					if(currentText.indexOf(value) === -1)
						$(this).parent().css("display","none");
					else
						$(this).parent().css("display","block");
				});
			});		
		}
	}

	var removeSearchPanel = function(name, parent) {
		$("#" + parent).remove("#" + name+"-panel");
	}

	var createLense = function(name, parent, tooltipText) {
	//TODO: use CSS sprite
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
		})/*.hover(function highlightLensIcon(evt) {
			$("img[id='procid-"+name+"-image']").attr('src', ABSOLUTEPATH + '/images/' + name + '-2.png')
		})*/.appendTo("#procid-" + name);

		if(name == "search")
			$("#procid-"+name+"-link").click(function addthePanel(evt) {
				if($("#procid-"+name+"-link").hasClass('unselected')){
					$("#procid-"+name+"-link").attr('class', 'selected');
					$("#procid-search-panel").css("display", "block");
					$("img[id='procid-"+name+"-image']").attr('src', ABSOLUTEPATH + '/images/' + name + '-3.png')
				}
				else{
					$("#procid-"+name+"-link").attr('class', 'unselected');
					$("#procid-search-panel").css("display", "none");
					$("img[id='procid-"+name+"-image']").attr('src', ABSOLUTEPATH + '/images/' + name + '-1.png')
				}
		});
		else
			$("#procid-"+name+"-link").click(function highlightComments(evt) {
			if ($("div[id='procid-comment-" + name + "'] a").hasClass('unselected')) {
				$("div[id='procid-comment-" + name + "'] a").attr('class', 'selected');
				$("div[id='procid-comment-" + name + "'] img").attr('class', 'image-selected');
				$("div[id='procid-comment-" + name + "'] img").attr('src', ABSOLUTEPATH + '/images/' + name + '-tiny.png');
				$("img[id='procid-"+name+"-image']").attr('src', ABSOLUTEPATH + '/images/' + name + '-3.png')
			} else {
				$("div[id='procid-comment-" + name + "'] a").attr('class', 'unselected');
				$("div[id='procid-comment-" + name + "'] img").attr('class', 'image-unselected');
				$("img[id='procid-"+name+"-image']").attr('src', ABSOLUTEPATH + '/images/' + name + '-1.png')
			}
			return true;

		});

		$('<img />').attr({
			id : 'procid-' + name + '-image',
			src : ABSOLUTEPATH + '/images/' + name + '-1.png',
		}).appendTo("#procid-" + name + '-link');

	}
	var initializeIssueInfo = function(){
		var issueAuthor = $("#content-inner div[class='submitted'] a").first().text();
		var issueAuthorLink = $("#content-inner div[class='submitted'] a").first().attr('href');
		var issueCreationDate = $("#content-inner div[class='submitted'] em").first().text;		

		var issueStatus = $("#project-issue-summary-table tr:contains('Status:') td").last().text();
		
		var issueTitle = $("#page-subtitle").first().text();
		

		var path = window.location.pathname;
		if(path.indexOf("node") >= 0)
			var issueLink = window.location.pathname;
		else{
			var link = $("h3[class='comment-title'] a").first().attr('href');
			var index = link.indexOf("#")
			issueLink = link.substring(0, index);
		}
		
		issue.title = issueTitle;
		issue.link = issueLink;
		issue.author = issueAuthor;
		issue.authorLink = issueAuthorLink;
		issue.status = issueStatus;
		issue.created_at = issueCreationDate;
  
	}
	var initializeCommentInfo = function() {
		var array_title = $("h3[class='comment-title']").map(function() {
			return $(this).text();
		});

		var array_links = $("h3[class='comment-title'] a").map(function() {
			return $(this).attr('href');
		});

		var array_author = $("#comments div[class='submitted']").map(function() {
			var authors=$(this).find("a");
			if(authors.length > 0)
				return $(this).find("a").text();
			else
				return "Anonymous";
		});

		var array_author_hrefs = $("#comments div[class='submitted']").map(function() {
			var authors=$(this).find("a");
			if(authors.length > 0)
				return $(this).find("a").attr("href");
			else
				return "#";
		});

		var array_dateTimes = $("#comments div[class='submitted'] em").map(function(){
			return $(this).text();			
		});

		var array_contents = $("div[class='content'] div[class='clear-block']").map(function() {
			var contents = $(this).children("p");
			var returnValue = "";
			$.each(contents, function() {
				returnValue += $(this).text();
			});
			return returnValue;
		});

		var array_patches =  $("div[class='content'] div[class='clear-block']").map(function() {
			var returnValue = 0;
			var patches=$(this).find("tr[class^='pift-pass'],tr[class^='pift-fail']");
			if(patches.length > 0)
				returnValue = 1;
			return returnValue;			
		});

		var array_images = $("div[class='content'] div[class='clear-block']").map(function() {
			var returnValue = " ";
			var contents = $(this).find("a");
			$.each(contents, function() {
				var link = $(this).attr("href");
				if (link.match(/png$/) || link.match(/jpg$/)) {
					returnValue = link;
				}
			});

			var imgs = $(this).find("img");
			$.each(imgs, function() {
				var link = $(this).attr("src");
				if (link.match(/png$/) || link.match(/jpg$/)) {
					returnValue = link;
				}
			});
			return returnValue;
		});

		var len = array_title.length;
		for (var i = 0; i < len; i++) {
			initTags = [];
			if(array_patches[i]>0)
				initTags.push("patch");
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
				criteria : [],
				tone: "",
				image : array_images[i],
				commented_at: array_dateTimes[i],
				summary: ""
			};
			commentInfos.push(comment);
		}
		return commentInfos;
	}
	
	var applyTags = function(commentInfo) {
		var div1 = document.createElement('div');
		div1.setAttribute('class', 'procid-comment');
		var divinner = div1;
		$(".procid-comment").map(function(){
			$(this).css("border-image", "url("+ ABSOLUTEPATH +"/images/sidebar_border.png) 11 2 round");
			});

		$.each(commentInfo.tags, function() {
			var divTag = document.createElement('div');
			divTag.setAttribute('id', 'procid-comment-' + this);
			divinner.appendChild(divTag);
			divinner = divTag;
		});

		$('<img />').attr({
			id : 'procid-selected-comment-image',
			class : 'image-unselected',
			src : ABSOLUTEPATH + '/images/patch-tiny.png',
		}).appendTo(divinner);

		$('<a />').attr({
			id : 'procid-comment-link',
			href : commentInfo.link,
			class : 'unselected',
			rel : 'tooltip',
			title : 'see comment'
		}).text(commentInfo.title + "\t" + commentInfo.author + commentInfo.summary).appendTo(divinner);

		$("#procid-left-panel-body").append(div1);
	}
	var createHomePageBody = function() {
		//Procid Home Body
		var lenses = document.createElement('ul');
		lenses.setAttribute('id', 'procid-lenses');
		$("#procid-left-panel-body").append(lenses);

		createLense('mustread', 'procid-lenses', 'View Must Read Comments');
		createLense('idea', 'procid-lenses', 'View Ideas');
		createLense('conversation', 'procid-lenses', 'View Conversation Comments');
		createLense('expert', 'procid-lenses', 'View Comments Posted by Experts');
		createLense('patch', 'procid-lenses', 'View Patches');
		createLense('search', 'procid-lenses', 'Search');
		$("#procid-search-link").css("border-image", "url("+ ABSOLUTEPATH +"/images/icon-border-left.png) 2 5 round");

		addSearchPanel('procid-search', "procid-left-panel-body");
		$("#procid-search-panel").css("display", "none");
		initializeCommentInfo();
		initializeIssueInfo();
		
		$.ajaxSetup({
			'async' : false
		});

		
		$.post(serverURL+"postcomments", {
			"issue" : JSON.stringify(issue),
			"commentInfos" : JSON.stringify(commentInfos)
		}, function(data) {
			$.each(data.issueComments, function(i, comment) {
				if(i>=commentInfos.length){
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
						criteria : comment.criteria,
						tone: comment.tone,
						image : "",
						commented_at: comment.commented_at,
						summary: comment.summary
					};
					commentInfos.push(newComment);
					applyTags(newComment)
				}
				else{
					commentInfos[i].tags = comment.tags;
					commentInfos[i].tone = comment.tone;
					commentInfos[i].comments = comment.comments;
					//commentInfos[i].criteria = comment.criteria;
					commentInfos[i].status = comment.status;
					commentInfos[i].summary = comment.summary;
					applyTags(commentInfos[i]);
				}
			});
			criteria=data.criteria;
		});

	}
	var createEditCriteriaBox = function() {
		var editCriteriaBox = document.createElement("div");
		editCriteriaBox.setAttribute("id", "procid-editCriteriaBox");
		editCriteriaBox.onclick = function(e) {
			document.body.removeChild(document.getElementById("procid-editCriteriaBox"));
			document.body.removeChild(document.getElementById("procid-editCriteriaBox-div"));
		};
		$('body').append(editCriteriaBox);

		var editCriteriaBoxDiv = document.createElement("div");
		editCriteriaBoxDiv.setAttribute("id", "procid-editCriteriaBox-div");
		$('body').append(editCriteriaBoxDiv);

		//<a id="close" href="#"></a>
		var editCriteriaBoxDivClose = document.createElement("img");
		editCriteriaBoxDivClose.setAttribute("id", "procid-editCriteriaBox-div-close");
		editCriteriaBoxDivClose.setAttribute("src", ABSOLUTEPATH + '/images/closeButton.png');
		editCriteriaBoxDivClose.onclick = function(e) {
			document.body.removeChild(document.getElementById("procid-editCriteriaBox"));
			document.body.removeChild(document.getElementById("procid-editCriteriaBox-div"));
		};
		$("#procid-editCriteriaBox-div").append(editCriteriaBoxDivClose);

		var label = document.createElement('h3');
		label.setAttribute('id', 'procid-editCriteriaBox-header-label');
		label.innerHTML = "Edit Criteria";
		$("#procid-editCriteriaBox-div").append(label);

		var hr = document.createElement('hr');
		hr.style.background = "url(" + ABSOLUTEPATH + "/images/sidebar_divider.png) repeat-x";
		$("#procid-editCriteriaBox-div").append(hr);

		var tempCriteria = [];
		$.each(criteria, function() {
			//<input type='text' name='txt'>
			var divCriteria = document.createElement('div');
			divCriteria.setAttribute('id', 'procid-editCriteriaBox-div-block');
			$("#procid-editCriteriaBox-div").append(divCriteria);

			tempCriteria.push(this);

			var title = document.createElement('label');
			title.setAttribute('id', 'procid-editCriteriaBox-title-label');
			title.innerHTML = "Title";
			divCriteria.appendChild(title);

			var titleInput = document.createElement('input');
			titleInput.setAttribute('id', 'procid-editCriteriaBox-title-input' + this.id);
			titleInput.setAttribute('class', 'titleInput');
			titleInput.setAttribute('type', 'text');
			titleInput.setAttribute('name', 'labelInput');
			titleInput.value = this.title;
			$("#procid-editCriteriaBox-title-input" + this.id).bind("keyup change", function() {
				//tempCriteria[i].title = this.value; i is the last i
			});
			divCriteria.appendChild(titleInput);

			var descriptionLabel = document.createElement('label');
			descriptionLabel.setAttribute('id', 'procid-editCriteriaBox-description-label');
			descriptionLabel.innerHTML = "Description";
			divCriteria.appendChild(descriptionLabel);

			var description = document.createElement('input');
			description.setAttribute('id', 'procid-editCriteriaBox-description-input' + this.id);
			description.setAttribute('class', 'descriptionInput');
			description.setAttribute('type', 'text');
			description.setAttribute('name', 'description');
			description.value = this.description;
			$("#procid-editCriteriaBox-description-input" + this.id).bind("keyup change", function() {
				//tempCriteria[i].description = this.value;
			});
			divCriteria.appendChild(description);

		});
		
		var newCriterion = {
			id : 1,
			title : "",
			description : ""
		}
		if(criteria.length > 0){
			newCriterion.id=criteria[criteria.length-1].id+1;
		}

		var divCriteria = document.createElement('div');
			divCriteria.setAttribute('id', 'procid-editCriteriaBox-div-block');
			$("#procid-editCriteriaBox-div").append(divCriteria);

		var title = document.createElement('label');
		title.setAttribute('id', 'procid-editCriteriaBox-title-label');
		title.innerHTML = "Title";
		divCriteria.appendChild(title);

		var titleInput = document.createElement('input');
		titleInput.setAttribute('id', 'procid-editCriteriaBox-title-input');
		titleInput.setAttribute('type', 'text');
		titleInput.setAttribute('class', 'titleInput');
		titleInput.setAttribute('name', 'labelInput');
		titleInput.value = "Title...";
		divCriteria.appendChild(titleInput);

		var descriptionLabel = document.createElement('label');
		descriptionLabel.setAttribute('id', 'procid-editCriteriaBox-description-label');
		descriptionLabel.innerHTML = "Description";
		divCriteria.appendChild(descriptionLabel);

		var description = document.createElement('input');
		description.setAttribute('id', 'procid-editCriteriaBox-description-input');
		description.setAttribute('type', 'text');
		description.setAttribute('name', 'description');
		description.setAttribute('class', 'descriptionInput');
		description.value = "Describe the criteria...";
		divCriteria.appendChild(description);

		var saveButton = document.createElement('input');
		saveButton.setAttribute('id', 'procid-editCriteriaBox-save');
		saveButton.setAttribute('type', 'button');
		saveButton.value = "Save";
		saveButton.onclick = function(e) {
			var i = 0;
			newCriterion.description=description.value;
			newCriterion.title=titleInput.value;
			criteria.push(newCriterion);
			//TODO: Username needs to be determined
			$.post(serverURL+"addCriteria", {
				"issueLink" : issue.link, "userName" : "webchick", "title" : newCriterion.title, "description" : newCriterion.description, id : newCriterion.id}, function() {
					console.log("success");
				});
			$.each(tempCriteria, function() {
				criteria[i].title = $("#procid-editCriteriaBox-title-input" + this.id).val();
				$(".procid-svg-criteria-lower" + this.id).map(function() {
					this.text(criteria[i].title);

				});

				i++;
			});

			document.body.removeChild(document.getElementById("procid-editCriteriaBox"));
			document.body.removeChild(document.getElementById("procid-editCriteriaBox-div"));
		};
		$("#procid-editCriteriaBox-div").append(saveButton);
	}

	var enableAddcomment = function() {
		if ($("div[id='procid-idea-comments'] a").hasClass('show')) {
			$("div[id='procid-idea-comments'] a").attr('class', 'hide');
		} else {
			$("div[id='procid-idea-comments'] a").attr('class', 'show');
		}
		return true;
	}
	var createLabel = function(name, link) {
		var label = document.createElement('h3');
		label.setAttribute('id', 'procid-' + name + '-label');
		label.setAttribute('class', 'ideaPage-header-label');
		label.innerHTML = name;
		$("#procid-ideaPage-header").append(label);

		var link1 = document.createElement('a');
		link1.setAttribute('id', 'procid-edit-link');
		link1.setAttribute('href', "#");
		link1.innerHTML = link;
		link1.onclick = function(e) {
			if (link === "(edit)") {
				createEditCriteriaBox();
			} else if (link === "(add)") {
				enableAddcomment();
			}
		};
		label.appendChild(link1);
	}
	var createIdeaImage = function(divIdeaBlock, commentInfo) {
		var divIdea = document.createElement('div');
		divIdea.setAttribute('id', 'procid-idea');
		divIdea.setAttribute('class', 'procid-idea-block-outer-cell');
		divIdeaBlock.appendChild(divIdea);

		var link1 = document.createElement('a');
		link1.setAttribute('id', 'procid-author-link');
		link1.setAttribute('href', commentInfo.authorLink);
		link1.setAttribute('class', 'ideaPage-link');
		link1.innerHTML = commentInfo.author;

		var divIdeaImage = document.createElement('div');
		divIdeaImage.setAttribute('id', 'procid-idea-div-image');

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
	var createIdeaStatus = function(divIdeaBlock, commentInfo) {
		var divStatus = document.createElement('div');
		divStatus.setAttribute('id', 'procid-status');
		divStatus.setAttribute('class', 'procid-idea-block-inner-cell');
		divIdeaBlock.appendChild(divStatus);

		/*<div id="dd" class="wrapper-dropdown-3" tabindex="1">
		 <span>Transport</span>
		 <ul class="dropdown">
		 <li><a href="#"><i class="icon-envelope icon-large"></i>Classic mail</a></li>
		 <li><a href="#"><i class="icon-truck icon-large"></i>UPS Delivery</a></li>
		 <li><a href="#"><i class="icon-plane icon-large"></i>Private jet</a></li>
		 </ul>
		 </div>*/

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
		wrapperDropdownText.innerHTML = commentInfo.status
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
				$.post(serverURL+"setIdeaStatus", {
				"issueLink" : issue.link, "commentTitle" : commentInfo.title, "status" : opt.text()
				}, function() {
					console.log("success");
				});
 
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
	var addIcon = function(divParent, iconPath, divId, iconId) {		
		var divIcon = document.createElement('div');
		divIcon.setAttribute('id', divId);
		divParent.appendChild(divIcon);
		
		addImage(divIcon, iconPath, iconId);
	}
	
	var addImage = function(divParent, iconPath, iconId) {
		var icon = document.createElement('img');
		icon.setAttribute('id', iconId);
		icon.setAttribute('src', iconPath);
		divParent.appendChild(icon);
	}
	
	var findComment = function(number){
		
		var result = $.grep(commentInfos, function(e) {
			return e.title == number;
		});
		if (result.length == 0)
			return -1;
		else
			return result[0];
	}
	var createIdeaComments = function(divIdeaBlock, commentInfo) {
		//comments on an idea
		var divComments = document.createElement('div');
		divComments.setAttribute('id', 'procid-idea-comments');
		divComments.setAttribute('class', 'procid-idea-block-outer-cell');
		divIdeaBlock.appendChild(divComments);

		var divCommentHeader = document.createElement('div');
		divCommentHeader.setAttribute('id', 'procid-idea-comment-header');
		divComments.appendChild(divCommentHeader);
		
		addIcon(divCommentHeader, ABSOLUTEPATH + "/images/pros.png", 'procid-idea-comment-div-icon', "procid-idea-comment-icon");
		addIcon(divCommentHeader, ABSOLUTEPATH + "/images/nuetral.png", 'procid-idea-comment-div-icon', "procid-idea-comment-icon");
		addIcon(divCommentHeader, ABSOLUTEPATH + "/images/cons.png", 'procid-idea-comment-div-icon', "procid-idea-comment-icon");

		var divCommentColumns = document.createElement('div');
		divCommentColumns.setAttribute('id', 'procid-idea-comment-columns');
		divComments.appendChild(divCommentColumns);
		
		var divProsColumn = document.createElement('div');
		divProsColumn.setAttribute('id', 'procid-idea-comment-column');
		divCommentColumns.appendChild(divProsColumn);
		
		addIcon(divCommentColumns, ABSOLUTEPATH + "/images/sidebar_divider.png", 'procid-idea-comment-div-divider', "procid-idea-comment-divider");
		
		var divNuetralColumn = document.createElement('div');
		divNuetralColumn.setAttribute('id', 'procid-idea-comment-column');
		divCommentColumns.appendChild(divNuetralColumn);
		
		addIcon(divCommentColumns, ABSOLUTEPATH + "/images/sidebar_divider.png", 'procid-idea-comment-div-divider', "procid-idea-comment-divider");
		
		var divConsColumn = document.createElement('div');
		divConsColumn.setAttribute('id', 'procid-idea-comment-column');
		divCommentColumns.appendChild(divConsColumn);
		
		var srcPath = ABSOLUTEPATH + "/images/comment.png";

		$.each(commentInfo.comments, function() {
			var string = "#"+this;
			var comment = findComment(string);
			if(comment.tone == "positive"){
				addImage(divProsColumn, srcPath, 'procid-idea-comment-img');
			}else if(comment.tone == "nuetral"){
				addImage(divNuetralColumn, srcPath, 'procid-idea-comment-img');
			}else if(comment.tone == "negative"){
				addImage(divConsColumn, srcPath, 'procid-idea-comment-img');
			}
		});

		/*var addComment = document.createElement('a');
		addComment.setAttribute('id', 'procid-addcomment-link');
		addComment.setAttribute('href', "#");
		addComment.setAttribute('rel', "tooltip");
		addComment.setAttribute('class', "hide");
		addComment.setAttribute('title', "Add a new comment");
		addComment.onclick = function(e) {
			//TODO: add a new comment;
		};
		divComments.appendChild(addComment);

		var addCommentImg = document.createElement('img');
		addCommentImg.setAttribute('id', 'procid-addcomment-image');
		addCommentImg.setAttribute('src', ABSOLUTEPATH + '/images/blue-plus.png');
		addComment.appendChild(addCommentImg);

		addComment.innerHTML += "Comment";*/
	}

	var createCriterion = function(title_, id_, description_) {
		var criterion = {
			id : id_,
			title : title_,
			description : description_
		};
		criteria.push(criterion);
		return criterion;
	}
	
	var addCriterionValue = function(commentInfo, value_, comment_, id_) {
		var criterion = {
			value : value_,
			comment : comment_,
			id : id_
		};
		commentInfo.criteria.push(criterion);
		var criterion_track = {
			value : value_,
			comment : comment_,
			id : id_,
			title : commentInfo.title
		};
		allCriteria.push(criterion_track);
		return criterion;
	}
	var findCriterion = function(commentInfo, id_) {
		var result = $.grep(commentInfo.criteria, function(e) {
			return e.id == id_;
		});
		if (result.length == 0)
			return -1;
		else
			return result[0];
	}
	var findCriteriaTitle = function(id){
		var result = $.grep(criteria, function(e) {
			return e.id == id;
		});
		if (result.length == 0)
			return -1;
		else
			return result[0].title;
		
	}
	var editCriterionValue = function(commentInfo, criterion) {
		if ($.inArray(criterion, commentInfos.criteria) != -1)
			//TODO: remove criterion
			return commentInfo;
	}
	
	var createNewCommentBox = function(currentElement, originalPosition, originalValue, criterion_track, circle){
		var divNewComment = document.createElement('div');
		divNewComment.setAttribute('class', 'procid-new-comment');
//		divNewComment.setAttribute('top', position);
		currentElement.appendChild(divNewComment);
	
		var divNewCommentBox = document.createElement('div');
		divNewCommentBox.setAttribute('class', 'procid-new-comment-box');
		divNewComment.appendChild(divNewCommentBox);

		var divNewCommentBoxInput = document.createElement('textarea');
		divNewCommentBoxInput.setAttribute('class', 'procid-new-comment-textarea');
		divNewCommentBoxInput.setAttribute('placeholder', 'Explain the new criteria evaluation or press cancel...');
		divNewCommentBox.appendChild(divNewCommentBoxInput);

		var divNewCommentBoxSubmit = document.createElement('input');
		divNewCommentBoxSubmit.setAttribute('class', 'submit');
		divNewCommentBoxSubmit.setAttribute('type', 'submit');
		divNewCommentBoxSubmit.setAttribute('value', 'Comment');
		divNewCommentBoxSubmit.setAttribute('name', 'submit');
		divNewCommentBoxSubmit.onclick = function(e) {
				$.post(serverURL+"updateCriteriaStatus", {
				"issueLink" : issue.link, "userName" : "webchick", "commentTitle" : criterion_track.title, "value" : criterion_track.value,"content" : divNewCommentBoxInput.value, "id" : criterion_track.id}, function() {
					console.log("success");
				});
				//close the comment Input box
				currentElement.removeChild(divNewComment);
			};
		divNewCommentBox.appendChild(divNewCommentBoxSubmit);

		var divNewCommentBoxCancel = document.createElement('input');
		divNewCommentBoxCancel.setAttribute('class', 'cancel');
		divNewCommentBoxCancel.setAttribute('type', 'submit');
		divNewCommentBoxCancel.setAttribute('value', 'Cancel');
		divNewCommentBoxCancel.setAttribute('name', 'cancel');
		divNewCommentBoxCancel.onclick = function(e) {
				//go back to the original Location
				updateCriteriaCircleLocation(criterion_track, originalValue, originalPosition, circle);
				//close the comment Input box
				currentElement.removeChild(divNewComment);
			};
		divNewCommentBox.appendChild(divNewCommentBoxCancel);

		var divArrow = document.createElement('div');
		divArrow.setAttribute('class', 'arrow');
		divNewComment.appendChild(divArrow);

		var divShadow = document.createElement('div');
		divShadow.setAttribute('class', 'shadow');
		divNewComment.appendChild(divShadow);

		return divNewComment;
	}	

	var removeCommentBox = function(parent, currentCommentBox){
		parent.removeChild(currentCommentBox);
	}

	var updateCriteriaCircleLocation = function(d, value, cx, circle){
		//updating the value
		d.value = value;		
		d3.select(circle).attr("cx", cx);
		var identifier="#procid-cline-"+d.title.substr(1)+"-"+d.id;
		d3.select(identifier).attr("x2", cx);
	}

	var createCriterionSelectors = function(){
		var color = "lightgray";

		//x function
		var x = d3.scale.quantize().domain([0, 6]).range([43, 70, 97, 124, 151, 178, 205]);

		var mySvg = d3.selectAll('#procid-idea-criterion').append("svg:svg").attr("width", '260').attr("height", '50').attr("class", "selector").attr("viewBox", "0 0 260 50");

		d3.selectAll(".selector").append("svg:defs").attr("class", "svgdefs");
		d3.selectAll(".svgdefs").append("svg:filter")
		.attr("id", "procid-circle-filter")
    		.attr("x", "-20%")
    		.attr("y", "-20%")
    		.attr("width", "200%")
    		.attr("height", "200%");	
		
		d3.selectAll("#procid-circle-filter").append("svg:feOffset")
		.attr("dx", "1")
    		.attr("dy", "2")
    		.attr("in", "SourceAlpha")
    		.attr("result", "offOut");

		d3.selectAll("#procid-circle-filter").append("svg:feGaussianBlur")
		.attr("result", "blurOut")
    		.attr("in", "offOut")
    		.attr("stdDeviation", "3");

		// <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
		d3.selectAll("#procid-circle-filter").append("svg:feComponentTransfer").attr("class", "svgcomponentTransfer");
		d3.selectAll(".svgcomponentTransfer").append("svg:feFuncA")		
		.attr("type", "linear")
    		.attr("slope", "4.2");

		d3.selectAll("#procid-circle-filter").append("svg:feMerge").attr("class", "svgfemerge");
		d3.selectAll(".svgfemerge").append("svg:feMergeNode")		
		.attr("in", "SourceGraphic");


		d3.selectAll(".selector").append("image")
    		.attr("xlink:href", ABSOLUTEPATH + "/images/slider.png")
    		.attr("width", "240")
    		.attr("x", "5")
    		.attr('y', "15")
    		.attr("height", "30");	

		d3.selectAll(".selector").data(allCriteria).append("svg:text")
	      	.attr("class", "procid-criteria-title")
      		.attr("dx", function(d) {
				var tempTitle = findCriteriaTitle(d.id);
				var length = tempTitle.length*4;
				return (x(6)-x(0))/2+x(0)-length/2;
			})
		.attr("dy", "20")
		.text(function(d) {
				return findCriteriaTitle(d.id);
			});
		
		d3.selectAll(".selector").data(allCriteria).append("svg:line")
	      	.attr("class", "procid-criteria-line")
	      	.attr("id", function(d) {
				var tempTitle = d.title.substr(1);
				return "procid-cline-"+tempTitle+"-"+d.id;
			})
      		.attr("x1", "36")
		.attr("y1", "30")
		.attr("x2", "36")
		.attr("y2", "30")
		.attr("stroke", "#29abe2")
		.attr("stroke-width", '3');

		d3.selectAll(".selector").data(allCriteria).append("svg:circle")
			.attr("class", "selectorCircle")
			.attr("fill", "white")
			.attr("stroke", color)
			.attr("stroke-width", '.25')
			.attr("style", "cursor: pointer")
			.attr("filter", "url(#procid-circle-filter)")
			.attr("cy", "30")
			.attr("cx", function(d) {
				return x(d.value);
			}).attr("r", "8")
			.on("mouseover", function() {
				d3.select(this).style("fill-opacity", .9);
			}).on("mouseout", function() {
				d3.select(this).style("fill-opacity", 1);
			}).call(d3.behavior.drag().on("dragstart", function(d) {
				this.__origin__ = [x(d.value), 30];
				this.__originx = x(d.value);
				this.__originValue = d.value;
				if(this.commentBox != null)
					removeCommentBox(this.parentNode.parentNode, this.commentBox);
			}).on("drag", function(d) {
				var firstNum = x.range()[0];
				var diff = x.range()[1] - firstNum;				
				var cx = Math.min(x(6), Math.max(x(0), this.__origin__[0] += d3.event.dx));
				cx = Math.floor((cx-x(0))/diff)*diff+x(0);
				
				var value = Math.floor((cx-firstNum)/diff);

				updateCriteriaCircleLocation(d, value, cx, this);
				
			}).on("dragend", function(d) {
				//delete this.__origin__;
				if(this.__originx != x(d.value)){
					this.commentBox = createNewCommentBox(this.parentNode.parentNode, this.__originx, this.__originValue, d, this);
					/*$.post(serverURL+"updateCriteriaStatus", {
				"issueLink" : issue.link, "userName" : "webchick", "commentTitle" : d.title, 
						"value" : d.value, "id" : d.id}, function() {
											console.log("success");
											});*/
			
				}
			}));
		
	}

	var createIdeaCriteria = function(divIdeaBlock, commentInfo) {
		//criteris
		var divCriteria = document.createElement('div');
		divCriteria.setAttribute('id', 'procid-idea-criteria');
		divCriteria.setAttribute('class', 'procid-idea-block-inner-cell');
		divIdeaBlock.appendChild(divCriteria);
		var counter = 0;

		if(criteria.length == 0){
			var link1 = document.createElement('a');
			link1.setAttribute('id', 'procid-edit-link');
			link1.setAttribute('href', "#");
			link1.innerHTML = "add a new criteria";
			link1.onclick = function(e) {
				createEditCriteriaBox();
			};				
		}

		$.each(criteria, function() {
			var divCriterion = document.createElement('div');
			divCriterion.setAttribute('id', 'procid-idea-criterion');
			divCriterion.setAttribute('class', 'procid-criteria-block-cell');
			divCriteria.appendChild(divCriterion);

			var criterion = findCriterion(commentInfo, this.id);
			if(criterion == -1)
				criterion = addCriterionValue(commentInfo, 0, "", this.id);
		});
	}
	var createIdeaPageBody = function() {
		//Header
		var ideaPageHeader = document.createElement('div');
		ideaPageHeader.setAttribute('id', 'procid-ideaPage-header');
		$("#procid-idea-page-wrapper").append(ideaPageHeader);

		createLabel('Idea', "");
		createLabel('Status', "");
		createLabel('Criteria ', "(edit)");
		createLabel('Comments ', "(add)");

		//<hr/>
		var hr2 = document.createElement('hr');
		hr2.style.background = "url(" + ABSOLUTEPATH + "/images/sidebar_divider.png) repeat-x";
		$("#procid-idea-page-wrapper").append(hr2);

		console.log("numComments:" + commentInfos.length);

		//Body
		for (var i = 0; i < commentInfos.length; i++) {

			if ($.inArray("idea", commentInfos[i].tags) != -1 && commentInfos[i].content != "") {
				var divIdeaBlock = document.createElement('div');
				divIdeaBlock.setAttribute('id', 'procid-idea-block');

				createIdeaImage(divIdeaBlock, commentInfos[i]);
				createIdeaStatus(divIdeaBlock, commentInfos[i]);
				createIdeaCriteria(divIdeaBlock, commentInfos[i]);
				createIdeaComments(divIdeaBlock, commentInfos[i]);

			}
			$("#procid-idea-page-wrapper").append(divIdeaBlock);		
		}
		
		createCriterionSelectors();

	}

	var findPeopletoInvite = function() {
		var suggestedMembers = [];
		$.post(serverURL+"findPotentialParticipants", {
			"issueLink" : issue.link
		}, function(data) {
			$.each(data.invitedMembers, function(i, member) {
				suggestedMembers.push(member);
			});
		});

		return suggestedMembers;
	}

	var sortInvitedMembers = function(name, strA, strB){
		var aStrings = strA.split(",");
		var bStrings = strB.split(",");
		//experience
		if(name === "experience"){
			var numA = parseInt(aStrings[0].replace(/(^\d+)(.+$)/i,'$1'), 10);
			var numB = parseInt(bStrings[0].replace(/(^\d+)(.+$)/i,'$1'), 10);
			return  numA > numB ? -1 : 1;				    
		}else if(name === "patches"){//usability patches
			var numA = parseInt(aStrings[1].replace(/(^\d+)(.+$)/i,'$1'), 10);
			var numB = parseInt(bStrings[1].replace(/(^\d+)(.+$)/i,'$1'), 10);
			return  numA > numB ? -1 : 1;				    
		}else if(name === "consensus"){//closed threads
			var numA = parseInt(aStrings[2].replace(/(^\d+)(.+$)/i,'$1'), 10);
			var numB = parseInt(bStrings[2].replace(/(^\d+)(.+$)/i,'$1'), 10);
			return  numA > numB ? -1 : 1;				    
		}else{//recency
			var numA = parseInt(aStrings[3].match(/\d+/)[0], 10);
			var aSubStrings = aStrings[3].split(" ");
			var date = aSubStrings[aSubStrings.length-2];
			if(date.indexOf("month") != -1)
				numA = numA * 30;
			else if(date.indexOf("year") != -1)
				numA = numA * 365;
			var numB = parseInt(bStrings[3].match(/\d+/)[0], 10);
			var bSubStrings = bStrings[3].split(" ");
			var dateB = bSubStrings[bSubStrings.length-2];

			if(dateB.indexOf("month") != -1)
				numB = numB * 30;
			else if(dateB.indexOf("year") != -1)
				numB = numB * 365;

			return  numA > numB ? 1 : -1;
		}				    
	
	}

	var createInviteLense = function(name, parent, tooltipText, imagePath){

		$('<a />').attr({
			id : 'procid-invite-' + name + '-link',
			href : '#',
			rel : 'tooltip',
			title : tooltipText, 
			class : 'unselected'
		}).appendTo("#" + parent);

		if(name == "search")
			$("#procid-invite-"+name+"-link").click(function addthePanel(evt) {
				if($("#procid-invite-"+name+"-link").hasClass('unselected')){
					$("#procid-invite-"+name+"-link").attr('class', 'selected');
					$("#procid-invite-search-panel").css("display", "block");
					$("img[id='procid-invite-"+name+"-image']").attr('src', imagePath + '-3.png')
				}
				else{
					$("#procid-invite-"+name+"-link").attr('class', 'unselected');
					$("#procid-invite-search-panel").css("display", "none");
					$("img[id='procid-invite-"+name+"-image']").attr('src', imagePath + '-1.png')
				}
		});
		else
			$("#procid-invite-"+name+"-link").click(function highlightMembers(evt) {
			if ($("img[id='procid-invite-"+name+"-image']").attr('src') === imagePath + '-1.png') {
				$("div[id=procid-invite-page-wrapper] .procid-invite-block").sortElements(function(a, b){
					var strA=$(a).children(".procid-author-description-unselected")[0].innerHTML.toLowerCase();
    					var strB=$(b).children(".procid-author-description-unselected")[0].innerHTML.toLowerCase();
					return sortInvitedMembers(name, strA, strB);
				});
				
		
				$(".procid-author-name-unselected").slice(0,10).attr('class', 'procid-author-name-selected');
				$(".procid-author-description-unselected").slice(0,10).map(function(){
					var strings = $(this).text().split(",");

					if(name === "experience"){
						$(this).html("<b>"+strings[0]+"</b>, "+strings[1]+ ", " + strings[2] +", " +strings[3]);
					}else if(name === "patches"){//usability patches
						$(this).html(strings[0]+", <b>"+strings[1]+ "</b>, " + strings[2] +", " +strings[3]);
					}else if(name === "consensus"){//closed threads
						$(this).html(strings[0]+", "+strings[1]+ ", <b>" + strings[2] +"</b>, " +strings[3]);
					}else if(name == "recency"){//recency
						$(this).html(strings[0]+", "+strings[1]+ ", " + strings[2] +", <b>" +strings[3] + "</b>");
					}					
				});
				$(".procid-author-description-unselected").slice(0,10).attr('class', 'procid-author-description-selected');
				$("img[id='procid-invite-"+name+"-image']").attr('src', imagePath + '-3.png');
			} else {
				$(".procid-author-name-selected").attr('class', 'procid-author-name-unselected');
				$(".procid-author-description-selected").map(function(){
					$(this).html($(this).text());
				});
				$(".procid-author-description-selected").attr('class', 'procid-author-description-unselected');
				$("img[id='procid-invite-"+name+"-image']").attr('src', imagePath + '-1.png');
			}
			return true;

		});

		$('<img />').attr({
			id : 'procid-invite-' + name + '-image',
			src : imagePath + '-1.png',
		}).appendTo("#procid-invite-" + name + '-link');

	}
	var createInvitePageBody = function() {
		//Procid Invite Page Body

		var divInviteTitle = document.createElement('h2');
		divInviteTitle.setAttribute('id', 'procid-invite-title');
		divInviteTitle.innerHTML = "Invite Users to Your Discussion";
		$("#procid-invite-page-wrapper").append(divInviteTitle);
		
		//invite page filter panel
		var divInviteFilter = document.createElement('div');
		divInviteFilter.setAttribute('id', 'procid-invite-filter');
		$("#procid-invite-page-wrapper").append(divInviteFilter);

		createInviteLense("experience", "procid-invite-filter", "View experienced participants", ABSOLUTEPATH + "/images/experience");
		createInviteLense("patches", "procid-invite-filter", "View participants who submitted patches", ABSOLUTEPATH + "/images/patches");
		createInviteLense("recency", "procid-invite-filter", "View recent participants", ABSOLUTEPATH + "/images/recency");
		createInviteLense("connections", "procid-invite-filter", "View participants with most connections", ABSOLUTEPATH + "/images/connections");
		createInviteLense("search", "procid-invite-filter", "Search Participants", ABSOLUTEPATH + "/images/search-invite");
		
		//Search
		addSearchPanel('procid-invite-search', 'procid-invite-page-wrapper');
		$("#procid-invite-search-panel").css("display", "none");

		//List potential members to invite
		var suggestedPeaple = findPeopletoInvite();
		for (var i = 0; i < suggestedPeaple.length; i++) {

			var divInviteBlock = document.createElement('div');
			divInviteBlock.setAttribute('class', 'procid-invite-block');

			var divAuthorName = document.createElement('div');
			divAuthorName.setAttribute('class', 'procid-author-name-unselected');
//			divAuthorName.setAttribute('class', 'unselected');
			divAuthorName.textContent = suggestedPeaple[i].author;
			
			divInviteBlock.appendChild(divAuthorName);

			var divAuthorDescription = document.createElement('div');
			divAuthorDescription.setAttribute('class', 'procid-author-description-unselected');
			divAuthorDescription.textContent = suggestedPeaple[i].description;
			divInviteBlock.appendChild(divAuthorDescription);

			var divInviteLink = document.createElement('a');
			divInviteLink.setAttribute('class', 'procid-invite-invitationlink');
			divInviteLink.setAttribute('href', '#');
			divInviteLink.setAttribute('rel', 'tooltip')
			divInviteLink.setAttribute('title', 'Invite this person');
			divInviteLink.onclick = function invitePerson(evt) {
				//TODO: invite this person
				return true;
			};

			var divInviteLinkImage = document.createElement('img');
			divInviteLinkImage.setAttribute('class', 'procid-invite-invitationlink-image');
			divInviteLinkImage.setAttribute('src', ABSOLUTEPATH + "/images/invite.png");
			divInviteLink.appendChild(divInviteLinkImage);

			divInviteBlock.appendChild(divInviteLink);
			$("#procid-invite-page-wrapper").append(divInviteBlock);

		}
	}
	//Program Starts From here
	addCSSToHeader();

	//HomePage
	var page = document.getElementsByClassName('container-12 clear-block')[1];
	page.setAttribute('class', 'clear-block');

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
	//$("#procid-idea-page-wrapper").toggle(false);

	$("#procid-page-wrapper").after(ideaPageWrapper);

	//InvitePageWrapper
	var invitePageWrapper = document.createElement('div');
	invitePageWrapper.setAttribute('id', 'procid-invite-page-wrapper');
	//$("#procid-invite-page-wrapper").toggle(false);

	$("#procid-page-wrapper").after(invitePageWrapper);

	//Procid Header
	createProcidHeader();

	createHomePageBody();
	createIdeaPageBody();
	createInvitePageBody();

	console.log("done");
	});
};

// load jQuery and execute the main function
addJQuery(main);
