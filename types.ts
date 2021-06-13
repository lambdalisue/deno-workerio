type Payload = Uint8Array;

export type WorkerForWorkerReader = {
  onmessage?: (message: MessageEvent<Payload>) => void;
  terminate(): void;
};

export type WorkerForWorkerWriter = {
  postMessage(message: Payload): void;
};
