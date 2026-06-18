import * as authService from "../services/auth.service.js";

export async function register(request, response) {
  response.status(201).json(await authService.registerUser(request.body, request.ip));
}

export async function login(request, response) {
  response.json(await authService.loginUser(request.body, request.ip));
}

export async function me(request, response) {
  response.json(await authService.getCurrentUser(request.auth.userId));
}

export async function forgotPassword(request, response) {
  response.json(await authService.forgotPassword(request.body));
}

export async function resetPassword(request, response) {
  response.json(await authService.resetPassword(request.body, request.ip));
}
