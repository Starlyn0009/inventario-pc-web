import { supabase } from '../supabaseClient.js';

export async function getProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener productos:', error.message);
    throw error;
  }
  return data;
}

export async function createProducto(producto) {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()
    .single();

  if (error) {
    console.error('Error al crear producto:', error.message);
    throw error;
  }
  return data;
}

export async function updateProducto(id, producto) {
  const { data, error } = await supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar producto:', error.message);
    throw error;
  }
  return data;
}

export async function deleteProducto(id) {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar producto:', error.message);
    throw error;
  }
  return true;
}
