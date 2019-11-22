let Discord = require("discord.io");
const token = require("./config/auth").token;
const config = require("./config/general");
let userData = null;
let fs = require('fs');
let bot = new Discord.Client({
    token: token,
    autorun: true
});

let userList = [];


bot.on('ready', function () {
    console.log("Bot ready! - connected: " + bot.connected);
    userList = bot.users;
   // generateUsers();
    userData = require("./defs/defSiege");
});
bot.on('message', function (user, userID, channelID, message, event) {

    let messageOperator = message.slice(0, 1);

    switch (messageOperator) {

        case config.operator.debug:
            debugProcess(user, userID, channelID, message);
            break;
        case config.operator.command:
            commandProcess(user, userID, channelID, message);
            break;
    }


});


bot.connect();

setInterval(function () {
   if(bot.connected === false){
       console.log("[DEBUG] Disconnected!");
       bot.disconnect();
       setTimeout(function () {
           bot.connect();
           if(bot.connected === true){
               console.log("[DEBUG]Reconnected !");
           }
       },1000);
   }
},6000);

/**
 *
 * @param user
 * @param userID
 * @param channelID
 * @param message
 */


function debugProcess(user, userID, channelID, message) {

    let args = message.slice(1, message.length).split(' ');
    switch (args[0]) {
        case "ping":
            bot.sendMessage({
                to: channelID,
                message: "```css\n#debug pong!\n```"
            });
            break;
    }


}

/**
 *
 * @param user
 * @param userID
 * @param channelID
 * @param message
 */

function commandProcess(user, userID, channelID, message) {

    let args = message.slice(1, message.length).split(' ');

    switch (args[0]) {

        case "gs":
            gsManagement(user, userID, channelID, args);
            break;
    }


}

/**
 *
 * @param user
 * @param userID
 * @param channelID
 * @param args
 */

function gsManagement(user, userID, channelID, args) {

    if (args.length > 1) {

        let mobs = null;
        switch (args[1]) {

            case "addNat5Def":
                mobs = args[2].split('/');
                if (mobs.length > 3) {
                    bot.sendMessage({
                        to: channelID,
                        message: "```css\n#gs your team is too long!\n```"
                    });
                } else if (isLocked(userID)) {
                    bot.sendMessage({
                        to: channelID,
                        message: "```css\n#gs Too much registered teams!\n```"
                    });
                } else {
                    if (!testDefDupes(mobs, userID)) {
                        if (args[3] != undefined) {
                            saveDef5Siege(mobs, userID, true);
                            bot.sendMessage({
                                to: channelID,
                                message: "```css\n#gs your team\n```\n```diff\n- " + mobs[0] + " " + mobs[1] + " " + mobs[2] + "\n```\n```fix\n+ Strong team successfully added! \n```"
                            });
                        } else {
                            saveDef5Siege(mobs, userID, false);
                            bot.sendMessage({
                                to: channelID,
                                message: "```css\n#gs your team\n```\n```diff\n- " + mobs[0] + " " + mobs[1] + " " + mobs[2] + "\n```\n```fix\n+ Team successfully added! \n```"
                            });
                        }
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "```css\n#gs your team is already registered!\n```"
                        });
                    }
                }

                break;
            case "addNat4Def":
                mobs = args[2].split('/');
                if (mobs.length > 3) {
                    bot.sendMessage({
                        to: channelID,
                        message: "```css\n#gs your team is too long!\n```"
                    });
                } else if (isLocked(userID)) {
                    bot.sendMessage({
                        to: channelID,
                        message: "```css\n#gs Too much registered teams!\n```"
                    });
                } else {
                    if (!testDefDupes(mobs, userID)) {
                        if (args[3] != undefined) {
                            saveDef4Siege(mobs, userID, true);
                            bot.sendMessage({
                                to: channelID,
                                message: "```css\n#gs your team\n```\n```fix\n- " + mobs[0] + " " + mobs[1] + " " + mobs[2] + "\n```\n```fix\n+ Strong team successfully added! \n```"
                            });
                        } else {
                            saveDef4Siege(mobs, userID, false);
                            bot.sendMessage({
                                to: channelID,
                                message: "```css\n#gs your team\n```\n```fix\n- " + mobs[0] + " " + mobs[1] + " " + mobs[2] + "\n```\n```fix\n+ Team successfully added! \n```"
                            });
                        }
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "```css\n#gs your team is already registered!\n```"
                        });
                    }
                }

                break;


            case "showMyTeams":
                displayTeamsByUser(userID,channelID);
                break;

            case "showAllTeams":
                displayAllTeams(userID,channelID);

                break;
            case "reset":
                resetTeamByUser(userID,channelID);
                break;

        }
    } else {
        bot.sendMessage({
            to: channelID,
            message: "```css\n#gs Missing parameter(s)\n```"
        });
    }
}

/**
 *
 * @param args
 * @param userId
 */

function saveDef4Siege(args, userId, isStrong) {
    let data;
    àç
    for (let i = 0; i < args.length; i++) {
        data = {first: args[0], second: args[1], third: args[2], isStrong: isStrong};
    }
    for (let user of userData.users) {
        if (user.userId === userId) {
            user.siege.nat4def.push(data);
        }
    }
    fs.writeFile(config.path.defSiege, JSON.stringify(userData), function (err) {
        if (err) throw err;
    });
}


/**
 *
 * @param args
 * @param userId
 */

function saveDef5Siege(args, userId, isStrong) {
    let data;

    for (let i = 0; i < args.length; i++) {
        data = {first: args[0], second: args[1], third: args[2], isStrong: isStrong};
    }
    for (let user of userData.users) {
        if (user.userId === userId) {
            user.siege.nat5def.push(data);
        }
    }
    fs.writeFile(config.path.defSiege, JSON.stringify(userData), function (err) {
        if (err) throw err;
    });
}


/**
 *
 *
 *
 */

function generateUsers() {

    if (!config.userLock) {
        let data = {users: []};
        for (let user in userList) {
            if (!userList[user].bot) {
                data.users.push({
                    userId: userList[user].id,
                    username: userList[user].username,
                    siege: {nat5def: [], nat4def: [], lock: false}
                });
            }
        }
        fs.writeFile(config.path.defSiege, JSON.stringify(data), function (err) {
            if (err) throw err;

        });
        config.userLock = true;
        fs.writeFile("./config/general.json", JSON.stringify(config), function (err) {
            if (err) throw err;
        });

    }


}

/**
 *
 * @param args
 * @param userId
 * @returns {boolean}
 */

function testDefDupes(args, userId) {
    let isDupe = false;
    for (let user of userData.users) {
        if (user.userId === userId) {
            for (let def4 of user.siege.nat4def) {
                if (def4.first === args[0] && def4.second === args[1] && def4.third === args[2]) {
                    isDupe = true;
                }
            }
            for (let def5 of user.siege.nat5def) {
                if (def5.first === args[0] && def5.second === args[1] && def5.third === args[2]) {
                    isDupe = true;
                }
            }

        }
    }
    return isDupe;
}

/**
 *
 * @param userId
 */

function isLocked(userId) {
    let isLocked = false;

    for (let user of userData.users) {
        if (user.userId === userId) {
            if (user.siege.nat5def.length === config.userDefLockParam.nb5nat || user.siege.nat4def.length === config.userDefLockParam.nb4nat) {
                isLocked = true;
            }
            if(user.siege.nat5def.length === config.userDefLockParam.nb5nat && user.siege.nat4def.length === config.userDefLockParam.nb4nat){
                isLocked = true;
                user.lock = true;
            }
        }
    }
    return isLocked;
}

function displayTeamsByUser(userId,chanelId){

    let message = "```css\n#defs Your teams:\n```\n\n```css\n-4 nat:```\n```diff\n";
    for(let user of userData.users){
        if(user.userId === userId){

            if(user.siege.nat4def.length>0){
                for(let def of user.siege.nat4def){
                    message+="- "+def.first+" - "+def.second+" - "+def.third+"\n";
                }
            }else{
                message +="- Nothing registered";
            }

            message+="```\n```css\n-5 nat:```\n```fix\n";

            if(user.siege.nat5def.length>0){
                for (let def of user.siege.nat5def){
                    message+="- "+def.first+" - "+def.second+" - "+def.third+"\n";
                }
            }else{
                message +="- Nothing registered";
            }

            message+="```";
        }
    }

    bot.sendMessage({
        to:chanelId,
        message:message
    });

}

function displayAllTeams(userId,channelId) {


    if(userId === bot.servers[Object.keys(bot.servers)[0]].owner_id){
        let message = "```css\n#defs Registered teams:\n```\n";

        for(let user of userData.users){

            let userMsg = "```css\n#"+user.username+":```\n```css\n-4 nat:```\n```diff\n"
            if(user.siege.nat4def.length>0){
                for(let def of user.siege.nat4def){
                    userMsg+="- "+def.first+" - "+def.second+" - "+def.third+"\n";
                }
            }else{
                userMsg +="- Nothing registered";
            }

            userMsg+="```\n```css\n-5 nat:```\n```fix\n";

            if(user.siege.nat5def.length>0){
                for (let def of user.siege.nat5def){
                    userMsg+="- "+def.first+" - "+def.second+" - "+def.third+"\n";
                }
            }else{
                userMsg +="- Nothing registered";
            }

            userMsg+="```\n";
            message+=userMsg;

        }

        bot.sendMessage({
            to:channelId,
            message:message
        });

    }else{
        bot.sendMessage({
            to:channelId,
            message:"```diff\n- Unauthorized request!```"
        });
    }



}

function resetTeamByUser(userId,channelId){
    bot.sendMessage({
        to:channelId,
        message:"```css\n#defs  Reset teams\n```\n```diff\n- Your defs are now reset\n```"
    });
    for(let user of userData.users){
        if(user.userId === userId){
            user.siege.nat5def = [];
            user.siege.nat4def = [];

            fs.writeFile(config.path.defSiege, JSON.stringify(userData), function (err) {
                if (err) throw err;
            });
        }
    }

}

