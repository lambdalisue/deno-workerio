export class WorkerWriter implements Deno.Writer {
  #worker: Worker;

  constructor(worker: Worker) {
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
    this.#worker.postMessage(p);
    return Promise.resolve(p.length);
  }
}
