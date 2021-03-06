var cityInput = document.querySelector(".cityInput");
var searchBtn = document.querySelector(".btn");
var currentWeather = document.querySelector(".currentWeather");
var fiveDaysForecastContainer = document.querySelector(".fiveDaysForecast");
var recentSearch = document.querySelector("#recentSearch");
var currentDay = moment().format('L');

var historySearchList = [];

var apiKey = "644f20b0136bb16b2ae52e3fe0e5f89c";

var weatherToday = function(cityName) {

    var url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;

    console.log(url);

    //get city name, temp, wind speed, humidity and uv value
    fetch(url)
        .then(function(weatherInfo) {
            return weatherInfo.json();
        })
        .then(function(data) {
            //get city name, temp, wind speed, humidity
            var weatherHeading = data.name;
            var weatherTemp = data.main.temp.toFixed();
            var feelLike = data.main.feels_like.toFixed();
            var tempMax = data.main.temp_max.toFixed();
            var tempMin = data.main.temp_min.toFixed();
            var feelLike = data.main.feels_like.toFixed();
            var condition = data.weather[0].description;
            var weatherWind = data.wind.speed.toFixed();
            var weatherHumidity = data.main.humidity;

            var lat = data.coord.lat;
            var lon = data.coord.lat;
            var uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            console.log(uvIndexUrl);

            //get uv value
            fetch(uvIndexUrl)
                .then(function(uvIndexInfo) {
                    return uvIndexInfo.json();
                })
                .then(function(uvData) {
                    var uvValue = uvData.value;

                    //display weather today
                    var weather = $(`
                        <div class="col-12 p-0 mt-3 currentWeatherContainer">
                            <h2 class="heading card-header col-12">Today's Weather</h2>
                            <h3 class="p-2 pl-3 weatherTodayHeading"><strong>${weatherHeading} (${currentDay})</strong></h3>
                            <div class="row">
                                <div class="col-12 col-md-6 col-lg-6">
                                    <p class="p-1 pl-3"><strong>Current Temp: </strong>${weatherTemp}??C</p>
                                    <p class="p-1 pl-3"><strong>Feels Like: </strong>${feelLike}??C</p>
                                    <p class="p-1 pl-3"><strong>High: </strong>${tempMax}??C</p>
                                    <p class="p-1 pl-3"><strong>Low: </strong>${tempMin}??C</p>
                                </div>
                                <div class="col-12 col-md-6 col-lg-6">
                                    <p class="p-1 pl-3 weatherCondition"><strong>Condition: </strong>${condition}</p>
                                    <p class="p-1 pl-3"><strong>Wind Speed: </strong>${weatherWind} km/h</p>
                                    <p class="p-1 pl-3"><strong>Humidity: </strong>${weatherHumidity}</p>
                                    <p class="p-1 pl-3"><strong>UV Index: </strong><span class="uvColour">${uvValue}</span></p>
                                </div>
                            </div>
                        </div>
                    `);

                    currentWeather.textContent = "";
                    $(".currentWeather").append(weather);

                    //conditions are favorable, moderate, or severe

                    if (uvValue >= 0 && uvValue <= 4) {
                        $(".uvColour").addClass("bg-success");
                    } else if (uvValue > 4 && uvValue < 8) {
                        $(".uvColour").addClass("bg-warning");
                    } else if (uvValue >= 8) {
                        $(".uvColour").addClass("bg-danger");
                    };

                    fiveDaysForecast(lat, lon);

                })
                .catch(function(error) {
                    alert("No UV Value record.");
                });
        })
        .catch(function(error) {
            alert("No city found, please enter correct city and try again.");
        });
}

var fiveDaysForecast = function(lat, lon) {
    var fiveDaysForeCastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${apiKey}`
    console.log(fiveDaysForeCastURL);

    fetch(fiveDaysForeCastURL)
        .then(function(forecastInfo) {
            return forecastInfo.json();
        })
        .then(function(forecastData) {

            //clear forecast container
            fiveDaysForecastContainer.textContent = "";

            //create heading
            var forecastHeading = document.createElement("h2");
            forecastHeading.textContent = "5 Days Forecast";
            forecastHeading.className = "col-12 card-header forecastHeading mt-3";
            fiveDaysForecastContainer.append(forecastHeading);

            //display 5 days weather forecast info
            for (var i = 0; i < 5; i++) {
                var cityWeather = {
                    date: forecastData.daily[i].dt,
                    icon: forecastData.daily[i].weather[0].icon,
                    temp: forecastData.daily[i].temp.day.toFixed(),
                    tempMin: forecastData.daily[i].temp.min.toFixed(),
                    tempMax: forecastData.daily[i].temp.max.toFixed(),
                    windSpeed: forecastData.daily[i].wind_speed.toFixed(),
                    humidity: forecastData.daily[i].humidity,
                }
                var displayDate = moment.unix(cityWeather.date).format("MM/DD/YYYY");
                var iconImageURL = `<img src="https://openweathermap.org/img/w/${cityWeather.icon}.png" alt="${forecastData.daily[i].weather[0].main}" />`;

                var displayForecast = $(`
                    <div class="card-body mt-3">
                        <h3 class="dailyDate">${displayDate}</h3>
                        <div class="row">
                            <p class="col-4 iconImg"> ${iconImageURL}</p>
                            <p class="col-8 dailyTemp" >${cityWeather.temp} ??C</p>
                        </div>
                        <p><strong>High: </strong>${cityWeather.tempMin}??C</p>
                        <p><strong>Low: </strong>${cityWeather.tempMax}??C</p>
                        <p><strong>Wind Speed: </strong>${cityWeather.windSpeed}\ km/h</p>
                        <p><strong>Humidity: </strong>${cityWeather.humidity}\%</p>
                    </div>
                `);

                $(".fiveDaysForecast").append(displayForecast);

            }
        })
        .catch(function(error) {
            alert("Unable to get data. Please try again.");
        });
}

searchBtn.addEventListener("click", function(e) {
    e.preventDefault();
    var searchedCity = cityInput.value;
    weatherToday(searchedCity);

    //add searched city into history search list and avoid repeat history city name in the array
    if (!historySearchList.includes(searchedCity)) {
        historySearchList.push(searchedCity);
        var displayHistoryList = $(`
            <ul class= "list-group list-group-flush listOfCities">
                <button type="button"class="list-group-item" value = ${searchedCity}>${searchedCity}</button>
            </ul>
        `);
        $("#recentSearch").append(displayHistoryList);
    };

    localStorage.setItem("searchedCity", JSON.stringify(historySearchList));
    console.log(historySearchList);

    //reset input field
    cityInput.value = "";

});

// function when user press enter key
cityInput.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        searchBtn.click();
    }
});

// loads cities from local storage
var loadHistory = function(lastIndex) {
    historySearchList = JSON.parse(localStorage.getItem('searchedCity'));

    if (!historySearchList) {
        historySearchList = [];
        return false;
    } else if (historySearchList.length > 5) {
        // store maximum 5 searched
        historySearchList.shift();
    }

    var histotyList = document.createElement('ul');
    histotyList.className = 'list-group list-group-flush listOfCities';
    recentSearch.appendChild(histotyList);

    for (var i = 0; i < historySearchList.length; i++) {
        var recentCitySearched = document.createElement('button');
        recentCitySearched.setAttribute('type', 'button');
        recentCitySearched.className = 'list-group-item';
        recentCitySearched.setAttribute('value', historySearchList[i]);
        recentCitySearched.textContent = historySearchList[i];
        histotyList.prepend(recentCitySearched);
    }

    var clickSearchedCity = document.querySelector('.listOfCities');
    //for the last search
    recentSearch.addEventListener('click', recentKeyword);
    //for clicking on recent search
    clickSearchedCity.addEventListener('click', recentKeyword);

    loadLatestSearch();
}

//function load the lastest search on the screen
var loadLatestSearch = function() {
    //get the lasted search
    if (historySearchList !== null) {
        var lastSearchedIndex = historySearchList.length - 1;
        var lastSearchedCity = historySearchList[lastSearchedIndex];
        weatherToday(lastSearchedCity);
    }
}

//function get value on the recent keyword put on the recent search list
var recentKeyword = function(event) {
    var selectedCity = event.target.getAttribute('value');
    weatherToday(selectedCity);
}

loadHistory();