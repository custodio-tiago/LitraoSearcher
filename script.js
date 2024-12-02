// In-memory user database
const users = [
    { username: "admin", password: "admin" },
    { username: "user", password: "user" },
];

// Global state
let markers = JSON.parse(localStorage.getItem("markers")) || [];

// Handle login logic
if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const user = users.find(
            (user) => user.username === username && user.password === password
        );

        if (user) {
            localStorage.setItem("currentUser", username);
            window.location.href = "main.html";
        } else {
            document.getElementById("errorMessage").textContent =
                "Invalid username or password!";
        }
    });
}

// Main page logic
if (window.location.pathname.endsWith("main.html")) {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        window.location.href = "index.html";
    }

    // Welcome message
    document.getElementById("welcomeMessage").textContent = `Hello, ${currentUser}`;

    // Logout button
    document.getElementById("logoutButton").addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });

    // Initialize map
    const map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Load existing markers
    markers.forEach((marker) => {
        addMarkerToMap(marker, map, currentUser);
    });

    // Add marker on click
    map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        const popup = L.popup()
            .setLatLng([lat, lng])
            .setContent(`
                <div>
                    <label for="barName">Nome do Bar:</label>
                    <input type="text" id="barName"><br>
                    <label for="barDesc">Descrição:</label>
                    <input type="text" id="barDesc"><br>
                    <button id="saveMarker">OK</button>
                    <button id="cancelMarker">Cancelar</button>
                </div>
            `)
            .openOn(map);

        document.getElementById("saveMarker").addEventListener("click", () => {
            const name = document.getElementById("barName").value;
            const description = document.getElementById("barDesc").value;

            if (name && description) {
                const marker = {
                    name,
                    description,
                    user: currentUser,
                    coords: [lat, lng],
                };
                markers.push(marker);
                localStorage.setItem("markers", JSON.stringify(markers));
                addMarkerToMap(marker, map, currentUser);
                map.closePopup();
            }
        });

        document.getElementById("cancelMarker").addEventListener("click", () => {
            map.closePopup();
        });
    });

    // Add a marker to the map
    function addMarkerToMap(marker, map, currentUser) {
        const markerInstance = L.marker(marker.coords)
            .addTo(map)
            .bindPopup(() => {
                const removeButton = 
                    marker.user === currentUser
                        ? `<button id="removeMarker">Remover Marcação</button><br>`
                        : '';
                return `
                    <b>${marker.name}</b><br>
                    ${marker.description}<br>
                    <i>Inserido por: ${marker.user}</i><br>
                    ${removeButton}
                `;
            });

        markerInstance.on("popupopen", () => {
            if (marker.user === currentUser) {
                const removeBtn = document.getElementById("removeMarker");
                if (removeBtn) {
                    removeBtn.addEventListener("click", () => {
                        markers = markers.filter(
                            (m) => m.name !== marker.name || m.coords.toString() !== marker.coords.toString()
                        );
                        localStorage.setItem("markers", JSON.stringify(markers));
                        map.removeLayer(markerInstance);
                    });
                }
            }
        });
    }
}
