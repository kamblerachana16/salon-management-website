
/*
    main.js
    ---------------------------------------------------
    Shared JavaScript for the customer-facing salon website.
    Handles mobile navigation and booking popup.
*/

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // MOBILE NAVIGATION
    // =========================================

    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    if (navToggle && navLinks) {

        navToggle.addEventListener("click", function () {

            const isOpen =
                navLinks.classList.toggle("nav-open");

            navToggle.classList.toggle(
                "nav-toggle-open",
                isOpen
            );

            navToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });

        navLinks.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navLinks.classList.remove("nav-open");

                navToggle.classList.remove(
                    "nav-toggle-open"
                );

                navToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    // =========================================
    // CREATE BOOKING POPUP
    // =========================================

    if (!document.getElementById("booking-popup")) {

        const popup = document.createElement("div");

        popup.id = "booking-popup";

        popup.innerHTML = `

            <div class="booking-popup-content">

                <button
                    type="button"
                    id="close-booking-popup"
                    class="close-booking-popup"
                    aria-label="Close booking form">

                    &times;

                </button>

                <h2>Book Your Appointment</h2>

                <form id="booking-popup-form">

                    <div class="form-group">

                        <label for="popup-name">
                            Name
                        </label>

                        <input
                            type="text"
                            id="popup-name"
                            name="name"
                            placeholder="Enter your name"
                            required>

                    </div>

                    <div class="form-group">

                        <label for="popup-email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="popup-email"
                            name="email"
                            placeholder="Enter your email"
                            required>

                    </div>

                    <div class="form-group">

                        <label for="popup-phone">
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            id="popup-phone"
                            name="phone"
                            placeholder="Enter your phone number"
                            pattern="[0-9]{10}"
                            required>

                    </div>

                    <div class="form-group">

                        <label for="popup-date">
                            Preferred Date
                        </label>

                        <input
                            type="date"
                            id="popup-date"
                            name="date"
                            required>

                    </div>

                    <div class="form-group">

                        <label for="popup-service">
                            Service
                        </label>

                        <select
                            id="popup-service"
                            name="service"
                            required>

                            <option value="">
                                Select a service
                            </option>

                            <option value="haircut">
                                Haircut
                            </option>

                            <option value="hair-color">
                                Hair Color
                            </option>

                            <option value="hair-spa">
                                Hair Spa
                            </option>

                            <option value="facial">
                                Facial
                            </option>

                            <option value="makeup">
                                Makeup
                            </option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="popup-time">
                            Preferred Time
                        </label>

                        <input
                            type="time"
                            id="popup-time"
                            name="time"
                            min="10:00"
                            max="21:00"
                            required>

                    </div>

                    <div class="form-group">

                        <label for="popup-message">
                            Message
                        </label>

                        <textarea
                            id="popup-message"
                            name="message"
                            placeholder="Any special requests...">
                        </textarea>

                    </div>

                    <button
                        type="submit"
                        id="popup-submit-btn">

                        Book Appointment

                    </button>

                    <p
                        id="popup-booking-message"
                        role="status">
                    </p>

                </form>

            </div>

        `;

        document.body.appendChild(popup);

    }


    // =========================================
    // BOOKING POPUP OPEN / CLOSE
    // =========================================

    const bookingPopup =
        document.getElementById("booking-popup");

    const closePopup =
        document.getElementById("close-booking-popup");

    const bookButtons =
        document.querySelectorAll(
            ".nav-btn, .hero-btn, .book-btn"
        );

    function openBookingPopup() {

        bookingPopup.classList.add("booking-popup-open");

        document.body.classList.add("popup-open");

    }

    function closeBookingPopup() {

        bookingPopup.classList.remove(
            "booking-popup-open"
        );

        document.body.classList.remove("popup-open");

    }

    bookButtons.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            openBookingPopup();

        });

    });

    closePopup.addEventListener(
        "click",
        closeBookingPopup
    );

    bookingPopup.addEventListener(
        "click",
        function (event) {

            if (event.target === bookingPopup) {

                closeBookingPopup();

            }

        }
    );

});