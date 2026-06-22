import * as service from "../services/report.service.js";

export async function overview(_request, response) {
  response.json(await service.adminOverview());
}
export async function connections(_request, response) {
  response.json(await service.connectionReport());
}
export async function financial(_request, response) {
  response.json(await service.financialReport());
}
export async function trainers(_request, response) {
  response.json({ trainers: await service.trainerReport() });
}
export async function trainerMe(request, response) {
  response.json(await service.myTrainerReport(request.auth.trainerId));
}
