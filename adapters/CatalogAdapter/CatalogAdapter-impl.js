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

/**
 *  WL.Server.invokeHttp(parameters) accepts the following json object as an argument:
 *
 *  {
 *  	// Mandatory
 *  	method : 'get' , 'post', 'delete' , 'put' or 'head'
 *  	path: value,
 *
 *  	// Optional
 *  	returnedContentType: any known mime-type or one of "json", "css", "csv", "plain", "xml", "html"
 *  	returnedContentEncoding : 'encoding',
 *  	parameters: {name1: value1, ... },
 *  	headers: {name1: value1, ... },
 *  	cookies: {name1: value1, ... },
 *  	body: {
 *  		contentType: 'text/xml; charset=utf-8' or similar value,
 *  		content: stringValue
 *  	},
 *  	transformation: {
 *  		type: 'default', or 'xslFile',
 *  		xslFile: fileName
 *  	}
 *  }
 */

function getCatalog() {
	var jsonData = [{"productID":"00001","title":"iPad Air 2","store":"bangalore","price":"600","photo":"/images/iPadAir2.jpg"},{"productID":"00002","title":"Xbox360 500GB","store":"Raleigh","price":"250","photo":"/images/xbox360.jpg"},{"productID":"00003","title":"Samsung 65-inch LED TV","store":"New York","price":"2600","photo":"/images/samsung65tv.jpg"},{"productID":"00004","title":"MacBook Pro","store":"Los Angeles","price":"1400","photo":"/images/macbook_pro.jpg"},{"productID":"00005","title":"Galaxy S6 Edge","store":"Boston","price":"300","photo":"/images/gs6edge.png"}];
	return {getAllProductsDetailsReturn : jsonData};
}
