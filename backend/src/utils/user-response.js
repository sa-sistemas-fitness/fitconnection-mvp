export function toPublicUser(user) {
  return {
    idUsuario: user.idUsuario,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    fechaRegistro: user.fechaRegistro,
    ultimoLogin: user.ultimoLogin,
    estadoCuenta: user.estadoCuenta.nombre,
    roles: user.roles.map(({ rol }) => rol.nombre),
    cliente: user.cliente,
    entrenador: user.entrenador,
  };
}

export const userInclude = {
  estadoCuenta: true,
  roles: {
    include: {
      rol: true,
    },
  },
  cliente: true,
  entrenador: {
    include: {
      estado: true,
      especialidades: {
        include: {
          especialidad: true,
        },
      },
    },
  },
};
