import { isUUID } from '../utils/is-uuid';

describe('isUUID', () => {
  it('returns true for a valid UUID v4', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('returns true for uppercase UUID', () => {
    expect(isUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('returns true for mixed-case UUID', () => {
    expect(isUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isUUID('')).toBe(false);
  });

  it('returns false for a random string', () => {
    expect(isUUID('not-a-uuid')).toBe(false);
  });

  it('returns false for UUID missing hyphens', () => {
    expect(isUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('returns false for UUID with extra characters', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
  });

  it('returns false for too-short UUID', () => {
    expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false);
  });

  it('returns false for UUID with invalid characters', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
  });
});
