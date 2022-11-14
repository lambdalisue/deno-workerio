import { assert, assertEquals, delay, streams } from "./deps_test.ts";
import { WorkerForWorkerReader, WorkerReader } from "./mod.ts";

Deno.test(
  "WorkerReader stores received data and return on 'read' method",
  async () => {
    const worker: WorkerForWorkerReader = {
      onmessage() {},
      terminate() {},
    };
    const reader = new WorkerReader(worker);
    worker.onmessage?.call(
      worker,
      new MessageEvent("worker", {
        data: new Uint8Array([0, 1, 2, 3, 4]),
      }),
    );
    worker.onmessage?.call(
      worker,
      new MessageEvent("worker", {
        data: new Uint8Array([5, 6, 7, 8, 9]),
      }),
    );
    let p: Uint8Array;
    let n: number | null;
    p = new Uint8Array(10);
    n = await reader.read(p);
    assert(typeof n === "number");
    assertEquals(p.slice(0, n), new Uint8Array([0, 1, 2, 3, 4]));
    p = new Uint8Array(10);
    n = await reader.read(p);
    assert(typeof n === "number");
    assertEquals(p.slice(0, n), new Uint8Array([5, 6, 7, 8, 9]));
  },
);

Deno.test(
  "WorkerReader return 'null' when the reader had closed by 'close' method",
  async () => {
    const worker: WorkerForWorkerReader = {
      onmessage() {},
      terminate() {},
    };
    const reader = new WorkerReader(worker);
    worker.onmessage?.call(
      worker,
      new MessageEvent("worker", {
        data: new Uint8Array([0, 1, 2, 3, 4]),
      }),
    );
    reader.close();
    worker.onmessage?.call(
      worker,
      new MessageEvent("worker", {
        data: new Uint8Array([5, 6, 7, 8, 9]),
      }),
    );
    let p: Uint8Array;
    let n: number | null;
    p = new Uint8Array(10);
    n = await reader.read(p);
    assert(typeof n === "number");
    assertEquals(p.slice(0, n), new Uint8Array([0, 1, 2, 3, 4]));
    p = new Uint8Array(10);
    n = await reader.read(p);
    assertEquals(n, null);
  },
);

Deno.test(
  "WorkerReader works properly with small buffer size",
  async () => {
    const worker: WorkerForWorkerReader = {
      onmessage() {},
      terminate() {},
    };
    const reader = new WorkerReader(worker);
    worker.onmessage?.call(
      worker,
      new MessageEvent("worker", {
        data: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
      }),
    );
    reader.close();
    worker.onmessage?.call(
      worker,
      new MessageEvent("worker", {
        data: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
      }),
    );
    let n: number | null;
    const p = new Uint8Array(8);
    n = await reader.read(p);
    assert(typeof n === "number");
    assertEquals(p.slice(0, n), new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]));
    n = await reader.read(p);
    assert(typeof n === "number");
    assertEquals(p.slice(0, n), new Uint8Array([8, 9]));
    n = await reader.read(p);
    assertEquals(n, null);
  },
);

Deno.test({
  name: "WorkerReader properly stop reading when it' closed",
  fn: async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    const worker: WorkerForWorkerReader = {
      onmessage() {},
      terminate() {},
    };
    const reader = new WorkerReader(worker);
    const consumer = async () => {
      for await (const _ of streams.iterateReader(reader)) {
        // Do NOTHING
      }
    };
    await Promise.race([
      Promise.all([
        consumer(),
        delay(10, { signal }).then(() => reader.close()),
      ]),
      delay(100, { signal }).then(() => Promise.reject("Timeout")),
    ]);
    controller.abort();
  },
});
