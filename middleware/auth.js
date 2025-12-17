exports.authenticateToken = (req, res, next) => {
    try {
      const userId = req.headers['x-user-id'];
      const role = req.headers['x-user-role'];
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      req.user = {
        id: userId,
        role: role || 'employee'
      };
  
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  };
  
  exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };
  
 