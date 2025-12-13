import dotenv from 'dotenv';
import { getSupabaseClient, authMiddleware } from '../utils/supabase.js';

dotenv.config();

/**
 * Example protected API route template
 * 
 * This is a template for creating new API endpoints.
 * Copy this file and modify as needed for your use case.
 * 
 * To use this route:
 * 1. Copy this file to a new name (e.g., api/your-route.js)
 * 2. Implement your logic in the handler function
 * 3. The route will be available at /api/your-route
 * 
 * Note: This is an EXAMPLE file. Delete or rename before deployment.
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Example: Check authentication (optional)
    // Uncomment to require authentication
    /*
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    */

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      
      case 'POST':
        return handlePost(req, res);
      
      case 'PUT':
        return handlePut(req, res);
      
      case 'DELETE':
        return handleDelete(req, res);
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in example route:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}

async function handleGet(req, res) {
  // Example GET logic
  const { id } = req.query;
  
  // Example: Query Supabase
  // const supabase = getSupabaseClient();
  // const { data, error } = await supabase
  //   .from('your_table')
  //   .select('*')
  //   .eq('id', id)
  //   .single();
  
  return res.status(200).json({
    success: true,
    message: 'GET request successful',
    data: { id }
  });
}

async function handlePost(req, res) {
  // Example POST logic
  const body = req.body;
  
  // Validate input
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  
  // Example: Insert into Supabase
  // const supabase = getSupabaseClient();
  // const { data, error } = await supabase
  //   .from('your_table')
  //   .insert(body)
  //   .select()
  //   .single();
  
  return res.status(201).json({
    success: true,
    message: 'POST request successful',
    data: body
  });
}

async function handlePut(req, res) {
  // Example PUT logic
  const { id } = req.query;
  const body = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }
  
  // Example: Update in Supabase
  // const supabase = getSupabaseClient();
  // const { data, error } = await supabase
  //   .from('your_table')
  //   .update(body)
  //   .eq('id', id)
  //   .select()
  //   .single();
  
  return res.status(200).json({
    success: true,
    message: 'PUT request successful',
    data: { id, ...body }
  });
}

async function handleDelete(req, res) {
  // Example DELETE logic
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }
  
  // Example: Delete from Supabase
  // const supabase = getSupabaseClient();
  // const { error } = await supabase
  //   .from('your_table')
  //   .delete()
  //   .eq('id', id);
  
  return res.status(200).json({
    success: true,
    message: 'DELETE request successful',
    data: { id }
  });
}
