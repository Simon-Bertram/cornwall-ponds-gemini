import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  serviceOfInterest: z.string().min(1, "Please select a service"),
  location: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const contactRoute = new Hono().post(
  "/",
  zValidator("json", contactSchema),
  async (c) => {
    const data = c.req.valid("json");
    
    // In a real application, you would save this to D1 or send an email here.
    // E.g., await c.env.DB.prepare("INSERT ...").bind(...).run();

    return c.json(
      {
        success: true,
        message: "Thank you for your inquiry. Our team will be in touch shortly.",
        data,
      },
      200
    );
  }
);
