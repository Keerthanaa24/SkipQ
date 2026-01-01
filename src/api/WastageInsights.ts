export async function getWastageInsights(
  day: string,
  itemName: string,
  preparedQty: number,
  soldQty: number
) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/staff-wastage-insights`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        day,
        itemName,
        preparedQty,
        soldQty,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Backend error");
  }

  return response.json();
}
