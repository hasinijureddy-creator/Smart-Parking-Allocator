// ============================================================
// SMART PARKING ALLOCATOR
// ADVANCED BOOKING SYSTEM - NEW VERSION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚗 Advanced Smart Parking Booking loaded");

    // ========================================================
    // SETTINGS
    // ========================================================

    const SLOTS_PER_ZONE = 72;

    const zoneDetails = {
        A: {
            name: "Zone A",
            description: "Main Entrance • General Parking",
            prefix: "A"
        },

        B: {
            name: "Zone B",
            description: "Shopping Area • Covered Parking",
            prefix: "B"
        },

        C: {
            name: "Zone C",
            description: "Premium Area • Priority Parking",
            prefix: "C"
        }
    };

    // ========================================================
    // VARIABLES
    // ========================================================

    let currentZone = "A";
    let selectedSlot = null;

    // ========================================================
    // ELEMENTS
    // ========================================================

    const slotGrid =
        document.getElementById("slotGrid");

    const zoneButtons =
        document.querySelectorAll(".zone-btn");

    const selectedSlotElement =
        document.getElementById("selectedSlot");

    const summarySlot =
        document.getElementById("summarySlot");

    const summaryZone =
        document.getElementById("summaryZone");

    const vehicleInput =
        document.getElementById("vehicleNumber");

    const durationInput =
        document.getElementById("duration");

    const summaryVehicle =
        document.getElementById("summaryVehicle");

    const summaryDuration =
        document.getElementById("summaryDuration");

    const bookButton =
        document.getElementById("bookButton");

    const availableCount =
        document.getElementById("availableCount");

    const bookedCount =
        document.getElementById("bookedCount");

    const occupiedCount =
        document.getElementById("occupiedCount");

    const currentTime =
        document.getElementById("currentTime");

    const overlay =
        document.getElementById("overlay");

    const bookingIdElement =
        document.getElementById("bookingId");

    const bookingTimeElement =
        document.getElementById("bookingTime");

    const doneButton =
        document.getElementById("doneButton");

    // ========================================================
    // PARKING DATA
    // ========================================================

    const parkingData = {};

    Object.keys(zoneDetails).forEach(zone => {

        parkingData[zone] = [];

        for (let i = 1; i <= SLOTS_PER_ZONE; i++) {

            const number =
                String(i).padStart(2, "0");

            const slotName =
                zoneDetails[zone].prefix + number;

            // Fixed pattern so every reload looks professional
            let status = "available";

            if (i % 11 === 0 || i % 17 === 0) {
                status = "occupied";
            }
            else if (i % 13 === 0 || i % 23 === 0) {
                status = "booked";
            }

            parkingData[zone].push({
                id: slotName,
                status: status
            });

        }

    });

    // ========================================================
    // ADD SEARCH BOX IF HTML DOESN'T HAVE ONE
    // ========================================================

    let searchInput =
        document.getElementById("slotSearch");

    if (!searchInput && slotGrid) {

        const searchWrapper =
            document.createElement("div");

        searchWrapper.className =
            "advanced-search";

        searchWrapper.style.cssText = `
            display:flex;
            gap:10px;
            margin-bottom:15px;
        `;

        searchInput =
            document.createElement("input");

        searchInput.id =
            "slotSearch";

        searchInput.type =
            "text";

        searchInput.placeholder =
            "🔎 Search slot e.g. A25";

        searchInput.style.cssText = `
            width:100%;
            padding:13px 15px;
            border-radius:12px;
            border:1px solid #263d56;
            background:#08121f;
            color:white;
            outline:none;
            font-size:12px;
        `;

        searchWrapper.appendChild(
            searchInput
        );

        slotGrid.parentElement.insertBefore(
            searchWrapper,
            slotGrid
        );

    }

    // ========================================================
    // RENDER ZONE
    // ========================================================

    function renderZone(zone) {

        if (!slotGrid) {
            console.error("slotGrid not found");
            return;
        }

        currentZone = zone;
        selectedSlot = null;

        slotGrid.innerHTML = "";

        const zoneData =
            zoneDetails[zone];

        // Update zone text if elements exist
        const zoneInfo =
            document.getElementById("zoneInfo");

        if (zoneInfo) {
            zoneInfo.textContent =
                zoneData.description;
        }

        const zoneLabel =
            document.getElementById("zoneLabel");

        if (zoneLabel) {
            zoneLabel.textContent =
                zoneData.name.toUpperCase();
        }

        const zoneDescription =
            document.getElementById("zoneDescription");

        if (zoneDescription) {
            zoneDescription.textContent =
                zoneData.description;
        }

        if (summaryZone) {
            summaryZone.textContent =
                zoneData.name;
        }

        if (selectedSlotElement) {
            selectedSlotElement.textContent = "—";
        }

        if (summarySlot) {
            summarySlot.textContent = "—";
        }

        // Render all slots
        parkingData[zone].forEach(
            (slotData, index) => {

                createSlot(
                    slotData,
                    index
                );

            }
        );

        updateCounters();
        updateBookButton();

        // Clear search
        if (searchInput) {
            searchInput.value = "";
        }

    }

    // ========================================================
    // CREATE SLOT
    // ========================================================

    function createSlot(slotData, index) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            `slot ${slotData.status}`;

        button.dataset.slot =
            slotData.id;

        button.dataset.status =
            slotData.status;

        // Small animation delay
        button.style.animationDelay =
            `${Math.min(index * 0.015, 0.5)}s`;

        const strong =
            document.createElement("strong");

        strong.textContent =
            slotData.id;

        const small =
            document.createElement("small");

        small.textContent =
            slotData.status.toUpperCase();

        button.appendChild(strong);
        button.appendChild(small);

        // Available slots are clickable
        if (slotData.status === "available") {

            button.addEventListener(
                "click",
                () => {

                    selectSlot(
                        slotData.id,
                        button
                    );

                }
            );

        }
        else {

            button.disabled = true;

        }

        slotGrid.appendChild(button);
    }

    // ========================================================
    // SELECT SLOT
    // ========================================================

    function selectSlot(
        slotName,
        button
    ) {

        const previous =
            slotGrid.querySelector(
                ".slot.selected"
            );

        if (previous) {
            previous.classList.remove(
                "selected"
            );
        }

        button.classList.add(
            "selected"
        );

        selectedSlot =
            slotName;

        if (selectedSlotElement) {
            selectedSlotElement.textContent =
                slotName;
        }

        if (summarySlot) {
            summarySlot.textContent =
                slotName;
        }

        updateBookButton();

        playSelectSound();

        // Scroll booking card into view on mobile
        const bookingCard =
            document.querySelector(
                ".booking-card"
            );

        if (
            bookingCard &&
            window.innerWidth < 900
        ) {

            bookingCard.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        }

    }

    // ========================================================
    // ZONE BUTTONS
    // ========================================================

    zoneButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const zone =
                    button.dataset.zone;

                if (!zoneDetails[zone]) {
                    return;
                }

                zoneButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                playZoneSound();

                renderZone(zone);

            }
        );

    });

    // ========================================================
    // VEHICLE NUMBER
    // ========================================================

    if (vehicleInput) {

        vehicleInput.addEventListener(
            "input",
            () => {

                const value =
                    vehicleInput.value
                        .toUpperCase()
                        .trim();

                vehicleInput.value =
                    value;

                if (summaryVehicle) {

                    summaryVehicle.textContent =
                        value || "—";

                }

                updateBookButton();

            }
        );

    }

    // ========================================================
    // DURATION
    // ========================================================

    if (durationInput) {

        if (summaryDuration) {

            summaryDuration.textContent =
                durationInput.options[
                    durationInput.selectedIndex
                ]?.text || "1 Hour";

        }

        durationInput.addEventListener(
            "change",
            () => {

                if (summaryDuration) {

                    summaryDuration.textContent =
                        durationInput.options[
                            durationInput.selectedIndex
                        ].text;

                }

            }
        );

    }

    // ========================================================
    // SEARCH
    // ========================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const query =
                    searchInput.value
                        .trim()
                        .toUpperCase();

                const slots =
                    slotGrid.querySelectorAll(
                        ".slot"
                    );

                slots.forEach(slot => {

                    const name =
                        slot.dataset.slot
                            .toUpperCase();

                    if (
                        !query ||
                        name.includes(query)
                    ) {

                        slot.style.display =
                            "flex";

                    }
                    else {

                        slot.style.display =
                            "none";

                    }

                });

            }
        );

    }

    // ========================================================
    // BOOKING
    // ========================================================

    if (bookButton) {

        bookButton.addEventListener(
            "click",
            () => {

                if (!selectedSlot) {

                    showMessage(
                        "Please select an available parking slot."
                    );

                    return;

                }

                const vehicle =
                    vehicleInput
                    ? vehicleInput.value.trim()
                    : "";

                if (vehicle.length < 4) {

                    showMessage(
                        "Please enter a valid vehicle number."
                    );

                    if (vehicleInput) {
                        vehicleInput.focus();
                    }

                    return;

                }

                const slotData =
                    parkingData[
                        currentZone
                    ].find(
                        item =>
                            item.id ===
                            selectedSlot
                    );

                if (!slotData) {
                    return;
                }

                // Change status
                slotData.status =
                    "booked";

                // Generate booking ID
                const id =
                    "SPA-" +
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    );

                const now =
                    new Date();

                // Update popup
                if (bookingIdElement) {

                    bookingIdElement.textContent =
                        "Booking ID: " + id;

                }

                if (bookingTimeElement) {

                    bookingTimeElement.textContent =
                        "Time: " +
                        now.toLocaleString();

                }

                // Show popup
                if (overlay) {

                    overlay.classList.add(
                        "show"
                    );

                }

                // Sound
                playBookingSound();

                // Re-render current zone
                renderZone(
                    currentZone
                );

                // Reset
                selectedSlot = null;

                if (selectedSlotElement) {
                    selectedSlotElement.textContent =
                        "—";
                }

                if (summarySlot) {
                    summarySlot.textContent =
                        "—";
                }

                if (vehicleInput) {
                    vehicleInput.value = "";
                }

                if (summaryVehicle) {
                    summaryVehicle.textContent =
                        "—";
                }

                updateBookButton();

                // Remember booking locally
                saveBooking({
                    bookingId: id,
                    slot: slotData.id,
                    zone: currentZone,
                    vehicle: vehicle,
                    duration:
                        durationInput
                        ? durationInput.value
                        : "1",
                    time:
                        now.toISOString()
                });

            }
        );

    }

    // ========================================================
    // BOOK BUTTON STATE
    // ========================================================

    function updateBookButton() {

        if (!bookButton) {
            return;
        }

        const vehicle =
            vehicleInput
            ? vehicleInput.value.trim()
            : "";

        if (
            selectedSlot &&
            vehicle.length >= 4
        ) {

            bookButton.disabled =
                false;

            bookButton.textContent =
                `CONFIRM ${selectedSlot} BOOKING`;

        }
        else if (selectedSlot) {

            bookButton.disabled =
                true;

            bookButton.textContent =
                "ENTER VEHICLE NUMBER";

        }
        else {

            bookButton.disabled =
                true;

            bookButton.textContent =
                "SELECT A SLOT";

        }

    }

    // ========================================================
    // COUNTERS
    // ========================================================

    function updateCounters() {

        let available = 0;
        let occupied = 0;
        let booked = 0;

        Object.values(
            parkingData
        ).forEach(zone => {

            zone.forEach(slot => {

                if (
                    slot.status ===
                    "available"
                ) {
                    available++;
                }

                if (
                    slot.status ===
                    "occupied"
                ) {
                    occupied++;
                }

                if (
                    slot.status ===
                    "booked"
                ) {
                    booked++;
                }

            });

        });

        if (availableCount) {
            availableCount.textContent =
                available;
        }

        if (occupiedCount) {
            occupiedCount.textContent =
                occupied;
        }

        if (bookedCount) {
            bookedCount.textContent =
                booked;
        }

    }

    // ========================================================
    // LIVE CLOCK
    // ========================================================

    function updateClock() {

        if (!currentTime) {
            return;
        }

        const now =
            new Date();

        currentTime.textContent =
            now.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

    }

    setInterval(
        updateClock,
        1000
    );

    updateClock();

    // ========================================================
    // CLOSE POPUP
    // ========================================================

    function closePopup() {

        if (overlay) {

            overlay.classList.remove(
                "show"
            );

        }

    }

    window.closePopup =
        closePopup;

    window.closeModal =
        closePopup;

    if (doneButton) {

        doneButton.addEventListener(
            "click",
            closePopup
        );

    }

    if (overlay) {

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    closePopup();

                }

            }
        );

    }

    // ========================================================
    // MESSAGE
    // ========================================================

    function showMessage(message) {

        // Use existing alert safely
        alert(message);

    }

    // ========================================================
    // LOCAL BOOKING STORAGE
    // ========================================================

    function saveBo