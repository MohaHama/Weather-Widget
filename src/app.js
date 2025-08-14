const cityEl = document.getElementById('city');
const apiKey = "a9437caa06ffac7b511126c39da5bbf5";

const firstDayEl  = document.getElementById('firstDay');
const secondDayEl = document.getElementById('secondDay');
const thirdDayEl  = document.getElementById('thirdDay');
const fourthDayEl = document.getElementById('fourthDay');

const firstSymEl  = document.getElementById('firstDaySymbol');
const secondSymEl = document.getElementById('secondDaySymbol');
const thirdSymEl  = document.getElementById('thirdDaySymbol');
const fourthSymEl = document.getElementById('fourthDaySymbol');

cityEl.addEventListener('keydown',  async event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const city = cityEl.textContent.trim();
        if (city) {
            try {
                const weatherData = await fetchWeather(city);
                displayWeatherInfo(weatherData);
            }
            catch (error) {
                console.log(error);
            }
        }
        else {
            cityEl.textContent = 'CITY NOT FOUND';
        }
    }
});

async function fetchWeather(city){
    const apiUrl =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?q=${encodeURIComponent(city)}` +
        `&appid=${apiKey}` +
        `&units=metric` +
        `&lang=en`;
    const response = await fetch(apiUrl);
    console.log(response);
    if (!response.ok) {
        throw new Error('Failed to fetch weather data.');
    }
    return await response.json();
}

async function displayWeatherInfo(data){
    const {
        name,
        coord: { lat, lon },
        main: { temp },
        weather: [{ description }]
    } = data;

    document.getElementById('weatherStatus').textContent = description;
    document.getElementById('temp').textContent = Math.round(temp);
    cityEl.textContent = name;


    try {
        const uvi = await fetchUV(lat, lon);
        renderUV(uvi);
    } catch (e){
        console.warn('UV fetch failed:', e);
        renderUV(null);
    }


    const now = new Date();
    document.getElementById('timeStamp').textContent =
        now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    document.getElementById('date').textContent =
        now.toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'2-digit' }).toUpperCase();
    updateForecastByCity(name);
}


async function updateForecastByCity(city){
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=en`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    fillNextFourDays(data.list);
}

function fillNextFourDays(list){

    const byDate = new Map();
    for (const item of list) {
        const [d, t] = item.dt_txt.split(' ');
        const cur = byDate.get(d);

        if (!cur || Math.abs(timeToMin(t) - 12*60) < Math.abs(timeToMin(cur.dt_txt.split(' ')[1]) - 12*60)) {
            byDate.set(d, item);
        }
    }

    // today’s date (skip it)
    const today = (new Date()).toISOString().slice(0,10);
    const days = [...byDate.entries()]
        .filter(([d]) => d > today)
        .slice(0, 4)
        .map(([, it]) => it);

    const targets = [
        [firstDayEl,  firstSymEl],
        [secondDayEl, secondSymEl],
        [thirdDayEl,  thirdSymEl],
        [fourthDayEl, fourthSymEl],
    ];

    days.forEach((it, i) => {
        const d = new Date(it.dt * 1000);
        const day = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
        const icon = emojiForWeather(it.weather?.[0]?.id);
        const [labelEl, iconEl] = targets[i];
        if (labelEl) labelEl.textContent = day;
        if (iconEl)  iconEl.textContent  = icon;
    });
}

function timeToMin(hhmmss){
    const [h,m] = hhmmss.split(':').map(Number);
    return h*60 + m;
}

function emojiForWeather(id){
    if (id == null) return '·';
    if (id === 800) return '☀️';
    if (id >= 200 && id <= 232) return '⛈️';
    if (id >= 300 && id <= 321) return '🌦️';
    if (id >= 500 && id <= 531) return '🌧️';
    if (id >= 600 && id <= 622) return '🌨️';
    if (id >= 701 && id <= 781) return '🌫️';
    if (id >= 801 && id <= 804) return '⛅';
    return '·';
}


//****************************** AUTO UPDATE ************************************//

// Kør ur oftere (hver 30. sekund) og vejr sjældnere (hver 10. minut)
const CLOCK_MS   = 30 * 1000;
const WEATHER_MS = 10 * 60 * 1000;

startAutoUpdate();

function startAutoUpdate(){
    updateClock();     // sæt tid/dato med det samme
    refreshAll();      // hent vejr med det samme

    setInterval(updateClock, CLOCK_MS);
    setInterval(refreshAll, WEATHER_MS);

    // Opdatér når du kommer tilbage til fanen / får net igen
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshAll();
    });
    window.addEventListener('online', refreshAll);
}

function refreshAll(){
    const city = document.getElementById('city').textContent.trim();
    if (!city || city.toUpperCase() === 'CITY NOT FOUND') return;

    fetchWeather(city)
        .then(displayWeatherInfo)
        .catch(console.error);
}


function updateClock(){
    const now = new Date();
    document.getElementById('timeStamp').textContent =
        now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    document.getElementById('date').textContent =
        now.toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'2-digit' }).toUpperCase();
}

async function fetchUV(lat, lon){
    // Open‑Meteo: gratis, ingen API-nøgle
    const url = `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=uv_index&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('UV request failed');
    const j = await res.json();
    const uvi = j?.current?.uv_index;
    return (typeof uvi === 'number') ? uvi : null;
}

function renderUV(uvi){
    const uvIndexEl = document.getElementById('uvIndex');

    if (uvi == null){
        uvIndexEl.textContent = 'N/A';
        return;
    }

    uvIndexEl.textContent = uvi.toFixed(1); // viser kun tallet
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeBtn').onclick = () => window.windowControls.close();
});