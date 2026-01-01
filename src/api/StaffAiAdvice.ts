export async function getStaffAiAdvice(time: string, activeOrders: number) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/staff-ai-advice`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ time, activeOrders }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch staff AI advice");
  }

  return response.json();
}
