"use server";

export async function submitRequest(formData: FormData) {
  const manufacturer = formData.get("manufacturer");
  const purpose = formData.get("purpose");
  const vin = formData.get("vin");
  const message = formData.get("message");

  // TODO: Add validation and database logic
  console.log("Request submitted:", { manufacturer, purpose, vin, message });

  // Return success (can add redirect later)
  return { success: true };
}
