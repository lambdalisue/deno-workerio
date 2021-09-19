import { WorkerForWorkerWriter } from "./types.ts";
import { compareVersions } from "./deps.ts";

const supportTransfer = compareVersions(Deno.version.deno, "1.14.0") >= 0;

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
    if (supportTransfer) {
      const c = new Uint8Array(p);
      this.#worker.postMessage(c, [c.buffer]);
    } else {
      this.#worker.postMessage(p);
    }
    return Promise.resolve(p.length);
  }
}
