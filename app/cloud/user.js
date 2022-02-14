async function getCreatedUser(userInfo, userId) {
  userInfo.set("userId", userId);
  userInfo.set("tribes", []);
  return userInfo;
}

async function getUpdatedUser(userInfo, tribes) {
  userInfo.set("tribes", tribes);
  return userInfo;
}

async function getUserByEthAddress(ethAddress) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("ethAddress", ethAddress);
  return await userInfoQuery.first();
}

async function getUserByUserId(userId) {
  const userInfoQuery = new Moralis.Query("UserInfo");
  userInfoQuery.equalTo("userId", userId);
  return await userInfoQuery.first();
}

async function getUsernamesByUserIds(userIds) {
  const userQuery = new Moralis.Query("User");
  userQuery.containedIn("objectId", userIds);
  const users = await userQuery.find({ useMasterKey: true });
  var userArray = [];
  for (var user of users) {
    userArray.push({ userId: user.id, username: user.get("username") });
  }
  return userArray;
}

Moralis.Cloud.define("getOrCreateUser", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      userInfo = new Moralis.Object("UserInfo");
      userInfo = await getCreatedUser(userInfo, request.user.id);
      await Moralis.Object.saveAll([userInfo], { useMasterKey: true });
    }
    return userInfo;
  } catch (err) {
    logger.error(`Error while creating team ${err}`);
    return false;
  }
});
