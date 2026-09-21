import { prisma } from "./src/database/prisma";

async function main() {
  const [risks, reports, notifications] = await Promise.all([
    prisma.riskAssessment.findMany({ include: { flags: true }, orderBy: { createdAt: "asc" } }),
    prisma.report.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.notification.findMany({ select: { id: true, type: true, title: true, body: true, data: true }, orderBy: { createdAt: "asc" } })
  ]);
  console.log(JSON.stringify({ risks, reports, notifications }, null, 2));
}

void main().finally(() => prisma.$disconnect());
