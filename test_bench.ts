import { assertEquals } from "@std/assert";
import { readableStreamFromWorker, writableStreamFromWorker } from "./mod.ts";

const count = 1000;
const sizes = [
  64,
  128,
  256,
  512,
  1024,
];

const worker = new Worker(
  new URL("./test_echo_server.ts", import.meta.url).href,
  { type: "module" },
);

for (const size of sizes) {
  Deno.bench(
    `Streams API (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
      baseline: true,
    },
    async () => {
      const rstream = readableStreamFromWorker(worker);
      const wstream = writableStreamFromWorker(worker);

      const producer = async () => {
        const writer = wstream.getWriter();
        for (let i = 0; i < count; i++) {
          const data = new Uint8Array(size);
          await writer.write(data);
        }
        writer.close();
      };

      const consumer = async () => {
        let total = 0;
        for await (const chunk of rstream) {
          total += chunk.length;
        }
        return total;
      };

      const [_, total] = await Promise.all([
        producer(),
        consumer(),
      ]);
      assertEquals(total, size * count);
    },
  );
}
