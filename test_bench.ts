import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import * as streams from "https://deno.land/std@0.185.0/streams/mod.ts";
import {
  WorkerReader as WorkerReaderV2,
  WorkerWriter as WorkerWriterV2,
} from "https://deno.land/x/workerio@v2.0.1/mod.ts";
import {
  WorkerReader as WorkerReaderV1,
  WorkerWriter as WorkerWriterV1,
} from "https://deno.land/x/workerio@v1.4.4/mod.ts";
import {
  readableStreamFromWorker,
  WorkerReader,
  WorkerWriter,
  writableStreamFromWorker,
} from "./mod.ts";
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
    `Streams API (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
      baseline: true,
    },
    async () => {
      const worker = new MockWorker();
      const rstream = readableStreamFromWorker(worker);
      const wstream = writableStreamFromWorker(worker);

      const producer = async () => {
        const writer = wstream.getWriter();
        for (let i = 0; i < count; i++) {
          await writer.write(data);
        }
        writer.close();
      };

      const consumer = async () => {
        const chunks: Uint8Array[] = [];
        for await (const chunk of rstream) {
          chunks.push(chunk);
        }
        return concat(...chunks);
      };

      const [_, content] = await Promise.all([
        producer(),
        consumer(),
      ]);
      assertEquals(content.length, size * count);
    },
  );

  Deno.bench(
    `Reader/Writer API (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const reader = new WorkerReader(worker);
      const writer = new WorkerWriter(worker);

      const producer = async () => {
        for (let i = 0; i < count; i++) {
          await writer.write(data);
        }
        writer.close();
      };

      const consumer = () => {
        return streams.readAll(reader);
      };

      const [_, content] = await Promise.all([
        producer(),
        consumer(),
      ]);
      assertEquals(content.length, size * count);
    },
  );

  Deno.bench(
    `Reader/Writer API v2 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const reader = new WorkerReaderV2(worker);
      const writer = new WorkerWriterV2(worker);

      const producer = async () => {
        for (let i = 0; i < count; i++) {
          await writer.write(data);
        }
        reader.close();
      };

      const consumer = () => {
        return streams.readAll(reader);
      };

      const [_, content] = await Promise.all([
        producer(),
        consumer(),
      ]);
      assertEquals(content.length, size * count);
    },
  );

  Deno.bench(
    `Reader/Writer API v1 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const reader = new WorkerReaderV1(worker);
      const writer = new WorkerWriterV1(worker);

      const producer = async () => {
        for (let i = 0; i < count; i++) {
          await writer.write(data);
        }
        reader.close();
      };

      const consumer = () => {
        return streams.readAll(reader);
      };

      const [_, content] = await Promise.all([
        producer(),
        consumer(),
      ]);
      assertEquals(content.length, size * count);
    },
  );
}
