// eslint-disable-next-line unicorn/prefer-node-protocol
import assert from "assert";
import { JsonFile, SampleFile, TextFile, typescript } from "projen";
import { NpmAccess } from "projen/lib/javascript";

/**
 * Additional options for Mountain Pass Typescript projects.
 */
interface BaseMountainPassTypeScriptProjectOptions {
  commitlint?: boolean;
  husky?: boolean;
  eslintJsdoc?: boolean;
  eslintUnicorn?: boolean;
  commitlintOptions?: any;
  cSpellOptions?: any;
  cSpell?: boolean;
  vscodeExtensions?: boolean;
  vscodeExtensionsOptions?: any;
}

export const defaultMountainPassTypeScriptProjectOptions: Required<BaseMountainPassTypeScriptProjectOptions> &
  Omit<typescript.TypeScriptProjectOptions, "name"> = {
  defaultReleaseBranch: "main",
  projenrcTs: true,
  npmDistTag: "latest",
  npmAccess: NpmAccess.PUBLIC,
  releaseToNpm: true,
  license: "Apache-2.0",
  codeCov: true,
  dependabot: true,
  prettier: true,
  docgen: true,
  eslint: true,
  eslintOptions: {
    dirs: ["."],
  },
  authorEmail: "info@mountain-pass.com.au",
  authorName: "Mountain Pass",
  authorOrganization: true,
  authorUrl: "https://mountain-pass.com.au",
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
export type MountainPassTypeScriptProjectOptions = Partial<
  typeof defaultMountainPassTypeScriptProjectOptions
> &
  Omit<
    typescript.TypeScriptProjectOptions,
    keyof typeof defaultMountainPassTypeScriptProjectOptions
  >;

/**
 * A customized TypeScript project with extra linting and Mountain Pass specific options.
 */
export class MountainPassTypeScriptProject extends typescript.TypeScriptProject {
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
    assert(mergedOptions.name, "name is required");
    const generatedOptions = Object.assign(
      {
        packageName: `@mountainpass/${mergedOptions.name}`,
        homepage: `https://github.com/mountain-pass/${mergedOptions.name}`,
        repository: `https://github.com/mountain-pass/${mergedOptions.name}.git`,
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
    this.addDevDeps("typedoc@^0.22.15");
    // suggested vscode extensions

    this.maybeAddExtensionRecommendations(generatedOptions);

    this.maybeAddHusky(generatedOptions);

    this.maybeAddCommitlint(generatedOptions);
    this.maybeAddCSpell(generatedOptions);

    this.maybeAddUnicorn(generatedOptions);
    this.maybeAddJsdoc(generatedOptions);
    // prettier needs to be last of the eslint options
    this.maybeAddPrettier(generatedOptions);
  }

  /**
   * adds vscode extensions recommendations unless they've been disabled
   *
   * @param options - see `MountainPassTypeScriptProjectOptions`
   */
  private maybeAddExtensionRecommendations(
    options: MountainPassTypeScriptProjectOptions
  ) {
    if (options.vscodeExtensions) {
      new SampleFile(this, "vscode/extensions.json", {
        contents: JSON.stringify(options.vscodeExtensionsOptions, undefined, 2),
      });
    }
  }

  /**
   * adds cSpell unless it's been disabled
   *
   * @param options see `MountainPassTypeScriptProjectOptions`
   */
  private maybeAddCSpell(options: MountainPassTypeScriptProjectOptions) {
    if (options.cSpell) {
      this.addDevDeps("cspell");
      new SampleFile(this, "cspell.json", {
        contents: JSON.stringify(options.cSpellOptions, undefined, 2),
      });
    }
  }
  /**
   *
   * adds commitlint to the project if it hasn't been disabled.
   * Includes adding a husky commit msg hook to call commitlint, if husky hasn't been disabled.
   *
   * @param options - see `MountainPassTypeScriptProjectOptions`
   */
  private maybeAddCommitlint(options: MountainPassTypeScriptProjectOptions) {
    if (options.commitlint) {
      // setup commitlint
      this.addDevDeps("@commitlint/config-conventional", "@commitlint/cli");
      new JsonFile(this, ".commitlintrc.json", {
        obj: options.commitlintOptions,
      });
      if (options.husky) {
        new TextFile(this, ".husky/commit-msg", {
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
   * @param options - see `MountainPassTypeScriptProjectOptions`
   */
  private maybeAddHusky(options: MountainPassTypeScriptProjectOptions) {
    if (options.husky) {
      this.addDevDeps("husky");
      this.addTask("prepare", {
        exec: "husky install",
        description: "installs husky",
      });
      new TextFile(this, ".husky/pre-commit", {
        lines: [
          "#!/bin/sh",
          '. "$(dirname "$0")/_/husky.sh"',
          "npm test",
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
   * @param options - see `MountainPassTypeScriptProjectOptions`
   */
  private maybeAddPrettier(options: MountainPassTypeScriptProjectOptions) {
    if (this.eslint && options.prettier) {
      this.eslint.addExtends("prettier");
    }
  }

  /**
   * adds Jsdoc linting to eslint if neither eslint nor enableEslintJsdoc are disabled
   *
   * @param options -see `MountainPassTypeScriptProjectOptions`
   */
  private maybeAddJsdoc(options: MountainPassTypeScriptProjectOptions) {
    if (this.eslint && options.eslintJsdoc) {
      // add jsdoc linting
      this.addDevDeps("eslint-plugin-jsdoc", "eslint-plugin-jsdoc-typescript");
      this.eslint.addPlugins("jsdoc");
      this.eslint.addExtends("plugin:jsdoc/recommended");
      this.eslint.addRules({
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
   * @param options - see `MountainPassTypeScriptProjectOptions`
   */
  private maybeAddUnicorn(options: MountainPassTypeScriptProjectOptions) {
    if (this.eslint && options.eslintUnicorn) {
      this.addDevDeps("eslint-plugin-unicorn");
      this.eslint.addPlugins("unicorn");
      this.eslint.addExtends("plugin:unicorn/recommended");
      this.eslint.addRules({
        "unicorn/prefer-node-protocol": "off",
      });
      this.eslint.addOverride({
        files: [".projenrc.js"],
        rules: {
          "unicorn/prefer-module": "off",
        },
      });
    }
  }

  /**
   *
   * adds contributors to package.json
   *
   * @param contributors contributors to add
   */
  addContributors(...contributors: string[]) {
    const packageJson = this.tryFindObjectFile("package.json");
    assert(packageJson, "package.json is required");
    packageJson.addOverride("contributors", contributors);
  }
}
