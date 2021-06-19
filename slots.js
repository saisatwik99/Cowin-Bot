const got = require('got');

const getSlotsData = async (pincode, age) => {
    let current_datetime = new Date();
    let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear();
    
	let baseURL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${formatted_date}`;
	
    var dataArray;

    const data = await got(baseURL);
    const res = await JSON.parse(data.body);
    return res;
};

exports.slots = async(pincode, age) => {
    const result = await getSlotsData(pincode, age);
    var markdown = '';
    const Age = parseInt(age);
    const allMessages = [];
    const filterResults = result.sessions.filter(e => (e.available_capacity > 0 && e.min_age_limit <= Age));
    if(filterResults.length > 0)
    {
        markdown += `<b>Hey, Vaccination Centers are available in your area.</b>`
        allMessages.push(markdown);
        filterResults.forEach((a) => {
            markdown = '';
            markdown += `<b>Location 📍</b>\n`;
            markdown += `${a.name}\n${a.address}\n${a.district_name}\n${a.state_name}\n${a.pincode}\n`;
            markdown += `<b>Vaccination Details 💉</b>\n`
            markdown += 
            `Vaccine: ${a.vaccine} \nAvailable Doses 💊: ${a.available_capacity}\nDate: ${a.date}\n`;
            
            allMessages.push(markdown);
        });
        return {
            status: true,
            slotsAvail: allMessages
        }
    }
    return {
        status: false
    }
}
