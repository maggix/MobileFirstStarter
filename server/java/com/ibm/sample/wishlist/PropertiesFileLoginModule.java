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
package com.ibm.sample.wishlist;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import com.worklight.server.auth.api.MissingConfigurationOptionException;
import com.worklight.server.auth.api.UserIdentity;
import com.worklight.server.auth.api.WorkLightAuthLoginModule;
import com.worklight.server.auth.api.WorkLightLoginModuleBase;

@SuppressWarnings("serial")
public class PropertiesFileLoginModule implements WorkLightAuthLoginModule {

	private String userName;
	private String password;

	private Properties props;

	@Override
	public boolean login(Map<String, Object> authenticationData) {
		userName = (String) authenticationData.get("username");
		password = (String) authenticationData.get("password");
		System.out.println("username : "+userName + " password : "+password);
		String passwordFromProps = (String) props.get(userName);
        return (passwordFromProps != null && passwordFromProps.equals(password));
	}

	@Override
	public void logout() {
		userName = null;
		password = null;
	}

	@Override
	public void abort() {
		userName = null;
		password = null;
	}

	@Override
	public void init(Map<String, String> options)
		throws MissingConfigurationOptionException {
		props = new Properties();
	 	InputStream users =
	 		this.getClass().getClassLoader().getResourceAsStream("users.properties");
	 	try {
			props.load(users);
		} catch (IOException e) {
			throw new MissingConfigurationOptionException("Properties file");
		}
	}

	@Override
	public WorkLightLoginModuleBase clone() throws CloneNotSupportedException {
		return (PropertiesFileLoginModule) super.clone();
	}

	@Override
	public UserIdentity createIdentity(String loginModule) {
		System.out.println("inside createIdentity");
		HashMap<String, Object> customAttributes = new HashMap<String, Object>();
		customAttributes.put("AuthenticationDate", new Date());

		UserIdentity identity = new UserIdentity(loginModule, userName, null,
			null, customAttributes, password);

		return identity;
	}
}
