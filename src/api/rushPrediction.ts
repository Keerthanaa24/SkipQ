export async function predictRush(day: string, time: string) {
  const response = await fetch("http://localhost:5000/predict-rush", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ day, time }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch rush prediction");
  }

  return response.json();
}
