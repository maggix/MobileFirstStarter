
/* JavaScript content from js/Page2.js in folder common */
/**
* Copyright 2015 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

currentPage={};

currentPage.init = function() {
};

currentPage.buttonClick = function() {
	WL.SimpleDialog.show("Page2","Button on Page2 was clicked",[{text:'OK'}]);
};

currentPage.loadPage1 = function(){
	pagesHistory.push(path + "pages/Page2.html");
	$("#pagePort").load(path + "pages/Page1.html", function(){
		$.getScript(path + "js/Page1.js", function() {
			if (currentPage.init) {
				currentPage.init();
			}
		});
	});
};

currentPage.back = function(){
	$("#pagePort").load(pagesHistory.pop());
};

currentPage.loadPage = function(pageIndex){
    $("#pagePort").load(path + "pages/Page" + pageIndex + ".html");
    if(pageIndex == "1"){
        $("#AppHeader").html("Catalog");
    }else if(pageIndex == "2"){
        $("#AppHeader").html("Wish List");
    }else if(pageIndex == "3"){
        $("#AppHeader").html("Settings");
    }else if(pageIndex == "4"){
        $("#AppHeader").html("Add Item");
    }
};

currentPage.loadHome = function(){
    $("#pagePort").load(path + "pages/MainPage.html");
    $("#AppHeader").html("Home");
};