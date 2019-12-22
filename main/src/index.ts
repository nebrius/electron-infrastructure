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

import { createServer } from 'http';
import { Server } from 'ws';
import * as express from 'express';
import { MessageType, IMessage, IWindowReadyMessage } from './common/common';

// The browser type definition for web sockets (always included in TS) collides with the ws version
// and the ws type definition doesn't expose this interface, booo.
interface IWebSocket {
  send(msg: string): void;
}

export type MessageListener = (data: Record<string, any>) => void;

let app: express.Express;
const listeners: Record<string, MessageListener[]> = {};
const windows: Record<string, Map<IWebSocket, boolean>> = {};

export async function init(port: number): Promise<void> {
  // TODO: switch to HTTPS (HTTP/2?)
  app = express();
  const httpServer = createServer(app);
  const webSocketServer = new Server({ server: httpServer });

  webSocketServer.on('connection', (wsClient) => {
    wsClient.on('message', (msg) => {
      const parsedMessage: IMessage = JSON.parse(msg.toString());
      if (parsedMessage.messageType === MessageType.WindowReady) {
        const windowType = (parsedMessage as IWindowReadyMessage).windowType;
        if (!windows.hasOwnProperty(windowType)) {
          windows[windowType] = new Map<IWebSocket, boolean>();
        }
        windows[windowType].set(wsClient, true);
      }
    });
  });

  return new Promise((resolve) => {
    httpServer.listen(port, resolve);
  });
}

export function addStaticAssetRoute(route: string, rootDirectory: string): void {
  app.use(route, express.static(rootDirectory));
}

export function registerMessageListener(messageType: string, listener: MessageListener): void {
  if (!listeners.hasOwnProperty(messageType)) {
    listeners[messageType] = [];
  }
  listeners[messageType].push(listener);
}

export async function sendMessageToWindows(windowType: string, message: Record<string, any>): Promise<void> {
  if (!windows.hasOwnProperty(windowType)) {
    throw new Error(`Window type ${windowType} is unknown`);
  }
  for (const [ connection ] of windows[windowType]) {
    connection.send(JSON.stringify(message));
  }
}
