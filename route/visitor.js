const express = require("express");
const route = express.Router();

const getWeather = require("../utensil/wheatherApi");
const Visitor = require("../models/visitor");
const crypto = require("crypto");

require("dotenv").config();


// ========================================
// DAILY FORECAST
// ========================================

function getDailyForecast(forecast) {

    const daily = {};

    forecast.forEach(item => {

        const date = item.dt_txt.split(" ")[0];

        if (!daily[date]) {

            daily[date] = {
                date: date,
                min: item.main.temp,
                max: item.main.temp,
                icon: item.weather[0].icon
            };

        } else {

            daily[date].min = Math.min(
                daily[date].min,
                item.main.temp
            );

            daily[date].max = Math.max(
                daily[date].max,
                item.main.temp
            );

        }

    });

    return Object.values(daily);

}


// ========================================
// TRACK UNIQUE VISITOR
// ========================================

async function trackVisitor(req, res) {

    let visitorId = req.cookies.visitorId;


    // ====================================
    // NEW VISITOR
    // ====================================

    if (!visitorId) {

        visitorId = crypto.randomUUID();


        // Save visitor ID in browser cookie

        res.cookie("visitorId", visitorId, {

            httpOnly: true,

            maxAge:
                1000 *
                60 *
                60 *
                24 *
                365

        });


        // Save new visitor in MongoDB

        await Visitor.create({

            visitorId: visitorId

        });




    }


    // ====================================
    // EXISTING VISITOR
    // ====================================

    else {

        await Visitor.findOneAndUpdate(

            {
                visitorId: visitorId
            },

            {
                lastVisit: new Date()
            }

        );




    }

}


// ========================================
// DEFAULT WEATHER PAGE
// GET /visit/weather
// ========================================

route.get("/", async (req, res) => {

    try {

        // Default city

        const city = "Mumbai";


        // Get weather

        const data =
            await getWeather(city);


        if (!data) {

            return res.send(
                "City Not Found"
            );

        }


        // ====================================
        // TRACK VISITOR
        // ====================================

        await trackVisitor(
            req,
            res
        );


        // ====================================
        // COUNT UNIQUE VISITORS
        // ====================================

        const visitorCount =
            await Visitor.countDocuments();





        // ====================================
        // WEATHER DATA
        // ====================================

        const today =
            data.forecast[0];


        const dailyForecast =
            getDailyForecast(
                data.forecast
            );


        const todayMax =
            dailyForecast[0].max;


        const todayMin =
            dailyForecast[0].min;


        // ====================================
        // RENDER PAGE
        // ====================================

        res.render("index", {

            city:
                data.city,

            temperature:
                today.main.temp,

            weather:
                today.weather[0].main,

            humidity:
                today.main.humidity,

            rain:
                today.rain
                    ? today.rain["3h"]
                    : 0,

            aqi:
                "",

            windSpeed:
                today.wind.speed,

            forecast:
                data.forecast,

            dailyForecast:
                dailyForecast,

            todayMax:
                todayMax,

            todayMin:
                todayMin,

            visitorCount:
                visitorCount

        });


    } catch (error) {

        console.error(
            "WEATHER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Something went wrong"

        });

    }

});


// ========================================
// SEARCH WEATHER
// POST /visit/weather
// ========================================

route.post(
    "/weather",
    async (req, res) => {

        try {

            const city =
                req.body.city;


            // ====================================
            // GET WEATHER
            // ====================================

            const data =
                await getWeather(city);


            if (!data) {

                return res.send(
                    "City Not Found"
                );

            }


            // ====================================
            // TRACK VISITOR
            // ====================================

            await trackVisitor(
                req,
                res
            );


            // ====================================
            // COUNT UNIQUE VISITORS
            // ====================================

            const visitorCount =
                await Visitor.countDocuments();





            // ====================================
            // WEATHER DATA
            // ====================================

            const today =
                data.forecast[0];


            const dailyForecast =
                getDailyForecast(
                    data.forecast
                );


            const todayMax =
                dailyForecast[0].max;


            const todayMin =
                dailyForecast[0].min;


            // ====================================
            // RENDER PAGE
            // ====================================

            res.render("index", {

                city:
                    data.city,

                temperature:
                    today.main.temp,

                weather:
                    today.weather[0].main,

                humidity:
                    today.main.humidity,

                rain:
                    today.rain
                        ? today.rain["3h"]
                        : 0,

                aqi:
                    "--",

                windSpeed:
                    today.wind.speed,

                forecast:
                    data.forecast,

                dailyForecast:
                    dailyForecast,

                todayMax:
                    todayMax,

                todayMin:
                    todayMin,

                visitorCount:
                    visitorCount

            });


        } catch (error) {

            console.error(
                "WEATHER SEARCH ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Something went wrong"

            });

        }

    }
);


// ========================================
// AI WEATHER ASSISTANT
// POST /visit/ai/weather
// ========================================

route.post(
    "/weather",
    async (req, res) => {

        try {

            const {
                message,
                weather
            } = req.body;


            // ====================================
            // EMPTY MESSAGE CHECK
            // ====================================

            if (
                !message ||
                message.trim() === ""
            ) {

                return res.status(400).json({

                    reply:
                        "Please ask me a question."

                });

            }


            // ====================================
            // OPENROUTER API
            // ====================================

            const response =
                await fetch(

                    "https://openrouter.ai/api/v1/chat/completions",

                    {

                        method:
                            "POST",


                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${process.env.OPENAI_API_KEY}`

                        },


                        body:
                            JSON.stringify({

                                model:
                                    "openrouter/free",


                                messages: [

                                    // SYSTEM MESSAGE
                                    {

                                        role:
                                            "system",

                                        content: `

You are a friendly AI weather assistant.

You have access to the current weather data provided by the application.

Current weather:

City:
${weather?.city || "Unknown"}

Temperature:
${weather?.temperature || "Unknown"}°C

Condition:
${weather?.weather || "Unknown"}

Humidity:
${weather?.humidity || "Unknown"}%

Rain:
${weather?.rain || 0}

Wind Speed:
${weather?.windSpeed || "Unknown"} km/h


Rules:

1. Answer the user's weather questions using the provided weather data.

2. If rain is greater than 0, tell the user that rain is currently expected or recorded and recommend carrying an umbrella.

3. If rain is 0, tell the user that no rain is currently recorded, but explain that weather can change.

4. Never invent weather information.

5. Keep answers short, friendly and easy to understand.

`

                                    },


                                    // USER MESSAGE
                                    {

                                        role:
                                            "user",

                                        content:
                                            message

                                    }

                                ]

                            })

                    }
                );


            // ====================================
            // GET AI RESPONSE
            // ====================================

            const data =
                await response.json();


            // ====================================
            // AI API ERROR
            // ====================================

            if (!response.ok) {

                console.error(
                    "OPENROUTER ERROR:",
                    data
                );


                return res
                    .status(response.status)
                    .json({

                        reply:
                            "AI service error."

                    });

            }


            // ====================================
            // SUCCESS
            // ====================================

            return res.json({

                reply:
                    data
                        .choices[0]
                        .message
                        .content

            });


        } catch (error) {

            console.error(
                "AI ERROR:",
                error
            );


            return res.status(500).json({

                reply:
                    "❌ AI service is currently unavailable."

            });

        }

    }
);


// ========================================
// EXPORT ROUTER
// ========================================

module.exports = route;