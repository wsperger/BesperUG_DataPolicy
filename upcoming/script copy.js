
/* script.js */

// Global Variables
let ENVIRONMENT_VARIABLES = {}; // Will be loaded from env.json

// Function to load environment variables
function loadEnvironmentVariables() {
  return fetch('env.json')
    .then(response => response.json())
    .then(data => {
      ENVIRONMENT_VARIABLES = data;
    })
    .catch(error => {
      console.error('Error loading environment variables:', error);
    });
}

// Language Detection and Loading Translations (moved to header.js)
// Since language functions are in header.js, we don't include them here.

// Conversation Count Animation
function animateConversationCount() {
  const countElement = document.getElementById('conversation-count');
  if (!countElement) return; // Ensure the element exists

  const targetCount = ENVIRONMENT_VARIABLES.CONVERSATION_COUNT || 0; // Use value from env.json
  let currentCount = 0;

  function easeInOutExpo(t) {
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  }

  function animateCount(timestamp) {
    if (!animateCount.startTime) {
      animateCount.startTime = timestamp;
    }
    const elapsed = timestamp - animateCount.startTime;
    const duration = 5000; // 5 seconds
    const progress = Math.min(elapsed / duration, 1);
    currentCount = Math.round(easeInOutExpo(progress) * targetCount);
    countElement.textContent = currentCount.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(animateCount);
    }
  }

  setTimeout(() => requestAnimationFrame(animateCount), 1000);
}

// Advantages Section Interaction
function setupAdvantageClickEvents() {
  const advantageItems = document.querySelectorAll('.besper-advantage-item');
  advantageItems.forEach(item => {
    item.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      showAdvantage(index);
    });
  });
}

function showAdvantage(index) {
  const advantageContents = document.querySelectorAll('.advantage-content');
  const advantageItems = document.querySelectorAll('.besper-advantage-item');
  index = index.toString();

  advantageContents.forEach(content => {
    if (content.getAttribute('data-index') === index) {
      content.style.display = 'block';
    } else {
      content.style.display = 'none';
    }
  });
  advantageItems.forEach(item => {
    if (item.getAttribute('data-index') === index) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Wavy Background Effect
function initWavyBackground() {
  const canvas = document.getElementById('wavyCanvas');
  if (!canvas) return; // Ensure the canvas exists

  const ctx = canvas.getContext('2d');
  let width, height;
  const density = 0.92;
  const curvature = -0.15;
  const numLines = 30;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function drawCurvePattern() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(88, 151, 222, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numLines; i++) {
      const t = i / numLines;
      const startX = t * width;
      const startY = height;
      const curveX = width * Math.pow(1 - t, 2) * curvature;
      const curveY = height * (1 - Math.pow(t, 2)) * curvature;
      const endX = curveX;
      const endY = startY - (1 - t) * startY + curveY;
      if (i % Math.round(1 / density) === 0) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
  }

  function init() {
    resizeCanvas();
    drawCurvePattern();
  }

  window.addEventListener('resize', init);
  init();
}

// Initialize Page
document.addEventListener('DOMContentLoaded', function() {
  loadEnvironmentVariables().then(() => {
    animateConversationCount();
    setupAdvantageClickEvents();
    showAdvantage(0); // Show the first advantage by default
    initWavyBackground();
    initializeChatbotSection(); // Initialize chatbot and data table
  });
});

// Chatbot and Data Table Functions
function initializeChatbotSection() {
  // Insert iframe content from ENVIRONMENT_VARIABLES
  const iframeContainer = document.getElementById('bspIframeContainer');
  if (iframeContainer && ENVIRONMENT_VARIABLES.bsp_chatbot_iframe) {
    iframeContainer.innerHTML = ENVIRONMENT_VARIABLES.bsp_chatbot_iframe;
  }

  // Expose environment variables needed for getInformation()
  const testbotModule = {};
  testbotModule.apiEndpoint = ENVIRONMENT_VARIABLES.bsp_apim;
  testbotModule.initialEntityId = ENVIRONMENT_VARIABLES.initialEntityId;
  testbotModule.pollingEntityId = ENVIRONMENT_VARIABLES.pollingEntityId;
  testbotModule.pollingInterval = null;
  testbotModule.pollingTime = 0;
  testbotModule.maxPollingTime = 180; // 3 minutes
  testbotModule.firstDataReceived = false;

  // Implementation of getInformation()
  window.getInformation = function() {
    const userWebsiteUrl = document.getElementById('bspWebsiteUrl').value.trim();
    if (!userWebsiteUrl) {
      alert('Please enter a valid URL');
      return;
    }
    checkRobotsTxt(userWebsiteUrl)
      .then(isAllowed => {
        if (!isAllowed) {
          displayErrorMessage("The robots.txt of the website disallows scraping. Please modify it to allow scraping.");
          return;
        }
        document.getElementById('bspErrorMessage').style.display = 'none';
        document.getElementById('bspLoadingIndicator').style.display = 'block';
        console.log('%c[getInformation] Making initial API call with URL:', 'color: blue;', userWebsiteUrl);
        fetch(testbotModule.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entity: testbotModule.initialEntityId,
            content: userWebsiteUrl
          })
        })
          .then(response => {
            console.log('%c[getInformation] API response status:', 'color: blue;', response.status);
            if (response.status === 200) {
              return response.json().then(data => {
                const count = data.count || 'unknown';
                disableUpdateButton(5 * 60, count);
                setTimeout(() => {
                  document.getElementById('bspLoadingIndicator').style.display = 'none';
                  console.log('%c[getInformation] Loading indicator hidden after 10 seconds', 'color: blue;');
                }, 10000);
                startPolling(userWebsiteUrl);
              });
            } else if (response.status === 429) {
              document.getElementById('bspLoadingIndicator').style.display = 'none';
              displayErrorMessage("This URL has been used more than five times and is no longer usable in this public demo.");
            } else {
              throw new Error('Network response was not ok');
            }
          })
          .catch(error => {
            console.error('%c[getInformation] Error during API call:', 'color: red;', error);
            document.getElementById('bspLoadingIndicator').style.display = 'none';
            displayErrorMessage('An error occurred. Please try again.');
          });
        setTimeout(() => {
          if (document.getElementById('bspLoadingIndicator').style.display !== 'none') {
            document.getElementById('bspLoadingIndicator').style.display = 'none';
            console.log('%c[getInformation] Loading indicator hidden after 15 seconds', 'color: blue;');
          }
        }, 15000);
      })
      .catch(error => {
        console.error('Error checking robots.txt:', error);
        displayErrorMessage("An error occurred while checking robots.txt.");
      });
  };

  function checkRobotsTxt(url) {
    return new Promise((resolve, reject) => {
      let origin;
      try {
        const parsedUrl = new URL(url);
        origin = parsedUrl.origin;
      } catch (e) {
        reject('Invalid URL');
        return;
      }
      const robotsTxtUrl = origin + '/robots.txt';
      fetch(robotsTxtUrl)
        .then(response => {
          if (!response.ok) {
            resolve(true);
            return;
          }
          return response.text();
        })
        .then(text => {
          if (!text) {
            resolve(true);
            return;
          }
          const lines = text.split('\n');
          let userAgentAll = false;
          let isAllowed = true;
          for (let line of lines) {
            line = line.trim();
            if (line.toLowerCase().startsWith('user-agent:')) {
              const ua = line.substring(11).trim();
              userAgentAll = (ua === '*');
            } else if (userAgentAll && line.toLowerCase().startsWith('disallow:')) {
              const disallowPath = line.substring(9).trim();
              if (disallowPath === '/' || disallowPath === '/*') {
                isAllowed = false;
                break;
              }
            } else if (line === '') {
              userAgentAll = false;
            }
          }
          resolve(isAllowed);
        })
        .catch(error => {
          console.error('Error fetching robots.txt:', error);
          resolve(true);
        });
    });
  }

  function displayErrorMessage(message) {
    const errorDiv = document.getElementById('bspErrorMessage');
    errorDiv.innerHTML = `<p>${message}</p>`;
    errorDiv.style.display = 'block';
  }

  function disableUpdateButton(duration, count) {
    const updateButton = document.getElementById('bspUpdateButton');
    const timerMessage = document.getElementById('bspTimerMessage');
    updateButton.disabled = true;
    updateButton.style.backgroundColor = '#6c757d';
    timerMessage.style.display = 'block';
    let remainingTime = duration;
    timerMessage.innerHTML = `<p>This page has been demoed ${count} times, you can try again with this or another site in ${formatTime(remainingTime)}.</p>`;
    const timerInterval = setInterval(() => {
      remainingTime--;
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        updateButton.disabled = false;
        updateButton.style.backgroundColor = '#003057';
        timerMessage.style.display = 'none';
      } else {
        timerMessage.innerHTML = `<p>This page has been demoed ${count} times, you can try again with this or another site in ${formatTime(remainingTime)}.</p>`;
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs} minutes`;
  }

  function startPolling(userWebsiteUrl) {
    if (testbotModule.pollingInterval) {
      clearInterval(testbotModule.pollingInterval);
      console.log('%c[startPolling] Existing polling interval cleared', 'color: green;');
    }
    testbotModule.pollingTime = 0;
    testbotModule.firstDataReceived = false; // Reset the flag for new URL
    console.log('%c[startPolling] Polling started for URL:', 'color: green;', userWebsiteUrl);
    fetchPollingData(userWebsiteUrl);
    testbotModule.pollingInterval = setInterval(() => {
      testbotModule.pollingTime += 5;
      if (testbotModule.pollingTime >= testbotModule.maxPollingTime) {
        clearInterval(testbotModule.pollingInterval);
        console.log('%c[startPolling] Polling stopped after 3 minutes', 'color: green;');
        return;
      }
      fetchPollingData(userWebsiteUrl);
    }, 5000);
  }

  function fetchPollingData(userWebsiteUrl) {
    console.log('%c[fetchPollingData] Fetching data for URL:', 'color: orange;', userWebsiteUrl);
    // Show loading indicator in the table only until first data is received
    if (!testbotModule.firstDataReceived) {
      showTableLoadingIndicator();
    }
    fetch(testbotModule.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entity: testbotModule.pollingEntityId,
        content: userWebsiteUrl
      })
    })
      .then(response => {
        console.log('%c[fetchPollingData] Data fetch response status:', 'color: orange;', response.status);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('%c[fetchPollingData] Data received:', 'color: orange;', data);
        if (Array.isArray(data) && data.length > 0) {
          testbotModule.firstDataReceived = true;
        }
        updateTable(data);
      })
      .catch(error => {
        console.error('%c[fetchPollingData] Error during data fetch:', 'color: red;', error);
      });
  }

  function showTableLoadingIndicator() {
    const tableBody = document.querySelector('#bspDataTable tbody');
    tableBody.innerHTML = getTableLoadingIndicatorRow();
  }

  function getTableLoadingIndicatorRow() {
    return '<tr><td><div class="bsp-table-loading-indicator"><div class="bsp-spinner"></div></div></td></tr>';
  }

  function updateTable(data) {
    console.log('%c[updateTable] Updating table with data:', 'color: purple;', data);
    if (!Array.isArray(data)) {
      console.error('%c[updateTable] Unexpected data format received:', 'color: red;', data);
      return;
    }
    const tableBody = document.querySelector('#bspDataTable tbody');
    tableBody.innerHTML = '';
    if (data.length === 0) {
      if (!testbotModule.firstDataReceived) {
        // Keep the loading indicator until data is received
        showTableLoadingIndicator();
      } else {
        tableBody.innerHTML = '<tr><td>No data available.</td></tr>';
      }
    } else {
      data.forEach(item => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.href = item.bsp_source || '#';
        nameLink.target = '_blank';
        nameLink.textContent = item.bsp_name || 'N/A';
        nameCell.appendChild(nameLink);
        row.appendChild(nameCell);
        tableBody.appendChild(row);
      });
    }
    document.getElementById('bspDataTableContainer').style.display = 'block';
    console.log('%c[updateTable] Table updated with new data', 'color: orange;');
  }

  // Additional logging
  console.log('%c[initializeChatbotSection] Chatbot section initialized', 'color: blue;');
}