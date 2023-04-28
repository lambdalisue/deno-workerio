import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import * as streams from "https://deno.land/std@0.185.0/streams/mod.ts";
import { WorkerReader } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

Deno.bench("WorkerReader", async () => {
  const worker = new MockWorker();
  const reader = new WorkerReader(worker);
  for (let i = 0; i < 100; i++) {
    worker.postMessage(new Uint8Array(1024));
  }
  reader.close();
  const content = await streams.readAll(reader);
  assertEquals(content.length, 1024 * 100);
});
