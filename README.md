# workerio

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/workerio)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/workerio/mod.ts)
[![Test](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml/badge.svg)](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml)

[Deno][deno] module to translate Worker's system of messages into
[Reader][reader] and [Writer][writer].

Note that `WorkerReader` and `WorkerWriter` access `Deno` namespace thus
[Using Deno in worker](https://deno.land/manual@v1.7.5/runtime/workers#using-deno-in-worker)
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
1 Reader: 136 [ms] Writer: 44 [ms]
2 Reader: 134 [ms] Writer: 42 [ms]
3 Reader: 131 [ms] Writer: 44 [ms]
4 Reader: 136 [ms] Writer: 45 [ms]
5 Reader: 125 [ms] Writer: 40 [ms]
===========================================================
Reader: Avg. 132.40 msec (63.358 Mbps)
Writer: Avg. 43.000 msec (195.08 Mbps)
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
1 Reader: 1404 [ms] Writer: 393 [ms]
2 Reader: 1326 [ms] Writer: 351 [ms]
3 Reader: 1310 [ms] Writer: 366 [ms]
===========================================================
Reader: Avg. 1346.7 msec (49.833 Mbps)
Writer: Avg. 370.00 msec (181.38 Mbps)
===========================================================
```

See [Benchmark](./wiki/Benchmark) for various benchmarks.

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
