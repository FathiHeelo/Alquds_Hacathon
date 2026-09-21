import { prisma } from "../src/database/prisma";

async function main() {
  const requests = await prisma.repairRequest.findMany({
    where: {
      OR: [
        { description: { startsWith: "Performance audit" } },
        { description: "يوجد تسريب مياه تحت المجلى عند فتح الحنفية" },
        { description: { startsWith: "فحص تنافس العروض" } }
      ]
    },
    select: { id: true }
  });
  const requestIds = requests.map(({ id }) => id);
  if (!requestIds.length) {
    console.log("No known test requests found.");
    return;
  }

  const jobs = await prisma.job.findMany({ where: { requestId: { in: requestIds } }, select: { id: true } });
  const jobIds = jobs.map(({ id }) => id);
  const conversations = jobIds.length
    ? await prisma.conversation.findMany({ where: { jobId: { in: jobIds } }, select: { id: true } })
    : [];
  const conversationIds = conversations.map(({ id }) => id);
  const notifications = await prisma.notification.findMany({ select: { id: true, data: true } });
  const notificationIds = notifications.filter(({ data }) => {
    const payload = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : {};
    return requestIds.includes(String(payload.requestId ?? "")) || jobIds.includes(String(payload.jobId ?? ""));
  }).map(({ id }) => id);

  await prisma.$transaction(async (tx) => {
    if (notificationIds.length) await tx.notification.deleteMany({ where: { id: { in: notificationIds } } });
    if (conversationIds.length) await tx.message.deleteMany({ where: { conversationId: { in: conversationIds } } });
    if (jobIds.length) {
      await tx.review.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.jobFinancial.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.conversation.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.rewardTransaction.deleteMany({ where: { refId: { in: jobIds } } });
      await tx.job.deleteMany({ where: { id: { in: jobIds } } });
    }
    await tx.offer.deleteMany({ where: { requestId: { in: requestIds } } });
    await tx.repairRequest.deleteMany({ where: { id: { in: requestIds } } });
  });

  console.log(`Removed ${requestIds.length} test requests and their dependent records.`);
}

void main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
