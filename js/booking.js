
document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // BOOKING FORM HANDLER
    // =========================================

    function setupBookingForm(formId, isPopup) {

        const bookingForm =
            document.getElementById(formId);

        if (!bookingForm) {
            return;
        }

        const messageElement = isPopup
            ? document.getElementById("popup-booking-message")
            : document.getElementById("booking-message");

        const submitButton = isPopup
            ? document.getElementById("popup-submit-btn")
            : document.getElementById("booking-submit-btn");

        const nameInput = isPopup
            ? document.getElementById("popup-name")
            : document.getElementById("name");

        const emailInput = isPopup
            ? document.getElementById("popup-email")
            : document.getElementById("email");

        const phoneInput = isPopup
            ? document.getElementById("popup-phone")
            : document.getElementById("phone");

        const dateInput = isPopup
            ? document.getElementById("popup-date")
            : document.getElementById("date");

        const serviceInput = isPopup
            ? document.getElementById("popup-service")
            : document.getElementById("service");

        const timeInput = isPopup
            ? document.getElementById("popup-time")
            : document.getElementById("time");

        const messageInput = isPopup
            ? document.getElementById("popup-message")
            : document.getElementById("message");


        // Prevent past date selection
        const today =
            new Date().toISOString().split("T")[0];

        dateInput.min = today;


        // =========================================
        // SUBMIT FORM
        // =========================================

        bookingForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            messageElement.textContent = "";

            submitButton.disabled = true;

            submitButton.textContent = "Submitting...";


            const customerName =
                nameInput.value.trim();

            const email =
                emailInput.value.trim();

            const phone =
                phoneInput.value.trim();

            const appointmentDate =
                dateInput.value;

            const service =
                serviceInput.value;

            const appointmentTime =
                timeInput.value;

            const message =
                messageInput.value.trim();


            try {

                const { error } =
                    await supabaseClient
                        .from("appointments")
                        .insert([
                            {
                                customer_name: customerName,
                                email: email,
                                phone: phone,
                                appointment_date: appointmentDate,
                                service: service,
                                appointment_time: appointmentTime,
                                message: message || null,
                                status: "Pending"
                            }
                        ]);


                if (error) {
                    throw error;
                }


                messageElement.textContent =
                    "Your appointment request has been submitted successfully!";

                messageElement.style.color = "green";


                bookingForm.reset();

                dateInput.min = today;


                // Close popup after successful submission
                if (isPopup) {

                    setTimeout(function () {

                        const popup =
                            document.getElementById("booking-popup");

                        if (popup) {

                            popup.classList.remove(
                                "booking-popup-open"
                            );

                        }

                        document.body.classList.remove(
                            "popup-open"
                        );

                        messageElement.textContent = "";

                    }, 2000);

                }


            } catch (error) {

                console.error(
                    "Booking submission error:",
                    error
                );

                messageElement.textContent =
                    "Something went wrong. Please try again later.";

                messageElement.style.color = "red";


            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Book Appointment";

            }

        });

    }


    // =========================================
    // INITIALIZE BOTH FORMS
    // =========================================

    setupBookingForm(
        "booking-form",
        false
    );

    setupBookingForm(
        "booking-popup-form",
        true
    );

});