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

import { IMessage } from './common/common.js';

export type MessageListener = (msg: IMessage) => void;

let isConnected = false;
let connection: WebSocket | undefined;

const messageQueue: IMessage[] = [];
const listenerQueue: MessageListener[] = [];

export async function init(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    connection = new WebSocket(`ws://localhost:${port}/ws`);
    connection.addEventListener('open', () => {
      isConnected = true;
      for (const message of messageQueue) {
        sendMessage(message);
      }
      for (const listener of listenerQueue) {
        addMessageListener(listener);
      }
      resolve();
    });

    connection.addEventListener('error', (err) => {
      reject(err);
    });
  });
}

export function sendMessage(msg: IMessage) {
  if (!isConnected || !connection) {
    messageQueue.push(msg);
  } else {
    connection.send(JSON.stringify(msg));
  }
}

export function addMessageListener(listener: MessageListener): void {
  if (!isConnected || !connection) {
    listenerQueue.push(listener);
    return;
  }
  connection.addEventListener('message', (msg) => {
    listener(JSON.parse(msg.data));
  });
}
