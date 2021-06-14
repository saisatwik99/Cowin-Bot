const express = require('express');
const Santba = require('./bot.js');

const app = express();

app.use(express.static('public'))


// Run the bot 
app.listen(process.env.PORT, () => {
	Santba.Santba();
});