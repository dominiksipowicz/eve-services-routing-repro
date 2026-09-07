// Workspace package imported by the web app, mirroring the production
// monorepo's internal packages: the function bundler must follow a workspace
// symlink and then the isolated-linker store symlinks beneath it.
export function sharedLabel(): string {
  return 'shared-workspace-package';
}
