import prisma from '../config/db.js';

export const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { fecha: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { descripcion, monto, categoria, fecha } = req.body;
    if (!descripcion || !monto) {
      return res.status(400).json({ error: 'Descripción y monto requeridos' });
    }
    const expense = await prisma.expense.create({
      data: {
        descripcion,
        monto: parseFloat(monto),
        categoria: categoria || 'General',
        fecha: fecha ? new Date(fecha) : new Date()
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar gasto' });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Gasto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};