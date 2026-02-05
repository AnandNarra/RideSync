const { z, email } = require("zod");

const registerSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters..."),

    fullName: z
        .string()
        .min(5, "fullname must be at least 5 characters... "),

    email: z
        .string()
        .email("Invalid email address..."),

    password: z.string().superRefine((val, ctx) => {
        if (val.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 6 characters",
            });
            return;
        }

        if (!/[0-9]/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must contain at least 1 number",
            });
            return;
        }

        if (!/[!@#$%^&*]/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must contain at least 1 special character",
            });
        }
    }),


   phoneNumber: z
  .string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^[0-9]+$/, "Phone number must contain only digits"),

})

const loginSchema = z.object({
    email:z
    .string()
    .email("Invalid email address..."),

    password: z.string().superRefine((val, ctx) => {
        if (val.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 6 characters",
            });
            return;
        }

        if (!/[0-9]/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must contain at least 1 number",
            });
            return;
        }

        if (!/[!@#$%^&*]/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must contain at least 1 special character",
            });
        }
    }) 
})


module.exports = { registerSchema  , loginSchema}