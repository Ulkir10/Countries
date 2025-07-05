document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const searchInput = document.getElementById('searchInput');
    const flagsContainer = document.getElementById('flagsContainer');

    let allCountriesData = [];

    // --- Dark Mode Functionality ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        updateDarkModeToggleIcon(savedTheme === 'dark-mode');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
        updateDarkModeToggleIcon(true);
    } else {
        updateDarkModeToggleIcon(false);
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark-mode' : 'light-mode');
        updateDarkModeToggleIcon(isDarkMode);
    });

    function updateDarkModeToggleIcon(isDarkMode) {
        const icon = darkModeToggle.querySelector('i');
        const textNode = darkModeToggle.lastChild;

        if (icon) {
            if (isDarkMode) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                textNode.nodeValue = ' Light Mode';
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                textNode.nodeValue = ' Dark Mode';
            }
        }
    }

    // --- Fetch Countries Data ---
    async function fetchCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,population,region,capital,flags,cca3');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allCountriesData = await response.json();
            displayCountries(allCountriesData);
        } catch (error) {
            console.error('Error fetching countries:', error);
            flagsContainer.innerHTML = '<p class="error-message">Failed to load countries. Please try again later.</p>';
        }
    }

    // --- Display Countries ---
    function displayCountries(countries) {
        flagsContainer.innerHTML = '';
        if (countries.length === 0) {
            flagsContainer.innerHTML = '<p class="no-results">No countries found matching your search.</p>';
            return;
        }

        countries.forEach(country => {
            const countryCard = document.createElement('div');
            countryCard.classList.add('flag-card');

            const countryName = country.name?.common || 'N/A';
            const population = country.population ? country.population.toLocaleString() : 'N/A';
            const region = country.region || 'N/A';
            const capital = country.capital && country.capital.length > 0 ? country.capital[0] : 'N/A';
            const flagSrc = country.flags?.png || '';
            const flagAlt = country.flags?.alt || `${countryName} flag`;

            countryCard.innerHTML = `
                <img src="${flagSrc}" alt="${flagAlt}" loading="lazy">
                <div class="flag-info">
                    <h2>${countryName}</h2>
                    <p><strong>Population:</strong> <span>${population}</span></p>
                    <p><strong>Region:</strong> <span>${region}</span></p>
                    <p><strong>Capital:</strong> <span>${capital}</span></p>
                </div>
            `;
            flagsContainer.appendChild(countryCard);
        });
    }

    // --- Debounce Function ---
    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Search Functionality ---
    searchInput.addEventListener('input', debounce((event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredCountries = allCountriesData.filter(country => {
            const matchesName = country.name?.common?.toLowerCase().includes(searchTerm);
            const matchesCapital = country.capital && country.capital.some(cap => cap.toLowerCase().includes(searchTerm));
            return matchesName || matchesCapital;
        });
        displayCountries(filteredCountries);
    }, 300));

    // --- Initial Fetch ---
    fetchCountries();
});
