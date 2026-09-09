import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('WortWelt Android release signing', () => {
  it('requires a local upload key and keeps its material out of Git', () => {
    const gradle = readFileSync('android/app/build.gradle', 'utf8');
    const gitignore = readFileSync('android/.gitignore', 'utf8');

    expect(gradle).toContain("Missing android/keystore.properties required for a signed release bundle.");
    expect(gradle).toContain('signingConfig signingConfigs.release');
    expect(gradle).toContain("storeFile rootProject.file(keystoreProperties['storeFile'])");
    expect(gitignore).toContain('*.keystore');
    expect(gitignore).toContain('keystore.properties');
  });

  it('targets the currently required Android API level for Play releases', () => {
    const variables = readFileSync('android/variables.gradle', 'utf8');

    expect(variables).toContain('compileSdkVersion = 36');
    expect(variables).toContain('targetSdkVersion = 36');
  });
});
