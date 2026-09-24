// =====================================================
// ADMIN.JS
// My Salon - Admin Dashboard
// =====================================================


// =====================================================
// PREVENT BROWSER FROM RESTORING SCROLL POSITION
// =====================================================

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

async function checkAdminLogin() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}


// =====================================================
// LOAD SERVICE CATEGORIES
// =====================================================

async function loadServiceCategories() {

    const categorySelect =
        document.getElementById("service-category");

    if (!categorySelect) {
        return;
    }

    const {
        data: categories,
        error
    } = await supabaseClient
        .from("service_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order", {
            ascending: true
        });

    if (error) {

        console.error(
            "Failed to load service categories:",
            error
        );

        return;
    }

    categorySelect.innerHTML =
        '<option value="">Select Category</option>';

    categories.forEach(function (category) {

        const option =
            document.createElement("option");

        option.value = category.id;
        option.textContent = category.name;

        categorySelect.appendChild(option);

    });

}


// =====================================================
// LOAD ADMIN SERVICE CARDS
// =====================================================

async function loadAdminServiceCards() {

    const container =
        document.getElementById("admin-service-cards");

    if (!container) {
        return;
    }


    // =================================================
    // GET SERVICE CARDS
    // =================================================

    const {
        data: services,
        error
    } = await supabaseClient
        .from("service_cards")
        .select(`
            id,
            category_id,
            title,
            description,
            icon,
            display_order,
            is_active,
            service_categories (
                name
            )
        `)
        .order("category_id", {
            ascending: true
        })
        .order("display_order", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Failed to load admin services:",
            error
        );

        container.innerHTML = `
            <p>Failed to load services.</p>
        `;

        return;
    }


    // =================================================
    // GET SERVICE ITEMS
    // =================================================

    const {
        data: items,
        error: itemsError
    } = await supabaseClient
        .from("service_items")
        .select(`
            id,
            card_id,
            name,
            price,
            display_order,
            is_active
        `)
        .order("display_order", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });


    if (itemsError) {

        console.error(
            "Failed to load service items:",
            itemsError
        );

        container.innerHTML = `
            <p>Failed to load service items.</p>
        `;

        return;
    }


    // =================================================
    // NO SERVICE CARDS
    // =================================================

    if (!services || services.length === 0) {

        container.innerHTML = `
            <p>No service cards found.</p>
        `;

        return;
    }


    container.innerHTML = "";


    // =================================================
    // GROUP CARDS BY CATEGORY
    // =================================================

    const categories = {};

    services.forEach(function (service) {

        const categoryName =
            service.service_categories?.name ||
            "Unknown";

        if (!categories[categoryName]) {
            categories[categoryName] = [];
        }

        categories[categoryName].push(service);

    });


    // =================================================
    // CREATE CATEGORY SECTIONS
    // =================================================

    Object.keys(categories).forEach(function (categoryName) {

        const categorySection =
            document.createElement("div");

        categorySection.className =
            "admin-category-section";


        categorySection.innerHTML = `
            <h2 class="admin-category-title">
                ${escapeHTML(categoryName)}
            </h2>

            <div class="admin-category-cards"></div>
        `;


        const cardsContainer =
            categorySection.querySelector(
                ".admin-category-cards"
            );


        // =================================================
        // CREATE EACH SERVICE CARD
        // =================================================

        categories[categoryName].forEach(function (service) {

            const card =
                document.createElement("div");

            card.className =
                "admin-service-card";


            /*
             * IMPORTANT:
             * The card is identified by its database ID.
             * Never use the title as an identifier.
             */

            card.dataset.cardId =
                service.id;


            // =================================================
            // FIND ITEMS FOR THIS EXACT CARD
            // =================================================

            const cardItems =
                items.filter(function (item) {

                    return String(item.card_id) ===
                        String(service.id);

                });


            // =================================================
            // CREATE SERVICE ITEMS
            // =================================================

            let itemsHTML = "";


            if (cardItems.length > 0) {

                itemsHTML =
                    cardItems.map(function (item) {

                        let priceHTML = "";

                        if (
                            item.price !== null &&
                            item.price !== undefined &&
                            item.price !== ""
                        ) {

                            priceHTML = `
                                <span class="admin-service-item-price">
                                    ₹${Number(item.price).toLocaleString("en-IN")}
                                </span>
                            `;

                        } else {

                            priceHTML = `
                                <span class="admin-service-item-price price-not-set">
                                    Price not set
                                </span>
                            `;

                        }


                        return `
                            <div
                                class="admin-service-item"
                                data-item-id="${item.id}"
                                data-card-id="${service.id}"
                            >

                                <div class="admin-service-item-details">

                                    <span class="admin-service-item-name">
                                        ${escapeHTML(item.name)}
                                    </span>

                                    ${priceHTML}

                                </div>


                                <div class="admin-service-item-actions">

                                    <button
                                        type="button"
                                        class="edit-service-item-btn"
                                        data-id="${item.id}"
                                        data-card-id="${service.id}"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-service-item-btn"
                                        data-id="${item.id}"
                                        data-card-id="${service.id}"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        `;

                    }).join("");


            } else {

                itemsHTML = `
                    <div class="admin-no-service-items">
                        No services added yet.
                    </div>
                `;

            }


            // =================================================
            // CREATE MAIN SERVICE CARD
            // =================================================

            card.innerHTML = `

                <div class="admin-service-info">

                    <div class="admin-service-icon">
                        <i class="${escapeHTML(service.icon || "")}"></i>
                    </div>


                    <div class="admin-service-heading">

                        <h3>
                            ${escapeHTML(service.title)}
                        </h3>

                        <p>
                            ${escapeHTML(service.description || "")}
                        </p>

                        <small>
                            Category: ${escapeHTML(categoryName)}
                        </small>

                    </div>

                </div>


                <div class="admin-service-items">

                    ${itemsHTML}

                </div>


                <button
                    type="button"
                    class="add-service-item-btn"
                    data-card-id="${service.id}"
                >
                    <span>+</span>
                    Add Service
                </button>


                <div class="admin-service-actions">

                    <button
                        type="button"
                        class="edit-service-btn"
                        data-id="${service.id}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-service-btn"
                        data-id="${service.id}"
                    >
                        Delete
                    </button>


                    <button
                        type="button"
                        class="toggle-service-btn"
                        data-id="${service.id}"
                    >
                        ${service.is_active ? "Hide" : "Show"}
                    </button>

                </div>

            `;


            cardsContainer.appendChild(card);

        });


        container.appendChild(categorySection);

    });


    console.log(
        "Admin service cards loaded successfully."
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =====================================================
// SCROLL TO SERVICE FORM
// =====================================================

function scrollToServiceForm() {

    const form =
        document.getElementById(
            "add-service-form"
        );

    if (!form) {
        return;
    }

    setTimeout(function () {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}


// =====================================================
// OPEN EDIT SERVICE CARD
// =====================================================

async function openEditService(serviceId) {

    console.log(
        "Editing service card:",
        serviceId
    );


    const {
        data: service,
        error
    } = await supabaseClient
        .from("service_cards")
        .select("*")
        .eq("id", serviceId)
        .single();


    if (error) {

        console.error(
            "Failed to get service:",
            error
        );

        alert(
            "Failed to load service."
        );

        return;
    }


    const form =
        document.getElementById(
            "add-service-form"
        );

    const addButton =
        document.getElementById(
            "add-service-card-btn"
        );

    const formTitle =
        document.getElementById(
            "service-form-title"
        );

    const category =
        document.getElementById(
            "service-category"
        );

    const title =
        document.getElementById(
            "service-title"
        );

    const description =
        document.getElementById(
            "service-description"
        );

    const icon =
        document.getElementById(
            "service-icon"
        );

    const order =
        document.getElementById(
            "service-order"
        );


    if (!form) {
        return;
    }


    form.style.display =
        "block";


    if (addButton) {
        addButton.style.display =
            "none";
    }


    if (formTitle) {

        formTitle.textContent =
            "Edit Service Card";

    }


    if (category) {
        category.value =
            service.category_id;
    }

    if (title) {
        title.value =
            service.title || "";
    }

    if (description) {
        description.value =
            service.description || "";
    }

    if (icon) {
        icon.value =
            service.icon || "";
    }

    if (order) {
        order.value =
            service.display_order || 1;
    }


    form.dataset.editingId =
        service.id;


    scrollToServiceForm();

}


// =====================================================
// SETUP SERVICE FORM BUTTONS
// =====================================================

function setupFormButtons() {

    const addServiceBtn =
        document.getElementById(
            "add-service-card-btn"
        );

    const addServiceForm =
        document.getElementById(
            "add-service-form"
        );

    const cancelServiceBtn =
        document.getElementById(
            "cancel-service-btn"
        );


    if (
        addServiceBtn &&
        addServiceForm
    ) {

        addServiceBtn.addEventListener(
            "click",
            function () {

                addServiceForm.style.display =
                    "block";

                addServiceBtn.style.display =
                    "none";


                delete addServiceForm.dataset.editingId;


                const formTitle =
                    document.getElementById(
                        "service-form-title"
                    );

                if (formTitle) {

                    formTitle.textContent =
                        "Add New Service Card";

                }


                const category =
                    document.getElementById(
                        "service-category"
                    );

                const title =
                    document.getElementById(
                        "service-title"
                    );

                const description =
                    document.getElementById(
                        "service-description"
                    );

                const icon =
                    document.getElementById(
                        "service-icon"
                    );

                const order =
                    document.getElementById(
                        "service-order"
                    );


                if (category) {
                    category.value = "";
                }

                if (title) {
                    title.value = "";
                }

                if (description) {
                    description.value = "";
                }

                if (icon) {
                    icon.value = "";
                }

                if (order) {
                    order.value = "";
                }


                scrollToServiceForm();

            }
        );

    }


    if (
        cancelServiceBtn &&
        addServiceForm
    ) {

        cancelServiceBtn.addEventListener(
            "click",
            function () {

                addServiceForm.style.display =
                    "none";


                if (addServiceBtn) {

                    addServiceBtn.style.display =
                        "block";

                }


                delete addServiceForm.dataset.editingId;

            }
        );

    }

}


// =====================================================
// SAVE SERVICE CARD
// =====================================================

function setupSaveService() {

    const saveServiceBtn =
        document.getElementById(
            "save-service-btn"
        );

    const addServiceForm =
        document.getElementById(
            "add-service-form"
        );


    if (
        !saveServiceBtn ||
        !addServiceForm
    ) {

        return;

    }


    saveServiceBtn.addEventListener(
        "click",
        async function () {

            const categoryId =
                document.getElementById(
                    "service-category"
                ).value;


            const title =
                document.getElementById(
                    "service-title"
                ).value.trim();


            const description =
                document.getElementById(
                    "service-description"
                ).value.trim();


            const icon =
                document.getElementById(
                    "service-icon"
                ).value.trim();


            const displayOrder =
                document.getElementById(
                    "service-order"
                ).value;


            if (
                !categoryId ||
                !title
            ) {

                alert(
                    "Please select a category and enter a service title."
                );

                return;

            }


            const editingId =
                addServiceForm.dataset.editingId;


            if (editingId) {

                const {
                    error: updateError
                } = await supabaseClient
                    .from("service_cards")
                    .update({

                        category_id:
                            Number(categoryId),

                        title:
                            title,

                        description:
                            description,

                        icon:
                            icon,

                        display_order:
                            Number(displayOrder) || 1

                    })
                    .eq(
                        "id",
                        editingId
                    );


                if (updateError) {

                    console.error(
                        "Failed to update service card:",
                        updateError
                    );

                    alert(
                        "Failed to update service."
                    );

                    return;

                }


                alert(
                    "Service card updated successfully!"
                );


                location.reload();

                return;

            }


            const {
                data: newService,
                error: serviceError
            } = await supabaseClient
                .from("service_cards")
                .insert([
                    {

                        category_id:
                            Number(categoryId),

                        title:
                            title,

                        description:
                            description,

                        icon:
                            icon,

                        display_order:
                            Number(displayOrder) || 1,

                        is_active:
                            true

                    }
                ])
                .select()
                .single();


            if (serviceError) {

                console.error(
                    "Failed to add service card:",
                    serviceError
                );

                alert(
                    "Failed to add service card."
                );

                return;

            }


            console.log(
                "New service card created:",
                newService.id
            );


            const {
                error: itemError
            } = await supabaseClient
                .from("service_items")
                .insert([
                    {

                        card_id:
                            newService.id,

                        name:
                            title,

                        price:
                            null,

                        display_order:
                            1,

                        is_active:
                            true

                    }
                ]);


            if (itemError) {

                console.error(
                    "Failed to add first service item:",
                    itemError
                );

                alert(
                    "Service card was created, but the first service item could not be created."
                );

                return;

            }


            alert(
                "Service added successfully!"
            );


            location.reload();

        }
    );

}


// =====================================================
// ADD INDIVIDUAL SERVICE ITEM
// =====================================================

function setupAddServiceItem() {

    document.addEventListener(
        "click",
        async function (event) {

            const addButton =
                event.target.closest(
                    ".add-service-item-btn"
                );


            if (!addButton) {
                return;
            }


            const cardId =
                addButton.dataset.cardId;


            if (!cardId) {

                alert(
                    "Unable to identify the service card."
                );

                return;

            }


            const itemName =
                prompt(
                    "Enter service name:\n\nExample:\nFruit Facial"
                );


            if (
                itemName === null ||
                itemName.trim() === ""
            ) {

                return;

            }


            const priceInput =
                prompt(
                    "Enter price:\n\nLeave empty if price is not set."
                );


            if (priceInput === null) {
                return;
            }


            const trimmedPrice =
                priceInput.trim();


            let numericPrice = null;


            if (trimmedPrice !== "") {

                numericPrice =
                    Number(trimmedPrice);


                if (
                    isNaN(numericPrice) ||
                    numericPrice < 0
                ) {

                    alert(
                        "Please enter a valid price."
                    );

                    return;

                }

            }


            const {
                data: existingItems,
                error: fetchError
            } = await supabaseClient
                .from("service_items")
                .select("display_order")
                .eq(
                    "card_id",
                    cardId
                )
                .order(
                    "display_order",
                    {
                        ascending: false
                    }
                )
                .limit(1);


            if (fetchError) {

                console.error(
                    "Failed to get service item order:",
                    fetchError
                );

                alert(
                    "Failed to add service item."
                );

                return;

            }


            let nextOrder = 1;


            if (
                existingItems &&
                existingItems.length > 0
            ) {

                nextOrder =
                    Number(
                        existingItems[0].display_order
                    ) + 1;

            }


            const {
                error: insertError
            } = await supabaseClient
                .from("service_items")
                .insert([
                    {

                        card_id:
                            cardId,

                        name:
                            itemName.trim(),

                        price:
                            numericPrice,

                        display_order:
                            nextOrder,

                        is_active:
                            true

                    }
                ]);


            if (insertError) {

                console.error(
                    "Failed to add service item:",
                    insertError
                );

                alert(
                    "Failed to add service item."
                );

                return;

            }


            alert(
                "Service item added successfully!"
            );


            location.reload();

        }
    );

}


// =====================================================
// EDIT INDIVIDUAL SERVICE ITEM
// =====================================================

function setupEditServiceItem() {

    document.addEventListener(
        "click",
        async function (event) {

            const editButton =
                event.target.closest(
                    ".edit-service-item-btn"
                );


            if (!editButton) {
                return;
            }


            const itemId =
                editButton.dataset.id;


            const {
                data: item,
                error: fetchError
            } = await supabaseClient
                .from("service_items")
                .select("*")
                .eq(
                    "id",
                    itemId
                )
                .single();


            if (fetchError) {

                console.error(
                    "Failed to load service item:",
                    fetchError
                );

                alert(
                    "Failed to load service item."
                );

                return;

            }


            const newName =
                prompt(
                    "Edit service name:",
                    item.name
                );


            if (
                newName === null ||
                newName.trim() === ""
            ) {

                return;

            }


            const currentPrice =
                item.price !== null &&
                    item.price !== undefined
                    ? item.price
                    : "";


            const newPriceInput =
                prompt(
                    "Edit price:\nLeave empty if price is not set.",
                    currentPrice
                );


            if (newPriceInput === null) {
                return;
            }


            const trimmedPrice =
                newPriceInput.trim();


            let numericPrice = null;


            if (trimmedPrice !== "") {

                numericPrice =
                    Number(trimmedPrice);


                if (
                    isNaN(numericPrice) ||
                    numericPrice < 0
                ) {

                    alert(
                        "Please enter a valid price."
                    );

                    return;

                }

            }


            const {
                error: updateError
            } = await supabaseClient
                .from("service_items")
                .update({

                    name:
                        newName.trim(),

                    price:
                        numericPrice

                })
                .eq(
                    "id",
                    itemId
                );


            if (updateError) {

                console.error(
                    "Failed to update service item:",
                    updateError
                );

                alert(
                    "Failed to update service item."
                );

                return;

            }


            alert(
                "Service item updated successfully!"
            );


            location.reload();

        }
    );

}


// =====================================================
// DELETE INDIVIDUAL SERVICE ITEM
// =====================================================

function setupDeleteServiceItem() {

    document.addEventListener(
        "click",
        async function (event) {

            const deleteButton =
                event.target.closest(
                    ".delete-service-item-btn"
                );


            if (!deleteButton) {
                return;
            }


            const itemId =
                deleteButton.dataset.id;


            const confirmed =
                confirm(
                    "Are you sure you want to delete this service item?"
                );


            if (!confirmed) {
                return;
            }


            const {
                error
            } = await supabaseClient
                .from("service_items")
                .delete()
                .eq(
                    "id",
                    itemId
                );


            if (error) {

                console.error(
                    "Failed to delete service item:",
                    error
                );

                alert(
                    "Failed to delete service item."
                );

                return;

            }


            alert(
                "Service item deleted successfully!"
            );


            location.reload();

        }
    );

}


// =====================================================
// DELETE SERVICE CARD
// =====================================================

function setupDeleteService() {

    document.addEventListener(
        "click",
        async function (event) {

            const deleteButton =
                event.target.closest(
                    ".delete-service-btn"
                );


            if (!deleteButton) {
                return;
            }


            const serviceId =
                deleteButton.dataset.id;


            const confirmed =
                confirm(
                    "Are you sure you want to delete this service card?\n\nAll services inside this card will also be deleted."
                );


            if (!confirmed) {
                return;
            }


            const {
                error: itemsError
            } = await supabaseClient
                .from("service_items")
                .delete()
                .eq(
                    "card_id",
                    serviceId
                );


            if (itemsError) {

                console.error(
                    "Failed to delete service items:",
                    itemsError
                );

                alert(
                    "Failed to delete service items."
                );

                return;

            }


            const {
                error
            } = await supabaseClient
                .from("service_cards")
                .delete()
                .eq(
                    "id",
                    serviceId
                );


            if (error) {

                console.error(
                    "Failed to delete service:",
                    error
                );

                alert(
                    "Failed to delete service card."
                );

                return;

            }


            alert(
                "Service card deleted successfully!"
            );


            location.reload();

        }
    );

}


// =====================================================
// SHOW / HIDE SERVICE CARD
// =====================================================

function setupToggleService() {

    document.addEventListener(
        "click",
        async function (event) {

            const toggleButton =
                event.target.closest(
                    ".toggle-service-btn"
                );


            if (!toggleButton) {
                return;
            }


            const serviceId =
                toggleButton.dataset.id;


            const {
                data: service,
                error: fetchError
            } = await supabaseClient
                .from("service_cards")
                .select("is_active")
                .eq(
                    "id",
                    serviceId
                )
                .single();


            if (fetchError) {

                console.error(
                    "Failed to get service:",
                    fetchError
                );

                alert(
                    "Failed to update service."
                );

                return;

            }


            const {
                error: updateError
            } = await supabaseClient
                .from("service_cards")
                .update({

                    is_active:
                        !service.is_active

                })
                .eq(
                    "id",
                    serviceId
                );


            if (updateError) {

                console.error(
                    "Failed to update service status:",
                    updateError
                );

                alert(
                    "Failed to update service."
                );

                return;

            }


            alert(
                service.is_active
                    ? "Service hidden successfully!"
                    : "Service shown successfully!"
            );


            location.reload();

        }
    );

}


// =====================================================
// EDIT SERVICE CARD BUTTON
// =====================================================

function setupEditService() {

    const container =
        document.getElementById(
            "admin-service-cards"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async function (event) {

            const editButton =
                event.target.closest(
                    ".edit-service-btn"
                );


            if (!editButton) {
                return;
            }


            const serviceId =
                editButton.dataset.id;


            await openEditService(
                serviceId
            );

        }
    );

}


// =====================================================
// =====================================================
// OFFER MANAGEMENT
// =====================================================
// =====================================================


// =====================================================
// LOAD ADMIN OFFERS
// =====================================================

async function loadAdminOffers() {

    const container =
        document.getElementById(
            "admin-offers"
        );


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
            image_url,
            start_date,
            end_date,
            display_order,
            is_active
        `)
        .order("display_order", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Failed to load offers:",
            error
        );

        container.innerHTML = `
            <p>Failed to load offers.</p>
        `;

        return;
    }


    if (!offers || offers.length === 0) {

        container.innerHTML = `
            <p>No offers found.</p>
        `;

        return;
    }


    container.innerHTML = "";


    offers.forEach(function (offer) {

        const offerCard =
            document.createElement("div");

        offerCard.className =
            "admin-offer-card";


        let discountHTML =
            "Not set";


        if (
            offer.discount_text !== null &&
            offer.discount_text !== undefined &&
            String(offer.discount_text).trim() !== ""
        ) {

            const discountText =
                String(
                    offer.discount_text
                ).trim();


            const numericDiscount =
                Number(
                    discountText
                );


            if (
                !isNaN(numericDiscount) &&
                discountText !== ""
            ) {

                discountHTML =
                    `₹${numericDiscount.toLocaleString("en-IN")}`;

            } else {

                discountHTML =
                    escapeHTML(discountText);

            }

        }


        let validUntil =
            "Not set";


        if (offer.end_date) {

            const date =
                new Date(
                    offer.end_date + "T00:00:00"
                );


            if (!isNaN(date.getTime())) {

                validUntil =
                    date.toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );

            }

        }


        const statusText =
            offer.is_active
                ? "Active"
                : "Hidden";


        offerCard.innerHTML = `

            <div class="admin-offer-info">

                <h3>
                    ${escapeHTML(offer.title)}
                </h3>


                <p>
                    ${escapeHTML(
            offer.description || ""
        )}
                </p>


                <div class="admin-offer-details">

                    <span>
                        <strong>
                            Price:
                        </strong>

                        ${discountHTML}
                    </span>


                    <span>
                        <strong>
                            Valid Until:
                        </strong>

                        ${validUntil}
                    </span>


                    <span>
                        <strong>
                            Order:
                        </strong>

                        ${Number(
            offer.display_order
        ) || 1}
                    </span>


                    <span>
                        <strong>
                            Status:
                        </strong>

                        ${statusText}
                    </span>

                </div>

            </div>


            <div class="admin-offer-actions">

                <button
                    type="button"
                    class="edit-offer-btn"
                    data-id="${offer.id}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="delete-offer-btn"
                    data-id="${offer.id}"
                >
                    Delete
                </button>


                <button
                    type="button"
                    class="toggle-offer-btn"
                    data-id="${offer.id}"
                >
                    ${offer.is_active ? "Hide" : "Show"}
                </button>

            </div>

        `;


        container.appendChild(
            offerCard
        );

    });


    console.log(
        "Admin offers loaded successfully."
    );

}


// =====================================================
// SCROLL TO OFFER FORM
// =====================================================

function scrollToOfferForm() {

    const form =
        document.getElementById(
            "offer-form"
        );


    if (!form) {
        return;
    }


    setTimeout(function () {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}


// =====================================================
// SAVE CURRENT SCROLL POSITION BEFORE RELOAD
// =====================================================

function reloadAndKeepPosition() {

    const currentPosition =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0;


    sessionStorage.setItem(
        "adminScrollPosition",
        String(currentPosition)
    );


    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }


    location.reload();

}


// =====================================================
// RESTORE PREVIOUS SCROLL POSITION AFTER RELOAD
// =====================================================

function restoreScrollPosition() {

    const savedPosition =
        sessionStorage.getItem(
            "adminScrollPosition"
        );


    if (savedPosition === null) {
        return;
    }


    const position =
        Number(savedPosition);


    if (!Number.isFinite(position)) {

        sessionStorage.removeItem(
            "adminScrollPosition"
        );

        return;

    }


    document.documentElement.style.scrollBehavior =
        "auto";


    requestAnimationFrame(function () {

        requestAnimationFrame(function () {

            window.scrollTo(
                0,
                position
            );


            requestAnimationFrame(function () {

                document.documentElement.style.scrollBehavior =
                    "";

            });


            sessionStorage.removeItem(
                "adminScrollPosition"
            );

        });

    });

}


// =====================================================
// OPEN EDIT OFFER
// =====================================================

async function openEditOffer(offerId) {

    console.log(
        "Editing offer:",
        offerId
    );


    const {
        data: offer,
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
        .eq(
            "id",
            offerId
        )
        .single();


    if (error) {

        console.error(
            "Failed to load offer:",
            error
        );

        alert(
            "Failed to load offer."
        );

        return;
    }


    const form =
        document.getElementById(
            "offer-form"
        );

    const addButton =
        document.getElementById(
            "add-offer-btn"
        );

    const formTitle =
        document.getElementById(
            "offer-form-title"
        );

    const title =
        document.getElementById(
            "offer-title"
        );

    const description =
        document.getElementById(
            "offer-description"
        );

    const price =
        document.getElementById(
            "offer-price"
        );

    const validUntil =
        document.getElementById(
            "offer-valid-until"
        );

    const order =
        document.getElementById(
            "offer-order"
        );


    if (!form) {
        return;
    }


    form.style.display =
        "block";


    if (addButton) {

        addButton.style.display =
            "none";

    }


    if (formTitle) {

        formTitle.textContent =
            "Edit Offer";

    }


    if (title) {

        title.value =
            offer.title || "";

    }


    if (description) {

        description.value =
            offer.description || "";

    }


    if (price) {

        const discountText =
            offer.discount_text || "";


        const numericValue =
            String(discountText)
                .replace(/[₹,\s]/g, "");


        if (
            numericValue !== "" &&
            !isNaN(Number(numericValue))
        ) {

            price.value =
                numericValue;

        } else {

            price.value =
                "";

        }

    }


    if (validUntil) {

        validUntil.value =
            offer.end_date || "";

    }


    if (order) {

        order.value =
            offer.display_order || 1;

    }


    form.dataset.editingId =
        offer.id;


    scrollToOfferForm();

}


// =====================================================
// SETUP OFFER FORM BUTTONS
// =====================================================

function setupOfferFormButtons() {

    const addOfferBtn =
        document.getElementById(
            "add-offer-btn"
        );

    const offerForm =
        document.getElementById(
            "offer-form"
        );

    const cancelOfferBtn =
        document.getElementById(
            "cancel-offer-btn"
        );


    if (
        addOfferBtn &&
        offerForm
    ) {

        addOfferBtn.addEventListener(
            "click",
            function () {

                offerForm.style.display =
                    "block";


                addOfferBtn.style.display =
                    "none";


                delete offerForm.dataset.editingId;


                const formTitle =
                    document.getElementById(
                        "offer-form-title"
                    );

                if (formTitle) {

                    formTitle.textContent =
                        "Add New Offer";

                }


                const title =
                    document.getElementById(
                        "offer-title"
                    );

                const description =
                    document.getElementById(
                        "offer-description"
                    );

                const price =
                    document.getElementById(
                        "offer-price"
                    );

                const validUntil =
                    document.getElementById(
                        "offer-valid-until"
                    );

                const order =
                    document.getElementById(
                        "offer-order"
                    );


                if (title) {
                    title.value = "";
                }


                if (description) {
                    description.value = "";
                }


                if (price) {
                    price.value = "";
                }


                if (validUntil) {
                    validUntil.value = "";
                }


                if (order) {
                    order.value = "";
                }


                scrollToOfferForm();

            }
        );

    }


    if (
        cancelOfferBtn &&
        offerForm
    ) {

        cancelOfferBtn.addEventListener(
            "click",
            function () {

                offerForm.style.display =
                    "none";


                if (addOfferBtn) {

                    addOfferBtn.style.display =
                        "block";

                }


                delete offerForm.dataset.editingId;

            }
        );

    }

}


// =====================================================
// SAVE OFFER
// =====================================================

function setupSaveOffer() {

    const saveOfferBtn =
        document.getElementById(
            "save-offer-btn"
        );

    const offerForm =
        document.getElementById(
            "offer-form"
        );


    if (
        !saveOfferBtn ||
        !offerForm
    ) {

        return;

    }


    saveOfferBtn.addEventListener(
        "click",
        async function () {

            const title =
                document.getElementById(
                    "offer-title"
                ).value.trim();


            const description =
                document.getElementById(
                    "offer-description"
                ).value.trim();


            const price =
                document.getElementById(
                    "offer-price"
                ).value.trim();


            const validUntil =
                document.getElementById(
                    "offer-valid-until"
                ).value;


            const displayOrder =
                document.getElementById(
                    "offer-order"
                ).value;


            if (!title) {

                alert(
                    "Please enter an offer title."
                );

                return;

            }


            if (
                price !== "" &&
                (
                    isNaN(Number(price)) ||
                    Number(price) < 0
                )
            ) {

                alert(
                    "Please enter a valid price."
                );

                return;

            }


            const editingId =
                offerForm.dataset.editingId;


            if (editingId) {

                const {
                    error: updateError
                } = await supabaseClient
                    .from("offers")
                    .update({

                        title:
                            title,

                        description:
                            description,

                        discount_text:
                            price,

                        end_date:
                            validUntil || null,

                        display_order:
                            Number(displayOrder) || 1

                    })
                    .eq(
                        "id",
                        editingId
                    );


                if (updateError) {

                    console.error(
                        "Failed to update offer:",
                        updateError
                    );

                    alert(
                        "Failed to update offer."
                    );

                    return;

                }


                alert(
                    "Offer updated successfully!"
                );


                reloadAndKeepPosition();

                return;

            }


            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            const {
                error: insertError
            } = await supabaseClient
                .from("offers")
                .insert([
                    {

                        title:
                            title,

                        description:
                            description,

                        discount_text:
                            price,

                        start_date:
                            today,

                        end_date:
                            validUntil || null,

                        display_order:
                            Number(displayOrder) || 1,

                        is_active:
                            true

                    }
                ]);


            if (insertError) {

                console.error(
                    "Failed to add offer:",
                    insertError
                );

                alert(
                    "Failed to add offer."
                );

                return;

            }


            alert(
                "Offer added successfully!"
            );


            reloadAndKeepPosition();

        }
    );

}


// =====================================================
// EDIT OFFER BUTTON
// =====================================================

function setupEditOffer() {

    const container =
        document.getElementById(
            "admin-offers"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async function (event) {

            const editButton =
                event.target.closest(
                    ".edit-offer-btn"
                );


            if (!editButton) {
                return;
            }


            const offerId =
                editButton.dataset.id;


            await openEditOffer(
                offerId
            );

        }
    );

}


// =====================================================
// DELETE OFFER
// =====================================================

function setupDeleteOffer() {

    const container =
        document.getElementById(
            "admin-offers"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async function (event) {

            const deleteButton =
                event.target.closest(
                    ".delete-offer-btn"
                );


            if (!deleteButton) {
                return;
            }


            const offerId =
                deleteButton.dataset.id;


            const confirmed =
                confirm(
                    "Are you sure you want to delete this offer?"
                );


            if (!confirmed) {
                return;
            }


            const {
                error
            } = await supabaseClient
                .from("offers")
                .delete()
                .eq(
                    "id",
                    offerId
                );


            if (error) {

                console.error(
                    "Failed to delete offer:",
                    error
                );

                alert(
                    "Failed to delete offer."
                );

                return;

            }


            alert(
                "Offer deleted successfully!"
            );


            reloadAndKeepPosition();

        }
    );

}


// =====================================================
// SHOW / HIDE OFFER
// =====================================================

function setupToggleOffer() {

    const container =
        document.getElementById(
            "admin-offers"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async function (event) {

            const toggleButton =
                event.target.closest(
                    ".toggle-offer-btn"
                );


            if (!toggleButton) {
                return;
            }


            const offerId =
                toggleButton.dataset.id;


            const {
                data: offer,
                error: fetchError
            } = await supabaseClient
                .from("offers")
                .select("is_active")
                .eq(
                    "id",
                    offerId
                )
                .single();


            if (fetchError) {

                console.error(
                    "Failed to get offer:",
                    fetchError
                );

                alert(
                    "Failed to update offer."
                );

                return;

            }


            const {
                error: updateError
            } = await supabaseClient
                .from("offers")
                .update({

                    is_active:
                        !offer.is_active

                })
                .eq(
                    "id",
                    offerId
                );


            if (updateError) {

                console.error(
                    "Failed to update offer status:",
                    updateError
                );

                alert(
                    "Failed to update offer."
                );

                return;

            }


            alert(
                offer.is_active
                    ? "Offer hidden successfully!"
                    : "Offer shown successfully!"
            );


            reloadAndKeepPosition();

        }
    );

}


// =====================================================
// =====================================================
// SOCIAL MEDIA MANAGEMENT
// =====================================================
// =====================================================


// =====================================================
// LOAD SOCIAL LINKS
// =====================================================

async function loadSocialLinks() {

    const container =
        document.getElementById(
            "admin-social-links"
        );


    if (!container) {
        return;
    }


    const {
        data: socialLinks,
        error
    } = await supabaseClient
        .from("social_links")
        .select(`
            id,
            platform,
            url,
            is_active,
            display_order
        `)
        .order("display_order", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Failed to load social links:",
            error
        );

        container.innerHTML = `
            <p>Failed to load social links.</p>
        `;

        return;
    }


    if (
        !socialLinks ||
        socialLinks.length === 0
    ) {

        container.innerHTML = `
            <p>No social media links added yet.</p>
        `;

        return;
    }


    container.innerHTML = "";


    socialLinks.forEach(function (social) {

        const card =
            document.createElement("div");

        card.className =
            "admin-social-link-card";


        const statusText =
            social.is_active
                ? "Active"
                : "Hidden";


        card.innerHTML = `

            <div class="admin-social-link-info">

                <h3>
                    ${escapeHTML(social.platform)}
                </h3>


                <a
                    href="${escapeHTML(social.url)}"
                    class="admin-social-link-url"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(social.url)}
                </a>


                <div class="admin-social-link-details">

                    <span>
                        <strong>
                            Order:
                        </strong>

                        ${Number(
            social.display_order
        ) || 1}
                    </span>


                    <span>
                        <strong>
                            Status:
                        </strong>

                        ${statusText}
                    </span>

                </div>

            </div>


            <div class="admin-social-link-actions">

                <button
                    type="button"
                    class="edit-social-link-btn"
                    data-id="${social.id}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="delete-social-link-btn"
                    data-id="${social.id}"
                >
                    Delete
                </button>


                <button
                    type="button"
                    class="toggle-social-link-btn"
                    data-id="${social.id}"
                >
                    ${social.is_active ? "Hide" : "Show"}
                </button>

            </div>

        `;


        container.appendChild(card);

    });


    console.log(
        "Admin social links loaded successfully."
    );

}


// =====================================================
// SCROLL TO SOCIAL LINK FORM
// =====================================================

function scrollToSocialLinkForm() {

    const form =
        document.getElementById(
            "social-link-form"
        );


    if (!form) {
        return;
    }


    setTimeout(function () {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}


// =====================================================
// OPEN EDIT SOCIAL LINK
// =====================================================

async function openEditSocialLink(socialId) {

    console.log(
        "Editing social link:",
        socialId
    );


    const {
        data: social,
        error
    } = await supabaseClient
        .from("social_links")
        .select(`
            id,
            platform,
            url,
            is_active,
            display_order
        `)
        .eq(
            "id",
            socialId
        )
        .single();


    if (error) {

        console.error(
            "Failed to load social link:",
            error
        );

        alert(
            "Failed to load social link."
        );

        return;
    }


    const form =
        document.getElementById(
            "social-link-form"
        );

    const addButton =
        document.getElementById(
            "add-social-link-btn"
        );

    const formTitle =
        document.getElementById(
            "social-link-form-title"
        );

    const platform =
        document.getElementById(
            "social-link-platform"
        );

    const url =
        document.getElementById(
            "social-link-url"
        );

    const order =
        document.getElementById(
            "social-link-order"
        );


    if (!form) {
        return;
    }


    form.style.display =
        "block";


    if (addButton) {

        addButton.style.display =
            "none";

    }


    if (formTitle) {

        formTitle.textContent =
            "Edit Social Media Link";

    }


    if (platform) {

        platform.value =
            social.platform || "";

    }


    if (url) {

        url.value =
            social.url || "";

    }


    if (order) {

        order.value =
            social.display_order || 1;

    }


    form.dataset.editingId =
        social.id;


    scrollToSocialLinkForm();

}


// =====================================================
// SETUP SOCIAL LINK FORM BUTTONS
// =====================================================

function setupSocialLinkFormButtons() {

    const addSocialLinkBtn =
        document.getElementById(
            "add-social-link-btn"
        );

    const socialLinkForm =
        document.getElementById(
            "social-link-form"
        );

    const cancelSocialLinkBtn =
        document.getElementById(
            "cancel-social-link-btn"
        );


    // =================================================
    // ADD SOCIAL LINK BUTTON
    // =================================================

    if (
        addSocialLinkBtn &&
        socialLinkForm
    ) {

        addSocialLinkBtn.addEventListener(
            "click",
            function () {

                socialLinkForm.style.display =
                    "block";


                addSocialLinkBtn.style.display =
                    "none";


                delete socialLinkForm.dataset.editingId;


                const formTitle =
                    document.getElementById(
                        "social-link-form-title"
                    );

                const platform =
                    document.getElementById(
                        "social-link-platform"
                    );

                const url =
                    document.getElementById(
                        "social-link-url"
                    );

                const order =
                    document.getElementById(
                        "social-link-order"
                    );


                if (formTitle) {

                    formTitle.textContent =
                        "Add New Social Link";

                }


                if (platform) {

                    platform.value =
                        "";

                }


                if (url) {

                    url.value =
                        "";

                }


                if (order) {

                    order.value =
                        "";

                }


                scrollToSocialLinkForm();

            }
        );

    }


    // =================================================
    // CANCEL SOCIAL LINK
    // =================================================

    if (
        cancelSocialLinkBtn &&
        socialLinkForm
    ) {

        cancelSocialLinkBtn.addEventListener(
            "click",
            function () {

                socialLinkForm.style.display =
                    "none";


                if (addSocialLinkBtn) {

                    addSocialLinkBtn.style.display =
                        "block";

                }


                delete socialLinkForm.dataset.editingId;

            }
        );

    }

}


// =====================================================
// SAVE SOCIAL LINK
// =====================================================

function setupSaveSocialLink() {

    const saveSocialLinkBtn =
        document.getElementById(
            "save-social-link-btn"
        );

    const socialLinkForm =
        document.getElementById(
            "social-link-form"
        );


    if (
        !saveSocialLinkBtn ||
        !socialLinkForm
    ) {

        return;

    }


    saveSocialLinkBtn.addEventListener(
        "click",
        async function () {

            const platform =
                document.getElementById(
                    "social-link-platform"
                ).value.trim();


            const url =
                document.getElementById(
                    "social-link-url"
                ).value.trim();


            const displayOrder =
                document.getElementById(
                    "social-link-order"
                ).value;


            // =================================================
            // VALIDATION
            // =================================================

            if (!platform) {

                alert(
                    "Please select a social media platform."
                );

                return;

            }


            if (!url) {

                alert(
                    "Please enter the social media URL."
                );

                return;

            }


            // =================================================
            // BASIC URL VALIDATION
            // =================================================

            let validURL;

            try {

                validURL =
                    new URL(url);

            } catch (error) {

                alert(
                    "Please enter a valid URL."
                );

                return;

            }


            if (
                validURL.protocol !== "http:" &&
                validURL.protocol !== "https:"
            ) {

                alert(
                    "Please enter a valid HTTP or HTTPS URL."
                );

                return;

            }


            const editingId =
                socialLinkForm.dataset.editingId;


            // =================================================
            // EDIT EXISTING SOCIAL LINK
            // =================================================

            if (editingId) {

                const {
                    error: updateError
                } = await supabaseClient
                    .from("social_links")
                    .update({

                        platform:
                            platform,

                        url:
                            url,

                        display_order:
                            Number(displayOrder) || 1,

                        updated_at:
                            new Date().toISOString()

                    })
                    .eq(
                        "id",
                        editingId
                    );


                if (updateError) {

                    console.error(
                        "Failed to update social link:",
                        updateError
                    );

                    alert(
                        "Failed to update social link."
                    );

                    return;

                }


                alert(
                    "Social media link updated successfully!"
                );


                reloadAndKeepPosition();

                return;

            }


            // =================================================
            // ADD NEW SOCIAL LINK
            // =================================================

            const {
                error: insertError
            } = await supabaseClient
                .from("social_links")
                .insert([
                    {

                        platform:
                            platform,

                        url:
                            url,

                        is_active:
                            true,

                        display_order:
                            Number(displayOrder) || 1

                    }
                ]);


            if (insertError) {

                console.error(
                    "Failed to add social link:",
                    insertError
                );

                alert(
                    "Failed to add social media link."
                );

                return;

            }


            alert(
                "Social media link added successfully!"
            );


            reloadAndKeepPosition();

        }
    );

}


// =====================================================
// EDIT SOCIAL LINK BUTTON
// =====================================================

function setupEditSocialLink() {

    const container =
        document.getElementById(
            "admin-social-links"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async function (event) {

            const editButton =
                event.target.closest(
                    ".edit-social-link-btn"
                );


            if (!editButton) {
                return;
            }


            const socialId =
                editButton.dataset.id;


            await openEditSocialLink(
                socialId
            );

        }
    );

}


// =====================================================
// DELETE SOCIAL LINK
// =====================================================

function setupDeleteSocialLink() {

    const container =
        document.getElementById(
            "admin-social-links"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async function (event) {

            const deleteButton =
                event.target.closest(
                    ".delete-social-link-btn"
                );


            if (!deleteButton) {
                return;
            }


            const socialId =
                deleteButton.dataset.id;


            const confirmed =
                confirm(
                    "Are you sure you want to delete this social media link?"
                );


            if (!confirmed) {
                return;
            }


            const {
                error
            } = await supabaseClient
                .from("social_links")
                .delete()
                .eq(
                    "id",
                    socialId
                );


            if (error) {

                console.error(
                    "Failed to delete social link:",
                    error
                );

                alert(
                    "Failed to delete social media link."
                );

                return;

            }


            alert(
                "Social media link deleted successfully!"
            );


            reloadAndKeepPosition();

        }
    );

}


// =====================================================
// SHOW / HIDE SOCIAL LINK
// =====================================================

function setupToggleSocialLink() {

    const container =
        document.getElementById(
            "admin-social-links"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async function (event) {

            const toggleButton =
                event.target.closest(
                    ".toggle-social-link-btn"
                );


            if (!toggleButton) {
                return;
            }


            const socialId =
                toggleButton.dataset.id;


            // =================================================
            // GET CURRENT STATUS
            // =================================================

            const {
                data: social,
                error: fetchError
            } = await supabaseClient
                .from("social_links")
                .select("is_active")
                .eq(
                    "id",
                    socialId
                )
                .single();


            if (fetchError) {

                console.error(
                    "Failed to get social link:",
                    fetchError
                );

                alert(
                    "Failed to update social media link."
                );

                return;

            }


            // =================================================
            // TOGGLE STATUS
            // =================================================

            const {
                error: updateError
            } = await supabaseClient
                .from("social_links")
                .update({

                    is_active:
                        !social.is_active,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    socialId
                );


            if (updateError) {

                console.error(
                    "Failed to update social link status:",
                    updateError
                );

                alert(
                    "Failed to update social media link."
                );

                return;

            }


            alert(
                social.is_active
                    ? "Social media link hidden successfully!"
                    : "Social media link shown successfully!"
            );


            reloadAndKeepPosition();

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

function setupLogout() {

    const logoutBtn =
        document.getElementById("logout-btn");


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        async function () {

            const { error } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout failed:",
                    error
                );

                alert(
                    "Failed to logout."
                );

                return;
            }


            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// START ADMIN DASHBOARD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }


        console.log(
            "Admin dashboard starting..."
        );


        const isLoggedIn =
            await checkAdminLogin();


        if (!isLoggedIn) {
            return;
        }


        // =================================================
        // SERVICES
        // =================================================

        await loadServiceCategories();

        await loadAdminServiceCards();


        setupFormButtons();

        setupSaveService();

        setupEditService();

        setupDeleteService();

        setupToggleService();

        setupAddServiceItem();

        setupEditServiceItem();

        setupDeleteServiceItem();


        // =================================================
        // OFFERS
        // =================================================

        await loadAdminOffers();

        setupOfferFormButtons();

        setupSaveOffer();

        setupEditOffer();

        setupDeleteOffer();

        setupToggleOffer();


        // =================================================
        // SOCIAL MEDIA
        // =================================================

        await loadSocialLinks();

        setupSocialLinkFormButtons();

        setupSaveSocialLink();

        setupEditSocialLink();

        setupDeleteSocialLink();

        setupToggleSocialLink();
        // =====================================================
        // APPOINTMENTS MANAGEMENT
        // =====================================================


        // =====================================================
        // LOAD ADMIN APPOINTMENTS
        // =====================================================

        async function loadAdminAppointments() {

            const container =
                document.getElementById("admin-appointments");

            if (!container) {
                return;
            }


            const {
                data: appointments,
                error
            } = await supabaseClient
                .from("appointments")
                .select(`
            id,
            customer_name,
            email,
            phone,
            appointment_date,
            service,
            appointment_time,
            message,
            status,
            created_at
        `)
                .order("appointment_date", {
                    ascending: true
                })
                .order("appointment_time", {
                    ascending: true
                })
                .order("id", {
                    ascending: true
                });


            if (error) {

                console.error(
                    "Failed to load appointments:",
                    error
                );

                container.innerHTML = `
            <p>Failed to load appointments.</p>
        `;

                return;
            }


            if (
                !appointments ||
                appointments.length === 0
            ) {

                container.innerHTML = `
            <p>No appointments found.</p>
        `;

                return;
            }


            container.innerHTML = "";


            appointments.forEach(function (appointment) {

                const card =
                    document.createElement("div");

                card.className =
                    "admin-appointment-card";


                const appointmentDate =
                    appointment.appointment_date
                        ? new Date(
                            appointment.appointment_date + "T00:00:00"
                        ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        })
                        : "Not set";


                const status =
                    appointment.status || "Pending";


                const message =
                    appointment.message || "No message";


                card.innerHTML = `

            <div class="admin-appointment-info">

                <h3>
                    ${escapeHTML(
                    appointment.customer_name
                )}
                </h3>


                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                    appointment.email
                )}
                </p>


                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(
                    appointment.phone
                )}
                </p>


                <p>
                    <strong>Service:</strong>
                    ${escapeHTML(
                    appointment.service
                )}
                </p>


                <p>
                    <strong>Date:</strong>
                    ${escapeHTML(
                    appointmentDate
                )}
                </p>


                <p>
                    <strong>Time:</strong>
                    ${escapeHTML(
                    appointment.appointment_time
                )}
                </p>


                <p>
                    <strong>Message:</strong>
                    ${escapeHTML(
                    message
                )}
                </p>

            </div>


            <div class="admin-appointment-actions">

                <label
                    for="appointment-status-${appointment.id}"
                >
                    Status:
                </label>


                <select
                    id="appointment-status-${appointment.id}"
                    class="appointment-status-select"
                    data-id="${appointment.id}"
                >

                    <option
                        value="Pending"
                        ${status === "Pending" ? "selected" : ""}
                    >
                        Pending
                    </option>


                    <option
                        value="Confirmed"
                        ${status === "Confirmed" ? "selected" : ""}
                    >
                        Confirmed
                    </option>


                    <option
                        value="Completed"
                        ${status === "Completed" ? "selected" : ""}
                    >
                        Completed
                    </option>


                    <option
                        value="Cancelled"
                        ${status === "Cancelled" ? "selected" : ""}
                    >
                        Cancelled
                    </option>

                </select>


                <button
                    type="button"
                    class="delete-appointment-btn"
                    data-id="${appointment.id}"
                >
                    Delete
                </button>

            </div>

        `;


                container.appendChild(card);

            });


            console.log(
                "Admin appointments loaded successfully."
            );

        }


        // =====================================================
        // UPDATE APPOINTMENT STATUS
        // =====================================================

        function setupAppointmentStatusUpdate() {

            const container =
                document.getElementById("admin-appointments");

            if (!container) {
                return;
            }


            container.addEventListener(
                "change",
                async function (event) {

                    const select =
                        event.target.closest(
                            ".appointment-status-select"
                        );


                    if (!select) {
                        return;
                    }


                    const appointmentId =
                        select.dataset.id;


                    const newStatus =
                        select.value;


                    if (!appointmentId || !newStatus) {
                        return;
                    }


                    const {
                        error
                    } = await supabaseClient
                        .from("appointments")
                        .update({
                            status: newStatus
                        })
                        .eq(
                            "id",
                            appointmentId
                        );


                    if (error) {

                        console.error(
                            "Failed to update appointment status:",
                            error
                        );

                        alert(
                            "Failed to update appointment status."
                        );

                        return;
                    }


                    alert(
                        "Appointment status updated successfully!"
                    );

                }
            );

        }


        // =====================================================
        // DELETE APPOINTMENT
        // =====================================================

        function setupDeleteAppointment() {

            const container =
                document.getElementById("admin-appointments");

            if (!container) {
                return;
            }


            container.addEventListener(
                "click",
                async function (event) {

                    const deleteButton =
                        event.target.closest(
                            ".delete-appointment-btn"
                        );


                    if (!deleteButton) {
                        return;
                    }


                    const appointmentId =
                        deleteButton.dataset.id;


                    if (!appointmentId) {
                        return;
                    }


                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this appointment?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    const {
                        error
                    } = await supabaseClient
                        .from("appointments")
                        .delete()
                        .eq(
                            "id",
                            appointmentId
                        );


                    if (error) {

                        console.error(
                            "Failed to delete appointment:",
                            error
                        );

                        alert(
                            "Failed to delete appointment."
                        );

                        return;
                    }


                    alert(
                        "Appointment deleted successfully!"
                    );


                    reloadAndKeepPosition();

                }
            );

        }
        // =================================================
        // START APPOINTMENTS
        // =================================================

        await loadAdminAppointments();

        setupAppointmentStatusUpdate();

        setupDeleteAppointment();
        // =================================================
        // RESTORE EXACT SCROLL POSITION
        // =================================================

        restoreScrollPosition();


        // =================================================
        // LOGOUT
        // =================================================

        setupLogout();


        console.log(
            "Admin dashboard initialized successfully."
        );

    }
);