// =====================================================
// CHECK IF ALREADY LOGGED IN
// =====================================================

async function checkAlreadyLoggedIn() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        window.location.href = "admin.html";

        return;
    }

}


// =====================================================
// LOGIN
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    // Check if admin is already logged in
    await checkAlreadyLoggedIn();


    const loginForm =
        document.getElementById("admin-login-form");

    const loginMessage =
        document.getElementById("login-message");


    if (!loginForm) return;


    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("admin-email")
                .value
                .trim();


        const password =
            document
                .getElementById("admin-password")
                .value;


        loginMessage.textContent =
            "Logging in...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(
                "Login failed:",
                error
            );

            loginMessage.textContent =
                error.message;

            return;
        }


        console.log(
            "Login successful:",
            data
        );


        loginMessage.textContent =
            "Login successful!";


        // Go to admin dashboard
        window.location.href =
            "admin.html";

    });

});