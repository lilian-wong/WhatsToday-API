'use strict';

const nameDayEndpoint = 'https://api.abalin.net/namedays?';

function generateNameDayParam(){
    return nameDayEndpoint+'country='+countryCode+'&month='+thisMonth+'&day='+thisDate;
}

function getNameDay(){
    let url = generateNameDayParam();

    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        else{
            console.log('Unable to load name day. Error code: '+response.status+ ' '+ response.statusText)
        }
    })
    .then(responseJson => displayNameDay(responseJson.data[0]['namedays']))
}

function displayNameDay(data){
    let strData = Object.values(data);
    $('#dateInfo').append(`
    <h3>Today's name day (${countryCode}):</h3>
    <p class="nameDay">${strData}</p>`);
}

$(getNameDay);