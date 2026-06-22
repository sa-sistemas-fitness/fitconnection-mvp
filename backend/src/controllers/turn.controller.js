import * as service from "../services/turn.service.js";
import { parseId } from "../utils/request.js";

export async function create(request, response) {
  response.status(201).json({
    turn: await service.createTurn(request.auth, request.body),
  });
}
export async function my(request, response) {
  response.json({ turns: await service.listMyTurns(request.auth.clientId) });
}
export async function received(request, response) {
  response.json({
    turns: await service.listReceivedTurns(request.auth.trainerId),
  });
}
export async function accept(request, response) {
  response.json({
    turn: await service.acceptTurn(
      parseId(request.params.id),
      request.auth,
      request.ip,
    ),
  });
}
export async function reject(request, response) {
  response.json({
    turn: await service.rejectTurn(
      parseId(request.params.id),
      request.auth,
      request.ip,
      request.body.reason,
    ),
  });
}
export async function cancel(request, response) {
  response.json({
    turn: await service.cancelTurn(
      parseId(request.params.id),
      request.auth,
      request.ip,
      request.body.reason,
    ),
  });
}
export async function finish(request, response) {
  response.json({
    turn: await service.finishTurn(
      parseId(request.params.id),
      request.auth,
      request.ip,
    ),
  });
}
