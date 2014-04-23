// ==UserScript==
// @name           Interface A
// @description    Interactive system supporting consensus building.
// @icon           https://github.com/albaloo/procid-client/blob/master/images/procid-icon.png
// @author         Roshanak Zilouchian
// @version        1.2
// @grant          none
// @include        http://drupal.org/node/2214271*
// @include        https://drupal.org/node/2214271*
// @include        http://drupal.org/node/2035259*
// @include        https://drupal.org/node/2035259*
// @include        http://drupal.org/comment/*
// @include        https://drupal.org/comment/*
// @match        http://drupal.org/*
// @match        https://drupal.org/*                                             
// @include        https://web.engr.illinois.edu/~rzilouc2/procid/example*
// ==/UserScript==

function load(url, onLoad, onError) {
    var e = document.createElement("script");
    e.setAttribute("src", url);

    if (onLoad !== null) { e.addEventListener("load", onLoad); }
    if (onError !== null) { e.addEventListener("error", onError); }

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

    var e = document.createElement("script");
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

	head.js("//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js", "//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js", "//cdnjs.cloudflare.com/ajax/libs/d3/3.0.8/d3.min.js", function() {
		console.log("begin");
		var ABSOLUTEPATH = 'https://raw.github.com/albaloo/procid-client/master';
		var CSSSERVERPATH = 'https://web.engr.illinois.edu/~rzilouc2/procid';
		//var serverURL='http://0.0.0.0:3000/';
		var serverURL = 'https://procid-lab-study-server.herokuapp.com/';
		var currentUser = "";
		var currentUserLink = "";

		var setUpInterfaceA = function() {
			
			//Check if this is an issue page
			if (!$("#page").find("div [class='breadcrumb']").length)
				return;
				
			var path = window.location.pathname;
			var issueLink;
			if (path.indexOf("node") >= 0)
				issueLink = window.location.pathname;
			else
				issueLink = $("link[rel='shortlink']").attr('href');
				
			console.log("issueLink: " + issueLink)
			addCSSToHeader();
			
			//Check if the user has logged in Drupal
			if (!$("#page").find('#project-issue-node-form').length){ 
				//window.alert("Please Login to Drupal to view InterfaceA's features.");
				$("<div id='dialog' style='padding:10px;' title='You are not Logged in'><p>Please Log in to Drupal to view Interface A's features: <a style='color: #0678be' href='https://drupal.org/user?destination="+issueLink.substr(1)+"'>Click to Log in</a></p></div>").dialog({
                height: 70,
                width: 350,
                //modal: true,
                //resizable:false,
                /*buttons: {
                    "ok": function() {
                                   $( this ).dialog( "close" ); 
                                       },
                },*/
            });//<p><a href='https://drupal.org/user?destination="+issueLink+"'>Login</a></p>").dialog();
				//https://drupal.org/user?destination=node/2214271
				
				return;
			}
			
			//find the currentUser
			var currentUserInfo = $("#userinfo a").first().text();
			currentUser = currentUserInfo.substr(13);
			
			currentUserLink = "" + $($.find('li[class="dashboard last"] a')[0]).attr("href");
			var linkIndex = currentUserLink.indexOf("/dashboard");
			currentUserLink = currentUserLink.substring(0, linkIndex);

			if (currentUser === "")
				currentUser = "Anonymous";
				
			console.log("username: " + currentUser + " link: " + currentUserLink);
			//Program Starts From here

			startInterfaceA();
		};
		
		var addCSSToHeader = function() {
			var header = document.getElementsByTagName('head')[0];
			var csslink = document.createElement('link');
			csslink.setAttribute('href', CSSSERVERPATH + '/style-A.css');
			csslink.setAttribute('rel', 'stylesheet');
			csslink.setAttribute('type', 'text/css');
			header.appendChild(csslink);
			
			var csslink2 = document.createElement('link');
			csslink2.setAttribute('href', '//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css');
			csslink2.setAttribute('rel', 'stylesheet');
			//csslink2.setAttribute('type', 'text/css');
			header.appendChild(csslink2);
		};
		
		var startInterfaceA = function() {
			//Add the header
			var header = createHeader();

			var pageWrapper = document.createElement('div');
			pageWrapper.setAttribute('id', 'procid-outer-page-wrapper');

			$("#page").wrap(pageWrapper);
			$("#page" ).before(header);
			
			//var outerPageWrapper = document.createElement('div');
			//outerPageWrapper.setAttribute('id', 'procid-outer-page-wrapper');
			//outerPageWrapper.appendChild(header);

			//$("#procid-page-wrapper").wrap(outerPageWrapper);


			//pageWrapper.insertBefore(header, pageWrapper.firstChild);
			
		};
		
		var createHeader = function() {	
			var header = document.createElement('div');
			header.setAttribute('id', 'procid-left-panel-header');
			header.innerHTML = ' ';
			
			//Menu
			var procidMenu = document.createElement('ul');
			procidMenu.setAttribute('id', 'procid-menus');
			header.appendChild(procidMenu);
			$("#procid-menus").css("border-image", "url(" + ABSOLUTEPATH + "/images/top-line.png) 13 2 round");

			//Procid Label
			var procidLabel = document.createElement('div');
			procidLabel.setAttribute('id', 'procid-label');
			procidLabel.innerHTML = "Interface A"
			//$(procidLabel).css('background-image', "url(" + ABSOLUTEPATH + "/images/sprites-main-page.png)");
			procidMenu.appendChild(procidLabel);		
			
			return header;
		};
		setUpInterfaceA();
		console.log("done");
	});
}
loadAndExecute("//raw.github.com/headjs/headjs/v0.99/dist/head.min.js", main);