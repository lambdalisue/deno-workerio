# workerio

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/workerio)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/workerio/mod.ts)
[![Test](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml/badge.svg)](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml)

[Deno][deno] module to translate Worker's system of messages into
[Reader][reader] and [Writer][writer].

Note that this package requires
[`Worker.postMessage` supports structured clone
algorithm](https://deno.com/blog/v1.10#worker.postmessage-supports-structured-clone-algorithm)
introduced in Deno v1.10.

Note that this package accesses `Deno` namespace thus
[Using Deno in worker](https://deno.land/manual@v1.11.0/runtime/workers#using-deno-in-worker)
must be enabled.

[deno]: https://deno.land/
[reader]: https://doc.deno.land/builtin/stable#Deno.Reader
[writer]: https://doc.deno.land/builtin/stable#Deno.Writer

## Example

### Server

```typescript
import {
  WorkerReader,
  WorkerWriter,
} from "https://deno.land/x/workerio/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
  // NOTE:
  // WorkerReader/WorkerWriter need to access 'Deno' namespace.
  deno: {
    namespace: true,
  },
});

const reader = new WorkerReader(worker);
const writer = new WorkerWriter(worker);

await writer.write(encoder.encode("Hello"));
await writer.write(encoder.encode("World"));

for await (const data of Deno.iter(reader)) {
  const text = decoder.decode(data);
  console.log(text);
}
```

### Worker

```typescript
import {
  WorkerReader,
  WorkerWriter,
} from "https://deno.land/x/workerio/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const worker = self as any;
  const reader = new WorkerReader(worker);
  const writer = new WorkerWriter(worker);

  for await (const data of Deno.iter(reader)) {
    const text = decoder.decode(data);
    await writer.write(encoder.encode(`!!! ${text} !!!`));
  }
}

main().catch((e) => console.error(e));
```

## Benchmark

You can run benchmark of `WorkerReader` and `WorkerWriter` with the following
command:

```
$ deno run --no-check --unstable --allow-read --allow-net ./benchmark/benchmark.ts
===========================================================
Transfer: 1 MiB
N:        5 times
===========================================================
Relaxing 1 sec ...
Start benchmark
1 Reader: 9 [ms] Writer: 0 [ms]
2 Reader: 7 [ms] Writer: 0 [ms]
3 Reader: 6 [ms] Writer: 1 [ms]
4 Reader: 5 [ms] Writer: 1 [ms]
5 Reader: 6 [ms] Writer: 0 [ms]
===========================================================
Reader: Avg. 6.6000 msec (1271.0 Mbps)
Writer: Avg. 0.40000 msec (20972 Mbps)
===========================================================
```

Use `-n` to change the number of tries and `-size` to the size of the buffer (in
MB) like:

```
$ deno run --no-check --unstable --allow-read --allow-net ./benchmark/benchmark.ts -n 3 --size 8
===========================================================
Transfer: 8 MiB
N:        3 times
===========================================================
Relaxing 1 sec ...
Start benchmark
1 Reader: 53 [ms] Writer: 7 [ms]
2 Reader: 43 [ms] Writer: 1 [ms]
3 Reader: 40 [ms] Writer: 1 [ms]
===========================================================
Reader: Avg. 45.333 msec (1480.3 Mbps)
Writer: Avg. 3.0000 msec (22370 Mbps)
===========================================================
```

See [Benchmark](./wiki/Benchmark) for various benchmarks.

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
