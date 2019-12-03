
'use strict';

//API URLS
const adviceURL = 'https://api.adviceslip.com/advice'; //Random Advice
const quoteURL = 'https://quote-garden.herokuapp.com/quotes/random'; //Random Quotes
const calendarificURL = 'https://calendarific.com/api/v2/holidays'; //Calendarific Global Holidays
const ip_loc = 'https://ipapi.co/json/'; //ip address
const weatherURL = 'https://api.openweathermap.org/data/2.5/weather'; //weather info
const calendarific_api_key = 'a72beece340b8b1fdc911880a439f871777eb604';
const openWeather_api_key = 'cac41a545f1a6a3eadf04d709f83ea14';

let countryCode ='US'; //string- required field : Default set as 'US'
let today ='';

// Set today Information
const todayDate = new Date();
const thisYear = todayDate.getFullYear(); //integer- required field
const thisMonth = todayDate.getMonth()+1; //The getMonth() method returns the month (from 0 to 11) for the specified date, according to local time
const thisDate = todayDate.getDate();
const thisWeekDay = todayDate.getDay();
const monthText = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
const weekDayShortText = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat'];//Calander
const weekDayText =['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday'];
const christmasDay = 25;
const christmasMonth = 12;
const newYearDay = 1;
const newYearMonth = 1;

// holiday 

function getWeatherInfo(){
$('.weatherInfo-link').click(function(){
    fetch (ip_loc)
        .then (response => {
                if(response.ok){
                    return response.json();
                }
                throw new Error(response.message);
            }
        )
       .then (responseJson => getWeather(responseJson.postal, countryCode))
});
}

// Generate parameter for weather API
function generateWeatherParam(zip, countryCode){
    return weatherURL+'?zip='+zip+','+countryCode+'&APPID='+openWeather_api_key;
}

// Generate parameter for calendarific API
function generateCalenderParam(calendarific_api_key,countryCode,thisYear){
    return `${calendarificURL}?api_key=${calendarific_api_key}&country=${countryCode}&year=${thisYear}`;
}

//function getHoliday(date, month, year, holidays){
function getHoliday(searchedYear){
    let url = generateCalenderParam(calendarific_api_key,countryCode,searchedYear);
    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }
        })
        .then(responseJson => {
            searchTodayHoliday(responseJson.response.holidays, 'Observance')
            searchByYearType(responseJson.response.holidays)
        })
}

function setCalender(){
    let lastDay = new Date(thisYear, thisMonth, 0);
    let lastDate = lastDay.getDate()+1;
    let firstWeekDay = new Date(thisYear, thisMonth, -1);
    firstWeekDay = firstWeekDay.getDay();
    let weekDayHTML ='';
    let dayHTML ='';

    //Generate weekdays text
    for(let i = 0;i<weekDayShortText.length; i++){
        weekDayHTML = weekDayHTML + '<li>'+weekDayShortText[i] + '</li>';
    }

    //set spacing for weekdays
    for(let k=0; k<firstWeekDay;k++){
        dayHTML = dayHTML + '<li>'+ ' ' + '</li>';
    }

    //set days of the month 
    for(let j = 1;j<lastDate+1; j++){
        if(thisDate===j){
            dayHTML = dayHTML + `<li value="${j}"><span class="today">${j}</span></li>`;
        }
        else{
            dayHTML = dayHTML + `<li value="${j}">${j}</li>`;
        }
    }

    $('#holidays').html(`
    <div class="month"> 
        <ul>
            <li>${monthText[thisMonth-1]} 
                <span>${thisYear}</span>
            </li>
        </ul>
    </div>
        <ul class="weekdays">
        <ul>
        ${weekDayHTML}
        <ul class="days">
        ${dayHTML}
    `)
}

// get results from Adviceslip API
function getAdvice(){
    let loc = '#dailyAdvice';
    fetch(adviceURL)
        .then(response => response.json())
        .then(responseJson => displayAdvice(responseJson))
}

// get results from Quote Garden API
function getQuote(){
    let loc = '#dailyQuote';
    fetch(quoteURL)
        .then(response => 
            response.json()
        )
        .then(responseJson => displayQuote(responseJson))
}

// get weather info from OpenWeather API
function getWeather(zip, country){
    let url = generateWeatherParam(zip, country);
    fetch (url)
        .then(response => response.json())
        .then(responseJson => displayWeather(responseJson))
}

function setHolidayType(holidays){
    let typeHoliday = [];
    let uniqueTypeHoliday = [];
    for(let i = 0; i<holidays.length; i++){
        typeHoliday.push(holidays[i]['type']);
    }

    //Remove Duplicates
    typeHoliday.sort();
    uniqueTypeHoliday.push(String(typeHoliday[0]));
    for(let j=0; j<typeHoliday.length-1; j++){
        if(String(typeHoliday[j])!=String(typeHoliday[j+1])){
            uniqueTypeHoliday.push(String(typeHoliday[j]));
        }
    }    
    return(uniqueTypeHoliday);
}

function searchByYearType(holidays){
    displayHolidaysType(setHolidayType(holidays));
    $('#holidaySearchForm').submit(function(event){
        event.preventDefault();         
        let monthlyHolidayHTML = '';
        for (let i = 0; i< holidays.length; i++){

            let holidayDate= holidays[i]['date']['iso'];
            let holidayName = holidays[i]['name'];
            // if (String(holidays[i]['date']['datetime'].year) === $('#yearEnter').val() && String(holidays[i]['type'])===$('#holidayType').val()){
                if (String(holidays[i]['date']['datetime'].year) === $('#yearEnter').val() &&
                String(holidays[i]['date']['datetime'].month) === $('#holidayMonth').val() && 
                String(holidays[i]['type'])===$('#holidayType').val()){
                monthlyHolidayHTML = monthlyHolidayHTML + `<p>${holidayDate} - ${holidayName}</p>`;
            }
        }   

        displayHolidays('#monthlyHoliday', monthlyHolidayHTML);   
    })
}

// Check today's date and type of holiday from the response json file. If the date and type match, display the name of holiday, else display non holiday message 
function searchTodayHoliday(holidays, type){
    let holidaysFound =  '';
    for (let i = 0; i< holidays.length; i++){
        if (holidays[i]['date']['iso']===today && holidays[i]['type']+''===type){
            holidaysFound = holidays[i]['name'];
        }
        else{
            holidaysFound ='Today is not a holiday';
        }
    }   
    displayHolidays('#todayHoliday', `<p2>${holidaysFound}</p>`);
}

//“Good morning”  5:00 a.m. to 12:00 p.m. 
//'Afternoon" " 12:01 PM to 5:00 PM. 
//“Good evening” 5:01p.m. to 8:00 pm
//"Good Night" "8:01 PM until 4:59 AM.
//Return greeting base on time of the day.

function checkTime(){
    let currentHour = todayDate.getHours();
    let currentMin = todayDate.getMinutes();
    if(currentHour >= 5 && currentHour <=12){
        if(currentHour === 12 && currentMin > 0){
            return 'Good afternoon!';
        }
        return 'Good morning!';
    }
    else if(currentHour > 12 && currentHour <= 17){
        if(currentHour == 17 && currentMin > 0){
            return 'Good evening!';
        }
        return 'Good afternoon!';
    }
    else if(currentHour > 17 && currentHour <=20){
        if(currentHour === 17 && currentMin >=0 ){
            return 'Good night';
        }
        return 'Good evening!';
    }else if(currentHour >20){
        return 'Good Night!';
    }
    else{
        return 'Good Night!';
    }
}

// All HTML Display functions

function displayGreetings(){
    let greeting = checkTime();
    let icon = '';
    if(greeting === 'Good morning!'){
        icon = 'sunny.png';
    }
    else if(greeting === 'Good evening!'){
        icon = 'evening.png';
    }
    else if(greeting === 'Good Night!'){
        icon = 'night.png';
    }
    else{
        icon = 'smiley.png';
    }
    $('#greetings').append(`
    <span><img src="./images/${icon}" alt="greeting icon" style="width:50px"></span>
    <span>${checkTime()}</span>
    `);
}

function setToday(){
    today = thisYear+'-'+thisMonth+'-'+thisDate;
    today = todayDate.toLocaleString('fr-CA', {year: 'numeric', month:'2-digit', day:'2-digit'})
    $('#dateInfo').append(`
    <span>Today is ${weekDayText[thisWeekDay]}, ${today}</span>
    <span>Current time is ${todayDate.toLocaleTimeString('en-US')}<span>`);
    
}

function displayHolidaysType(holidayType){
    //set holiday input type 
    $('#holidayType').append(`<option default>Please select holiday type</option>`);
    for (let i = 0; i<holidayType.length; i++){
        $('#holidayType').append(`
            <option value="${holidayType[i]}">${holidayType[i]}</option>
        `)
    }
}

function displayQuote(responseJson){
    $('#quote').empty();
    $('#quote').append(`
    <h2>Quote:</h2>
    <p>"${responseJson.quoteText}"</p>
    <p>-${responseJson.quoteAuthor}</p>`
    )
}

function displayAdvice(responseJson){
    let advice = responseJson.slip['advice'];
    $('#advice').append(`
    <h2>Daily Advice: </h2>
    <p>"${advice}"</p>`
    )
}

function displayHolidays(loc, holiday){
    $(loc).empty();
    $(loc).append(holiday);
}
function displayWeather(weather){ 
    $('#weatherInfo').empty();
    $('#weatherInfo').dialog();
    $('#weatherInfo').append(`
    <h2>Today's Weather ${weather['name']}:</h2>
    <p>Temp: ${(weather['main'].temp - 273.15).toFixed(2)}°C Humidity:${weather['main'].humidity} </p>
    <p>Weather: ${weather['weather'][0].main} ${weather['weather'][0].description}</p>
    <span><img src="http://openweathermap.org/img/wn/${weather['weather'][0].icon}@2x.png"><span>
    `)
}

//Toggle burger menu button
function toggleMenu(){
    $('#burger-menu').on('click',function(){
        $('#left-side').toggleClass('hidden');
    })
    $('#closeBurger').on('click',function(){
        $('#left-side').toggleClass('hidden');
    })
}

$('.dailyQuote-link').on('click',function(){
    let link = document.getElementById('quote');
    link.scrollIntoView();
});

$('.dailyAdvice-link').on('click',function(){
    let link = document.getElementById('advice');
    link.scrollIntoView();
});

$('.weatherInfo-link').on('click',function(){
    let link = document.getElementById('weatherInfo');
    link.scrollIntoView();
});

function scrollTop(){
    $('#topbtn').on('click', function(){
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;    
    });
}


// load all functions
function loadForms(){
    toggleMenu();
    displayGreetings();
    getWeatherInfo();
    getHoliday(thisYear);
    setToday();
    getAdvice();
    getQuote();
    setCalender();
    scrollTop();
}

$(loadForms);