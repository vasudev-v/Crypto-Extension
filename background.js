const CRYPTO_IDS = ['bitcoin', 'ethereum', 'dogecoin', 'cardano'];
const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_IDS.join(',')}&vs_currencies=usd&include_24hr_change=true`;

// Update the fetchAndStoreData function
async function fetchAndStoreData() {
    try {
      // Fetch crypto prices
      const priceResponse = await fetch(COINGECKO_URL);
      const priceData = await priceResponse.json();
  
      // Fetch news if API key exists
      const storage = await chrome.storage.local.get('cryptoPanicApiKey');
      let newsData = [];
      
      if (storage.cryptoPanicApiKey) {
        console.log('Fetching news with API key...');
        const newsResponse = await fetch(
          `https://cryptopanic.com/api/v1/posts/?auth_token=${storage.cryptoPanicApiKey}&kind=news&public=true`
        );
        
        if (!newsResponse.ok) {
          throw new Error(`News API error: ${newsResponse.status}`);
        }
        
        const newsJson = await newsResponse.json();
        
        if (newsJson.error) {
          throw new Error(`API Error: ${newsJson.error}`);
        }
        
        newsData = newsJson.results || [];
        console.log(`Fetched ${newsData.length} news items`);
      } else {
        console.log('No API key found');
      }
  
      // Store data
      await chrome.storage.local.set({
        cryptoPrices: priceData,
        cryptoNews: newsData,
        lastUpdated: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateData') {
    fetchAndStoreData();
  }
});

// Handle manual refresh requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'forceUpdate') {
    fetchAndStoreData();
  }
});