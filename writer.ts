import { WorkerForWorkerWriter } from "./types.ts";

export class WorkerWriter implements Deno.Writer {
  #worker: WorkerForWorkerWriter;

  constructor(worker: WorkerForWorkerWriter) {
    this.#worker = worker;
  }

  /**
   * Write data to the peer through Worker.postMessage
   *
   * Note that this method does NOT guarantee if the peer
   * receive the data.
   * See the below link for the detail.
   * https://github.com/lambdalisue/deno-workerio/issues/5
   */
  write(p: Uint8Array): Promise<number> {
    // XXX
    // Send 'p' as-is once the issue below has resolved.
    // https://github.com/denoland/deno/issues/3557
    this.#worker.postMessage(Array.from(p));
    return Promise.resolve(p.length);
  }
}
