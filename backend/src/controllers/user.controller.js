import * as service from "../services/user.service.js";
import { parseId } from "../utils/request.js";

export async function list(_request, response) {
  response.json({ users: await service.listUsers() });
}

export async function getById(request, response) {
  response.json({ user: await service.getUser(parseId(request.params.id)) });
}

export async function updateStatus(request, response) {
  response.json({
    user: await service.changeUserStatus(
      parseId(request.params.id),
      request.body.status,
      { userId: request.auth.userId, ip: request.ip },
    ),
  });
}
