# projen-typescript-library

A customised Typescript project type with extra linting for Projen

## usage

- If the `gh` command-line is not installed, [install it](https://github.com/cli/cli#installation)
- run the following commands
  
```sh
gh auth login -w -p https
gh repo create mountain-pass/my-new-project --public --clone
cd my-new-project
npx projen new --from @mountainpass/projen-typescript-library
```
