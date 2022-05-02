import { MountainPassTypeScriptProject } from "./src";

const project = new MountainPassTypeScriptProject({
  defaultReleaseBranch: "main",
  name: "projen-typescript-library",
  description: "A custom Typescript projen project type with extra linting",
  peerDeps: ["projen"],
  devDeps: ["fs-extra", "@types/fs-extra"],
});

project.addContributors("Tom Howard <tom@mountainpass.com.au>");

project.synth();
