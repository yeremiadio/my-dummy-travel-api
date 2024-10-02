/**
 * comment controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
    async create(ctx) {
        // Get the authenticated user ID
        const user = ctx.state.user;

        // Check if the user is authenticated
        if (!user) {
            return ctx.unauthorized('You must be logged in to create a comment.');
        }

        // Ensure the request body contains a data object
        if (!ctx.request.body.data) {
            ctx.request.body.data = {};
        }

        // Add the user ID to the request body
        ctx.request.body.data.user = user.id;

        // Call the default core create method with the updated request body
        const response = await super.create(ctx);
        return response;
    },
    async update(ctx) {
        // Get the authenticated user ID
        const user = ctx.state.user;


        // Check if the user is authenticated
        if (!user) {
            return ctx.unauthorized('You must be logged in to update this comment.');
        }
        // Fetch the comment to check ownership
        const { id } = ctx.params;
        const comment = await strapi.db.query('api::comment.comment').findOne({
            where: { documentId: id },
            populate: { user: true },
        });
        // Check if the authenticated user is the creator of the comment
        if (comment?.user?.id !== user.id) {
            return ctx.forbidden('You are not allowed to update this comment.');
        }

        // Proceed with the update
        const response = await super.update(ctx);
        return response;
    },
    async delete(ctx) {
        // Get the authenticated user
        const user = ctx.state.user;

        // Check if the user is authenticated
        if (!user) {
            return ctx.unauthorized('You must be logged in to delete a comment.');
        }

        // Get the comment ID from the request
        const { id } = ctx.params;

        // Fetch the comment to check ownership
        const comment = await strapi.db.query('api::comment.comment').findOne({
            where: { documentId: id },
            populate: { user: true },
        });

        // If the comment doesn't exist
        if (!comment) {
            return ctx.notFound('Comment not found');
        }

        // Check if the authenticated user is the owner of the comment
        if (comment.user?.id !== user.id) {
            return ctx.forbidden('You are not allowed to delete this comment.');
        }

        // Proceed with the deletion
        const response = await super.delete(ctx);
        return response;
    },
}));
