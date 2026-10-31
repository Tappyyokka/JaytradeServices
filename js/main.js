
/* =========================================
   INDIPAY - MAIN JAVASCRIPT
   Frontend only. No backend or user storage.
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       1. HERO CAROUSEL
    ===================================== */

    const slides = Array.from(
        document.querySelectorAll(".hero-slide")
    );

    const dots = Array.from(
        document.querySelectorAll(".hero-dots .dot")
    );

    const previousButton = document.querySelector(".hero-prev");
    const nextButton = document.querySelector(".hero-next");
    const carousel = document.querySelector(".hero-banner");

    let currentSlide = Math.max(
        0,
        slides.findIndex(slide => slide.classList.contains("active"))
    );

    let carouselTimer = null;

    function showSlide(index) {
        if (!slides.length) return;

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === currentSlide);
            slide.setAttribute(
                "aria-hidden",
                i === currentSlide ? "false" : "true"
            );
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("selected", i === currentSlide);

            if (i === currentSlide) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    function stopCarousel() {
        if (carouselTimer !== null) {
            clearInterval(carouselTimer);
            carouselTimer = null;
        }
    }

    function startCarousel() {
        stopCarousel();

        if (slides.length < 2) return;

        // Respect the visitor's reduced-motion preference.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        carouselTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    if (slides.length) {
        showSlide(currentSlide);
        startCarousel();
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            showSlide(currentSlide - 1);
            startCarousel();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            showSlide(currentSlide + 1);
            startCarousel();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            startCarousel();
        });
    });

    // Pause automatic movement while the visitor reads.
    if (carousel) {
        carousel.addEventListener("mouseenter", stopCarousel);
        carousel.addEventListener("mouseleave", startCarousel);

        carousel.addEventListener("focusin", stopCarousel);
        carousel.addEventListener("focusout", event => {
            if (!carousel.contains(event.relatedTarget)) {
                startCarousel();
            }
        });
    }


    /* =====================================
       2. PROFILE DROPDOWN
    ===================================== */

    const profileDropdowns = document.querySelectorAll(
        ".profile-dropdown"
    );

    function closeProfileDropdown(dropdown) {
        const trigger = dropdown.querySelector(".profile-trigger");
        const menu = dropdown.querySelector(".profile-menu");

        dropdown.classList.remove("open");

        if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
        }

        if (menu) {
            menu.hidden = true;
        }
    }

    function openProfileDropdown(dropdown) {
        const trigger = dropdown.querySelector(".profile-trigger");
        const menu = dropdown.querySelector(".profile-menu");

        dropdown.classList.add("open");

        if (trigger) {
            trigger.setAttribute("aria-expanded", "true");
        }

        if (menu) {
            menu.hidden = false;
        }
    }

    profileDropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector(".profile-trigger");
        const menu = dropdown.querySelector(".profile-menu");

        if (!trigger || !menu) return;

        // Start closed.
        closeProfileDropdown(dropdown);

        trigger.addEventListener("click", event => {
            event.stopPropagation();

            const isOpen = dropdown.classList.contains("open");

            // Close other profile menus first.
            profileDropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    closeProfileDropdown(otherDropdown);
                }
            });

            if (isOpen) {
                closeProfileDropdown(dropdown);
            } else {
                openProfileDropdown(dropdown);
            }
        });

        menu.addEventListener("click", event => {
            event.stopPropagation();
        });
    });

    document.addEventListener("click", () => {
        profileDropdowns.forEach(closeProfileDropdown);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            profileDropdowns.forEach(dropdown => {
                const trigger = dropdown.querySelector(".profile-trigger");
                const wasOpen = dropdown.classList.contains("open");

                closeProfileDropdown(dropdown);

                if (wasOpen && trigger) {
                    trigger.focus();
                }
            });
        }
    });


    /* =====================================
       3. MOBILE NAVIGATION
    ===================================== */

    const menuButton = document.querySelector(".menu-button");
    const mainNav = document.querySelector(".main-nav");

    if (menuButton && mainNav) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");

        menuButton.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("nav-open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );

            const icon = menuButton.querySelector("i");

            if (icon) {
                icon.classList.toggle("bi-list", !isOpen);
                icon.classList.toggle("bi-x-lg", isOpen);
            }
        });

        mainNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("nav-open");
                menuButton.setAttribute("aria-expanded", "false");

                const icon = menuButton.querySelector("i");

                if (icon) {
                    icon.classList.add("bi-list");
                    icon.classList.remove("bi-x-lg");
                }
            });
        });
    }


    /* =====================================
       4. SHOW / HIDE PASSWORD
    ===================================== */

    document.querySelectorAll(".password-toggle").forEach(button => {
        const inputId = button.dataset.password;
        const passwordInput = document.getElementById(inputId);

        if (!passwordInput) return;

        button.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";

            button.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );

            const icon = button.querySelector("i");

            if (icon) {
                icon.classList.toggle("bi-eye", !isPassword);
                icon.classList.toggle("bi-eye-slash", isPassword);
            }
        });
    });


    /* =====================================
       5. LOGIN FORM - FRONTEND DEMO
    ===================================== */

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();

            if (!loginForm.reportValidity()) return;

            showDemoMessage(
                loginForm,
                "The login interface is working! Real authentication will be added with the backend."
            );
        });
    }


    /* =====================================
       6. REGISTRATION FORM - FRONTEND DEMO
    ===================================== */

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", event => {
            event.preventDefault();

            if (!registerForm.reportValidity()) return;

            const password = document.getElementById(
                "register-password"
            );

            const confirmPassword = document.getElementById(
                "register-confirm-password"
            );

            if (password && confirmPassword &&
                password.value !== confirmPassword.value) {

                confirmPassword.setCustomValidity(
                    "The passwords do not match."
                );

                confirmPassword.reportValidity();
                confirmPassword.addEventListener(
                    "input",
                    () => confirmPassword.setCustomValidity(""),
                    { once: true }
                );

                return;
            }

            showDemoMessage(
                registerForm,
                "Your registration form looks good! Account creation and data storage will be added with the backend."
            );
        });
    }


    /* =====================================
       7. DEMO MESSAGE
    ===================================== */

    function showDemoMessage(form, message) {
        let notice = form.querySelector(".demo-result");

        if (!notice) {
            notice = document.createElement("div");
            notice.className = "demo-result";
            notice.setAttribute("role", "status");
            notice.setAttribute("aria-live", "polite");

            form.appendChild(notice);
        }

        notice.textContent = message;
        notice.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    /* =====================================
       8. PLACEHOLDER SERVICE LINKS
    ===================================== */

    document.querySelectorAll(
        '.service-item[href="#"], .see-more[href="#"]'
    ).forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            const originalText = link.dataset.originalText ||
                link.textContent.trim();

            link.dataset.originalText = originalText;

            showDemoMessageForLink(
                link,
                "This service page will be added in a future development step."
            );
        });
    });

    function showDemoMessageForLink(link, message) {
        let notice = document.getElementById("service-demo-notice");

        if (!notice) {
            notice = document.createElement("div");
            notice.id = "service-demo-notice";
            notice.className = "service-demo-notice";
            notice.setAttribute("role", "status");

            document.body.appendChild(notice);
        }

        notice.textContent = message;
        notice.classList.add("visible");

        clearTimeout(notice.hideTimer);

        notice.hideTimer = setTimeout(() => {
            notice.classList.remove("visible");
        }, 3000);
    }

});
