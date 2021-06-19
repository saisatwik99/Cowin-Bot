const { count } = require('../models/user');
const User =  require('../models/user');

exports.addUser = async (uid, username, age, pincode) => {
    try{
        
        const result = await User.find({uid: parseInt(uid), username, age: parseInt(age), pincode: parseInt(pincode)});
        
        if(result.length == 0)
        {
            await User.create({
                
                uid: parseInt(uid), 
                username,
                age: parseInt(age),
                pincode: parseInt(pincode)
            });

            return ({
                status: true,
                msg: `We will notify you if a vaccination slot available in your PinCode (${pincode}).\nSTAY HOME STAY SAFE😷`
            })
        } else {
            return ({
                status: true,
                msg: `You have already registered. We will notify you when a vaccination slot available on your Pincode.`,
            })
        } 
    } catch(err) {
        console.log(err);
        return {
            status: false,
            msg: "Sorry, Something went wrong! Please try again later."
        }
    }
}

exports.deleteUser = async (uid, username, age, pincode) => {
    try{
        
        const result = await User.remove({uid: parseInt(uid), username, age: parseInt(age), pincode: parseInt(pincode)});
        
        if(result.n == 0)
        {
            
            return ({
                status: true,
                msg: `Sorry, You didn't registered with us.`
            })
        } else {
            return ({
                status: true,
                msg: `Successfully Unregistered. Thank you for using Cowin-Bot 😉`,
            })
        } 
    } catch(err) {
        console.log(err);
        return {
            status: false,
            msg: "Sorry, Something went wrong! Please try again later."
        }
    }
}

exports.allUsers = async () => {
    try {
        
        const result = await User.find();
        return {
            status: true,
            result
        }

    } catch (err) {
        return {
            status: false,
            msg: "Sorry, Something went wrong! Please try again later."
        }
    }
}
