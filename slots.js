const got = require('got');
const { calendarByPin } = require('cowin');

const getSlotsData = async (pincode, age) => {
    let current_datetime = new Date();
    let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear();
    
	let baseURL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${formatted_date}`;
	
    const data =  await calendarByPin(pincode, formatted_date);
    
    return data;
};


exports.slots = async(pincode, age) => {
    try{
        const data = await getSlotsData(pincode, age);
        const Age = parseInt(age);
        if (!data.status) {
            throw ''
        } else {
            var available = []

            data.result.forEach(center => {
                var centeravail = center.sessions.filter(session => ( session.available_capacity > 0 && session.min_age_limit <= Age))
                if (centeravail.length !== 0) {
                    available.push({
                        name: center.name,
                        address: center.address,
                        state: center.state_name,
                        district: center.district_name,
                        block_name: center.block_name,
                        pincode: center.pincode,
                        block_name: center.block_name,
                        price: center.fee_type,
                        centers: centeravail
                    })
                }
            })
        }

        if (available.length !== 0) {
            let text = `<b>Found ${available.length} available vaccination center${(available.length === 1) ? '' : 's'}</b>\n\n`

            let alltextdata = []

            available.forEach((center, i) => {
                text += `<b>${i + 1}.</b> <i>${center.name}, ${center.block_name}, ${center.state} (${center.pincode})</i>\n\n<b>Address: </b>${center.address}\n<b>Pricing: </b>${center.price}\n<b>Sessions 👇</b>\n\n`
                center.centers.forEach(session => {
                    text += `📅 <u>Date:</u> (${session.date})\n👨‍👩‍👧‍👦 <u>Capacity:</u> ${session.available_capacity}\n👴 <u>Min Age Limit:</u> ${session.min_age_limit}\n💉 <u>Vaccine Name:</u> ${session.vaccine}\n⏰ <u>Slots:</u>${session.slots.map(time => {
                        return ' ' + time
                    })}\n\n`
                })
                alltextdata.push(text)
                text = ''
            })

            return {
                status: true,
                slotsAvail: alltextdata
            }
        } else {
            throw ''
        }
    } catch(err){
        return{
            status: false
        }
    }
}
