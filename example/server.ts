import * as streams from "https://deno.land/std@0.186.0/streams/mod.ts";
import { WorkerReader, WorkerWriter } from "../mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const worker = new Worker(
  new URL("./worker.ts", import.meta.url).href,
  {
    type: "module",
  },
);

const reader = new WorkerReader(worker);
const writer = new WorkerWriter(worker);

await writer.write(encoder.encode("Hello"));
await writer.write(encoder.encode("World"));

for await (const data of streams.iterateReader(reader)) {
  const text = decoder.decode(data);
  console.log(text);
}
