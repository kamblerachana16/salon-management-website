document.addEventListener("DOMContentLoaded", async function () {

    // Find the service category cards on the homepage
    const categoryCards = document.querySelectorAll(".service-categories .category");

    // If the service cards don't exist on this page, stop here
    if (!categoryCards.length) return;

    // Get active service categories from Supabase
    const { data: categories, error } = await supabaseClient
        .from("service_categories")
        .select("id, name, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    // If Supabase returns an error, show it in the browser console
    if (error) {
        console.error("Failed to load service categories:", error);
        return;
    }

    // Update each existing frontend card with database data
    categories.forEach(function (category, index) {

        // Make sure we don't try to update a card that doesn't exist
        if (index >= categoryCards.length) return;

        const card = categoryCards[index];

        // Find the heading inside the card
        const heading = card.querySelector("h3");

        // Find the link inside the card
        const link = card.querySelector("a");

        // Update the category name
        if (heading) {
            heading.textContent = category.name;
        }

        // Create a URL-friendly version of the category name
        const slug = category.name.toLowerCase().replace(/\s+/g, "-");

        // Update the link
        if (link) {
            link.href = `service.html#${slug}-services`;
        }
    });

    console.log("Service categories loaded successfully:", categories);
});

// =====================================================
// LOAD SERVICE CARDS AND SERVICE ITEMS
// =====================================================

async function loadServiceCards() {

    const womenContainer = document.getElementById("women-cards");
    const menContainer = document.getElementById("men-cards");
    const kidsContainer = document.getElementById("kids-cards");

    // If these containers don't exist, this is not the services page.
    if (!womenContainer && !menContainer && !kidsContainer) {
        return;
    }

    const { data: cards, error: cardsError } = await supabaseClient
        .from("service_cards")
        .select("*")
        .eq("is_active", true)
        .order("category_id", { ascending: true })
        .order("display_order", { ascending: true });

    if (cardsError) {
        console.error("Failed to load service cards:", cardsError);
        return;
    }

    const { data: items, error: itemsError } = await supabaseClient
        .from("service_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (itemsError) {
        console.error("Failed to load service items:", itemsError);
        return;
    }

    cards.forEach(function (card) {

        // Find all items belonging to this card
        const cardItems = items.filter(function (item) {
            return item.card_id === card.id;
        });

        // Create the card
        const cardElement = document.createElement("div");
        cardElement.className = "service-card";

        // Create service items
        let itemsHTML = "";

        cardItems.forEach(function (item) {

            const price = item.price !== null
                ? `₹${item.price}`
                : "₹___";

            itemsHTML += `
                <div class="service-item">
                    <span>${item.name}</span>
                    <span>${price}</span>
                </div>
            `;
        });

        // Put content inside the card
        cardElement.innerHTML = `
            <div class="service-icon">
                <i class="${card.icon}"></i>
            </div>

            <h3>${card.title}</h3>

            <p>${card.description}</p>

            ${itemsHTML}
        `;

        // Put card into correct category
        if (card.category_id === 1 && womenContainer) {
            womenContainer.appendChild(cardElement);
        }

        if (card.category_id === 2 && menContainer) {
            menContainer.appendChild(cardElement);
        }

        if (card.category_id === 3 && kidsContainer) {
            kidsContainer.appendChild(cardElement);
        }
    });

    console.log("Service cards and items loaded successfully!");
}


// Start loading service cards
loadServiceCards();