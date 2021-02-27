import { copyBytes, Queue } from "./deps.ts";

type WorkerForWorkerReader = {
  // deno-lint-ignore no-explicit-any
  onmessage?: (message: MessageEvent<any>) => void;
  terminate(): void;
};

export class WorkerReader implements Deno.Reader, Deno.Closer {
  #queue?: Queue<Uint8Array>;
  #closed: boolean;
  #worker: WorkerForWorkerReader;

  constructor(worker: WorkerForWorkerReader) {
    this.#queue = new Queue();
    this.#closed = false;
    this.#worker = worker;
    this.#worker.onmessage = (e: MessageEvent<number[]>) => {
      if (this.#queue && !this.#closed) {
        this.#queue.put_nowait(new Uint8Array(e.data));
      }
    };
  }

  async read(p: Uint8Array): Promise<number | null> {
    if (!this.#queue || (this.#closed && this.#queue.empty())) {
      this.#queue = undefined;
      return await Promise.resolve(null);
    }
    const r = await this.#queue.get();
    const n = copyBytes(r, p);
    return n;
  }

  close(): void {
    this.#closed = true;
    this.#worker.terminate();
  }
}
