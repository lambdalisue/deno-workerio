/**
 * A helper class representing a condition that a `WorkerReader` waits for.
 * The `wait` method returns a promise that is resolved when `notify` is called.
 */
class Condition {
  #resolve: (() => void) | undefined;

  /**
   * Notify to resolve promise that is returned by `wait`
   */
  notify(): void {
    if (this.#resolve) {
      this.#resolve();
    }
  }

  /**
   * Returns a promise that is resolved when `notify` is called.
   */
  wait(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.#resolve = resolve;
    });
  }
}

/**
 * A `WorkerReader` is a `Deno.Reader` and `Deno.Closer` that reads data from a `Worker`.
 *
 * The worker is automatically closed when `null` is received from the `Worker`.
 */
export class WorkerReader implements Deno.Reader, Deno.Closer {
  #condition: Condition;
  #queue: Uint8Array[];
  #remain: Uint8Array;
  #closed: boolean;
  #onmessage: (ev: MessageEvent) => void;
  #worker: Worker;

  /**
   * Constructs a new `WorkerReader` with the given `Worker`.
   *
   * @param worker The `Worker` to read from.
   */
  constructor(worker: Worker) {
    this.#condition = new Condition();
    this.#queue = [];
    this.#remain = new Uint8Array();
    this.#closed = false;
    this.#onmessage = (ev) => {
      if (ev.data === null) {
        this.close();
      } else if (ev.data instanceof Uint8Array) {
        this.#queue.push(ev.data);
        this.#condition.notify();
      } else {
        throw new Error("Unexpected data posted");
      }
    };
    this.#worker = worker;
    this.#worker.addEventListener("message", this.#onmessage);
  }

  /**
   * Reads up to `p.byteLength` bytes of data into `p`.
   *
   * @param p The buffer to read into.
   * @returns The number of bytes read, or `null` if the `Worker` is closed.
   */
  async read(p: Uint8Array): Promise<number | null> {
    if (!this.#remain.length && this.#queue.length) {
      // Poll from queue to read received data
      this.#remain = this.#queue.shift()!;
    }
    if (this.#remain.length) {
      // Return received (remaining) data
      const n = Math.min(p.byteLength, this.#remain.byteLength);
      const d = this.#remain.subarray(0, n);
      this.#remain = this.#remain.subarray(n);
      p.set(d);
      return n;
    }
    if (this.#closed) {
      // Worker is closed
      return null;
    } else {
      // Wait until next data is received
      await this.#condition.wait();
      return await this.read(p);
    }
  }

  /**
   * Closes the `WorkerReader`.
   */
  close(): void {
    this.#worker.removeEventListener("message", this.#onmessage);
    this.#closed = true;
  }
}
