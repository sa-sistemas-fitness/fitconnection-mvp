import * as service from "../services/chat.service.js";
import { parseId } from "../utils/request.js";

export async function list(request, response) {
  response.json({ chats: await service.listChats(request.auth) });
}
export async function messages(request, response) {
  response.json({
    messages: await service.listMessages(parseId(request.params.id), request.auth),
  });
}
export async function sendMessage(request, response) {
  response.status(201).json({
    message: await service.createMessage(
      parseId(request.params.id),
      request.auth,
      request.body,
    ),
  });
}
