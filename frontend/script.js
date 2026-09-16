// ========================================
// RESPIRA
// Main JavaScript
// ========================================


// ========================================
// LOGIN PAGE
// ========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    // -------------------------------
    // Password visibility
    // -------------------------------

    const togglePassword =
        document.getElementById("togglePassword");

    const passwordInput =
        document.getElementById("password");


    if (togglePassword && passwordInput) {

        togglePassword.addEventListener(
            "click",
            function () {

                if (passwordInput.type === "password") {

                    passwordInput.type = "text";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    passwordInput.type = "password";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }
// -------------------------------
// Login form
// -------------------------------

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;


        if (email === "" || password === "") {

            alert(
                "Please enter your email and password."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


           if (data.success) {

                // Save logged-in user information
                localStorage.setItem(
                    "respiraUser",
                    JSON.stringify(data.user)
                );

                alert("Login successful!");

                window.location.href =
                    "dashboard.html";

            } else {

                alert(data.message);

            }


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                "Unable to connect to the Respira server."
            );

        }

    }
);

    // -------------------------------
    // Forgot Password
    // -------------------------------

    const forgotPassword =
        document.getElementById("forgotPassword");


    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                alert(
                    "Password reset functionality will be added soon."
                );

            }
        );

    }


    // -------------------------------
    // Register navigation
    // -------------------------------

    const registerLink =
        document.getElementById("registerLink");


    if (registerLink) {

        registerLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "register.html";

            }
        );

    }

}


// ========================================
// REGISTER PAGE
// ========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    // -------------------------------
    // Register password visibility
    // -------------------------------

    const toggleRegisterPassword =
        document.getElementById(
            "toggleRegisterPassword"
        );

    const registerPassword =
        document.getElementById(
            "registerPassword"
        );


    if (
        toggleRegisterPassword &&
        registerPassword
    ) {

        toggleRegisterPassword.addEventListener(
            "click",
            function () {

                if (
                    registerPassword.type ===
                    "password"
                ) {

                    registerPassword.type =
                        "text";

                    toggleRegisterPassword.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    registerPassword.type =
                        "password";

                    toggleRegisterPassword.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }
// -------------------------------
// Register form
// -------------------------------

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const fullName =
            document.getElementById("fullName")
                .value
                .trim();

        const email =
            document.getElementById("registerEmail")
                .value
                .trim();

        const password =
            document.getElementById("registerPassword")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;


        // Check empty fields

        if (
            fullName === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === ""
        ) {

            alert(
                "Please fill in all fields."
            );

            return;

        }


        // Check password length

        if (password.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;

        }


        // Check passwords

        if (password !== confirmPassword) {

            alert(
                "Passwords do not match."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            fullName: fullName,
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    "Account created successfully!"
                );

                window.location.href =
                    "index.html";

            } else {

                alert(
                    data.message
                );

            }


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            alert(
                "Unable to connect to the Respira server."
            );

        }

    }
);

    // -------------------------------
    // Confirm password visibility
    // -------------------------------

    const toggleConfirmPassword =
        document.getElementById(
            "toggleConfirmPassword"
        );

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );


    if (
        toggleConfirmPassword &&
        confirmPassword
    ) {

        toggleConfirmPassword.addEventListener(
            "click",
            function () {

                if (
                    confirmPassword.type ===
                    "password"
                ) {

                    confirmPassword.type =
                        "text";

                    toggleConfirmPassword.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    confirmPassword.type =
                        "password";

                    toggleConfirmPassword.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }

}
// ========================================
// CHANGE PASSWORD - PROFILE PAGE
// ========================================

const changePasswordButton =
    document.getElementById("changePasswordButton");

const changePasswordModal =
    document.getElementById("changePasswordModal");

const cancelPasswordButton =
    document.getElementById("cancelPasswordButton");

const savePasswordButton =
    document.getElementById("savePasswordButton");


// Only run this code if the Profile page
// contains the Change Password elements

if (
    changePasswordButton &&
    changePasswordModal &&
    cancelPasswordButton &&
    savePasswordButton
) {

    // -------------------------------
    // Open Change Password
    // -------------------------------

    changePasswordButton.addEventListener(
        "click",
        function () {

            changePasswordModal.style.display =
                "flex";

        }
    );


    // -------------------------------
    // Cancel
    // -------------------------------

    cancelPasswordButton.addEventListener(
        "click",
        function () {

            changePasswordModal.style.display =
                "none";

            document.getElementById(
                "currentPassword"
            ).value = "";

            document.getElementById(
                "newPassword"
            ).value = "";

            document.getElementById(
                "confirmNewPassword"
            ).value = "";

        }
    );


    // -------------------------------
    // Update Password
    // -------------------------------

    savePasswordButton.addEventListener(
        "click",
        async function () {

            const currentPassword =
                document.getElementById(
                    "currentPassword"
                ).value;

            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;

            const confirmNewPassword =
                document.getElementById(
                    "confirmNewPassword"
                ).value;


            // Check empty fields

            if (
                currentPassword === "" ||
                newPassword === "" ||
                confirmNewPassword === ""
            ) {

                alert(
                    "Please fill in all password fields."
                );

                return;

            }


            // Minimum password length

            if (newPassword.length < 6) {

                alert(
                    "New password must contain at least 6 characters."
                );

                return;

            }


            // Check new passwords

            if (
                newPassword !==
                confirmNewPassword
            ) {

                alert(
                    "New passwords do not match."
                );

                return;

            }


            // Get logged-in user

            const savedUser =
                localStorage.getItem(
                    "respiraUser"
                );


            if (!savedUser) {

                alert(
                    "Please login again."
                );

                window.location.href =
                    "index.html";

                return;

            }


            const user =
                JSON.parse(savedUser);


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/change-password",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email:
                                    user.email,

                                currentPassword:
                                    currentPassword,

                                newPassword:
                                    newPassword

                            })

                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    alert(
                        "Password changed successfully!"
                    );


                    changePasswordModal.style.display =
                        "none";


                    document.getElementById(
                        "currentPassword"
                    ).value = "";

                    document.getElementById(
                        "newPassword"
                    ).value = "";

                    document.getElementById(
                        "confirmNewPassword"
                    ).value = "";


                } else {

                    alert(
                        data.message
                    );

                }


            } catch (error) {

                console.error(
                    "Change password error:",
                    error
                );

                alert(
                    "Unable to connect to the Respira server."
                );

            }

        }
    );

}