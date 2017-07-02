/*
 *  Licensed Materials - Property of IBM
 *  5725-I43 (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

//  BaseChallengeHandler.h
//  WorklightStaticLibProject
//
//  Created by Ishai Borovoy on 9/12/12.
//
//  Base class for all challenge handlers.
//

#import <Foundation/Foundation.h>
#import "WLResponse.h"

@class WLRequest;

/**
 * <code>BaseChallengeHandler</code> is a base class for all challenge-handler classes.
 */
@interface BaseChallengeHandler : NSObject {
    @private
    NSString *realm;

    @protected
    WLRequest *activeRequest;
    NSMutableArray *waitingRequestsList;
}

@property (nonatomic, strong) NSString *realm;
@property (atomic, strong) WLRequest *activeRequest;
@property (atomic, strong) NSMutableArray *waitingRequestsList;

/**
 * Initializes a challenge handler with an arbitrary name.
 *
 * @param iRealm A unique name for the challenge handler.<br />
 *        If the challenge comes from a realm, the challenge-handler name must be the name of the realm.
 */
 -(id) initWithRealm: (NSString *) iRealm;

-(void) handleChallenge: (NSDictionary *)challenge;

/**
 * Cancels a challenge. This method informs MobileFirst Platform Foundation that the you do not intend to take any additional actions in an attempt to resolve the challenge.<br/>
 * This method returns control to MobileFirst Platform Foundation for further handling. For example, call this method when the user clicks on a cancel button.
 * @param challenge The name of the challenge to cancel.
 */
 -(void) submitFailure: (WLResponse *)challenge;

-(void) releaseWaitingList;
-(void) clearWaitingList;

@end
