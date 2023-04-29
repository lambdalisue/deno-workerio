import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import * as streams from "https://deno.land/std@0.185.0/streams/mod.ts";
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
  const data = new Uint8Array(size);

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
        worker.postMessage(data);
      }
      worker.postMessage(null);
      const chunks = [];
      for await (const chunk of rstream) {
        chunks.push(chunk);
      }
      const content = concat(...chunks);
      assertEquals(content.length, size * count);
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
        worker.postMessage(data);
      }
      worker.postMessage(null);
      const content = await streams.readAll(reader);
      assertEquals(content.length, size * count);
    },
  );
}
