var APIKey = "031f48c5659090d360c40fa1a71a8e38";
// this stores the cities entered
userCities = [];

function loadCities() {
  //get list of cities from localStorage
  var citiesStr = localStorage.getItem("cities");
  if (citiesStr !== null) {
    userCities = JSON.parse(citiesStr);
  }
  //builds divs for each city
  for (var i = 0; i < userCities.length; i++) {
    $("#cities").append(buildCityDiv(userCities[i]));
  }
}

function buildCityDiv(city) {
  var newDiv = $("<div>");
  newDiv.text(city);
  newDiv.attr("id", city);
  newDiv.attr("class", "city-div");
  return newDiv;
}

function displayCityData(city) {
  $("#city-name").text(city);
  showWeather(city);
  showForecast(city);
}
// gets the images for the background of the carousels
function getBgURL(icon) {
  var url = "";

  switch (icon) {
    case "01d":
    case "01n":
      url = "assets/images/clear_sky.jpg";
      break;

    case "02d":
    case "02n":
      url = "assets/images/partly_cloudy.jpg";
      break;

    case "03d":
    case "03n":
    case "04d":
    case "04n":
      url = "assets/images/cloudy.jpg";
      break;

    case "09d":
    case "09n":
    case "10d":
    case "10n":
      url = "assets/images/rain.jpg";
      break;

    case "11d":
    case "11n":
      url = "assets/images/storm.jpg";
      break;

    case "13d":
    case "13n":
      url = "assets/images/snow.jpg";
      break;

    case "50d":
    case "50n":
      url = "assets/images/mist.jpg";
      break;
  }

  return url;
}
// function to call the weather api for the city entered
function showWeather(city) {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=imperial&appid=" +
    APIKey;

  $.ajax({
    url: queryURL,
    method: "GET",
    error: function() {
      $("#city-name").text("City Not Found");
      $("#help-text").text("City Not Found");
      $("#current-temp").text("");
      $("#current-humidity").text("");
      $("#current-wind").text("");
      $("#current-date").text("");
      $("#current-icon").attr("src", "");
      $("#current-icon").attr("alt", "...");
      $("#uv-label").text("");
      $("#current-uv").text("");
      $("#current-bg").attr("src", "assets/images/no_data.jpg");
      $("#current-bg").attr("alt", "no weather image");
    }
  }).then(function(response) {
    $("#help-text").text("");

    $("#current-temp").text(
      "Temperature: " + parseInt(response.main.temp) + "°F"
    );
    $("#current-humidity").text("Humidity: " + response.main.humidity + "%");
    $("#current-wind").text(
      "Wind Speed: " + parseInt(response.wind.speed) + " MPH"
    );

    var date = moment.unix(response.dt);
    var dateStr = date.format("M/D/YYYY");
    $("#current-date").text(dateStr);

    var icon = response.weather[0].icon;
    var iconURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
    $("#current-icon").attr("src", iconURL);
    $("#current-icon").attr("alt", "weather icon");

    var bgURL = getBgURL(icon);
    $("#current-bg").attr("src", bgURL);
    $("#current-bg").attr("alt", "weather background image");

    var lon = response.coord.lon;
    var lat = response.coord.lat;

    queryURL =
      "https://api.openweathermap.org/data/2.5/uvi?appid=" +
      APIKey +
      "&lat=" +
      lat +
      "&lon=" +
      lon;
    // calls for the UV index
    $.ajax({
      url: queryURL,
      method: "GET",
      error: function() {
        console.log("UV Index call failed");
      }
    }).then(function(response) {
      var uvIndex = response.value;
      var uvColor = "";
      if (uvIndex < 3) {
        uvColor = "green";
      } else if (uvIndex < 6) {
        uvColor = "yellow";
      } else if (uvIndex < 8) {
        uvColor = "orange";
      } else if (uvIndex < 11) {
        uvColor = "red";
      } else {
        uvColor = "violet";
      }
      $("#uv-label").text("UV Index: ");
      $("#current-uv").text(uvIndex);
      $("#current-uv").attr("style", "background-color: " + uvColor);
    });
  });
}
// function to display the 5 day forecast
function showForecast(city) {
  queryURL =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&units=imperial&appid=" +
    APIKey;

  $.ajax({
    url: queryURL,
    method: "GET",
    error: function() {
      for (var i = 0; i < 5; i++) {
        $("#forecast-temp-" + i).text("");
        $("#forecast-humidity-" + i).text("");
        $("#forecast-date-" + i).text("");
        $("#forecast-icon-" + i).attr("src", "");
        $("#forecast-icon-" + i).attr("alt", "...");
        $("#forecast-bg-" + i).attr("src", "assets/images/no_data.jpg");
        $("#forecast-bg-" + i).attr("alt", "no weather image");
      }
      $("#carouselIndicatorsDiv").carousel(0);
    }
  }).then(function(response) {
    for (var i = 0; i < 5; i++) {
      timeIndex = i * 8 + 7;

      $("#forecast-temp-" + i).text(
        "Temperature: " + parseInt(response.list[timeIndex].main.temp) + "°F"
      );
      $("#forecast-humidity-" + i).text(
        "Humidity: " + response.list[timeIndex].main.humidity + "%"
      );
      var date = moment.unix(response.list[timeIndex].dt);
      var dateStr = date.format("M/D/YYYY");
      $("#forecast-date-" + i).text(dateStr);
      var icon = response.list[timeIndex].weather[0].icon;
      var iconURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      $("#forecast-icon-" + i).attr("src", iconURL);
      $("#forecast-icon-" + i).attr("alt", "weather icon");

      var bgURL = getBgURL(icon);
      $("#forecast-bg-" + i).attr("src", bgURL);
      $("#forecast-bg-" + i).attr("alt", "weather background image");
    }

    $("#carouselIndicatorsDiv").carousel(0);
  });
}
// adds cities to the storage and adds divs for them
function addCity(city) {
  for (var i = 0; i < userCities.length; i++) {
    if (userCities[i] === city) {
      $("#" + city).remove();
      userCities.splice(i, 1);
    }
  }
  userCities.splice(0, 0, city);
  newDiv = buildCityDiv(city);
  $("#cities").prepend(newDiv);
  storeCities();
}
function storeCities() {
  localStorage.setItem("cities", JSON.stringify(userCities));
}
$(document).ready(function() {
  loadCities();

  //loads most recent viewed city
  if (userCities[0] !== undefined) {
    displayCityData(userCities[0]);
  }

  //creates click event for the submit button
  $("#city-submit").on("click", function() {
    event.preventDefault();
    var city = $("#city-input").val();
    $("#city-input").val("");

    if (city !== "") {
      addCity(city);
      displayCityData(city);
    }
  });

  $(document).on("click", ".city-div", function(event) {
    var city = $(this).text();
    displayCityData(city);
  });
});
//   carousel control and indicators
$("#carouselIndicatorsDiv").carousel();
$(".carousel-indicators li[data-slide-to=0]").click(function() {
  $("#carouselIndicatorsDiv").carousel(0);
});
$(".carousel-indicators li[data-slide-to=1]").click(function() {
  $("#carouselIndicatorsDiv").carousel(1);
});
$(".carousel-indicators li[data-slide-to=2]").click(function() {
  $("#carouselIndicatorsDiv").carousel(2);
});
$(".carousel-indicators li[data-slide-to=3]").click(function() {
  $("#carouselIndicatorsDiv").carousel(3);
});
$(".carousel-indicators li[data-slide-to=4]").click(function() {
  $("#carouselIndicatorsDiv").carousel(4);
});
$(".carousel-control-prev").click(function() {
  $("#carouselIndicatorsDiv").carousel("prev");
});
$(".carousel-control-next").click(function() {
  $("#carouselIndicatorsDiv").carousel("next");
});
