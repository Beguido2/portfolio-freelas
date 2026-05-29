const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const modeButtons = document.querySelectorAll('.mode-btn');
const modeDescription = document.querySelector('.mode-description');

if (menuToggle && navLinks) {
    function closeMenu() {
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
    }

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        navLinks.classList.toggle('active');
    });

    navItems.forEach((item) => {
        item.addEventListener('click', closeMenu);
    });
}

modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const selectedMode = button.dataset.mode;

        document.body.classList.toggle('old-mode', selectedMode === 'old');
        document.body.classList.toggle('modern-mode', selectedMode === 'modern');

        if (modeDescription) {
            modeDescription.textContent =
                selectedMode === 'old'
                    ? 'Você está vendo a versão antiga propositalmente ruim.'
                    : 'Você está vendo a versão moderna reformulada.';
        }

        modeButtons.forEach((item) => {
            item.classList.toggle('active', item === button);
        });
    });
});