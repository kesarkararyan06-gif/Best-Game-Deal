# CheapShot

A simple web app to find the cheapest prices for any PC game across multiple stores — built with plain HTML, CSS, and JavaScript.

---

## Features

- **Search any game** — type a game title and instantly see matching results
- **Game cards** — each result shows the game image, title, and its cheapest price across all stores
- **Hot deals on load** — the homepage loads today's top deals automatically so it's never empty
- **Game images** — uses Steam's CDN to show header images, with a fallback to the thumbnail if unavailable
- **Direct deal link** — each card has a button that takes you straight to the best deal on the store's website
- **Powered by CheapShark** — no API key required, completely free

---

## Tech Stack

- HTML
- CSS
- JavaScript (Fetch API)

---

## API Used

[CheapShark API](https://www.cheapshark.com/api) — a free API that tracks PC game deals across stores like Steam, GOG, Humble Bundle, and more.

### Endpoints

**Search games by title**
```
GET https://www.cheapshark.com/api/1.0/games?title={query}
```

**Get top deals for homepage**
```
GET https://www.cheapshark.com/api/1.0/deals?pageSize=12&sortBy=DealRating
```

**Redirect to best deal**
```
https://www.cheapshark.com/redirect?dealID={cheapestDealID}
```

---

## Project Structure

```
cheapShot/
├── index.html
├── style.css
└── script.js
```

---

## Credits

- Deals data by [CheapShark](https://www.cheapshark.com)
- Game images via [Steam CDN](https://store.steampowered.com)
