import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { WorkerWriter } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

Deno.test(
  "WorkerWriter invokes internal worker.postMessage when data is written by 'write' method",
  async () => {
    const worker = new MockWorker();
    const chunks: Uint8Array[] = [];
    worker.addEventListener("message", (ev) => {
      assertInstanceOf(ev, MessageEvent<Uint8Array>);
      chunks.push(ev.data);
    });
    const writer = new WorkerWriter(worker);
    await writer.write(new Uint8Array([0, 1, 2, 3, 4]));
    await writer.write(new Uint8Array([5, 6, 7, 8, 9]));
    assertEquals(chunks[0], new Uint8Array([0, 1, 2, 3, 4]));
    assertEquals(chunks[1], new Uint8Array([5, 6, 7, 8, 9]));
  },
);
