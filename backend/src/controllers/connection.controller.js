import * as service from "../services/connection.service.js";
import { parseId } from "../utils/request.js";

export async function create(request, response) {
  response.status(201).json({
    connectionRequest: await service.createConnectionRequest(
      request.auth,
      request.body,
    ),
  });
}
export async function my(request, response) {
  response.json({
    connectionRequests: await service.listMyRequests(request.auth.clientId),
  });
}
export async function received(request, response) {
  response.json({
    connectionRequests: await service.listReceivedRequests(
      request.auth.trainerId,
    ),
  });
}
export async function accept(request, response) {
  response.json({
    connectionRequest: await service.acceptRequest(
      parseId(request.params.id),
      request.auth,
      request.ip,
    ),
  });
}
export async function reject(request, response) {
  response.json({
    connectionRequest: await service.rejectRequest(
      parseId(request.params.id),
      request.auth,
      request.ip,
    ),
  });
}
