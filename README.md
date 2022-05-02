# projen-typescript-library

A custom Typescript projen project type with extra linting

## usage

- If the `gh` commandline is not installed, [install it](https://github.com/cli/cli#installation)
- run the following commands
  
```sh
gh auth login -w -p https
gh repo create mountain-pass/my-new-project --public --clone
cd my-new-project
projen new --from @mountainpass/projen-typescript-library
```
