import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import * as streams from "https://deno.land/std@0.185.0/streams/mod.ts";
import { WorkerForWorkerReader, WorkerReader } from "./mod.ts";

Deno.bench("WorkerReader", async () => {
  const worker: WorkerForWorkerReader = {
    onmessage() {},
    terminate() {},
  };
  const reader = new WorkerReader(worker);
  for (let i = 0; i < 100; i++) {
    worker.onmessage?.call(
      worker,
      new MessageEvent("worker", {
        data: new Uint8Array(1024),
      }),
    );
  }
  reader.close();
  const content = await streams.readAll(reader);
  assertEquals(content.length, 1024 * 100);
});
