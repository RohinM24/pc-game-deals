// ==========================================
// PC GAME DEALS - GAME DATA
// ==========================================

const games = [
    {
        id: 1,
        title: "Hollow Knight",
        normalPrice: 14.99,
        salePrice: 7.49,
        store: "Steam",
        image: "Images/Hollow Knight.jpg"
    },
    {
        id: 2,
        title: "Stardew Valley",
        normalPrice: 13.99,
        salePrice: 13.99,
        store: "GOG",
        image: "Images/Stardew Valley.jpg"
    },
    {
        id: 3,
        title: "Celeste",
        normalPrice: 19.99,
        salePrice: 4.99,
        store: "Steam",
        image: "Images/Celeste.jpg"
    },
    {
        id: 4,
        title: "Hades",
        normalPrice: 24.99,
        salePrice: 12.49,
        store: "Epic Games",
        image: "Images/Hades.jpg"
    },
    {
        id: 5,
        title: "Portal 2",
        normalPrice: 9.99,
        salePrice: 0.99,
        store: "Steam",
        image: "Images/Portal 2.jpg"
    },
    {
        id: 6,
        title: "Terraria",
        normalPrice: 9.99,
        salePrice: 9.99,
        store: "GOG",
        image: "Images/Terraria.jpg"
    },
    {
        id: 7,
        title: "Disco Elysium",
        normalPrice: 39.99,
        salePrice: 9.99,
        store: "GOG",
        image: "Images/Disco Elysium.jpg"
    },
    {
        id: 8,
        title: "Cuphead",
        normalPrice: 19.99,
        salePrice: 14.99,
        store: "Steam",
        image: "Images/Cuphead.jpg"
    }
];


// ==========================================
// WISHLIST - FAVOURITES STORAGE
// ==========================================

function loadFavourites() {
    try {
        const savedFavourites =
            localStorage.getItem("pcGameFavourites");

        return savedFavourites
            ? new Set(JSON.parse(savedFavourites))
            : new Set();

    } catch (error) {
        console.error("Could not load favourites:", error);
        return new Set();
    }
}

let favourites = loadFavourites();


function saveFavourites() {
    try {
        localStorage.setItem(
            "pcGameFavourites",
            JSON.stringify([...favourites])
        );

    } catch (error) {
        console.error("Could not save favourites:", error);
    }
}


function isFavourite(game) {
    return favourites.has(game.id);
}


// Toggle a favourite without rebuilding the game list
function toggleFavourite(gameId, favouriteButton) {

    const wasFavourite = favourites.has(gameId);

    if (wasFavourite) {
        favourites.delete(gameId);
    } else {
        favourites.add(gameId);
    }

    saveFavourites();

    const isNowFavourite = favourites.has(gameId);

    // Update only the clicked heart
    if (favouriteButton) {

        favouriteButton.textContent =
            isNowFavourite ? "\u2665" : "\u2661";

        favouriteButton.classList.toggle(
            "active",
            isNowFavourite
        );

        favouriteButton.setAttribute(
            "aria-label",
            isNowFavourite
                ? "Remove from favourites"
                : "Add to favourites"
        );

        favouriteButton.setAttribute(
            "aria-pressed",
            String(isNowFavourite)
        );

        // Play the heart animation
        favouriteButton.classList.remove("heart-pop");

        // Restart the animation if the heart is clicked again
        void favouriteButton.offsetWidth;

        favouriteButton.classList.add("heart-pop");
    }

    // Update wishlist dashboard counter
    updateWishlistCount();

    // Remove the card if the favourites filter is active
    const favouritesFilter =
        document.getElementById("favourites-filter");

    if (wasFavourite && favouritesFilter &&
        favouritesFilter.checked) {

        const card = favouriteButton
            ? favouriteButton.closest(".game-card")
            : null;

        if (card) {
            card.remove();
        }

        // Get the games that remain visible
        const remainingCards =
            document.querySelectorAll(".game-card");

        const remainingIds = Array.from(remainingCards)
            .map(card => Number(card.dataset.gameId));

        const remainingGames = games.filter(function(game) {
            return remainingIds.includes(game.id);
        });

        // Update the dashboard without rebuilding the cards
        updateDashboardStats(remainingGames);

        // Display empty state if necessary
        if (remainingGames.length === 0) {
            displayGames([]);
        }
    }
}


// Update animated wishlist dashboard counter
function updateWishlistCount() {

    const wishlistCounters =
        document.querySelectorAll(".wishlist-count");

    wishlistCounters.forEach(function(counter) {
        animateNumber(counter, favourites.size);
    });
}


// ==========================================
// PART A - REQUIRED FUNCTIONS
// ==========================================


// Check whether a game is discounted
function isOnSale(game) {
    return game.salePrice < game.normalPrice;
}


// A1: Return only games on sale
function getGamesOnSale(games) {
    return games.filter(isOnSale);
}


// A2: Calculate discount percentage
function calculateDiscount(game) {

    if (!isOnSale(game)) {
        return 0;
    }

    const discount =
        ((game.normalPrice - game.salePrice) /
        game.normalPrice) * 100;

    return Math.round(discount);
}


// Get current price
function getCurrentPrice(game) {

    if (isOnSale(game)) {
        return game.salePrice;
    }

    return game.normalPrice;
}


// A3: Find the cheapest game
function getCheapestGame(games) {

    if (games.length === 0) {
        return null;
    }

    let cheapestGame = games[0];

    for (const game of games) {

        if (
            getCurrentPrice(game) <
            getCurrentPrice(cheapestGame)
        ) {
            cheapestGame = game;
        }
    }

    return cheapestGame;
}


// A4: Search game titles (case-insensitive)
function searchGames(games, searchWord) {

    const searchTerm = searchWord.trim().toLowerCase();

    // Show all games when the search box is empty
    if (searchTerm === "") {
        return games;
    }

    return games.filter(function(game) {
        return game.title.toLowerCase().includes(searchTerm);
    });
}


// ==========================================
// PART B - DISPLAY GAMES
// ==========================================

function displayGames(gameList = games) {

    const gameContainer =
        document.getElementById("game-list");

    if (!gameContainer) {
        console.error("Game list container not found!");
        return;
    }

    gameContainer.innerHTML = "";

    // Keep the card animation active when the game list changes

    for (const game of gameList) {

        const card = document.createElement("div");
        card.className = "game-card";

        // Save the game ID so the card can be updated later
        card.dataset.gameId = game.id;


        // Game cover image
        const coverImage = document.createElement("img");

        coverImage.className = "game-cover";
        coverImage.src = game.image;
        coverImage.alt = game.title + " game cover";
        coverImage.loading = "lazy";

        coverImage.onerror = function() {
            this.style.display = "none";
            console.error("Image not found:", game.image);
        };

        card.appendChild(coverImage);


        // Game card header
        const cardHeader = document.createElement("div");
        cardHeader.className = "game-card-header";

        const title = document.createElement("h3");
        title.textContent = game.title;


        // Favourite button
        const favouriteButton =
            document.createElement("button");

        favouriteButton.type = "button";
        favouriteButton.className = "favourite-button";

        const favourite = isFavourite(game);

        favouriteButton.textContent =
            favourite ? "\u2665" : "\u2661";

        favouriteButton.classList.toggle(
            "active",
            favourite
        );

        favouriteButton.setAttribute(
            "aria-label",
            favourite
                ? "Remove " + game.title + " from favourites"
                : "Add " + game.title + " to favourites"
        );

        favouriteButton.setAttribute(
            "aria-pressed",
            String(favourite)
        );

        // Update only this heart when it is clicked
        favouriteButton.addEventListener("click", function() {
            toggleFavourite(game.id, favouriteButton);
        });


        cardHeader.appendChild(title);
        cardHeader.appendChild(favouriteButton);

        card.appendChild(cardHeader);


        // Store information
        const store = document.createElement("p");

        store.className = "game-store";
        store.textContent = "Available on: " + game.store;


        // Current price
        const price = document.createElement("p");

        price.className = "game-price";

        price.textContent =
            "R" + getCurrentPrice(game).toFixed(2);


        card.appendChild(store);
        card.appendChild(price);


        // Sale information
        if (isOnSale(game)) {

            const normalPrice = document.createElement("p");

            normalPrice.className = "normal-price";

            normalPrice.textContent =
                "Normal price: R" + game.normalPrice.toFixed(2);


            const saleBadge = document.createElement("span");

            saleBadge.className = "sale-badge";
            saleBadge.textContent = "ON SALE";


            const discountBadge =
                document.createElement("span");

            discountBadge.className = "discount-badge";

            discountBadge.textContent =
                calculateDiscount(game) + "% OFF";


            card.appendChild(normalPrice);
            card.appendChild(saleBadge);
            card.appendChild(discountBadge);
        }


        gameContainer.appendChild(card);
    }


    // Empty state
    if (gameList.length === 0) {

        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        emptyState.innerHTML = `
            <div class="empty-state-icon">
                <span>⌕</span>
            </div>

            <h3>No games found</h3>

            <p>
                We couldn't find any games matching your
                search or filters.
            </p>

            <span class="empty-state-hint">
                Try adjusting your search criteria.
            </span>
        `;

        gameContainer.appendChild(emptyState);
    }
}


// ==========================================
// DASHBOARD NUMBER ANIMATIONS
// ==========================================

function animateNumber(element, targetValue, suffix = "") {

    if (!element) return;

    // Cancel the previous animation before starting a new one
    if (element.animationFrame) {
        cancelAnimationFrame(element.animationFrame);
    }

    const currentValue =
        Number(element.dataset.currentValue) || 0;

    // Save the new target value
    element.dataset.currentValue = targetValue;

    // Respect reduced-motion preferences
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        element.textContent = targetValue + suffix;
        return;
    }

    const duration = 500;
    const startTime = performance.now();

    element.classList.add("number-updating");

    function updateNumber(currentTime) {

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        // Ease out the animation near the end
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const currentNumber = Math.round(
            currentValue +
            (targetValue - currentValue) * easedProgress
        );

        element.textContent = currentNumber + suffix;

        if (progress < 1) {
            element.animationFrame =
                requestAnimationFrame(updateNumber);
        } else {
            element.textContent = targetValue + suffix;
            element.classList.remove("number-updating");
            element.animationFrame = null;
        }
    }

    element.animationFrame =
        requestAnimationFrame(updateNumber);
}


// ==========================================
// UPDATE DASHBOARD STATISTICS
// ==========================================

function updateDashboardStats(gameList) {

    const totalGamesElement =
        document.getElementById("total-games");

    const gamesOnSaleElement =
        document.getElementById("games-on-sale");

    const biggestDiscountElement =
        document.getElementById("biggest-discount");


    const totalGames = gameList.length;

    const saleGames = getGamesOnSale(gameList);

    const totalOnSale = saleGames.length;


    let biggestDiscount = 0;

    gameList.forEach(function(game) {

        const discount = calculateDiscount(game);

        if (discount > biggestDiscount) {
            biggestDiscount = discount;
        }
    });


    // Animate dashboard values
    animateNumber(totalGamesElement, totalGames);

    animateNumber(gamesOnSaleElement, totalOnSale);

    animateNumber(
        biggestDiscountElement,
        biggestDiscount,
        "%"
    );
}


// ==========================================
// SEARCH, FILTERING AND SORTING
// ==========================================

function filterAndDisplayGames() {

    const searchWord =
        document.getElementById("search-input").value;

    const selectedStore =
        document.getElementById("store-filter").value;

    const sortOption =
        document.getElementById("sort-filter").value;

    const onlyFavourites =
        document.getElementById("favourites-filter").checked;

    const onlyOnSale =
        document.getElementById("sale-filter").checked;


    // Search games
    let filteredGames = searchGames(games, searchWord);


    // On-sale filter
    if (onlyOnSale) {
        filteredGames = getGamesOnSale(filteredGames);
    }


    // Store filter
    if (selectedStore !== "all") {
        filteredGames = filteredGames.filter(function(game) {
            return game.store === selectedStore;
        });
    }


    // Favourites filter
    if (onlyFavourites) {
        filteredGames = filteredGames.filter(function(game) {
            return favourites.has(game.id);
        });
    }


    // Sorting
    if (sortOption === "price-low") {

        filteredGames.sort(function(a, b) {
            return getCurrentPrice(a) - getCurrentPrice(b);
        });

    } else if (sortOption === "price-high") {

        filteredGames.sort(function(a, b) {
            return getCurrentPrice(b) - getCurrentPrice(a);
        });

    } else if (sortOption === "discount") {

        filteredGames.sort(function(a, b) {
            return calculateDiscount(b) - calculateDiscount(a);
        });

    } else if (sortOption === "alphabetical") {

        filteredGames.sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });
    }


    // Add a smooth transition when the game list changes
    const gameContainer = document.getElementById("game-list");

    gameContainer.classList.add("grid-updating");

    setTimeout(function() {

        updateDashboardStats(filteredGames);
        updateWishlistCount();
        displayGames(filteredGames);

        gameContainer.classList.remove("grid-updating");

    }, 150);
}


// ==========================================
// CONNECT WEBSITE CONTROLS
// ==========================================

if (typeof document !== "undefined") {

    const searchInput =
        document.getElementById("search-input");

    const saleFilter =
        document.getElementById("sale-filter");

    const storeFilter =
        document.getElementById("store-filter");

    const sortFilter =
        document.getElementById("sort-filter");

    const favouritesFilter =
        document.getElementById("favourites-filter");


    // Search
    if (searchInput) {
        searchInput.addEventListener(
            "input",
            filterAndDisplayGames
        );
    }


    // On-sale filter
    if (saleFilter) {
        saleFilter.addEventListener(
            "change",
            filterAndDisplayGames
        );
    }


    // Store filter
    if (storeFilter) {
        storeFilter.addEventListener(
            "change",
            filterAndDisplayGames
        );
    }


    // Sorting
    if (sortFilter) {
        sortFilter.addEventListener(
            "change",
            filterAndDisplayGames
        );
    }


    // Favourites filter
    if (favouritesFilter) {
        favouritesFilter.addEventListener(
            "change",
            filterAndDisplayGames
        );
    }


    // Initial website display
    filterAndDisplayGames();


    // Start the card entrance animation
    requestAnimationFrame(function() {

        const gameContainer =
            document.getElementById("game-list");

        if (gameContainer) {
            gameContainer.classList.add("initial-load");
        }
    });


    // ==========================================
    // BRANDED LOADING SCREEN
    // ==========================================

    const loadingStartTime = Date.now();
    const minimumLoadingTime = 2500;

    function hideLoadingScreen() {

        const loadingScreen =
            document.getElementById("loading-screen");

        if (!loadingScreen) return;

        const elapsedTime = Date.now() - loadingStartTime;

        const remainingTime = Math.max(
            0,
            minimumLoadingTime - elapsedTime
        );

        setTimeout(function() {
            loadingScreen.classList.add("hidden");
        }, remainingTime);
    }

    // Wait for the page to finish loading
    if (document.readyState === "complete") {
        hideLoadingScreen();
    } else {
        window.addEventListener("load", hideLoadingScreen);
    }

}


//===========================================
// LIVE PC DEALS - CHEAPSHARK API
// ==========================================

// Live deals and store names from CheapShark
let liveDeals = [];
let liveStoreNames = {};

let liveCurrentPage = 1;
const LIVE_PAGE_SIZE = 12;

let liveFilteredDeals = [];

let liveApiPage = 0;
let liveHasMore = true;
let liveLoadingMore = false;


// ==========================================
// LIVE WISHLIST
// ==========================================

// Keep the live wishlist separate from the original games
function loadLiveFavourites() {
    try {
        const saved = localStorage.getItem("pcGameLiveFavourites");

        return saved
            ? new Set(JSON.parse(saved).map(String))
            : new Set();

    } catch (error) {
        console.error("Could not load live wishlist:", error);
        return new Set();
    }
}

let liveFavourites = loadLiveFavourites();


// Save live wishlist
function saveLiveFavourites() {
    try {
        localStorage.setItem(
            "pcGameLiveFavourites",
            JSON.stringify([...liveFavourites])
        );

    } catch (error) {
        console.error("Could not save live wishlist:", error);
    }
}


// Get unique deal ID
function getLiveDealId(deal) {
    return String(deal.dealID);
}


// Check whether a deal is in the wishlist
function isLiveFavourite(deal) {
    return liveFavourites.has(getLiveDealId(deal));
}


// Update live wishlist counter
function updateLiveWishlistCount() {

    const counters =
        document.querySelectorAll(".live-wishlist-count");

    // Count only favourites that are part of the loaded live deals
    const validWishlistCount =
        liveDeals.filter(isLiveFavourite).length;

    counters.forEach(function(counter) {
        animateNumber(counter, validWishlistCount);
    });
}


// ==========================================
// LIVE DASHBOARD
// ==========================================


function updateLiveDashboard(deals) {

    const total =
        document.getElementById("live-total-games");

    const onSale =
        document.getElementById("live-games-on-sale");

    const biggest =
        document.getElementById("live-biggest-discount");


    let saleCount = 0;
    let maxDiscount = 0;

    deals.forEach(function(deal) {

        const normalPrice = Number(deal.normalPrice);
        const salePrice = Number(deal.salePrice);

        if (normalPrice > salePrice) {
            saleCount++;
        }

        if (normalPrice > 0 && salePrice >= 0) {

            const discount = Math.round(
                ((normalPrice - salePrice) / normalPrice) * 100
            );

            maxDiscount = Math.max(
                maxDiscount,
                discount
            );
        }
    });


    animateNumber(total, deals.length);

    animateNumber(onSale, saleCount);

    animateNumber(biggest, maxDiscount, "%");


    updateLiveWishlistCount();
}



// ==========================================
// TOGGLE LIVE WISHLIST
// ==========================================

function toggleLiveFavourite(deal, button) {

    const dealId = getLiveDealId(deal);

    if (liveFavourites.has(dealId)) {
        liveFavourites.delete(dealId);
    } else {
        liveFavourites.add(dealId);
    }

    saveLiveFavourites();

    const favourite = liveFavourites.has(dealId);

    if (button) {

        button.textContent = favourite ? "\u2665" : "\u2661";

        button.classList.toggle("active", favourite);

        button.setAttribute(
            "aria-label",
            favourite
                ? "Remove " + deal.title + " from wishlist"
                : "Add " + deal.title + " to wishlist"
        );

        button.setAttribute(
            "aria-pressed",
            String(favourite)
        );

        // Heart animation
        button.classList.remove("heart-pop");

        void button.offsetWidth;

        button.classList.add("heart-pop");
    }

    updateLiveWishlistCount();

    // Refresh cards if wishlist-only filter is active
    const favouritesFilter =
        document.getElementById("live-favourites-filter");

    if (favouritesFilter && favouritesFilter.checked) {
        filterAndDisplayLiveDeals();
    }
}


// ==========================================
// DISPLAY LIVE DEAL CARDS
// ==========================================

function displayLiveDeals(deals) {

    const container =
        document.getElementById("live-deals-list");

    if (!container) return;

    container.innerHTML = "";

    deals.forEach(function(deal) {

        const card = document.createElement("article");

        card.className = "game-card live-deal-card";

        card.dataset.dealId = getLiveDealId(deal);


        // Game thumbnail
        const image = document.createElement("img");

        image.className = "game-cover";

        image.src = deal.thumb;

        image.alt = deal.title + " game thumbnail";

        image.loading = "lazy";

        image.onerror = function() {
            this.style.display = "none";
        };

        card.appendChild(image);


        // Game information
        const information = document.createElement("div");

        information.className = "live-deal-info";


        // Card header
        const cardHeader = document.createElement("div");

        cardHeader.className = "game-card-header";


        // Game title
        const title = document.createElement("h3");

        title.textContent = deal.title;


        // Wishlist heart
        const favouriteButton =
            document.createElement("button");

        favouriteButton.type = "button";

        favouriteButton.className = "favourite-button";

        const favourite = isLiveFavourite(deal);

        favouriteButton.textContent =
            favourite ? "\u2665" : "\u2661";

        favouriteButton.classList.toggle(
            "active",
            favourite
        );

        favouriteButton.setAttribute(
            "aria-label",
            favourite
                ? "Remove " + deal.title + " from wishlist"
                : "Add " + deal.title + " to wishlist"
        );

        favouriteButton.setAttribute(
            "aria-pressed",
            String(favourite)
        );

        favouriteButton.addEventListener("click", function() {
            toggleLiveFavourite(deal, favouriteButton);
        });

        cardHeader.appendChild(title);

        cardHeader.appendChild(favouriteButton);

        information.appendChild(cardHeader);


        // Store name
        const store = document.createElement("p");

        store.className = "live-deal-store";

        store.textContent =
            liveStoreNames[String(deal.storeID)] || "Online Store";

        information.appendChild(store);


        // Prices
        const normalPrice = Number(deal.normalPrice);

        const salePrice = Number(deal.salePrice);


        // Calculate discount from the prices
        const discount = Math.round(
            ((normalPrice - salePrice) / normalPrice) * 100
        );


        const prices = document.createElement("div");

        prices.className = "live-deal-prices";


        // Original price
        const oldPrice = document.createElement("span");

        oldPrice.className = "live-deal-old-price";

        oldPrice.textContent =
            "$" + normalPrice.toFixed(2);


        // Sale price
        const newPrice = document.createElement("span");

        newPrice.className = "live-deal-new-price";

        newPrice.textContent =
            "$" + salePrice.toFixed(2);


        // Discount badge
        const discountBadge = document.createElement("span");

        discountBadge.className = "live-deal-discount";

        discountBadge.textContent =
            discount + "% OFF";


        prices.appendChild(oldPrice);

        prices.appendChild(newPrice);

        prices.appendChild(discountBadge);

        information.appendChild(prices);


        // View deal link
        const dealLink = document.createElement("a");

        dealLink.className = "live-deal-link";

        dealLink.href =
            "https://www.cheapshark.com/redirect?dealID=" +
            deal.dealID;

        dealLink.target = "_blank";

        dealLink.rel = "noopener noreferrer";

        dealLink.textContent = "View Deal";

        information.appendChild(dealLink);


        card.appendChild(information);

        container.appendChild(card);
    });


    // Empty state
    if (deals.length === 0) {

        const emptyState = document.createElement("div");

        emptyState.className = "empty-state";

        emptyState.innerHTML = `
            <div class="empty-state-icon">
                <span>⌕</span>
            </div>

            <h3>No live deals found</h3>

            <p>
                We couldn't find any deals matching your
                search or filters.
            </p>

            <span class="empty-state-hint">
                Try adjusting your search criteria.
            </span>
        `;

        container.appendChild(emptyState);
    }
}


// ==========================================
// SEARCH, FILTER AND SORT LIVE DEALS
// ==========================================


function filterAndDisplayLiveDeals(resetPage = true) {

    const searchInput =
        document.getElementById("live-search-input");

    const storeFilter =
        document.getElementById("live-store-filter");

    const sortFilter =
        document.getElementById("live-sort-filter");

    const favouritesFilter =
        document.getElementById("live-favourites-filter");

    const saleFilter =
        document.getElementById("live-sale-filter");


    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStore = storeFilter
        ? storeFilter.value
        : "all";

    const sortOption = sortFilter
        ? sortFilter.value
        : "default";

    const onlyFavourites =
        favouritesFilter && favouritesFilter.checked;

    const onlyOnSale =
        saleFilter && saleFilter.checked;


    // Search by title
    let filteredDeals = liveDeals.filter(function(deal) {
        return deal.title.toLowerCase().includes(searchTerm);
    });


    // Show discounted deals only when the checkbox is checked
    if (onlyOnSale) {

        filteredDeals = filteredDeals.filter(function(deal) {
            return Number(deal.salePrice) <
                Number(deal.normalPrice);
        });
    }


    // Store filter
    if (selectedStore !== "all") {

        filteredDeals = filteredDeals.filter(function(deal) {
            return String(deal.storeID) === selectedStore;
        });
    }


    // Wishlist filter
    if (onlyFavourites) {
        filteredDeals = filteredDeals.filter(isLiveFavourite);
    }


    // Sorting
    if (sortOption === "price-low") {

        filteredDeals.sort(function(a, b) {
            return Number(a.salePrice) - Number(b.salePrice);
        });

    } else if (sortOption === "price-high") {

        filteredDeals.sort(function(a, b) {
            return Number(b.salePrice) - Number(a.salePrice);
        });

    } else if (sortOption === "discount") {

        filteredDeals.sort(function(a, b) {

            const discountA =
                ((Number(a.normalPrice) - Number(a.salePrice)) /
                Number(a.normalPrice)) * 100;

            const discountB =
                ((Number(b.normalPrice) - Number(b.salePrice)) /
                Number(b.normalPrice)) * 100;

            return discountB - discountA;
        });

    } else if (sortOption === "alphabetical") {

        filteredDeals.sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });
    }


    // Save filtered results
    liveFilteredDeals = filteredDeals;


    // Reset to page 1 when filters change
    if (resetPage) {
        liveCurrentPage = 1;
    }


    // Render current page
    renderLiveDealsPage();
}


function renderLiveDealsPage() {

    const totalDeals = liveFilteredDeals.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalDeals / LIVE_PAGE_SIZE)
    );

    // Keep current page within valid range
    liveCurrentPage = Math.min(
        Math.max(liveCurrentPage, 1),
        totalPages
    );


    const startIndex =
        (liveCurrentPage - 1) * LIVE_PAGE_SIZE;

    const endIndex = Math.min(
        startIndex + LIVE_PAGE_SIZE,
        totalDeals
    );


    // Only display the deals for this page
    const pageDeals = liveFilteredDeals.slice(
        startIndex,
        endIndex
    );


    // Add the same entrance animation class used by the original grid
    const container =
        document.getElementById("live-deals-list");

    if (container) {
        container.classList.add("initial-load");
    }


    displayLiveDeals(pageDeals);


    // Dashboard counts use all matching deals, not only this page
    updateLiveDashboard(liveFilteredDeals);


    // Page number text
    const pageInfo =
        document.getElementById("live-page-info");

    if (pageInfo) {
        pageInfo.textContent =
            "Page " + liveCurrentPage + " of " + totalPages;
    }


    // Previous and Next buttons
    const previousButton =
        document.getElementById("live-previous-page");

    const nextButton =
        document.getElementById("live-next-page");

    if (previousButton) {
        previousButton.disabled = liveCurrentPage === 1;
    }

    if (nextButton) {
        nextButton.disabled = liveCurrentPage === totalPages;
    }


    // Hide pagination if there is only one page
    const pagination =
        document.getElementById("live-pagination");

    if (pagination) {
        pagination.style.display =
            totalDeals > LIVE_PAGE_SIZE ? "flex" : "none";
    }


    // Update result message
    const status =
        document.getElementById("live-deals-status");

    if (status) {

        if (totalDeals === 0) {
            status.textContent = "Showing 0 matching deals.";
        } else {
            status.textContent =
                "Showing " + (startIndex + 1) +
                " to " + endIndex +
                " of " + totalDeals +
                " matching deals. " +
                liveDeals.length +
                " deals loaded from CheapShark.";
        }
    }


    // Load more button
    const loadMoreButton =
        document.getElementById("live-load-more");

    if (loadMoreButton) {

        loadMoreButton.disabled =
            liveLoadingMore || !liveHasMore;

        loadMoreButton.textContent =
            liveLoadingMore
                ? "Loading More Deals..."
                : liveHasMore
                    ? "Load More Deals"
                    : "No More Deals";

        loadMoreButton.style.display =
            liveHasMore || liveLoadingMore
                ? "inline-block"
                : "none";
    }
}



// ==========================================
// POPULATE STORE FILTER
// ==========================================


function populateLiveStoreFilter() {

    const storeFilter =
        document.getElementById("live-store-filter");

    if (!storeFilter) return;

    // Keep the currently selected store
    const currentSelection = storeFilter.value || "all";

    // Get only stores represented in the loaded deals
    const availableStores = {};

    liveDeals.forEach(function(deal) {

        const storeId = String(deal.storeID);

        availableStores[storeId] =
            liveStoreNames[storeId] || "Online Store";
    });


    // Rebuild the dropdown
    storeFilter.innerHTML =
        '<option value="all">All Stores</option>';


    // Add only stores with loaded deals
    Object.keys(availableStores)
        .sort(function(a, b) {
            return availableStores[a].localeCompare(
                availableStores[b]
            );
        })
        .forEach(function(storeId) {

            const option = document.createElement("option");

            option.value = storeId;

            option.textContent = availableStores[storeId];

            storeFilter.appendChild(option);
        });


    // Restore selection if the store still exists
    if (
        Array.from(storeFilter.options).some(function(option) {
            return option.value === currentSelection;
        })
    ) {
        storeFilter.value = currentSelection;
    } else {
        storeFilter.value = "all";
    }
}



// ==========================================
// CONNECT LIVE DEAL CONTROLS
// ==========================================


function connectLiveDealControls() {

    const controls = [
        "live-search-input",
        "live-store-filter",
        "live-sort-filter",
        "live-favourites-filter",
        "live-sale-filter"
    ];

    controls.forEach(function(id) {

        const control = document.getElementById(id);

        if (!control) return;

        control.addEventListener(
            id === "live-search-input" ? "input" : "change",
            function() {
                filterAndDisplayLiveDeals(true);
            }
        );
    });


    // Previous page
    const previousButton =
        document.getElementById("live-previous-page");

    if (previousButton) {

        previousButton.addEventListener("click", function() {

            if (liveCurrentPage > 1) {
                liveCurrentPage--;
                renderLiveDealsPage();
            }
        });
    }


    // Next page
    const nextButton =
        document.getElementById("live-next-page");

    if (nextButton) {

        nextButton.addEventListener("click", function() {

            const totalPages = Math.max(
                1,
                Math.ceil(
                    liveFilteredDeals.length / LIVE_PAGE_SIZE
                )
            );

            if (liveCurrentPage < totalPages) {
                liveCurrentPage++;
                renderLiveDealsPage();
            }
        });
    }


    // Load another page from CheapShark
    const loadMoreButton =
        document.getElementById("live-load-more");

    if (loadMoreButton) {
        loadMoreButton.addEventListener(
            "click",
            loadMoreLiveDeals
        );
    }
}



// ==========================================
// LOAD LIVE DEALS FROM CHEAPSHARK
// ==========================================


async function loadLiveDeals() {

    const statusMessage =
        document.getElementById("live-deals-status");

    if (!statusMessage) return;

    try {

        statusMessage.textContent =
            "Loading current deals...";


        // Load the first batch of deals from CheapShark
        const dealsResponse = await fetch(
            "https://www.cheapshark.com/api/1.0/deals?pageSize=60&pageNumber=0&sortBy=DealRating&desc=1"
        );

        if (!dealsResponse.ok) {
            throw new Error(
                "Could not load CheapShark deals."
            );
        }

        const apiDeals = await dealsResponse.json();


        // Keep valid deals, including full-price listings
        liveDeals = apiDeals.filter(function(deal) {

            const normalPrice = Number(deal.normalPrice);
            const salePrice = Number(deal.salePrice);

            return (
                deal.dealID &&
                deal.title &&
                Number.isFinite(normalPrice) &&
                Number.isFinite(salePrice) &&
                normalPrice > 0 &&
                salePrice >= 0
            );
        });


        // First API page is page number 0
        liveApiPage = 0;

        liveHasMore = apiDeals.length === 60;


        // Get store names
        const storesResponse = await fetch(
            "https://www.cheapshark.com/api/1.0/stores"
        );

        if (!storesResponse.ok) {
            throw new Error(
                "Could not load store information."
            );
        }

        const stores = await storesResponse.json();


        liveStoreNames = {};

        stores.forEach(function(store) {

            liveStoreNames[String(store.storeID)] =
                store.storeName;
        });


        // Show only stores represented in the loaded deals
        populateLiveStoreFilter();


        // Connect all live controls
        connectLiveDealControls();


        // Display the first page
        filterAndDisplayLiveDeals(true);


    } catch (error) {

        statusMessage.textContent =
            "Live deals could not be loaded. Please try again later.";

        console.error(
            "CheapShark API error:",
            error
        );
    }
}


// ==========================================
// LOAD MORE LIVE DEALS FROM CHEAPSHARK
// ==========================================

async function loadMoreLiveDeals() {

    if (liveLoadingMore || !liveHasMore) {
        return;
    }

    liveLoadingMore = true;

    renderLiveDealsPage();


    try {

        const nextApiPage = liveApiPage + 1;

        const response = await fetch(
            "https://www.cheapshark.com/api/1.0/deals?pageSize=60&pageNumber=" +
            nextApiPage +
            "&sortBy=DealRating&desc=1"
        );

        if (!response.ok) {
            throw new Error(
                "Could not load more CheapShark deals."
            );
        }

        const apiDeals = await response.json();


        // No more results
        if (!Array.isArray(apiDeals) || apiDeals.length === 0) {

            liveHasMore = false;

            return;
        }


        // Keep track of existing deal IDs to avoid duplicates
        const existingIds = new Set(
            liveDeals.map(function(deal) {
                return String(deal.dealID);
            })
        );


        // Add only new, valid deal listings
        apiDeals.forEach(function(deal) {

            const normalPrice = Number(deal.normalPrice);
            const salePrice = Number(deal.salePrice);

            const validDeal =
                deal.dealID &&
                deal.title &&
                Number.isFinite(normalPrice) &&
                Number.isFinite(salePrice) &&
                normalPrice > 0 &&
                salePrice >= 0;

            const dealId = String(deal.dealID);

            if (validDeal && !existingIds.has(dealId)) {

                liveDeals.push(deal);

                existingIds.add(dealId);
            }
        });


        liveApiPage = nextApiPage;

        liveHasMore = apiDeals.length === 60;


        // Refresh store options using the newly loaded deals
        populateLiveStoreFilter();


        // Reapply filters without resetting the current page
        filterAndDisplayLiveDeals(false);


    } catch (error) {

        console.error(
            "Could not load more CheapShark deals:",
            error
        );

        const status =
            document.getElementById("live-deals-status");

        if (status) {
            status.textContent =
                "Could not load more deals. Please try again.";
        }

    } finally {

        liveLoadingMore = false;

        renderLiveDealsPage();
    }
}


// Load live deals when the script runs
loadLiveDeals();





