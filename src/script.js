function saveBooking(tripData) {
    const username = localStorage.getItem("loggedInUser");
    let allTrips = JSON.parse(localStorage.getItem("trips")) || {};
    if (!allTrips[username]) {
        allTrips[username] = [];
    }
    allTrips[username].push(tripData);
    localStorage.setItem("trips", JSON.stringify(allTrips));
}


document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.querySelectorAll("[data-carousel-button]");

    
buttons.forEach(button => {
    button.addEventListener("click", () => {
        moveSlide(button.dataset.carouselButton === "next" ? 1 : -1);
        resetAutoSlide();
    });
});

function updateUI() {
    const user = getLoggedInUser();
    console.log("Logged in user:", user);
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeMessage = document.getElementById("welcome-message");

    const loginRegisterLinks = document.getElementById("login-register-links");
    const accountDropdownLink = document.getElementById("account-dropdown-link");
    const accountDropdown = document.getElementById("account-dropdown");

    if (user) {
        // Auth UI
        if (welcomeMessage) welcomeMessage.innerHTML = `Welcome, ${user}!`;
        if (loginForm) loginForm.style.display = "none";
        if (signupForm) signupForm.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "block";

        // Nav UI
        if (loginRegisterLinks) loginRegisterLinks.style.display = "none";
        if (accountDropdownLink) accountDropdownLink.style.display = "block";
        if (accountDropdown) {
            accountDropdown.innerHTML = `
            <a href="/src/account.html">Account Settings</a>
            <a href="/src/trips.html">My Trips</a>
            <a href="#" id="dropdown-logout">Sign Out</a>
        `;
            setTimeout(() => {
                document.getElementById("dropdown-logout")?.addEventListener("click", function (e) {
                    e.preventDefault();
                    logoutUser();
                    location.reload();
                });
            }, 10);
        }

    } else {
        if (welcomeMessage) welcomeMessage.innerHTML = "";
        if (loginForm) loginForm.style.display = "block";
        if (signupForm) signupForm.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "none";

        if (loginRegisterLinks) loginRegisterLinks.style.display = "block";
        if (accountDropdownLink) accountDropdownLink.style.display = "none";
    }
}



document.querySelectorAll('.book-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const user = localStorage.getItem("loggedInUser");

        const card = e.target.closest(".trip-card");
        if (!card) return;
        const title = card.querySelector("h2").innerText;
        const description = card.querySelector(".description").innerText;
        const price = card.querySelector(".price")?.innerText || "";
        const duration = card.querySelector(".duration")?.innerText || "";

        if (user) {
            openBookingModal(title, description, price, duration);
        } else {
            showLoginPromptPopup();
        }
    });
});

function showLoginPromptPopup() {
    // Avoid duplicates
    if (document.querySelector('.login-prompt-popup')) return;

    // Store the previous page before navigating to account.html
    document.querySelectorAll('a[href="account.html"]').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.setItem("returnTo", window.location.pathname);
        });
    });

    const popup = document.createElement('div');
    popup.className = 'login-prompt-popup';
    popup.innerHTML = `
        <p>You need to be logged in to book a trip.</p>
        <a href="login.html">Login</a> or 
        <a href="register.html">Register</a>.
        <button class="close-popup">✕</button>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.remove();
    });
}

function moveSlide(offset) {
    const carousel = document.querySelector("[data-carousel]");
    if (!carousel) return; // <-- this prevents errors on pages without carousels

    const slides = carousel.querySelector("[data-slides]");
    const activeSlide = slides.querySelector("[data-active]");
    let newIndex = [...slides.children].indexOf(activeSlide) + offset;

    if (newIndex < 0) newIndex = slides.children.length - 1;
    if (newIndex >= slides.children.length) newIndex = 0;

    slides.children[newIndex].dataset.active = true;
    delete activeSlide.dataset.active;
}


if (document.querySelector("[data-carousel]")) {
    let autoSlideInterval = setInterval(() => {
        moveSlide(1);
    }, 10000);

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            moveSlide(1);
        }, 10000);
    }
}

    
    // -------------------------
    // AUTHENTICATION SECTION
    // -------------------------
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeMessage = document.getElementById("welcome-message");

    function saveUser(username, password) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.some(user => user.username === username)) {
            showCustomAlert("Username already exists.");
        } else {
            users.push({ username, password });
            localStorage.setItem("users", JSON.stringify(users));
        }
    }

    function authenticateUser(username, password) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        return users.some(user => user.username === username && user.password === password);
    }

    function setLoggedInUser(username) {
        localStorage.setItem("loggedInUser", username);
        updateUI();
    }

    function getLoggedInUser() {
        return localStorage.getItem("loggedInUser");
    }

    function logoutUser() {
        localStorage.removeItem("loggedInUser");
        updateUI();
    }

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const username = document.getElementById("signup-username").value;
            const password = document.getElementById("signup-password").value;
    
            let users = JSON.parse(localStorage.getItem("users")) || [];
            if (users.some(user => user.username === username)) {
                showCustomAlert("Username already exists.");
            } else {
                // Save the user
                users.push({ username, password });
                localStorage.setItem("users", JSON.stringify(users));
    
                // Auto-login
                setLoggedInUser(username);
    
                // Redirect
                const returnTo = localStorage.getItem("returnTo") || "../index.html";
                localStorage.removeItem("returnTo");
                window.location.href = returnTo;
            }
    
            signupForm.reset();
        });
    }
    

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;
            if (authenticateUser(username, password)) {
                setLoggedInUser(username);
            
                // Redirect back to previous page or index
                const returnTo = localStorage.getItem("returnTo") || "../index.html";
                localStorage.removeItem("returnTo"); // Clean up
                window.location.href = returnTo;
            } else {
                showCustomAlert("Invalid username or password.");
            }
            loginForm.reset();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }

    // Store previous page when clicking "Log In / Register" link
    document.querySelectorAll('a[href="account.html"]').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.setItem("returnTo", window.location.pathname);
        });
    });

    if (window.location.pathname.includes("trips.html")) {
        console.log("Running trips page script"); // <--- Add this
        const tripList = document.getElementById("trip-list");
        console.log("tripList:", tripList);
        const currentUser = localStorage.getItem("loggedInUser");
        const allTrips = JSON.parse(localStorage.getItem("trips")) || {};
        const userTrips = allTrips[currentUser] || [];
        console.log("userTrips:", userTrips);

        if (!tripList) return;

        if (userTrips.length === 0) {
            tripList.innerHTML = "<p>No trips booked yet. Start your next adventure on the Book page!</p>";
        } else {
            userTrips.forEach((trip, index) => {
                const card = document.createElement("div");
                card.className = "trip-card booked";
                card.style = "background:#f4f4f4; padding:1rem; margin-bottom:1rem; border-radius:10px; position:relative;";
                card.innerHTML = `
                    <button class="delete-trip" data-index="${index}" style="position:absolute; top:10px; right:10px; background:#ff4444; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">✕</button>
                    <h3>${trip.title}</h3>
                    <p><strong>Date:</strong> ${trip.date}</p>
                    <p><strong>Party Size:</strong> ${trip.partySize}</p>
                    <p><strong>Notes:</strong> ${trip.notes || "None"}</p>
                    <p><strong>Cost:</strong> ${trip.price}</p>
                    <p><strong>Duration:</strong> ${trip.duration}</p>
                    <p><em>${trip.description}</em></p>
                `;
                tripList.appendChild(card);
            });
            
            tripList.addEventListener("click", function (e) {
                if (e.target.classList.contains("delete-trip")) {
                    const index = parseInt(e.target.getAttribute("data-index"));
                    if (!isNaN(index)) {
                        const username = localStorage.getItem("loggedInUser");
                        let allTrips = JSON.parse(localStorage.getItem("trips")) || {};
                        if (allTrips[username]) {
                            allTrips[username].splice(index, 1);
                            localStorage.setItem("trips", JSON.stringify(allTrips));
                            location.reload(); // Quick refresh to update UI
                        }
                    }
                }
            });
        }
    }
    
        // Reveal .trip-card.available on scroll
    const revealCards = document.querySelectorAll('.trip-card.available');

    if (revealCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    observer.unobserve(entry.target); // optional: stop observing once revealed
                }
            });
        }, {
            threshold: 0.1
        });

        revealCards.forEach(card => observer.observe(card));
    }

    // Auto-open booking modal if ?trip=xyz is in the URL
const urlParams = new URLSearchParams(window.location.search);
const tripParam = urlParams.get('trip');

if (tripParam && window.location.pathname.includes("book.html")) {
    const tripMap = {
        artifact: {
            title: "A07: Unearth Wonders From Ages Unknown",
            description: "Discover relics of an impossible civilization using gravity-defying extraction tech and expert guides. Ancient mystery, modern luxury.",
            price: "$14,500",
            duration: "Duration: 6–9 days"
        },
        cthulu: {
            title: "G99: Uncharted Territory",
            description: "Explore a warped world of deep-sea deities, flickering dimensions, and impossible coastlines—now stabilized for public access.",
            price: "$19,000",
            duration: "Duration: 4–6 days"
        },
        dinosaurs: {
            title: "J63: Prehistoric Adventure",
            description: "Live among dinosaurs with expert protection teams. See towering beasts and feel the thrill of true prehistory—no fences, just awe.",
            price: "$11,200",
            duration: "Duration: 3–8 days"
        }
    };

    const tripData = tripMap[tripParam];
    const loggedInUser = getLoggedInUser();

    if (tripData) {
        if (loggedInUser) {
            openBookingModal(tripData.title, tripData.description, tripData.price, tripData.duration);
        } else {
            showLoginPromptPopup();
        }
    }
}


    // Call updateUI initially
    updateUI();
});

// lightbox for book.html

function openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const img = lightbox.querySelector("img");
    img.src = src;
    lightbox.style.display = "flex";
}

function closeLightbox(e) {
    if (e.target.id === "lightbox" || e.target.className === "close-lightbox") {
        document.getElementById("lightbox").style.display = "none";
    }
}

function populateAccountDropdown() {
    console.log("Populating account dropdown...");
}

function openBookingModal(title, description, price, duration) {
    const modal = document.getElementById("booking-modal");
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-description").innerText = description;
    document.getElementById("modal-price").innerText = price;
    document.getElementById("modal-duration").innerText = duration;
    modal.style.display = "flex";

    const form = document.getElementById("booking-form");
    form.onsubmit = function (e) {
        e.preventDefault();
        const date = document.getElementById("booking-date").value;
        const partySize = document.getElementById("party-size").value;
        const notes = document.getElementById("special-notes").value;
    
        const tripData = {
            title,
            description,
            price,
            duration,
            date,
            partySize,
            notes
        };
    
        saveBooking(tripData);
    
        showCustomAlert(`Trip successfully added to your My List.\nYour booking has been confirmed.`);
    
        form.reset();
        closeBookingModal();
    };
    
}

function closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    modal.style.display = "none";
}

function showCustomAlert(message) {
    const alertBox = document.getElementById("custom-alert");
    const messageBox = document.getElementById("custom-alert-message");
    messageBox.textContent = message;
    alertBox.style.display = "flex";
}

function closeCustomAlert() {
    document.getElementById("custom-alert").style.display = "none";
}


