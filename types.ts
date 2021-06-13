type Payload = number[];

export type WorkerForWorkerReader = {
  onmessage?: (message: MessageEvent<Payload>) => void;
  terminate(): void;
};

export type WorkerForWorkerWriter = {
  postMessage(message: Payload): void;
};
