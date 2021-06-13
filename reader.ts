import { Deferred, deferred, Queue } from "./deps.ts";
import { WorkerForWorkerReader } from "./types.ts";

export class WorkerReader implements Deno.Reader, Deno.Closer {
  #queue?: Queue<Uint8Array>;
  #remain: Uint8Array;
  #closed: boolean;
  #waiter: Deferred<void>;
  #worker: WorkerForWorkerReader;

  constructor(worker: WorkerForWorkerReader) {
    this.#queue = new Queue();
    this.#remain = new Uint8Array();
    this.#closed = false;
    this.#waiter = deferred();
    this.#worker = worker;
    this.#worker.onmessage = (e) => {
      if (this.#queue && !this.#closed) {
        this.#queue.put_nowait(e.data);
      }
    };
  }

  async read(p: Uint8Array): Promise<number | null> {
    if (this.#remain.length) {
      return this.readFromRemain(p);
    }
    if (!this.#queue || (this.#closed && this.#queue.empty())) {
      this.#queue = undefined;
      return null;
    }
    if (!this.#queue?.empty()) {
      this.#remain = this.#queue.get_nowait();
      return this.readFromRemain(p);
    }
    // Wait queue or close
    const r = await Promise.race([this.#queue.get(), this.#waiter]);
    if (r == undefined) {
      // Closed, so retry from the beginning
      return await this.read(p);
    }
    this.#remain = r;
    return this.readFromRemain(p);
  }

  private readFromRemain(p: Uint8Array): number {
    const n = p.byteLength;
    const d = this.#remain.slice(0, n);
    this.#remain = this.#remain.slice(n);
    p.set(d);
    return d.byteLength;
  }

  close(): void {
    this.#closed = true;
    this.#waiter.resolve();
  }
}
