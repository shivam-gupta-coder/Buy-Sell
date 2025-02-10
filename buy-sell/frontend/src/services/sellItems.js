import axios from "axios";

export const sellItem = async (formDetails) => {
  try {
    const response = await axios.post("/api/Sell", formDetails, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error submitting item for sale:", error);
    throw error;
  }
};
