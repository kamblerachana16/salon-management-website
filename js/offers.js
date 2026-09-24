
/* =====================================================
   CLIENT OFFERS
   My Salon - Customer Website
   ===================================================== */

async function loadClientOffers() {

    const container =
        document.getElementById("offers-container");

    if (!container) {
        return;
    }

    const {
        data: offers,
        error
    } = await supabaseClient
        .from("offers")
        .select(`
            id,
            title,
            description,
            discount_text,
            start_date,
            end_date,
            display_order,
            is_active
        `)
        .eq("is_active", true)
        .order("display_order", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });

    if (error) {

        console.error(
            "Failed to load client offers:",
            error
        );

        container.innerHTML = `
            <p>Unable to load offers right now.</p>
        `;

        return;
    }

    if (!offers || offers.length === 0) {

        container.innerHTML = `
            <p>No special offers available right now.</p>
        `;

        return;
    }

    container.innerHTML = "";

    offers.forEach(function (offer) {

        const card =
            document.createElement("div");

        card.className =
            "client-offer-card";

        const discountText =
            offer.discount_text !== null &&
            offer.discount_text !== undefined &&
            String(offer.discount_text).trim() !== ""
                ? `₹${Number(offer.discount_text).toLocaleString("en-IN")}`
                : "Special Offer";

        let validityHTML = "";

        if (offer.end_date) {

            const date =
                new Date(
                    offer.end_date + "T00:00:00"
                );

            if (!isNaN(date.getTime())) {

                const formattedDate =
                    date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    });

                validityHTML = `
                    <p class="client-offer-validity">
                        Valid until: ${formattedDate}
                    </p>
                `;

            }

        }

        card.innerHTML = `

            <h3>
                ${escapeClientHTML(offer.title)}
            </h3>

            <p>
                ${escapeClientHTML(
                    offer.description || ""
                )}
            </p>

            <div class="client-offer-price">
                ${escapeClientHTML(discountText)}
            </div>

            ${validityHTML}

        `;

        container.appendChild(card);

    });

    console.log(
        "Client offers loaded successfully."
    );

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeClientHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =====================================================
   START CLIENT OFFERS
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadClientOffers();

    }
);