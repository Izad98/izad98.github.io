// portfolio/script.js
// This script adds interactivity to the portfolio: typing animation for the
// hero tagline, nav link highlighting based on scroll position and
// tabbed content toggles for experience/education and awards/certifications.

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Typing effect for the hero subtitle.
     * Cycles through a list of phrases, typing each out character by
     * character, pausing and then deleting before moving to the next.
     */
    const typedEl = document.getElementById('typed-text');
    const phrases = [
        'Quality Analyst',
        'Researcher & Scientist',
        'Molecular Biology Graduate'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        if (!isDeleting) {
            // Type forward
            typedEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === currentPhrase.length) {
                isDeleting = true;
                // pause before deleting
                setTimeout(type, 1500);
                return;
            }
        } else {
            // Delete backwards
            typedEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
        }
        const delay = isDeleting ? 80 : 120;
        setTimeout(type, delay);
    }
    type();

    /**
     * Highlight navigation links as the user scrolls.
     * Adds an 'active' class to the link whose target section
     * is currently in the viewport.
     */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    function activateNavLink() {
        let index = sections.length;
        while (--index >= 0) {
            const section = sections[index];
            const sectionTop = section.getBoundingClientRect().top + window.scrollY - 100;
            if (window.scrollY >= sectionTop) {
                navLinks.forEach(link => link.classList.remove('active'));
                const id = section.getAttribute('id');
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                break;
            }
        }
    }
    activateNavLink();
    window.addEventListener('scroll', activateNavLink);

    /**
     * Tabbed content toggles for sections with multiple views (experience/education,
     * awards/certifications). Buttons have a data-target attribute matching
     * the id of the content pane they should activate.
     */
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Determine target tab
            const targetId = button.getAttribute('data-target');
            const parent = button.parentElement.parentElement; // parent container containing tabs
            const tabsContainer = parent.querySelector('.tabs');
            const allTabs = tabsContainer.querySelectorAll('.tab');
            const siblingButtons = button.parentElement.querySelectorAll('.tab-button');
            // Remove active class from all buttons and tabs
            siblingButtons.forEach(btn => btn.classList.remove('active'));
            allTabs.forEach(tab => tab.classList.remove('active'));
            // Activate the clicked button and corresponding tab
            button.classList.add('active');
            const targetTab = tabsContainer.querySelector(`#${targetId}`);
            if (targetTab) targetTab.classList.add('active');
        });
    });

    /**
     * Mobile navigation toggle
     * On small screens, the nav menu is hidden off-screen and toggled via
     * the hamburger button. When the button is clicked, we toggle an
     * 'open' class on both the menu and the button itself to trigger
     * CSS transitions that slide the menu in and transform the icon
     * into a close (X) symbol. Clicking any nav link will close the menu.
     */
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        const body = document.body;
        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
            /* Prevent background scrolling when the menu is open */
            if (isOpen) {
                body.classList.add('menu-open');
            } else {
                body.classList.remove('menu-open');
            }
        });
        // Close the menu when a nav link is clicked (use event delegation)
        navMenu.addEventListener('click', (event) => {
            if (event.target.classList.contains('nav-link')) {
                navToggle.classList.remove('open');
                navMenu.classList.remove('open');
                body.classList.remove('menu-open');
            }
        });
    }
});
