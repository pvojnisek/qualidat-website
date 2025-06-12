// Add some interactive animations
        document.addEventListener('DOMContentLoaded', function() {
            // Animate stats on scroll
            const statNumbers = document.querySelectorAll('.stat-number');

            const animateStats = () => {
                statNumbers.forEach(stat => {
                    const rect = stat.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        if (!stat.classList.contains('animated')) {
                            stat.classList.add('animated');
                            const finalValue = parseFloat(stat.textContent);
                            let currentValue = 0;
                            const increment = finalValue / 50;

                            const timer = setInterval(() => {
                                currentValue += increment;
                                if (currentValue >= finalValue) {
                                    currentValue = finalValue;
                                    clearInterval(timer);
                                }
                                stat.textContent = Math.floor(currentValue * 10) / 10;
                            }, 20);
                        }
                    }
                });
            };

            window.addEventListener('scroll', animateStats);
            animateStats(); // Run once on load

            // Add hover effects to cards
            const cards = document.querySelectorAll('.match-card, .fact-card, .stat-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                });

                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });

            // Collapsible functionality
            const collapsibles = document.querySelectorAll('.collapsible');
            collapsibles.forEach(collapsible => {
                collapsible.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const content = this.nextElementSibling;
                    content.classList.toggle('active');
                });
            });
        });
