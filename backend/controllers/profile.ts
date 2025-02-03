import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '765e06b9cfada5bb6e9434b7865089c8a6f4581a8c893fa309360e0498e7b6e1';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as { id: string }; // Type assertion
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Get the current user's profile.
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

/**
 * Update user profile.
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: req.body.name, bio: req.body.bio, avatar: req.body.avatar },
    });

    res.json({ message: 'Profile updated successfully', updatedUser });
  } catch (error) {
    if (error instanceof PrismaError) {
      console.error(error);
      res.status(500).json({ message: 'Error updating profile', error });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

/**
 * Delete a user.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaError) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting user', error });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};