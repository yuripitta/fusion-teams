/* ============================================================
   FUSION TEAMS — Plano Operacional
   Interatividade e Animações
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── FADE-UP OBSERVER ── */
  const fadeEls = document.querySelectorAll('.fade-up');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => fadeObserver.observe(el));


  /* ── NAVIGATION: scroll shrink + active ── */
  const nav = document.getElementById('nav');
  const sections = document.querySelectorAll('section[id]');

  const onScroll = () => {
    // shrink nav on scroll
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(17,17,24,0.97)';
    } else {
      nav.style.background = 'rgba(17,17,24,0.92)';
    }

    // active nav link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 80;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      }
    });

    // scroll-to-top button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ── ACTIVE NAV LINK STYLE ── */
  const style = document.createElement('style');
  style.textContent = `.nav-links a.active { color: #fff; background: rgba(232,112,90,0.15); }`;
  document.head.appendChild(style);


  /* ── HAMBURGER MENU ── */
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '60px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'rgba(17,17,24,0.98)';
      navLinks.style.padding = '1rem 2rem';
      navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
      if (isOpen) navLinks.style.display = 'none';
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          navLinks.style.display = 'none';
        }
      });
    });
  }


  /* ── KPI TABS ── */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const content = document.getElementById('tab-' + target);
      if (content) content.classList.add('active');
    });
  });


  /* ── PROCESS STEPS: Interactive Expand ── */
  buildProcessFlow();


  /* ── SCROLL TO TOP ── */
  const scrollTopBtn = createScrollTopButton();
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── EXPORTAR PDF ── */
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      // 1. Tornar todos os fade-up visíveis
      document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));

      // 2. Guardar aba ativa dos KPIs e mostrar todas
      const activeTab = document.querySelector('.tab-content.active');
      const activeTabId = activeTab ? activeTab.id : null;
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'block');

      // 3. Gerar visão de processo exclusiva para PDF
      const printProcess = buildPrintProcessView();

      // 4. Imprimir após DOM estabilizar
      setTimeout(() => {
        window.print();

        // 5. Restaurar estado da web após impressão
        if (printProcess) printProcess.remove();
        document.querySelectorAll('.tab-content').forEach(c => {
          c.style.display = '';
          c.classList.remove('active');
        });
        if (activeTabId) {
          const el = document.getElementById(activeTabId);
          if (el) el.classList.add('active');
        }
      }, 300);
    });
  }


  /* ── SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── TOOLTIP for sync badges ── */
  document.querySelectorAll('.sync-badge').forEach(badge => {
    badge.addEventListener('mouseenter', (e) => {
      showTooltip(e.target, 'Ponto de alinhamento com stakeholders e liderança operacional');
    });
    badge.addEventListener('mouseleave', () => hideTooltip());
  });

});


/* ── DADOS DAS ETAPAS (escopo global para reuso no PDF) ── */
const PROCESS_STEPS = [
  {
    num: '01',
    name: 'Mapeamento',
    desc: 'Imersão nas operações com reuniões de mapeamento de processos, dores e oportunidades. Entrevistas em campo e análise de dados reais.',
    items: ['Jornadas operacionais ponta a ponta', 'Identificação de gargalos e perdas', 'Benchmarks e referências setoriais'],
    output: 'Mapa de oportunidades priorizado',
    success: false
  },
  {
    num: '02',
    name: 'Priorização',
    desc: 'Priorização das oportunidades com base em impacto operacional, esforço e alinhamento estratégico. Decisão coletiva com o time.',
    items: ['Matriz impacto vs. esforço', 'Alinhamento com liderança', 'Definição do escopo do sprint'],
    output: 'Backlog priorizado do time',
    success: false,
    sync: true
  },
  {
    num: '03',
    name: 'Ideação',
    desc: 'Co-criação de ideias de soluções com o time multidisciplinar e especialistas de campo. Protótipos rápidos e validação de hipóteses.',
    items: ['Workshops de co-criação', 'Prototipação de baixa fidelidade', 'Validação de hipóteses com usuários'],
    output: 'Conceito de solução validado',
    success: false
  },
  {
    num: '04',
    name: 'Desenvolvimento MVP',
    desc: 'Ciclo de desenvolvimento do MVP com sprints curtos e feedback constante dos operadores de campo. Iterações rápidas até validação.',
    items: ['Sprints de 2 semanas', 'Testes em ambiente controlado', 'Ajustes contínuos com o SME'],
    output: 'MVP funcional em campo',
    success: false,
    sync: true
  },
  {
    num: '05',
    name: 'Go Live MVP',
    desc: 'Go live, testes da solução em produção e medição de resultados reais. Preparação para escala ou novo ciclo de iteração.',
    items: ['Lançamento em escala piloto', 'Monitoramento de KPIs operacionais', 'Documentação e transferência de conhecimento'],
    output: 'Solução em produção + aprendizados',
    success: true
  }
];

/* ── BUILD PROCESS FLOW ── */
function buildProcessFlow() {
  const processSection = document.getElementById('processo');
  if (!processSection) return;

  const oldFlow = processSection.querySelector('.process-flow');
  if (!oldFlow) return;

  const steps = PROCESS_STEPS;

  const container = document.createElement('div');
  container.className = 'process-flow-wrapper';

  // Top: visual circles flow
  const topFlow = document.createElement('div');
  topFlow.className = 'process-circles';
  topFlow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 2.5rem;
    overflow-x: auto;
    padding: 1rem 0;
  `;

  steps.forEach((step, i) => {
    // Circle
    const circle = document.createElement('button');
    circle.className = 'step-circle-btn';
    circle.dataset.step = i;
    circle.setAttribute('aria-label', `Ver etapa ${step.name}`);
    circle.style.cssText = `
      flex-shrink: 0;
      width: 110px; height: 110px;
      background: ${step.success ? 'linear-gradient(135deg, #E8705A 0%, #C94040 100%)' : '#E8705A'};
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 20px rgba(232,112,90,0.3);
      cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease, outline 0.15s ease;
      text-align: center;
      padding: 0.5rem;
      border: none;
      outline: 3px solid transparent;
      outline-offset: 3px;
      position: relative;
    `;

    const label = document.createElement('span');
    label.style.cssText = 'font-size: 0.62rem; font-weight: 600; opacity: 0.75; letter-spacing: 0.05em; display: block;';
    label.textContent = step.num;

    const name = document.createElement('span');
    name.style.cssText = 'font-size: 0.76rem; font-weight: 700; line-height: 1.2; display: block; margin-top: 2px;';
    name.textContent = step.name;

    circle.appendChild(label);
    circle.appendChild(name);

    if (step.sync) {
      const syncDot = document.createElement('div');
      syncDot.title = 'Ponto de sincronização';
      syncDot.style.cssText = `
        position: absolute;
        top: -8px; right: -4px;
        width: 22px; height: 22px;
        background: #5B9BD5;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.65rem;
        color: #fff;
        font-weight: 700;
        border: 2px solid #fff;
      `;
      syncDot.textContent = '⟳';
      circle.appendChild(syncDot);
    }

    circle.addEventListener('mouseenter', () => {
      circle.style.transform = 'scale(1.08) translateY(-3px)';
      circle.style.boxShadow = '0 10px 36px rgba(232,112,90,0.5)';
    });
    circle.addEventListener('mouseleave', () => {
      if (!circle.classList.contains('step-active')) {
        circle.style.transform = 'scale(1) translateY(0)';
        circle.style.boxShadow = '0 4px 20px rgba(232,112,90,0.3)';
      }
    });

    circle.addEventListener('click', () => {
      toggleStepCard(i, steps, container);
      // style active
      topFlow.querySelectorAll('.step-circle-btn').forEach((c, idx) => {
        if (idx === i) {
          c.style.outline = '3px solid rgba(232,112,90,0.6)';
          c.style.transform = 'scale(1.06) translateY(-3px)';
          c.classList.add('step-active');
        } else {
          c.style.outline = '3px solid transparent';
          c.style.transform = 'scale(1) translateY(0)';
          c.style.boxShadow = '0 4px 20px rgba(232,112,90,0.3)';
          c.classList.remove('step-active');
        }
      });
    });

    topFlow.appendChild(circle);

    // Arrow between
    if (i < steps.length - 1) {
      const arrow = document.createElement('div');
      arrow.style.cssText = `
        flex-shrink: 0;
        display: flex;
        align-items: center;
        color: rgba(232,112,90,0.4);
        padding: 0 4px;
      `;
      arrow.innerHTML = `<svg width="36" height="12" viewBox="0 0 40 12" fill="none"><path d="M0 6 L32 6 M28 2 L36 6 L28 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      topFlow.appendChild(arrow);
    }
  });

  // Bottom: step detail cards (initially hidden)
  const cardArea = document.createElement('div');
  cardArea.id = 'stepCardArea';
  cardArea.style.cssText = 'margin-top: 0; transition: all 0.3s ease;';

  container.appendChild(topFlow);
  container.appendChild(cardArea);

  // Reutilizar a legend já existente no HTML, apenas atualizar o texto
  const existingLegend = processSection.querySelector('.process-legend');
  if (existingLegend) {
    existingLegend.innerHTML = `
      <div class="legend-item"><div class="legend-dot legend-coral"></div>Clique em uma etapa para ver detalhes</div>
      <div class="legend-item"><div class="legend-dot legend-sync"></div>Ponto de sincronização com stakeholders</div>
    `;
    // Garantir visibilidade (o observer pode não tê-la capturado ainda)
    existingLegend.classList.remove('fade-up', 'delay-2');
    existingLegend.style.opacity = '1';
    existingLegend.style.transform = 'none';
  }

  oldFlow.replaceWith(container);

  // Garantir visibilidade do container inserido dinamicamente
  requestAnimationFrame(() => {
    container.style.opacity = '1';
    container.style.transform = 'none';
  });

  // Auto-open first step
  setTimeout(() => {
    const firstBtn = topFlow.querySelector('.step-circle-btn');
    if (firstBtn) {
      firstBtn.click();
    }
  }, 100);
}


function toggleStepCard(index, steps, container) {
  const cardArea = document.getElementById('stepCardArea');
  if (!cardArea) return;

  const step = steps[index];
  const currentIndex = cardArea.dataset.openIndex;

  if (currentIndex == index) {
    cardArea.style.opacity = '0';
    setTimeout(() => { cardArea.innerHTML = ''; cardArea.style.opacity = '1'; }, 250);
    delete cardArea.dataset.openIndex;
    return;
  }

  cardArea.dataset.openIndex = index;
  cardArea.style.opacity = '0';

  setTimeout(() => {
    cardArea.innerHTML = `
      <div style="
        background: #fff;
        border: 1px solid #E8E8EF;
        border-top: 3px solid #E8705A;
        border-radius: 12px;
        padding: 2rem 2.5rem;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 2rem;
        box-shadow: 0 6px 24px rgba(0,0,0,0.08);
      ">
        <div>
          <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#E8705A;margin-bottom:0.5rem;">Etapa ${step.num}</div>
          <h4 style="font-size:1.2rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:0.75rem;color:#1A1A2E;">${step.name}</h4>
          <p style="font-size:0.88rem;color:#6B6B80;line-height:1.7;">${step.desc}</p>
        </div>
        <div>
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B6B80;margin-bottom:0.75rem;">Atividades</div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:0.5rem;">
            ${step.items.map(item => `
              <li style="font-size:0.85rem;color:#1A1A2E;padding-left:1rem;position:relative;line-height:1.5;">
                <span style="position:absolute;left:0;color:#E8705A;font-weight:700;">·</span>
                ${item}
              </li>
            `).join('')}
          </ul>
        </div>
        <div>
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B6B80;margin-bottom:0.75rem;">Saída Esperada</div>
          <div style="
            padding:1rem 1.25rem;
            background:${step.success ? 'rgba(76,175,125,0.1)' : '#FDF0ED'};
            border-radius:8px;
            border-left:3px solid ${step.success ? '#4CAF7D' : '#E8705A'};
            font-size:0.88rem;
            font-weight:600;
            color:${step.success ? '#2E7D5C' : '#C9573F'};
            line-height:1.5;
          ">${step.output}</div>
          ${step.sync ? `
          <div style="margin-top:1rem;padding:0.75rem 1rem;background:rgba(91,155,213,0.1);border-radius:8px;border-left:3px solid #5B9BD5;font-size:0.8rem;color:#3A74A8;font-weight:500;">
            ⟳ Ponto de sincronização com stakeholders ao final desta etapa
          </div>` : ''}
        </div>
      </div>
    `;
    cardArea.style.opacity = '1';
    cardArea.style.transition = 'opacity 0.25s ease';
  }, 200);
}


/* ── VISÃO DE PROCESSO EXCLUSIVA PARA PDF ── */
function buildPrintProcessView() {
  const processSection = document.getElementById('processo');
  if (!processSection) return null;

  const old = document.getElementById('print-process-all');
  if (old) old.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'print-process-all';
  wrapper.className = 'print-only';

  PROCESS_STEPS.forEach((step) => {
    const row = document.createElement('div');
    row.className = 'print-step-row';
    row.innerHTML = `
      <div class="print-step-left">
        <div class="print-step-circle ${step.success ? 'print-step-circle--last' : ''}">
          <span class="print-step-num">${step.num}</span>
          <span class="print-step-name">${step.name}</span>
        </div>
        ${step.sync ? '<div class="print-sync-note">⟳ Sync com stakeholders</div>' : ''}
      </div>
      <div class="print-step-right">
        <h4 class="print-step-title">${step.name}</h4>
        <p class="print-step-desc">${step.desc}</p>
        <ul class="print-step-items">
          ${step.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <div class="print-step-output ${step.success ? 'print-step-output--success' : ''}">
          → ${step.output}
        </div>
      </div>
    `;
    wrapper.appendChild(row);
  });

  const flowWrapper = processSection.querySelector('.process-flow-wrapper');
  if (flowWrapper) {
    flowWrapper.after(wrapper);
  } else {
    processSection.querySelector('.container').appendChild(wrapper);
  }

  return wrapper;
}


/* ── SCROLL TO TOP BUTTON ── */
function createScrollTopButton() {
  const btn = document.createElement('button');
  btn.id = 'scrollTopBtn';
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Voltar ao topo');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);
  return btn;
}


/* ── TOOLTIP ── */
let tooltip = null;

function showTooltip(target, text) {
  hideTooltip();
  tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(17,17,24,0.95);
    color: rgba(255,255,255,0.9);
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.5rem 0.9rem;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    pointer-events: none;
    z-index: 200;
    max-width: 260px;
    line-height: 1.4;
    white-space: normal;
    border: 1px solid rgba(255,255,255,0.1);
  `;
  tooltip.textContent = text;
  document.body.appendChild(tooltip);

  const rect = target.getBoundingClientRect();
  tooltip.style.top = (rect.bottom + 8) + 'px';
  tooltip.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
}

function hideTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}


/* ── NUMBER COUNTER ANIMATION ── */
function animateCounters() {
  // Triggered on first visibility of KPI section
  const kpiSection = document.getElementById('kpis');
  if (!kpiSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(kpiSection);
}

animateCounters();


/* ── PROGRESS BAR: reading indicator ── */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 60px; left: 0;
  height: 2px;
  background: linear-gradient(90deg, #E8705A, #C94040);
  width: 0%;
  z-index: 101;
  transition: width 0.1s ease;
  pointer-events: none;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';
}, { passive: true });
