import { getWeather } from "./weather.js";
import { ICON_MAP } from "./iconmap.js";

document.getElementById('getCoordsButton').addEventListener('click', getCoordinates);

// Function to get coordinates
export function getCoordinates() {
  const locationInput = document.getElementById('locationInput').value;
  const opencageApiKey = '980608bb3ed8482b92fdd9813c52d9d5';
  const opencageApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationInput)}&key=${opencageApiKey}`;

  
  // Use fetch to make a request to OpenCage API
  fetch(opencageApiUrl)
    .then(response => response.json())
    .then(data => displayCoordinates(data))
    .catch(error => {
      console.error(error);
      alert("Error getting coordinates from OpenCage.");
    });
}

// Function to display coordinates and fetch weather data
export function displayCoordinates(data) {
  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry;
    const latitude = location.lat;
    const longitude = location.lng;
    const timezone = data.results[0].annotations.timezone.name;

    getWeather(latitude, longitude, timezone)
      .then(renderWeather)
      .catch(e => {
        console.error(e);
        alert("Error getting weather.");
      });
  }
}

// Event listener for the button
document.addEventListener('DOMContentLoaded', () => {
  const getCoordsButton = document.getElementById('getCoordsButton');

  if (getCoordsButton) {
    getCoordsButton.addEventListener('click', getCoordinates);
  }
});



function renderWeather({ current, daily, hourly }) {
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")
function renderCurrentWeather(current) {
  //currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily) {
  dailySection.innerHTML = ""
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true)
    setValue("temp", day.maxTemp, { parent: element })
    setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
    dailySection.append(element)
  })
}

const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
function renderHourlyWeather(hourly) {
  hourlySection.innerHTML = ""
  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true)
    setValue("temp", hour.temp, { parent: element })
    setValue("fl-temp", hour.feelsLike, { parent: element })
    setValue("wind", hour.windSpeed, { parent: element })
    setValue("precip", hour.precip, { parent: element })
    setValue("day", DAY_FORMATTER.format(hour.timestamp), { parent: element })
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
    hourlySection.append(element)
  })
}