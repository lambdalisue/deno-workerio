const worker = self as unknown as Worker;
worker.onmessage = (ev) => {
  worker.postMessage(ev.data);
};
