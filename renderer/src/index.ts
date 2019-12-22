/*
MIT License

Copyright (c) Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { IMessage, IWindowReadyMessage, MessageType } from './common/common.js';

export type MessageListener = (msg: IMessage) => void;

let isConnected = false;
const messageQueue: IMessage[] = [];

let connection: WebSocket | undefined;
const listeners: MessageListener[] = [];

export async function connectToInfrastructureServer(windowType: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    connection = new WebSocket(`ws://localhost:${port}/ws`);
    connection.addEventListener('open', () => {
      isConnected = true;

      // Let the main process know we're ready. This does a couple of things:
      // 1) It lets the main process app know this window is ready to do stuff
      // 2) It registeres this window with the main process infrastructure so
      //    we can send messages to it using `sendMessageToWindows` with
      //    the window type passed in to this method
      const windowReadyMessage: IWindowReadyMessage = {
        messageType: MessageType.WindowReady,
        windowType
      };
      sendMessage(windowReadyMessage);

      // Send any messages that were attempted earlier before we were ready to
      // sending messages
      for (const message of messageQueue) {
        sendMessage(message);
      }

      resolve();
    });

    connection.addEventListener('error', (err) => {
      reject(err);
    });

    connection.addEventListener('message', (rawMessage) => {
      const message = JSON.parse(rawMessage.data);
      for (const listener of listeners) {
        listener(message);
      }
    });
  });
}

export function sendMessage(msg: IMessage) {
  // If we're not connected yet, we need to queue up this message so we can send
  // it later in `connectToInfrastructureServer` once the ws `open` method has
  // been fired
  if (!isConnected || !connection) {
    messageQueue.push(msg);
  } else {
    connection.send(JSON.stringify(msg));
  }
}

export function addMessageListener(listener: MessageListener): void {
  listeners.push(listener);
}

export function removeMessageListener(listener: MessageListener): void {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
}
