import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { readableStreamFromWorker } from "./mod.ts";
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
      const worker = new MockWorker() as Worker;
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
}
