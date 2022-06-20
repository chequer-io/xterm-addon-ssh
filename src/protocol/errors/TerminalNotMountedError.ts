export default class TerminalNotMountedError extends Error {
  public constructor() {
    super('Terminal does not mounted');
  }
}
