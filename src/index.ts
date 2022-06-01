import {
  Recommended,
  RecommendedOptions,
} from "@mountainpass/cool-bits-for-projen";
import { NpmAccess } from "projen/lib/javascript";
import {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from "projen/lib/typescript";

export const defaultMountainPassTypeScriptProjectOptions: RecommendedOptions &
  Omit<TypeScriptProjectOptions, "name" | "repositoryUrl"> = {
  ...Recommended.defaultProjectOptions,
  defaultReleaseBranch: "main",
  projenrcTs: true,
  npmDistTag: "latest",
  npmAccess: NpmAccess.PUBLIC,
  releaseToNpm: true,
  license: "Apache-2.0",
  codeCov: true,
  prettier: true,
  docgen: true,
  eslint: true,
  eslintOptions: {
    dirs: ["."],
  },
  authorName: "Mountain Pass",
  authorEmail: "info@mountain-pass.com.au",
  authorOrganization: true,
  copyrightOwner: "Mountain Pass Pty Ltd",
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
};

/**
 * Options for Mountain Pass Typescript projects.
 */
export interface MountainPassTypeScriptProjectOptions
  extends RecommendedOptions,
    TypeScriptProjectOptions {}

/**
 * A customized TypeScript project with extra linting and Mountain Pass specific options.
 */
export class MountainPassTypeScriptProject extends TypeScriptProject {
  static defaultProjectOptions = Recommended.defaultProjectOptions;

  recommended: Recommended;
  /**
   * Create a Mountain Pass TypeScript project.
   *
   * @param options - see `MountainPassTypeScriptProjectOptions`
   */
  constructor(options: MountainPassTypeScriptProjectOptions) {
    const mergedOptions = {
      ...Recommended.defaultProjectOptions,
      ...defaultMountainPassTypeScriptProjectOptions,
      ...options,
    };

    const generatedOptions = {
      packageName: `@mountainpass/${mergedOptions.name}`,
      homepage: `https://github.com/mountain-pass/${mergedOptions.name}`,
      repository: `https://github.com/mountain-pass/${mergedOptions.name}.git`,
      repositoryUrl: `https://github.com/mountain-pass/${mergedOptions.name}.git`,
      bugsUrl: `https://github.com/mountain-pass/${mergedOptions.name}/issues`,
      readme: {
        contents: [
          `# ${mergedOptions.name}`,
          ...(mergedOptions.description ? ["", mergedOptions.description] : []),
        ].join("\n"),
      },
      ...mergedOptions,
    };
    super(generatedOptions);
    this.recommended = new Recommended(this, options);
  }
}
