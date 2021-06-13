import { WorkerForWorkerWriter } from "./types.ts";

export class WorkerWriter implements Deno.Writer {
  #worker: WorkerForWorkerWriter;

  constructor(worker: WorkerForWorkerWriter) {
    this.#worker = worker;
  }

  write(p: Uint8Array): Promise<number> {
    // XXX
    // Send 'p' as-is once the issue below has resolved.
    // https://github.com/denoland/deno/issues/3557
    this.#worker.postMessage(Array.from(p));
    return Promise.resolve(p.length);
  }
}
