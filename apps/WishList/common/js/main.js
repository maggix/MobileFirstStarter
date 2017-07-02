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

/* JavaScript content from js/main.js in folder common */

var pagesHistory = [];
var currentPage = {};
var path = "";
var WISH_LIST_COLLECTION_NAME = 'wishlist';

function isPushSupported() {
	var isSupported = false;
	if (WL.Client.Push){
		isSupported = WL.Client.Push.isPushSupported();
	}
	
	return isSupported;
}

function isPushSubscribed() {
	var isSubscribed = false;
	if (WL.Client.Push){
		isSubscribed = WL.Client.Push.isSubscribed('myPush');
	}
	return isSubscribed;
}

function doSubscribe() {

	if (WL.Client.Push) {	
			
			WL.Client.Push.registerEventSourceCallback(
				"myPush", 
				"PushAdapter", 
				"PushEventSource", 
				pushNotificationReceived);
	}

	
	WL.Client.Push.subscribe("myPush", {
		onSuccess: doSubscribeSuccess,
		onFailure: doSubscribeFailure
	});
}

function pushNotificationReceived(){
    alert("pushNotification Received");
}

function doSubscribeSuccess() {
	alert("doSubscribeSuccess");
}

function doSubscribeFailure() {
	alert("doSubscribeFailure");
}

function getServerURLAlertSuccess(serverURL) {
    if(serverURL == "http://localhost:9080/MobileFirstStarter"){
        currentPage.loadPage(3);
        WL.SimpleDialog.show("Change Server URL", "Please set the custom MFP server URL",
                             [{
                              text: "Close", handler: function() {}
                              }]
                             );
    }
}
function getServerURLAlertFailure() {
    alert("Custom MFP server settings need to be set");
}

function wlCommonInit(){
	
	// Special case for Windows Phone 8 only.
	if (WL.Client.getEnvironment() == WL.Environment.WINDOWS_PHONE_8) {
	    path = "/www/default/";
	}
		
	$("#pagePort").load(path + "pages/MainPage.html", function(){
		$.getScript(path + "js/MainPage.js", function() {
			if (currentPage.init) {
                    currentPage.init();
                    WL.App.getServerUrl(getServerURLAlertSuccess, getServerURLAlertFailure);
			}
		});
	});
	
	var wishListCollection = {};
	wishListCollection[WISH_LIST_COLLECTION_NAME] = {
		searchFields : {productId: 'string'}
	};

	WL.JSONStore.init(wishListCollection).then(function () {
		WL.Logger.info("JSONStore collection '"+ WISH_LIST_COLLECTION_NAME +"' initalized");
	}).fail(function () {
		WL.Logger.info("Failed to initalize JSONStore collection '"+ WISH_LIST_COLLECTION_NAME +"'");
	});
	
	doSubscribe();
		
	(function (WL, jQuery, lodash) {

		'use strict';

		//Dependencies
		var $ = jQuery,
			_ = lodash;

		//CONSTANTS
		var PEOPLE_COLLECTION_NAME = 'people',
			KEY_VALUE_COLLECTION_NAME = 'keyvalue',
			INIT_FIRST_MSG = 'PERSISTENT_STORE_NOT_OPEN',
			NAME_FIELD_EMPTY_MSG = 'Name field is empty',
			AGE_FIELD_EMPTY_MSG = 'Age field is empty',
			ID_FIELD_EMPTY_MSG = 'Id field is empty',
			EMPTY_TABLE_MSG = 'No documents found',
			DESTROY_MSG = 'Destroy finished succesfully',
			INIT_MSG = 'Collection initialized',
			ADD_MSG = 'Data added to the collection',
			REPLACE_MSG = 'Document replaced succesfully, call find.',
			REMOVE_MSG = 'Documents removed: ',
			COUNT_MSG = 'Documents in the collection: ',
			CLOSE_ALL_MSG = 'JSONStore closed',
			REMOVE_COLLECTION_MSG = 'Removed all data in the collection',
			LOAD_MSG = 'New documents loaded from adapter: ',
			PUSH_MSG_FAILED = 'Could not push some docs, res: ',
			PUSH_MSG = 'Push finished',
			PASS_CHANGED_MSG = 'Password changed succesfully',
			COUNT_QUERY_ERROR_MSG = 'FIND_BY_QUERY_EXPECTED_A_STRING',
			COUNT_QUERY_MSG = "Documents in the collection with name = ";

		//Log messages to the console and status field
		var _logMessage = function (msg, id) {
			//Get reference to the status field
			var status = _.isUndefined(id) ? $('div#console') : $(id);
			
			status.css("color", "#FFF");

			//Put message in the status div
			status.text(msg);

			//Log message to the console
			WL.Logger.info(msg);
		};
		
		var _logError = function (msg, id) {
			//Get reference to the status field
			var status = _.isUndefined(id) ? $('div#console') : $(id);
			
			status.css("color", "#F00");

			//Put message in the status div
			status.text(msg);

			//Log message to the console
			WL.Logger.info(msg);
		};

		//Show JSONStore document in a table
		var _showTable = function (arr) {

			if (_.isArray(arr) && arr.length < 1) {
				return _logMessage(EMPTY_TABLE_MSG);
			}

			//Log to the console
			WL.Logger.ctx({stringify: true, pretty: true}).info(arr);

			//Get reference to the status field
			var status = $('div#console'),

				//Table HTML template
				table = [
					'<table id="user_table" >',
						'<% _.each(people, function(person) { %>',
							'<tr>',
								'<td><%= JSON.stringify(person) %></td>',
							'</tr>',
						'<% }); %>',
					'</table>'
				].join(''),

				//Populate the HTML template with content
				html = _.template(table, {people : arr});

			status.css("color", "#FFF");
			//Put the generated HTML table into the DOM
			status.html(html);
		};

		//Scroll to the top every time a button is clicked
		$('button').on('click', function () {
			$('html, body').animate({scrollTop: 0}, 'slow');
		});

		//init
		$('button#init').on('click', function () {

			//Get references to the input fields DOM elements
			var usernameField = $('input#init-username'),
				passwordField = $('input#init-password');

			//Get values from the input fields
			var	username = usernameField.val() || '',
				password = passwordField.val() || '';

			//Create the optional options object passed to init
			var options = {};

			//Check if a username was passed
			if (username.length > 0) {
				options.username = username;
			}

			//If if a password was passed
			if (password.length > 0) {
				options.password = password;
			}

			//JSONStore collections metadata
			var collections = {};

			//Define the 'people' collection and list the search fields
			collections[PEOPLE_COLLECTION_NAME] = {

				searchFields : {name: 'string', age: 'integer'},

				//-- Start optional adapter metadata
				adapter : {
					name: 'People',
					add: 'addPerson',
					remove: 'removePerson',
					replace: 'replacePerson',
					load: {
						procedure: 'getPeople',
						params: [],
						key: 'peopleList'
					}
				}
				//-- End optional adapter metadata
			};

			//Define the 'keyvalue' collection and use additional search fields
			collections[KEY_VALUE_COLLECTION_NAME] = {
				searchFields : {},
				additionalSearchFields : { key: 'string' }
			};

			//Initialize the people collection
			WL.JSONStore.init(collections, options)

			.then(function () {
				_logMessage(INIT_MSG);
				_callEnhanceToAddKeyValueMethods();
			})

			.fail(function (errorObject) {
				_logError(errorObject.msg);
			});
		});

		//destroy
		$('button#destroy').on('click', function () {

			//Destroy removes all documents, all collections, all stores
			//and every piece of JSONStore metadata
			WL.JSONStore.destroy()

			.then(function () {
				_logMessage(DESTROY_MSG);
			})

			.fail(function (errorObject) {
				_logError(errorObject.msg);
			});
		});

		//add
		$('button#add-data').on('click', function () {

			//Get references to the input fields DOM elements
			var nameField = $('input#add-name'),
				ageField = $('input#add-age');

			//Get values from the input fields
			var	name = nameField.val() || '',
				age = parseInt(ageField.val(), 10) || '';

			//Prepare the data object
			var data = {};

			//Check if a name was passed
			if (name.length > 0) {
				data.name = name;
			}

			//Check if an age was passed
			if(_.isNumber(age)) {
				data.age = age;
			}

			try {

				//Call add on the JSONStore collection
				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).add(data)

				.then(function () {
					_logMessage(ADD_MSG);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

				//Clear the input fields
				nameField.val('');
				ageField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}

		});

		//find-name
		$('button#find-name').on('click', function () {

			//Get reference to the search field
			var searchFieldDOM = $('input#find-search'),
				limitField = $('input#find-limit'),
				offsetField =$('input#find-offset');

			//Get value from the search field
			var searchField = searchFieldDOM.val() || '',
				limit = parseInt(limitField.val(), 10) || '',
				offset = parseInt(offsetField.val(), 10) || '';

			//Create the query object
			var query = {};

			//Check if a name was passed
			if (searchField.length > 0) {
				query.name = searchField;
			}

			//Check if some value was passed
			if (_.isEmpty(query)) {
				return _logError(NAME_FIELD_EMPTY_MSG);
			}

			//Create optional options object
			var options = {};

			//Check if limit was passed
			if (_.isNumber(limit)) {
				options.limit = limit;
			}

			//Check if offset was passed
			if (_.isNumber(offset)) {
				options.offset = offset;
			}

			try {

				//Perform the search
				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).find(query, options)

				.then (function (res) {
					_showTable(res);
				})

				.fail (function (errorObject) {
					_logError(errorObject.msg);
				});

				//Clear the input fields
				searchFieldDOM.val('');
				limitField.val('');
				offsetField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//find-age
		$('button#find-age').on('click', function () {

			//Get reference to the search field
			var searchFieldDOM = $('input#find-search'),
				limitField = $('input#find-limit'),
				offsetField =$('input#find-offset');

			//Get value from the search field
			var searchField = searchFieldDOM.val() || '',
				limit = parseInt(limitField.val(), 10) || '',
				offset = parseInt(offsetField.val(), 10) || '';

			//Create the query object
			var query = {};

			//Check if a name was passed
			if (searchField.length > 0) {
				query.age = searchField;
			}

			//Check if some value was passed
			if (_.isEmpty(query)) {
				return _logError(AGE_FIELD_EMPTY_MSG);
			}

			//Optional options object to do exact match
			var options = {exact: true};

			//Check if limit was passed
			if (_.isNumber(limit)) {
				options.limit = limit;
			}

			//Check if offset was passed
			if (_.isNumber(offset)) {
				options.offset = offset;
			}

			try {

				//Perform the search
				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).find(query, options)

				.then (function (res) {
					_showTable(res);
				})

				.fail (function (errorObject) {
					_logError(errorObject.msg);
				});

				//Clear the input fields
				searchFieldDOM.val('');
				limitField.val('');
				offsetField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//find-all
		$('button#find-all').on('click', function () {

			//Get reference to the search field
			var limitField = $('input#find-limit'),
				offsetField =$('input#find-offset');

			//Get value from the search field
			var limit = parseInt(limitField.val(), 10) || '',
				offset = parseInt(offsetField.val(), 10) || '';

			//Create optional options object
			var options = {};

			//Check if limit was passed
			if (_.isNumber(limit)) {
				options.limit = limit;
			}

			//Check if offset was passed
			if (_.isNumber(offset)) {
				options.offset = offset;
			}

			try {

				//Alternative syntax:
				//WL.JSONStore.get(PEOPLE_COLLECTION_NAME).find({}, options)
				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).findAll(options)

				.then(function (res) {
					_showTable(res);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);

				});

				//Clear the input fields
				limitField.val('');
				offsetField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//find-by-id
		$('button#find-id-btn').on('click', function () {

			//Get reference to the id field
			var idField = $('input#find-id');

			//Get value from the search field
			var id = parseInt(idField.val(), 10) || '';

			//Check if an id was passed
			if (!_.isNumber(id)) {
				return _logError(ID_FIELD_EMPTY_MSG);
			}

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).findById(id)

				.then(function (res) {
					_showTable(res);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

				//Clear the input fields
				idField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//replace
		$('button#replace').on('click', function () {

			//Get references to the input fields DOM elements
			var nameField = $('input#replace-name'),
				ageField = $('input#replace-age'),
				idField = $('input#replace-id');

			//Get values from the input fields
			var	name = nameField.val() || '',
				age = parseInt(ageField.val(), 10) || '',
				id = parseInt(idField.val(), 10) || '';

			//Check if an id was passed
			if (!_.isNumber(id)) {
				return _logError(ID_FIELD_EMPTY_MSG);
			}

			//Create the document object
			var doc = {
				_id : id,
				json : {}
			};

			//Check if a name was passed
			if (name.length > 0) {
				doc.json.name = name;
			}

			//Check if an age was passed
			if (_.isNumber(age)) {
				doc.json.age = age;
			}

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).replace(doc)

				.then(function () {
					_logMessage(REPLACE_MSG);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

				//Clear the input fields
				nameField.val('');
				ageField.val('');
				idField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//remove
		$('button#remove-id-btn').on('click', function () {

			//Get reference to the id field
			var idField = $('input#remove-id');

			//Get value from the search field
			var id = parseInt(idField.val(), 10) || '';

			//Check if an id was passed
			if (!_.isNumber(id)) {
				return _logError(ID_FIELD_EMPTY_MSG);
			}

			//Build the query object
			var query = {_id: id};

			//Build the options object, if exact: true
			//is not passed fuzzy searching is enabled
			//that means id: 1 will match 1, 10, 100, ...
			var options = {exact: true};

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).remove(query, options)

				.then(function (res) {
					_logMessage(REMOVE_MSG + res);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

				//Clear the input fields
				idField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//count
		$('button#count').on('click', function () {

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).count()

				.then(function (res) {
					_logMessage(COUNT_MSG + res);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});
		
		//count-with-query
		$('button#count-query-btn').on('click', function () {
			
			//Get reference to the count query field
			var countQueryField = $('input#count-query');

			//Get value from the search field
			var queryStr = countQueryField.val() || '';

			//Check if an string was passed
			if (!_.isString(queryStr)) {
				return _logError(COUNT_QUERY_ERROR_MSG);
			}

			//Build the query object
			var query = {name: queryStr};
			var options = {exact: true};		

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).count(query, options)

				.then(function (res) {
					_logMessage(COUNT_QUERY_MSG + queryStr + ": " + res);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});
				
				//Clear fields
				countQueryField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//closeAll
		$('button#close').on('click', function () {

			WL.JSONStore.closeAll()

			.then(function () {
				_logMessage(CLOSE_ALL_MSG);
			})

			.fail(function (errorObject) {
				_logError(errorObject.msg);
			});
		});

		//removeCollection
		$('button#remove-collection').on('click', function () {

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).removeCollection()

				.then(function () {
					_logMessage(REMOVE_COLLECTION_MSG);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}
		});

		//load
		$('button#load').on('click', function () {

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).load()

				.then(function (res) {
					_logMessage(LOAD_MSG + res);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}

		});

		//getPushRequired
		$('button#get-push-required').on('click', function () {

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).getPushRequired()

				.then(function (res) {
					_showTable(res);
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}

		});

		//push
		$('button#push').on('click', function () {

			try {

				WL.JSONStore.get(PEOPLE_COLLECTION_NAME).push()

				.then(function (res) {

					if (_.isArray(res) && res.length < 1) {
						//Got no errors pushing the adapter to the server
						_logMessage(PUSH_MSG);

					} else {
						//The array contains error responses from the adapter
						_logError(PUSH_MSG_FAILED + _.first(res).res.errorCode);
					}

				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}

		});

		//changePassword
		$('button#change-password').on('click', function () {

			//Get references to the input fields DOM elements
			var oldPasswordField = $('input#old-password'),
				newPasswordField = $('input#new-password'),
				userField = $('input#current-username');

			//Get values from input fields
			var oldPassword = oldPasswordField.val() || '',
				newPassword = newPasswordField.val() || '',
				user = userField.val() || '';

			//If no user was passed let JSONStore use the default user
			if (user.length < 1) {
				user = null;
			}

			WL.JSONStore.changePassword(oldPassword, newPassword, user)

			.then(function () {
				_logMessage(PASS_CHANGED_MSG);
			})

			.fail(function (errorObject) {
				_logError(errorObject.msg);
			});

		});

		//Called after WL.JSONStore.init
		var _callEnhanceToAddKeyValueMethods = function () {

			//Adds a put method to the keyvalue collection
			//this method takes a key and a value and stores it
			WL.JSONStore.get(KEY_VALUE_COLLECTION_NAME).enhance('put', function (key, value) {
				var deferred = $.Deferred(),
					collection = this;

				//To make sure no duplicates exist call remove first
				collection.remove({key: key})

				.then(function () {
					//add the value to the keyvalue collection
					return collection.add({key: value}, {additionalSearchFields: {key: key}});
				})

				.then(deferred.resolve, deferred.reject);

				return deferred.promise();
			});

			//Add a getValue method to the keyvalue collection
			//this method takes a key and returns the value (a document)
			WL.JSONStore.get(KEY_VALUE_COLLECTION_NAME).enhance('getValue', function (key) {
				var deferred = $.Deferred(),
					collection = this;

				//Do an exact search for the key
				collection.find({key: key}, {exact: true, limit: 1})

				.then(deferred.resolve, deferred.reject);

				return deferred.promise();
			});
		};

		$('button#add-key-value-pair').on('click', function () {

			//Get references
			var keyField = $('input#enter-key'),
				valueField =  $('input#enter-value');

			//Get values
			var key = keyField.val() || '',
				value = valueField.val() || '';

			//Check if the key value pair was passed
			if (key.length < 1 || value.length < 1) {
				return _logError('Provide a key and a value');
			}

			try {

				//Put the key value pair inside the collection
				WL.JSONStore.get(KEY_VALUE_COLLECTION_NAME).put(key, value)

				.then(function () {
					_logMessage('Done adding a new key value pair');
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

				//clear fields
				keyField.val('');
				valueField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}

		});

		$('button#find-value-with-key').on('click', function () {

			//Get references
			var keyField = $('input#search-by-key');

			//Get values
			var key = keyField.val() || '';

			//Check if the key was passed
			if (key.length < 1) {
				return _logError('Provide a key');
			}

			try {

				//Put the key value pair inside the collection
				WL.JSONStore.get(KEY_VALUE_COLLECTION_NAME).getValue(key)

				.then(function (res) {
					try {
						_logMessage('Found: ' + _.first(res).json.key);
					} catch(e) {
						_logError('No results found');
					}
				})

				.fail(function (errorObject) {
					_logError(errorObject.msg);
				});

				//clear fields
				keyField.val('');

			} catch (e) {
				_logError(INIT_FIRST_MSG);
			}

		});


	} (WL, WLJQ, WL_) );

	
}

function getCatalog(){
	
    var request = new WLResourceRequest('/adapters/CatalogAdapter/getCatalog', WLResourceRequest.GET);
    request.send().then(
                    function(response) {
                        ParseData("#respbox", response.responseText, "catalog");
                    },
                    function(error) {
                        $("#respbox").text(response.responseText);
                    }
    );
    
}

function ParseData(uiElement, items, pageType){
    var parsed = JSON.parse(items);
    var i;
    
    if(pageType == "catalog"){
        if(parsed.isSuccessful){
            for( i = 0; i < parsed.getAllProductsDetailsReturn.length; i++){
                if(i == 0){
                    $(uiElement).html('<div class="container"><div class="row"><div class="left"><img src="https://dl.dropboxusercontent.com/u/97674776' + parsed.getAllProductsDetailsReturn[0].photo +'" alt=""/></div><div class="middle"><div>'+ parsed.getAllProductsDetailsReturn[0].title+'</div><div>'+parsed.getAllProductsDetailsReturn[0].store+'</div><div>$'+parseFloat(parsed.getAllProductsDetailsReturn[0].price).toFixed(2) +'</div></div><div class="right"></div></div></div>');
                }else{
                    $(uiElement).append('<div class="container"><div class="row"><div class="left"><img src="https://dl.dropboxusercontent.com/u/97674776' + parsed.getAllProductsDetailsReturn[i].photo +'" alt=""/></div><div class="middle"><div>'+ parsed.getAllProductsDetailsReturn[i].title+'</div><div>'+parsed.getAllProductsDetailsReturn[i].store+'</div><div>$'+parseFloat(parsed.getAllProductsDetailsReturn[i].price).toFixed(2) +'</div></div><div class="right"></div></div></div>');
                }
            }
        }
        
    }else{
            for( i = 0; i < parsed.length; i++){
                if(i == 0){
                    $(uiElement).html('<div class="container"><div class="row"><div class="left"><img src="https://dl.dropboxusercontent.com/u/97674776' + parsed[0].image +'" alt=""/></div><div class="middle"><div>'+ parsed[0].title+'</div><div>'+parsed[0].store+'</div><div>$'+parseFloat(parsed[0].price).toFixed(2) +'</div></div><div class="right"></div></div></div>');
                }else{
                    $(uiElement).append('<div class="container"><div class="row"><div class="left"><img src="https://dl.dropboxusercontent.com/u/97674776' + parsed[i].image +'" alt=""/></div><div class="middle"><div>'+ parsed[i].title+'</div><div>'+parsed[i].store+'</div><div>$'+parseFloat(parsed[i].price).toFixed(2) +'</div></div><div class="right"></div></div></div>');
                }
            }
    }

}


/* GET SERVER URL */
function getServerURL() {
	WL.App.getServerUrl(getServerURLSuccess, getServerURLFailure);
}
		
function getServerURLSuccess(serverURL) {
    
    $("#serverURL").attr("placeholder","http://host-or-ip:port/context-root");
    $("#serverURL").attr("value",serverURL);
}
function getServerURLFailure() {
	$("#serverURL").attr("placeholder","http://host-or-ip:port/context-root");
}

/* SET SERVER URL */
function setServerURL() {
	var serverURL = $("#serverURL").val();
	WL.App.setServerUrl(serverURL, setServerURLSuccess, setServerURLFailure);
}
function setServerURLSuccess() {
// Display the newly set server URL.
	getServerURL();
}

function setServerURLFailure() {
	WL.SimpleDialog.show(
			"Change Server URL", "Failed setting Server URL",
			[{
				text: "Close", handler: function() {}
			}]
	);
}

/* CONNECT TO SERVER */
function connectToServer() {
	WL.Client.connect({onSuccess: connectSuccess, onFailure: connectFailure});
}

function connectSuccess() {
	WL.SimpleDialog.show(
	"Change Server URL", "Successfully connected to the MobileFirst Server",
		[{
			text: "Close", handler: function() {}
		}]
	);
}
function connectFailure() {
	WL.SimpleDialog.show(
			"Change Server URL", "Failed connecting to the MobileFirst Server",
			[{
				text: "Close", handler: function() {}
			}]
	);
}

/* call wish List */

function getAllWLItems(){
	
	//Send dirty items first, then get all the items from server and store it in JSONStore
	//If there is no connectivity at any time, use the JSONStore data
	sendWLDirtyItemsToServer().then(
		//success	
		function() {
			var req = new WLResourceRequest("/adapters/LocalStoreAdapter/localstore/getAllItems", WLResourceRequest.GET); 

			req.send().then(function(resp){
				$('#JsonDiv').css("display","none");
					ParseData("#ResponseDiv",resp.responseText, "wishlist");
					addAllWLItemsToJSONStore(resp.responseText);
		        }, function(respFailure){
		        	getAllWLItemsFromJSONStore();
		        	WL.Logger.info("Local Store connectivity failed. So showing it from JSONStore.");
			});			
			
		},
		//failed
		function(error) {
			getAllWLItemsFromJSONStore();
			WL.Logger.info("sendWLDirtyItemsToServer() call failed. So showing it from JSONStore.");
		}	
	);	
}

function sendWLDirtyItemsToServer(){
	var dfd = WLJQ.Deferred();
	
	WL.JSONStore.get(WISH_LIST_COLLECTION_NAME).getAllDirty().then(function (dirtyDocs) {
		var len = dirtyDocs.length;		
		if(len == 0) {
			dfd.resolve();			
		} else {		
			sendWLDirtyItemToServer(dfd, dirtyDocs, 0);
		}
	});
	
	return dfd.promise();
}

function sendWLDirtyItemToServer(dfd, dirtyDocs, index) {
	if(index >= dirtyDocs.length) {
		dfd.resolve();
		return;
	}	
	var currentDirtyDoc = dirtyDocs[index];	
	var dirtyDoc = [];
	dirtyDoc.push(currentDirtyDoc);
	var data = currentDirtyDoc.json;	
	var req = new WLResourceRequest("/adapters/LocalStoreAdapter/localstore/addItem", WLResourceRequest.PUT);
	req.send(JSON.stringify(data)).then(function(resp){
		WL.Logger.info("Item sent to server:" + JSON.stringify(data));
		WL.JSONStore.get(WISH_LIST_COLLECTION_NAME).markClean(dirtyDoc);
		index++;
		sendWLDirtyItemToServer(dfd, dirtyDocs, index);
    }, function(respFailure){   
        WL.Logger.info("Local Store connectivy failed.");
        dfd.reject();
        return;
	});
}

function addAllWLItemsToJSONStore(items){
	var parsed = JSON.parse(items);
	var changeOptions = {
	    replaceCriteria : ['productId'],
	    addNew : true,
	    markDirty : false
	};
	    
	WL.JSONStore.get(WISH_LIST_COLLECTION_NAME).change(parsed, changeOptions).then(function () {
		WL.Logger.info("Succesfully received from server");
	});
	    	
}

function getAllWLItemsFromJSONStore(){

	WL.JSONStore.get(WISH_LIST_COLLECTION_NAME).findAll().then(function(docs){
		var len = docs.length;
		var items = [];

		while (len--) {
		  var doc = docs[len];
		  var data = doc.json;
		  items.push(data);
		}
                                                             
		if(items.length > 0) {
			ParseData("#ResponseDiv", JSON.stringify(items), "wishlist");
		}
	});		
}

function WLAddItem(){
	   
	var myItemObject = new Object();
    myItemObject.title=$('#wlItemName').val();
    myItemObject.store=$('#wlStoreName').val();
    myItemObject.price=parseInt($('#wlPrice').val());
    myItemObject.image='/images/iPadAir2.jpg';
    myItemObject.productId=Math.floor(Math.random()*1E4);
    
    var myString = JSON.stringify(myItemObject);
	var req = new WLResourceRequest("/adapters/LocalStoreAdapter/localstore/addItem", WLResourceRequest.PUT); 
	
	req.send(myString).then(function(resp){
		$('#JsonDiv').css("display","none");
			WLAddItemToJSONStore(myItemObject, false);
			WL.SimpleDialog.show("WishList","Item Added",[{text:'OK'}]);
            currentPage.loadPage(2);
        }, function(respFailure){
        	WLAddItemToJSONStore(myItemObject, true);
        	WL.SimpleDialog.show("WishList","Item Added",[{text:'OK'}]);
            currentPage.loadPage(2);        
            WL.Logger.info("Local Store connectivity failed. So added only to JSONStore.");
	});
}

function WLAddItemToJSONStore(myItemObject, markDirty){
	WL.JSONStore.get(WISH_LIST_COLLECTION_NAME).add(myItemObject, {markDirty: markDirty}).then(function(){
		WL.Logger.info("Added "+  JSON.stringify(myItemObject) + " to JSONStore");
	});		
}

/* JavaScript content from js/main.js in folder iphone */
// This method is invoked after loading the main HTML and successful initialization of the IBM MobileFirst Platform runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}
/* JavaScript content from js/main.js in folder iphone */
// This method is invoked after loading the main HTML and successful initialization of the IBM MobileFirst Platform runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}
/* JavaScript content from js/main.js in folder iphone */
// This method is invoked after loading the main HTML and successful initialization of the IBM MobileFirst Platform runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}
/* JavaScript content from js/main.js in folder iphone */
// This method is invoked after loading the main HTML and successful initialization of the IBM MobileFirst Platform runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}