import { assertEquals } from "./deps_test.ts";
import { WorkerForWorkerWriter, WorkerWriter } from "./mod.ts";

Deno.test(
  "WorkerWriter invokes internal worker.postMessage when data is written by 'write' method",
  async () => {
    const posted: number[][] = [];
    const worker: WorkerForWorkerWriter = {
      postMessage(message) {
        posted.push(message);
      },
    };
    const writer = new WorkerWriter(worker);
    await writer.write(new Uint8Array([0, 1, 2, 3, 4]));
    await writer.write(new Uint8Array([5, 6, 7, 8, 9]));
    assertEquals(posted[0], [0, 1, 2, 3, 4]);
    assertEquals(posted[1], [5, 6, 7, 8, 9]);
  },
);
