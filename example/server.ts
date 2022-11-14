import * as io from "https://deno.land/std@0.164.0/io/mod.ts";
import { WorkerReader, WorkerWriter } from "../mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const worker = new Worker(
  new URL("./worker.ts", import.meta.url).href,
  {
    type: "module",
    // NOTE:
    // WorkerReader/WorkerWriter need to access 'Deno' namespace.
    deno: {
      namespace: true,
    },
  },
);

const reader = new WorkerReader(worker);
const writer = new WorkerWriter(worker);

await writer.write(encoder.encode("Hello"));
await writer.write(encoder.encode("World"));

for await (const data of io.iter(reader)) {
  const text = decoder.decode(data);
  console.log(text);
}
