/**
 * [Deno] module to translate Worker's system of messages into
 * [`ReadableStream<Uint8Array>`][readablestream] and
 * [`WritableStream<Uint8Array>`][writablestream].
 *
 * [Deno]: https://deno.land/
 * [ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
 * [WritableStream]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream
 *
 * ## Example
 *
 * #### Server
 *
 * ```typescript
 * import {
 *   readableStreamFromWorker,
 *   writableStreamFromWorker,
 * } from "@lambdalisue/workerio";
 *
 * const decoder = new TextDecoder();
 * const encoder = new TextEncoder();
 *
 * const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
 *   type: "module",
 * });
 *
 * const reader = readableStreamFromWorker(worker);
 * const writer = writableStreamFromWorker(worker);
 * const w = writer.getWriter();
 *
 * await w.write(encoder.encode("Hello"));
 * await w.write(encoder.encode("World"));
 * w.releaseLock();
 *
 * for await (const data of reader) {
 *   const text = decoder.decode(data);
 *   console.log(text);
 * }
 * ```
 *
 * #### Worker
 *
 * ```typescript
 * /// <reference no-default-lib="true" />
 * /// <reference lib="deno.worker" />
 *
 * import {
 *   readableStreamFromWorker,
 *   writableStreamFromWorker,
 * } from "@lambdalisue/workerio";
 *
 * const decoder = new TextDecoder();
 * const encoder = new TextEncoder();
 *
 * async function main(): Promise<void> {
 *   const reader = readableStreamFromWorker(self);
 *   const writer = writableStreamFromWorker(self);
 *   const w = writer.getWriter();
 *
 *   for await (const data of reader) {
 *     const text = decoder.decode(data);
 *     await w.write(encoder.encode(`!!! ${text} !!!`));
 *   }
 *   w.releaseLock();
 * }
 *
 * main().catch((e) => console.error(e));
 * ```
 *
 * @module
 */
export * from "./readable_stream.ts";
export * from "./writable_stream.ts";
export type * from "./types.ts";
