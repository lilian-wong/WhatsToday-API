'use strict';

const nasaURL = 'https://api.nasa.gov/planetary/apod';
const nasa_api_key = 'xFhmBZfQZn8cRGsZe6e1wgRIrguSt3deMT8NV58O';

function generateAPODParam(date){
    return `${nasaURL}?api_key=${nasa_api_key}&date=${date}&hd=true`
}

function displayImage(APOD){
    $('#astro-title').removeClass("hidden");
    if(APOD!=''){
        $('.astro-container').append(`
            <h3 id="astro-title" >Astronomy Picture of the Day</h3>
            <img src="${APOD.hdurl}" width="100%" height="500px" alt="${APOD.title}">
            <div class="text-block">
                <p>Credit:${APOD.copyright} Title: ${APOD.title}</p>
            </div>
        `)
    }
}

function getAPOD(date){

    let url = generateAPODParam(date);
    
    fetch(url)
        .then(response => {
            if(response.ok){
                return response.json();
            }
            throw new Error(response.status);
        })
        .then(responseJson =>{
            displayImage(responseJson);
        })
        .catch(function(error){
            return '';
        })
}

function setBackground(loc, img){
    console.log(img);
   $(loc).css('background-image', 'url('+img+')');

}