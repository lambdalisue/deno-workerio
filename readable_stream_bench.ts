import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { readableStreamFromWorker, WorkerReader } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

const count = 100;
const sizes = [
  64,
  128,
  256,
  512,
  1024,
];

for (const size of sizes) {
  Deno.bench(
    `readableStreamFromWorker (${
      size.toString().padStart(2)
    } Bytes x ${count})`,
    {
      group: size.toString(),
      baseline: true,
    },
    async () => {
      const worker = new MockWorker();
      const rstream = readableStreamFromWorker(worker);
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        worker.postMessage(data);
      }
      worker.postMessage(null);
      let total = 0;
      for await (const chunk of rstream) {
        total += chunk.length;
      }
      assertEquals(total, size * count);
    },
  );

  Deno.bench(
    `WorkerReader (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const reader = new WorkerReader(worker);
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        worker.postMessage(data);
      }
      worker.postMessage(null);
      let total = 0;
      while (true) {
        const p = new Uint8Array(1024);
        const n = await reader.read(p);
        if (n === null) break;
        total += n;
      }
      assertEquals(total, size * count);
    },
  );
}
