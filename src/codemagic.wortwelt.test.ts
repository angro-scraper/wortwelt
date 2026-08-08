import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('WortWelt Codemagic izdanje', () => {
  it('definiše odvojene Android i iOS release tokove bez tajni u repozitorijumu', () => {
    const config = readFileSync('codemagic.yaml', 'utf8');

    expect(config).toContain('android-release:');
    expect(config).toContain('./gradlew bundleRelease');
    expect(config).toContain('ios-app-store:');
    expect(config).toContain('distribution_type: app_store');
    expect(config).toContain('bundle_identifier: de.wortwelt.app');
    expect(config).not.toMatch(/(password|secret|token|private[_-]?key)\s*:/i);
  });
});
