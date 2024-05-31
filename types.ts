/** Worker like object. */
export type WorkerLike = {
  // deno-lint-ignore no-explicit-any
  onmessage: ((ev: MessageEvent) => any) | null;
  // deno-lint-ignore no-explicit-any
  postMessage(message: any, transfer?: Transferable[]): void;
};
