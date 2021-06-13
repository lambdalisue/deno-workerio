import { Queue } from "./deps.ts";
import { WorkerForWorkerReader } from "./types.ts";

export class WorkerReader implements Deno.Reader, Deno.Closer {
  #queue?: Queue<Uint8Array>;
  #remain: Uint8Array;
  #closed: boolean;
  #worker: WorkerForWorkerReader;

  constructor(worker: WorkerForWorkerReader) {
    this.#queue = new Queue();
    this.#remain = new Uint8Array();
    this.#closed = false;
    this.#worker = worker;
    this.#worker.onmessage = (e) => {
      if (this.#queue && !this.#closed) {
        this.#queue.put_nowait(new Uint8Array(e.data));
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
    this.#remain = await this.#queue.get();
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
  }
}
