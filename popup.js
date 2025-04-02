const CRYPTO_IDS = ['bitcoin', 'ethereum', 'dogecoin', 'cardano', 'solana', 'polkadot', 'chainlink', 'avalanche', 'matic-network', 'uniswap'];

// Handle API Key
async function getApiKey() {
  const result = await chrome.storage.local.get('cryptoPanicApiKey');
  return result.cryptoPanicApiKey;
}

function showApiKeyForm() {
  const container = document.getElementById('api-key-container');
  container.innerHTML = `
    <div id="api-key-form">
      <input type="text" id="api-key-input" placeholder="your-api-key" 
             style="width: 250px; padding: 5px;">
      <button id="save-api-key" style="padding: 5px 10px;">Save</button>
    </div>
  `;

  document.getElementById('save-api-key').addEventListener('click', async () => {
    const apiKey = document.getElementById('api-key-input').value.trim();
    if (apiKey) {
      await chrome.storage.local.set({ cryptoPanicApiKey: apiKey });
      container.innerHTML = '';
      fetchData();
    }
  });
}

// Update Display Functions
function updatePriceDisplay(data) {
  const cryptoList = document.getElementById('crypto-list');
  cryptoList.innerHTML = '<h2>Prices</h2>';

  Object.entries(data).forEach(([cryptoId, priceData]) => {
    const priceChange = priceData.usd_24h_change;
    const changeClass = priceChange >= 0 ? 'price-up' : 'price-down';
    
    cryptoList.innerHTML += `
      <div class="crypto-card">
        <h3>${cryptoId.toUpperCase()}</h3>
        <p>Price: $${priceData.usd.toLocaleString()}</p>
        <p class="${changeClass}">24h Change: ${priceChange.toFixed(2)}%</p>
      </div>
    `;
  });
}

function updateNewsDisplay(news) {
  const newsFeed = document.getElementById('news-feed');
  
  if (!news || news.length === 0) {
    newsFeed.innerHTML = `
      <h2>Latest News</h2>
      <div class="news-item">No news available. Please check your API key.</div>
    `;
    return;
  }

  newsFeed.innerHTML = '<h2>Latest News</h2>';
  news.slice(0, 5).forEach(item => {
    newsFeed.innerHTML += `
      <div class="news-item">
        <a href="${item.url}" target="_blank">${item.title}</a>
        <div class="news-meta">
          ${new Date(item.published_at).toLocaleString()}
        </div>
      </div>
    `;
  });
}

// Fetch Data
async function fetchData() {
  try {
    const storage = await chrome.storage.local.get(['cryptoPrices', 'cryptoNews']);
    if (storage.cryptoPrices) {
      updatePriceDisplay(storage.cryptoPrices);
    }
    if (storage.cryptoNews) {
      updateNewsDisplay(storage.cryptoNews);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    showApiKeyForm();
  }
  fetchData();

  // Refresh button handler
  document.getElementById('refresh').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'forceUpdate' });
    fetchData();
  });
});