import * as service from "../services/review.service.js";
import { parseId } from "../utils/request.js";

export async function create(request, response) {
  response.status(201).json({
    review: await service.createReview(request.auth, request.body, request.ip),
  });
}
export async function trainerReviews(request, response) {
  response.json({
    reviews: await service.listTrainerReviews(parseId(request.params.id)),
  });
}
export async function pending(_request, response) {
  response.json({ reviews: await service.listPendingModeration() });
}
export async function moderate(request, response) {
  response.json({
    review: await service.moderateReview(
      parseId(request.params.id),
      request.body.status,
      { userId: request.auth.userId, ip: request.ip },
      request.body.comment,
    ),
  });
}
