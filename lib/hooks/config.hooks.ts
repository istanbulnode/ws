import { WebsocketConfig } from "../app/ws.app";
import { WebsocketConfigParams } from "../types/config.params";

const defaultConfig: WebsocketConfig = {
  prefix: "/ws/",
  serveClient: false,
  connectTimeout: 45000,
  adapter: undefined,
  parser: undefined,
};

export const createConfig = (
  config?: WebsocketConfigParams
): WebsocketConfig => {
  return {
    ...defaultConfig,
    ...config,
  };
};