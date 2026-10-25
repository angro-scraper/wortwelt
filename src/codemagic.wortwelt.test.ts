import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('WortWelt Codemagic iOS izdanje', () => {
  it('definiše samo iOS release tok bez tajni u repozitorijumu', () => {
    const config = readFileSync('codemagic.yaml', 'utf8');

    expect(config).not.toContain('android-release:');
    expect(config).toContain('ios-app-store:');
    expect(config).toContain('distribution_type: app_store');
    expect(config).toContain('bundle_identifier: de.wortwelt.app');
    expect(config).toContain('VITE_COMMERCE_ENABLED: "true"');
    expect(config).toContain('build/ios/ipa/*.ipa');
    expect(config).toContain('app_store_connect: Sacuvaj Hranu App Store Connect');
    expect(config).toContain('auth: integration');
    expect(config).not.toMatch(/(password|secret|token|private[_-]?key)\s*:/i);
  });

  it('deklarise da iOS paket ne koristi neizuzetu sopstvenu enkripciju', () => {
    const infoPlist = readFileSync('ios/App/App/Info.plist', 'utf8');
    const project = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8');

    expect(infoPlist).toContain('<key>ITSAppUsesNonExemptEncryption</key>');
    expect(infoPlist).toContain('<false/>');
    expect(project.match(/CURRENT_PROJECT_VERSION = 7;/g)).toHaveLength(2);
    expect(project).not.toContain('CURRENT_PROJECT_VERSION = 6;');
    expect(project.match(/MARKETING_VERSION = 1.2;/g)).toHaveLength(2);
    expect(project).toContain('IPHONEOS_DEPLOYMENT_TARGET = 15.0;');
  });

  it('automatski gradi samo odobrenu WortWelt granu, bez neproverene prijave na pregled', () => {
    const config = readFileSync('codemagic.yaml', 'utf8');
    expect(config).toContain('triggering:');
    expect(config).toContain('- push');
    expect(config).toContain('pattern: codex/autonomous-stabilization/wortwelt-subscription-links-20260913');
    expect(config).toContain('submit_to_app_store: false');
    expect(config).not.toContain('cancel_previous_builds: true');
  });
});
