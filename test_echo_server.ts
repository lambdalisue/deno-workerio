/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

self.onmessage = (ev) => {
  self.postMessage(ev.data);
};
