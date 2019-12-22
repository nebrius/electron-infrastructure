import * as express from 'express';
export declare type MessageListener = (data: Record<string, any>) => void;
export declare function createInfrastructureServer(port: number): Promise<void>;
export declare function addStaticAssetRoute(route: string, rootDirectory: string): void;
export declare function addRoute(route: string, handler: express.RequestHandler): void;
export declare function addMessageListener(messageType: string, listener: MessageListener): void;
export declare function sendMessageToWindows(windowType: string, message: Record<string, any>): Promise<void>;
