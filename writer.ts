/**
 * A `WorkerWriter` is a `Deno.Writer` that defines a data channel of a `Worker` and writes data to it.
 *
 * It notifies the peer that the data channel has finished writing, by sending a `null` message.
 */
export class WorkerWriter implements Deno.Writer, Deno.Closer {
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

  /**
   * Notify the peer that the data channel has finished writing, by sending a `null` message.
   */
  close(): void {
    this.#worker.postMessage(null);
  }
}
