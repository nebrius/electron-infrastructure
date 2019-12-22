export declare type MessageListener = (data: Record<string, any>) => void;
export declare function init(port: number): Promise<void>;
export declare function addStaticAssetRoute(route: string, rootDirectory: string): void;
export declare function registerMessageListener(messageType: string, listener: MessageListener): void;
export declare function sendMessageToWindows(windowType: string, message: Record<string, any>): Promise<void>;
