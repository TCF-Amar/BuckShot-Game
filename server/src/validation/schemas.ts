import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty')
    .max(20, 'Name must be 20 characters or fewer'),
});

export const joinRoomSchema = z.object({
  roomCode: z
    .string()
    .trim()
    .length(6, 'Room code must be exactly 6 characters')
    .regex(/^[a-zA-Z0-9]{6}$/, 'Room code must contain only alphanumeric characters'),
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty')
    .max(20, 'Name must be 20 characters or fewer'),
});

export const shootActionSchema = z.object({
  target: z.enum(['self', 'opponent'], {
    errorMap: () => ({ message: "Target must be 'self' or 'opponent'" }),
  }),
});

export const itemActionSchema = z.object({
  item: z.enum(['magnifier', 'cuffs', 'medkit', 'blade'], {
    errorMap: () => ({ message: "Item must be 'magnifier', 'cuffs', 'medkit', or 'blade'" }),
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type ShootActionInput = z.infer<typeof shootActionSchema>;
export type ItemActionInput = z.infer<typeof itemActionSchema>;

