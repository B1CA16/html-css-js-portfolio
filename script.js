/* ========================================
   ~*~ RETRO 90s/2000s JAVASCRIPT ~*~
   Powered by JavaScript 1.2
   Now with Firebase! (very Y2K)
   ======================================== */

// ====== FIREBASE SETUP ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBMLGOGr21c0QETKrQPykN2EoNhlcWi0WM",
    authDomain: "francisco-portfolio-6c2bb.firebaseapp.com",
    projectId: "francisco-portfolio-6c2bb",
    storageBucket: "francisco-portfolio-6c2bb.firebasestorage.app",
    messagingSenderId: "656039667199",
    appId: "1:656039667199:web:38bfbc923fbab9659ef3ca",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====== SPLASH INTRO PAGE ======
(function initSplash() {
    const overlay = document.getElementById("splash-overlay");
    if (!overlay) return;

    // Splash starfield (smaller, separate canvas)
    const canvas = document.getElementById("splash-starfield");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.3,
                speed: Math.random() * 0.8 + 0.2,
            });
        }

        function drawSplashStars() {
            if (overlay.classList.contains("hidden")) return;
            ctx.fillStyle = "rgba(5, 5, 24, 0.4)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            stars.forEach((s) => {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
                ctx.fillRect(s.x, s.y, s.size, s.size);
                s.y += s.speed;
                if (s.y > canvas.height) {
                    s.y = 0;
                    s.x = Math.random() * canvas.width;
                }
            });
            requestAnimationFrame(drawSplashStars);
        }
        drawSplashStars();
    }

    // Fake loading bar
    const progress = document.getElementById("splash-progress");
    const enterBtn = document.getElementById("splash-enter");
    const skipText = document.querySelector(".splash-skip");
    let pct = 0;

    // Show skip immediately
    if (skipText) skipText.classList.add("visible");

    const loadInterval = setInterval(() => {
        pct += Math.random() * 8 + 2;
        if (pct >= 100) {
            pct = 100;
            clearInterval(loadInterval);
            // Show enter button
            if (enterBtn) enterBtn.classList.add("visible");
            const loadingDiv = document.querySelector(".splash-loading");
            if (loadingDiv) loadingDiv.style.display = "none";
        }
        if (progress) progress.style.width = pct + "%";
    }, 150);
})();

window.enterSite = function () {
    const overlay = document.getElementById("splash-overlay");
    if (overlay) {
        overlay.classList.add("hidden");
        document.body.style.overflow = "";
    }
};

// Prevent scrolling while splash is visible
document.body.style.overflow = "hidden";

// ====== HAMBURGER MENU TOGGLE ======
// Must be global for onclick handlers
window.toggleMenu = function () {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
};

// ====== STARFIELD BACKGROUND ======
(function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let stars = [];
    const STAR_COUNT = 200;
    const SPEED = 0.5;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * SPEED + 0.1,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.005,
            });
        }
    }

    function draw() {
        ctx.fillStyle = "rgba(10, 10, 46, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach((star) => {
            star.brightness += star.twinkleSpeed;
            if (star.brightness > 1 || star.brightness < 0.3) {
                star.twinkleSpeed *= -1;
            }

            const alpha = Math.max(0.3, Math.min(1, star.brightness));
            const colors = [
                `rgba(255, 255, 255, ${alpha})`,
                `rgba(100, 200, 255, ${alpha})`,
                `rgba(255, 200, 100, ${alpha})`,
                `rgba(200, 100, 255, ${alpha})`,
            ];
            ctx.fillStyle = colors[Math.floor(star.size * 2) % colors.length];

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * alpha, 0, Math.PI * 2);
            ctx.fill();

            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();

    window.addEventListener("resize", () => {
        resize();
        createStars();
    });
})();

// ====== VISITOR COUNTER (FIRESTORE) ======
(async function initCounter() {
    const counterRef = doc(db, "site", "counter");
    const padCount = (n) => String(n).padStart(8, "0");

    // Fallback display while loading
    const fallback = padCount(4572);
    updateCounterDisplay(fallback);

    try {
        // Check if counter doc exists, create if not
        const counterSnap = await getDoc(counterRef);
        if (!counterSnap.exists()) {
            await setDoc(counterRef, { count: 1 });
            updateCounterDisplay(padCount(1));
        } else {
            // Increment the counter atomically
            await updateDoc(counterRef, { count: increment(1) });
            const updated = await getDoc(counterRef);
            const count = updated.data().count;
            updateCounterDisplay(padCount(count));
        }
    } catch (err) {
        console.warn("Counter fallback to localStorage:", err);
        // Fallback to localStorage if Firestore fails
        let count = parseInt(localStorage.getItem("retroVisitCount") || "4571");
        count++;
        localStorage.setItem("retroVisitCount", count.toString());
        updateCounterDisplay(padCount(count));
    }
})();

function updateCounterDisplay(padded) {
    const mainCounter = document.getElementById("visitor-count");
    if (mainCounter) mainCounter.textContent = padded;

    document.querySelectorAll(".visitor-count-copy").forEach((el) => {
        el.textContent = padded;
    });

    const footerCounter = document.getElementById("counter-display");
    if (footerCounter) footerCounter.textContent = padded;
}

// ====== CURSOR TRAIL ======
(function initCursorTrail() {
    const colors = [
        "#ff00ff",
        "#00ffff",
        "#ffff00",
        "#00ff41",
        "#ff0000",
        "#0088ff",
    ];
    const trailDots = [];
    const MAX_DOTS = 15;

    document.addEventListener("mousemove", (e) => {
        const dot = document.createElement("div");
        dot.className = "trail-dot";
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
        dot.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];
        dot.style.boxShadow = `0 0 6px ${dot.style.backgroundColor}`;
        document.body.appendChild(dot);
        trailDots.push(dot);

        setTimeout(() => {
            dot.style.opacity = "0";
        }, 100);

        setTimeout(() => {
            dot.remove();
            const idx = trailDots.indexOf(dot);
            if (idx > -1) trailDots.splice(idx, 1);
        }, 600);

        while (trailDots.length > MAX_DOTS * 2) {
            const old = trailDots.shift();
            if (old && old.parentNode) old.remove();
        }
    });
})();

// ====== MIDI PLAYER (FAKE) ======
let midiPlaying = false;
const midiSongs = [
    "BMTH - Pray for Plagues",
    "BMTH - The Sadness Will Never End",
    "The Devil Wears Prada - Danger: Wildman",
    "The Devil Wears Prada - HTML Rulez D00d",
    "blessthefall - I'm Bad News, In The Best Way",
    "blessthefall - Hey Baby, Here's That Song You Wanted",
    "Parkway Drive - Carrion",
    "Parkway Drive - Smoke'Em If Ya Got'Em",
    "Greeley Estates - Let The Evil Go East",
    "Drop Dead, Gorgeous - Dressed For Friend Requests",
    "Alesana - The Thespian",
    "Underoath - Writing on the Walls",
    "Hopes Die Last - Call Me Sick Boy",
    "Saosin - Seven Years",
    "Adept - Shark! Shark! Shark!",
    "Yesterdays Rising - Time Holds The Truth",
    "EmmaNJ - Megacodine",
    "GunsLikeGirls - Hand Control",
];

window.toggleMidi = function () {
    const btn = document.getElementById("midi-toggle");
    const viz = document.getElementById("midi-viz");
    const songEl = document.getElementById("midi-song");

    midiPlaying = !midiPlaying;

    if (midiPlaying) {
        btn.innerHTML = "&#9724; Stop";
        viz.classList.add("playing");
    } else {
        btn.innerHTML = "&#9654; Play";
        viz.classList.remove("playing");
    }
};

// Auto-rotate song name every 8 seconds
setInterval(() => {
    const songEl = document.getElementById("midi-song");
    if (songEl) {
        songEl.textContent =
            midiSongs[Math.floor(Math.random() * midiSongs.length)];
    }
}, 8000);

// ====== GUESTBOOK (FIRESTORE) ======
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

window.signGuestbook = async function () {
    const nameEl = document.getElementById("guestbook-name");
    const msgEl = document.getElementById("guestbook-msg");

    const name = nameEl.value.trim();
    const msg = msgEl.value.trim();

    if (!name || !msg) {
        alert("Please fill in both your name and message!");
        return;
    }

    try {
        await addDoc(collection(db, "guestbook"), {
            name: name.substring(0, 50),
            msg: msg.substring(0, 200),
            createdAt: serverTimestamp(),
        });

        nameEl.value = "";
        msgEl.value = "";

        await renderGuestbook();
    } catch (err) {
        console.error("Guestbook error:", err);
        alert("Oops! Could not sign the guestbook. Try again later.");
    }
};

async function renderGuestbook() {
    const entriesEl = document.getElementById("guestbook-entries");
    if (!entriesEl) return;

    try {
        const q = query(
            collection(db, "guestbook"),
            orderBy("createdAt", "desc"),
            limit(20),
        );
        const snapshot = await getDocs(q);

        let html = "";
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const safeName = escapeHtml(data.name);
            const safeMsg = escapeHtml(data.msg);

            let dateStr = "";
            if (data.createdAt) {
                const d = data.createdAt.toDate();
                dateStr =
                    String(d.getMonth() + 1).padStart(2, "0") +
                    "/" +
                    String(d.getDate()).padStart(2, "0") +
                    "/" +
                    d.getFullYear();
            }

            html += `<div class="guestbook-entry">
                <strong>${safeName}:</strong> ${safeMsg}
                <span class="entry-date">${dateStr}</span>
            </div>`;
        });

        // Default entry always at the bottom
        html += `<div class="guestbook-entry">
            <strong>Webmaster:</strong> Welcome to my guestbook! Be the first to sign!
            <span class="entry-date">04/21/2026</span>
        </div>`;

        entriesEl.innerHTML = html;
    } catch (err) {
        console.warn("Guestbook load fallback:", err);
        // Keep default entry if Firestore fails
    }
}

// Load guestbook on page load
document.addEventListener("DOMContentLoaded", renderGuestbook);

// ====== DYNAMIC COPYRIGHT YEAR ======
(function initCopyrightYear() {
    const el = document.getElementById("copyright-year");
    if (el) el.textContent = new Date().getFullYear();
})();

// ====== TYPING CURSOR ON TITLE ======
(function initTypingCursor() {
    const title = document.querySelector(".glowing-title");
    if (!title) return;
    const cursor = document.createElement("span");
    cursor.textContent = "_";
    cursor.className = "blink";
    cursor.style.color = "inherit";
    title.appendChild(cursor);
})();

// ====== AIM STATUS ROTATION ======
(function initAimStatus() {
    const songs = [
        "BMTH - Pray for Plagues",
        "BMTH - The Sadness Will Never End",
        "The Devil Wears Prada - Danger: Wildman",
        "The Devil Wears Prada - HTML Rulez D00d",
        "blessthefall - I'm Bad News, In The Best Way",
        "blessthefall - Hey Baby, Here's That Song You Wanted",
        "Parkway Drive - Carrion",
        "Parkway Drive - Smoke'Em If Ya Got'Em",
        "Greeley Estates - Let The Evil Go East",
        "Drop Dead, Gorgeous - Dressed For Friend Requests",
        "Alesana - The Thespian",
        "Underoath - Writing on the Walls",
        "Hopes Die Last - Call Me Sick Boy",
        "Saosin - Seven Years",
        "Adept - Shark! Shark! Shark!",
        "Yesterdays Rising - Time Holds The Truth",
        "EmmaNJ - Megacodine",
        "GunsLikeGirls - Hand Control",
    ];
    const activities = [
        "Playing guitar",
        "Watching surf clips",
        "Gaming",
        "Shredding riffs",
        "Watching WSL highlights",
        "Learning a new song",
        "Grinding ranked",
        "Watching surf edits",
    ];

    const musicEl = document.getElementById("aim-music");
    const activityEl = document.getElementById("aim-activity");

    if (!musicEl || !activityEl) return;

    setInterval(() => {
        musicEl.textContent = songs[Math.floor(Math.random() * songs.length)];
        activityEl.textContent =
            activities[Math.floor(Math.random() * activities.length)];
    }, 8000);
})();
