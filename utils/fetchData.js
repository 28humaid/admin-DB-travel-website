import { apiRequest } from "@/utils/apiRequest";
import { getAuthToken } from "@/utils/getAuthToken";

export async function fetchBookings({company}) {
  console.log("getchBookings mei...:-",company)
  console.log(`URL shouls look like /api/view/bookings/${company}`)
  try {
    const response = await apiRequest({
      url: `/api/view/bookings/${company}`,
      method: "GET",
      token: getAuthToken(),
    });

    return response.data; // Returns bookings data
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

export async function fetchRefunds({company}) {
  try {
    const response = await apiRequest({
      url: `/api/view/refunds/${company}`,
      method: "GET",
      token: getAuthToken(),
    });

    return response.data; // Returns refunds data
  } catch (error) {
    console.error("Error fetching refunds:", error);
    throw error;
  }
}