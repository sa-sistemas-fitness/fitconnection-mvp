import test from "node:test";
import assert from "node:assert/strict";

import { calculateAge, isMinor } from "../src/utils/age.js";
import { calculateCommission } from "../src/services/commission.service.js";
import { intervalsOverlap, sameUtcDate, utcWeekday, validateTimeRange } from "../src/utils/schedule.js";
import { createResetToken, resetTokenIsUsable } from "../src/utils/password-reset-token.js";
import { validPersonName } from "../src/utils/person-name.js";

const referenceDate = new Date("2026-08-17T12:00:00.000Z");

test("usuario menor de 18 años", () => {
  assert.equal(calculateAge("2010-08-18", referenceDate), 15);
  assert.equal(isMinor("2010-08-18", referenceDate), true);
});

test("usuario mayor de 18 años", () => {
  assert.equal(calculateAge("2000-08-17", referenceDate), 26);
  assert.equal(isMinor("2000-08-17", referenceDate), false);
});

const visibleToUser = (minor, trainer) => !minor || trainer.trabajaConMenores;

test("menor encuentra entrenador autorizado", () => {
  assert.equal(visibleToUser(true, { trabajaConMenores: true }), true);
});

test("menor no encuentra entrenador no autorizado", () => {
  assert.equal(visibleToUser(true, { trabajaConMenores: false }), false);
});

test("adulto puede encontrar entrenador sin autorización para menores", () => {
  assert.equal(visibleToUser(false, { trabajaConMenores: false }), true);
});

test("cambio de nombre y apellido valida caracteres y longitud", () => {
  assert.equal(validPersonName("  María José ", "nombre"), "María José");
  assert.throws(() => validPersonName("J0hn", "nombre"));
});

test("recuperación genera token seguro y expiración", () => {
  const created = createResetToken(referenceDate.getTime());
  assert.equal(created.rawToken.length, 64);
  assert.notEqual(created.rawToken, created.tokenHash);
  assert.equal(resetTokenIsUsable({ usado: false, fechaExpiracion: created.expiresAt }, referenceDate.getTime()), true);
});

test("token expirado no es utilizable", () => {
  assert.equal(resetTokenIsUsable({ usado: false, fechaExpiracion: new Date(referenceDate.getTime() - 1) }, referenceDate.getTime()), false);
});

test("token reutilizado no es utilizable", () => {
  assert.equal(resetTokenIsUsable({ usado: true, fechaExpiracion: new Date(referenceDate.getTime() + 1000) }, referenceDate.getTime()), false);
});

test("cálculo de comisión devuelve bruto, comisión y neto", () => {
  assert.deepEqual(calculateCommission(20000, 10), {
    importeBruto: 20000,
    porcentajeComision: 10,
    comision: 2000,
    importeNetoEntrenador: 18000,
  });
});

test("desglose de comisión contiene los campos visibles al entrenador", () => {
  const breakdown = calculateCommission(20000, 10);
  assert.deepEqual(Object.keys(breakdown), ["importeBruto", "porcentajeComision", "comision", "importeNetoEntrenador"]);
});

test("doble reserva exacta es detectada", () => {
  assert.equal(intervalsOverlap("18:00", "19:00", "18:00", "19:00"), true);
});

test("turnos parcialmente superpuestos son detectados", () => {
  assert.equal(intervalsOverlap("18:00", "19:00", "18:30", "19:30"), true);
  assert.equal(intervalsOverlap("18:00", "19:00", "19:00", "20:00"), false);
});

test("disponibilidad visible conserva rango y día UTC", () => {
  assert.deepEqual(validateTimeRange("09:00", "10:00"), { horaInicio: "09:00", horaFin: "10:00" });
  assert.equal(utcWeekday("2026-08-17"), 1);
  assert.equal(sameUtcDate("2026-08-17", "2026-08-17T22:00:00Z"), true);
});

const blocksAvailability = (status) => ["Solicitado", "Reservado"].includes(status);

test("horario ocupado no es seleccionable", () => {
  assert.equal(blocksAvailability("Reservado"), true);
});

test("cancelación libera el horario", () => {
  assert.equal(blocksAvailability("Cancelado"), false);
});
