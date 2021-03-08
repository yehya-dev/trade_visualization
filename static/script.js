
let graphScriptCodeString = `
new TradingView.widget(
  {
  "width": "100%",
  "height": "300",
  "symbol": "BINANCE:crypto_symbol",
  "interval": "${serverData.graphInt}",
  "timezone": "Asia/Kolkata",
  "theme": "dark",
  "style": "1",
  "locale": "in",
  "toolbar_bg": "#f1f3f6",
  "enable_publishing": false,
  "allow_symbol_change": true,
  "studies": [
      "MACD@tv-basicstudies",
      "RSI@tv-basicstudies"
  ],
  "container_id": "tradingview_crypto_symbol"
  }
  );
`

let signalScriptCodeString = `
{
  "interval": "${serverData.signalInt}",
  "width": "100%",
  "isTransparent": false,
  "height": "100%",
  "symbol": "BINANCE:crypto_symbol",
  "showIntervalTabs": true,
  "locale": "in",
  "colorTheme": "dark"
}
`
let container = document.getElementById('graphs');

let currentLoadedIndex = 0;
let coinsList = null;
let interval = null;
let title = document.querySelector('title');

function change_title() {
  title.innerHTML = `${currentLoadedIndex + 1} / ${coinsList.length}`;
}

function load_charts(coins) {
  if (interval != null) {
    clearInterval(interval);
  }
    container.innerHTML = '';
    let curIdx = 0;
    interval = setInterval(() => {
    let symbol = null; 
    if (serverData.listType === 'pump') {
      symbol = coins[curIdx] + 'BTC';
    }
    else if (serverData.listType === 'fav') {
      symbol = coins[curIdx];
    }
    
    let graphScript = document.createElement('script');
    graphScript.type = 'text/javascript';
    let graphScriptCode = document.createTextNode(graphScriptCodeString.replace(/crypto_symbol/g, symbol));
    graphScript.appendChild(graphScriptCode);
    let graphView = document.createElement('div');
    graphView.id = "tradingview_crypto_symbol".replace(/crypto_symbol/g, symbol);
    let graphContain = document.createElement('div');
    graphContain.className = 'tradingview-widget-container';
    graphContain.appendChild(graphView);
    graphContain.appendChild(graphScript);


    let signalScript = document.createElement('script');
    signalScript.type = 'text/javascript';
    signalScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    signalScript.async = true;
    let signalScriptCode = document.createTextNode(signalScriptCodeString.replace(/crypto_symbol/g, symbol));
    signalScript.appendChild(signalScriptCode);
    signalView = document.createElement('div');
    signalView.id = 'tradingview-widget-container__widget';
    signalContain = document.createElement('div');
    signalContain.className = 'tradingview-widget-container2';
    signalContain.appendChild(signalView);
    signalContain.appendChild(signalScript);

    let item = document.createElement('li');
    item.appendChild(graphContain);
    item.appendChild(signalContain);

    container.appendChild(item);
    curIdx += 1;
    if (curIdx === coins.length) {
      clearInterval(interval);
    }
  }, 2000);
}

let apiLink = null;
if (serverData.listType === 'fav') {
  apiLink = '/fav_coins'
} else if (serverData.listType === 'pump') {
  apiLink = '/pump_coins'
}

fetch(apiLink)
  .then(response => response.json())
  .then(data => {
    coinsList = data.coins;
    change_title();
    load_charts(coinsList[0]);
  })
  .catch(err => {
      console.log(err);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' && currentLoadedIndex != coinsList.length - 1) {
      currentLoadedIndex += 1;
      change_title();
      load_charts(coinsList[currentLoadedIndex]);
    } 
    else if (event.key === 'ArrowLeft' && currentLoadedIndex != 0) {
      currentLoadedIndex -= 1;
      change_title();
      load_charts(coinsList[currentLoadedIndex]);
    }
  })