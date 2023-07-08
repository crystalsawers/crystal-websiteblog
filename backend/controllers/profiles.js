import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const profileValidation = Joi.object({
    bio: Joi.string().optional(),
    avatar: Joi.string().optional(),
    userId: Joi.number().required(),
});

const paginationDefault = {
    amount: 10,
    page: 1,
};


const getProfiles = async (req, res) => {
    try {
        // Sorting
        const sortBy = req.query.sortBy || "id";
        const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

        // Pagination
        const amount = req.query.amount || paginationDefault.amount;
        const page = req.query.page || paginationDefault.page;

        const query = {
            take: Number(amount),
            skip: (Number(page) - 1) * Number(amount),
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                user: true,
            },
        };

        // Filtering by field
        if (req.query.bio || req.query.avatar || req.query.userId) {
            query.where = {
                bio: {
                    contains: req.query.bio || undefined,
                },
                avatar: {
                    contains: req.query.avatar || undefined,
                },
                userId: {
                    equals: req.query.userId || undefined,
                },
            };
        }

        const profiles = await prisma.profile.findMany(query);

        if (profiles.length === 0) {
            return res.status(200).json({ msg: "No profiles found" });
        }

        const hasNextPage = profiles.length === Number(amount);

        return res.json({
            data: profiles,
            nextPage: hasNextPage ? Number(page) + 1 : null,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};


const getAProfile = async (req, res) => {

    try {
        const { id } = req.params;

        const profile = await prisma.profile.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                user: true,
            },
        });

        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        return res.json({ data: profile });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }

};


const createProfile = async (req, res) => {
    try {
        const { error, value } = profileValidation.validate(req.body);

        if (error) {
            return res.status(400).json({
                msg: error.details[0].message,
            });
        }

        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                msg: 'Unauthorized',
            });
        }
        const { bio, avatar, userId } = value;

        const newProfile = await prisma.profile.create({
            data: {
                bio,
                avatar,
                userId,
            },
        });

        return res.status(201).json({
            msg: "Profile successfully created",
            data: newProfile,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { bio, avatar, userId } = req.body;

        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                msg: 'Unauthorized',
            });
        }

        let profile = await prisma.profile.findUnique({
            where: { id: Number(id) },
        });

        if (!profile) {
            return res.status(404).json({ msg: `No profile with the id: ${id} found` });
        }

        profile = await prisma.profile.update({
            where: { id: Number(id) },
            data: {
                bio,
                avatar,
                userId,
                updatedAt: new Date(), // Update the updatedAt timestamp
            },
        });

        return res.json({
            msg: `Profile with the id: ${id} successfully updated`,
            data: profile,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};


const deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                msg: 'Unauthorized',
            });
        }

        let profile = await prisma.profile.findUnique({
            where: { id: Number(id) },
        });

        if (!profile) {
            return res.status(200).json({ msg: `No profile with the id: ${id} found` });
        }

        profile = await prisma.profile.delete({
            where: { id: Number(id) },
        });

        return res.json({
            msg: `Profile with the id: ${id} successfully deleted`,
            data: profile,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};


export {
    getProfiles,
    getAProfile,
    createProfile,
    updateProfile,
    deleteProfile
};