import { describe, it, expect } from 'vitest';
import { AVATARS, AuthService } from '../services/supabase';
import { sounds } from '../utils/sound';

describe('GUESS THE 11 - Frontend Unit Tests', () => {
  it('Phase 2 & 4: Avatar collection has 11 unique avatars for 11 players', () => {
    expect(AVATARS.length).toBe(11);
    const ids = new Set(AVATARS.map((a) => a.id));
    expect(ids.size).toBe(11);
  });

  it('Phase 4: Guest user profile initializes correctly with persistence', () => {
    const profile = AuthService.getCurrentProfile();
    expect(profile).toBeDefined();
    expect(profile.username).toBeDefined();
    expect(profile.avatar).toBeDefined();
    expect(profile.totalScore).toBe(0);

    // Update profile
    const updated = AuthService.updateProfile({ username: 'SuperGuesser' });
    expect(updated.username).toBe('SuperGuesser');

    const retrieved = AuthService.getCurrentProfile();
    expect(retrieved.username).toBe('SuperGuesser');
  });

  it('Phase 2: Sound manager initializes and toggles audio properly', () => {
    expect(sounds.enabled).toBeDefined();
    const current = sounds.enabled;
    const toggled = sounds.toggleSound();
    expect(toggled).toBe(!current);
    // restore
    sounds.toggleSound(current);
  });
});
