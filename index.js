'use strict';

//API URLS
const quoteURL = 'https://quote-garden.herokuapp.com/quotes/random'; //Random Quotes
const calendarificURL = 'https://calendarific.com/api/v2/holidays'; //Calendarific Global Holidays
const ip_loc = 'https://ipapi.co/json/'; //ip address
const weatherURL = 'https://api.openweathermap.org/data/2.5/weather'; //weather info
const calendarific_api_key = '2a760f5fd99f43f85a5c229a5c6da3d0b55acb1e';
const openWeather_api_key = 'cac41a545f1a6a3eadf04d709f83ea14'; 

let countryCode ='US'; //string- required field : Default set as 'US'

// Set Date Information
let today ='';
const todayDate = new Date();
const thisYear = todayDate.getFullYear(); //integer- required field
const thisMonth = todayDate.getMonth()+1; //The getMonth() method returns the month (from 0 to 11) for the specified date, according to local time
const thisDate = todayDate.getDate(); 
const thisWeekDay = todayDate.getDay();
const monthText = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekDayShortText = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']; 
const weekDayText =['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday'];


function getFormattedToday(){
    return todayDate.getFullYear()+'-'+(todayDate.getMonth()+1)+'-'+todayDate.getDate();
}

function setToday(){
    displayGreetings();
    today = `${monthText[todayDate.getMonth()]} ${thisDate}, ${thisYear}`;
    $('#dateInfo').empty();
    $('#dateInfo').append(`
    <h2>It's ${weekDayText[thisWeekDay]}, ${today}</h2>
    `);   
}

// get random quotes from Quote Garden API
function getQuote(){
    let loc = '#dailyQuote';
    fetch(quoteURL)
        .then(response => 
            response.json()
        )
        .then(responseJson => displayQuote(responseJson))
        .catch(function(error){
            $('#quote').append(`Unable to retrieve quote due to server error code: ${error.message}`);
        })
}

function displayQuote(responseJson){
    $('#quote').empty();
    let author = responseJson.quoteAuthor;
    if(author===''){
        author = 'unknown';
    }
    $('#quote').append(`
    <h2>"${responseJson.quoteText}"</h2>
    <p>-${author}</p>`
    )
}

// When click the weather link, fetch zip code from https://ipapi.co/json/. Then pass the zip code to get weather information from openweathermap
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
       .then (responseJson => {
           getWeather(responseJson.latitude, responseJson.longitude);
        })
       .catch(function(error){
            console.log(`Something went wrong ${error.message}`);
       })
});
}

// get weather info from OpenWeather API
function getWeather(zip, country){
    let url = generateWeatherParam(zip, country);
    fetch (url)
        .then(response =>response.json()
        )
        .then(responseJson => 
                displayWeather(responseJson)            
        )
        .catch(function (error){
            console.log('Unable to retrieve weather information due to '+error.message);
        })
}

// Generate parameter for weather API
function generateWeatherParam(lat, lon){
    return weatherURL+'?lat='+lat+'&'+'lon='+lon+'&APPID='+openWeather_api_key;
}
//convert Kevin to Fahrenheit
function getFahrenheit(kevin){
    let f = (kevin-273.15)*9/5+32;
    return f.toFixed(2);
}

//convert Kevin to Celsius
function getCelsius(kevin){
    return (kevin-273.15).toFixed(2);
}

function displayWeather(weather){ 
    let temp = weather['main'].temp;
    $('#weatherInfo').empty();
    $('#weatherInfo').removeClass("hidden");
    $('#weatherInfo').dialog();
    $('#weatherInfo').append(`
    <h2>Today's Weather ${weather['name']}, ${weather['sys'].country}:</h2>
    <p>Temp: ${getCelsius(temp)}°C/ ${getFahrenheit(temp)}°F Humidity:${weather['main'].humidity} </p>
    <p>Weather: ${weather['weather'][0].main} ${weather['weather'][0].description}</p>
    <span><img src="https://openweathermap.org/img/wn/${weather['weather'][0].icon}@2x.png"><span>
    `)
}

// Generate parameter for calendarific API
function generateCalenderParam(calendarific_api_key,countryCode,year,month){
    return `${calendarificURL}?api_key=${calendarific_api_key}&country=${countryCode}&year=${year}&month=${month}`;
}

//create parameter for calling calendarific api 
function getCalender(){
    let url = generateCalenderParam(calendarific_api_key,countryCode,thisYear, thisMonth);
    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }
            throw new Error(response.status);
        })
        .then(responseJson =>{
                //create calender with the holiday info from calendarific api
                setCalender(responseJson.response.holidays);
        })  
        .catch(function(error){
            $('.searchHoliday').append(`Unable to retrieve holidays due to server error code: ${error.message}`);
            setCalender(''); 
        })
}

//Generate HTML code for Calender
function setCalender(holidays){
    let monthlyHoliday = setHoliday(holidays);//Get holiday information from calendarific API
    let lastDay = new Date(thisYear, thisMonth, 0);//Get the last day of current month
    let lastDate = lastDay.getDate();//Get the last date of the current month
    let firstWeekDay = new Date(thisYear, thisMonth, -1);//set the first weekday of current month and year

    firstWeekDay = firstWeekDay.getDay();//set the first week day of current month and year
    let weekDayHTML ='';
    let dayHTML ='';
    let allHoliday = ''; //In case of holiday did not pull, calender will still be created.

    //Generate weekday header: Sun, Mon, Tue, Wed, Thu, Fri, Sat
    for(let i = 0;i<weekDayShortText.length; i++){
        if(i === 0 || i ===6){
            //highlight weekend (Saturday and Sunday)
            weekDayHTML = weekDayHTML + `<li><span class="weekend">${weekDayShortText[i]}</span></li>`;
        }
        else{
            weekDayHTML = weekDayHTML + '<li>'+weekDayShortText[i] + '</li>';
        } 
    }

    //set spacing for calender. Create blank space before reaching first week day
    for(let k=1; k<firstWeekDay;k++){
        dayHTML = dayHTML + '<li>'+ ' ' + '</li>';
    }

    //Draw days starting from 1st day of month
    for(let dayOfMonth = 1;dayOfMonth<=lastDate; dayOfMonth++){  
        let tDate = dayOfMonth; 
        if(dayOfMonth<10){
            tDate = '0'+tDate;
        }
        // let searchDate = thisYear+'-'+thisMonth+'-'+tDate; //Set date format YYYY-MM-DD
        let searchDate = getFormattedToday();
        let foundHoliday = isHoliday(monthlyHoliday,  searchDate);
        
        //If today is a holiday
        if(thisDate===dayOfMonth){
            $('#dateInfo').append(`<p>${foundHoliday}</p>`);
            if(foundHoliday===''){
                dayHTML = dayHTML + `<li value="${dayOfMonth}"><span class="today" title="Today">${dayOfMonth}</span></li>`;
            }
            else{
                dayHTML = dayHTML + `<li value="${dayOfMonth}"><span class="today-holiday" title ="Today ${foundHoliday}">${dayOfMonth}</span></li>`;
            }
        }
        else{
            if(foundHoliday===''){
                dayHTML = dayHTML + `<li value="${dayOfMonth}">${dayOfMonth}</li>`;
            }
            else{
                dayHTML = dayHTML + `<li value="${dayOfMonth}"><span class="holiday" title ="${foundHoliday}">${dayOfMonth}</span></li>`;
            }
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
        <p class="allholidays">${allHoliday}</p>
    `)
}

// When user click search button,  pass api_key, countryCode, the year and month
function getHolidayByYearMonth(){
    $('#holidaySearchForm').submit(function(event){
        event.preventDefault(); 
        let url = generateCalenderParam(calendarific_api_key,countryCode,$('#yearEnter').val(), $('#holidayMonth').val());
        fetch(url)
            .then(response =>{
                if(response.ok){
                    return response.json();
                }
            })
            .then(responseJson => {
                searchHoliday(responseJson.response.holidays);
        })
    })
}

// Check today's date and type of holiday from the response json file. If the date and type match, display the name of holiday, else display non holiday message 
// For the calender only National holiday or Observance are displayed
function setHoliday(holidays){
    let holidaysFound = [];
    for (let i = 0; i< holidays.length; i++){
        if (holidays[i]['type'][0]+''==='Observance' || holidays[i]['type'][0]+''==='National holiday'){
           holidaysFound.push({
                date: holidays[i]['date']['iso'],
                holidayName: holidays[i]['name']});
        }
    }   
    return holidaysFound;
}

function displayHolidays(loc, holiday){
    $(loc).empty();
    $(loc).append(holiday);
}

// Retrieve each holiday date, name and type and display on the screen
function searchHoliday(holidays){
    let monthlyHolidayHTML = '';
    for (let i = 0; i< holidays.length; i++){
        if (String(holidays[i]['date']['datetime'].year) === $('#yearEnter').val() &&
        String(holidays[i]['date']['datetime'].month) === $('#holidayMonth').val()){
        monthlyHolidayHTML = monthlyHolidayHTML + `<p>${holidays[i]['date']['iso']} - ${holidays[i]['name']} (${holidays[i]['type']})</p>`; 
        }
    }   
    displayHolidays('#monthlyHoliday', monthlyHolidayHTML);   
}

//Check if a date matched in a holiday list.
function isHoliday(holidays, day){  
    for(let i=0;i<holidays.length; i++){
        if(holidays[i].date === day){
            return(holidays[i].holidayName);
        }
    }
    return '';
}

//“Good morning”  5:00 a.m. to 12:00 p.m. | 'Afternoon" " 12:01 PM to 5:00 PM. | “Good evening” 5:01p.m. to 8:00 pm
//"Good Night" "8:01 PM until 4:59 AM. | Return greeting base on time of the day.
function checkTime(){
    let currentHour = todayDate.getHours();
    let currentMin = todayDate.getMinutes();
    if(currentHour >= 5 && currentHour <=12){
        if(currentHour === 12 && currentMin > 0){
            return 'Good afternoon!';
        }
        else{
            return 'Good morning!';
        }
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
    $('#greetings').empty();
    let greeting = checkTime();
    let icon = '';

    switch(greeting){
        case 'Good morning!':
        icon = 'sunny.png';
        break;
        case 'Good evening!':
        icon = 'evening.png';
        break;
        case 'Good Night!':
        icon = 'night.png';
        break;
        default:
        icon = 'smiley.png'; 
    }

    $('#greetings').append(`
    <div><img src="./images/${icon}" alt="greeting icon" style="width:50px"></div>
    <h2>${checkTime()}</h2>
    `);
}

//Toggle burger menu button
function toggleMenu(htmlID, htmlClass){
    $(htmlID).on('click',function(){
        $(htmlClass).toggleClass('hidden');
    })
}

/*loader*/
function loadPage(){
    setTimeout(showPage, 3000);
    $(function(){
        $( document ).tooltip();
    });
    //If Get Daily Astronomy link is clicked on either burger menu or navigation menu, scroll down Holiday Search section
    $('.dailyAstronomy-link').on('click',function(){
        getAPOD(thisYear+'-'+thisMonth+'-'+thisDate);
        let link = document.getElementById('dailyAstronomy');
        link.scrollIntoView();
    });
    //If Holiday Search link is clicked on either burger menu or navigation menu, scroll down Holiday Search section
    $('.monthlyHolidaySearch-link').on('click',function(){
        let link = document.getElementById('monthlyHolidaySearch');
        link.scrollIntoView();
    });
}

function showPage(){
    document.getElementById('loader').style.display='none';
    document.getElementById('loadingMsg').style.display='none';

}

function setScroll(){
    $(window).scroll(function(event){
    if($(window).scrollTop()>20){
        topbtn.style.display ='block';
    }
    else{
        topbtn.style.display='none';
    }        
    });
}

function scrollTop(){
    $('#topbtn').on('click', function(){
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;    
    });
}

// load all functions
function loadForms(){
    toggleMenu('#burger-menu','#left-side');
    toggleMenu('#closeBurger','#left-side');
    getWeatherInfo();
    setToday();
    getHolidayByYearMonth();
    getQuote();
    //getCalender();
    setScroll();
    scrollTop(); 
}

$(loadForms);