import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { WorkerWriter } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

Deno.bench("WorkerWriter", async () => {
  const worker = new MockWorker();
  const chunks: Uint8Array[] = [];
  worker.addEventListener("message", (ev) => {
    assertInstanceOf(ev, MessageEvent<Uint8Array>);
    chunks.push(ev.data);
  });
  const writer = new WorkerWriter(worker);
  for (let i = 0; i < 100; i++) {
    await writer.write(new Uint8Array(1024));
  }
  assertEquals(chunks.length, 100);
});
