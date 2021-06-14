const mongoose = require("mongoose");
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true
        }, { useUnifiedTopology: true });

        console.log('MongoDB Connected');
    } catch(err)
    {
        console.log(err.message);
        process.exit(1);
    }

}

module.exports = connectDB;