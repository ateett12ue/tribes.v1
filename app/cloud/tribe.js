async function getCreatedTribe(
  tribe,
  teamId,
  name,
  description,
  treasuryAddress,
  savedOnChain,
  members, // List<string, string> => [{'ethAddress':0x....s34efg, 'role':admin/core/general}]
  organization,
  organizationVerified,
  openApplications,
  applicationRequirements,
  preferredChain,
  preferredToken
) {
  tribe.set("teamId", teamId);
  tribe.set("name", name);
  tribe.set("description", description);
  tribe.set("treasuryAddress", treasuryAddress);
  tribe.set("onchain", savedOnChain);
  tribe.set("members", members);
  tribe.set("organization", organization);
  tribe.set("organizationVerified", organizationVerified);
  tribe.set("openApplications", openApplications);
  tribe.set("applicationRequirements", applicationRequirements);
  tribe.set("latestContributionEpoch", null);
  tribe.set("latestTaskEpoch", null);
  tribe.set("preferredChain", preferredChain);
  tribe.set("preferredToken", preferredToken);
  return tribe;
}

async function getUpdatedTribeDetails(
  tribe,
  name,
  description,
  treasuryAddress,
  organization,
  organizationVerified,
  openApplications,
  applicationRequirements
) {
  tribe.set("name", name);
  tribe.set("description", description);
  tribe.set("treasuryAddress", treasuryAddress);
  tribe.set("organization", organization);
  tribe.set("organizationVerified", organizationVerified);
  tribe.set("openApplications", openApplications);
  tribe.set("applicationRequirements", applicationRequirements);
  return tribe;
}

async function getLatestEpochForTribe(team, epochId, task_epoch = false) {
  task_epoch ? team.set("latestTaskEpoch", epochId) : team.set("latestContributionEpoch", epochId);
  return team;
}

async function getTribeCount() {
  const tribeQuery = new Moralis.Query("Team");
  return await tribeQuery.count();
}

async function getTribeByTeamId(teamId) {
  const teamQuery = new Moralis.Query("Team");
  teamQuery.equalTo("teamId", parseInt(teamId));
  return await teamQuery.first();
}

async function getTribeObjByTeamId(teamId) {
  const teamQuery = new Moralis.Query("Team");
  const pipeline = [{ match: { teamId: parseInt(teamId) } }];
  return await teamQuery.aggregate(pipeline);
}

Moralis.Cloud.define("getTeam", async (request) => {
  const team = await getTribeObjByTeamId(request.params.teamId);
  if (team.length === 0) throw "Team not found";
  return team[0];
});

Moralis.Cloud.define("getMyTeams", async (request) => {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("userId", request.user.id);
  const userInfo = await userInfoQuery.find();
  return userInfo.get("tribes");
});

Moralis.Cloud.define("createTeam", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = new Moralis.Object("Team");
    const tribeCount = await getTribeCount();
    const teamId = tribeCount + 1;
    // Initialize tribe data
    team = await getCreatedTribe(
      team,
      teamId,
      request.params.name,
      request.params.description,
      request.params.treasuryAddress,
      (savedOnChain = false),
      (members = [{ userId: request.user.id, role: "admin" }]),
      request.params.organization,
      (organizationVerified = false),
      request.params.openApplications,
      request.params.applicationRequirements,
      request.params.preferredChain,
      request.params.preferredToken
    );

    // Add tribe to tribe creator's user info
    const userInfo = await getUserByUserId(request.user.id);
    teamMemberships = userInfo.get("tribes").concat([teamId]);
    userInfo.set("tribes", teamMemberships);

    await Moralis.Object.saveAll([team, userInfo], { useMasterKey: true });

    return team;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("updateTeam", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = await getTribeByTeamId(request.params.teamId);

    if (hasAccess(request.user.id, team, (requiredAccess = "admin"))) {
      await getUpdatedTribeDetails(
        request.params.name,
        request.params.description,
        request.params.treasuryAddress,
        request.params.organization,
        (organizationVerified = false),
        request.params.openApplications,
        request.params.applicationRequirements
      );
      await Moralis.Object.saveAll([team], { useMasterKey: true });
    }
    return team;
  } catch (err) {
    logger.error(`Error while updating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("updateMembers", async (request) => {
  /*request.params.members: [{"ethAddress":"0x232324", "role": "admin", "updateType":"invite"},
                              {"ethAddress':'0x232324', 'role': 'admin', 'updateType':'revoke'}, 
                              {'ethAddress':'0x232324', 'newRole': 'admin', 'oldRole':'general', 'updateType':'roleChange'}, 
                              {'ethAddress':'0x232324', 'role': 'admin', 'updateType':'invite']
      */
  const logger = Moralis.Cloud.getLogger();
  try {
    var team = await getTribeByTeamId(request.params.teamId);
    if (hasAccess(request.user.id, team, (requiredAccess = "admin"))) {
      var invitedMembers = request.params.members.filter((m) => m.updateType === "invite");
      logger.info(`Invited members: ${JSON.stringify(invitedMembers)}`);

      var revokedMemberAddresses = [];
      var revokedMembers = request.params.members.filter((m) => m.updateType === "revoke");
      revokedMembers.map((a) => revokedMemberAddresses.push(a.ethAddress));
      logger.info(`Revoked members: ${JSON.stringify(revokedMemberAddresses)}`);

      //var roleChangedMembers = request.params.members.filter((m) => m.updateType === "roleChange");
      await invite(invitedMembers, request.params.teamId, request.user.id);

      //await invite(invitedMembers, request.params.teamId, request.params.ethAddress);
      //await revoke(revokedMemberAddresses, request.params.teamId);

      return true;
    } else {
      logger.info(`User ${request.user.id} doesnt have access to update member roles`);
      return false;
    }
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});

Moralis.Cloud.define("checkMemberInTeam", async (request) => {
  const team = await getTribeObjByTeamId(request.params.teamId);
  if (team.length === 0 || !team)
  {
  	return false
  }
  const members = team[0].members;
  if(members)
  {
	let result = members.filter((member) => member.userId == request.params.userId);
	if(result.length > 0)
    {
       return true;
    }
    else
    {
       return false;
    }
  }
  else
  {
    return false;
  }
});

Moralis.Cloud.define("addMemberToTribe", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const team = await getTribeByTeamId(request.params.teamId);

  let members = team ? team.get('members') : [];
  if (hasAccess(request.params.adminId, team, (requiredAccess = "admin"))) 
  {
    try {
      if(isMember(request.params.userId, team))
      {
        return 'member already exist'
      }
      else
      {
        let newMember = 
          {
            "userId": request.params.userId,
            "role": request.params.userType
          }
        members.push(newMember)
        team.set('members', members);
        await Moralis.Object.saveAll([team], { useMasterKey: true });
        return 'invite accepted'
      }
    }
    catch(err) {
      logger.error(
        `Error while adding Member in team ${request.params.teamId}: ${err}`
      );
      return 'Error while adding Member'
    }
  }
  else
  {
    logger.error(
      `Error while adding Member in team ${request.params.teamId}: invide not valid`
    );
    return 'Invite Not Valid'
  }
});
