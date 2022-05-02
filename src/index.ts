import { JsonFile, ObjectFile, SampleFile, TextFile } from "projen";
import { JsiiProjectOptions } from "projen/lib/cdk";
import { NpmAccess } from "projen/lib/javascript";
import {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from "projen/lib/typescript";

/**
 * Additional options for Mountain Pass Typescript projects.
 */
export interface BaseMountainPassTypeScriptProjectOptions {
  readonly commitlint?: boolean;
  readonly husky?: boolean;
  readonly eslintJsdoc?: boolean;
  readonly eslintUnicorn?: boolean;
  readonly commitlintOptions?: any;
  readonly cSpellOptions?: any;
  readonly cSpell?: boolean;
  readonly vscodeExtensions?: boolean;
  readonly vscodeExtensionsOptions?: any;
}

export const defaultMountainPassTypeScriptProjectOptions: Required<BaseMountainPassTypeScriptProjectOptions> &
  Omit<TypeScriptProjectOptions, "name" | "repositoryUrl"> = {
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
  eslintUnicorn: true,
  eslintJsdoc: true,
  husky: true,
  commitlint: true,
  commitlintOptions: { extends: ["@commitlint/config-conventional"] },
  cSpell: true,
  cSpellOptions: {
    language: "en-GB",
    words: [
      "commitlint",
      "docgen",
      "projen",
      "projenrc",
      "unbump",
      "mountainpass",
      "dbaeumer",
      "outdir",
      "jsii",
    ],
  },
  vscodeExtensions: true,
  vscodeExtensionsOptions: {
    recommendations: [
      "dbaeumer.vscode-eslint",
      "streetsidesoftware.code-spell-checker",
    ],
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
};

/**
 * Options for Mountain Pass Typescript projects.
 */
export interface MountainPassTypeScriptProjectOptions
  extends BaseMountainPassTypeScriptProjectOptions,
    JsiiProjectOptions {}

/**
 * A customized TypeScript project with extra linting and Mountain Pass specific options.
 */
export class MountainPassTypeScriptProject extends TypeScriptProject {
  /**
   * Create a Mountain Pass TypeScript project.
   *
   * @param options - see `MountainPassTypeScriptProjectOptions`
   */
  constructor(options: MountainPassTypeScriptProjectOptions) {
    const mergedOptions = Object.assign(
      {},
      defaultMountainPassTypeScriptProjectOptions,
      options
    );
    const generatedOptions = Object.assign(
      {
        packageName: `@mountainpass/${mergedOptions.name}`,
        homepage: `https://github.com/mountain-pass/${mergedOptions.name}`,
        repository: `https://github.com/mountain-pass/${mergedOptions.name}.git`,
        repositoryUrl: `https://github.com/mountain-pass/${mergedOptions.name}.git`,
        bugsUrl: `https://github.com/mountain-pass/${mergedOptions.name}/issues`,
        readme: {
          contents: [
            `# ${mergedOptions.name}`,
            ...(mergedOptions.description
              ? ["", mergedOptions.description]
              : []),
          ].join("\n"),
        },
      },
      mergedOptions
    );

    super(generatedOptions);
    // need to make sure recent version of typedoc is installed
    fixTypedocVersion(this);

    maybeAddExtensionRecommendations(this, generatedOptions);

    maybeAddHusky(this, generatedOptions);

    maybeAddCommitlint(this, generatedOptions);
    maybeAddCSpell(this, generatedOptions);

    maybeAddUnicorn(this, generatedOptions);
    maybeAddJsdoc(this, generatedOptions);
    // prettier needs to be last of the eslint options
    maybeAddPrettier(this, generatedOptions);
  }

  /**
   *
   * adds contributors to package.json
   *
   * @param contributors contributors to add
   */
  addContributors(...contributors: string[]) {
    addContributors(this, ...contributors);
  }
}

/**
 *
 * adds contributors to package.json
 *
 * @param project the project to add the contributors to
 * @param contributors contributors to add
 */
export function addContributors(
  project: TypeScriptProject,
  ...contributors: string[]
) {
  const packageJson = project.tryFindObjectFile(
    "package.json"
  ) as any as ObjectFile;
  packageJson.addOverride("contributors", contributors);
}

/**
 * adds vscode extensions recommendations unless they've been disabled
 *
 * @param project the project to add to
 * @param options - see `MountainPassTypeScriptProjectOptions`
 */
export function maybeAddExtensionRecommendations(
  project: TypeScriptProject,
  options: MountainPassTypeScriptProjectOptions
) {
  if (options.vscodeExtensions) {
    new SampleFile(project, ".vscode/extensions.json", {
      contents: JSON.stringify(options.vscodeExtensionsOptions, undefined, 2),
    });
  }
}

/**
 * adds cSpell unless it's been disabled
 *
 * @param project the project to add to
 * @param options see `MountainPassTypeScriptProjectOptions`
 */
export function maybeAddCSpell(
  project: TypeScriptProject,
  options: MountainPassTypeScriptProjectOptions
) {
  if (options.cSpell) {
    project.addDevDeps("cspell");
    new SampleFile(project, "cspell.json", {
      contents: JSON.stringify(options.cSpellOptions, undefined, 2),
    });
  }
}
/**
 *
 * adds commitlint to the project if it hasn't been disabled.
 * Includes adding a husky commit msg hook to call commitlint, if husky hasn't been disabled.
 *
 * @param project the project to add to
 * @param options - see `MountainPassTypeScriptProjectOptions`
 */
export function maybeAddCommitlint(
  project: TypeScriptProject,
  options: MountainPassTypeScriptProjectOptions
) {
  if (options.commitlint) {
    // setup commitlint
    project.addDevDeps("@commitlint/config-conventional", "@commitlint/cli");
    new JsonFile(project, ".commitlintrc.json", {
      obj: options.commitlintOptions,
    });
    if (options.husky) {
      new TextFile(project, ".husky/commit-msg", {
        lines: [
          "#!/bin/sh",
          '. "$(dirname "$0")/_/husky.sh"',
          'npx --no -- commitlint --edit "${1}"',
        ],
        executable: true,
        marker: true,
      });
    }
  }
}

/**
 * add husky to the project if it hasn't been disabled
 *
 * @param project the project to add to
 * @param options - see `MountainPassTypeScriptProjectOptions`
 */
export function maybeAddHusky(
  project: TypeScriptProject,
  options: MountainPassTypeScriptProjectOptions
) {
  if (options.husky) {
    project.addDevDeps("husky");
    project.addTask("prepare", {
      exec: "husky install",
      description: "installs husky",
    });
    new TextFile(project, ".husky/pre-commit", {
      lines: [
        "#!/bin/sh",
        '. "$(dirname "$0")/_/husky.sh"',
        "npm run test:update",
        "npm run eslint",
      ],
      executable: true,
      marker: true,
    });
  }
}
/**
 *
 * adds prettier to eslint if prettier is enabled
 *
 * @param project the project to add to
 * @param options - see `MountainPassTypeScriptProjectOptions`
 */
export function maybeAddPrettier(
  project: TypeScriptProject,
  options: MountainPassTypeScriptProjectOptions
) {
  if (project.eslint && options.prettier) {
    project.eslint.addExtends("prettier");
  }
}

/**
 * adds Jsdoc linting to eslint if neither eslint nor enableEslintJsdoc are disabled
 *
 * @param project the project to add to
 * @param options -see `MountainPassTypeScriptProjectOptions`
 */
export function maybeAddJsdoc(
  project: TypeScriptProject,
  options: MountainPassTypeScriptProjectOptions
) {
  if (project.eslint && options.eslintJsdoc) {
    // add jsdoc linting
    project.addDevDeps("eslint-plugin-jsdoc", "eslint-plugin-jsdoc-typescript");
    project.eslint.addPlugins("jsdoc");
    project.eslint.addExtends("plugin:jsdoc/recommended");
    project.eslint.addRules({
      "jsdoc/require-jsdoc": [
        "error",
        {
          contexts: [
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSEnumDeclaration",
            "PropertyDeclaration",
            "ClassProperty",
            "ClassDeclaration",
            "MethodDefinition",
          ],
        },
      ],
      "jsdoc/require-description": ["error", { contexts: ["any"] }],
      "jsdoc/check-indentation": "error",
      "jsdoc/check-line-alignment": "error",
      "jsdoc/check-syntax": "error",
      "jsdoc/require-asterisk-prefix": "error",
      "jsdoc/require-param-type": "off", // TypeScript already has parameter types
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns-type": "off", // TypeScript already has return types
    });
  }
}

/**
 * adds unicorn to eslint if neither eslint nor enableEslintUnicorn are disabled
 *
 * @param project the project to add to
 * @param options - see `MountainPassTypeScriptProjectOptions`
 */
export function maybeAddUnicorn(
  project: TypeScriptProject,
  options: MountainPassTypeScriptProjectOptions
) {
  if (project.eslint && options.eslintUnicorn) {
    project.addDevDeps("eslint-plugin-unicorn");
    project.eslint.addPlugins("unicorn");
    project.eslint.addExtends("plugin:unicorn/recommended");
    project.eslint.addRules({
      "unicorn/prefer-node-protocol": "off",
    });
    project.eslint.addOverride({
      files: [".projenrc.js"],
      rules: {
        "unicorn/prefer-module": "off",
      },
    });
  }
}
/**
 *
 * updates the version of typedoc to one that works with typescript 4.6
 *
 * @param project the project to add to
 */
export function fixTypedocVersion(project: TypeScriptProject) {
  project.addDevDeps("typedoc@^0.22.15");
}
