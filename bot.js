const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const pincodeDirectory = require('india-pincode-lookup');
const cron = require('node-cron');


const userHandler = require('./helper/userHandler');
const connectDB = require('./config/db');
const Slots = require('./slots');
const User = require('./models/user');

//const token = '1673946862:AAGl5orGsUpulxRvwOMNsxhFicy25lSmU4g';
const token = String(process.env.TELETOKEN);
// Bot instance
const bot = new Telegraf(token);
dotenv.config();
connectDB();

//  [+] FUNCTION [+]
const getUserMessage = (ctx) => {
    const message = ctx.message.text.split(" ");
    message.shift();

    return message;
}

// [+] START COMMAND [+]
bot.command("start", (ctx) => {
    ctx.replyWithMarkdown(`
        👋 Good to see you 😊\n\n👉To Register with us to get Notified when vaccines are available\nType "/covid [age] [pincode]"\n\n👉To Unregister\nType "/delete [age] [pincode]"\n\n👉To register for vaccine visit https://www.cowin.gov.in/home
        
        <b>If you find any issues report at t.me/saisatwik99</b>
        <b>Also open for suggesions. Help us to improve 🚀</b>
    `, {parse_mode: 'HTML'});
    ctx.replyWithMarkdown(`
        Type /help to see all the available commands
    `);
});

bot.command("covid", async (ctx) => {
    
    // typing...
    // ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    
    if(ctx.message.chat.type === 'private'){
        ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
        
        try{
            const details = getUserMessage(ctx);
            
            if (!(details.length == 2)) {
                return ctx.reply("Usage: /covid [age] [pincode]");
            }
            if(parseInt(details[0]) === NaN)
            {
                return ctx.reply("Age must be a Number");
            }
            if(parseInt(details[0]) < 0)
            {
                return ctx.reply("Age must be a Postive");
            }
            if(parseInt(details[0]) > 200)
            {
                return ctx.reply("Is your age is really more than 200. Oh NO 😕");
            }
            var find = pincodeDirectory.lookup(details[1]);
            
            if (find.length == 0) {
                throw ''
            } else {
                var addupdateuser = await userHandler.addUser(ctx.message.from.id, ctx.message.from.username, details[0], details[1]);
                ctx.reply(addupdateuser.msg)

            }
        }catch (err) {
            console.log(err);
            try {
                ctx.replyWithHTML('Sorry this Pin code is invalid. Please send pincode again with correct format.\n\n<code>/covid [age] [pincode]</code>\n<b>Ex. </b><code>/covid 18 509001</code>')
            } catch (e) { }
        }
    }
});

bot.command("delete", async (ctx) => {
    if(ctx.message.chat.type === 'private'){
        ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
        try {
            const details = getUserMessage(ctx);
            if (!(details.length == 2)) {
                return ctx.reply("Usage: /delete [age] [pincode]");
            }
            if(parseInt(details[0]) === NaN)
            {
                return ctx.reply("Age must be a Number");
            }
            if(parseInt(details[0]) < 0)
            {
                return ctx.reply("Age must be a Postive");
            }
            if(parseInt(details[0]) > 200)
            {
                return ctx.reply("Is your age is really more than 200. Oh NO 😕");
            }

            var find = pincodeDirectory.lookup(details[1]);
            
            if (find.length == 0) {
                throw ''
            } else {
                var deleteduser = await userHandler.deleteUser(ctx.message.from.id, ctx.message.from.username, details[0], details[1]);
                ctx.reply(deleteduser.msg)

            }
        }catch (err) {
            console.log(err);
            try {
                ctx.replyWithHTML('Sorry this Pin code is invalid. Please send pincode again with correct format.\n\n<code>/covid [age] [pincode]</code>\n<b>Ex. </b><code>/covid 18 509001</code>')
            } catch (e) { }
        }
        
    }
})

bot.command("help", (ctx) => {
    
    ctx.replyWithMarkdown(`
        Learn more about our commands\n\n👉To Register with us to get Notified when vaccines are available\nType "/covid [age] [pincode]"\n\n👉To Unregister\nType "/delete [age] [pincode]"\n\n👉To register for vaccine visit https://www.cowin.gov.in/home
        
        <b>If you find any issues report at t.me/saisatwik99</b>
        <b>Also open for suggesions. Help us to improve 🚀</b>
    `, {parse_mode: 'HTML'});
});

const isMoreThan1Hour = (d1) => {
    const date1 = new Date(d1);
    const date2 = new Date();
    
    const diffTime = Math.abs(date2 - date1);
    
    const hours = Math.floor(diffTime/(1000*60*60));
    
    return hours >= 1 ? true : false;
}

sendMessageToEveryUser = async () => {
    
    try{
        var result = await userHandler.allUsers();
        if(result.status) {
            const allData = result.result;
            allData.forEach(async (user, index) => {
                
                if(isMoreThan1Hour(user.lastNotified))
                {
                    console.log("Its more than hour you need to be notified");
                    setTimeout(async () => {
                        try {
                            
                            const sendMessageData = await Slots.slots(user.pincode, user.age);
                            console.log(sendMessageData);
                            if(sendMessageData.status)
                            {
                                console.log("Its time for notification");
                                const n = sendMessageData.slotsAvail.length;
                                for(var i = 0; i < n; i++) {
                                    await bot.telegram.sendMessage(user.uid, sendMessageData.slotsAvail[i], { parse_mode: 'HTML' });
                                    
                                }
                                if(n > 0)
                                {
                                    const dateCurrent = new Date();
                                    await User.findOneAndUpdate({
                                        uid: parseInt(user.uid), 
                                        username: user.username,
                                        age: parseInt(user.age),
                                        pincode: parseInt(user.pincode)
                                    }, {
                                        uid: parseInt(user.uid), 
                                        username: user.username,
                                        age: parseInt(user.age),
                                        pincode: parseInt(user.pincode),
                                        lastNotified: dateCurrent 
                                    });
                                }
                            }
                        } catch(err){
                            console.log(err);
                        }
                    }, 1000 * index)
                }
            });
        }    
    } catch (err) {
        console.log(err);
    }
}

cron.schedule( `*/1 * * * *`, async () => {
    console.log("1 min passed");
    await sendMessageToEveryUser();
});

exports.Santba = async () => {
    const date = new Date().toLocaleString(undefined, {
        timeZone: "Asia/Kolkata",
    });
    bot.launch();
    console.log(`Bot ready \n${date} (IST)`);
    
};


