let results = document.getElementById("results");
let searchBtn = document.getElementById("searchBtn");
let searchInput = document.getElementById("searchInput");

let allGames = [];
let storesData = [];

async function fetchStores() {
  try {
    let response = await fetch("https://www.cheapshark.com/api/1.0/stores");
    storesData = await response.json();
  } catch (error) {
    console.log("Could not fetch stores");
  }
}

async function fetchHotDeals() {
  try {
    let response = await fetch("https://www.cheapshark.com/api/1.0/deals?pageSize=24&sortBy=DealRating");
    let data = await response.json();

    let seen = new Set();
    allGames = data.filter(game => {
      if (seen.has(game.gameID)) return false;
      seen.add(game.gameID);
      return true;
    });

    displayCards(allGames);
  } catch (error) {
    results.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

async function fetchGames(title) {
  try {
    let response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${title}`);
    let data = await response.json();
    allGames = data;
    displayCards(allGames);
  } catch (error) {
    results.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

async function fetchGameDeals(gameID) {
  console.log("Fetching deals for gameID:", gameID);
  try {
    let response = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${gameID}`);
    let data = await response.json();
    console.log("Game deals data:", data);
    let game = data[gameID];
    if (!game) {
      console.log("No game found for ID:", gameID);
      return;
    }
    displayComparison(game);
  } catch (error) {
    console.log("Could not fetch game deals", error);
  }
}

function displayCards(data) {
  if (data.length === 0) {
    results.innerHTML = "<p>No games found.</p>";
    return;
  }

  let favorites = getFavorites();

  results.innerHTML = data.map(game => {
    let image = game.steamAppID
      ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg`
      : game.thumb;

    let title = game.external || game.title;
    let price = game.cheapest || game.salePrice;
    let dealID = game.cheapestDealID || game.dealID;
    let gameID = game.gameID;
    let isFav = favorites.includes(title);

    console.log("Card gameID:", gameID);

    return `
      <div class="card" onclick="fetchGameDeals('${gameID}')">
        <img src="${image}" alt="${title}" onerror="this.src='${game.thumb}'" />
        <h3>${title}</h3>
        <p class="price">$${parseFloat(price).toFixed(2)}</p>
        <div class="card-actions">
          <a href="https://www.cheapshark.com/redirect?dealID=${dealID}" 
             target="_blank" 
             onclick="event.stopPropagation()">View Deal</a>
          <button 
            class="fav-btn ${isFav ? 'fav-active' : ''}" 
            onclick="event.stopPropagation(); toggleFavorite('${title.replace(/'/g, "\\'")}', this)">
            ${isFav ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function displayComparison(game) {
  let comparisonSection = document.getElementById("comparison");

  let sortedDeals = [...game.deals].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  comparisonSection.innerHTML = `
    <h2>${game.info.title}</h2>
    <img 
      src="https://cdn.akamai.steamstatic.com/steam/apps/${game.info.steamAppID}/header.jpg"
      onerror="this.src='${game.info.thumb}'"
      alt="${game.info.title}" />
    <p>Cheapest ever: $${game.cheapestPriceEver.price}</p>
    <table>
      <thead>
        <tr>
          <th>Store</th>
          <th>Price</th>
          <th>Original</th>
          <th>Discount</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        ${sortedDeals.map(deal => {
          let store = storesData.find(s => s.storeID === deal.storeID);
          let storeName = store ? store.storeName : `Store ${deal.storeID}`;
          let savings = parseFloat(deal.savings).toFixed(0);

          return `
            <tr>
              <td>${storeName}</td>
              <td>$${parseFloat(deal.price).toFixed(2)}</td>
              <td><s>$${parseFloat(deal.retailPrice).toFixed(2)}</s></td>
              <td>-${savings}%</td>
              <td>
                <a href="https://www.cheapshark.com/redirect?dealID=${deal.dealID}" 
                   target="_blank">Buy</a>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    <button id="closeComparison">Close</button>
  `;

  comparisonSection.style.display = "block";

  document.getElementById("closeComparison").addEventListener("click", () => {
    comparisonSection.style.display = "none";
  });
}

function sortGames(games, method) {
  return [...games].sort((a, b) => {
    let priceA = parseFloat(a.cheapest || a.salePrice);
    let priceB = parseFloat(b.cheapest || b.salePrice);
    let titleA = (a.external || a.title || "").toLowerCase();
    let titleB = (b.external || b.title || "").toLowerCase();

    if (method === "price-asc")  return priceA - priceB;
    if (method === "price-desc") return priceB - priceA;
    if (method === "a-z")        return titleA.localeCompare(titleB);
    if (method === "z-a")        return titleB.localeCompare(titleA);
    return 0;
  });
}

function filterByPrice(games, max) {
  return games.filter(game => {
    let price = parseFloat(game.cheapest || game.salePrice);
    return price <= max;
  });
}

function applyAll() {
  let sortMethod = document.getElementById("sortSelect").value;
  let maxPrice   = parseFloat(document.getElementById("priceFilter").value);

  let filtered = filterByPrice(allGames, maxPrice);
  let sorted   = sortGames(filtered, sortMethod);
  displayCards(sorted);
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("cheapshot-favs") || "[]");
}

function toggleFavorite(title, btn) {
  let favs = getFavorites();
  let exists = favs.includes(title);

  favs = exists
    ? favs.filter(f => f !== title)
    : [...favs, title];

  localStorage.setItem("cheapshot-favs", JSON.stringify(favs));
  btn.textContent = exists ? "☆ Save" : "★ Saved";
  btn.classList.toggle("fav-active", !exists);
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  let btn = document.getElementById("themeBtn");
  btn.textContent = document.body.classList.contains("light-mode") ? "☀ Light" : "☾ Dark";
}

searchBtn.addEventListener("click", () => {
  let title = searchInput.value.trim();
  if (title === "") return;
  fetchGames(title);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    let title = searchInput.value.trim();
    if (title === "") return;
    fetchGames(title);
  }
});

document.getElementById("sortSelect").addEventListener("change", applyAll);

document.getElementById("priceFilter").addEventListener("input", () => {
  document.getElementById("priceValue").textContent = `$${document.getElementById("priceFilter").value}`;
  applyAll();
});

document.getElementById("themeBtn").addEventListener("click", toggleTheme);

fetchStores();
fetchHotDeals();
