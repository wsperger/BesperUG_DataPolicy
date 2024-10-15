// Function to load the header
function loadHeader() {
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      // Initialize header functionality after loading the header
      initializeHeader();
    })
    .catch(error => {
      console.error('Error loading header:', error);
    });
}

// Initialize header functionality
function initializeHeader() {
  var menuToggle = document.getElementById('custom-menu-toggle');
  var navbar = document.getElementById('navbar');

  if (menuToggle && navbar) {
    // Toggle menu on click
    menuToggle.addEventListener('click', function() {
      var isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navbar.classList.toggle('show');
    });
  }

  // Initialize language selector
  setupLanguageSelector();

  // Add scroll event listener
  window.addEventListener('scroll', function() {
    var header = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Language Detection and Loading Translations
function detectLanguage() {
  const storedLang = localStorage.getItem('language');
  if (storedLang) {
    language = storedLang;
  } else {
    const userLang = navigator.language || navigator.userLanguage;
    language = userLang.startsWith('de') ? 'de' : 'en';
    localStorage.setItem('language', language);
  }
  document.documentElement.lang = language;
}

function loadTranslations() {
  return fetch(`lang/${language}.json`)
    .then(response => response.json())
    .then(data => {
      translations = data;
      translatePage();
    })
    .catch(error => {
      console.error('Error loading translation file:', error);
    });
}

function translatePage() {
  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (translations[key]) {
      element.innerText = translations[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      element.setAttribute('placeholder', translations[key]);
    }
  });
}

// Language Selector Listener
function setupLanguageSelector() {
  const languageSelect = document.getElementById('language-select');

  if (languageSelect) {
    languageSelect.value = language;
    languageSelect.addEventListener('change', (event) => {
      language = event.target.value;
      localStorage.setItem('language', language);
      loadTranslations();
    });
  }
}

// Global Variables
let translations = {};
let language = 'en'; // Default language

// Load the header and initialize
document.addEventListener('DOMContentLoaded', function() {
  detectLanguage();
  loadTranslations().then(() => {
    loadHeader();
  });
});