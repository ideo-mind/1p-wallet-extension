// Message types for extension communication

export enum MessageType {
  // Provider methods
  REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS',
  GET_ACCOUNTS = 'GET_ACCOUNTS',
  GET_CHAIN_ID = 'GET_CHAIN_ID',
  PERSONAL_SIGN = 'PERSONAL_SIGN',
  SIGN_TYPED_DATA = 'SIGN_TYPED_DATA',
  SEND_TRANSACTION = 'SEND_TRANSACTION',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',

  // Internal
  GET_STATE = 'GET_STATE',
  UPDATE_STATE = 'UPDATE_STATE',

  // Authentication
  START_AUTH = 'START_AUTH',
  SUBMIT_AUTH = 'SUBMIT_AUTH',

  // Registration
  REGISTER_USER = 'REGISTER_USER',
  CHECK_USERNAME = 'CHECK_USERNAME',
}

export interface BaseMessage {
  type: MessageType;
  id: string;
  timestamp: number;
}

export interface RequestAccountsMessage extends BaseMessage {
  type: MessageType.REQUEST_ACCOUNTS;
  payload: {
    origin: string;
  };
}

export interface PersonalSignMessage extends BaseMessage {
  type: MessageType.PERSONAL_SIGN;
  payload: {
    message: string;
    address: string;
    origin: string;
  };
}

export interface SendTransactionMessage extends BaseMessage {
  type: MessageType.SEND_TRANSACTION;
  payload: {
    to: string;
    value?: string;
    data?: string;
    from: string;
    origin: string;
  };
}

export interface GetStateMessage extends BaseMessage {
  type: MessageType.GET_STATE;
  payload: Record<string, never>;
}

export type ExtensionMessage =
  | RequestAccountsMessage
  | PersonalSignMessage
  | SendTransactionMessage
  | GetStateMessage;

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

