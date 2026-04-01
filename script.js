const results = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

// fetching the the hot deals on page load
async function fetchHotDeals() {
  try {
    const response = await fetch("https://www.cheapshark.com/api/1.0/deals?pageSize=12&sortBy=DealRating");
    const data = await response.json();
    displayCards(data);
  } catch (error) {
    results.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

// fetch games by search
async function fetchGames(title) {
  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${title}`);
    const data = await response.json();
    displayCards(data);
  } catch (error) {
    results.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

function displayCards(data) {
  if (data.length === 0) {
    results.innerHTML = "<p>No games found.</p>";
    return;
  }

  results.innerHTML = data.map(game => {
    const image = game.steamAppID
      ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg`
      : game.thumb;

    const title = game.external || game.title;
    const price = game.cheapest || game.salePrice;
    const dealID = game.cheapestDealID || game.dealID;

    return `
      <div class="card">
        <img src="${image}" alt="${title}" />
        <h3>${title}</h3>
        <p>$${price}</p>
        <a href="https://www.cheapshark.com/redirect?dealID=${dealID}" target="_blank">View Deal</a>
      </div>
    `;
  }).join("");
}

// search button
searchBtn.addEventListener("click", () => {
  const title = searchInput.value.trim();
  if (title === "") return;
  fetchGames(title);
});

// search on enter key
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const title = searchInput.value.trim();
    if (title === "") return;
    fetchGames(title);
  }
});

fetchHotDeals();