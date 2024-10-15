// footer.js

// Load the footer
fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;

    // Initialize footer functionality after loading the footer
    initializeFooter();
  })
  .catch(error => {
    console.error('Error loading footer:', error);
  });

// Initialize footer functionality
function initializeFooter() {
  const accessibilityLinkContainer = document.getElementById("bspAccessibilityLinkContainer");
  switch (window.navigator.language) {
    case "fr":
      if (accessibilityLinkContainer != null) {
        const accessibilityText = "Accessibilité : partiellement conforme";
        const frenchAccessibilityAnchor = document.createElement("a");
        frenchAccessibilityAnchor.id = "bspFrenchAccessibleLink";
        frenchAccessibilityAnchor.target = "_blank";
        frenchAccessibilityAnchor.href = "https://go.microsoft.com/fwlink/?linkid=2163806";
        frenchAccessibilityAnchor.title = accessibilityText;
        frenchAccessibilityAnchor.innerText = accessibilityText;
        frenchAccessibilityAnchor.className = "bsp-footer-link";
        accessibilityLinkContainer.appendChild(frenchAccessibilityAnchor);
      }
      break;
    case "it":
      if (accessibilityLinkContainer != null) {
        const accessibilityText = "Accessibilità: parzialmente conforme";
        const italianAccessibilityAnchor = document.createElement("a");
        italianAccessibilityAnchor.id = "bspItalianAccessibleLink";
        italianAccessibilityAnchor.target = "_blank";
        italianAccessibilityAnchor.href = "https://go.microsoft.com/fwlink/?linkid=2208177";
        italianAccessibilityAnchor.title = accessibilityText;
        italianAccessibilityAnchor.innerText = accessibilityText;
        italianAccessibilityAnchor.className = "bsp-footer-link";
        accessibilityLinkContainer.appendChild(italianAccessibilityAnchor);
      }
      break;
    default:
      if (accessibilityLinkContainer) {
        accessibilityLinkContainer.remove();
      }
  }

  // Smooth animations on scroll (optional)
  function bspAnimateOnScroll() {
    var elements = document.querySelectorAll('.bsp-animate-on-scroll');
    elements.forEach(function(element) {
      if (bspIsElementInViewport(element)) {
        element.classList.add('visible');
      }
    });
  }

  function bspIsElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  window.addEventListener('scroll', function() {
    bspAnimateOnScroll();
  });
}
