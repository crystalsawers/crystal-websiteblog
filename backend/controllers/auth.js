import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const register = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        // Perform password validation checks
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                msg:
                    'Password must be at least 10 characters long and include at least one lowercase letter, one uppercase letter, one special character, and one number',
            });
        }

        if (role === 'ADMIN_USER') {
            const existingAdmin = await prisma.user.findFirst({
                where: { role: 'ADMIN_USER' },
            });

            if (existingAdmin) {
                return res.status(409).json({ msg: 'Admin user already exists' });
            }
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email: email }, { username: username }] },
        });

        if (existingUser) {
            return res.status(409).json({ msg: 'User already exists' });
        }

        const salt = await bcryptjs.genSalt();
        const hashedPassword = await bcryptjs.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
            username,
            role: role || 'BASIC_USER',
            isAdmin: role === 'ADMIN_USER',
        };

        const user = await prisma.user.create({
            data: userData,
        });

        delete user.password;

        return res.status(201).json({
            msg: 'User successfully registered',
            data: user,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ msg: 'Invalid username or password' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'Invalid username or password' });
    }

    const { JWT_SECRET, JWT_LIFETIME } = process.env;

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_LIFETIME }
    );

    return res.status(200).json({
      msg: 'User successfully logged in',
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

  

// Logout 

const logout = async (req, res) => {
    try {
        // Clear the user's token from the client-side cookie.
        res.clearCookie("token");

        return res.status(200).json({
            msg: "User successfully logged out",
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};

// this checks if a token is valid and current
// if so, it stores the user details contained in the token in req
// (to be passed along to the next function in the route)
// if requireAdmin is true, then a user must have ADMIN_USER as their role
// example: 
// app.get('/admin-only', authorise(true), (req, res) => {
//  //Code for handling the route
// });
// app.get('/any-user', authorise(), (req, res) => {
//  //Code for handling the route
// });
// 
const authorise = (requireAdmin = false) => {
    return function (req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.sendStatus(401);

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);

            if (requireAdmin && !user.isAdmin) {
                return res
                    .status(401)
                    .send('This request requires admin status');
            }

            req.user = user;
            next();
        });
    };
};


export { register, login, logout, authorise };