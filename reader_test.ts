import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.186.0/async/mod.ts";
import * as streams from "https://deno.land/std@0.186.0/streams/mod.ts";
import { WorkerReader } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

Deno.test({
  name: "WorkerReader reads data forever until closed",
  fn: async () => {
    const worker = new MockWorker();
    const reader = new WorkerReader(worker);
    worker.postMessage(new Uint8Array([0, 1, 2, 3, 4]));
    worker.postMessage(new Uint8Array([5, 6, 7, 8, 9]));

    const content = await Promise.race([
      streams.readAll(reader),
      delay(10).then(() => Promise.resolve("Timed out")),
    ]);
    assertEquals(content, "Timed out");
  },
});

Deno.test(
  "WorkerReader reads data posted to the worker",
  async () => {
    const worker = new MockWorker();
    const reader = new WorkerReader(worker);
    worker.postMessage(new Uint8Array([0, 1, 2, 3, 4]));
    worker.postMessage(new Uint8Array([5, 6, 7, 8, 9]));
    reader.close();

    const content = await streams.readAll(reader);
    assertEquals(content, new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  },
);

Deno.test(
  "WorkerReader reads data posted to the worker prior to close",
  async () => {
    const worker = new MockWorker();
    const reader = new WorkerReader(worker);
    worker.postMessage(new Uint8Array([0, 1, 2, 3, 4]));
    reader.close();
    worker.postMessage(new Uint8Array([5, 6, 7, 8, 9]));

    const content = await streams.readAll(reader);
    assertEquals(content, new Uint8Array([0, 1, 2, 3, 4]));
  },
);

Deno.test(
  "WorkerReader reads data posted to the worker (closed with null)",
  async () => {
    const worker = new MockWorker();
    const reader = new WorkerReader(worker);
    worker.postMessage(new Uint8Array([0, 1, 2, 3, 4]));
    worker.postMessage(new Uint8Array([5, 6, 7, 8, 9]));
    worker.postMessage(null);

    const content = await streams.readAll(reader);
    assertEquals(content, new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  },
);

Deno.test(
  "WorkerReader reads data posted to the worker prior to close (closed with null)",
  async () => {
    const worker = new MockWorker();
    const reader = new WorkerReader(worker);
    worker.postMessage(new Uint8Array([0, 1, 2, 3, 4]));
    worker.postMessage(null);
    worker.postMessage(new Uint8Array([5, 6, 7, 8, 9]));

    const content = await streams.readAll(reader);
    assertEquals(content, new Uint8Array([0, 1, 2, 3, 4]));
  },
);
