import { MountainPassTypeScriptProject } from "../src";
import { synthSnapshot, mkdtemp } from "./util";

test("all required files are added", () => {
  // WHEN
  const project = new MountainPassTypeScriptProject({
    outdir: mkdtemp(),
    name: "test-project",
    repositoryUrl: `https://github.com/mountain-pass/projen-typescript-library.git`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  });

  // THEN
  const snapshot = synthSnapshot(project);

  // const outDir = project.outdir.substr(1);

  expect(Object.keys(snapshot)).toContain(".commitlintrc.json");
  expect(Object.keys(snapshot)).toContain("cspell.json");
  expect(Object.keys(snapshot)).toContain(".vscode/extensions.json");
  expect(Object.keys(snapshot)).toContain(".husky/commit-msg");
  expect(Object.keys(snapshot)).toContain(".husky/pre-commit");
});

test("works with bits turned off", () => {
  // WHEN
  const project = new MountainPassTypeScriptProject({
    outdir: mkdtemp(),
    name: "test-project",
    commitlint: false,
    husky: false,
    eslintJsdoc: false,
    eslintUnicorn: false,
    cSpell: false,
    vscodeExtensions: false,
    repositoryUrl: `https://github.com/mountain-pass/projen-typescript-library.git`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  });

  // THEN
  const snapshot = synthSnapshot(project);

  // const outDir = project.outdir.substr(1);

  expect(Object.keys(snapshot)).not.toContain(".commitlintrc.json");
  expect(Object.keys(snapshot)).not.toContain("cspell.json");
  expect(Object.keys(snapshot)).not.toContain(".vscode/extensions.json");
  expect(Object.keys(snapshot)).not.toContain(".husky/commit-msg");
  expect(Object.keys(snapshot)).not.toContain(".husky/pre-commit");
});

test("works with husky on and commitlint off", () => {
  // WHEN
  const project = new MountainPassTypeScriptProject({
    outdir: mkdtemp(),
    name: "test-project",
    commitlint: false,
    husky: true,
    eslintJsdoc: false,
    eslintUnicorn: false,
    cSpell: false,
    vscodeExtensions: false,
    repositoryUrl: `https://github.com/mountain-pass/projen-typescript-library.git`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  });

  // THEN
  const snapshot = synthSnapshot(project);

  expect(Object.keys(snapshot)).not.toContain(".commitlintrc.json");
  expect(Object.keys(snapshot)).not.toContain("cspell.json");
  expect(Object.keys(snapshot)).not.toContain(".vscode/extensions.json");
  expect(Object.keys(snapshot)).not.toContain(".husky/commit-msg");
  expect(Object.keys(snapshot)).toContain(".husky/pre-commit");
});

test("works with husky off and commitlint on", () => {
  // WHEN
  const project = new MountainPassTypeScriptProject({
    outdir: mkdtemp(),
    name: "test-project",
    commitlint: true,
    husky: false,
    eslintJsdoc: false,
    eslintUnicorn: false,
    cSpell: false,
    vscodeExtensions: false,
    repositoryUrl: `https://github.com/mountain-pass/projen-typescript-library.git`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  });

  // THEN
  const snapshot = synthSnapshot(project);

  expect(Object.keys(snapshot)).toContain(".commitlintrc.json");
  expect(Object.keys(snapshot)).not.toContain("cspell.json");
  expect(Object.keys(snapshot)).not.toContain(".vscode/extensions.json");
  expect(Object.keys(snapshot)).not.toContain(".husky/commit-msg");
  expect(Object.keys(snapshot)).not.toContain(".husky/pre-commit");
});

test("works with eslint off", () => {
  // WHEN
  const project = new MountainPassTypeScriptProject({
    outdir: mkdtemp(),
    name: "test-project",
    eslint: false,
    repositoryUrl: `https://github.com/mountain-pass/projen-typescript-library.git`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  });

  // THEN
  const snapshot = synthSnapshot(project);

  expect(Object.keys(snapshot)).toContain(".commitlintrc.json");
  expect(Object.keys(snapshot)).toContain("cspell.json");
  expect(Object.keys(snapshot)).toContain(".vscode/extensions.json");
  expect(Object.keys(snapshot)).toContain(".husky/commit-msg");
  expect(Object.keys(snapshot)).toContain(".husky/pre-commit");
});

test("can add contributors", () => {
  // WHEN
  const project = new MountainPassTypeScriptProject({
    outdir: mkdtemp(),
    name: "test-project",
    repositoryUrl: `https://github.com/mountain-pass/projen-typescript-library.git`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  });
  const contributors = [
    "Al Coholic <al@coholic.com>",
    "Oliver Klozoff <Oliver@Klozoff.com>",
  ];

  project.addContributors(...contributors);

  // THEN
  const snapshot = synthSnapshot(project);

  expect(Object.keys(snapshot)).toContain("package.json");
  expect(snapshot["package.json"].contributors).toContain(contributors[0]);
  expect(snapshot["package.json"].contributors).toContain(contributors[1]);
});

test("can add description", () => {
  const description = "this is my description";
  // WHEN
  const project = new MountainPassTypeScriptProject({
    outdir: mkdtemp(),
    name: "test-project",
    description,
    repositoryUrl: `https://github.com/mountain-pass/projen-typescript-library.git`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  });

  // THEN
  const snapshot = synthSnapshot(project);

  expect(Object.keys(snapshot)).toContain("README.md");
  expect(snapshot["README.md"]).toContain(description);
});
