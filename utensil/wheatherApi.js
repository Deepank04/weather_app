const axios = require("axios");


async function getWeather(city){

    try{

        const key = process.env.WHEATHER_KEY;


        // Get coordinates

        const geoURL =
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${key}`;


        const geo = await axios.get(geoURL);


        if(geo.data.length === 0){
            return null;
        }


        const lat = geo.data[0].lat;
        const lon = geo.data[0].lon;



        // Free forecast API

        const forecastURL =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;



        const forecast = await axios.get(forecastURL);



        return {

            city:geo.data[0].name,

            forecast:forecast.data.list

        };


    }
    catch(error){

        console.log(error.response?.data || error.message);

        return null;

    }

}


module.exports = getWeather;