import { Notify } from "https://deno.land/x/async@v2.0.2/notify.ts";

/**
 * A `WorkerReader` is a `Deno.Reader` and `Deno.Closer` that reads data from a `Worker`.
 *
 * The worker is automatically closed when `null` is received from the `Worker`.
 */
export class WorkerReader implements Deno.Reader, Deno.Closer {
  #notify: Notify = new Notify();
  #queue: Uint8Array[] = [];
  #remain: Uint8Array = new Uint8Array();
  #closed = false;
  #worker: Worker;

  /**
   * Constructs a new `WorkerReader` with the given `Worker`.
   *
   * @param worker The `Worker` to read from.
   */
  constructor(worker: Worker) {
    this.#worker = worker;
    this.#worker.onmessage = (ev: MessageEvent) => {
      if (ev.data === null) {
        this.close();
      } else if (ev.data instanceof Uint8Array) {
        if (!this.#closed) {
          this.#queue.push(ev.data);
          this.#notify.notify();
        }
      } else {
        throw new Error("Unexpected data posted");
      }
    };
  }

  /**
   * Reads up to `p.byteLength` bytes of data into `p`.
   *
   * @param p The buffer to read into.
   * @returns The number of bytes read, or `null` if the `Worker` is closed.
   */
  async read(p: Uint8Array): Promise<number | null> {
    while (true) {
      if (this.#remain.length) {
        return this.#readFromRemain(p);
      } else if (this.#queue.length) {
        // Poll from queue to read received data
        this.#remain = this.#queue.shift()!;
        return this.#readFromRemain(p);
      } else if (this.#closed) {
        // Worker is closed
        return null;
      }
      // Wait until next data is received
      await this.#notify.notified();
    }
  }

  #readFromRemain(p: Uint8Array): number {
    const n = p.byteLength;
    const d = this.#remain.subarray(0, n);
    this.#remain = this.#remain.subarray(n);
    p.set(d);
    return d.byteLength;
  }

  /**
   * Closes the `WorkerReader`.
   */
  close(): void {
    this.#closed = true;
    this.#notify.notify();
  }
}
