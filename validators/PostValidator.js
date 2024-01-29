import { z } from "zod";

const CreatePost = z.object({
    description: z
        .string({ required_error: "Description is required" })
        .min(1, { message: "Description should not be empty" })
        .trim(),

    media: z
        .string({ required_error: "Media is required" })
        .min(1, { message: "Media should not be empty" }),

    mediaType: z
        .string({ required_error: "Media type is required" })
        .min(1, { message: "Media type should not be empty" }),

    postedOn: z.string()
});

export default CreatePost;