import * as service from "../services/certification.service.js";
import { parseId } from "../utils/request.js";

export async function create(request, response) {
  response.status(201).json({
    certification: await service.createCertification(
      request.auth.userId,
      request.body,
    ),
  });
}
export async function my(request, response) {
  response.json({
    certifications: await service.listMyCertifications(request.auth.userId),
  });
}
export async function pending(_request, response) {
  response.json({
    certifications: await service.listPendingCertifications(),
  });
}
export async function approve(request, response) {
  response.json({
    certification: await service.approveCertification(
      parseId(request.params.id),
      { userId: request.auth.userId, ip: request.ip },
      request.body.comment,
    ),
  });
}
export async function reject(request, response) {
  response.json({
    certification: await service.rejectCertification(
      parseId(request.params.id),
      { userId: request.auth.userId, ip: request.ip },
      request.body.comment,
    ),
  });
}
