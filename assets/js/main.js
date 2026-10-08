/*
 * 공통 UI 동작: 테마, 모바일 내비, 복사 버튼, 탭, 진도 표시, 터미널 데모 재생.
 * file://에서도 동작하도록 일반 스크립트로 작성한다. progress.js를 먼저 로드해야 한다.
 */
(function () {
  'use strict';

  const THEME_KEY = 'cca.theme';
  const COPIED_LABEL = '복사됨 ✓';
  const COPY_LABEL = '복사';
  const COPIED_RESET_MS = 1600;
  const DONE_LABEL = '✓ 완료했어요';
  const TODO_LABEL = '이 레슨을 완료했어요';

  const getStorage = () => {
    try {
      return window.localStorage;
    } catch (e) {
      // 저장소 접근 자체가 막힌 환경 — 진도·테마는 메모리로만 유지된다.
      return null;
    }
  };

  const storage = getStorage();
  const progress = window.CcaProgress?.createProgressStore(storage) ?? null;

  /* ---------- 테마 ---------- */
  const initTheme = () => {
    const root = document.documentElement;
    try {
      const saved = storage?.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
    } catch (e) {
      // 저장된 테마를 못 읽으면 시스템 설정을 따른다.
    }

    const button = document.querySelector('[data-theme-toggle]');
    if (button === null) return;

    const isDark = () =>
      root.dataset.theme === 'dark' ||
      (root.dataset.theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const render = () => {
      button.textContent = isDark() ? '☀︎' : '☾';
      button.setAttribute('aria-label', isDark() ? '밝은 화면으로 전환' : '어두운 화면으로 전환');
    };

    button.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        storage?.setItem(THEME_KEY, next);
      } catch (e) {
        // 저장 실패해도 현재 페이지에는 적용된다.
      }
      render();
    });
    render();
  };

  /* ---------- 모바일 내비 ---------- */
  const initNav = () => {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('.site-nav');
    if (toggle === null || nav === null) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  };

  /* ---------- 복사 버튼 ---------- */
  const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // file:// 등 Clipboard API가 없는 환경용 대체 경로
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  };

  const initCopy = () => {
    document.querySelectorAll('.code').forEach((block) => {
      const pre = block.querySelector('pre');
      if (pre === null) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-btn';
      button.textContent = COPY_LABEL;
      button.addEventListener('click', async () => {
        try {
          await copyText(pre.innerText.trim());
          button.textContent = COPIED_LABEL;
          button.classList.add('is-copied');
        } catch (e) {
          button.textContent = '직접 선택해 복사하세요';
        }
        window.setTimeout(() => {
          button.textContent = COPY_LABEL;
          button.classList.remove('is-copied');
        }, COPIED_RESET_MS);
      });
      block.appendChild(button);
    });
  };

  /* ---------- 탭 ---------- */
  const initTabs = () => {
    document.querySelectorAll('.tabs').forEach((tabs) => {
      const buttons = Array.from(tabs.querySelectorAll('[role="tab"]'));
      const select = (target) => {
        buttons.forEach((b) => {
          const isSelected = b === target;
          b.setAttribute('aria-selected', String(isSelected));
          b.tabIndex = isSelected ? 0 : -1;
          const panel = document.getElementById(b.getAttribute('aria-controls') ?? '');
          if (panel !== null) panel.hidden = !isSelected;
        });
      };

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => select(button));
        button.addEventListener('keydown', (event) => {
          const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (step === 0) return;
          const next = buttons[(index + step + buttons.length) % buttons.length];
          next.focus();
          select(next);
        });
      });

      // 사용자 OS에 맞는 탭을 먼저 보여준다.
      const isMac = /Mac|iPhone|iPad/.test(navigator.platform ?? '');
      const preferred = buttons.find((b) => b.dataset.os === (isMac ? 'mac' : 'windows'));
      if (preferred !== undefined) select(preferred);
    });
  };

  /* ---------- 진도 ---------- */
  const renderRoadmap = () => {
    if (progress === null) return;
    document.querySelectorAll('[data-lesson-item]').forEach((item) => {
      const isDone = progress.isDone(item.dataset.lessonItem ?? '');
      item.classList.toggle('is-done', isDone);
      const meta = item.querySelector('.roadmap-meta');
      if (meta !== null) meta.textContent = isDone ? '✓ 완료' : meta.dataset.default ?? '';
    });

    const total = window.CcaProgress.LESSON_IDS.length;
    const done = progress.count();
    document.querySelectorAll('[data-progress-text]').forEach((el) => {
      el.textContent = `${done} / ${total} 레슨 완료`;
    });
    document.querySelectorAll('[data-progress-fill]').forEach((el) => {
      el.style.width = `${Math.round((done / total) * 100)}%`;
    });
  };

  const initProgress = () => {
    if (progress === null) return;

    document.querySelectorAll('[data-complete]').forEach((button) => {
      const id = button.dataset.complete ?? '';
      const render = () => {
        const isDone = progress.isDone(id);
        button.setAttribute('aria-pressed', String(isDone));
        button.textContent = isDone ? DONE_LABEL : TODO_LABEL;
      };
      button.addEventListener('click', () => {
        progress.setDone(id, !progress.isDone(id));
        render();
      });
      render();
    });

    document.querySelectorAll('[data-progress-reset]').forEach((button) => {
      button.addEventListener('click', () => {
        progress.reset();
        renderRoadmap();
      });
    });

    renderRoadmap();
  };

  /* ---------- 터미널 데모 ---------- */
  const initTerminal = () => {
    document.querySelectorAll('.term[data-animate]').forEach((term) => {
      term.querySelectorAll('.term-line').forEach((line, index) => {
        line.style.setProperty('--i', String(index));
      });

      const replay = term.querySelector('[data-term-replay]');
      replay?.addEventListener('click', () => {
        // 애니메이션 재시작: 속성을 제거하고 리플로우 후 다시 붙인다.
        term.removeAttribute('data-animate');
        void term.offsetWidth;
        term.setAttribute('data-animate', '');
      });
    });
  };

  const initPrint = () => {
    document.querySelectorAll('[data-print]').forEach((button) => {
      button.addEventListener('click', () => window.print());
    });
  };

  initTheme();
  initNav();
  initPrint();
  initCopy();
  initTabs();
  initProgress();
  initTerminal();
})();
