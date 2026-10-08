import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// progress.js는 file://에서도 동작하도록 일반 <script>로 로드되는 브라우저 스크립트다.
// 그래서 import 대신 vm 샌드박스에서 실행해 전역(window.CcaProgress)을 꺼내 테스트한다.
const loadProgress = async () => {
  const source = await readFile(new URL('../assets/js/progress.js', import.meta.url), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  return sandbox.window.CcaProgress;
};

const createMemoryStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
};

const createThrowingStorage = () => ({
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
});

describe('createProgressStore', () => {
  it('should report no lessons done when storage is empty', async () => {
    // Arrange
    const { createProgressStore, LESSON_IDS } = await loadProgress();
    const store = createProgressStore(createMemoryStorage());
    // Act
    const count = store.count();
    // Assert
    assert.equal(count, 0);
    assert.equal(LESSON_IDS.length, 5);
    assert.equal(store.isDone('01'), false);
  });

  it('should persist completion when a lesson is marked done', async () => {
    // Arrange
    const { createProgressStore } = await loadProgress();
    const storage = createMemoryStorage();
    // Act
    createProgressStore(storage).setDone('02', true);
    const reloaded = createProgressStore(storage);
    // Assert
    assert.equal(reloaded.isDone('02'), true);
    assert.equal(reloaded.count(), 1);
  });

  it('should clear completion when a lesson is marked not done', async () => {
    // Arrange
    const { createProgressStore } = await loadProgress();
    const store = createProgressStore(createMemoryStorage());
    store.setDone('03', true);
    // Act
    store.setDone('03', false);
    // Assert
    assert.equal(store.isDone('03'), false);
    assert.equal(store.count(), 0);
  });

  it('should ignore unknown lesson ids when marking done', async () => {
    // Arrange
    const { createProgressStore } = await loadProgress();
    const store = createProgressStore(createMemoryStorage());
    // Act
    store.setDone('99', true);
    // Assert
    assert.equal(store.count(), 0);
  });

  it('should reset all progress when reset is called', async () => {
    // Arrange
    const { createProgressStore } = await loadProgress();
    const storage = createMemoryStorage();
    const store = createProgressStore(storage);
    store.setDone('01', true);
    store.setDone('05', true);
    // Act
    store.reset();
    // Assert
    assert.equal(createProgressStore(storage).count(), 0);
  });

  it('should fall back to empty progress when stored value is corrupt', async () => {
    // Arrange
    const { createProgressStore, STORAGE_KEY } = await loadProgress();
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, '{not json');
    // Act
    const store = createProgressStore(storage);
    // Assert
    assert.equal(store.count(), 0);
  });

  it('should keep working in memory when storage throws', async () => {
    // Arrange
    const { createProgressStore } = await loadProgress();
    const store = createProgressStore(createThrowingStorage());
    // Act
    store.setDone('04', true);
    // Assert
    assert.equal(store.isDone('04'), true);
  });

  it('should keep working in memory when storage is null', async () => {
    // Arrange
    const { createProgressStore } = await loadProgress();
    const store = createProgressStore(null);
    // Act
    store.setDone('01', true);
    // Assert
    assert.equal(store.count(), 1);
  });
});
