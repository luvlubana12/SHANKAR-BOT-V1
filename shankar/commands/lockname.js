module.exports.config = {
  name: "lockname",
  version: "1.0.0",
  role: 2, // केवल admin use कर पाए
  author: "Love Haryanvi",
  description: "Messenger group name lock/unlock",
  usages: "[on/off]",
  cooldowns: 5
};

const fs = require("fs");
const path = require("path");
const lockFile = path.join(__dirname, "data", "lockname.json");

// 🔒 पहले lock data load
let lockData = {};
if (fs.existsSync(lockFile)) {
  lockData = JSON.parse(fs.readFileSync(lockFile));
}

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const option = args[0];

  if (!option) return api.sendMessage("Use: lockname on/off", threadID);

  if (option === "on") {
    lockData[threadID] = true;
    fs.writeFileSync(lockFile, JSON.stringify(lockData, null, 2));
    return api.sendMessage("✅ Group name lock enabled!", threadID);
  } else if (option === "off") {
    delete lockData[threadID];
    fs.writeFileSync(lockFile, JSON.stringify(lockData, null, 2));
    return api.sendMessage("❌ Group name lock disabled!", threadID);
  } else {
    return api.sendMessage("Use: lockname on/off", threadID);
  }
};

// 🔄 Event handler (jab koi group name change kare)
module.exports.handleEvent = async function({ api, event }) {
  if (event.logMessageType === "log:thread-name") {
    const threadID = event.threadID;
    if (lockData[threadID]) {
      // पुराना नाम वापस set कर दो
      api.setTitle(event.logMessageData.name || "Group", threadID, (err) => {
        if (!err) {
          api.sendMessage("⚠️ Group name is locked!", threadID);
        }
      });
    }
  }
};
