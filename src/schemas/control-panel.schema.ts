import { z } from "zod";

export const controlPanelSchema = z.object({
  setpoint: z
    .number()
    .min(16, "Temperatura mínima é 16°C")
    .max(30, "Temperatura máxima é 30°C"),
});

export type ControlPanelSchemaType = z.infer<typeof controlPanelSchema>;

export const setpointSchema = z
  .number()
  .min(16, "Temperatura mínima é 16°C")
  .max(30, "Temperatura máxima é 30°C");




