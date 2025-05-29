import { execa } from 'execa';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';

let tgz: string;

beforeAll(async () => {
  const { stdout } = await execa('npm', ['pack'], {
    cwd: join(__dirname, '..'),
  });
  tgz = join(__dirname, '..', stdout.trim());
});

describe.concurrent(
  'git-broom CLI',
  {
    // It can fail due to npm used concurrently.
    retry: 2,
  },
  () => {
    test('removes untracked files with a question', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      writeFileSync(join(dir, 'foo.txt'), 'foo');

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, input: 'y\n', reject: false, all: true },
      );

      expect(result.all).toContain(
        'The above untracked files would be deleted. Continue? (y/n) ',
      );
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(dir, 'foo.txt'))).toBe(false);
      expect(result.all).toContain('-e /_local -e /.idea');
    });

    test('does not ask questions if there are no untracked files', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      const file = join(dir, 'tracked.txt');
      writeFileSync(file, 'keep');
      await execa('git', ['add', file], { cwd: dir });

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, reject: false, all: true },
      );

      expect(result.all).not.toContain('Continue?');
      expect(result.exitCode).toBe(0);
      expect(existsSync(file)).toBe(true);
    });

    test('removes gitignored files', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      writeFileSync(join(dir, '.gitignore'), 'secret.txt\n');
      await execa('git', ['add', '.gitignore'], { cwd: dir });
      writeFileSync(join(dir, 'secret.txt'), 'secret');

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, reject: false, all: true },
      );

      expect(result.all).not.toContain('Continue?');
      expect(existsSync(join(dir, 'secret.txt'))).toBe(false);
    });

    test('respects .gitbroomignore', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      writeFileSync(join(dir, 'foo.txt'), 'foo');
      writeFileSync(join(dir, '.gitignore'), 'foo.txt\n');
      await execa('git', ['add', '.gitignore'], { cwd: dir });
      writeFileSync(join(dir, '.gitbroomignore'), 'foo.txt\n');
      await execa('git', ['add', '.gitbroomignore'], { cwd: dir });

      await execa('npx', ['-y', '-p', `file:${tgz}`, 'git-broom'], {
        cwd: dir,
        reject: false,
        all: true,
      });

      expect(existsSync(join(dir, 'foo.txt'))).toBe(true);
    });

    test('excludes /_local and /.idea by default', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      const dir1 = join(dir, '_local');
      const dir2 = join(dir, '.idea');
      mkdirSync(join(dir1, 'subdir'), { recursive: true });
      mkdirSync(join(dir2, 'subdir'), { recursive: true });
      writeFileSync(join(dir1, 'file.txt'), 'foo');
      writeFileSync(join(dir2, 'file.txt'), 'foo');
      writeFileSync(join(dir, '.gitignore'), '_local\n.idea\n');
      await execa('git', ['add', '.gitignore'], { cwd: dir });

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, reject: false, all: true },
      );

      expect(result.exitCode).toBe(0);
      expect(existsSync(dir1)).toBe(true);
      expect(existsSync(dir2)).toBe(true);
    });

    test('does not exclude /_local and /.idea if .gitbroomignore exists', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      const dir1 = join(dir, '_local');
      const dir2 = join(dir, '.idea');
      mkdirSync(join(dir1, 'subdir'), { recursive: true });
      mkdirSync(join(dir2, 'subdir'), { recursive: true });
      writeFileSync(join(dir1, 'file.txt'), 'foo');
      writeFileSync(join(dir2, 'file.txt'), 'foo');
      writeFileSync(join(dir, '.gitignore'), '_local\n.idea\n');
      await execa('git', ['add', '.gitignore'], { cwd: dir });
      writeFileSync(join(dir, '.gitbroomignore'), '');
      await execa('git', ['add', '.gitbroomignore'], { cwd: dir });

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, reject: false, all: true },
      );

      expect(result.exitCode).toBe(0);
      expect(existsSync(dir1)).toBe(false);
      expect(existsSync(dir2)).toBe(false);
    });

    test('prints error message when failing', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, reject: false, all: true },
      );

      expect(result.exitCode).not.toBe(0);
      expect(result.all).toContain('^ The above command failed');
    });

    test('aborts when user declines', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      writeFileSync(join(dir, 'foo.txt'), 'foo');

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, input: 'Please nooooo!!!\n', reject: false, all: true },
      );

      expect(result.exitCode).toBe(1);
      expect(result.all).toContain('Aborting.');
      expect(existsSync(join(dir, 'foo.txt'))).toBe(true);
    });

    test('empty .gitbroomignore triggers full clean without default excludes', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      writeFileSync(join(dir, 'foo.txt'), 'foo');
      mkdirSync(join(dir, '_local'), { recursive: true });
      writeFileSync(join(dir, '_local/file.txt'), 'a');
      mkdirSync(join(dir, '.idea'), { recursive: true });
      writeFileSync(join(dir, '.idea/file.txt'), 'b');
      writeFileSync(join(dir, '.gitbroomignore'), '');
      await execa('git', ['add', '.gitbroomignore'], { cwd: dir });

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, input: 'y\n', reject: false, all: true },
      );

      expect(result.exitCode).toBe(0);
      expect(result.all).toContain('git clean -dxff');
      expect(result.all).not.toContain('-e');
      expect(existsSync(join(dir, 'foo.txt'))).toBe(false);
      expect(existsSync(join(dir, '_local'))).toBe(false);
      expect(existsSync(join(dir, '.idea'))).toBe(false);
    });

    test('ignores comments in .gitbroomignore', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'gitbroom-'));
      await execa('git', ['init'], { cwd: dir });
      await execa('git', ['commit', '--allow-empty', '-m', 'init'], {
        cwd: dir,
      });
      ['foo', 'bar', 'baz'].forEach((name) => {
        const d = join(dir, name);
        mkdirSync(d, { recursive: true });
        writeFileSync(join(d, 'file.txt'), 'x');
      });
      const ignoreContent = `
foo/
# comment line
bar

baz
`;
      writeFileSync(join(dir, '.gitbroomignore'), ignoreContent, 'utf8');
      await execa('git', ['add', '.gitbroomignore'], { cwd: dir });

      const result = await execa(
        'npx',
        ['-y', '-p', `file:${tgz}`, 'git-broom'],
        { cwd: dir, input: 'y\n', reject: false, all: true },
      );

      expect(result.all).toContain('-e foo/');
      expect(result.all).toContain('-e bar');
      expect(result.all).toContain('-e baz');
      expect(result.all).not.toContain('# comment');
      expect(result.all).not.toContain('-e /_local');
      expect(existsSync(join(dir, 'foo'))).toBe(true);
      expect(existsSync(join(dir, 'bar'))).toBe(true);
      expect(existsSync(join(dir, 'baz'))).toBe(true);
    });
  },
);
