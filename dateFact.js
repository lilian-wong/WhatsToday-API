'use strict';

const dateFactEndpoint = 'http://numbersapi.com';

function generateDateFactParam(){
    return dateFactEndpoint+'/'+thisMonth+'/'+thisDate+'/'+'date';
}

function getDateFact(){
    let url = generateDateFactParam();

    fetch(url)
    .then(response => {
        if(response.ok){
            return response.text();
        }
        else{
            console.log('Unable to load date fact. Error code: '+response.status+ ' '+ response.statusText)
        }
    })
    .then(responseJson => displayDateFact(responseJson))
}

function displayDateFact(dateFact){
    $('#dateInfo').append(`
    <h3>About this day:</h3>
    <p class="todayFact">${dateFact}</p>`);
}

$(getDateFact);