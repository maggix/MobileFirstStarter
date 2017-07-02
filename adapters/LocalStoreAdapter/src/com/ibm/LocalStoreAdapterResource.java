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

package com.ibm;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Properties;
import java.util.logging.Logger;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import com.worklight.adapters.rest.api.WLServerAPI;
import com.worklight.adapters.rest.api.WLServerAPIProvider;
import com.worklight.core.auth.OAuthSecurity;
import com.worklight.server.auth.api.MissingConfigurationOptionException;

@Path("/localstore")
public class LocalStoreAdapterResource {
	/*
	 * For more info on JAX-RS see https://jsr311.java.net/nonav/releases/1.1/index.html
	 */

	Properties props;
	JsonParser parser;

	//Define logger (Standard java.util.Logger)
	static Logger logger = Logger.getLogger(LocalStoreResource.class.getName());

    //Define the server api to be able to perform server operations
    WLServerAPI api = WLServerAPIProvider.getWLServerAPI();

    private void init() throws MissingConfigurationOptionException{
    	parser = new JsonParser();
    	props = new Properties();
	 	InputStream itemData =
	 		this.getClass().getClassLoader().getResourceAsStream("data.properties");
	 	try {
			props.load(itemData);
		} catch (IOException e) {
			throw new MissingConfigurationOptionException("Properties file");
		}
    }


	/* Path for method: "<server address>/wishlist/adapters/LocalStoreAdapter/users" */
	@GET
	@OAuthSecurity(enabled=false)
	@Path("/getAllItems")
	public String getAllItems() throws MissingConfigurationOptionException{
		init();
		JsonArray jsonArray = new JsonArray();
		for(Object key : props.keySet()){
			jsonArray.add(parser.parse(props.getProperty((String) key)).getAsJsonObject());
		}
		return jsonArray.toString();
	}

	@PUT
	@OAuthSecurity(enabled=false)
	@Path("/addItem")
	public void addItem(String itemJson)
			throws MissingConfigurationOptionException, URISyntaxException, IOException{
		try{
			init();
			int newKey = props.keySet().size()+1;
			props.put(String.valueOf(newKey), itemJson);
			URL url = this.getClass().getClassLoader().getResource("data.properties");
			File file = new File(url.toURI().getPath());
			FileOutputStream foStream = new FileOutputStream(file);
			props.store(foStream, "saving new item");
			foStream.close();

		}catch(IOException ioe){
			ioe.printStackTrace();
		}

	}

	@POST
	@OAuthSecurity(enabled=false)
	@Path("/addAllItems")
	public String addAllItems(String itemsJson)
			throws MissingConfigurationOptionException, URISyntaxException, IOException{
		try{
			init();
			clearAllData();
			JsonArray jsonArr = parser.parse(itemsJson).getAsJsonArray();
			for(int i=0;i<jsonArr.size();i++){
				props.put(String.valueOf(i+1), jsonArr.get(i).toString());
			}
			URL url = this.getClass().getClassLoader().getResource("data.properties");
			File file = new File(url.toURI().getPath());
			FileOutputStream foStream = new FileOutputStream(file);
			props.store(foStream, "saving new item");
			foStream.close();
			return "true";
		}catch(IOException ioe){
			ioe.printStackTrace();
		}
		return "false";
	}

	@DELETE
	@OAuthSecurity(enabled=false)
	@Path("/clearAll")
	public String clearAllData()
			throws MissingConfigurationOptionException, URISyntaxException, IOException{
			init();
			props.clear();
			System.out.println("Size : "+props.size());
			URL url = this.getClass().getClassLoader().getResource("data.properties");
			File file = new File(url.toURI().getPath());
			FileOutputStream foStream = new FileOutputStream(file);
			props.store(foStream, "clearing all data");
			foStream.close();
			return "cleared";
	}

}
