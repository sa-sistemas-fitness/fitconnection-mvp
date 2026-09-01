import * as service from "../services/trainer.service.js";
import { parseId } from "../utils/request.js";
import * as availabilityService from "../services/availability.service.js";

export async function list(request, response) {
  response.json({ trainers: await service.listApprovedTrainers(request.query, request.auth) });
}
export async function getById(request, response) {
  response.json({
    trainer: await service.getTrainer(parseId(request.params.id), request.auth),
  });
}
export async function me(request, response) {
  response.json({ trainer: await service.getMyTrainer(request.auth.userId) });
}
export async function apply(request, response) {
  response.status(201).json({
    trainer: await service.applyAsTrainer(request.auth.userId, request.body),
  });
}
export async function updateMe(request, response) {
  response.json({
    trainer: await service.updateMyTrainer(request.auth.userId, request.body),
  });
}
export async function approve(request, response) {
  response.json({
    trainer: await service.approveTrainer(
      parseId(request.params.id),
      { userId: request.auth.userId, ip: request.ip },
      request.body.comment,
    ),
  });
}
export async function reject(request, response) {
  response.json({
    trainer: await service.rejectTrainer(
      parseId(request.params.id),
      { userId: request.auth.userId, ip: request.ip },
      request.body.comment,
    ),
  });
}

export async function publicAvailability(request, response) {
  response.json(await availabilityService.listTrainerAvailability(parseId(request.params.id), request.auth));
}
export async function myAvailability(request, response) {
  response.json({ slots: await availabilityService.listMyAvailability(request.auth.trainerId) });
}
export async function createAvailability(request, response) {
  response.status(201).json({ slot: await availabilityService.createAvailability(request.auth.trainerId, request.body) });
}
export async function deleteAvailability(request, response) {
  await availabilityService.deleteAvailability(request.auth.trainerId, parseId(request.params.availabilityId));
  response.status(204).end();
}
