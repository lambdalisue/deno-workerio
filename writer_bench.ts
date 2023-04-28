import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { WorkerForWorkerWriter, WorkerWriter } from "./mod.ts";

Deno.bench("WorkerWriter", async () => {
  const posted: Uint8Array[] = [];
  const worker: WorkerForWorkerWriter = {
    postMessage(message) {
      posted.push(message);
    },
  };
  const writer = new WorkerWriter(worker);
  for (let i = 0; i < 100; i++) {
    await writer.write(new Uint8Array(1024));
  }
  assertEquals(posted.length, 100);
});
