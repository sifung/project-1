//yes i don't know JavaScript yet, it's AI LOL
//Don't judge, after cloning my repo, ok bye!




// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
const currentTheme = localStorage.getItem('theme') || 
                    (prefersDarkScheme.matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

// Toggle theme when button is clicked
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Set the target year
const TARGET_YEAR = 2025;

function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Update current date display
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', dateOptions);
    
    // Update digital clock display
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    document.querySelector('.hours').textContent = hours;
    document.querySelector('.minutes').textContent = minutes;
    document.querySelector('.seconds').textContent = seconds;

    // Countdown calculations
    const yearStart = new Date(TARGET_YEAR, 0, 1);
    const yearEnd = new Date(TARGET_YEAR, 11, 31, 23, 59, 59);
    const isLeapYear = (TARGET_YEAR % 4 === 0 && TARGET_YEAR % 100 !== 0) || TARGET_YEAR % 400 === 0;
    const totalDays = isLeapYear ? 366 : 365;
    
    let daysPassed, daysLeft;
    
    if (currentYear < TARGET_YEAR) {
        daysPassed = 0;
        daysLeft = totalDays;
    } else if (currentYear > TARGET_YEAR) {
        daysPassed = totalDays;
        daysLeft = 0;
    } else {
        daysPassed = Math.floor((now - yearStart) / (1000 * 60 * 60 * 24)) + 1;
        daysLeft = totalDays - daysPassed;
    }

    // Update days display
    document.getElementById('days-passed').textContent = daysPassed;
    document.getElementById('days-left').textContent = daysLeft;

    // Calculate time remaining today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const timeLeftMs = endOfDay - now;
    const timeLeftHours = String(Math.floor(timeLeftMs / (1000 * 60 * 60))).padStart(2, '0');
    const timeLeftMinutes = String(Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const timeLeftSeconds = String(Math.floor((timeLeftMs % (1000 * 60)) / 1000)).padStart(2, '0');
    
    document.getElementById('time-left').textContent = `${timeLeftHours}:${timeLeftMinutes}:${timeLeftSeconds}`;
}

// Birthday functionality
const birthdayList = document.querySelector('.birthday-list');
const addBirthdayBtn = document.querySelector('.add-birthday');
const toggleViewBtn = document.querySelector('.toggle-view');
let birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
let showAll = false;

function displayBirthdays() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filteredBirthdays = [];
    let headerText = '';
    
    if (showAll) {
        // Show all birthdays grouped by month
        headerText = 'All Birthdays';
        filteredBirthdays = birthdays
            .map(b => {
                const nextDate = getNextBirthday(b.month, b.day);
                const daysUntil = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
                
                return {
                    ...b,
                    nextDate,
                    daysUntil,
                    monthName: nextDate.toLocaleDateString('en-US', {month: 'long'}),
                    dayOfMonth: nextDate.getDate()
                };
            })
            .sort((a, b) => a.daysUntil - b.daysUntil);
    } else {
        // Show only current month birthdays
        const currentMonth = now.toLocaleDateString('en-US', {month: 'long'});
        const currentMonthNum = now.getMonth() + 1;
        headerText = currentMonth;
        
        filteredBirthdays = birthdays
            .filter(b => {
                const nextDate = getNextBirthday(b.month, b.day);
                const daysUntil = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
                // Only show if birthday is today or in the future (regardless of month)
                // Except in 2025 where we hide past dates
                // Hide past dates in current year
                const currentYear = new Date().getFullYear();
                if (currentYear === TARGET_YEAR || currentYear < TARGET_YEAR) {
                    return daysUntil >= 0;
                }
                return true; // Show all birthdays after target year
            })
            .filter(b => b.month === currentMonthNum) // Still filter to current month after checking date
            .map(b => {
                const nextDate = getNextBirthday(b.month, b.day);
                const daysUntil = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
                
                return {
                    ...b,
                    nextDate,
                    daysUntil,
                    dayOfMonth: nextDate.getDate()
                };
            })
            .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    }

    birthdayList.innerHTML = '';

    if (filteredBirthdays.length === 0) {
        const message = showAll ? 'No birthdays saved' : `No birthdays in ${headerText}`;
        birthdayList.innerHTML = `<div class="no-birthdays">${message}</div>`;
        return;
    }

    if (showAll) {
        // Group by month for "All" view
        const byMonth = filteredBirthdays.reduce((acc, birthday) => {
            if (!acc[birthday.monthName]) {
                acc[birthday.monthName] = [];
            }
            acc[birthday.monthName].push(birthday);
            return acc;
        }, {});

        for (const [month, monthBirthdays] of Object.entries(byMonth)) {
            const monthHeader = document.createElement('div');
            monthHeader.className = 'birthday-month';
            monthHeader.innerHTML = `<h4>${month}</h4>`;
            birthdayList.appendChild(monthHeader);

            monthBirthdays.forEach(birthday => {
                const birthdayEl = document.createElement('div');
                birthdayEl.className = 'birthday-item';
                birthdayEl.innerHTML = `
                    <span class="birthday-date">${birthday.dayOfMonth}</span>
                    <span class="birthday-name">${birthday.name}</span>
                    <span class="birthday-days">${birthday.daysUntil === 0 ? 'Today!' : `${birthday.daysUntil} day${birthday.daysUntil !== 1 ? 's' : ''}`}</span>
                    <button class="delete-birthday" data-id="${birthday.id}">×</button>
                `;
                birthdayList.appendChild(birthdayEl);
            });
        }
    } else {
        // Single month view
        const monthHeader = document.createElement('div');
        monthHeader.className = 'birthday-month';
        monthHeader.innerHTML = `<h4>${headerText}</h4>`;
        birthdayList.appendChild(monthHeader);

        filteredBirthdays.forEach(birthday => {
            const birthdayEl = document.createElement('div');
            birthdayEl.className = 'birthday-item';
            birthdayEl.innerHTML = `
                <span class="birthday-date">${birthday.dayOfMonth}</span>
                <span class="birthday-name">${birthday.name}</span>
                <span class="birthday-days">${birthday.daysUntil === 0 ? 'Today!' : `${birthday.daysUntil} day${birthday.daysUntil !== 1 ? 's' : ''}`}</span>
                <button class="delete-birthday, data-id="${birthday.id}">×</button>
            `;
            birthdayList.appendChild(birthdayEl);
        });
    }
}

function addBirthday(name, month, day) {
    const id = Date.now().toString();
    birthdays.push({ id, name, month, day });
    localStorage.setItem('birthdays', JSON.stringify(birthdays));
    displayBirthdays();
}

addBirthdayBtn.addEventListener('click', () => {
    const name = prompt("Enter person's name:");
    if (!name) return;
    
    const dateStr = prompt("Enter birthday (MM/DD):");
    if (!dateStr) return;
    
    const [month, day] = dateStr.split('/').map(Number);
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
        alert('Invalid date format. Please use MM/DD');
        return;
    }
    
    addBirthday(name, month, day);
});

function getNextBirthday(month, day) {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // If before 2025, calculate next birthday relative to 2025
    if (currentYear < TARGET_YEAR) {
        return new Date(TARGET_YEAR, month - 1, day);
    }
    
    // Otherwise calculate normally (current year or next year)
    let nextDate = new Date(currentYear, month - 1, day);
    if (nextDate < now) {
        nextDate = new Date(currentYear + 1, month - 1, day);
    }
    
    return nextDate;
}

birthdayList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-birthday')) {
        const id = e.target.dataset.id;
        birthdays = birthdays.filter(b => b.id !== id);
        localStorage.setItem('birthdays', JSON.stringify(birthdays));
        displayBirthdays();
    }
});

// Toggle view button functionality
toggleViewBtn.addEventListener('click', () => {
    showAll = !showAll;
    toggleViewBtn.textContent = showAll ? 'Show Current Month' : 'Show All';
    displayBirthdays();
});

function getWeatherIcon(condition) {
  const icons = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Snow: '❄️',
    Thunderstorm: '⛈️',
    Drizzle: '🌦️',
    Mist: '🌫️'
  };
  return icons[condition] || '🌈';
}

// Update immediately and then every second
updateCountdown();
setInterval(updateCountdown, 1000);
displayBirthdays();

// Add refresh button functionality
const weatherRefreshBtn = document.createElement('button');
weatherRefreshBtn.textContent = '⟳ Refresh Weather';
weatherRefreshBtn.className = 'weather-refresh';
weatherRefreshBtn.addEventListener('click', fetchWeather);

// Insert refresh button next to weather display
const weatherContainer = document.querySelector('.weather-container');
if (weatherContainer) {
  weatherContainer.appendChild(weatherRefreshBtn);
}

// Enhanced error logging for weather API
async function fetchWeather() {
  try {
    console.log('Attempting to fetch weather data...');
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve, 
        error => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        { timeout: 10000 }
      );
    });
    console.log('Got location:', position.coords);

    const weatherElements = document.querySelectorAll('.weather-icon, .temperature, .weather-desc');
    if (weatherElements.length < 3) {
      console.warn('Missing weather display elements');
      return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=8862b645c89a0ac0044780af732fd0f0`;
    console.log('Fetching from:', apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Weather data:', data);

    document.querySelector('.weather-icon').textContent = getWeatherIcon(data.weather[0].main);
    document.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.querySelector('.weather-desc').textContent = data.weather[0].description;
  } catch (error) {
    console.error('Full error details:', error);
    const weatherDesc = document.querySelector('.weather-desc');
    if (weatherDesc) {
      let errorMsg = 'Weather unavailable';
      if (error.message.includes('NetworkError')) {
        errorMsg += ' - Check internet connection';
      } else if (error.message.includes('permission denied')) {
        errorMsg += ' - Please enable location access';
      } else if (error.message.includes('401') || error.message.includes('Invalid API key')) {
        errorMsg += ' - Invalid API key (check OpenWeatherMap account)';
      } else if (error.message.includes('timeout')) {
        errorMsg += ' - Location request timed out';
      }
      weatherDesc.textContent = errorMsg;
    }
  }
}

// Initial fetch and setup
fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);

