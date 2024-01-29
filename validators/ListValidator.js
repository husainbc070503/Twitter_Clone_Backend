import { z } from "zod";

const CreateList = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .min(1, { message: "Name should not be empty" }),

    description: z
        .string({ required_error: "Description is required" })
        .min(1, { message: "Description should not be empty" })
        .trim(),

    backgroundImage: z
        .string({ required_error: "Background Image is required" })
        .min(1, { message: "Background Image should not be empty" }),

    members: z
        .string()
        .array()
});

export default CreateList;