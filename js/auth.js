/* =========================================================
 * CFA — COURSE AUTH ROUTING
 * Only approved course destinations are allowed.
 * ========================================================= */

const CFA_COURSE_REDIRECTS = {
    a1: "../cours-a1.html"
    // a2: "../cours-a2.html",
    // b1: "../cours-b1.html",
    // b2: "../cours-b2.html"
};

function cfaRequestedCourse() {
    const params = new URLSearchParams(window.location.search);
    const course = params.get("course");

    return Object.prototype.hasOwnProperty.call(
        CFA_COURSE_REDIRECTS,
        course
    ) ? course : null;
}

function cfaCourseRedirectUrl() {
    const course = cfaRequestedCourse();

    if (!course) {
        return "../dashboard.html";
    }

    return CFA_COURSE_REDIRECTS[course];
}

function authMessage(text, type) {
    const box = document.getElementById("authMessage");

    if (!box) return;

    box.textContent = text;
    box.className = "auth-message " + type;
}

document.addEventListener("DOMContentLoaded", async function () {

    /*
     * Preserve the requested course when switching
     * between the login and signup pages.
     */
    const requestedCourse = cfaRequestedCourse();

    if (requestedCourse) {

        const signupLink =
            document.querySelector(
                '.auth-switch a[href="sinscrire.html"]'
            );

        if (signupLink) {
            signupLink.href =
                "sinscrire.html?course=" +
                encodeURIComponent(requestedCourse);
        }

        const loginLink =
            document.querySelector(
                '.auth-switch a[href="connexion.html"]'
            );

        if (loginLink) {
            loginLink.href =
                "connexion.html?course=" +
                encodeURIComponent(requestedCourse);
        }
    }


    /*
     * ==============================
     * CFA — SIGN UP
     * ==============================
     */

    const signup = document.getElementById("signupForm");

    if (signup) {

        signup.addEventListener("submit", async function (e) {

            e.preventDefault();

            const name =
                document.getElementById("firstName")?.value.trim() || "";

            const email =
                document.getElementById("email")?.value.trim().toLowerCase() || "";

            const password =
                document.getElementById("password")?.value || "";

            const confirm =
                document.getElementById("confirmPassword")?.value || "";

            /*
             * CFA — SHARED FIRST-NAME VALIDATION
             *
             * The authoritative validation rules live in
             * js/name-validation.js.
             */

            const nameValidation =
                window.CFANameValidation
                    ? window.CFANameValidation.validateName(name)
                    : {
                        valid: false,
                        value: "",
                        message: "La validation du prénom est indisponible."
                    };

            if (!nameValidation.valid) {
                authMessage(
                    nameValidation.message,
                    "error"
                );
                return;
            }

            const normalizedName =
                nameValidation.value;

            if (!email || !password || !confirm) {
                authMessage(
                    "Veuillez remplir tous les champs.",
                    "error"
                );
                return;
            }

            if (password.length < 6) {
                authMessage(
                    "Le mot de passe doit contenir au moins 6 caractères.",
                    "error"
                );
                return;
            }

            if (password !== confirm) {
                authMessage(
                    "Les mots de passe ne correspondent pas.",
                    "error"
                );
                return;
            }

            authMessage(
                "Création de votre compte...",
                "success"
            );

            try {

                /*
                 * Preserve the requested course through
                 * Supabase's email-confirmation link.
                 */
                const requestedCourse =
                    cfaRequestedCourse();

                const confirmationUrl =
                    new URL(
                        "/cfa-links/pages/connexion.html",
                        window.location.origin
                    );

                confirmationUrl.searchParams.set(
                    "verification",
                    "success"
                );

                if (requestedCourse) {
                    confirmationUrl.searchParams.set(
                        "course",
                        requestedCourse
                    );
                }

                const { data, error } =
                    await cfaSupabase.auth.signUp({

                        email: email,

                        password: password,

                        options: {
                            data: {
                                first_name: normalizedName
                            },

                            emailRedirectTo:
                                confirmationUrl.toString()
                        }
                    });

                if (error) {
                    throw error;
                }

                /*
                 * Supabase may return a user with
                 * an empty session when email confirmation
                 * is enabled.
                 */

                if (data.user && !data.session) {

                    authMessage(
                        "Compte créé ! Consultez votre e-mail pour confirmer votre adresse.",
                        "success"
                    );

                    return;
                }

                authMessage(
                    "Compte créé avec succès !",
                    "success"
                );

                setTimeout(function () {

                    /*
                     * If signup was started from a course,
                     * open that course after successful signup.
                     *
                     * Otherwise preserve the normal signup
                     * destination.
                     */
                    const signupCourse =
                        cfaRequestedCourse();

                    window.location.href =
                        signupCourse
                            ? cfaCourseRedirectUrl()
                            : "espace-etudiant.html";

                }, 800);

            } catch (error) {

                console.error("CFA signup error:", error);

                console.error("CFA signup error details:", {
                    message: error.message,
                    code: error.code,
                    status: error.status,
                    name: error.name
                });

                authMessage(
                    error.message ||
                    "Impossible de créer le compte.",
                    "error"
                );
            }

        });
    }


    /*
     * ==============================
     * CFA — LOGIN
     * ==============================
     */

    const login = document.getElementById("loginForm");

    if (login) {

        login.addEventListener("submit", async function (e) {

            e.preventDefault();

            const email =
                document.getElementById("email")?.value.trim().toLowerCase() || "";

            const password =
                document.getElementById("password")?.value || "";

            if (!email || !password) {

                authMessage(
                    "Veuillez saisir votre e-mail et votre mot de passe.",
                    "error"
                );

                return;
            }

            authMessage(
                "Connexion en cours...",
                "success"
            );

            try {

                const { data, error } =
                    await cfaSupabase.auth.signInWithPassword({

                        email: email,
                        password: password

                    });

                if (error) {
                    throw error;
                }

                if (!data.user) {

                    authMessage(
                        "Connexion impossible.",
                        "error"
                    );

                    return;
                }

                // Vérification obligatoire de l'adresse e-mail
                if (!data.user.email_confirmed_at) {

                    await cfaSupabase.auth.signOut({ scope: "local" });

                    authMessage(
                        "Votre adresse e-mail n'est pas encore vérifiée. Consultez votre boîte de réception et cliquez sur le lien de confirmation.",
                        "error"
                    );

                    return;
                }

                authMessage(
                    "Connexion réussie !",
                    "success"
                );

                setTimeout(function () {

                    window.location.href =
                        cfaCourseRedirectUrl();

                }, 500);

            } catch (error) {

                console.error("CFA login error:", error);

                authMessage(
                    "Erreur : " + (error?.message || "Connexion impossible."),
                    "error"
                );

                console.error("SUPABASE LOGIN ERROR:", {
                    message: error?.message,
                    status: error?.status,
                    code: error?.code
                });
            }

        });
    }


    /*
     * ==============================
     * CFA — ACCOUNT AREA
     * ==============================
     */

    const area =
        document.getElementById("accountArea");

    if (area) {

        try {

            const {
                data: { user }
            } = await cfaSupabase.auth.getUser();

            if (user) {

                const name =
                    user.user_metadata?.first_name ||
                    "Apprenant";

                area.innerHTML =
                    '<span class="user-welcome">Bonjour, ' +
                    name +
                    '</span>' +
                    '<button class="logout-btn" id="logoutBtn">' +
                    'Déconnexion' +
                    '</button>';

                const logoutBtn =
                    document.getElementById("logoutBtn");

                if (logoutBtn) {

                    logoutBtn.addEventListener(
                        "click",
                        async function () {

                            await cfaSupabase.auth.signOut();

                            window.location.reload();

                        }
                    );
                }
            }

        } catch (error) {

            console.error(
                "CFA account error:",
                error
            );
        }
    }


    /*
     * ==============================
     * CFA — UNIVERSAL PASSWORD TOGGLE
     * ==============================
     */

    const passwordToggles =
        document.querySelectorAll("[data-password-toggle], #togglePassword");

    passwordToggles.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            const field =
                button.closest(
                    ".password-wrap, .password-wrapper"
                )?.querySelector("input");

            if (!field) return;

            const visible = field.type === "text";

            field.type = visible ? "password" : "text";

            button.textContent = "👁️";

            button.setAttribute(
                "aria-label",
                visible
                    ? "Afficher le mot de passe"
                    : "Masquer le mot de passe"
            );

        });

    });

});
