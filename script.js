// ==========================================
// 1. CONFIGURAÇÃO DO LENIS (SCROLL SUAVE)
// ==========================================
const lenis = new Lenis({
    duration: 1.2, 
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ==========================================
// 2. CONTROLE DE SCROLL: LUZ, OVERLAY, MÃOS E ESTRELAS
// ==========================================
const greenLight = document.getElementById('green-light');
const darkOverlay = document.getElementById('dark-overlay');
const heroContent = document.getElementById('hero-content');
const touchExplosion = document.getElementById('touch-explosion');
const handLeft = document.getElementById('hand-left');
const handRight = document.getElementById('hand-right');
const bg = document.getElementById('hero-bg');
const trees = document.getElementById('foreground-trees');
const whiteStars = document.getElementById('white-stars');
const greenStars = document.getElementById('green-stars');

// --- Navbar: highlight da seção ativa ---
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('header[id], section[id]');

function updateActiveNav(scrollY) {
    let currentId = '';
    sections.forEach(section => {
        const top = section.offsetTop - window.innerHeight * 0.4;
        if (scrollY >= top) {
            currentId = section.id;
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentId) {
            link.classList.add('active');
        }
    });
}

lenis.on('scroll', (e) => {
    let scrollY = e.scroll; 
    let windowH = window.innerHeight;

    // --- Navbar scrolled + active ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }
    updateActiveNav(scrollY);

    // --- 1. Efeito de Explosão do Texto (KAZUO) ---
    if (scrollY > windowH * 0.5) {
        if (heroContent) heroContent.classList.add('explode-out');
    } else {
        if (heroContent) heroContent.classList.remove('explode-out');
    }

    // --- 2. Escurecimento do Fundo ---
    let darkness = (scrollY - (windowH * 0.8)) / (windowH * 0.5);
    if (darkOverlay) {
        darkOverlay.style.opacity = Math.max(0, Math.min(darkness, 1));
    }

    // --- 3. Transição de Estrelas Brancas para Verdes ---
    if (whiteStars) {
        let wOpacity = (scrollY - (windowH * 0.8)) / (windowH * 0.5);
        whiteStars.style.opacity = Math.max(0, Math.min(wOpacity, 1));
    }
    
    if (greenStars) {
        let gOpacity = (scrollY - (windowH * 1.6)) / (windowH * 0.8);
        greenStars.style.opacity = Math.max(0, Math.min(gOpacity, 1));
    }

    // --- 4. Efeito das Mãos (Parallax Dinâmico) ---
    if (handLeft && handRight) {
        let handProgress = Math.min(scrollY / windowH, 1);
        let handOffset = ((window.innerWidth / 2) * (1 - handProgress));
        let handScale = 0.5 + (handProgress * 0.5);

        handLeft.style.transform = `translateX(${-handOffset}px) scale(${handScale})`;
        handRight.style.transform = `translateX(${handOffset}px) scale(${handScale})`;

    if (handProgress >= 1) {
            handLeft.classList.add('glow-active');
            handRight.classList.add('glow-active');

            if (touchExplosion && !touchExplosion.dataset.fired) {
                touchExplosion.dataset.fired = 'true';
                touchExplosion.classList.add('active');
                setTimeout(() => touchExplosion.classList.remove('active'), 1000);
            }
        } else {
            handLeft.classList.remove('glow-active');
            handRight.classList.remove('glow-active');
            // Reseta a flag se voltar ao topo
            if (touchExplosion) {
                touchExplosion.classList.remove('active');
                delete touchExplosion.dataset.fired;
            }
        }
    }

    // --- 5. Lógica da Luz Verde (Descendo e Circulando até o Fim) ---
    const footerExplosion = document.getElementById('footer-explosion');
    
    if (scrollY >= windowH * 0.95) { 
        // 5.1 Clarão do toque no início
        
        // 5.2 Lógica da luz circulando por toda a página
        if (greenLight) {
            greenLight.style.opacity = 1;
            
            // maxScroll é a distância total de rolagem possível do documento
            let maxScroll = document.body.scrollHeight - window.innerHeight;
            // Progresso de 0 (após o hero) a 1 (final da página)
            let scrollProgress = (scrollY - windowH) / (maxScroll - windowH);
            scrollProgress = Math.max(0, Math.min(scrollProgress, 1));
            
            // A luz desce acompanhando a altura da tela, ficando sempre em visão
            let descendY = scrollProgress * windowH; 
            
            // A luz faz um movimento circular horizontal suave (espiral)
            // Aumentamos o multiplicador para ela ter mais amplitude na tela
            let swayX = Math.sin(scrollY * 0.005) * (window.innerWidth * 0.35); 
            
            greenLight.style.transform = `translate(calc(-50% + ${swayX}px), ${descendY}px)`;

            // 5.3 Explosão Final no Rodapé (Quando o progresso for maior que 98%)
            if (scrollProgress >= 0.98) {
                if (footerExplosion && !footerExplosion.classList.contains('explode')) {
                    footerExplosion.classList.add('explode');
                }
                // Oculta o orbe da luz verde pra destacar só a explosão
                greenLight.style.opacity = 0; 
            } else {
                if (footerExplosion) footerExplosion.classList.remove('explode');
            }
        }
    } else {
        // Reseta tudo se voltar pro topo do Hero
        if (touchExplosion) touchExplosion.classList.remove('active');
        if (greenLight) {
            greenLight.style.opacity = 0;
            greenLight.style.transform = `translate(-50%, 0px)`;
        }
        if (footerExplosion) footerExplosion.classList.remove('explode');
    }

    // --- 6. Parallax de Fundo (Árvores e BG) ---
    if (bg) bg.style.transform = `scale(${1 + scrollY * 0.0003})`;
    if (trees) trees.style.transform = `scale(${1 + scrollY * 0.004})`;
});

// ==========================================
// 3. PRELOADER, ESTRELAS E INICIALIZAÇÃO
// ==========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    
    // Gerador de Estrelas Dinâmico (Brancas e Verdes)
    function createStars(containerId, count, className) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            let star = document.createElement('div');
            star.classList.add('star', className);
            star.style.left = Math.random() * 100 + 'vw';
            star.style.top = Math.random() * 100 + 'vh';
            let size = Math.random() * 2 + 1; // Tamanho entre 1 e 3px
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            
            // Animação de cintilação via JS
            star.animate([
                { opacity: 0.2, transform: 'scale(0.8)' },
                { opacity: 1, transform: 'scale(1.3)' }
            ], {
                duration: Math.random() * 3000 + 1500, // Duração aleatória
                direction: 'alternate',
                iterations: Infinity,
                delay: Math.random() * 5000 // Atraso aleatório no início
            });
            
            container.appendChild(star);
        }
    }

    // Cria 120 estrelas brancas e 80 estrelas verdes
    createStars('white-stars', 120, 'white');
    createStars('green-stars', 80, 'green');

// Preloader temático
    const preloaderText = document.getElementById('preloader-text');
    const preloaderBar = document.getElementById('preloader-bar');
    const messages = [
        'INICIALIZANDO SITE',
        'CARREGANDO DADOS',
        'ATIVANDO INFORMAÇÕES',
        'TUDO PRONTO!'
    ];
    let msgIndex = 0;
    let charIndex = 0;
    let progress = 0;

    function typePreloader() {
        if (msgIndex >= messages.length) {
        if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 800);
            }
            const heroContent = document.getElementById('hero-content');
            if (heroContent) {
                setTimeout(() => {
                    heroContent.style.transition = 'opacity 1s ease';
                    heroContent.style.opacity = '1';
                }, 400);
            }   
            return;
        }
        const msg = messages[msgIndex];
        if (charIndex <= msg.length) {
            if (preloaderText) preloaderText.textContent = msg.slice(0, charIndex);
            charIndex++;
            progress = ((msgIndex * msg.length + charIndex) / messages.reduce((a, m) => a + m.length, 0)) * 100;
            if (preloaderBar) preloaderBar.style.width = Math.min(progress, 100) + '%';
            setTimeout(typePreloader, 40);
        } else {
            msgIndex++;
            charIndex = 0;
            setTimeout(typePreloader, 300);
        }
    }
    setTimeout(typePreloader, 300);
});

// ==========================================
// 4. LÓGICA DAS ERAS (TERMINAL, DECODE, IA)
// ==========================================

// --- Terminal (Era 1) ---
const rawText = `Com 25 anos de atuação na área de Tecnologia da Informação, acompanhei de perto a rápida evolução do hardware, software e infraestrutura de redes.

Minha jornada começou na base da computação corporativa, compreendendo a fundo a lógica e a arquitetura dos primeiros sistemas ERP.

No início da carreira, atuei diretamente com tecnologias clássicas e robustas, lidando com sistemas desenvolvidos em Clipper e COBOL.

Foi nessa época de "tela preta" que consolidei minha base técnica, dominando o MS-DOS, os comandos do CMD e a automação de processos através de scripts em Batch — uma fundação sólida que forjou minha mentalidade analítica e de resolução de problemas.`;

function typeWriter(element, htmlText, speed) {
    let i = 0; let isTag = false; let text = "";
    function type() {
        if (i < htmlText.length) {
            let char = htmlText.charAt(i);
            text += char;
            if (char === '<') isTag = true;
            if (char === '>') isTag = false;
            element.innerHTML = text;
            i++;
            setTimeout(type, isTag ? 0 : speed + (Math.random() * 5));
        }
    }
    type();
}

// --- Decode Effect (Era 2) ---
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
function runDecodeEffect(element) {
    let iterations = 0;
    const originalText = element.getAttribute('data-value');
    if (!originalText || element.classList.contains('decoded')) return;
    element.classList.add('decoded');

    const interval = setInterval(() => {
        element.innerText = originalText.split("").map((letter, index) => {
            if (letter === " ") return " ";
            if (index < iterations) return originalText[index];
            return letters[Math.floor(Math.random() * letters.length)];
        }).join("");
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1/3; 
    }, 5);
}

// --- IA Synthesis (Era 3) ---
const aiTextParts = [
    "Hoje, vivo a integração total com a Inteligência Artificial.",
    "Utilizo Python, Node.js e React para criar soluções avançadas.",
    "A IA tornou-se o meu braço direito na criação de agentes de IA, automação e exploração de novas tecnologias."
];
const techKeywords = ["inteligência", "artificial.", "python,", "node.js", "react", "ia", "agentes de IA", "automação"];

function runAiSynthesis(container) {
    if (!container || container.classList.contains('synthesized')) return;
    container.classList.add('synthesized');
    container.innerHTML = ""; 
    let allWordSpans = [];

    aiTextParts.forEach(text => {
        let p = document.createElement('p');
        p.style.marginBottom = "15px";
        text.split(" ").forEach(word => {
            let span = document.createElement('span');
            span.className = "ai-word";
            span.innerHTML = word + " ";
            if (techKeywords.includes(word.toLowerCase())) span.classList.add('highlight-tech');
            p.appendChild(span);
            allWordSpans.push(span);
        });
        container.appendChild(p);
    });

    let current = 0;
    const interval = setInterval(() => {
        if (current >= allWordSpans.length) return clearInterval(interval);
        allWordSpans[current].classList.add('glow-in');
        current++;
    }, 50);
}

// ==========================================
// 5. INTERSECTION OBSERVER (GATILHOS)
// ==========================================
const observerOptions = { threshold: 0.25 };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add('show');

            // Gatilho Terminal — dispara pelo container filho
            if (target.classList.contains('terminal-container')) {
                const txt = document.getElementById('typewriter-text');
                if (txt && !txt.hasChildNodes()) typeWriter(txt, rawText, 15);
            }
            // Gatilho Decode — dispara pela glass-panel filha
            if (target.classList.contains('glass-panel')) {
                target.querySelectorAll('.decode-text').forEach(el => runDecodeEffect(el));
            }
            // Gatilho IA — dispara pelo ai-hud-container filho
            if (target.classList.contains('ai-hud-container')) {
                const box = document.getElementById('ai-synthesis-box');
                runAiSynthesis(box);
            }
            // Gatilho Rosto Matrix
            if (target.id === 'matrix-face') {
                target.classList.add('face-show');
            }
            
            observer.unobserve(target);
        }
    });
}, observerOptions);

// Observa os elementos com hidden (os filhos com animação) + matrix-face
document.querySelectorAll('.hidden, #matrix-face').forEach(el => {
    observer.observe(el);
});

// ==========================================
// 6. CURSOR PERSONALIZADO
// ==========================================
const cursor = document.getElementById('custom-cursor');
const trail = document.getElementById('cursor-trail');

document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top  = e.clientY + 'px';
    }
    if (trail) {
        trail.style.left = e.clientX + 'px';
        trail.style.top  = e.clientY + 'px';
    }
});

document.addEventListener('mousedown', () => {
    if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
});
document.addEventListener('mouseup', () => {
    if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1)';
});

// Expande o cursor sobre links e botões
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            cursor.style.background = 'rgba(0,255,204,0.3)';
            cursor.style.border = '1px solid #00ffcc';
        }
    });
    el.addEventListener('mouseleave', () => {
        if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.background = '#00ffcc';
            cursor.style.border = 'none';
        }
    });
});

// ==========================================
// 7. LOGOS DE TECNOLOGIA (DESCEM COM A LUZ)
// ==========================================
const techLogos = document.querySelectorAll('.tech-logo');

// Posições horizontais fixas espalhadas pela tela
const logoPositions = [8, 22, 38, 62, 78, 92];

techLogos.forEach((logo, i) => {
    logo.style.left = logoPositions[i] + '%';
});

function updateTechLogos(scrollY, windowH) {
    const maxScroll = document.body.scrollHeight - windowH;
    // Começa junto com a luz (após o hero)
    const scrollProgress = (scrollY - windowH) / (maxScroll - windowH);

    // Seção do biometria (rosto Matrix) — posição aproximada
    const bioSection = document.getElementById('biometria');
    const bioTop = bioSection ? bioSection.offsetTop : windowH * 4;
    const bioProgress = (scrollY - windowH) / (bioTop - windowH);

    if (scrollY < windowH * 0.95) {
        // Antes da luz aparecer — oculta tudo
        techLogos.forEach(logo => {
            logo.classList.remove('visible', 'fadeout');
        });
        return;
    }

    if (bioProgress >= 0.85) {
        // Chegou perto do rosto — desaparece
        techLogos.forEach(logo => {
            logo.classList.remove('visible');
            logo.classList.add('fadeout');
        });
        return;
    }

    // Desce junto com a luz — cada logo com leve defasagem vertical
    techLogos.forEach((logo, i) => {
        const delay = i * 0.06;
        const adjustedProgress = Math.max(0, scrollProgress - delay);
        const topPercent = adjustedProgress * 90; // desce até 90% da tela
        logo.style.top = topPercent + '%';
        logo.classList.add('visible');
        logo.classList.remove('fadeout');
    });
}

// Integra com o scroll do Lenis já existente
lenis.on('scroll', (e) => {
    updateTechLogos(e.scroll, window.innerHeight);
});