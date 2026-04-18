import { supabase } from '../supabaseClient.js';

export async function getMovimientos() {
  const { data, error } = await supabase
    .from('movimientos')
    .select(`
      id,
      tipo,
      cantidad,
      fecha,
      producto_id,
      productos (nombre)
    `)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener movimientos:', error.message);
    throw error;
  }
  return data;
}

export async function registrarMovimiento(producto_id, tipo, cantidad) {
  const { data, error } = await supabase
    .from('movimientos')
    .insert([{ producto_id, tipo, cantidad }])
    .select()
    .single();

  if (error) {
    console.error('Error al registrar movimiento:', error.message);
    throw error;
  }
  return data;
}
