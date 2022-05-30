import {
  Recommended,
  Organisational,
  CodeOfConduct,
  GitHubber,
  NpmReleaser,
} from "@mountainpass/cool-bits-for-projen";
import { cdk } from "projen";
import { NpmAccess } from "projen/lib/javascript";
import { defaultMountainPassTypeScriptProjectOptions } from "./src";

const gitHubber = new GitHubber({
  name: "projen-typescript-library",
  username: "mountain-pass",
});

const npmReleaser = new NpmReleaser(gitHubber, {
  scope: "mountainpass",
  access: NpmAccess.PUBLIC,
});

const organisational = new Organisational({
  organisation: {
    name: "Mountain Pass",
    email: "info@mountain-pass.com.au",
    url: "https://mountain-pass.com.au",
  },
});

const project = new cdk.JsiiProject({
  ...gitHubber.jsiiProjectOptions(),
  ...organisational.jsiiProjectOptions(),
  ...npmReleaser.nodeProjectOptions(),
  ...Recommended.defaultProjectOptions,
  ...defaultMountainPassTypeScriptProjectOptions,
  description:
    "A customised Typescript project type with extra linting for Projen",
  peerDeps: ["projen"],
  devDeps: ["fs-extra", "@types/fs-extra"],
  deps: ["@mountainpass/cool-bits-for-projen"],
  keywords: ["typescript", "projen", "jsii"],
  defaultReleaseBranch: "main",
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
  projenrcTs: true,
  license: "Apache-2.0",
  codeCov: true,
  buildWorkflowTriggers: {
    pullRequest: {},
    workflowDispatch: {},
    push: { branches: ["main"] },
  },
  docgen: true,
  eslintOptions: {
    dirs: ["."],
  },
  dependabot: true,
  dependabotOptions: {
    labels: ["auto-approve"],
  },
  jestOptions: {
    jestConfig: {
      coverageThreshold: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ["dependabot[bot]"],
    label: "auto-approve",
    secret: "GITHUB_TOKEN",
  },
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: [
          "build",
          "chore",
          "ci",
          "docs",
          "feat",
          "fix",
          "perf",
          "refactor",
          "revert",
          "style",
          "test",
        ],
      },
    },
  },
});
organisational.addToProject(project);

const recommended = new Recommended(project, {
  cSpellOptions: {
    language: "en-GB",
    ignorePaths: ["./API.md"],
  },
});

gitHubber.addToProject(project);
gitHubber.addDependencies({ cSpell: recommended.cSpell });
npmReleaser.addToProject(project);

new CodeOfConduct(
  project,
  { contactMethod: "tom@mountain-pass.com.au" },
  { cSpell: recommended.cSpell }
);

project.addGitIgnore("/docs");

project.synth();
