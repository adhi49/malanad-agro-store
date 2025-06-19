import { format } from "date-fns";

export const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const formatDate = (dateString) => {
  return format(dateString, "dd MMM yyyy hh:mm a");
};

export const getFormatStatus = (statusValue) => {
  return statusValue
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};



