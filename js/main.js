/*
    main.js
    ---------------------------------------------------
    Shared JavaScript for the customer-facing salon website.

    Handles:
    1. Mobile navigation
    2. Book Appointment popup
*/


document.addEventListener("DOMContentLoaded", function () {


    // =========================================
    // MOBILE NAVIGATION
    // =========================================

    const navToggle =
        document.getElementById("navToggle");

    const navLinks =
        document.getElementById("navLinks");


    if (navToggle && navLinks) {

        navToggle.addEventListener(
            "click",
            function () {

                const isOpen =
                    navLinks.classList.toggle(
                        "nav-open"
                    );


                navToggle.classList.toggle(
                    "nav-toggle-open",
                    isOpen
                );


                navToggle.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
                );

            }
        );


        // Close mobile menu after clicking a link

        navLinks
            .querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        navLinks.classList.remove(
                            "nav-open"
                        );

                        navToggle.classList.remove(
                            "nav-toggle-open"
                        );

                        navToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

    }



    // =========================================
    // CREATE BOOKING POPUP
    // =========================================

    if (
        !document.getElementById(
            "booking-popup"
        )
    ) {

        const popup =
            document.createElement("div");


        popup.id =
            "booking-popup";


        popup.innerHTML = `

            <div class="booking-popup-content">

                <!-- CLOSE BUTTON -->

                <button
                    type="button"
                    id="close-booking-popup"
                    class="close-booking-popup"
                    aria-label="Close booking form">

                    &times;

                </button>


                <!-- TITLE -->

                <h2>
                    Book Your Appointment
                </h2>


                <!-- BOOKING FORM -->

                <form id="booking-popup-form">


                    <!-- NAME -->

                    <div class="form-group">

                        <label for="popup-name">
                            Name
                        </label>

                        <input
                            type="text"
                            id="popup-name"
                            placeholder="Enter your name"
                            required>

                    </div>


                    <!-- EMAIL -->

                    <div class="form-group">

                        <label for="popup-email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="popup-email"
                            placeholder="Enter your email"
                            required>

                    </div>


                    <!-- PHONE -->

                    <div class="form-group">

                        <label for="popup-phone">
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            id="popup-phone"
                            placeholder="Enter your phone number"
                            pattern="[0-9]{10}"
                            title="Please enter a valid 10-digit phone number"
                            required>

                    </div>


                    <!-- DATE -->

                    <div class="form-group">

                        <label for="popup-date">
                            Preferred Date
                        </label>

                        <input
                            type="date"
                            id="popup-date"
                            required>

                    </div>


                    <!-- SERVICE -->

                    <div class="form-group">

                        <label for="popup-service">
                            Service
                        </label>

                        <select
                            id="popup-service"
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


                    <!-- TIME -->

                    <div class="form-group">

                        <label for="popup-time">
                            Preferred Time
                        </label>

                        <input
                            type="time"
                            id="popup-time"
                            min="10:00"
                            max="21:00"
                            required>

                    </div>


                    <!-- MESSAGE -->

                    <div class="form-group">

                        <label for="popup-message">
                            Message
                        </label>

                        <textarea
                            id="popup-message"
                            placeholder="Any special requests...">
                        </textarea>

                    </div>


                    <!-- SUBMIT -->

                    <button
                        type="submit"
                        id="popup-submit-btn">

                        Book Appointment

                    </button>


                    <!-- MESSAGE -->

                    <p
                        id="popup-booking-message"
                        role="status">
                    </p>


                </form>

            </div>

        `;


        document.body.appendChild(
            popup
        );

    }



    // =========================================
    // GET POPUP ELEMENTS
    // =========================================

    const bookingPopup =
        document.getElementById(
            "booking-popup"
        );


    const closePopup =
        document.getElementById(
            "close-booking-popup"
        );



    // =========================================
    // FIND BOOK APPOINTMENT BUTTONS
    // =========================================

    const bookButtons =
        document.querySelectorAll(
            ".nav-btn, .hero-btn, .book-btn"
        );



    // =========================================
    // OPEN POPUP
    // =========================================

    function openBookingPopup(event) {

        event.preventDefault();

        event.stopPropagation();


        bookingPopup.classList.add(
            "booking-popup-open"
        );


        document.body.classList.add(
            "popup-open"
        );

    }



    // =========================================
    // CLOSE POPUP
    // =========================================

    function closeBookingPopup() {

        bookingPopup.classList.remove(
            "booking-popup-open"
        );


        document.body.classList.remove(
            "popup-open"
        );

    }



    // =========================================
    // ADD CLICK EVENT TO BOOK BUTTONS
    // =========================================

    bookButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                openBookingPopup
            );

        }
    );



    // =========================================
    // CLOSE BUTTON
    // =========================================

    if (closePopup) {

        closePopup.addEventListener(
            "click",
            closeBookingPopup
        );

    }



    // =========================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =========================================

    if (bookingPopup) {

        bookingPopup.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    bookingPopup
                ) {

                    closeBookingPopup();

                }

            }
        );

    }



    // =========================================
    // CLOSE WITH ESCAPE KEY
    // =========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                bookingPopup.classList.contains(
                    "booking-popup-open"
                )
            ) {

                closeBookingPopup();

            }

        }
    );


});