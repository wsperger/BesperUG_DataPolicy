
// header.js

// Load the header
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

// Initialize header functionality
function initializeHeader() {
  var menuToggle = document.getElementById('custom-menu-toggle');
  var navbar = document.getElementById('navbar');

  if (menuToggle && navbar) {
    // Toggle menu on click
    menuToggle.addEventListener('click', function() {
      var isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
      navbar.classList.toggle('show');
    });
  }

  // Logo Interaction
  var logoContainer = document.getElementById('bsp-logo-container');
  var taglineHighlight = logoContainer.querySelector('.bsp-tagline-highlight');

  if (logoContainer && taglineHighlight) {
    logoContainer.addEventListener('mouseenter', function() {
      taglineHighlight.style.color = '#0056b3';
    });

    logoContainer.addEventListener('mouseleave', function() {
      taglineHighlight.style.color = '#003057';
    });
  }
}