/**
 * A `WorkerWriter` is a `Deno.Writer` that writes data to a `Worker` through `postMessage`.
 */
export class WorkerWriter implements Deno.Writer {
  #worker: Worker;

  /**
   * Constructs a new `WorkerWriter` with the given `Worker`.
   *
   * @param worker The `Worker` to write to.
   */
  constructor(worker: Worker) {
    this.#worker = worker;
  }

  /**
   * Writes `p.byteLength` bytes of data to the `Worker` using `postMessage`.
   *
   * Note that this method does NOT guarantee that the data has been posted to the peer.
   * Please refer to the following link for more information:
   * https://github.com/lambdalisue/deno-workerio/issues/5
   *
   * @param p The buffer to write.
   * @returns A promise resolving to the number of bytes written.
   */
  write(p: Uint8Array): Promise<number> {
    this.#worker.postMessage(p);
    return Promise.resolve(p.length);
  }
}
