import * as service from "../services/payment.service.js";
import { parseId } from "../utils/request.js";

export async function create(request, response) {
  response.status(201).json({
    payment: await service.createPayment(request.auth, request.body, request.ip),
  });
}
export async function my(request, response) {
  response.json({ payments: await service.listMyPayments(request.auth.clientId) });
}
export async function received(request, response) {
  response.json({
    payments: await service.listReceivedPayments(request.auth.trainerId),
  });
}
export async function list(_request, response) {
  response.json({ payments: await service.listAllPayments() });
}
export async function updateStatus(request, response) {
  response.json({
    payment: await service.changePaymentStatus(
      parseId(request.params.id),
      request.body.status,
      { userId: request.auth.userId, ip: request.ip },
      request.body.comment,
    ),
  });
}
