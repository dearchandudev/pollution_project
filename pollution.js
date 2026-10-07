/* =====================================================
   POLLUTION IN INDIA
   HTML + CSS + JAVASCRIPT + OPEN-METEO API
===================================================== */


/* ================= MOBILE MENU ================= */

function toggleMenu() {

    const nav = document.getElementById("navMenu");

    nav.classList.toggle("active");

}


document.querySelectorAll("#navMenu a").forEach(function(link) {

    link.addEventListener("click", function() {

        document
            .getElementById("navMenu")
            .classList.remove("active");

    });

});


/* =====================================================
   INDIAN CITIES
===================================================== */

const cities = [

    {
        name: "Delhi",
        latitude: 28.6139,
        longitude: 77.2090
    },

    {
        name: "Mumbai",
        latitude: 19.0760,
        longitude: 72.8777
    },

    {
        name: "Kolkata",
        latitude: 22.5726,
        longitude: 88.3639
    },

    {
        name: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707
    },

    {
        name: "Bengaluru",
        latitude: 12.9716,
        longitude: 77.5946
    },

    {
        name: "Hyderabad",
        latitude: 17.3850,
        longitude: 78.4867
    },

    {
        name: "Ahmedabad",
        latitude: 23.0225,
        longitude: 72.5714
    },

    {
        name: "Pune",
        latitude: 18.5204,
        longitude: 73.8567
    },

    {
        name: "Jaipur",
        latitude: 26.9124,
        longitude: 75.7873
    },

    {
        name: "Lucknow",
        latitude: 26.8467,
        longitude: 80.9462
    }

];


/* =====================================================
   AQI STATUS
===================================================== */

function getAQIStatus(aqi) {

    if (aqi === null || aqi === undefined) {

        return {
            text: "Unavailable",
            className: ""
        };

    }

    if (aqi <= 20) {

        return {
            text: "Good",
            className: "good"
        };

    }

    if (aqi <= 40) {

        return {
            text: "Fair",
            className: "fair"
        };

    }

    if (aqi <= 60) {

        return {
            text: "Moderate",
            className: "moderate"
        };

    }

    if (aqi <= 80) {

        return {
            text: "Poor",
            className: "poor"
        };

    }

    if (aqi <= 100) {

        return {
            text: "Very Poor",
            className: "very-poor"
        };

    }

    return {
        text: "Extremely Poor",
        className: "extreme"
    };

}


/* =====================================================
   FORMAT NUMBER
===================================================== */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "--";
    }

    return Number(value).toFixed(1);

}


/* =====================================================
   GET CITY AQI
===================================================== */

async function getCityAQI(city) {

    const url =
        "https://air-quality-api.open-meteo.com/v1/air-quality" +
        "?latitude=" + city.latitude +
        "&longitude=" + city.longitude +
        "&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone" +
        "&timezone=auto";


    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Unable to get air-quality data"
        );

    }


    const data = await response.json();


    return {

        city: city.name,

        latitude: city.latitude,

        longitude: city.longitude,

        aqi: data.current?.european_aqi,

        pm25: data.current?.pm2_5,

        pm10: data.current?.pm10,

        no2: data.current?.nitrogen_dioxide,

        so2: data.current?.sulphur_dioxide,

        o3: data.current?.ozone,

        time: data.current?.time,

        timezone: data.timezone

    };

}


/* =====================================================
   LOAD ALL CITY DATA
===================================================== */

let allCityData = [];


async function loadAQIData() {

    const status =
        document.getElementById("apiStatus");

    const results =
        document.getElementById("cityResults");


    status.innerHTML =
        "⏳ Loading live air-quality data...";


    results.innerHTML =
        `<div class="loading">
            Connecting to Open-Meteo API...
        </div>`;


    try {

        const responses =
            await Promise.allSettled(

                cities.map(function(city) {

                    return getCityAQI(city);

                })

            );


        allCityData =
            responses

                .filter(function(result) {

                    return result.status === "fulfilled";

                })

                .map(function(result) {

                    return result.value;

                });


        allCityData.sort(function(a, b) {

            return (b.aqi ?? -1) -
                   (a.aqi ?? -1);

        });


        if (allCityData.length === 0) {

            throw new Error(
                "No city data available."
            );

        }


        showHighestAndLowest();

        displayCities(allCityData);


        status.innerHTML =
            "✅ Air-quality data loaded successfully.";


    } catch (error) {

        console.error(error);


        status.innerHTML =
            "❌ Unable to load air-quality data. " +
            "Please check your internet connection and try again.";


        results.innerHTML =
            `<div class="loading">
                API data could not be loaded.
            </div>`;

    }

}


/* =====================================================
   HIGHEST / LOWEST
===================================================== */

function showHighestAndLowest() {

    const valid =
        allCityData.filter(function(city) {

            return typeof city.aqi === "number";

        });


    if (valid.length === 0) {

        return;

    }


    const highest = valid[0];

    const lowest =
        valid[valid.length - 1];


    document.getElementById("highestCity").innerHTML =
        highest.city +
        " — AQI " +
        formatNumber(highest.aqi);


    document.getElementById("lowestCity").innerHTML =
        lowest.city +
        " — AQI " +
        formatNumber(lowest.aqi);

}


/* =====================================================
   DISPLAY CITY CARDS
===================================================== */

function displayCities(data) {

    const container =
        document.getElementById("cityResults");


    if (data.length === 0) {

        container.innerHTML =
            `<div class="loading">
                No matching city found.
            </div>`;

        return;

    }


    container.innerHTML =
        data.map(createCityCard).join("");

}


/* =====================================================
   CITY CARD
===================================================== */

function createCityCard(data) {

    const status =
        getAQIStatus(data.aqi);


    let meterWidth = 0;


    if (typeof data.aqi === "number") {

        meterWidth =
            Math.min(
                Math.max(data.aqi, 0),
                150
            ) / 150 * 100;

    }


    return `

        <div
            class="city-card"
            data-city="${data.city.toLowerCase()}"
        >

            <div class="city-header">

                <h3>
                    🏙️ ${data.city}
                </h3>

                <div class="aqi-value">
                    ${formatNumber(data.aqi)}
                </div>

            </div>


            <span class="aqi-status ${status.className}">
                ${status.text}
            </span>


            <p>
                European AQI
            </p>


            <div class="aqi-meter">

                <div
                    class="aqi-meter-fill"
                    style="width:${meterWidth}%"
                ></div>

            </div>


            <div class="pollutants">

                <div class="pollutant">

                    <strong>
                        ${formatNumber(data.pm25)}
                    </strong>

                    PM2.5

                </div>


                <div class="pollutant">

                    <strong>
                        ${formatNumber(data.pm10)}
                    </strong>

                    PM10

                </div>


                <div class="pollutant">

                    <strong>
                        ${formatNumber(data.no2)}
                    </strong>

                    NO₂

                </div>


                <div class="pollutant">

                    <strong>
                        ${formatNumber(data.so2)}
                    </strong>

                    SO₂

                </div>


                <div class="pollutant">

                    <strong>
                        ${formatNumber(data.o3)}
                    </strong>

                    O₃

                </div>

            </div>


            <p style="margin-top:15px;font-size:13px;">

                Updated:
                ${data.time ?? "--"}

            </p>

        </div>

    `;

}


/* =====================================================
   FILTER CITY CARDS
===================================================== */

function filterCities() {

    const search =
        document
            .getElementById("citySearch")
            .value
            .toLowerCase()
            .trim();


    const filtered =
        allCityData.filter(function(city) {

            return city.city
                .toLowerCase()
                .includes(search);

        });


    displayCities(filtered);

}


/* =====================================================
   POLLUTION INFORMATION
===================================================== */

const pollutionData = {


    air: {

        icon: "🌫️",

        title: "Air Pollution",

        image:
            "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg",

        description:
            "Air pollution occurs when harmful particles, gases and other contaminants enter the atmosphere.",

        causes: [

            "Vehicle exhaust",

            "Industrial emissions",

            "Construction dust",

            "Open burning",

            "Power generation",

            "Agricultural burning"

        ],

        effects: [

            "Reduced air quality",

            "Respiratory health risks",

            "Damage to ecosystems",

            "Reduced visibility",

            "Environmental degradation"

        ],

        solution:
            "Use cleaner transportation, improve public transport, prevent open waste burning, control industrial emissions and construction dust, and monitor air quality.",

        example:
            "Use public transportation or walk for short journeys instead of taking a private vehicle whenever practical."

    },


    water: {

        icon: "💧",

        title: "Water Pollution",

        image:
            "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",

        description:
            "Water pollution occurs when harmful substances enter rivers, lakes, groundwater, wetlands or oceans.",

        causes: [

            "Untreated sewage",

            "Industrial wastewater",

            "Plastic waste",

            "Agricultural runoff",

            "Oil and chemical contamination"

        ],

        effects: [

            "Damage to aquatic ecosystems",

            "Unsafe water resources",

            "Loss of aquatic biodiversity",

            "Reduced water quality",

            "Economic impacts on communities"

        ],

        solution:
            "Treat sewage and industrial wastewater, reduce plastic waste, protect wetlands and water bodies, and improve waste management.",

        example:
            "Never throw plastic, oil, medicines or chemicals into drains or rivers."

    },


    plastic: {

        icon: "🛍️",

        title: "Plastic Pollution",

        image:
            "https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg",

        description:
            "Plastic pollution occurs when plastic products and waste accumulate in the environment.",

        causes: [

            "Single-use plastic",

            "Plastic packaging",

            "Poor waste collection",

            "Littering",

            "Improper disposal"

        ],

        effects: [

            "Damage to wildlife",

            "Marine pollution",

            "Blocked drainage",

            "Landscape pollution",

            "Long-term waste accumulation"

        ],

        solution:
            "Reduce unnecessary single-use plastic, reuse products, separate recyclable materials and improve waste collection.",

        example:
            "Carry a reusable bottle and shopping bag instead of repeatedly using disposable alternatives."

    },


    industrial: {

        icon: "🏭",

        title: "Industrial Pollution",

        image:
            "https://images.pexels.com/photos/459728/pexels-photo-459728.jpeg",

        description:
            "Industrial pollution can include air emissions, wastewater, solid waste, hazardous materials and noise.",

        causes: [

            "Factory emissions",

            "Industrial wastewater",

            "Chemical waste",

            "High energy consumption",

            "Improper waste disposal"

        ],

        effects: [

            "Air contamination",

            "Water contamination",

            "Soil degradation",

            "Resource consumption",

            "Community impacts"

        ],

        solution:
            "Use pollution-control equipment, treat wastewater, improve energy efficiency, reduce waste and monitor environmental performance.",

        example:
            "Factories can treat wastewater and reuse suitable process water."

    },


    soil: {

        icon: "🌱",

        title: "Soil Pollution",

        image:
            "https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg",

        description:
            "Soil pollution occurs when harmful chemicals and waste contaminate land and reduce soil quality.",

        causes: [

            "Excessive chemical use",

            "Industrial waste",

            "Improper waste disposal",

            "Oil contamination",

            "Hazardous waste"

        ],

        effects: [

            "Reduced soil quality",

            "Damage to plants",

            "Ecosystem degradation",

            "Possible food-chain contamination"

        ],

        solution:
            "Reduce unnecessary chemical use, compost organic waste, dispose of hazardous materials properly and protect soil from erosion.",

        example:
            "Convert suitable kitchen waste into compost instead of throwing it away."

    },


    noise: {

        icon: "🔊",

        title: "Noise Pollution",

        image:
            "https://images.pexels.com/photos/3584856/pexels-photo-3584856.jpeg",

        description:
            "Noise pollution is excessive or unwanted sound from traffic, construction, industry and other activities.",

        causes: [

            "Traffic",

            "Vehicle horns",

            "Construction",

            "Industrial machinery",

            "Loudspeakers"

        ],

        effects: [

            "Sleep disturbance",

            "Stress",

            "Reduced concentration",

            "Disturbance to wildlife",

            "Reduced environmental comfort"

        ],

        solution:
            "Reduce unnecessary honking, maintain machinery, control construction noise and use loudspeakers responsibly.",

        example:
            "Avoid unnecessary honking, especially around schools and hospitals."

    }

};


/* =====================================================
   OPEN POLLUTION MODAL
===================================================== */

function openPollutionModal(type) {

    const data =
        pollutionData[type];


    if (!data) {

        return;

    }


    document.getElementById("modalImage").src =
        data.image;


    document.getElementById("modalIcon").textContent =
        data.icon;


    document.getElementById("modalTitle").textContent =
        data.title;


    document.getElementById("modalDescription").textContent =
        data.description;


    document.getElementById("modalCauses").innerHTML =
        data.causes
            .map(item => `<li>${item}</li>`)
            .join("");


    document.getElementById("modalEffects").innerHTML =
        data.effects
            .map(item => `<li>${item}</li>`)
            .join("");


    document.getElementById("modalSolution").textContent =
        data.solution;


    document.getElementById("modalExample").textContent =
        data.example;


    document
        .getElementById("pollutionModal")
        .classList.add("show");


    document.body.style.overflow =
        "hidden";

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closePollutionModal() {

    document
        .getElementById("pollutionModal")
        .classList.remove("show");


    document.body.style.overflow =
        "";

}


function closeModalOutside(event) {

    if (
        event.target.id ===
        "pollutionModal"
    ) {

        closePollutionModal();

    }

}


document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closePollutionModal();

        }

    }
);


/* =====================================================
   PLASTIC CALCULATOR
===================================================== */

function calculatePlastic() {

    const bottles =
        Number(
            document.getElementById("bottles").value
        ) || 0;


    const bags =
        Number(
            document.getElementById("bags").value
        ) || 0;


    const cups =
        Number(
            document.getElementById("cups").value
        ) || 0;


    const weekly =
        bottles + bags + cups;


    const monthly =
        weekly * 4;


    const yearly =
        weekly * 52;


    document.getElementById(
        "plasticResult"
    ).innerHTML = `

        🌱 <strong>Your estimated plastic-item usage:</strong>

        <br><br>

        Weekly:
        <strong>${weekly}</strong> items

        <br>

        Monthly:
        <strong>${monthly}</strong> items

        <br>

        Yearly:
        <strong>${yearly}</strong> items

        <br><br>

        💡 Try reducing one category and calculate again.

    `;

}


/* =====================================================
   ENVIRONMENT FACTS
===================================================== */

const facts = [

    "Small environmental actions can become powerful when millions of people participate.",

    "Separating waste at the source can make recycling and waste treatment easier.",

    "Public transportation can reduce the number of individual vehicles on roads.",

    "Preventing waste is generally preferable to creating waste and then trying to manage it.",

    "Protecting wetlands and water bodies helps maintain important ecosystems.",

    "Reusing products can reduce the need for new materials and resources.",

    "Environmental monitoring helps identify pollution problems and measure progress."

];


let factIndex = 0;


function nextFact() {

    factIndex++;

    if (factIndex >= facts.length) {

        factIndex = 0;

    }


    document.getElementById(
        "factText"
    ).textContent =
        facts[factIndex];

}


setInterval(
    nextFact,
    7000
);


/* =====================================================
   GEOCODING + CITY SEARCH
===================================================== */

async function searchCity() {

    const input =
        document
            .getElementById("locationInput")
            .value
            .trim();


    const result =
        document.getElementById("searchResult");


    if (!input) {

        result.innerHTML =
            "<p>Please enter a city name.</p>";

        return;

    }


    result.innerHTML =
        "<p>🔎 Searching for the city...</p>";


    try {

        /* ---------------------------------------------
           STEP 1: GEOCODING API
        --------------------------------------------- */

        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search" +
            "?name=" +
            encodeURIComponent(input) +
            "&count=5" +
            "&language=en" +
            "&format=json";


        const geoResponse =
            await fetch(geoURL);


        if (!geoResponse.ok) {

            throw new Error(
                "Geocoding failed"
            );

        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            result.innerHTML =
                "<p>❌ City not found.</p>";

            return;

        }


        /* ---------------------------------------------
           PREFER INDIA RESULT
        --------------------------------------------- */

        let location =
            geoData.results.find(function(item) {

                return item.country_code === "IN";

            });


        if (!location) {

            location =
                geoData.results[0];

        }


        /* ---------------------------------------------
           STEP 2: AIR QUALITY API
        --------------------------------------------- */

        const url =
            "https://air-quality-api.open-meteo.com/v1/air-quality" +
            "?latitude=" + location.latitude +
            "&longitude=" + location.longitude +
            "&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone" +
            "&timezone=auto";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Air quality request failed"
            );

        }


        const data =
            await response.json();


        const aqi =
            data.current?.european_aqi;


        const status =
            getAQIStatus(aqi);


        result.innerHTML = `

            <div class="city-card">

                <div class="city-header">

                    <h3>
                        📍 ${location.name}
                    </h3>

                    <div class="aqi-value">
                        ${formatNumber(aqi)}
                    </div>

                </div>


                <span class="aqi-status ${status.className}">
                    ${status.text}
                </span>


                <p>
                    European AQI
                </p>


                <div class="aqi-meter">

                    <div
                        class="aqi-meter-fill"
                        style="
                            width:
                            ${Math.min(
                                Math.max(aqi || 0, 0),
                                150
                            ) / 150 * 100}%
                        "
                    ></div>

                </div>


                <div class="pollutants">

                    <div class="pollutant">

                        <strong>
                            ${formatNumber(
                                data.current?.pm2_5
                            )}
                        </strong>

                        PM2.5

                    </div>


                    <div class="pollutant">

                        <strong>
                            ${formatNumber(
                                data.current?.pm10
                            )}
                        </strong>

                        PM10

                    </div>


                    <div class="pollutant">

                        <strong>
                            ${formatNumber(
                                data.current?.nitrogen_dioxide
                            )}
                        </strong>

                        NO₂

                    </div>


                    <div class="pollutant">

                        <strong>
                            ${formatNumber(
                                data.current?.sulphur_dioxide
                            )}
                        </strong>

                        SO₂

                    </div>


                    <div class="pollutant">

                        <strong>
                            ${formatNumber(
                                data.current?.ozone
                            )}
                        </strong>

                        O₃

                    </div>

                </div>


                <p style="margin-top:15px">

                    🌐 ${location.country || "Unknown"}

                    <br>

                    📍 Latitude:
                    ${formatNumber(location.latitude)}

                    <br>

                    📍 Longitude:
                    ${formatNumber(location.longitude)}

                </p>

            </div>

        `;


    } catch (error) {

        console.error(error);


        result.innerHTML = `

            <div class="city-card">

                ❌ Unable to retrieve air-quality data.

                <br><br>

                Please check your internet connection
                and try again.

            </div>

        `;

    }

}


/* =====================================================
   BACK TO TOP
===================================================== */

window.addEventListener(
    "scroll",
    function() {

        const button =
            document.getElementById("topButton");


        if (window.scrollY > 500) {

            button.style.display =
                "block";

        } else {

            button.style.display =
                "none";

        }

    }
);


function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================================
   START API AUTOMATICALLY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadAQIData();

    }
);