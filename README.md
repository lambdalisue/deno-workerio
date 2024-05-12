# workerio

[![JSR](https://jsr.io/badges/@lambdalisue/workerio)](https://jsr.io/@lambdalisue/workerio)
[![Test](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml/badge.svg)](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/lambdalisue/deno-workerio/graph/badge.svg?token=6Q1iOBg2Ka)](https://codecov.io/gh/lambdalisue/deno-workerio)

[Deno][deno] module to translate Worker's system of messages into
[`ReadableStream<Uint8Array>`][readablestream] and
[`WritableStream<Uint8Array>`][writablestream].

[deno]: https://deno.land/
[ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[WritableStream]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream

## Example

#### Server

```typescript
import {
  readableStreamFromWorker,
  writableStreamFromWorker,
} from "@lambdalisue/workerio";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
});

const reader = readableStreamFromWorker(worker);
const writer = writableStreamFromWorker(worker);
const w = writer.getWriter();

await w.write(encoder.encode("Hello"));
await w.write(encoder.encode("World"));
w.releaseLock();

for await (const data of reader) {
  const text = decoder.decode(data);
  console.log(text);
}
```

#### Worker

```typescript
import {
  readableStreamFromWorker,
  writableStreamFromWorker,
} from "@lambdalisue/workerio";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  const worker = self as unknown as Worker;
  const reader = readableStreamFromWorker(worker);
  const writer = writableStreamFromWorker(worker);
  const w = writer.getWriter();

  for await (const data of reader) {
    const text = decoder.decode(data);
    await w.write(encoder.encode(`!!! ${text} !!!`));
  }
  w.releaseLock();
}

main().catch((e) => console.error(e));
```

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
