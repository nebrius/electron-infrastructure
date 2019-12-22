export declare enum MessageType {
    WindowReady = "WindowReady"
}
export interface IMessage {
    messageType: string;
}
export interface IWindowReadyMessage extends IMessage {
    windowType: string;
}
