import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const register = async (req, res) => {
    try {
        /**
         * Get the role from the Request's body property
         */
        const { name, username, email, password } = req.body;

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            return res.status(200).json({ msg: "User already exists" });
        }

        const salt = await bcryptjs.genSalt();

        const hashedPassword = await bcryptjs.hash(password, salt);

        user = await prisma.user.create({
            data: { name, email, password: hashedPassword, username, role },
        });

        delete user.password;

        return res.status(201).json({
            msg: "User successfully registered",
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
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ msg: "Invalid email" });
        }

        /**
         * Compare the given string, i.e., Pazzw0rd123, with the given
         * hash, i.e., user's hashed password
         */
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ msg: "Invalid password" });
        }

        const { JWT_SECRET, JWT_LIFETIME } = process.env;

        /**
         * Return a JWT. The first argument is the payload, i.e., an object containing
         * the authenticated user's id and name, the second argument is the secret
         * or public/private key, and the third argument is the lifetime of the JWT
         */
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
            },
            JWT_SECRET,
            { expiresIn: JWT_LIFETIME }
        );

        return res.status(200).json({
            msg: "User successfully logged in",
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
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)

            if (requireAdmin && user.role !== 'ADMIN_USER') {
                return res.status(401).send('This request requires admin status')
            }

            req.user = user
            next()
        })
    }
}

export { register, login, logout, authorise };