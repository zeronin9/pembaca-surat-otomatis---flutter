import test from 'node:test';
import assert from 'node:assert/strict';
import { getInitialTheme, toggleThemeMode } from './theme';

test('toggleThemeMode switches between light and dark', () => {
  assert.equal(toggleThemeMode('light'), 'dark');
  assert.equal(toggleThemeMode('dark'), 'light');
});

test('getInitialTheme defaults safely to light in non-browser environment', () => {
  assert.equal(getInitialTheme(), 'light');
});
