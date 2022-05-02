import { cdk } from "projen";
import {
  addContributors,
  defaultMountainPassTypeScriptProjectOptions,
  fixTypedocVersion,
  maybeAddCommitlint,
  maybeAddCSpell,
  maybeAddExtensionRecommendations,
  maybeAddHusky,
  maybeAddJsdoc,
  maybeAddPrettier,
  maybeAddUnicorn,
} from "./src";

const name = "projen-typescript-library";

const projectOptions = Object.assign(
  {},
  defaultMountainPassTypeScriptProjectOptions,
  {
    name,
    description:
      "A customised Typescript project type with extra linting for Projen",
    peerDeps: ["projen"],
    devDeps: ["fs-extra", "@types/fs-extra"],
    keywords: ["typescript", "projen", "jsii"],
    packageName: `@mountainpass/${name}`,
    homepage: `https://github.com/mountain-pass/${name}`,
    repository: `https://github.com/mountain-pass/${name}.git`,
    repositoryUrl: `https://github.com/mountain-pass/${name}.git`,
    bugsUrl: `https://github.com/mountain-pass/${name}/issues`,
    author: "Mountain Pass",
    authorAddress: "info@mountain-pass.com.au",
    defaultReleaseBranch: "main",
  }
);
const project = new cdk.JsiiProject(projectOptions);

addContributors(project, "Tom Howard <tom@mountainpass.com.au>");

fixTypedocVersion(project);

maybeAddExtensionRecommendations(project, projectOptions);

maybeAddHusky(project, projectOptions);

maybeAddCommitlint(project, projectOptions);
maybeAddCSpell(project, projectOptions);

maybeAddUnicorn(project, projectOptions);
maybeAddJsdoc(project, projectOptions);
// prettier needs to be last of the eslint options
maybeAddPrettier(project, projectOptions);

project.synth();
