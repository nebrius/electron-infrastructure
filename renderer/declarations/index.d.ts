import { IMessage } from './common/common.js';
export declare type MessageListener = (msg: IMessage) => void;
export declare function connectToInfrastructureServer(windowType: string, port: number): Promise<void>;
export declare function sendMessage(msg: IMessage): void;
export declare function addMessageListener(listener: MessageListener): void;
export declare function removeMessageListener(listener: MessageListener): void;
