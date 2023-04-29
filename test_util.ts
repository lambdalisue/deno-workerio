/**
 * A mock worker that can be used in tests.
 *
 * The postMessage method will call the onmessage callback and dispatch a message event of its own.
 */
export class MockWorker extends EventTarget {
  onmessage?: (this: Worker, ev: MessageEvent) => void;
  postMessage(data: unknown) {
    const ev = new MessageEvent("message", { data });
    this.onmessage?.call(this, ev);
    this.dispatchEvent(ev);
  }
  terminate() {
    // Do nothing
  }
}
