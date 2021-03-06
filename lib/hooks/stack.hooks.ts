import { transformHttpRequest } from "./../request/request.transformer";
import { InternalMiddleware } from "../middleware/internal.middleware";
import { ListenerStack, CreateListenerStackProps } from "../stack/stack";
import { WsStoreKeys } from "../store/ws.store-keys";
import { wsStorage } from "../store/ws.store.private";
import { ErrorEventHandler } from "../types/types";
import { createResponseInstance } from "./response.hooks";

export const createListenerStack = (
  props: CreateListenerStackProps
): ListenerStack => {
  const callback =
    props.args && typeof props.args[props.args.length - 1] === "function"
      ? props.args.pop()
      : undefined;
  const res = createResponseInstance(callback);
  const body =
    !!props.args && props.args.length === 1
      ? props.args[0]
      : !!props.args
      ? props.args
      : {};
  const req = transformHttpRequest(props.socket.request);
  req.body = { body };
  const stack = new Set<InternalMiddleware>(props.listener.middlewares);
  const done = (result?: any) => {
    res.reply(result);
  };
  const next = (err?: any) => {
    if (err) return done(err);
    const { value: middleware, done: isDone } = stack.values().next();
    try {
      if (isDone && !middleware)
        return props.listener.handler(props.socket, req, res);
      stack.delete(middleware);
      middleware(props.socket, req, res, next);
    } catch (e) {
      const errorHandler = wsStorage.inject(
        WsStoreKeys.ErrorHandler
      ) as ErrorEventHandler;
      if (errorHandler) return errorHandler(e, props.socket, req, res);
      return next(e);
    }
  };
  return {
    middlewares: stack,
    callback: callback,
    res: res,
    req: req,
    next: next,
    done: done,
  };
};
