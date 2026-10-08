/*
 * 레슨 진도 저장소.
 * file://로 직접 열어도 동작해야 하므로 ES 모듈이 아닌 일반 스크립트로 작성하고
 * window.CcaProgress 전역에 공개한다.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'cca.progress.v1';
  const LESSON_IDS = Object.freeze(['01', '02', '03', '04', '05']);

  const readSafely = (storage) => {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      if (raw === null || raw === undefined) return {};
      const parsed = JSON.parse(raw);
      return parsed !== null && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      // 사생활 보호 모드·차단된 저장소·손상된 값이어도 페이지는 정상 동작해야 한다.
      return {};
    }
  };

  const writeSafely = (storage, state) => {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // 저장 실패 시에도 현재 페이지 안에서는 메모리 상태로 계속 동작한다.
    }
  };

  /**
   * 진도 저장소를 만든다.
   *
   * @param {Storage|null} storage localStorage 호환 객체. null이면 메모리에만 보관.
   * @returns 진도 조회·변경 API
   */
  const createProgressStore = (storage) => {
    const state = readSafely(storage);

    const isDone = (id) => state[id] === true;

    const setDone = (id, done) => {
      if (!LESSON_IDS.includes(id)) return;
      if (done) {
        state[id] = true;
      } else {
        delete state[id];
      }
      writeSafely(storage, state);
    };

    const count = () => LESSON_IDS.filter(isDone).length;

    const reset = () => {
      Object.keys(state).forEach((key) => delete state[key]);
      writeSafely(storage, state);
    };

    return { isDone, setDone, count, reset };
  };

  global.CcaProgress = Object.freeze({ STORAGE_KEY, LESSON_IDS, createProgressStore });
})(window);
