import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import { WorkerWriter, writableStreamFromWorker } from "./mod.ts";
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
    `writableStreamFromWorker (${
      size.toString().padStart(2)
    } Bytes x ${count})`,
    {
      group: size.toString(),
      baseline: true,
    },
    async () => {
      const worker = new MockWorker();
      const chunks: Uint8Array[] = [];
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        chunks.push(ev.data);
      });
      const wstream = writableStreamFromWorker(worker);
      const writer = wstream.getWriter();
      for (let i = 0; i < count; i++) {
        await writer.write(data);
      }
      const content = concat(...chunks);
      assertEquals(content.length, size * count);
    },
  );

  Deno.bench(
    `WorkerWriter (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const chunks: Uint8Array[] = [];
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        chunks.push(ev.data);
      });
      const writer = new WorkerWriter(worker);
      for (let i = 0; i < count; i++) {
        await writer.write(data);
      }
      const content = concat(...chunks);
      assertEquals(content.length, size * count);
    },
  );
}
