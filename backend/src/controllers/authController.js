import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Registrar cliente o usuario
export const register = async (req, res) => {
  try {
    const { 
      nombre, 
      telefono, 
      email, 
      password, 
      rol, 
      peso, 
      grasa, 
      pecho, 
      brazo, 
      cintura 
    } = req.body;

    // 1. Validar que no exista el teléfono o email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { telefono },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El teléfono o correo ya se encuentra registrado.' });
    }

    // 2. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear usuario y su primera toma de medidas (si existen) en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          nombre,
          telefono,
          email: email || null,
          password: hashedPassword,
          rol: rol || 'MEMBER',
          estadoMembresia: 'ACTIVE',
          fechaPago: new Date(),
          fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 días por defecto
        }
      });

      // Si se enviaron datos antropométricos iniciales, guardarlos
      if (peso || grasa || pecho || brazo || cintura) {
        await tx.measurement.create({
          data: {
            userId: newUser.id,
            peso: peso ? parseFloat(peso) : null,
            grasa: grasa ? parseFloat(grasa) : null,
            pecho: pecho ? parseFloat(pecho) : null,
            brazo: brazo ? parseFloat(brazo) : null,
            cintura: cintura ? parseFloat(cintura) : null
          }
        });
      }

      return newUser;
    });

    // 4. Generar Token JWT
    const token = jwt.sign(
      { id: result.id, rol: result.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.id,
        nombre: result.nombre,
        telefono: result.telefono,
        rol: result.rol,
        estadoMembresia: result.estadoMembresia
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
  }
};

// Iniciar sesión
export const login = async (req, res) => {
  try {
    const { identificador, password } = req.body; // Permite loguearse con teléfono o email

    // Buscar por teléfono o email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { telefono: identificador },
          { email: identificador }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        telefono: user.telefono,
        rol: user.rol,
        estadoMembresia: user.estadoMembresia,
        fechaVencimiento: user.fechaVencimiento
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};