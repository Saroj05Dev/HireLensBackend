import { InterviewFeedback, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const create = async (
  data: Prisma.InterviewFeedbackUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<InterviewFeedback> => {
  const db = tx || prisma;
  return db.interviewFeedback.create({
    data,
  });
};

export const findByInterviewId = async (
  interviewId: string
): Promise<InterviewFeedback | null> => {
  return prisma.interviewFeedback.findUnique({
    where: { interviewId },
  });
};