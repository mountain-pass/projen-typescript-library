import {
  Recommended,
  Organisational,
  CodeOfConduct,
  GitHubber,
  NpmReleaser,
} from "@mountainpass/cool-bits-for-projen";
import { cdk } from "projen";
import { NpmAccess } from "projen/lib/javascript";
import { MountainPassTypeScriptProject } from "./src";

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
  ...MountainPassTypeScriptProject.defaultProjectOptions,
  description:
    "A customised Typescript project type with extra linting for Projen",
  peerDeps: ["projen"],
  devDeps: ["fs-extra", "@types/fs-extra"],
  deps: ["@mountainpass/cool-bits-for-projen"],
  keywords: ["typescript", "projen", "jsii"],
  defaultReleaseBranch: "main",
  projenrcTs: true,
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
