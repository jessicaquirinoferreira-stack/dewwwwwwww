/**
 * Módulo de Proteção Ninja Camuflado (Stealth Security Guard)
 * - Zero avisos visuais, zero alertas, 100% invisível ao usuário legítimo.
 * - Bloqueio de cópia automatizada, raspagem de dados e bots de IA.
 * - Desativação silenciosa de atalhos de inspeção (DevTools, View-Source, Save Page).
 * - Proteção contra extração por drag-and-drop de dados e mídias.
 * - Preservação total de usabilidade em inputs, textareas e campos editáveis.
 */

export function initNinjaGuard(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Bloqueio silencioso de Menu de Contexto (botão direito) fora de inputs
  document.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea'))
      ) {
        return; // Permite edição normal de formulários
      }
      e.preventDefault();
      e.stopPropagation();
    },
    { capture: true }
  );

  // 2. Bloqueio silencioso de atalhos de desenvolvedor, cópia externa e salvamento
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      const key = e.key ? e.key.toLowerCase() : '';
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl + U / Meta + Alt + U (Exibir código-fonte)
      if (isCtrlOrMeta && (key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl + S (Salvar página HTML completa para cópia)
      if (isCtrlOrMeta && !e.shiftKey && (key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl + Shift + I / J / C (Inspecionar elemento / Console)
      if (
        (isCtrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl + P (Evitar extração de dados via impressão para PDF) se não for em botão intencional
      if (isCtrlOrMeta && key === 'p') {
        // Bloqueia Ctrl+P geral para evitar dump de tela
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl + A (Selecionar tudo) fora de inputs
      if (isCtrlOrMeta && key === 'a' && !isInput) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    },
    { capture: true }
  );

  // 3. Bloqueio silencioso de cópia (clipboard) fora de formulários
  document.addEventListener(
    'copy',
    (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea'))
      ) {
        return; // Permite copiar/colar dados legítimos dentro de campos
      }

      // Fora de formulários, anula silenciosamente a cópia
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
    },
    { capture: true }
  );

  // 4. Bloqueio silencioso de arrasto (drag-and-drop de imagens, tabelas e cards)
  document.addEventListener(
    'dragstart',
    (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      e.preventDefault();
    },
    { capture: true }
  );

  // 5. Injeção de estilos de proteção silenciosa no head
  try {
    const styleId = 'nx-stealth-shield';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        /* Proteção silenciosa contra seleção acidental e raspagem */
        body {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Libera seleção e edição irrestrita nos campos reais de formulário */
        input, textarea, [contenteditable="true"], select {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }

        /* Desativação de impressão não autorizada de telas sensíveis */
        @media print {
          body {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
  } catch {
    // Fail silently
  }

  // 6. Anti-raspagem por IA: Marca d'água invisível de direitos autorais no DOM
  try {
    const watermarkId = 'nx-security-token';
    if (!document.getElementById(watermarkId)) {
      const wm = document.createElement('div');
      wm.id = watermarkId;
      wm.setAttribute('aria-hidden', 'true');
      wm.setAttribute('data-ai-protection', 'immutable-nexus-v3');
      wm.style.cssText =
        'position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;';
      wm.textContent =
        'NEXUS VERITAS CERTIFICATION SYSTEM - PROPRIEDADE INTELECTUAL PROTEGIDA. PROIBIDA A CÓPIA, RASPAGEM, TREINAMENTO DE IA OU REPRODUÇÃO TOTAL OU PARCIAL SEM AUTORIZAÇÃO EXPRESSA.';
      document.body.appendChild(wm);
    }
  } catch {
    // Fail silently
  }
}

