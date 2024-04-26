import * as streams from "https://deno.land/std@0.224.0/streams/mod.ts";
import { WorkerReader, WorkerWriter } from "../mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const worker = self as any;
  const reader = new WorkerReader(worker);
  const writer = new WorkerWriter(worker);

  for await (const data of streams.iterateReader(reader)) {
    const text = decoder.decode(data);
    await writer.write(encoder.encode(`!!! ${text} !!!`));
  }
}

main().catch((e) => console.error(e));
